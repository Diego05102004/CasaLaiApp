/**
 * Función para cargar imágenes de manera segura
 * @param {string} imageName - Nombre del archivo de imagen
 * @returns {number|object} - Retorna el recurso de imagen o un objeto con uri
 */
export const getImageSource = (imageName) => {
  try {
    // Primero intentamos cargar la imagen directamente
    const imageMap = {
      'FONDO.jpg': require('../../src/assets/images/FONDO.jpg'),
    };
    
    if (imageMap[imageName]) {
      return imageMap[imageName];
    }
    
    // Si no está en el mapa, intentamos cargarla dinámicamente
    return { uri: `file:///a:/Escritorio/casa-lai/src/assets/images/${imageName}` };
  } catch (error) {
    console.error('Error loading image:', error);
    // Retornamos un color de fondo como respaldo
    return null;
  }
};
