/**
 * Clase de cifrado híbrido RSA+AES-256-CBC para React Native
 * Compatible con la implementación PHP del servidor
 * 
 * Características:
 * - Algoritmo híbrido: RSA para proteger clave AES + AES-256-CBC para datos
 * - RSA: 2048 bits para cifrado asimétrico de clave AES
 * - AES-256-CBC: Para cifrado simétrico de datos (rápido y eficiente)
 * - Longitud de clave AES: 256 bits (32 bytes), generada aleatoriamente por sesión
 * - Modo AES: CBC (Cipher Block Chaining)
 * - Padding: PKCS7
 * - IV (Initialization Vector): 128 bits (16 bytes), generado aleatoriamente para cada cifrado
 * - Codificación: Base64 para almacenamiento y transmisión
 */

import forge from 'node-forge';
import { ENCRYPTION_CONFIG } from '../config/encryptionConfig.js';

class Encryption {
  constructor() {
    this.rsaPublicKey = null;
    this.rsaPrivateKey = null;
    this.aesMethod = 'AES-256-CBC';
    this.loadRSAKeys();
  }

  /**
   * Carga claves RSA desde la configuración
   */
  loadRSAKeys() {
    try {
      this.rsaPublicKey = ENCRYPTION_CONFIG.RSA_PUBLIC_KEY;
      this.rsaPrivateKey = ENCRYPTION_CONFIG.RSA_PRIVATE_KEY;

      console.log('[ENCRYPTION] Claves RSA cargadas exitosamente');
      console.log('[ENCRYPTION] Longitud clave pública:', this.rsaPublicKey.length);
      console.log('[ENCRYPTION] Longitud clave privada:', this.rsaPrivateKey.length);
    } catch (error) {
      console.error('[ENCRYPTION] Error cargando claves RSA:', error);
      throw new Error('Las claves RSA no están configuradas correctamente');
    }
  }

  /**
   * Convierte una clave PEM de string a objeto forge
   * @param {string} pemKey - Clave en formato PEM
   * @param {boolean} isPrivate - true si es clave privada, false si es pública
   * @returns {Object} - Objeto de clave forge
   */
  parsePemKey(pemKey, isPrivate = false) {
    try {
      if (isPrivate) {
        return forge.pki.privateKeyFromPem(pemKey);
      } else {
        return forge.pki.publicKeyFromPem(pemKey);
      }
    } catch (error) {
      console.error('[ENCRYPTION] Error parseando clave PEM:', error);
      throw new Error('Error al parsear clave RSA: ' + error.message);
    }
  }

  /**
   * Genera bytes aleatorios
   * @param {number} length - Longitud en bytes
   * @returns {string} - Bytes aleatorios como string
   */
  generateRandomBytes(length) {
    return forge.random.getBytesSync(length);
  }

  /**
   * Convierte string a bytes UTF-8
   * @param {string} str - String a convertir
   * @returns {string} - Bytes UTF-8
   */
  stringToBytes(str) {
    return forge.util.encodeUtf8(str);
  }

  /**
   * Convierte bytes UTF-8 a string
   * @param {string} bytes - Bytes a convertir
   * @returns {string} - String UTF-8
   */
  bytesToString(bytes) {
    return forge.util.decodeUtf8(bytes);
  }

  /**
   * Cifra un dato usando cifrado híbrido RSA+AES-256-CBC
   * Proceso:
   * 1. Generar clave AES aleatoria (32 bytes)
   * 2. Cifrar datos con AES-256-CBC
   * 3. Cifrar clave AES con RSA-2048
   * 4. Combinar: clave AES cifrada + IV + datos cifrados
   * 
   * @param {string} data - Datos a cifrar
   * @returns {string} - Datos cifrados en Base64
   */
  encrypt(data) {
    // Manejar valores nulos o vacíos
    if (data === null) {
      return null;
    }

    if (data === '') {
      return '';
    }

    // Asegurar que sea string
    data = String(data);

    try {
      console.log('[ENCRYPTION] Iniciando cifrado...');
      console.log('[ENCRYPTION] Longitud dato original:', data.length);

      // 1. Generar clave AES aleatoria de 32 bytes (256 bits)
      const aesKey = this.generateRandomBytes(32);
      console.log('[ENCRYPTION] Clave AES generada:', aesKey.length, 'bytes');

      // 2. Generar IV aleatorio de 16 bytes (128 bits)
      const iv = this.generateRandomBytes(16);
      console.log('[ENCRYPTION] IV generado:', iv.length, 'bytes');

      // 3. Convertir datos a bytes UTF-8
      const dataBytes = this.stringToBytes(data);
      console.log('[ENCRYPTION] Datos convertidos a bytes:', dataBytes.length, 'bytes');

      // 4. Cifrar datos con AES-256-CBC usando PKCS7 padding
      const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
      cipher.start({ iv: iv });
      cipher.update(forge.util.createBuffer(dataBytes));
      cipher.finish();

      const encryptedData = cipher.output.getBytes();
      console.log('[ENCRYPTION] Datos cifrados con AES:', encryptedData.length, 'bytes');

      // 5. Cifrar clave AES con RSA (clave pública)
      const publicKey = this.parsePemKey(this.rsaPublicKey, false);
      const encryptedAesKey = publicKey.encrypt(aesKey, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha256.create()
        }
      });
      console.log('[ENCRYPTION] Clave AES cifrada con RSA:', encryptedAesKey.length, 'bytes');

