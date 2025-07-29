// backend/server.js

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const k8s = require('@kubernetes/client-node');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware de seguridad y logging
app.use(helmet({
  contentSecurityPolicy: false // Desactivar para desarrollo
}));
app.use(morgan('combined'));
app.use(cors({ 
  origin: FRONTEND_URL,
  credentials: true 
}));
app.use(express.json());

// --- CONFIGURACIÓN DE KUBERNETES ---
const kc = new k8s.KubeConfig();
const kubeconfigPath = process.env.KUBECONFIG_PATH || '/home/domp/.kube/config';

try {
  kc.loadFromFile(kubeconfigPath);
  console.log(`✅ KubeConfig cargado desde: ${kubeconfigPath}`);

  if (kc.clusters.length > 0) {
    // Solo para desarrollo - NUNCA en producción
    if (process.env.NODE_ENV !== 'production') {
      kc.clusters[0].skipTLSVerify = true;
      console.log('⚠️  TLS verificación deshabilitada (solo desarrollo)');
    }
  }
} catch (error) {
  console.error(`❌ Error cargando KubeConfig:`, error.message);
  console.log('💡 Asegúrate de que el archivo kubeconfig existe y tiene permisos correctos');
  process.exit(1);
}

const k8sApiCore = kc.makeApiClient(k8s.CoreV1Api);
const k8sApiApps = kc.makeApiClient(k8s.AppsV1Api);

// --- ESTADO Y CACHÉ ---
let metricsCache = {
  pods: null,
  nodes: null,
  deployments: null,
  metrics: null,
  lastUpdate: null
};

let connectedClients = 0;
let logStreams = new Map(); // Para manejar streams de logs activos

// --- FUNCIONES DE KUBERNETES ---
async function getPodsData() {
  try {
    const response = await k8sApiCore.listPodForAllNamespaces();
    const pods = response.body.items;

    const summary = {
      total: pods.length,
      running: 0,
      pending: 0,
      failed: 0,
      succeeded: 0
    };

    const detailed = pods.map(pod => ({
      name: pod.metadata.name,
      namespace: pod.metadata.namespace,
      status: pod.status.phase,
      node: pod.spec.nodeName,
      restarts: pod.status.containerStatuses ? 
        pod.status.containerStatuses.reduce((sum, container) => sum + (container.restartCount || 0), 0) : 0,
      age: Math.floor((Date.now() - new Date(pod.metadata.creationTimestamp)) / (1000 * 60 * 60 * 24)),
      ready: pod.status.containerStatuses ? 
        pod.status.containerStatuses.every(container => container.ready) : false
    }));

    pods.forEach(pod => {
      switch (pod.status.phase) {
        case 'Running': summary.running++; break;
        case 'Pending': summary.pending++; break;
        case 'Failed': summary.failed++; break;
        case 'Succeeded': summary.succeeded++; break;
      }
    });

    return { summary, detailed };
  } catch (error) {
    console.error('❌ Error obteniendo pods:', error.message);
    throw error;
  }
}

async function getNodesData() {
  try {
    const response = await k8sApiCore.listNode();
    const nodes = response.body.items;

    return nodes.map(node => {
      const readyCondition = node.status.conditions.find(cond => cond.type === 'Ready');
      const isReady = readyCondition && readyCondition.status === 'True';
      
      const nodeInfo = node.status.nodeInfo;
      const allocatable = node.status.allocatable;
      
      // Determinar el rol del nodo
      const labels = node.metadata.labels || {};
      let role = 'Worker';
      if (labels['node-role.kubernetes.io/control-plane'] || 
          labels['node-role.kubernetes.io/master']) {
        role = 'Master';
      }

      return {
        name: node.metadata.name,
        status: isReady ? 'Ready' : 'NotReady',
        role: role,
        version: nodeInfo.kubeletVersion,
        os: nodeInfo.osImage,
        architecture: nodeInfo.architecture,
        cpu: allocatable.cpu,
        memory: allocatable.memory,
        uptime: Math.floor((Date.now() - new Date(node.metadata.creationTimestamp)) / (1000 * 60 * 60 * 24)),
        // Simulamos métricas hasta tener metrics-server
        cpuPercent: Math.floor(Math.random() * 60) + 10,
        memoryPercent: Math.floor(Math.random() * 70) + 20,
        conditions: node.status.conditions.map(cond => ({
          type: cond.type,
          status: cond.status,
          reason: cond.reason
        }))
      };
    });
  } catch (error) {
    console.error('❌ Error obteniendo nodos:', error.message);
    throw error;
  }
}

