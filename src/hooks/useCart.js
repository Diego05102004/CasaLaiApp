import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity } from '../redux/slices/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart?.items || []);
  const total = useSelector(state => state.cart?.total || 0);

  const addItem = (product, quantity = 1) => {
    dispatch(addToCart({ 
      ...product, 
      quantity,
      // Asegurarse de que el precio sea un número
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
    }));
  };

  const removeItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ 
        id: productId, 
        quantity: newQuantity 
      }));
    } else {
      removeItem(productId);
    }
  };

  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const clearCart = () => {
    // Implementar lógica para vaciar el carrito si es necesario
    cartItems.forEach(item => removeItem(item.id));
  };

  return {
    cartItems,
    total,
    addItem,
    removeItem,
    updateItemQuantity,
    getItemCount,
    clearCart
  };
};

export default useCart;
