/**
 * Configuración de servicios externos
 * URL y tokens para servicios de analítica predictiva y auditoría
 */

export const SERVICES_CONFIG = {
  // Servicio de Analítica Predictiva
  ANALITICA_PREDICTIVA: {
    URL: 'http://127.0.0.1:8000', // Cambiar a HTTPS en producción si es necesario
    TOKEN: '7u6ssg9js6_hn8rkpIgmSjITmodKqa7TVzTEcz_wi3M',
  },

  // Servicio de Auditor Recepción
  AUDITOR_RECEPCION: {
    URL: 'http://127.0.0.1:8000', // Cambiar a HTTPS en producción si es necesario
    TOKEN: 'bSQT-fp7TcQXwOgJxpZdyPpwZmCdlPQgawKXN56cqAs',
  },
};

/**
 * Obtiene los headers de autenticación para un servicio externo
 * @param {string} serviceName - Nombre del servicio ('ANALITICA_PREDICTIVA' o 'AUDITOR_RECEPCION')
 * @returns {Object} - Headers con token de autenticación
 */
export const getServiceHeaders = (serviceName) => {
  const service = SERVICES_CONFIG[serviceName];
  if (!service) {
    console.warn(`[SERVICES] Servicio no encontrado: ${serviceName}`);
    return {};
  }

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${service.TOKEN}`,
  };
};

/**
 * Obtiene la URL base de un servicio externo
 * @param {string} serviceName - Nombre del servicio ('ANALITICA_PREDICTIVA' o 'AUDITOR_RECEPCION')
 * @returns {string} - URL base del servicio
 */
export const getServiceURL = (serviceName) => {
  const service = SERVICES_CONFIG[serviceName];
  if (!service) {
    console.warn(`[SERVICES] Servicio no encontrado: ${serviceName}`);
    return '';
  }

  return service.URL;
};

export default SERVICES_CONFIG;
