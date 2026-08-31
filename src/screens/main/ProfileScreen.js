import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert, ScrollView, TextInput, Modal } from 'react-native';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';

import {
  filterUsername,
  filterAlpha,
  formatPhoneNumber,
  validateUsername,
  validateName,
  validateLastName,
  validatePhone,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateProfileImage,
} from '../../validation/profileValidation';

const ProfileScreen = () => {
  const { user } = useSelector((state) => state.auth);

  // Estados para foto de perfil
  const [profileImage, setProfileImage] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);

  // Estados de edición
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Campos de Información Personal
  const [username, setUsername] = useState(user?.username || user?.nombre_usuario || '');
  const [name, setName] = useState(user?.name || user?.nombre || '');
  const [lastName, setLastName] = useState(user?.lastName || user?.apellido || '');
  const [phone, setPhone] = useState(user?.phone || user?.telefono || '');

  const [errorsPersonal, setErrorsPersonal] = useState({});

  // Campos de Cambio de Correo
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [errorsEmail, setErrorsEmail] = useState({});

  // Campos de Cambio de Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorsPassword, setErrorsPassword] = useState({});

  // SOLUCIÓN AL RESETEO IMPREVISTO: Solo sincronizar si no se está editando activamente
  useEffect(() => {
    if (user && !isEditingPersonal) {
      setUsername(user.username || user.nombre_usuario || '');
      setName(user.name || user.nombre || '');
      setLastName(user.lastName || user.apellido || '');
      setPhone(user.phone || user.telefono || '');
    }
  }, [user, isEditingPersonal]);

  const handleOpenPhotoModal = () => {
    setTempImage(profileImage);
    setIsPhotoModalVisible(true);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto de perfil');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const sizeError = validateProfileImage(asset);
      if (sizeError) {
        Alert.alert('Error', sizeError);
        return;
      }
      setSelectedAsset(asset);
      setTempImage(asset.uri);
    }
  };

  const handleSavePhoto = () => {
    if (!selectedAsset && !tempImage) {
      Alert.alert('Error', 'Debes seleccionar una imagen');
      return;
    }
    setProfileImage(tempImage);
    setIsPhotoModalVisible(false);
    Alert.alert('¡Éxito!', 'Foto de perfil actualizada correctamente');
  };

  // Manejadores con filtro en tiempo real (Keypress adaptado)
  const handleChangeUsername = (text) => {
    const filtered = filterUsername(text);
    setUsername(filtered);
    setErrorsPersonal((prev) => ({ ...prev, username: validateUsername(filtered) }));
  };

  const handleChangeName = (text) => {
    const filtered = filterAlpha(text);
    setName(filtered);
    setErrorsPersonal((prev) => ({ ...prev, name: validateName(filtered) }));
  };

  const handleChangeLastName = (text) => {
    const filtered = filterAlpha(text);
    setLastName(filtered);
    setErrorsPersonal((prev) => ({ ...prev, lastName: validateLastName(filtered) }));
  };

  const handleChangePhone = (text) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
    setErrorsPersonal((prev) => ({ ...prev, phone: validatePhone(formatted) }));
  };

  const handleChangeNewEmail = (text) => {
    setNewEmail(text);
    setErrorsEmail((prev) => ({ ...prev, newEmail: validateEmail(text) }));
  };

  const handleChangeNewPassword = (text) => {
    setNewPassword(text);
    setErrorsPassword((prev) => ({
      ...prev,
      newPassword: validatePassword(text),
      confirmPassword: validateConfirmPassword(text, confirmPassword),
    }));
  };

  const handleChangeConfirmPassword = (text) => {
    setConfirmPassword(text);
    setErrorsPassword((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(newPassword, text),
    }));
  };

  // Guardar Información Personal
  const handleSavePersonal = () => {
    const errUsername = validateUsername(username);
    const errName = validateName(name);
    const errLastName = validateLastName(lastName);
    const errPhone = validatePhone(phone);

    if (errUsername || errName || errLastName || errPhone) {
      setErrorsPersonal({
        username: errUsername,
        name: errName,
        lastName: errLastName,
        phone: errPhone,
      });
      Alert.alert('Error', 'Por favor corrige los campos señalados');
      return;
    }

    setIsEditingPersonal(false);
    Alert.alert('¡Éxito!', 'Tus datos personales han sido actualizados');
  };

  // Guardar Correo
  const handleSaveEmail = () => {
    const errEmail = validateEmail(newEmail);
    if (errEmail || !currentPasswordForEmail) {
      setErrorsEmail({
        newEmail: errEmail,
        currentPasswordForEmail: !currentPasswordForEmail ? 'Ingresa tu contraseña actual' : '',
      });
      Alert.alert('Error', 'Por favor completa y corrige los campos del correo');
      return;
    }

    setIsEditingEmail(false);
    setNewEmail('');
    setCurrentPasswordForEmail('');
    setErrorsEmail({});
    Alert.alert('¡Éxito!', 'Tu correo electrónico ha sido actualizado');
  };

  // Guardar Contraseña
  const handleSavePassword = () => {
    const errNewPassword = validatePassword(newPassword);
    const errConfirmPassword = validateConfirmPassword(newPassword, confirmPassword);

    if (!currentPassword || errNewPassword || errConfirmPassword) {
      setErrorsPassword({
        currentPassword: !currentPassword ? 'Ingresa tu contraseña actual' : '',
        newPassword: errNewPassword,
        confirmPassword: errConfirmPassword,
      });
      Alert.alert('Error', 'Por favor revisa los campos de contraseña');
      return;
    }

    setIsEditingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorsPassword({});
    Alert.alert('¡Éxito!', 'Tu contraseña ha sido actualizada');
  };

  const renderUserField = (label, value) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.fieldContainer}>
        <Text style={styles.infoValue}>{value || 'No disponible'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* CABECERA DE PERFIL */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handleOpenPhotoModal} style={styles.avatarContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || user?.nombre?.charAt(0)?.toUpperCase() || 'C'}
              </Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={18} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        <Text style={styles.userName}>
          {user?.name || user?.nombre || 'Casa'} {user?.lastName || user?.apellido || 'Lai'}
        </Text>
        <Text style={styles.userEmail}>@{user?.username || user?.nombre_usuario || 'CasaLai'}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* RECUADRO 1: INFORMACIÓN PERSONAL */}
        <View style={styles.infoContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            {!isEditingPersonal && (
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditingPersonal(true)}>
                <Ionicons name="pencil" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

          {isEditingPersonal ? (
            <View style={styles.formGroup}>
              <View style={styles.inputBlock}>
                <Text style={styles.infoLabel}>Nombre de Usuario</Text>
                <TextInput
                  style={[styles.input, errorsPersonal.username && styles.inputError]}
                  value={username}
                  onChangeText={handleChangeUsername}
                  placeholder="Mínimo 4 caracteres"
                  autoCapitalize="none"
                />
                {errorsPersonal.username ? <Text style={styles.errorText}>{errorsPersonal.username}</Text> : null}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.infoLabel}>Nombres</Text>
                <TextInput
                  style={[styles.input, errorsPersonal.name && styles.inputError]}
                  value={name}
                  onChangeText={handleChangeName}
                  placeholder="2 primeros nombres"
                />
                {errorsPersonal.name ? <Text style={styles.errorText}>{errorsPersonal.name}</Text> : null}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.infoLabel}>Apellidos</Text>
                <TextInput
                  style={[styles.input, errorsPersonal.lastName && styles.inputError]}
                  value={lastName}
                  onChangeText={handleChangeLastName}
                  placeholder="2 primeros apellidos"
                />
                {errorsPersonal.lastName ? <Text style={styles.errorText}>{errorsPersonal.lastName}</Text> : null}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <TextInput
                  style={[styles.input, errorsPersonal.phone && styles.inputError]}
                  value={phone}
                  onChangeText={handleChangePhone}
                  keyboardType="numeric"
                  placeholder="Formato: 0400-000-0000"
                />
                {errorsPersonal.phone ? <Text style={styles.errorText}>{errorsPersonal.phone}</Text> : null}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.saveGreenButton} onPress={handleSavePersonal}>
                  <Ionicons name="save-outline" size={16} color={COLORS.white} style={styles.buttonIcon} />
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelGrayButton}
                  onPress={() => {
                    setUsername(user?.username || user?.nombre_usuario || '');
                    setName(user?.name || user?.nombre || '');
                    setLastName(user?.lastName || user?.apellido || '');
                    setPhone(user?.phone || user?.telefono || '');
                    setErrorsPersonal({});
                    setIsEditingPersonal(false);
                  }}
                >
                  <Ionicons name="close-outline" size={16} color={COLORS.white} style={styles.buttonIcon} />
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {renderUserField('Nombre de Usuario', username)}
              {renderUserField('Nombres', name)}
              {renderUserField('Apellidos', lastName)}
              {renderUserField('Teléfono', phone)}
              {renderUserField('Cédula', user?.cedula || '30456789')}
            </>
          )}
        </View>

        {/* RECUADRO 2: CONFIGURACIÓN DE CUENTA */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Configuración de Cuenta</Text>

          {/* CAMBIO DE CORREO */}
          <View style={styles.accountSubSection}>
            <View style={styles.fieldHeaderRow}>
              <Text style={styles.subSectionTitle}>Correo Electrónico</Text>
              {!isEditingEmail && (
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditingEmail(true)}>
                  <Ionicons name="pencil" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>

            {isEditingEmail ? (
              <View style={styles.formGroup}>
                <View style={styles.inputBlock}>
                  <Text style={styles.infoLabel}>Correo Actual</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={user?.email || user?.correo || 'diego0510lopez@gmail.com'}
                    editable={false}
                  />
                </View>

                <View style={styles.inputBlock}>
                  <Text style={styles.infoLabel}>Nuevo Correo</Text>
                  <TextInput
                    style={[styles.input, errorsEmail.newEmail && styles.inputError]}
                    value={newEmail}
                    onChangeText={handleChangeNewEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Formato: correo@gmail.com"
                  />
                  {errorsEmail.newEmail ? <Text style={styles.errorText}>{errorsEmail.newEmail}</Text> : null}
                </View>

                <View style={styles.inputBlock}>
                  <Text style={styles.infoLabel}>Contraseña Actual</Text>
                  <TextInput
                    style={[styles.input, errorsEmail.currentPasswordForEmail && styles.inputError]}
                    value={currentPasswordForEmail}
                    onChangeText={(t) => {
                      setCurrentPasswordForEmail(t);
                      setErrorsEmail((prev) => ({ ...prev, currentPasswordForEmail: '' }));
                    }}
                    secureTextEntry
                    placeholder="Ingresa tu contraseña para confirmar"
                  />
                  {errorsEmail.currentPasswordForEmail ? (
                    <Text style={styles.errorText}>{errorsEmail.currentPasswordForEmail}</Text>
                  ) : null}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.saveGreenButton} onPress={handleSaveEmail}>
                    <Ionicons name="mail-outline" size={16} color={COLORS.white} style={styles.buttonIcon} />
                    <Text style={styles.saveButtonText}>Actualizar Correo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelGrayButton}
                    onPress={() => {
                      setNewEmail('');
                      setCurrentPasswordForEmail('');
                      setErrorsEmail({});
                      setIsEditingEmail(false);
                    }}
                  >
                    <Ionicons name="close-outline" size={16} color={COLORS.white} style={styles.buttonIcon} />
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.fieldContainer}>
                <Text style={styles.infoValue}>{user?.email || user?.correo || 'diego0510lopez@gmail.com'}</Text>
              </View>
            )}
          </View>

          {/* CAMBIO DE CONTRASEÑA */}
          <View style={styles.accountSubSectionLast}>
            <View style={styles.fieldHeaderRow}>
              <Text style={styles.subSectionTitle}>Contraseña</Text>
              {!isEditingPassword && (
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditingPassword(true)}>
                  <Ionicons name="pencil" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>

            {isEditingPassword ? (
              <View style={styles.formGroup}>
                <View style={styles.inputBlock}>
                  <Text style={styles.infoLabel}>Contraseña Actual</Text>
                  <TextInput
                    style={[styles.input, errorsPassword.currentPassword && styles.inputError]}
                    value={currentPassword}
                    onChangeText={(t) => {
                      setCurrentPassword(t);
                      setErrorsPassword((prev) => ({ ...prev, currentPassword: '' }));
                    }}
                    secureTextEntry
                    placeholder="Ingresa tu contraseña actual"
                  />
                  {errorsPassword.currentPassword ? (
                    <Text style={styles.errorText}>{errorsPassword.currentPassword}</Text>
                  ) : null}
                </View>

                <View style={styles.inputBlock}>
                  <Text style={styles.infoLabel}>Nueva Contraseña</Text>
                  <TextInput
                    style={[styles.input, errorsPassword.newPassword && styles.inputError]}
                    value={newPassword}
                    onChangeText={handleChangeNewPassword}
                    secureTextEntry
                    placeholder="6-15 caracteres (May, Num, C.Especial) x1"
                  />
                  {errorsPassword.newPassword ? <Text style={styles.errorText}>{errorsPassword.newPassword}</Text> : null}
                </View>

                <View style={styles.inputBlock}>
                  <Text style={styles.infoLabel}>Confirmar Nueva Contraseña</Text>
                  <TextInput
                    style={[styles.input, errorsPassword.confirmPassword && styles.inputError]}
                    value={confirmPassword}
                    onChangeText={handleChangeConfirmPassword}
                    secureTextEntry
                    placeholder="Confirma tu nueva contraseña"
                  />
                  {errorsPassword.confirmPassword ? (
                    <Text style={styles.errorText}>{errorsPassword.confirmPassword}</Text>
                  ) : null}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.saveGreenButton} onPress={handleSavePassword}>
                    <Ionicons name="lock-closed-outline" size={16} color={COLORS.white} style={styles.buttonIcon} />
                    <Text style={styles.saveButtonText}>Actualizar Contraseña</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelGrayButton}
                    onPress={() => {
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setErrorsPassword({});
                      setIsEditingPassword(false);
                    }}
                  >
                    <Ionicons name="close-outline" size={16} color={COLORS.white} style={styles.buttonIcon} />
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.fieldContainer}>
                <Text style={styles.infoValue}>••••••••</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* MODAL CAMBIAR FOTO DE PERFIL */}
      <Modal
        visible={isPhotoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar Foto de Perfil</Text>
              <TouchableOpacity onPress={() => setIsPhotoModalVisible(false)}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary || '#666'} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalAvatarContainer}>
                {tempImage ? (
                  <Image source={{ uri: tempImage }} style={styles.modalAvatar} />
                ) : (
                  <View style={styles.modalAvatarPlaceholder}>
                    <Text style={styles.modalAvatarText}>
                      {user?.name?.charAt(0)?.toUpperCase() || user?.nombre?.charAt(0)?.toUpperCase() || 'C'}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.selectImageButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={18} color={COLORS.white} style={styles.buttonIcon} />
                <Text style={styles.selectImageButtonText}>Seleccionar Imagen</Text>
              </TouchableOpacity>

              <Text style={styles.modalSubtext}>
                Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 2MB
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.saveGreenButton} onPress={handleSavePhoto}>
                <Ionicons name="image-outline" size={16} color={COLORS.white} style={styles.buttonIcon} />
                <Text style={styles.saveButtonText}>Guardar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelGrayButton} onPress={() => setIsPhotoModalVisible(false)}>
                <Ionicons name="close-outline" size={16} color={COLORS.white} style={styles.buttonIcon} />
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...theme.shadow.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.md,
  },
  avatarText: {
    ...theme.typography.h1,
    color: COLORS.primary,
  },
  cameraIcon: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    ...theme.typography.h2,
    color: COLORS.white,
    marginBottom: 2,
    textAlign: 'center',
  },
  userEmail: {
    ...theme.typography.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: COLORS.white,
    borderRadius: theme.radius.lg,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    ...theme.shadow.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: COLORS.primary,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  infoItem: {
    marginBottom: theme.spacing.md,
  },
  fieldContainer: {
    backgroundColor: COLORS.background || '#F5F7FA',
    padding: theme.spacing.sm + 2,
    borderRadius: theme.radius.sm || 6,
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    ...theme.typography.body,
    color: COLORS.text,
  },
  formGroup: {
    marginTop: 4,
  },
  inputBlock: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border || '#DDD',
    borderRadius: theme.radius.sm || 6,
    padding: theme.spacing.sm,
    fontSize: 14,
    color: COLORS.text,
  },
  inputError: {
    borderColor: '#DC3545',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 11,
    marginTop: 3,
    fontStyle: 'italic',
  },
  disabledInput: {
    backgroundColor: '#E9ECEF',
    color: '#6C757D',
  },
  editButton: {
    padding: 6,
  },
  accountSubSection: {
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  accountSubSectionLast: {
    marginBottom: theme.spacing.sm,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  saveGreenButton: {
    flexDirection: 'row',
    backgroundColor: '#28A745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelGrayButton: {
    flexDirection: 'row',
    backgroundColor: '#6C757D',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: theme.spacing.lg,
    ...theme.shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalBody: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  modalAvatarContainer: {
    marginBottom: theme.spacing.md,
  },
  modalAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  modalAvatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalAvatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  selectImageButton: {
    flexDirection: 'row',
    backgroundColor: '#3182CE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectImageButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary || '#718096',
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});

export default ProfileScreen;