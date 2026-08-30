import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import COLORS from '../../constants/colors';
import { InvocarMetodo } from '../../utils/comunicadorApi';

const PAYMENT_METHOD_ORDER = ['Pago Movil', 'Transferencia', 'Zelle'];

const formatCurrency = (value) => {
  const numericValue = Number(value || 0);

  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
  }).format(numericValue);
};

const normalizeAccounts = (payload) => {
  if (!payload) return [];

  let rawList = [];

  if (Array.isArray(payload)) rawList = payload;
  else if (Array.isArray(payload?.data)) rawList = payload.data;
  else if (Array.isArray(payload?.data?.cuentas)) rawList = payload.data.cuentas;
  else if (Array.isArray(payload?.cuentas)) rawList = payload.cuentas;
  else if (Array.isArray(payload?.data?.data?.cuentas)) rawList = payload.data.data.cuentas;

  return rawList
    .map((item) => {
      const metodos = typeof item.metodos === 'string'
        ? item.metodos.split(',').map((method) => method.trim()).filter(Boolean)
        : Array.isArray(item.metodos)
          ? item.metodos.filter(Boolean)
          : [];

      return {
        id_cuenta: item.id_cuenta ?? item.id ?? `${item.nombre_banco ?? 'cuenta'}-${item.numero_cuenta ?? Math.random()}`,
        nombre_banco: item.nombre_banco ?? 'Cuenta bancaria',
        numero_cuenta: item.numero_cuenta ?? '',
        rif_cuenta: item.rif_cuenta ?? '',
        telefono_cuenta: item.telefono_cuenta ?? '',
        correo_cuenta: item.correo_cuenta ?? '',
        metodos,
        estado: String(item.estado ?? 'habilitado').toLowerCase(),
      };
    })
    .filter((item) => item.estado === 'habilitado');
};

const buildMethodMap = (accounts) => {
  const grouped = {};

  PAYMENT_METHOD_ORDER.forEach((method) => {
    grouped[method] = [];
  });

  accounts.forEach((account) => {
    const methods = Array.isArray(account.metodos) && account.metodos.length
      ? account.metodos
      : ['Transferencia'];

    methods.forEach((method) => {
      if (!PAYMENT_METHOD_ORDER.includes(method)) {
        return;
      }

      if (!grouped[method]) {
        grouped[method] = [];
      }
      grouped[method].push(account);
    });
  });

  return grouped;
};

