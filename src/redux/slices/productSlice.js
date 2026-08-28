import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { InvocarMetodo } from '../../utils/comunicadorApi';
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await InvocarMetodo('productos.php', 'default', params);
      console.log('[Productos] Respuesta de todos los productos:', response);
      
      if (response.status === 'success') {
        return {
          products: response.data.productos,
          total: response.data.total
        };
      } else {
        return rejectWithValue(response.message || 'Error al obtener productos');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener productos');
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (categoriaId, { rejectWithValue }) => {
    try {
      const response = await InvocarMetodo(
        'productos.php',
        'por_categoria',
        { categoria: categoriaId }
      );
      console.log('[Productos] Respuesta por categoria:', {
        categoriaId,
        response,
      });
      if (response.status === 'success') {
        return {
          products: response.data.productos,
          total: response.data.total,
          categoria: categoriaId
        };
      } else {
        return rejectWithValue(response.message || 'Error al obtener productos de la categoría');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener productos de la categoría');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await InvocarMetodo(
        'productos.php',
        'por_id',
        { id: productId }
      );
      console.log('[Productos] Respuesta por ID:', { productId, response });
      
      if (response.status === 'success') {
        const product = response.data.producto || response.data.productos?.[0];
        return {
          product: product ? {
            ...product,
            name: product.nombre,
            description: product.descripcion || '',
            price: Number(product.precio) || 0,
            image: product.imagen || null,
          } : null
        };
      } else {
        return rejectWithValue(response.message || 'Error al obtener el producto');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener el producto');
    }
  }
);

const initialState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  total: 0,
  categoria: null
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
      state.total = action.payload.total;
      state.error = null;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.products = [];
    });
    
    // Fetch Products by Category
    builder.addCase(fetchProductsByCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductsByCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
      state.total = action.payload.total;
      state.categoria = action.payload.categoria;
      state.error = null;
    });
    builder.addCase(fetchProductsByCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.products = [];
    });
    
    // Fetch Product by ID
    builder.addCase(fetchProductById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProduct = action.payload.product;
      state.error = null;
    });
    builder.addCase(fetchProductById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.currentProduct = null;
    });
  },
});

export const { clearError, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
