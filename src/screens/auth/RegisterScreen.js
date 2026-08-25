import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/slices/authSlice';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import { 
  validateEmail, 
  validatePasswordRegister, 
  validateUsername,
  validateLength,
  validateNotEmpty
} from '../../utils/validation';

const RegisterScreen = ({ navigation }) => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cedula, setCedula] = useState('');
  const [direccion, setDireccion] = useState('');
  
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre de usuario
    if (!validateNotEmpty(nombreUsuario)) {
      newErrors.nombreUsuario = 'El nombre de usuario es requerido';
    } else if (!validateUsername(nombreUsuario)) {
      newErrors.nombreUsuario = 'El nombre de usuario debe tener entre 3 y 50 caracteres, solo letras, números y guiones bajos';
    }

    // Validar contraseña
    if (!validateNotEmpty(clave)) {
      newErrors.clave = 'La contraseña es requerida';
    } else if (!validatePasswordRegister(clave)) {
      newErrors.clave = 'La contraseña debe tener entre 6 y 15 caracteres, al menos una mayúscula, un número y un carácter especial';
    }

    // Validar nombre
    if (!validateNotEmpty(nombre)) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (!validateLength(nombre, 2, 50)) {
      newErrors.nombre = 'El nombre debe tener entre 2 y 50 caracteres';
    }

    // Validar apellido
    if (!validateNotEmpty(apellido)) {
      newErrors.apellido = 'El apellido es requerido';
    } else if (!validateLength(apellido, 2, 50)) {
      newErrors.apellido = 'El apellido debe tener entre 2 y 50 caracteres';
    }

    // Validar correo
    if (!validateNotEmpty(correo)) {
      newErrors.correo = 'El correo es requerido';
    } else if (!validateEmail(correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    // Validar teléfono
    if (!validateNotEmpty(telefono)) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!validateLength(telefono, 10, 20)) {
      newErrors.telefono = 'El teléfono debe tener entre 10 y 20 caracteres';
    }

    // Validar cédula
    if (!validateNotEmpty(cedula)) {
      newErrors.cedula = 'La cédula es requerida';
    } else if (!validateLength(cedula, 5, 20)) {
      newErrors.cedula = 'La cédula debe tener entre 5 y 20 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validateForm()) {
      dispatch(registerUser({
        nombre_usuario: nombreUsuario,
        clave: clave,
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        telefono: telefono,
        cedula: cedula,
        direccion: direccion
      }));
    }
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Registro de Usuario</Text>
          <Text style={styles.subtitle}>Crea tu cuenta para comenzar</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de Usuario</Text>
            <TextInput
              style={[styles.input, errors.nombreUsuario && styles.inputError]}
              placeholder="usuario123"
              value={nombreUsuario}
              onChangeText={setNombreUsuario}
              autoCapitalize="none"
            />
            {errors.nombreUsuario && <Text style={styles.errorText}>{errors.nombreUsuario}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[styles.input, errors.clave && styles.inputError]}
              placeholder="••••••••"
              value={clave}
              onChangeText={setClave}
              secureTextEntry
            />
            {errors.clave && <Text style={styles.errorText}>{errors.clave}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={[styles.input, errors.nombre && styles.inputError]}
              placeholder="Juan"
              value={nombre}
              onChangeText={setNombre}
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={[styles.input, errors.apellido && styles.inputError]}
              placeholder="Pérez"
              value={apellido}
              onChangeText={setApellido}
            />
            {errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={[styles.input, errors.correo && styles.inputError]}
              placeholder="juan@ejemplo.com"
              value={correo}
              onChangeText={setCorreo}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={[styles.input, errors.telefono && styles.inputError]}
              placeholder="04141234567"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
            {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cédula</Text>
            <TextInput
              style={[styles.input, errors.cedula && styles.inputError]}
              placeholder="12345678"
              value={cedula}
              onChangeText={setCedula}
              keyboardType="numeric"
            />
            {errors.cedula && <Text style={styles.errorText}>{errors.cedula}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Dirección completa"
              value={direccion}
              onChangeText={setDireccion}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta? Inicia Sesión
            </Text>
          </TouchableOpacity>
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
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 5,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
