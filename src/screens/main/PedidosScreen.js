import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import COLORS from '../../constants/colors';
import { API_BASE_URL } from '../../config/apiConfig';
import { InvocarMetodo } from '../../utils/comunicadorApi';

const formatCurrency = (value) => {
  const numericValue = Number(value || 0);

  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
  }).format(numericValue);
};

const formatDate = (value) => {
  if (!value) return 'Sin fecha';

  try {
    const date = new Date(value);
    return date.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    return String(value);
  }
};

const getStatusColor = (status) => {
  const normalizedStatus = String(status || '').toLowerCase();

  if (normalizedStatus.includes('pend')) return '#F5B700';
  if (normalizedStatus.includes('cancel')) return '#D9534F';
  if (normalizedStatus.includes('entreg')) return '#2E9E5D';
  if (normalizedStatus.includes('proces') || normalizedStatus.includes('aprob')) return '#3B82F6';

  return '#6B7280';
};

const stripHtml = (value = '') => {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

const extractPedidosDesdeHtml = (html = '') => {
  if (typeof html !== 'string' || !html.includes('Pedido #')) {
    return [];
  }

  const lista = [];
  const regex = /<button[^>]*>\s*Pedido\s*#(\d+)\s*-\s*Fecha:\s*([^<]+?)\s*<\/button>[\s\S]*?<p>\s*<strong>Cliente:<\/strong>\s*([^|]+?)\s*\|\s*<strong>Cédula:<\/strong>\s*([^<]+?)\s*\|\s*<strong>Teléfono:<\/strong>\s*([^<]+?)\s*\|\s*<strong>Dirección:<\/strong>\s*([^<]+?)\s*\|\s*<strong>Descuento:<\/strong>\s*([^<]+?)\s*\|\s*<strong>Estatus:<\/strong>\s*(?:<span[^>]*>(.*?)<\/span>|([^<]+?))\s*<\/p>[\s\S]*?<td\s*colspan="4"\s*>\s*<strong>Total\s+con\s+Impuestos:<\/strong>\s*<\/td>\s*<td>\s*([\d.,]+)\s*BS\s*<\/td>/gi;

  let match;
  while ((match = regex.exec(html)) !== null) {
    const [, idFactura, fecha, cliente, cedula, telefono, direccion, descuento, estatusSpan, estatusPlain, total] = match;

    const pedido = {
      id_factura: Number(idFactura),
      numero_factura: `#${idFactura}`,
      fecha: fecha.trim(),
      total: Number(String(total).replace('.', '').replace(',', '.').trim() || 0),
      estado: stripHtml(estatusSpan || estatusPlain || 'Borrador').trim() || 'Borrador',
      metodo: 'Sin método',
      cliente: stripHtml(cliente).trim() || 'Cliente',
      cedula: stripHtml(cedula).trim() || '',
      telefono: stripHtml(telefono).trim() || '',
      direccion: stripHtml(direccion).trim() || '',
      descuento: stripHtml(descuento).trim() || '0%',
    };

    lista.push(pedido);
  }

  return lista;
};

const normalizePedido = (item = {}) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const estado = item.estado ?? item.status ?? item.estatus ?? 'Borrador';
  const cliente = item.cliente && typeof item.cliente === 'object'
    ? item.cliente.nombre ?? 'Cliente'
    : item.cliente ?? item.nombre_cliente ?? item.nombre ?? 'Cliente';

  return {
    id: item.id_factura ?? item.id ?? item.numero_factura ?? `${Date.now()}-${Math.random()}`,
    numero: item.numero_factura ?? item.numero ?? item.codigo ?? `FAC-${item.id_factura ?? ''}`,
    fecha: item.fecha ?? item.fecha_emision ?? item.created_at ?? new Date().toISOString(),
    total: Number(item.total ?? item.monto_total ?? item.monto ?? 0),
    estado: String(estado),
    metodo: item.metodo_pago ?? item.forma_pago ?? item.metodo ?? 'Sin método',
    cliente,
    items: Array.isArray(item.items) ? item.items : (Array.isArray(item.detalles) ? item.detalles : []),
    acciones: item.acciones ?? {
      pagar: String(estado).toLowerCase().includes('borrador'),
      esperar_pago: String(estado).toLowerCase().includes('proceso'),
      descargar_factura: [
        'pagado',
        'pago procesado',
        'pago-procesado',
        'procesado',
      ].some((keyword) => String(estado).toLowerCase().includes(keyword)),
    },
    mensaje: item.mensaje ?? 'Pedido registrado.',
  };
};

const isFacturaDescargable = (estado = '') => {
  const normalized = String(estado || '').trim().toLowerCase();

  return normalized === 'pago procesado' || normalized === 'pago-procesado';
};