async function getDeploymentsData() {
  try {
    const response = await k8sApiApps.listDeploymentForAllNamespaces();
    const deployments = response.body.items;

    return deployments.map(deployment => {
      const desired = deployment.spec.replicas || 0;
      const available = deployment.status.availableReplicas || 0;
      const ready = deployment.status.readyReplicas || 0;
      const updated = deployment.status.updatedReplicas || 0;
      
      let status = 'Healthy';
      if (available === 0) {
        status = 'Unhealthy';
      } else if (available < desired) {
        status = 'Degraded';
      }

      return {
        name: deployment.metadata.name,
        namespace: deployment.metadata.namespace,
        replicas: desired,
        available: available,
        ready: ready,
        updated: updated,
        status: status,
        age: Math.floor((Date.now() - new Date(deployment.metadata.creationTimestamp)) / (1000 * 60 * 60 * 24)),
        strategy: deployment.spec.strategy.type,
        labels: deployment.metadata.labels,
        conditions: deployment.status.conditions || []
      };
    });
  } catch (error) {
    console.error('❌ Error obteniendo deployments:', error.message);
    throw error;
  }
}

async function getClusterMetrics() {
  try {
    const pods = await getPodsData();
    const nodes = await getNodesData();
    
    // Calcular métricas del cluster
    const totalCPU = nodes.reduce((sum, node) => {
      const cpu = parseInt(node.cpu) || 1;
      return sum + cpu;
    }, 0);

    const totalMemoryGB = nodes.reduce((sum, node) => {
      const memoryStr = node.memory || '1Gi';
      const memoryGB = memoryStr.includes('Gi') ? 
        parseInt(memoryStr.replace('Gi', '')) : 
        parseInt(memoryStr.replace('Mi', '')) / 1024;
      return sum + memoryGB;
    }, 0);

    // Generar datos históricos simulados
    const history = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60000);
      history.push({
        time: time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        cpu: Math.floor(Math.random() * 50) + 10,
        memory: Math.floor(Math.random() * 40) + 30,
        network: Math.floor(Math.random() * 100) + 20
      });
    }

    return {
      cluster: {
        totalPods: pods.summary.total,
        runningPods: pods.summary.running,
        pendingPods: pods.summary.pending,
        failedPods: pods.summary.failed,
        totalNodes: nodes.length,
        readyNodes: nodes.filter(n => n.status === 'Ready').length,
        totalCPU: totalCPU,
        usedCPU: (Math.random() * totalCPU * 0.8).toFixed(1),
        totalMemory: totalMemoryGB,
        usedMemory: (Math.random() * totalMemoryGB * 0.7).toFixed(1),
        networkTraffic: (Math.random() * 100 + 20).toFixed(1)
      },
      history: history
    };
  } catch (error) {
    console.error('❌ Error calculando métricas del cluster:', error.message);
    throw error;
  }
}

// --- FUNCIÓN DE ACTUALIZACIÓN ---
async function updateMetrics() {
  try {
    console.log('🔄 Actualizando métricas del cluster...');
    
    const [pods, nodes, deployments, metrics] = await Promise.allSettled([
      getPodsData(),
      getNodesData(),
      getDeploymentsData(),
      getClusterMetrics()
    ]);

    // Procesar resultados incluso si algunos fallan
    metricsCache = {
      pods: pods.status === 'fulfilled' ? pods.value : null,
      nodes: nodes.status === 'fulfilled' ? nodes.value : null,
      deployments: deployments.status === 'fulfilled' ? deployments.value : null,
      metrics: metrics.status === 'fulfilled' ? metrics.value : null,
      lastUpdate: new Date(),
      errors: [pods, nodes, deployments, metrics]
        .filter(result => result.status === 'rejected')
        .map(result => result.reason.message)
    };

    // Emitir a clientes conectados
    if (connectedClients > 0) {
      io.emit('metrics-update', metricsCache);
      console.log(`📡 Métricas enviadas a ${connectedClients} clientes`);
    }

    return metricsCache;
  } catch (error) {
    console.error('❌ Error en updateMetrics:', error.message);
    return null;
  }
}

