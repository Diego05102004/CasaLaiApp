import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../redux/slices/cartSlice';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import { validateVenezuelaPhone, validatePaymentReference } from '../../utils/validation';
import { sanitizeForAPI } from '../../sanitization';

const banks = [
  { id: '0102', name: 'Banco de Venezuela' },
  { id: '0104', name: 'Venezolano de Crédito' },
  { id: '0105', name: 'Banco Mercantil' },
  { id: '0108', name: 'Banco Provincial' },
  { id: '0114', name: 'Bancaribe' },
  { id: '0115', name: 'Banco Exterior' },
  { id: '0116', name: 'Banco Occidental de Descuento' },
  { id: '0128', name: 'Banco Caroní' },
  { id: '0134', name: 'Banesco' },
  { id: '0137', name: 'Banco Sofitasa' },
  { id: '0138', name: 'Banco Plaza' },
  { id: '0146', name: 'Banco de la Gente Emprendedora' },
  { id: '0151', name: 'BFC Banco Fondo Común' },
  { id: '0156', name: '100% Banco' },
  { id: '0157', name: 'DelSur' },
  { id: '0163', name: 'Banco del Tesoro' },
  { id: '0166', name: 'Banco Agrícola de Venezuela' },
  { id: '0168', name: 'Bancrecer' },
  { id: '0169', name: 'Mi Banco' },
  { id: '0171', name: 'Banco Activo' },
  { id: '0172', name: 'Bancamiga' },
  { id: '0173', name: 'Banco Internacional de Desarrollo' },
  { id: '0174', name: 'Banplus' },
  { id: '0175', name: 'Banco Bicentenario' },
  { id: '0176', name: 'Banco de la Fuerza Armada Nacional Bolivariana' },
  { id: '0177', name: 'Banco de la Gente Emprendedora' },
  { id: '0190', name: 'Citibank' },
  { id: '0191', name: 'Banco Nacional de Crédito' },
];

const PaymentScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { total } = useSelector(state => state.cart);

  // Estados para los modales
  const [showBankInfoModal, setShowBankInfoModal] = useState(false);
  const [showMobilePaymentModal, setShowMobilePaymentModal] = useState(false);
  
  // Estados para el método de pago seleccionado
  const [selectedMethod, setSelectedMethod] = useState('');
  
  // Estados para el procesamiento
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para Pago Móvil
  const [phone, setPhone] = useState('');
  const [reference, setReference] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [referenceError, setReferenceError] = useState('');
  
  // Datos de la empresa
  const companyBankInfo = {
    mobilePayment: {
      bank: 'Banco de Venezuela',
      phone: '0412-1234567',
      ci: 'V-12345678',
      name: 'Tienda LAI C.A.'
    },
    bankTransfer: {
      bank: 'Banco de Venezuela',
      accountType: 'Corriente',
      accountNumber: '0102-1234-56789123456789',
      ci: 'V-12345678',
      name: 'Tienda LAI C.A.',
      email: 'pagos@tulaiservicios.com'
    }
  };

  const formatPhoneNumber = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limitar a 11 dígitos (código de área + número)
    const limited = cleaned.substring(0, 11);
    
    // Format as 0412-1234567 (4-7)
    let formatted = '';
    if (limited.length > 4) {
      formatted = `${limited.slice(0, 4)}-${limited.slice(4, 11)}`;
    } else {
      formatted = limited;
    }
    
    setPhone(limited); // Guardamos el número sin formato para procesamiento
    setPhoneError(''); // Limpiar error al escribir
  };

  const handlePaymentSuccess = () => {
    // Vaciar el carrito
    dispatch(clearCart());
    
    // Cerrar los modales
    setShowMobilePaymentModal(false);
    setShowBankInfoModal(false);
    
    // Mostrar mensaje de éxito con opciones
    Alert.alert(
      '✅ Pago Procesado',
      '¡Tu pedido ha sido registrado con éxito!\n\nNúmero de referencia: ' + 
      (reference || 'PM-' + Math.random().toString(36).substr(2, 8).toUpperCase()) + 
      '\n\n¡Gracias por tu compra!',
      [
        { 
          text: 'Aceptar',
          onPress: () => {
            navigation.popToTop();
          },
          style: 'default'
        }
      ],
      { cancelable: false }
    );
  };

  const handlePayment = () => {
    // Resetear errores
    setPhoneError('');
    setReferenceError('');

    // Validar teléfono
    if (!phone || phone.length === 0) {
      setPhoneError('El teléfono es requerido');
      return;
    }
    if (!validateVenezuelaPhone(phone)) {
      setPhoneError('Teléfono venezolano inválido (formato: 0412-1234567)');
      return;
    }

    // Validar referencia
    if (!reference || reference.length === 0) {
      setReferenceError('La referencia es requerida');
      return;
    }
    if (!validatePaymentReference(reference)) {
      setReferenceError('Referencia inválida (debe tener 6 dígitos)');
      return;
    }

    // Sanitizar datos antes de procesar
    const sanitizedData = sanitizeForAPI({
      phone,
      reference,
      selectedBank,
      total
    }, {
      phone: { type: 'phone' },
      reference: { type: 'reference' },
      selectedBank: { type: 'text' },
      total: { type: 'number' }
    });

    // Lógica de pago simplificada
    setIsProcessing(true);
    
    // Simular procesamiento
    setTimeout(() => {
      setIsProcessing(false);
      handlePaymentSuccess();
    }, 1500);
  };

  const renderPaymentMethods = () => (
    <View style={styles.paymentMethods}>
      <TouchableOpacity 
        style={styles.paymentMethod}
        onPress={() => {
          setSelectedMethod('mobile');
          setShowMobilePaymentModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.methodIconContainer}>
          <Ionicons 
            name="phone-portrait-outline" 
            size={24} 
            color={COLORS.primary} 
          />
        </View>
        <View style={styles.methodTextContainer}>
          <Text style={styles.paymentMethodText}>
            Pago Móvil
          </Text>
          <Text style={styles.methodDescription}>Paga con tu teléfono móvil</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.paymentMethod, { marginTop: 12 }]}
        onPress={() => {
          setSelectedMethod('bank');
          setShowBankInfoModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.methodIconContainer}>
          <Ionicons 
            name="card-outline" 
            size={24} 
            color={COLORS.primary} 
          />
        </View>
        <View style={styles.methodTextContainer}>
          <Text style={styles.paymentMethodText}>
            Ver Datos Bancarios
          </Text>
          <Text style={styles.methodDescription}>Consulta nuestros datos bancarios para transferencia</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const copyToClipboard = (text) => {
    // In a real app, you would use Clipboard from 'react-native'
    // For now, we'll just log it
    console.log('Copied to clipboard:', text);
    Alert.alert('Copiado', 'La información ha sido copiada al portapapeles');
  };

  const renderMobilePaymentModal = () => (
    <Modal
      visible={showMobilePaymentModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowMobilePaymentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bankModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.bankModalTitle}>Registrar Pago Móvil</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowMobilePaymentModal(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bankModalBody}>
            <View style={styles.bankAccountCard}>
              <View style={styles.bankHeader}>
                <Ionicons name="phone-portrait" size={20} color={COLORS.primary} />
                <Text style={styles.bankName}>Datos del Pago</Text>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Banco del que realiza el pago</Text>
                <View style={styles.selectContainer}>
                  <TouchableOpacity 
                    style={styles.selectWrapper}
                    onPress={() => setShowBankDropdown(!showBankDropdown)}
                  >
                    <Text 
                      style={[
                        styles.selectText, 
                        !selectedBank && { color: COLORS.textSecondary },
                        { flex: 1 }
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {banks.find(b => b.id === selectedBank)?.name || 'Selecciona tu banco'}
                    </Text>
                    <Ionicons 
                      name={showBankDropdown ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={COLORS.textSecondary} 
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>
                </View>
                
                {showBankDropdown && (
                  <View style={styles.dropdownContainer}>
                    <View style={styles.searchContainer}>
                      <Ionicons name="search" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar banco..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.textSecondary}
                      />
                      {searchQuery ? (
                        <TouchableOpacity 
                          style={styles.clearButton}
                          onPress={() => setSearchQuery('')}
                        >
                          <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    <ScrollView 
                      style={styles.dropdownScroll}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                    >
                      {banks
                        .filter(bank => 
                          bank.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((bank) => (
                          <TouchableOpacity
                            key={bank.id}
                            style={[
                              styles.dropdownItem,
                              selectedBank === bank.id && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              setSelectedBank(bank.id);
                              setShowBankDropdown(false);
                              setSearchQuery('');
                            }}
                          >
                            <Text 
                              style={[
                                styles.dropdownItemText,
                                selectedBank === bank.id && styles.dropdownItemTextSelected
                              ]}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {bank.name}
                            </Text>
                            {selectedBank === bank.id && (
                              <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                            )}
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Número de referencia (6 dígitos)</Text>
                <View style={[styles.inputContainer, referenceError && styles.inputContainerError]}>
                  <Ionicons name="receipt-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="123456"
                    keyboardType="number-pad"
                    value={reference}
                    onChangeText={(text) => {
                      // Limitar a 6 dígitos numéricos
                      const cleaned = text.replace(/[^0-9]/g, '').substring(0, 6);
                      setReference(cleaned);
                      setReferenceError('');
                    }}
                    maxLength={6}
                  />
                </View>
                {referenceError ? <Text style={styles.fieldErrorText}>{referenceError}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Número de teléfono</Text>
                <View style={[styles.inputContainer, phoneError && styles.inputContainerError]}>
                  <Ionicons name="phone-portrait-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="04121234567"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={formatPhoneNumber}
                    maxLength={12}
                  />
                </View>
                {phoneError ? <Text style={styles.fieldErrorText}>{phoneError}</Text> : null}
              </View>

              <View style={styles.noteContainer}>
                <Text style={styles.noteTitle}>Datos de Pago Móvil</Text>
                <View style={styles.infoGrid}>
                  <Text style={styles.infoLabel}>Banco:</Text>
                  <Text style={styles.infoValue}>Banco de Venezuela</Text>
                  
                  <Text style={styles.infoLabel}>Teléfono:</Text>
                  <TouchableOpacity onPress={() => copyToClipboard('04121234567')}>
                    <Text style={styles.infoValueLink}>0412-1234567</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.infoLabel}>C.I.:</Text>
                  <Text style={styles.infoValue}>V-12345678</Text>
                  
                  <Text style={styles.infoLabel}>Nombre:</Text>
                  <Text style={styles.infoValue}>Tienda LAI C.A.</Text>
                </View>
              </View>

              <View style={styles.noteContainer}>
                <Text style={styles.noteTitle}>Nota Importante</Text>
                <Text style={styles.noteText}>
                  Por favor, asegúrate de que los datos ingresados sean correctos. El número de referencia debe coincidir exactamente con el que aparece en tu comprobante de pago.
                </Text>
              </View>

              <TouchableOpacity 
                style={[
                  styles.payButton, 
                  (isProcessing || !selectedBank || !reference || reference.length < 6 || !phone) && styles.payButtonDisabled
                ]}
                onPress={handlePayment}
                disabled={isProcessing || !selectedBank || !reference || reference.length < 6 || !phone}
              >
                <Text style={styles.payButtonText}>
                  {isProcessing ? 'Procesando...' : 'Registrar Pago'}
                </Text>
                {!isProcessing && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} style={styles.payButtonIcon} />
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderBankInfoModal = () => (
    <Modal
      visible={showBankInfoModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowBankInfoModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bankModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.bankModalTitle}>Datos Bancarios</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowBankInfoModal(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bankModalBody}>
            {/* Banesco Account */}
            <View style={styles.bankAccountCard}>
              <View style={styles.bankHeader}>
                <Ionicons name="business" size={20} color={COLORS.primary} />
                <Text style={styles.bankName}>Banesco</Text>
              </View>
              
              <View style={styles.infoGrid}>
                <Text style={styles.infoLabel}>Número de Cuenta:</Text>
                <TouchableOpacity onPress={() => copyToClipboard('0134567890123456')}>
                  <Text style={styles.infoValueLink}>0134-5678-9012-3456</Text>
                </TouchableOpacity>
                
                <Text style={styles.infoLabel}>Titular:</Text>
                <Text style={styles.infoValue}>Casa Lai C.A.</Text>
                
                <Text style={styles.infoLabel}>J-RIF:</Text>
                <Text style={styles.infoValue}>J-12345678-9</Text>
                
                <Text style={styles.infoLabel}>Teléfono:</Text>
                <Text style={styles.infoValue}>0412-1234567</Text>
                
                <Text style={styles.infoLabel}>Correo:</Text>
                <Text style={styles.infoValue}>pagos@casalai.com</Text>
              </View>
            </View>

            {/* Mercantil Account */}
            <View style={[styles.bankAccountCard, {marginTop: 16}]}>
              <View style={styles.bankHeader}>
                <Ionicons name="business" size={20} color={COLORS.primary} />
                <Text style={styles.bankName}>Mercantil</Text>
              </View>
              
              <View style={styles.infoGrid}>
                <Text style={styles.infoLabel}>Tipo de Cuenta:</Text>
                <Text style={styles.infoValue}>Cuenta Corriente</Text>
                
                <Text style={styles.infoLabel}>Número de Cuenta:</Text>
                <TouchableOpacity onPress={() => copyToClipboard('0105678901234567')}>
                  <Text style={styles.infoValueLink}>0105-6789-0123-4567</Text>
                </TouchableOpacity>
                
                <Text style={styles.infoLabel}>Titular:</Text>
                <Text style={styles.infoValue}>Casa Lai C.A.</Text>
                
                <Text style={styles.infoLabel}>J-RIF:</Text>
                <Text style={styles.infoValue}>J-12345678-9</Text>
                
                <Text style={styles.infoLabel}>Teléfono:</Text>
                <Text style={styles.infoValue}>0412-1234567</Text>
                
                <Text style={styles.infoLabel}>Correo:</Text>
                <Text style={styles.infoValue}>pagos@casalai.com</Text>
              </View>
            </View>

            {/* Note Section */}
            <View style={styles.noteContainer}>
              <Text style={styles.noteTitle}>Nota:</Text>
              <Text style={styles.noteText}>
                Por favor, envíe el comprobante de pago al número de WhatsApp o correo electrónico indicado para confirmar su transacción.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Métodos de Pago</Text>
        
        {renderPaymentMethods()}
        
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen del Pago</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.payButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.payButton,
              isProcessing && styles.payButtonDisabled
            ]} 
            disabled={isProcessing}
            onPress={handlePayment}
            activeOpacity={0.9}
          >
            <Text style={styles.payButtonText}>
              {isProcessing ? 'Procesando...' : `Pagar $${total.toFixed(2)}`}
            </Text>
            {!isProcessing && (
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={styles.payButtonIcon} />
            )}
          </TouchableOpacity>
          <Text style={styles.securePaymentText}>
            <Ionicons name="lock-closed" size={14} color={COLORS.textSecondary} /> Pago seguro
          </Text>
        </View>
      </ScrollView>
      
      {renderBankInfoModal()}
      {renderMobilePaymentModal()}
      
      {/* Overlay for dropdown */}
      {showBankDropdown && (
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowBankDropdown(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    paddingBottom: 30,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  title: {
    ...theme.typography.h4,
    marginBottom: 24,
    color: COLORS.text,
  },
  paymentMethods: {
    marginBottom: 24,
    gap: 16,
    padding: 4,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: 88,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodDescription: {
    ...theme.typography.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  paymentMethodText: {
    ...theme.typography.subtitle,
    color: COLORS.text,
    fontSize: 16,
  },
  summary: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...theme.shadow.sm,
  },
  summaryTitle: {
    ...theme.typography.subtitle,
    marginBottom: 12,
    color: COLORS.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryLabel: {
    ...theme.typography.body2,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    ...theme.typography.body2,
    color: COLORS.text,
  },
  totalLabel: {
    ...theme.typography.subtitle,
    color: COLORS.text,
    fontWeight: '600',
  },
  totalAmount: {
    ...theme.typography.h6,
    color: COLORS.primary,
    fontWeight: '700',
  },
  payButtonContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...theme.shadow.sm,
  },
  payButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  payButtonText: {
    ...theme.typography.button,
    color: COLORS.white,
    marginRight: 8,
  },
  payButtonIcon: {
    marginLeft: 4,
  },
  securePaymentText: {
    ...theme.typography.caption,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bankModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bankModalTitle: {
    ...theme.typography.h5,
    color: COLORS.text,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  bankModalBody: {
    padding: 20,
    maxHeight: '80%',
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...theme.typography.caption,
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputContainerError: {
    borderColor: COLORS.danger,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    ...theme.typography.body2,
    color: COLORS.text,
  },
  fieldErrorText: {
    ...theme.typography.caption,
    color: COLORS.danger,
    marginTop: 4,
    marginLeft: 4,
  },
  selectContainer: {
    marginBottom: 8,
    position: 'relative',
    zIndex: 10,
  },
  dropdownContainer: {
    width: '100%',
    maxHeight: 250,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
    marginBottom: 16,
    ...theme.shadow.sm,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body2,
    color: COLORS.text,
    padding: 0,
    margin: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  dropdownItem: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    minHeight: 48,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
  },
  dropdownItemText: {
    ...theme.typography.body2,
    color: COLORS.text,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  selectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48,
  },
  selectText: {
    ...theme.typography.body2,
    color: COLORS.text,
    flex: 1,
  },
  bankAccountCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...theme.shadow.sm,
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankName: {
    ...theme.typography.subtitle,
    color: COLORS.text,
    marginLeft: 8,
    fontWeight: '600',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: COLORS.textSecondary,
  },
  infoValue: {
    ...theme.typography.body2,
    color: COLORS.text,
  },
  infoValueLink: {
    ...theme.typography.body2,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  noteContainer: {
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  noteTitle: {
    ...theme.typography.subtitle2,
    color: COLORS.primary,
    marginBottom: 4,
    fontWeight: '600',
  },
  noteText: {
    ...theme.typography.body2,
    color: COLORS.text,
  },
});

export default PaymentScreen;
