import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert, ScrollView, TextInput, Modal } from 'react-native';
import { useSelector } from 'react-redux';
import { ImagePicker } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { user } = useSelector((state) => state.auth);
  const navigation = useNavigation();

  // Estados para foto de perfil y modal
  const [profileImage, setProfileImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);

  // Estados de edición para cada recuadro/sección
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Campos Información Personal
  const [username, setUsername] = useState(user?.username || user?.nombre_usuario || '');
  const [name, setName] = useState(user?.name || user?.nombre || '');
  const [lastName, setLastName] = useState(user?.lastName || user?.apellido || '');
  const [phone, setPhone] = useState(user?.phone || user?.telefono || '');

  // Campos Cambio de Correo
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');

  // Campos Cambio de Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || user.nombre_usuario || '');
      setName(user.name || user.nombre || '');
      setLastName(user.lastName || user.apellido || '');
      setPhone(user.phone || user.telefono || '');
    }
  }, [user]);

  // Abrir Modal de Cambio de Foto
  const handleOpenPhotoModal = () => {
    setTempImage(profileImage);
    setIsPhotoModalVisible(true);
  };

  // Seleccionar foto desde la galería
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto de perfil');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.cancelled) {
      setTempImage(result.uri);
    }
  };

  // Guardar Foto de Perfil
  const handleSavePhoto = () => {
    setProfileImage(tempImage);
    setIsPhotoModalVisible(false);
    Alert.alert('¡Listo!', 'Foto de perfil actualizada correctamente');
  };

  const handleSavePersonal = () => {
    setIsEditingPersonal(false);
    Alert.alert('¡Listo!', 'Tus datos personales han sido actualizados');
  };

  const handleSaveEmail = () => {
    if (!newEmail || !currentPasswordForEmail) {
      Alert.alert('Error', 'Por favor completa todos los campos del correo');
      return;
    }
    setIsEditingEmail(false);
    setNewEmail('');
    setCurrentPasswordForEmail('');
    Alert.alert('¡Listo!', 'Tu correo electrónico ha sido actualizado');
  };

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos de contraseña');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    setIsEditingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert('¡Listo!', 'Tu contraseña ha sido actualizada');
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
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setIsEditingPersonal(true)}
              >
                <Ionicons name="pencil" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

          {isEditingPersonal ? (
            <View style={styles.formGroup}>
              <View style={styles.inputBlock}>
                <Text style={styles.infoLabel}>Nombre de Usuario</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="CasaLai"
                />
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.infoLabel}>Nombres</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Casa"
                />
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.infoLabel}>Apellidos</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Lai"
                />
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="0414-575-3363"
                />
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.saveGreenButton}
                  onPress={handleSavePersonal}
                >
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
          
          {/* SECCIÓN DE CORREO ELECTRÓNICO */}
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
                    style={styles.input}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Formato: correo@gmail.com"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputBlock}>
                  <Text style={styles.infoLabel}>Contraseña Actual</Text>
                  <TextInput
                    style={styles.input}
                    value={currentPasswordForEmail}
                    onChangeText={setCurrentPasswordForEmail}
                    secureTextEntry
                    placeholder="Ingresa tu contraseña para confirmar"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.saveGreenButton}
                    onPress={handleSaveEmail}
                  >
                    <Ionicons name="mail-outline" size={16} color={COLORS.white} style={styles.buttonIcon} />
                    <Text style={styles.saveButtonText}>Actualizar Correo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelGrayButton}
                    onPress={() => {
                      setNewEmail('');
                      setCurrentPasswordForEmail('');
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

          {/* SECCIÓN DE CONTRASEÑA */}
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
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                    placeholder="Ingresa tu contraseña actual"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputBlock}>
                  <Text style={styles.infoLabel}>Nueva Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholder="6-15 caracteres (May, Num, C.Especial) x1"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputBlock}>
                  <Text style={styles.infoLabel}>Confirmar Nueva Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="Confirma tu nueva contraseña"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.saveGreenButton}
                    onPress={handleSavePassword}
                  >
                    <Ionicons name="lock-closed-outline" size={16} color={COLORS.white} style={styles.buttonIcon} />
                    <Text style={styles.saveButtonText}>Actualizar Contraseña</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelGrayButton}
                    onPress={() => {
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
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
  // ESTILOS MODAL FOTO
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