// --- WEBSOCKET HANDLERS ---
io.on('connection', (socket) => {
  connectedClients++;
  console.log(`🔌 Cliente conectado [${socket.id}]. Total: ${connectedClients}`);

  // Enviar datos iniciales si están disponibles
  if (metricsCache.lastUpdate) {
    socket.emit('metrics-update', metricsCache);
  }

  // Manejar solicitud de actualización manual
  socket.on('request-update', async () => {
    console.log(`📥 Solicitud de actualización desde cliente [${socket.id}]`);
    await updateMetrics();
  });

  // Manejar solicitud de logs de pod
  socket.on('request-pod-logs', async (data) => {
    const { podName, namespace = 'default', follow = true, tailLines = 100 } = data;
    console.log(`📝 Solicitando logs para ${podName} en namespace ${namespace}`);
    
    try {
      // Crear stream de logs
      const logStream = new k8s.Log(kc);
      const streamKey = `${socket.id}-${podName}-${namespace}`;
      
      // Si ya hay un stream activo para este cliente y pod, cerrarlo
      if (logStreams.has(streamKey)) {
        logStreams.get(streamKey).destroy();
      }

      const stream = await logStream.log(namespace, podName, '', 
        process.stdout, 
        process.stderr, 
        {
          follow: follow,
          tailLines: tailLines,
          pretty: false,
          timestamps: true
        }
      );

      // Guardar referencia al stream
      logStreams.set(streamKey, stream);

      // Manejar datos del stream
      stream.on('data', (chunk) => {
        const logLine = chunk.toString();
        socket.emit('logs-update', {
          pod: podName,
          namespace: namespace,
          message: logLine.trim(),
          timestamp: new Date()
        });
      });

      stream.on('error', (error) => {
        console.error(`❌ Error en stream de logs para ${podName}:`, error.message);
        socket.emit('logs-error', {
          pod: podName,
          namespace: namespace,
          error: error.message
        });
        logStreams.delete(streamKey);
      });

      stream.on('end', () => {
        console.log(`📝 Stream de logs terminado para ${podName}`);
        logStreams.delete(streamKey);
      });

    } catch (error) {
      console.error(`❌ Error iniciando logs para ${podName}:`, error.message);
      socket.emit('logs-error', {
        pod: podName,
        namespace: namespace,
        error: error.message
      });
    }
  });

  // Detener logs de pod
  socket.on('stop-pod-logs', (data) => {
    const { podName, namespace = 'default' } = data;
    const streamKey = `${socket.id}-${podName}-${namespace}`;
    
    if (logStreams.has(streamKey)) {
      logStreams.get(streamKey).destroy();
      logStreams.delete(streamKey);
      console.log(`⏹️ Stream de logs detenido para ${podName}`);
    }
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`🔌 Cliente desconectado [${socket.id}]. Total: ${connectedClients}`);
    
    // Limpiar streams de logs de este cliente
    for (const [streamKey, stream] of logStreams.entries()) {
      if (streamKey.startsWith(socket.id)) {
        stream.destroy();
        logStreams.delete(streamKey);
      }
    }
  });
});

// --- ENDPOINTS REST (mantener compatibilidad) ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    connectedClients,
    lastUpdate: metricsCache.lastUpdate,
    kubernetesConnected: true,
    version: '2.0.0'
  });
});

app.get('/api/pods', async (req, res) => {
  try {
    if (!metricsCache.pods || Date.now() - new Date(metricsCache.lastUpdate) > 30000) {
      await updateMetrics();
    }
    res.json(metricsCache.pods || { summary: { total: 0, running: 0, pending: 0, failed: 0 }, detailed: [] });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pods', details: error.message });
  }
});

app.get('/api/nodes', async (req, res) => {
  try {
    if (!metricsCache.nodes || Date.now() - new Date(metricsCache.lastUpdate) > 30000) {
      await updateMetrics();
    }
    res.json(metricsCache.nodes || []);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener nodos', details: error.message });
  }
});

app.get('/api/deployments', async (req, res) => {
  try {
    if (!metricsCache.deployments || Date.now() - new Date(metricsCache.lastUpdate) > 30000) {
      await updateMetrics();
    }
    res.json(metricsCache.deployments || []);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener deployments', details: error.message });
  }
});

