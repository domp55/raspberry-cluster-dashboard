// backend/server.js

const express = require('express');
const cors = require('cors');
const k8s = require('@kubernetes/client-node');

const app = express();
const PORT = 3001;

// Configura CORS para permitir solicitudes desde tu frontend (generalmente http://localhost:3000 durante el desarrollo)
app.use(cors({ origin: 'http://localhost:3000' }));

// --- CONFIGURACIÓN DE KUBERNETES ---
const kc = new k8s.KubeConfig();

const kubeconfigPath = '/home/domp/.kube/config'; // <-- ¡VERIFICA QUE ESTA RUTA SEA CORRECTA!

try {
  kc.loadFromFile(kubeconfigPath);
  console.log(`KubeConfig cargado exitosamente desde: ${kubeconfigPath}`);

  if (kc.clusters.length > 0) {
    console.warn('ADVERTENCIA: Deshabilitando temporalmente la verificación TLS para depuración. ¡NO USAR EN PRODUCCIÓN!');
    kc.clusters[0].skipTLSVerify = true;
    console.log('kubeConfig.clusters[0].server es:', kc.clusters[0].server);
  } else {
    console.error('No se encontró ningún clúster en el KubeConfig. No se puede aplicar skipTLSVerify.');
  }

} catch (error) {
  console.error(`Error al cargar KubeConfig desde ${kubeconfigPath}:`, error.message);
  console.error('Asegúrate de que el archivo exista y los permisos sean correctos.');
  process.exit(1);
}

const k8sApiCore = kc.makeApiClient(k8s.CoreV1Api);
const k8sApiApps = kc.makeApiClient(k8s.AppsV1Api);

async function testKubernetesConnection() {
  try {
    console.log('Intentando conectar con la API de Kubernetes para probar...');
    const res = await k8sApiCore.listPodForAllNamespaces();
    const podCount = res.items ? res.items.length : 0;
    console.log(`Conexión a la API de Kubernetes exitosa. Total de Pods encontrados: ${podCount}`);
  } catch (err) {
    console.error('La prueba de conexión a Kubernetes falló:', err.message);
    if (err.response) {
      console.error('Código de estado HTTP:', err.response.statusCode);
      console.error('Encabezados de la respuesta HTTP:', err.response.headers);
      if (err.response.statusCode >= 400 || !err.response.body) {
         console.error('Cuerpo de la respuesta HTTP:', err.response.body);
      }
    } else {
      console.error('Error sin respuesta HTTP detallada:', err);
    }
  }
}

// --- Endpoints de la API ---

// Endpoint para obtener todos los Pods y su resumen
app.get('/api/pods', async (req, resExpress) => {
  try {
    const podsK8sResponse = await k8sApiCore.listPodForAllNamespaces();
    const pods = podsK8sResponse.items;

    let total = pods.length;
    let running = 0;
    let pending = 0;
    let failed = 0;

    pods.forEach(pod => {
      if (pod.status && pod.status.phase) {
        switch (pod.status.phase) {
          case 'Running':
            running++;
            break;
          case 'Pending':
            pending++;
            break;
          case 'Failed':
            failed++;
            break;
          // Puedes añadir otros estados si lo necesitas, como 'Succeeded', 'Unknown'
        }
      }
    });

    resExpress.json({ total, running, pending, failed }); // <-- NUEVO FORMATO
  } catch (error) {
    console.error('Error al obtener Pods:', error.message);
    resExpress.status(500).json({ error: 'Error al obtener Pods', details: error.message });
  }
});

// Endpoint para obtener todos los Nodos
app.get('/api/nodes', async (req, resExpress) => {
  try {
    const nodesK8sResponse = await k8sApiCore.listNode();
    const nodes = nodesK8sResponse.items.map(node => {
      const statusCondition = node.status.conditions.find(cond => cond.type === 'Ready');
      const status = statusCondition && statusCondition.status === 'True' ? 'Ready' : 'NotReady';

      // **IMPORTANTE**: La API de Kubernetes no siempre expone CPU/Memoria de esta forma directa
      // Necesitarás metrics-server en tu cluster para obtener estos valores.
      // Si no lo tienes, estos campos pueden ser null o undefined inicialmente.
      // Para efectos de la interfaz, si no tienes metrics-server, podrías mostrar 'N/A'.
      const cpu = node.status.allocatable ? `${node.status.allocatable.cpu} cores` : 'N/A';
      const memory = node.status.allocatable ? `${node.status.allocatable.memory}` : 'N/A'; // Ej: 1Gi, 200Mi

      return {
        name: node.metadata.name,
        status: status,
        cpu: cpu, // Deberías obtener esto de metrics-server para valores reales
        memory: memory // Deberías obtener esto de metrics-server para valores reales
      };
    });
    resExpress.json(nodes); // <-- NUEVO FORMATO
  } catch (error) {
    console.error('Error al obtener Nodos:', error.message);
    resExpress.status(500).json({ error: 'Error al obtener Nodos', details: error.message });
  }
});

// Endpoint para obtener todos los Deployments
app.get('/api/deployments', async (req, resExpress) => {
  try {
    const deploymentsK8sResponse = await k8sApiApps.listDeploymentForAllNamespaces();
    const deployments = deploymentsK8sResponse.items.map(deployment => {
      return {
        name: deployment.metadata.name,
        namespace: deployment.metadata.namespace,
        replicas: deployment.spec.replicas || 0, // Réplicas deseadas
        available: deployment.status.availableReplicas || 0, // Réplicas disponibles
      };
    });
    resExpress.json(deployments); // <-- NUEVO FORMATO
  } catch (error) {
    console.error('Error al obtener Deployments:', error.message);
    resExpress.status(500).json({ error: 'Error al obtener Deployments', details: error.message });
  }
});

// Inicia el servidor
app.listen(PORT, async () => {
  console.log(`Backend de la API de Kubernetes ejecutándose en http://localhost:${PORT}`);
  console.log(`Accede a los puntos de tu frontend usando http://192.168.0.110:${PORT}`); // Reemplaza con la IP de tu Pop!_OS si el frontend está en otra máquina
  await testKubernetesConnection();
});