import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import COLORS from '../constants/colors';
import theme from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const getProductImage = (imageName) => {
  const imageMap = {
    'producto-default': require('../assets/images/producto-default.jpg'),
  };
  return imageMap[imageName] || imageMap['producto-default'];
};

const ProductCard = ({ product, onPress, onAddToCart }) => {
  const dispatch = useDispatch();
  const isCombo = Boolean(product?.isCombo || product?.type === 'combo');
  const productName = product?.name || product?.nombre || product?.nombre_combo || 'Producto';
  const productPrice = Number(product?.price ?? product?.precio ?? 0);

  const handlePress = () => {
    console.log('Tarjeta presionada:', productName);
    if (onPress) {
      onPress(product);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    const imageToUse = product?.imageSource || 
                      (product?.image ? { uri: product.image } : require('../assets/images/producto-default.jpg'));
    
    try {
      dispatch(addToCart({
        id: product?.id || product?.id_producto,
        name: productName,
        price: productPrice,
        image: imageToUse,
        imageUrl: typeof product?.image === 'string' ? product.image : null,
        isCombo,
        comboProducts: product?.products || [],
        stock: product?.stock || product?.existencia,
        existencia: product?.existencia || product?.stock,
      }));
    } catch (error) {
      Alert.alert('Stock insuficiente', error.message);
    }
  };

  const imageSource = product?.imageSource || 
    (typeof product?.image === 'string' ? { uri: product.image } : getProductImage(product?.image));

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        onPress={handlePress}
        style={styles.touchableArea}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={imageSource} 
            style={styles.image} 
            resizeMode="cover"
            onError={(error) => console.log('Error de imagen:', error.nativeEvent.error)}
          />
        </View>
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>{productName}</Text>
          {isCombo && product?.products?.length > 0 ? (
            <Text style={styles.comboInfo} numberOfLines={2}>
              {product.products.slice(0, 2).map((item) => item.name || item.nombre).join(', ')}
              {product.products.length > 2 ? '...' : ''}
            </Text>
          ) : null}
          <Text style={styles.price}>${productPrice.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddToCart}
        activeOpacity={0.8}
      >
        <Ionicons name="cart-outline" size={20} color={COLORS.white} />
        <Text style={styles.addButtonText}>{isCombo ? 'Combo' : 'Agregar'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    margin: 8,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  touchableArea: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    padding: 12,
  },
  name: {
    ...theme.typography.subtitle,
    color: COLORS.text,
    marginBottom: 4,
  },
  comboInfo: {
    ...theme.typography.caption,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  price: {
    ...theme.typography.bodyBold,
    color: COLORS.primary,
    fontSize: 16,
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  addButtonText: {
    ...theme.typography.bodyBold,
    color: COLORS.white,
    marginLeft: 4,
  },
});

export default ProductCard;