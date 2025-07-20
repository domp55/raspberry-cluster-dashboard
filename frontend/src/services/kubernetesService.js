import axios from 'axios';

// Simulación de datos - reemplaza con llamadas reales a tu API de Kubernetes
export const kubernetesService = {
  // Obtener información de pods
  getPods: async () => {
    // En producción, esto haría una llamada real a la API de Kubernetes
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          total: 12,
          running: 10,
          pending: 1,
          failed: 1,
          pods: [
            { name: 'frontend-deployment-1', status: 'Running', node: 'pi-node-1' },
            { name: 'backend-deployment-1', status: 'Running', node: 'pi-node-2' },
            { name: 'database-deployment-1', status: 'Running', node: 'pi-node-3' },
          ]
        });
      }, 1000);
    });
  },

  // Obtener información de nodos
  getNodes: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { name: 'pi-master', status: 'Ready', cpu: '45%', memory: '60%' },
          { name: 'pi-node-1', status: 'Ready', cpu: '32%', memory: '45%' },
          { name: 'pi-node-2', status: 'Ready', cpu: '28%', memory: '52%' },
          { name: 'pi-node-3', status: 'Ready', cpu: '38%', memory: '41%' },
        ]);
      }, 1000);
    });
  },

  // Obtener proyectos desplegados
  getDeployments: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { name: 'Web Frontend', replicas: 3, available: 3, namespace: 'default' },
          { name: 'API Backend', replicas: 2, available: 2, namespace: 'default' },
          { name: 'Database', replicas: 1, available: 1, namespace: 'database' },
          { name: 'Monitoring', replicas: 1, available: 1, namespace: 'monitoring' },
        ]);
      }, 1000);
    });
  }
};