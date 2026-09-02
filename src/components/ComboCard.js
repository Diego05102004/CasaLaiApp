import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import COLORS from '../constants/colors';
import theme from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const defaultImage = require('../assets/images/producto-default.jpg');

const ComboCard = ({ combo, onPress, onAddToCart }) => {
  const dispatch = useDispatch();
  const name = combo?.name || combo?.nombre_combo || combo?.nombre || 'Combo';
  const price = Number(combo?.price ?? combo?.precio_final ?? combo?.precio_total ?? combo?.precio ?? 0);
  const items = Array.isArray(combo?.products)
    ? combo.products
    : Array.isArray(combo?.productos)
      ? combo.productos
      : [];
  const getItemImage = (item) => item?.imageSource || (item?.imagen || item?.image ? { uri: item.imagen || item.image } : defaultImage);
  const imageSource = combo?.imageSource || (combo?.image ? { uri: combo.image } : getItemImage(items[0]));

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(combo);
    } else {
      dispatch(addToCart({
        id: combo?.id,
        name,
        price,
        image: imageSource,
        imageUrl: typeof combo?.image === 'string' ? combo.image : null,
        isCombo: true,
        comboProducts: items,
      }));
    }
  };

  const handlePressCard = () => {
    if (onPress) {
      onPress(combo);
    } else {
      console.log('[ComboCard] Combo seleccionado:', combo?.id);
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.touchableArea} onPress={handlePressCard}>
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>COMBO</Text>
          </View>
        </View>
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          <Text style={styles.itemsLabel}>Incluye:</Text>
          {items.length > 0 ? (
            items.slice(0, 3).map((item, index) => (
              <View key={`${item?.id || item?.id_producto || index}`} style={styles.itemRow}>
                <Image source={getItemImage(item)} style={styles.itemImage} resizeMode="cover" />
                <View style={styles.itemDetails}>
                  <Text style={styles.item} numberOfLines={1}>
                    {item?.name || item?.nombre_producto || item?.nombre || 'Producto'}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {Number(item?.quantity ?? item?.cantidad ?? 1)} x ${(Number(item?.price ?? item?.precio ?? 0)).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.item}>Productos incluidos</Text>
          )}
          {items.length > 3 ? <Text style={styles.item}>+{items.length - 3} productos</Text> : null}
          <Text style={styles.price}>${price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
        <Ionicons name="cart-outline" size={20} color={COLORS.white} />
        <Text style={styles.addButtonText}>Agregar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    margin: 8,
    minWidth: 160,
    maxWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  touchableArea: { flex: 1 },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.lightGray,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: { ...theme.typography.caption, color: COLORS.white, fontWeight: 'bold' },
  details: { padding: 12 },
  name: { ...theme.typography.subtitle, color: COLORS.text, marginBottom: 6 },
  itemsLabel: { ...theme.typography.caption, color: COLORS.primary, fontWeight: 'bold', marginBottom: 2 },
  item: { ...theme.typography.caption, color: COLORS.textSecondary, marginBottom: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  itemImage: { width: 34, height: 34, borderRadius: 4, backgroundColor: COLORS.lightGray, marginRight: 7 },
  itemDetails: { flex: 1 },
  itemMeta: { ...theme.typography.caption, color: COLORS.textSecondary, marginTop: 1 },
  price: { ...theme.typography.bodyBold, color: COLORS.primary, fontSize: 16, marginTop: 6 },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 8,
  },
  addButtonText: { ...theme.typography.bodyBold, color: COLORS.white, marginLeft: 4 },
});

export default ComboCard;