      // 6. Combinar: longitud clave AES cifrada (4 bytes) + clave AES cifrada + IV + datos cifrados
      // Convertir longitud a big-endian (compatible con PHP pack('N'))
      const keyLengthBytes = String.fromCharCode(
        (encryptedAesKey.length >>> 24) & 0xFF,
        (encryptedAesKey.length >>> 16) & 0xFF,
        (encryptedAesKey.length >>> 8) & 0xFF,
        encryptedAesKey.length & 0xFF
      );

      const result = keyLengthBytes + encryptedAesKey + iv + encryptedData;
      console.log('[ENCRYPTION] Longitud resultado combinado:', result.length, 'bytes');

      // 7. Codificar en Base64
      const base64Result = forge.util.encode64(result);
      console.log('[ENCRYPTION] Resultado Base64:', base64Result.length, 'caracteres');
      console.log('[ENCRYPTION] Cifrado completado exitosamente');

      return base64Result;
    } catch (error) {
      console.error('[ENCRYPTION] Error en cifrado:', error);
      throw new Error('Error al cifrar datos: ' + error.message);
    }
  }

  /**
   * Descifra un dato cifrado con cifrado híbrido RSA+AES-256-CBC
   * Proceso:
   * 1. Decodificar de Base64
   * 2. Extraer longitud de clave AES cifrada
   * 3. Extraer clave AES cifrada
   * 4. Descifrar clave AES con RSA (clave privada)
   * 5. Extraer IV y datos cifrados
   * 6. Descifrar datos con AES-256-CBC
   * 
   * @param {string} encryptedData - Datos cifrados en Base64
   * @returns {string} - Datos descifrados
   */
  decrypt(encryptedData) {
    // Manejar valores nulos o vacíos
    if (encryptedData === null) {
      return null;
    }

    if (encryptedData === '') {
      return '';
    }

    // Asegurar que sea string
    encryptedData = String(encryptedData);

    try {
      console.log('[ENCRYPTION] Iniciando descifrado...');
      console.log('[ENCRYPTION] Longitud dato cifrado:', encryptedData.length);

      // 1. Decodificar de Base64
      const data = forge.util.decode64(encryptedData);
      console.log('[ENCRYPTION] Datos decodificados de Base64:', data.length, 'bytes');

      // Verificar longitud mínima (4 bytes longitud + clave AES + IV + datos)
      if (data.length < 4 + 16) {
        console.log('[ENCRYPTION] Datos demasiado cortos, asumiendo dato no cifrado');
        return encryptedData;
      }

      // 2. Extraer longitud de clave AES cifrada (primeros 4 bytes)
      const keyLength = (
        (data.charCodeAt(0) << 24) |
        (data.charCodeAt(1) << 16) |
        (data.charCodeAt(2) << 8) |
        data.charCodeAt(3)
      );
      console.log('[ENCRYPTION] Longitud clave AES cifrada:', keyLength, 'bytes');

      // Verificar que hay suficientes datos
      if (data.length < 4 + keyLength + 16) {
        console.log('[ENCRYPTION] Estructura incompleta, retornando original');
        return encryptedData;
      }

      // 3. Extraer clave AES cifrada
      const encryptedAesKey = data.substring(4, 4 + keyLength);
      console.log('[ENCRYPTION] Clave AES cifrada extraída:', encryptedAesKey.length, 'bytes');

      // 4. Descifrar clave AES con RSA (clave privada)
      const privateKey = this.parsePemKey(this.rsaPrivateKey, true);
      const aesKey = privateKey.decrypt(encryptedAesKey, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha256.create()
        }
      });
      console.log('[ENCRYPTION] Clave AES descifrada:', aesKey.length, 'bytes');

      // 5. Extraer IV (16 bytes) y datos cifrados
      const iv = data.substring(4 + keyLength, 4 + keyLength + 16);
      const encryptedDataPart = data.substring(4 + keyLength + 16);
      console.log('[ENCRYPTION] IV extraído:', iv.length, 'bytes');
      console.log('[ENCRYPTION] Datos cifrados extraídos:', encryptedDataPart.length, 'bytes');

      // 6. Descifrar datos con AES-256-CBC
      const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
      decipher.start({ iv: iv });
      decipher.update(forge.util.createBuffer(encryptedDataPart));
      decipher.finish();

      const decryptedBytes = decipher.output.getBytes();
      console.log('[ENCRYPTION] Datos descifrados:', decryptedBytes.length, 'bytes');

      // 7. Convertir bytes a string UTF-8
      const decrypted = this.bytesToString(decryptedBytes);
      console.log('[ENCRYPTION] Descifrado completado exitosamente');
      console.log('[ENCRYPTION] Longitud resultado:', decrypted.length, 'caracteres');

      return decrypted;
    } catch (error) {
      console.error('[ENCRYPTION] Error en descifrado:', error);
      // Si falla el descifrado, retornar valor original (compatibilidad)
      return encryptedData;
    }
  }

  /**
   * Cifra un array de datos
   * @param {Object} data - Objeto de datos a cifrar
   * @param {Array<string>} fields - Campos a cifrar
   * @returns {Object} - Objeto con campos cifrados
   */
  encryptArray(data, fields) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const result = { ...data };

    for (const field of fields) {
      if (result.hasOwnProperty(field) && result[field] !== undefined && result[field] !== null) {
        console.log(`[ENCRYPTION] Cifrando campo: ${field}`);
        result[field] = this.encrypt(result[field]);
      }
    }

    return result;
  }

  /**
   * Descifra un array de datos
   * @param {Object} data - Objeto de datos cifrados
   * @param {Array<string>} fields - Campos a descifrar
   * @returns {Object} - Objeto con campos descifrados
   */
  decryptArray(data, fields) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const result = { ...data };

    for (const field of fields) {
      if (result.hasOwnProperty(field) && result[field] !== undefined && result[field] !== null) {
        console.log(`[ENCRYPTION] Descifrando campo: ${field}`);
        result[field] = this.decrypt(result[field]);
      }
    }

    return result;
  }

  /**
   * Método de prueba para verificar el cifrado/descifrado
   * @param {string} plainText - Texto plano a probar
   * @param {string} fieldName - Nombre del campo para logging
   * @returns {boolean} - true si el cifrado/descifrado funciona correctamente
   */
  testEncryption(plainText, fieldName = 'test') {
    console.log('[ENCRYPTION-TEST] =======================');
    console.log(`[ENCRYPTION-TEST] Probando campo '${fieldName}'`);
    console.log(`[ENCRYPTION-TEST] Texto original: '${plainText}'`);
    console.log(`[ENCRYPTION-TEST] Longitud: ${plainText.length}`);

    try {
      // Cifrar
      const encrypted = this.encrypt(plainText);
      console.log(`[ENCRYPTION-TEST] Texto cifrado: ${encrypted.substring(0, 50)}...`);
      console.log(`[ENCRYPTION-TEST] Longitud cifrado: ${encrypted.length}`);

      // Descifrar
      const decrypted = this.decrypt(encrypted);
      console.log(`[ENCRYPTION-TEST] Texto descifrado: '${decrypted}'`);
      console.log(`[ENCRYPTION-TEST] Longitud descifrado: ${decrypted.length}`);

      // Verificar
      const success = plainText === decrypted;
      console.log(`[ENCRYPTION-TEST] Éxito: ${success ? '✅' : '❌'}`);
      console.log('[ENCRYPTION-TEST] =======================');

      return success;
    } catch (error) {
      console.error(`[ENCRYPTION-TEST] Error: ${error.message}`);
      console.log('[ENCRYPTION-TEST] =======================');
      return false;
    }
  }
}

// Exportar instancia singleton
export const encryption = new Encryption();
export default encryption;