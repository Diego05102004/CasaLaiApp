import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const { height } = Dimensions.get('window');
const defaultImage = require('../assets/images/producto-default.jpg');

const ComboDetailModal = ({ visible, combo, onClose, onAddToCart }) => {
  if (!combo) return null;

  // Extraer el nombre del combo
  const comboName = combo?.name || combo?.nombre_combo || combo?.nombre || 'Combo';

  // Extraer la lista de productos con todos los fallbacks posibles
  const includedItems = Array.isArray(combo?.products)
    ? combo.products
    : Array.isArray(combo?.productos)
      ? combo.productos
      : Array.isArray(combo?.items)
        ? combo.items
        : Array.isArray(combo?.incluye)
          ? combo.incluye
          : [];

  // Función helper para resolver la imagen de un producto/item
  const getItemImage = (item) => {
    if (item?.imageSource) return item.imageSource;
    const img = item?.imagen || item?.image || item?.imagen_url;
    if (img) {
      return typeof img === 'string' ? { uri: img } : img;
    }
    return defaultImage;
  };

  // Resolver la imagen principal del combo
  const comboImage = combo?.imageSource ||
    (combo?.image || combo?.imagen
      ? { uri: combo.image || combo.imagen }
      : getItemImage(includedItems[0]));

  // Precio final
  const totalPrice = Number(combo?.price ?? combo?.precio_final ?? combo?.precio_total ?? combo?.precio ?? 0);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Botón de cierre */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.darkGray || '#333'} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Imagen del combo */}
            <View style={styles.imageContainer}>
              <Image
                source={comboImage}
                style={styles.comboImage}
                resizeMode="contain"
                defaultSource={defaultImage}
              />
              <View style={styles.comboBadge}>
                <Text style={styles.comboBadgeText}>COMBO</Text>
              </View>
            </View>

            {/* Título y Descripción */}
            <Text style={styles.comboTitle}>{comboName}</Text>
            
            {combo?.description || combo?.descripcion ? (
              <Text style={styles.comboDescription}>
                {combo.description || combo.descripcion}
              </Text>
            ) : null}

            <View style={styles.divider} />

            {/* Productos incluidos */}
            <Text style={styles.sectionTitle}>Productos Incluidos:</Text>
            
            <View style={styles.itemsList}>
              {includedItems.map((item, index) => {
                const itemName = item?.name || item?.nombre_producto || item?.nombre || 'Producto';
                const itemQuantity = Number(item?.quantity ?? item?.cantidad ?? 1);
                const itemPrice = Number(item?.price ?? item?.precio ?? 0);
                const itemImgSource = getItemImage(item);

                return (
                  <View key={item?.id || item?.id_producto || index} style={styles.itemRow}>
                    <Image
                      source={itemImgSource}
                      style={styles.itemImage}
                      resizeMode="cover"
                      defaultSource={defaultImage}
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {itemName}
                      </Text>
                      <Text style={styles.itemQuantity}>
                        Cantidad: {itemQuantity}
                      </Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      ${(itemPrice * itemQuantity).toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer con precio total y acción */}
          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text style={styles.totalLabel}>Precio Total:</Text>
              <Text style={styles.totalPrice}>
                ${totalPrice.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (onAddToCart) {
                  try {
                    onAddToCart(combo);
                    onClose();
                  } catch (error) {
                    Alert.alert('Stock insuficiente', error.message);
                  }
                }
              }}
            >
              <Ionicons name="cart-outline" size={20} color={COLORS.white || '#FFF'} style={{ marginRight: 8 }} />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white || '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.85,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 15,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  comboImage: {
    width: '100%',
    height: '100%',
  },
  comboBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.primary || '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  comboBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  comboTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkGray || '#222',
    marginBottom: 6,
  },
  comboDescription: {
    fontSize: 14,
    color: COLORS.textSecondary || '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkGray || '#333',
    marginBottom: 10,
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  itemImage: {
    width: 45,
    height: 45,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#EAEAEA',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text || '#333',
  },
  itemQuantity: {
    fontSize: 12,
    color: COLORS.textSecondary || '#777',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary || '#007AFF',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
    paddingTop: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  totalLabel: {
    fontSize: 12,
    color: COLORS.textSecondary || '#666',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary || '#007AFF',
  },
  addButton: {
    backgroundColor: COLORS.primary || '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white || '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default ComboDetailModal;