/**
 * Configuración de la API para la aplicación móvil
 * 
 * IMPORTANTE: Cuando subas el sistema al host, actualiza la URL base
 * con la URL real de tu servidor.
 */

// URL base de la API - CAMBIAR ESTO CUANDO SUBAS AL HOST
 // export const API_BASE_URL = 'https://casalai.infinityfree.me/api';

// Para desarrollo local (XAMPP localhost)
 export const API_BASE_URL = 'http://localhost/proyecto-casalai-ca/api';

// Configuración adicional de la API
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
  },
};

/**
 * Función para actualizar la URL base de la API dinámicamente
 * Útil si necesitas cambiar la URL en tiempo de ejecución
 */
export const setAPIBaseURL = (newBaseURL) => {
  API_CONFIG.baseURL = newBaseURL;
  // También actualizar la configuración en api.js
  if (typeof require !== 'undefined') {
    try {
      const api = require('../utils/api');
      if (api.setAPIBaseURL) {
        api.setAPIBaseURL(newBaseURL);
      }
    } catch (error) {
      console.warn('No se pudo actualizar la URL base en api.js:', error);
    }
  }
};

export default API_CONFIG;