const extractFacturasFromResponse = (payload) => {
  if (!payload) return [];

  if (Array.isArray(payload)) return payload;

  const possibleCandidates = [
    payload?.data?.data?.facturas,
    payload?.data?.facturas,
    payload?.facturas,
    payload?.data?.data?.pedidos,
    payload?.data?.pedidos,
    payload?.pedidos,
  ];

  for (const candidate of possibleCandidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  const nestedData = payload?.data && typeof payload.data === 'object' ? payload.data : null;
  if (nestedData && nestedData.data && Array.isArray(nestedData.data.facturas)) {
    return nestedData.data.facturas;
  }

  if (typeof payload?.mensaje === 'string' && payload.mensaje.includes('Pedido #')) {
    return extractPedidosDesdeHtml(payload.mensaje);
  }

  return [];
};

const PedidoCard = ({ pedido, onPress, onDownload }) => {
  const estado = String(pedido.estado || '').toLowerCase();
  const canDownload = isFacturaDescargable(pedido.estado);

  let actionLabel = 'Descargar';
  let actionStyle = styles.secondaryAction;

  if (estado.includes('borrador')) {
    actionLabel = 'Pagar';
    actionStyle = styles.primaryAction;
  } else if (estado.includes('proceso')) {
    actionLabel = canDownload ? 'Descargar' : 'En revisión';
    actionStyle = canDownload ? styles.successAction : styles.warningAction;
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => onPress?.(pedido)} activeOpacity={0.85}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.label}>Factura</Text>
            <Text style={styles.numero}>{pedido.numero}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pedido.estado) }]}>
            <Text style={styles.statusText}>{pedido.estado}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Cliente:</Text>
          <Text style={styles.metaValue}>{pedido.cliente}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Fecha:</Text>
          <Text style={styles.metaValue}>{formatDate(pedido.fecha)}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Pago:</Text>
          <Text style={styles.metaValue}>{pedido.metodo}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(pedido.total)}</Text>
        </View>
      </TouchableOpacity>

      {estado.includes('borrador') && (
        <TouchableOpacity style={[styles.actionButton, actionStyle]} onPress={() => onPress?.(pedido)}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}

      {estado.includes('proceso') && !canDownload && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>El pago está siendo validado por un administrador.</Text>
        </View>
      )}

      {canDownload && (
        <TouchableOpacity style={[styles.actionButton, actionStyle]} onPress={() => onDownload?.(pedido)}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const PedidosScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState('');

  const { user, jwtPayload } = useSelector((state) => state.auth);

  const cargarPedidos = async () => {
    try {
      setError('');

      const cedulaUsuario =
        user?.cedula ||
        user?.cedula_usuario ||
        user?.documento ||
        jwtPayload?.cedula ||
        jwtPayload?.cedula_usuario ||
        jwtPayload?.documento ||
        '';

      if (!cedulaUsuario) {
        setPedidos([]);
        setError('No se pudo identificar la cédula del usuario para consultar sus pedidos.');
        return;
      }

      const response = await InvocarMetodo('gestionarFactura.php', 'default', {
        cedula: cedulaUsuario,
      });

      const sourceList = extractFacturasFromResponse(response);

      if (!sourceList.length) {
        const data = response?.data ?? response;
        const htmlFacturaList = typeof data?.mensaje === 'string' ? data.mensaje : '';
        const parsedHtmlPedidos = extractPedidosDesdeHtml(htmlFacturaList);

        if (parsedHtmlPedidos.length > 0) {
          setPedidos(parsedHtmlPedidos.map(normalizePedido).filter(Boolean));
          return;
        }
      }

      const normalized = sourceList
        .map(normalizePedido)
        .filter(Boolean);

      setPedidos(normalized);
    } catch (err) {
      console.error('[Pedidos] Error al consultar facturas:', err);
      setError(err?.message || 'No se pudieron cargar tus pedidos en este momento.');
      setPedidos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, [user, jwtPayload]);

  const pedidosAgrupados = useMemo(() => {
    return pedidos.reduce((accumulator, item) => {
      const key = item.estado || 'Otros';
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(item);
      return accumulator;
    }, {});
  }, [pedidos]);

  const handleDownloadFactura = async (pedidoSeleccionado) => {
    try {
      const idFactura = pedidoSeleccionado?.id_factura ?? pedidoSeleccionado?.id ?? pedidoSeleccionado?.numero;
      if (!idFactura) {
        console.warn('[Pedidos] No hay id de factura para descargar');
        return;
      }

      const url = `${API_BASE_URL}/descargarFactura.php?id_factura=${encodeURIComponent(idFactura)}`;

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.error('[Pedidos] Error al descargar factura:', error);
    }
  };

  const renderGroup = ({ item }) => {
    const [groupKey, groupList] = item;

    return (
      <View style={styles.groupSection}>
        <Text style={styles.groupTitle}>{groupKey}</Text>
        {groupList.map((pedido) => (
          <PedidoCard
            key={pedido.id}
            pedido={pedido}
            onPress={(pedidoSeleccionado) => {
              if (String(pedidoSeleccionado.estado || '').toLowerCase().includes('borrador')) {
                navigation.navigate('Payment', { pedido: pedidoSeleccionado });
                return;
              }

              if (isFacturaDescargable(pedidoSeleccionado.estado)) {
                handleDownloadFactura(pedidoSeleccionado);
                return;
              }

              console.log('[Pedidos] Ver detalle del pedido:', pedidoSeleccionado);
            }}
            onDownload={handleDownloadFactura}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando tus pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={cargarPedidos}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={Object.entries(pedidosAgrupados)}
        keyExtractor={([groupKey]) => groupKey}
        renderItem={renderGroup}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              cargarPedidos();
            }}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No tienes pedidos registrados.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  numero: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  metaValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  footerRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  actionButton: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: COLORS.primary,
  },
  secondaryAction: {
    backgroundColor: '#407aef',
  },
  warningAction: {
    backgroundColor: '#F5B700',
  },
  successAction: {
    backgroundColor: COLORS.success,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  infoBox: {
    marginTop: 12,
    backgroundColor: '#E8F3FF',
    borderRadius: 8,
    padding: 10,
  },
  infoText: {
    color: '#1dd862',
    fontSize: 12,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#FDECEC',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginTop: 12,
  },
  errorText: {
    color: '#B42318',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  groupSection: {
    marginBottom: 18,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
});

export default PedidosScreen;
