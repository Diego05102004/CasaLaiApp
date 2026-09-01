import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const {
        id,
        name,
        price,
        image,
        imageUrl,
        isCombo = false,
        comboProducts = [],
      } = action.payload;
      const existingItem = state.items.find(item => item.id === id && item.isCombo === isCombo);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          id,
          name,
          price,
          image,
          imageUrl,
          isCombo,
          comboProducts: isCombo ? comboProducts : [],
          quantity: 1,
        });
      }
      
      state.total = calculateTotal(state.items);
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      const existingItem = state.items.find(item => item.id === itemId);

      if (!existingItem) {
        return;
      }
      
      if (existingItem.quantity === 1) {
        state.items = state.items.filter(item => item.id !== itemId);
      } else {
        existingItem.quantity -= 1;
      }
      
      state.total = calculateTotal(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      const nextQuantity = Number(quantity);

      if (!existingItem || !Number.isFinite(nextQuantity)) {
        return;
      }

      if (nextQuantity <= 0) {
        state.items = state.items.filter(item => item.id !== id);
      } else {
        existingItem.quantity = Math.floor(nextQuantity);
      }

      state.total = calculateTotal(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    }
  },
});

// Función auxiliar para calcular el total
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
