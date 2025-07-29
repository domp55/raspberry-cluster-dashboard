// frontend/src/hooks/useWebSocket.js - Versión integrada con tu backend existente

import { useState, useEffect, useCallback } from 'react';

export const useWebSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // Función para obtener datos del backend existente
  const fetchBackendData = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      
      // Usar tu endpoint existente
      const [podsResponse, nodesResponse, deploymentsResponse] = await Promise.allSettled([
        fetch('/api/pods'),
        fetch('/api/nodes'), 
        fetch('/api/deployments')
      ]);

      // Procesar respuestas
      const pods = podsResponse.status === 'fulfilled' ? await podsResponse.value.json() : null;
      const nodes = nodesResponse.status === 'fulfilled' ? await nodesResponse.value.json() : [];
      const deployments = deploymentsResponse.status === 'fulfilled' ? await deploymentsResponse.value.json() : [];

      // Adaptar datos a formato esperado
      const adaptedMetrics = {
        cluster: {
          totalPods: pods?.total || 0,
          runningPods: pods?.running || 0,
          pendingPods: pods?.pending || 0,
          failedPods: pods?.failed || 0,
          totalNodes: nodes?.length || 0,
          readyNodes: nodes?.filter(n => n.status === 'Ready')?.length || 0,
          totalCPU: nodes?.length || 4, // Simplificado
          usedCPU: (Math.random() * 2 + 0.5).toFixed(1), // Simulado hasta tener metrics-server
          totalMemory: nodes?.length * 2 || 8, // Simplificado  
          usedMemory: (Math.random() * 3 + 2).toFixed(1), // Simulado
          networkTraffic: (Math.random() * 100 + 20).toFixed(1) // Simulado
        },
        pods: pods,
        nodes: nodes,
        deployments: deployments,
        history: generateHistoryData() // Datos simulados para los gráficos
      };

      setMetrics(adaptedMetrics);
      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('Error fetching backend data:', error);
      setConnectionStatus('error');
      
      // Usar datos simulados como fallback
      setMetrics({
        cluster: {
          totalPods: 15,
          runningPods: 13,
          pendingPods: 1,
          failedPods: 1,
          totalNodes: 4,
          readyNodes: 4,
          totalCPU: 4,
          usedCPU: 1.2,
          totalMemory: 8,
          usedMemory: 3.1,
          networkTraffic: 45.6
        },
        history: generateHistoryData()
      });
    }
  }, []);

  // Generar datos históricos para gráficos
  const generateHistoryData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60000);
      data.push({
        time: time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        cpu: Math.floor(Math.random() * 50) + 10,
        memory: Math.floor(Math.random() * 40) + 30,
        network: Math.floor(Math.random() * 100) + 20
      });
    }
    
    return data;
  };

  // Actualizar datos cada 30 segundos
  useEffect(() => {
    // Carga inicial
    fetchBackendData();
    
    // Actualización periódica
    const interval = setInterval(fetchBackendData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchBackendData]);

  // Simular nuevos logs (hasta implementar WebSocket real)
  useEffect(() => {
    const logMessages = [
      { level: 'info', message: 'Kubernetes API call successful' },
      { level: 'info', message: 'Pod metrics updated' },
      { level: 'warn', message: 'High memory usage on worker node' },
      { level: 'error', message: 'Failed to connect to metrics server' },
      { level: 'info', message: 'Dashboard metrics refreshed' }
    ];

    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance
        const randomMessage = logMessages[Math.floor(Math.random() * logMessages.length)];
        const newLog = {
          id: Date.now() + Math.random(),
          timestamp: new Date(),
          level: randomMessage.level,
          pod: 'dashboard-backend',
          namespace: 'default',
          message: randomMessage.message,
          container: 'main'
        };

        setLogs(prev => {
          const updated = [...prev, newLog];
          return updated.slice(-100); // Mantener solo los últimos 100
        });
      }
    }, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  // Simular alertas basadas en métricas
  useEffect(() => {
    if (!metrics) return;

    const checkAlerts = () => {
      const newAlerts = [];
      
      // Alerta por pods fallidos
      if (metrics.cluster.failedPods > 0) {
        newAlerts.push({
          id: Date.now() + 1,
          type: 'error',
          title: 'Pods Fallidos',
          message: `${metrics.cluster.failedPods} pod(s) han fallado`,
          timestamp: new Date(),
          read: false
        });
      }
      
      // Alerta por uso de CPU alto (simulado)
      const cpuUsage = (metrics.cluster.usedCPU / metrics.cluster.totalCPU) * 100;
      if (cpuUsage > 70) {
        newAlerts.push({
          id: Date.now() + 2,
          type: 'warning',
          title: 'Alto uso de CPU',
          message: `Uso de CPU: ${cpuUsage.toFixed(1)}%`,
          timestamp: new Date(),
          read: false
        });
      }
      
      // Alerta por nodos no listos
      const notReadyNodes = metrics.cluster.totalNodes - metrics.cluster.readyNodes;
      if (notReadyNodes > 0) {
        newAlerts.push({
          id: Date.now() + 3,
          type: 'error',
          title: 'Nodos No Disponibles',
          message: `${notReadyNodes} nodo(s) no están listos`,
          timestamp: new Date(),
          read: false
        });
      }

      if (newAlerts.length > 0) {
        setAlerts(prev => {
          // Evitar duplicados
          const existingIds = prev.map(a => a.title);
          const uniqueAlerts = newAlerts.filter(a => !existingIds.includes(a.title));
          return [...uniqueAlerts, ...prev.slice(0, 7)]; // Mantener últimas 8
        });
      }
    };

    // Verificar alertas cada minuto
    const interval = setInterval(checkAlerts, 60000);
    checkAlerts(); // Verificar inmediatamente

    return () => clearInterval(interval);
  }, [metrics]);

  const requestUpdate = useCallback(() => {
    fetchBackendData();
  }, [fetchBackendData]);

  const requestPodLogs = useCallback((podName, namespace, options) => {
    // TODO: Implementar cuando tengas WebSocket en el backend
    console.log(`Solicitando logs para ${podName} en ${namespace}`, options);
  }, []);

  const stopPodLogs = useCallback((podName, namespace) => {
    // TODO: Implementar cuando tengas WebSocket en el backend
    console.log(`Deteniendo logs para ${podName} en ${namespace}`);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const reconnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      await fetchBackendData();
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBackendData]);

  return {
    // Estado
    connectionStatus,
    metrics,
    logs,
    alerts,
    isConnecting,
    isConnected: connectionStatus === 'connected',
    
    // Métodos
    requestUpdate,
    requestPodLogs,
    stopPodLogs,
    clearLogs,
    clearAlerts,
    reconnect,
    
    // Info de conexión
    connectionInfo: {
      connected: connectionStatus === 'connected',
      reconnectAttempts: 0,
      socket: null,
      backendUrl: '/api'
    }
  };
};