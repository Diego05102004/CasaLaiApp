import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
};

// Función auxiliar para calcular el stock total usado por un producto en el carrito
// Considera productos individuales y productos dentro de combos
const calculateStockUsed = (items, productId) => {
  let totalUsed = 0;

  items.forEach(item => {
    if (item.isCombo && Array.isArray(item.comboProducts)) {
      // Si es un combo, buscar el producto dentro del combo
      const productInCombo = item.comboProducts.find(
        p => (p.id || p.id_producto) === productId
      );
      if (productInCombo) {
        const comboQuantity = Number(item.quantity) || 1;
        const productQuantityInCombo = Number(productInCombo.quantity || productInCombo.cantidad) || 1;
        totalUsed += comboQuantity * productQuantityInCombo;
      }
    } else if ((item.id || item.id_producto) === productId) {
      // Si es un producto individual
      totalUsed += Number(item.quantity) || 1;
    }
  });

  return totalUsed;
};

// Función auxiliar para validar si hay suficiente stock para agregar un producto/combo
const validateStock = (cartItems, newItem, newQuantity = 1) => {
  const isCombo = newItem.isCombo || false;
  const requestedQuantity = Math.max(1, Math.floor(Number(newQuantity) || 1));

  if (isCombo && Array.isArray(newItem.comboProducts)) {
    // Validar stock para cada producto dentro del combo
    for (const product of newItem.comboProducts) {
      const productId = product.id || product.id_producto;
      const productStock = Number(product.stock || product.existencia) || 0;
      const productQuantityInCombo = Number(product.quantity || product.cantidad) || 1;
      
      // Calcular stock actual usado por este producto en el carrito
      const currentStockUsed = calculateStockUsed(cartItems, productId);
      
      // Calcular stock total requerido si agregamos este combo
      const totalStockRequired = currentStockUsed + (requestedQuantity * productQuantityInCombo);
      
      if (totalStockRequired > productStock) {
        return {
          valid: false,
          productId,
          productName: product.name || product.nombre || 'Producto',
          currentStockUsed,
          stockAvailable: productStock,
          required: totalStockRequired,
        };
      }
    }
  } else {
    // Validar stock para producto individual
    const productId = newItem.id || newItem.id_producto;
    const productStock = Number(newItem.stock || newItem.existencia) || 0;
    
    // Calcular stock actual usado por este producto en el carrito
    const currentStockUsed = calculateStockUsed(cartItems, productId);
    
    // Calcular stock total requerido si agregamos este producto
    const totalStockRequired = currentStockUsed + requestedQuantity;
    
    if (totalStockRequired > productStock) {
      return {
        valid: false,
        productId,
        productName: newItem.name || newItem.nombre || 'Producto',
        currentStockUsed,
        stockAvailable: productStock,
        required: totalStockRequired,
      };
    }
  }

  return { valid: true };
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
        quantity = 1,
        stock,
        existencia,
      } = action.payload;
      const requestedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
      
      // Validar stock antes de agregar
      const stockValidation = validateStock(state.items, action.payload, requestedQuantity);
      if (!stockValidation.valid) {
        // Lanzar error para que el componente lo maneje
        throw new Error(
          `Stock insuficiente para ${stockValidation.productName}. ` +
          `Disponible: ${stockValidation.stockAvailable}, ` +
          `Usado en carrito: ${stockValidation.currentStockUsed}, ` +
          `Requerido: ${stockValidation.required}`
        );
      }
      
      const existingItem = state.items.find(item => item.id === id && item.isCombo === isCombo);
      
      if (existingItem) {
        existingItem.quantity += requestedQuantity;
      } else {
        state.items.push({
          id,
          name,
          price,
          image,
          imageUrl,
          isCombo,
          comboProducts: isCombo ? comboProducts : [],
          quantity: requestedQuantity,
          stock,
          existencia,
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
        // Validar stock antes de actualizar cantidad
        const stockValidation = validateStock(
          state.items.filter(item => item.id !== id), // Excluir el item actual del cálculo
          existingItem,
          nextQuantity
        );
        
        if (!stockValidation.valid) {
          throw new Error(
            `Stock insuficiente para ${stockValidation.productName}. ` +
            `Disponible: ${stockValidation.stockAvailable}, ` +
            `Usado en carrito: ${stockValidation.currentStockUsed}, ` +
            `Requerido: ${stockValidation.required}`
          );
        }
        
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
export { validateStock, calculateStockUsed };

export default cartSlice.reducer;
