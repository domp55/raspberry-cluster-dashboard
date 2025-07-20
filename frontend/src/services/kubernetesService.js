// frontend/src/services/kubernetesService.js

import axios from 'axios';

// La URL base de tu nuevo backend
const API_URL = 'http://192.168.0.196:3001/api';

export const kubernetesService = {
  /**
   * Obtiene el resumen de los pods desde nuestro backend.
   */
  getPods: async () => {
    const response = await axios.get(`${API_URL}/pods`);
    return response.data;
  },

  /**
   * Obtiene la lista de nodos desde nuestro backend.
   */
  getNodes: async () => {
    const response = await axios.get(`${API_URL}/nodes`);
    return response.data;
  },

  /**
   * Obtiene la lista de deployments desde nuestro backend.
   */
  getDeployments: async () => {
    const response = await axios.get(`${API_URL}/deployments`);
    return response.data;
  }
};