const getPaymentFormFields = (method, cuenta, total) => {
  const baseAmount = Number(total || 0);

  switch (method) {
    case 'Pago Movil':
      return [
        { key: 'referencia', label: 'Referencia', placeholder: 'Ej. 123456', keyboardType: 'number-pad', maxLength: 20 },
        { key: 'telefono', label: 'Teléfono del pagador', placeholder: cuenta?.telefono_cuenta || '0412-1234567', keyboardType: 'phone-pad' },
        { key: 'monto', label: 'Monto pagado', placeholder: String(baseAmount.toFixed(2)), keyboardType: 'decimal-pad' },
      ];
    case 'Transferencia':
      return [
        { key: 'banco_origen', label: 'Banco de origen', placeholder: 'Ej. Banesco', keyboardType: 'default' },
        { key: 'referencia', label: 'Referencia o número de operación', placeholder: 'Ej. 255487', keyboardType: 'default' },
        { key: 'monto', label: 'Monto transferido', placeholder: String(baseAmount.toFixed(2)), keyboardType: 'decimal-pad' },
      ];
    case 'Zelle':
      return [
        { key: 'remitente', label: 'Nombre del remitente', placeholder: 'Ej. Ana García', keyboardType: 'default' },
        { key: 'contacto', label: 'Correo o teléfono del remitente', placeholder: 'correo@ejemplo.com', keyboardType: 'default' },
        { key: 'referencia', label: 'Referencia', placeholder: 'Ej. Z-4582', keyboardType: 'default' },
        { key: 'monto', label: 'Monto enviado', placeholder: String(baseAmount.toFixed(2)), keyboardType: 'decimal-pad' },
      ];
    default:
      return [];
  }
};

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const pedido = route.params?.pedido || null;

  const [cuentas, setCuentas] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedCuenta, setSelectedCuenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSuccessVisible, setPaymentSuccessVisible] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    referencia: '',
    monto: '',
    telefono: '',
    banco_origen: '',
    remitente: '',
    contacto: '',
    comprobante: '',
    comprobanteName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methodGroups = useMemo(() => buildMethodMap(cuentas), [cuentas]);
  const availableMethods = PAYMENT_METHOD_ORDER.filter((method) => (methodGroups[method]?.length || 0) > 0);
  const paymentFormFields = useMemo(() => getPaymentFormFields(selectedMethod, selectedCuenta, pedido?.total || pedido?.monto || 0), [selectedMethod, selectedCuenta, pedido]);

  useEffect(() => {
    const obtenerCuentas = async () => {
      try {
        setLoading(true);
        const response = await InvocarMetodo('cuentas.php', 'default', {});
        const data = normalizeAccounts(response);
        setCuentas(data);

        if (data.length > 0) {
          const firstMethod = availableMethods[0] || 'Transferencia';
          setSelectedMethod(firstMethod);
          setSelectedCuenta(data.find((cuenta) => cuenta.metodos.includes(firstMethod)) || data[0]);
        }
      } catch (error) {
        console.error('[Payment] Error al cargar cuentas:', error);
        Alert.alert('No se pudieron cargar las cuentas', error?.message || 'Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    obtenerCuentas();
  }, []);

  useEffect(() => {
    if (!selectedMethod && availableMethods.length > 0) {
      setSelectedMethod(availableMethods[0]);
    }
  }, [availableMethods, selectedMethod]);

  useEffect(() => {
    if (!selectedMethod) return;

    const candidates = methodGroups[selectedMethod] || [];
    if (!selectedCuenta || !candidates.some((cuenta) => cuenta.id_cuenta === selectedCuenta.id_cuenta)) {
      setSelectedCuenta(candidates[0] || null);
    }
  }, [selectedMethod, methodGroups, selectedCuenta]);

  const resetPaymentForm = () => {
    const defaultAmount = String((pedido?.total || pedido?.monto || 0).toFixed(2));

    setPaymentForm({
      referencia: '',
      monto: defaultAmount,
      telefono: selectedCuenta?.telefono_cuenta || '',
      banco_origen: '',
      remitente: '',
      contacto: '',
      comprobante: '',
      comprobanteName: '',
    });
  };

  const navigateToPedidos = () => {
    try {
      navigation.navigate('Main', { screen: 'Pedidos' });
    } catch (error) {
      try {
        navigation.navigate('Pedidos');
      } catch (navError) {
        navigation.goBack();
      }
    }
  };

  const handleConfirmPayment = () => {
    if (!selectedMethod || !selectedCuenta) {
      Alert.alert('Seleccione un método y una cuenta');
      return;
    }

    resetPaymentForm();
    setShowPaymentForm(true);
  };

  const handlePickComprobante = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Necesitas permitir acceso a la galería para adjuntar el comprobante.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        return;
      }

      setPaymentForm((previous) => ({
        ...previous,
        comprobante: asset.uri,
        comprobanteName: asset.fileName || 'comprobante.jpg',
      }));
    } catch (error) {
      Alert.alert('No se pudo adjuntar el comprobante', error?.message || 'Intenta nuevamente.');
    }
  };

  const handleSubmitPaymentForm = async () => {
    if (!selectedMethod || !selectedCuenta) {
      Alert.alert('Debe seleccionar un método de pago antes de enviar el comprobante.');
      return;
    }

    const trimmedReference = (paymentForm.referencia || '').trim();
    const trimmedMonto = (paymentForm.monto || '').trim();

    if (!trimmedReference) {
      Alert.alert('Falta la referencia', 'Debes indicar la referencia o número de operación del pago.');
      return;
    }

    if (!trimmedMonto) {
      Alert.alert('Falta el monto', 'Debes indicar el monto pagado.');
      return;
    }

    if (!paymentForm.comprobante) {
      Alert.alert('Falta el comprobante', 'Adjunta la imagen del comprobante para registrar el pago.');
      return;
    }

    const facturaId = pedido?.id_factura ?? pedido?.id ?? pedido?.numero ?? null;
    const cuentaId = selectedCuenta?.id_cuenta ?? null;

    if (!facturaId || !cuentaId) {
      Alert.alert('Datos incompletos', 'No se pudo identificar la factura o la cuenta para registrar el pago.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      funcion: 'pago_ingresar',
      factura: Number(facturaId),
      cuenta: Number(cuentaId),
      tipo: selectedMethod,
      monto: Number(trimmedMonto),
      referencia: trimmedReference,
      comprobante: paymentForm.comprobanteName || paymentForm.comprobante,
      fecha: new Date().toISOString().slice(0, 10),
      observaciones: '',
    };

    console.log('[Payment] Registrando pago en backend:', payload);

    try {
      const response = await InvocarMetodo('pagos.php', 'pago_ingresar', payload);
      const nestedData = response && typeof response === 'object' && response.data && typeof response.data === 'object' ? response.data : response;
      const successStatus =
        response?.status === 'success' ||
        nestedData?.status === 'success' ||
        response?.success === true ||
        nestedData?.success === true ||
        !!(nestedData?.pago_id || nestedData?.factura_id || nestedData?.id_detalles);

      if (!successStatus) {
        throw new Error(response?.message || nestedData?.message || 'La API rechazó el registro del pago.');
      }

      setShowPaymentForm(false);
      setIsSubmitting(false);
      const successText = response?.message || nestedData?.message || 'El pago fue registrado de forma exitosa, solo debe esperar a que sea verificado por el administrador.';
      setPaymentSuccessMessage(successText === 'Operación exitosa' ? 'El pago fue registrado de forma exitosa, solo debe esperar a que sea verificado por el administrador.' : successText);
      setPaymentSuccessVisible(true);
    } catch (error) {
      console.error('[Payment] Error registrando pago:', error);
      setIsSubmitting(false);
      Alert.alert(
        'No se pudo registrar el pago',
        error?.message || 'Revisa la referencia, el monto o la información del comprobante e intenta de nuevo.'
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando métodos de pago...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.orderCard}>
          <Text style={styles.sectionTitle}>Pedido seleccionado</Text>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Factura</Text>
            <Text style={styles.orderValue}>{pedido?.numero || pedido?.numero_factura || 'Sin número'}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Estado</Text>
            <Text style={styles.orderValue}>{pedido?.estado || 'Borrador'}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Total</Text>
            <Text style={styles.orderValue}>{formatCurrency(pedido?.total || pedido?.monto || 0)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Elige un método de pago</Text>
        <View style={styles.methodList}>
          {availableMethods.length === 0 ? (
            <Text style={styles.emptyMethods}>No hay cuentas habilitadas para pagar en este momento.</Text>
          ) : (
            availableMethods.map((method) => (
              <TouchableOpacity
                key={method}
                style={[styles.methodButton, selectedMethod === method && styles.methodButtonSelected]}
                onPress={() => setSelectedMethod(method)}
              >
                <Text style={[styles.methodButtonText, selectedMethod === method && styles.methodButtonTextSelected]}>{method}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {selectedMethod && methodGroups[selectedMethod]?.length > 0 && (
          <View style={styles.accountList}>
            <Text style={styles.sectionTitle}>Cuentas disponibles</Text>
            {methodGroups[selectedMethod].map((cuenta) => (
              <TouchableOpacity
                key={cuenta.id_cuenta}
                style={[styles.accountCard, selectedCuenta?.id_cuenta === cuenta.id_cuenta && styles.accountCardSelected]}
                onPress={() => setSelectedCuenta(cuenta)}
              >
                <View style={styles.accountHeader}>
                  <Ionicons name="card-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.accountName}>{cuenta.nombre_banco}</Text>
                </View>

                {cuenta.numero_cuenta ? (
                  <Text style={styles.accountInfo}>Cuenta: {cuenta.numero_cuenta}</Text>
                ) : null}

                {cuenta.telefono_cuenta ? (
                  <Text style={styles.accountInfo}>Teléfono: {cuenta.telefono_cuenta}</Text>
                ) : null}

                {cuenta.correo_cuenta ? (
                  <Text style={styles.accountInfo}>Correo: {cuenta.correo_cuenta}</Text>
                ) : null}

                {cuenta.rif_cuenta ? (
                  <Text style={styles.accountInfo}>RIF: {cuenta.rif_cuenta}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedCuenta && (
          <View style={styles.paymentSummaryCard}>
            <Text style={styles.sectionTitle}>Resumen para pagar</Text>
            <Text style={styles.summaryText}>Método: {selectedMethod}</Text>
            <Text style={styles.summaryText}>Banco: {selectedCuenta.nombre_banco}</Text>
            {selectedCuenta.numero_cuenta ? <Text style={styles.summaryText}>Número: {selectedCuenta.numero_cuenta}</Text> : null}
            {selectedCuenta.telefono_cuenta ? <Text style={styles.summaryText}>Teléfono: {selectedCuenta.telefono_cuenta}</Text> : null}
            {selectedCuenta.correo_cuenta ? <Text style={styles.summaryText}>Correo: {selectedCuenta.correo_cuenta}</Text> : null}
            <Text style={styles.summaryText}>Monto a pagar: {formatCurrency(pedido?.total || pedido?.monto || 0)}</Text>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
              <Text style={styles.confirmButtonText}>Confirmar pago</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={showPaymentForm} transparent animationType="slide" onRequestClose={() => setShowPaymentForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.paymentFormContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Registrar {selectedMethod}</Text>
              <TouchableOpacity onPress={() => setShowPaymentForm(false)}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
              {paymentFormFields.map((field) => (
                <View key={field.key} style={styles.formField}>
                  <Text style={styles.formLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.formInput}
                    value={paymentForm[field.key]}
                    onChangeText={(value) => setPaymentForm((previous) => ({ ...previous, [field.key]: value }))}
                    placeholder={field.placeholder}
                    keyboardType={field.keyboardType || 'default'}
                    maxLength={field.maxLength || 200}
                  />
                </View>
              ))}

              <TouchableOpacity style={styles.uploadButton} onPress={handlePickComprobante}>
                <Ionicons name="image-outline" size={18} color={COLORS.primary} />
                <Text style={styles.uploadButtonText}>
                  {paymentForm.comprobanteName ? paymentForm.comprobanteName : 'Adjuntar comprobante'}
                </Text>
              </TouchableOpacity>

              {paymentForm.comprobante ? (
                <Image source={{ uri: paymentForm.comprobante }} style={styles.comprobantePreview} resizeMode="cover" />
              ) : null}

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitPaymentForm} disabled={isSubmitting}>
                <Text style={styles.submitButtonText}>{isSubmitting ? 'Enviando...' : 'Enviar pago'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={paymentSuccessVisible}
        onRequestClose={() => {
          setPaymentSuccessVisible(false);
          navigateToPedidos();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalCard}>
            <Ionicons name="checkmark-circle" size={52} color={COLORS.success || '#22c55e'} />
            <Text style={styles.successTitle}>Pago registrado</Text>
            <Text style={styles.successText}>{paymentSuccessMessage}</Text>

            <TouchableOpacity
              style={styles.successPrimaryButton}
              onPress={() => {
                setPaymentSuccessVisible(false);
                navigateToPedidos();
              }}
            >
              <Text style={styles.successPrimaryText}>Ver pedidos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  orderValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  methodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  methodButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  methodButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  methodButtonText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 13,
  },
  methodButtonTextSelected: {
    color: '#fff',
  },
  emptyMethods: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  accountList: {
    marginBottom: 18,
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  accountCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F5F9FF',
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountName: {
    marginLeft: 8,
    fontWeight: '700',
    color: COLORS.text,
    fontSize: 15,
  },
  accountInfo: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  paymentSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryText: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 6,
  },
  confirmButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  successModalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    marginHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  successTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  successText: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  successPrimaryButton: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: '100%',
    alignItems: 'center',
  },
  successPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  paymentFormContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  formContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 14,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
    backgroundColor: '#EEF4FF',
  },
  uploadButtonText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontWeight: '600',
    flexShrink: 1,
  },
  comprobantePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default PaymentScreen;
