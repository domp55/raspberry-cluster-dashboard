// frontend/src/services/websocketService.js

import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.metricsCache = null;
    
    // URL del backend - ajusta según tu configuración
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  }

  // Conectar al servidor WebSocket
  async connect() {
    try {
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io(this.backendUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        autoConnect: true
      });

      this.setupEventListeners();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout de conexión al backend'));
        }, 10000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('✅ Frontend conectado al backend WebSocket');
          this.notifyListeners('connection', { status: 'connected' });
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('❌ Error conectando frontend al backend:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Error creando conexión WebSocket desde frontend:', error);
      throw error;
    }
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('🔌 Frontend -> Backend WebSocket conectado');
      this.notifyListeners('connection', { status: 'connected' });
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('🔌 Frontend -> Backend WebSocket desconectado:', reason);
      this.notifyListeners('connection', { status: 'disconnected', reason });
      
      if (reason === 'io server disconnect') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión Frontend -> Backend:', error.message);
      this.notifyListeners('connection', { status: 'error', error: error.message });
      this.attemptReconnect();
    });

    // Eventos específicos del cluster
    this.socket.on('metrics-update', (data) => {
      console.log('📊 Métricas recibidas del backend');
      this.metricsCache = data;
      this.notifyListeners('metrics', data);
    });

    this.socket.on('logs-update', (data) => {
      console.log('📝 Logs recibidos del backend');
      this.notifyListeners('logs', data);
    });

    this.socket.on('alert', (alert) => {
      console.log('🚨 Alerta recibida del backend:', alert);
      this.notifyListeners('alert', alert);
    });

    this.socket.on('pods-update', (data) => {
      this.notifyListeners('pods', data);
    });

    this.socket.on('nodes-update', (data) => {
      this.notifyListeners('nodes', data);
    });

    this.socket.on('deployments-update', (data) => {
      this.notifyListeners('deployments', data);
    });
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo número de intentos de reconexión alcanzado');
      this.notifyListeners('connection', { 
        status: 'failed', 
        message: 'No se pudo reconectar al servidor backend' 
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`🔄 Intento de reconexión ${this.reconnectAttempts}/${this.maxReconnectAttempts} en ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        this.socket.connect();
      }
    }, delay);
  }

  // Métodos para comunicación con el backend
  requestUpdate() {
    if (this.isConnected && this.socket) {
      this.socket.emit('request-update');
      console.log('📡 Solicitud de actualización enviada al backend');
    } else {
      console.warn('⚠️ No hay conexión WebSocket para solicitar actualización');
    }
  }

  requestPodLogs(podName, namespace = 'default', options = {}) {
    if (this.isConnected && this.socket) {
      this.socket.emit('request-pod-logs', {
        podName,
        namespace,
        ...options
      });
      console.log(`📝 Solicitando logs para ${podName} en namespace ${namespace}`);
    }
  }

  stopPodLogs(podName, namespace = 'default') {
    if (this.isConnected && this.socket) {
      this.socket.emit('stop-pod-logs', { podName, namespace });
      console.log(`⏹️ Deteniendo logs para ${podName}`);
    }
  }

  // Gestión de listeners
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    if (event === 'metrics' && this.metricsCache) {
      callback(this.metricsCache);
    }
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en listener de ${event}:`, error);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
    this.metricsCache = null;
    console.log('🔌 WebSocket desconectado manualmente desde frontend');
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socket: this.socket ? this.socket.id : null,
      backendUrl: this.backendUrl
    };
  }

  getCachedMetrics() {
    return this.metricsCache;
  }
}

// Instancia singleton para usar en toda la app
const webSocketService = new WebSocketService();

export default webSocketService;

// Servicio REST como fallback (mantener compatibilidad con tu código actual)
export const kubernetesService = {
  async getPods() {
    try {
      const response = await fetch('/api/pods');
      if (!response.ok) throw new Error('Error al obtener pods');
      return await response.json();
    } catch (error) {
      console.error('Error en getPods:', error);
      // Datos simulados como fallback
      return {
        total: 15,
        running: 13,
        pending: 1,
        failed: 1
      };
    }
  },

  async getNodes() {
    try {
      const response = await fetch('/api/nodes');
      if (!response.ok) throw new Error('Error al obtener nodos');
      return await response.json();
    } catch (error) {
      console.error('Error en getNodes:', error);
      return [];
    }
  },

  async getDeployments() {
    try {
      const response = await fetch('/api/deployments');
      if (!response.ok) throw new Error('Error al obtener deployments');
      return await response.json();
    } catch (error) {
      console.error('Error en getDeployments:', error);
      return [];
    }
  },

  async getMetrics() {
    try {
      const response = await fetch('/api/metrics');
      if (!response.ok) throw new Error('Error al obtener métricas');
      return await response.json();
    } catch (error) {
      console.error('Error en getMetrics:', error);
      return null;
    }
  }
};