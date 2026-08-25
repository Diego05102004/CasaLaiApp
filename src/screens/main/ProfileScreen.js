import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { ImagePicker } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { user } = useSelector((state) => state.auth);
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
      setProfileImage(result.uri);
    }
  };

  const handleSaveChanges = () => {
    // Aquí iría la lógica para guardar los cambios
    setIsEditing(false);
    Alert.alert('¡Listo!', 'Tus cambios han sido guardados');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const renderUserField = (label, value, isEditable = false) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.fieldContainer}>
        <Text style={[styles.infoValue, isEditable && styles.editableField]}>{value || 'No disponible'}</Text>
        {isEditable && (
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color={COLORS.white} />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.userName}>
          {user?.name || 'Usuario'}
        </Text>
        <Text style={styles.userEmail}>{user?.email || 'usuario@ejemplo.com'}</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          {renderUserField('Nombre', user?.name, true)}
          {renderUserField('Apellido', user?.lastName || 'Pérez', true)}
          {renderUserField('Nombre de usuario', user?.username || 'usuario123', true)}
          {renderUserField('Correo electrónico', user?.email)}
          
          <TouchableOpacity 
            style={styles.changePasswordButton}
            onPress={handleChangePassword}
          >
            <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
            <Text style={styles.changePasswordText}>Cambiar contraseña</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {isEditing && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setIsEditing(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveChanges}
          >
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          </TouchableOpacity>
        </View>
      )}
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
    padding: theme.spacing.xl,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xxl : theme.spacing.xl,
    paddingBottom: theme.spacing.xxl + 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...theme.shadow.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.lg,
  },
  avatarText: {
    ...theme.typography.h1,
    color: COLORS.primary,
  },
  cameraIcon: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    ...theme.typography.h2,
    color: COLORS.white,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  userEmail: {
    ...theme.typography.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: -20,
    backgroundColor: COLORS.white,
    borderRadius: theme.radius.lg,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.sm,
    marginBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: COLORS.primary,
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoItem: {
    marginBottom: theme.spacing.lg,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    ...theme.typography.caption,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    ...theme.typography.body,
    color: COLORS.text,
    flex: 1,
  },
  editableField: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  editButton: {
    padding: 4,
    marginLeft: theme.spacing.sm,
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginTop: theme.spacing.md,
  },
  changePasswordText: {
    ...theme.typography.body,
    color: COLORS.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...theme.shadow.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginLeft: theme.spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...theme.typography.button,
    color: COLORS.text,
  },
  saveButtonText: {
    ...theme.typography.button,
    color: COLORS.white,
  },
});

export default ProfileScreen;
