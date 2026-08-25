import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart, updateQuantity } from '../../redux/slices/cartSlice';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import MenuModal from '../../components/common/MenuModal';

const CartScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items, total } = useSelector(state => state.cart);

  // Estado para el modal del menú
  const [menuVisible, setMenuVisible] = useState(false);

  const handleRemoveFromCart = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleIncrement = (productId, currentQuantity) => {
    dispatch(updateQuantity({ 
      id: productId, 
      quantity: currentQuantity + 1 
    }));
  };

  const handleDecrement = (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      dispatch(updateQuantity({ 
        id: productId, 
        quantity: currentQuantity - 1 
      }));
    } else {
      dispatch(removeFromCart(productId));
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const quantity = parseInt(newQuantity) || 1;
    if (quantity > 0) {
      dispatch(updateQuantity({ id: productId, quantity }));
    }
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const renderItem = ({ item }) => {
    // Determinar la fuente de la imagen
    const imageSource = item.image || 
                       (item.imageUrl ? { uri: item.imageUrl } : null);
    
    return (
      <View style={styles.cartItem}>
        <View style={styles.itemImageContainer}>
          {imageSource ? (
            <Image 
              source={imageSource} 
              style={styles.itemImage} 
              resizeMode="cover"
              onError={(error) => console.log('Error loading cart item image:', error.nativeEvent.error)}
            />
          ) : (
            <View style={[styles.itemImage, { backgroundColor: COLORS.lightGray, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="image-outline" size={24} color={COLORS.primary} />
            </View>
          )}
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)} c/u</Text>
          <View style={styles.quantityContainer}>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={[styles.quantityButton, item.quantity <= 1 && styles.disabledButton]}
                onPress={() => handleDecrement(item.id, item.quantity)}
                disabled={item.quantity <= 1}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="remove" 
                  size={16} 
                  color={item.quantity <= 1 ? COLORS.gray : COLORS.primary} 
                />
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityInput}
                value={item.quantity.toString()}
                keyboardType="numeric"
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  handleQuantityChange(item.id, num);
                }}
              />
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleIncrement(item.id, item.quantity)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveFromCart(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color={COLORS.primary} />
        <Text style={styles.emptyText}>Tu carrito está vacío</Text>
        <Text style={styles.emptySubtext}>Añade productos para comenzar a comprar</Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Carrito</Text>
          <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={16} color={COLORS.white} style={{marginRight: 5}} />
            <Text>Vaciar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('Payment')}
          >
            <Text style={styles.checkoutButtonText}>Pagar ahora</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Botón flotante de menú */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons name="menu" size={24} color={COLORS.white} />
      </TouchableOpacity>

      {/* Modal del menú */}
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    ...theme.typography.h2,
    color: COLORS.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    ...theme.typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: theme.spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  title: {
    ...theme.typography.h2,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  clearButton: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    ...theme.typography.subtitle,
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    ...theme.typography.body,
    color: COLORS.primary,
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  quantityButton: {
    padding: 8,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityInput: {
    width: 40,
    textAlign: 'center',
    padding: 4,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
    ...theme.typography.body,
  },
  itemTotal: {
    ...theme.typography.bodyBold,
    color: COLORS.primary,
  },
  removeButton: {
    justifyContent: 'center',
    paddingLeft: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    elevation: 10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  totalText: {
    ...theme.typography.h3,
    color: COLORS.text,
  },
  totalAmount: {
    ...theme.typography.h2,
    color: COLORS.primary,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  checkoutButtonText: {
    ...theme.typography.button,
    color: COLORS.white,
  },
  menuButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
});

export default CartScreen;