app.get('/api/metrics', async (req, res) => {
  try {
    if (!metricsCache.metrics || Date.now() - new Date(metricsCache.lastUpdate) > 30000) {
      await updateMetrics();
    }
    res.json(metricsCache.metrics || null);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener métricas', details: error.message });
  }
});

// Endpoint para obtener logs de un pod específico (REST)
app.get('/api/pods/:namespace/:podName/logs', async (req, res) => {
  const { namespace, podName } = req.params;
  const { tailLines = 100, follow = false } = req.query;
  
  try {
    const logStream = new k8s.Log(kc);
    
    if (follow === 'true') {
      // Para streaming, usar WebSocket en su lugar
      res.status(400).json({ 
        error: 'Para logs en tiempo real usa WebSocket',
        suggestion: 'Conecta via WebSocket y usa el evento request-pod-logs'
      });
      return;
    }

    // Para logs estáticos
    const logs = await new Promise((resolve, reject) => {
      let logData = '';
      
      logStream.log(namespace, podName, '', 
        {
          write: (chunk) => { logData += chunk; },
          end: () => {}
        }, 
        {
          write: (chunk) => { logData += chunk; },
          end: () => {}
        },
        {
          follow: false,
          tailLines: parseInt(tailLines),
          pretty: false,
          timestamps: true
        }
      ).then(() => {
        resolve(logData);
      }).catch(reject);
    });

    res.json({
      pod: podName,
      namespace: namespace,
      logs: logs.split('\n').filter(line => line.trim()),
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Error obteniendo logs', 
      details: error.message 
    });
  }
});

// Endpoint para listar namespaces
app.get('/api/namespaces', async (req, res) => {
  try {
    const response = await k8sApiCore.listNamespace();
    const namespaces = response.body.items.map(ns => ({
      name: ns.metadata.name,
      status: ns.status.phase,
      age: Math.floor((Date.now() - new Date(ns.metadata.creationTimestamp)) / (1000 * 60 * 60 * 24))
    }));
    res.json(namespaces);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener namespaces', details: error.message });
  }
});

// Endpoint para obtener pods por namespace
app.get('/api/namespaces/:namespace/pods', async (req, res) => {
  const { namespace } = req.params;
  
  try {
    const response = await k8sApiCore.listNamespacedPod(namespace);
    const pods = response.body.items.map(pod => ({
      name: pod.metadata.name,
      namespace: pod.metadata.namespace,
      status: pod.status.phase,
      ready: pod.status.containerStatuses ? 
        pod.status.containerStatuses.every(container => container.ready) : false,
      restarts: pod.status.containerStatuses ? 
        pod.status.containerStatuses.reduce((sum, container) => sum + (container.restartCount || 0), 0) : 0,
      node: pod.spec.nodeName,
      age: Math.floor((Date.now() - new Date(pod.metadata.creationTimestamp)) / (1000 * 60 * 60 * 24))
    }));
    res.json(pods);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pods del namespace', details: error.message });
  }
});

// --- INICIALIZACIÓN ---
async function initialize() {
  try {
    console.log('🚀 Inicializando servidor del cluster Raspberry Pi...');
    console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
    
    // Realizar primera actualización de métricas
    await updateMetrics();
    console.log('✅ Métricas iniciales cargadas');
    
    // Configurar actualización automática cada 30 segundos
    setInterval(updateMetrics, 30000);
    console.log('⏰ Actualización automática configurada (30s)');
    
    // Iniciar servidor
    server.listen(PORT, () => {
      console.log(`🌟 Servidor backend ejecutándose en http://localhost:${PORT}`);
      console.log(`📊 WebSocket activo para métricas en tiempo real`);
      console.log(`🔗 API REST disponible en http://localhost:${PORT}/api`);
      console.log(`📝 Logs en tiempo real disponibles via WebSocket`);
    });
    
  } catch (error) {
    console.error('❌ Error en la inicialización:', error.message);
    process.exit(1);
  }
}

// --- MANEJO DE ERRORES GLOBALES ---
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Manejo graceful de shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  
  // Cerrar todos los streams de logs
  for (const [streamKey, stream] of logStreams.entries()) {
    stream.destroy();
  }
  logStreams.clear();
  
  // Cerrar servidor
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    process.exit(0);
  });
});

// Inicializar la aplicación
initialize();