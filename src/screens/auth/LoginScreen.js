import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import { Image as RNImage } from 'react-native';
import { validateEmail, validatePassword, validateEmailWithDomain, validateUsername } from '../../utils/validation';
import { API_BASE_URL } from '../../config/apiConfig';

// Intentar cargar la imagen
let logoImage;
try {
  logoImage = require('../../assets/images/LOGO.png');
} catch (e) {
  console.error('Error al cargar la imagen:', e);
  logoImage = null;
}

// Dominios de email permitidos (configurar según necesidad)
// Temporalmente deshabilitado para permitir cualquier dominio durante pruebas
const ALLOWED_EMAIL_DOMAINS = [];

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [imageError, setImageError] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [debugData, setDebugData] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.auth);

  // Verificar si la imagen existe
  useEffect(() => {
    if (!logoImage) {
      console.error('No se pudo cargar la imagen');
      setImageError(true);
    }
  }, []);

  useEffect(() => {
    // Limpiar errores al desmontar
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    // Capturar respuesta de la API cuando hay error o éxito
    try {
      if (error && typeof error === 'object' && error.apiResponse) {
        setApiResponse(error.apiResponse);
      } else if (error) {
        // Si el error es un string, mostrarlo directamente
        setApiResponse({
          status: 'error',
          message: typeof error === 'string' ? error : (error.message || 'Error desconocido'),
          data: error
        });
      } else if (user) {
        // Si el login fue exitoso, capturar información adicional
        setApiResponse({ status: 'success', message: 'Login exitoso' });
      }
    } catch (e) {
      console.error('Error en useEffect de captura de respuesta:', e);
    }
  }, [error, user]);

  const handleLogin = async () => {
    // Resetear errores
    setUsernameError('');
    setPasswordError('');
    setDebugData(null);
    setApiResponse(null);

    // Validar username o email
    if (!username.trim()) {
      setUsernameError('El usuario o correo es requerido');
      return;
    }

    // Si parece un email, validar como email
    if (username.includes('@')) {
      if (!validateEmailWithDomain(username, ALLOWED_EMAIL_DOMAINS)) {
        setUsernameError('Email inválido');
        return;
      }
    } else {
      // Si es username, validar formato
      if (!validateUsername(username)) {
        setUsernameError('Usuario inválido. Solo letras, números y guiones bajos (3-50 caracteres)');
        return;
      }
    }

    // Validar contraseña
    if (!password.trim()) {
      setPasswordError('La contraseña es requerida');
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError('La contraseña debe tener entre 6 y 15 caracteres');
      return;
    }

    // Enviar como email o username según corresponda
    const loginData = username.includes('@')
      ? { email: username, password, name: 'Usuario' }
      : { username: username, password, name: 'Usuario' };

    // Capturar datos para depuración
    setDebugData({
      timestamp: new Date().toISOString(),
      apiURL: `${API_BASE_URL}/login.php`,
      requestData: loginData,
      requestType: username.includes('@') ? 'EMAIL_LOGIN' : 'USERNAME_LOGIN'
    });

    try {
      await dispatch(loginUser(loginData));
    } catch (error) {
      console.error('Error en handleLogin:', error);
      setApiResponse({
        status: 'error',
        message: error.message || 'Error desconocido al hacer login',
        data: { error: error.toString() }
      });
    }
  };

  const handleGoToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          {logoImage ? (
            <Image
              source={logoImage}
              style={styles.logo}
              resizeMode="contain"
              onError={(e) => {
                console.log('Error al cargar la imagen:', e);
                setImageError(true);
              }}
            />
          ) : (
            <View style={[styles.logo, { backgroundColor: COLORS.lightGray, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: COLORS.primary }}>Logo no disponible</Text>
              <Text style={{ color: COLORS.primary, fontSize: 10 }}>Ruta: ../../../assets/images/LOGO.png</Text>
            </View>
          )}
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {typeof error === 'object' ? (error.message || error.apiResponse?.message || 'Error en el inicio de sesión') : error}
              </Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Usuario o correo</Text>
            <TextInput
              style={[styles.input, usernameError && styles.inputError]}
              placeholder="Ingresa tu usuario o correo"
              placeholderTextColor={COLORS.placeholder}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError('');
              }}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {usernameError ? <Text style={styles.fieldErrorText}>{usernameError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[styles.input, passwordError && styles.inputError]}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor={COLORS.placeholder}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              secureTextEntry
              editable={!loading}
            />
            {passwordError ? <Text style={styles.fieldErrorText}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading || !username || !password}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              <Text style={styles.footerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>

          {/* Sección de depuración */}
          {(debugData || user || error) && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>🔍 DATOS DE DEPURACIÓN</Text>
              
              {debugData && (
                <View style={styles.debugSection}>
                  <Text style={styles.debugSectionTitle}>Petición enviada:</Text>
                  <Text style={styles.debugText}>URL: {debugData.apiURL}</Text>
                  <Text style={styles.debugText}>Tipo: {debugData.requestType}</Text>
                  <Text style={styles.debugText}>Timestamp: {debugData.timestamp}</Text>
                  <Text style={styles.debugText}>Datos: {JSON.stringify(debugData.requestData)}</Text>
                </View>
              )}

              {apiResponse && (
                <View style={styles.debugSection}>
                  <Text style={styles.debugSectionTitle}>Respuesta de la API:</Text>
                  <Text style={styles.debugText}>Status: {apiResponse.status}</Text>
                  <Text style={styles.debugText}>Mensaje: {apiResponse.message}</Text>
                  {apiResponse.data && (
                    <Text style={styles.debugText}>Datos: {JSON.stringify(apiResponse.data)}</Text>
                  )}
                </View>
              )}

              {user && (
                <View style={styles.debugSection}>
                  <Text style={styles.debugSectionTitle}>Usuario autenticado:</Text>
                  <Text style={styles.debugText}>ID: {user.id}</Text>
                  <Text style={styles.debugText}>Nombre: {user.name}</Text>
                  <Text style={styles.debugText}>Username: {user.username}</Text>
                  <Text style={styles.debugText}>Email: {user.email}</Text>
                  <Text style={styles.debugText}>Rol: {user.role}</Text>
                  <Text style={styles.debugText}>Token: {user.token ? user.token.substring(0, 20) + '...' : 'N/A'}</Text>
                </View>
              )}

              {error && (
                <View style={styles.debugSection}>
                  <Text style={styles.debugSectionTitle}>Error:</Text>
                  <Text style={styles.debugError}>{typeof error === 'object' ? error.message : error}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: COLORS.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: COLORS.textSecondary,
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: COLORS.danger + '20',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.body,
    color: COLORS.text,
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  fieldErrorText: {
    ...theme.typography.caption,
    color: COLORS.danger,
    marginTop: theme.spacing.xs,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadow.md,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    ...theme.typography.body,
    color: COLORS.white,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.body,
    color: COLORS.textSecondary,
  },
  footerLink: {
    ...theme.typography.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: '#f5f5f5',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    ...theme.typography.subtitle,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  debugSection: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  debugSectionTitle: {
    ...theme.typography.bodyBold,
    color: COLORS.text,
    marginBottom: theme.spacing.xs,
  },
  debugText: {
    ...theme.typography.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  debugError: {
    ...theme.typography.caption,
    color: COLORS.danger,
  },
});

export default LoginScreen;
