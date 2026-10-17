/**
 * Configuración de la API para la aplicación móvil
 * 
 * IMPORTANTE: Cuando subas el sistema al host, actualiza la URL base
 * con la URL real de tu servidor.
 */

// URL base de la API. Para un dispositivo físico usa la IP LAN del PC,
// y para el emulador Android normalmente usa 10.0.2.2 en lugar de localhost.
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  'http://proyecto-casalai-ca/api'
).replace(/\/+$/, '');

const PROJECT_SERVER_ROOT = 'C:/xampp/htdocs/proyecto-casalai-ca';

// Ruta real del servidor donde PHP debe guardar la imagen.
// IMPORTANTE: esto NO es una URL para el navegador; es una ruta del sistema de archivos.
// En XAMPP debe apuntar a la carpeta física del proyecto, no a una URL pública.
export const PROFILE_IMAGE_STORAGE_PATH = `${PROJECT_SERVER_ROOT}/assets/img/uploads/`;

// URL pública para acceder a la imagen desde la app.
// Esta URL sí se usa para leer la imagen desde el navegador o desde React Native.
export const PROFILE_IMAGE_PUBLIC_URL = 'http://proyecto-casalai-ca/assets/img/uploads/';

// Ruta real del servidor donde PHP debe guardar la imagen del comprobante de pago.
// IMPORTANTE: esto NO es una URL para el navegador; es una ruta del sistema de archivos.
export const PAGOS_IMAGE_STORAGE_PATH = `${PROJECT_SERVER_ROOT}/assets/img/uploads/comprobantes/`;

// URL pública para acceder a la imagen del comprobante desde la app.
export const PAGOS_IMAGE_PUBLIC_URL = 'http://proyecto-casalai-ca/assets/img/uploads/comprobantes/';

// Normaliza una ruta de imagen para que funcione tanto con rutas relativas del servidor,
// rutas absolutas del sistema de archivos, como con URLs completas ya resueltas.
export const buildProfileImageUrl = (imageValue) => {
  if (!imageValue) {
    return null;
  }

  const value = String(imageValue).trim();

  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  const normalized = value.replace(/\\/g, '/');
  // PHP puede devolver una ruta absoluta, una ruta relativa o solo el nombre.
  // Para mostrarla no reutilizamos las carpetas del servidor: solo necesitamos el archivo.
  const fileName = normalized.split('/').pop();

  if (!fileName) {
    return null;
  }

  return `${PROFILE_IMAGE_PUBLIC_URL.replace(/\/+$/, '')}/${encodeURIComponent(fileName)}`;
};

export const buildPaymentImageUrl = (imageValue) => {
  if (!imageValue) {
    return null;
  }

  const value = String(imageValue).trim();

  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  const normalized = value.replace(/\\/g, '/');
  const fileName = normalized.split('/').pop();

  if (!fileName) {
    return null;
  }

  return `${PAGOS_IMAGE_PUBLIC_URL.replace(/\/+$/, '')}/${encodeURIComponent(fileName)}`;
};

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
