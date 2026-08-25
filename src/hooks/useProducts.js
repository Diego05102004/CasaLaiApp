import { useState, useEffect } from 'react';

// Mapeo de imágenes de productos
const productImages = {
  'producto-1': require('../assets/images/producto-1.jpg'),
  'producto-2': require('../assets/images/producto-2.jpg'),
  'producto-3': require('../assets/images/producto-3.jpg'),
  'producto-4': require('../assets/images/producto-4.jpg'),
  'producto-5': require('../assets/images/producto-5.jpg'),
  'producto-6': require('../assets/images/producto-6.jpg'),
  'producto-7': require('../assets/images/producto-7.jpg'),
  'producto-8': require('../assets/images/producto-8.jpg'),
  'default': require('../assets/images/producto-default.jpg'),
};

// Función para obtener la imagen de un producto
const getProductImage = (imageName) => {
  return productImages[imageName] || productImages['default'];
};

const sampleProducts = {
  featured: [
    {
      id: 'f1',
      name: 'Oferta Especial - Impresora EPSON',
      price: 199.99,
      originalPrice: 249.99,
      image: 'producto-1',
      imageSource: productImages['producto-1'],
      category: 'impresoras',
      description: 'Impresora multifunción EPSON con 30% de descuento',
      isFeatured: true
    },
    {
      id: 'f2',
      name: 'Paquete Tintas EPSON',
      price: 49.99,
      originalPrice: 69.99,
      image: 'producto-2',
      imageSource: productImages['producto-2'],
      category: 'tintas',
      description: 'Paquete de tintas EPSON para impresoras de inyección',
      isFeatured: true
    },
    {
      id: 'f3',
      name: 'Cartucho HP 301XL',
      price: 24.99,
      originalPrice: 34.99,
      image: 'producto-3',
      imageSource: productImages['producto-3'],
      category: 'cartuchos',
      description: 'Cartucho de tóner negro de alta capacidad',
      isFeatured: true
    }
  ],
  impresoras: [
    {
      id: 'i1',
      name: 'Impresora EPSON L380',
      image: 'producto-4',
      imageSource: productImages['producto-4'],
      price: 249.99,
      category: 'impresoras',
      description: 'Impresora multifunción con sistema de tinta continua',
      isFeatured: false
    },
    {
      id: 'i2',
      name: 'HP LaserJet Pro M404dn',
      image: 'producto-5',
      imageSource: productImages['producto-5'],
      price: 329.99,
      category: 'impresoras',
      description: 'Impresora láser monocromática de alto rendimiento',
      isFeatured: false
    },
    {
      id: 'i3',
      name: 'EPSON EcoTank L3150',
      image: 'producto-6',
      imageSource: productImages['producto-6'],
      price: 299.99,
      category: 'impresoras',
      description: 'Impresora de tanque de tinta de alta capacidad',
      isFeatured: false
    },
    {
      id: 'i4',
      name: 'Brother HL-L2350DW',
      image: 'producto-7',
      imageSource: productImages['producto-7'],
      price: 199.99,
      category: 'impresoras',
      description: 'Impresora láser inalámbrica compacta',
      isFeatured: false
    }
  ],
  tintas: [
    {
      id: 't1',
      name: 'Tinta EPSON 664 Negro',
      image: 'producto-8',
      imageSource: productImages['producto-8'],
      price: 12.99,
      category: 'tintas',
      description: 'Cartucho de tinta negra para impresoras EPSON',
      isFeatured: false
    },
    {
      id: 't2',
      name: 'Tinta HP 664 Tricolor',
      image: 'producto-1',
      imageSource: productImages['producto-1'],
      price: 15.99,
      category: 'tintas',
      description: 'Juego de tintas de colores para impresoras HP',
      isFeatured: false
    },
    {
      id: 't3',
      name: 'Tinta Canon PG-245 Negro',
      image: 'producto-2',
      imageSource: productImages['producto-2'],
      price: 14.99,
      category: 'tintas',
      description: 'Cartucho de tinta negra para impresoras Canon',
      isFeatured: false
    }
  ],
  cartuchos: [
    {
      id: 'c1',
      name: 'Cartucho HP 301XL Negro',
      image: 'producto-3',
      imageSource: productImages['producto-3'],
      price: 24.99,
      category: 'cartuchos',
      description: 'Cartucho de tóner negro de alta capacidad',
      isFeatured: false
    },
    {
      id: 'c2',
      name: 'Cartucho Brother TN-660',
      image: 'producto-4',
      imageSource: productImages['producto-4'],
      price: 29.99,
      category: 'cartuchos',
      description: 'Cartucho de tóner para impresoras Brother',
      isFeatured: false
    },
    {
      id: 'c3',
      name: 'Cartucho Samsung MLT-D111S',
      image: 'producto-5',
      imageSource: productImages['producto-5'],
      price: 34.99,
      category: 'cartuchos',
      description: 'Cartucho de tóner para impresoras Samsung',
      isFeatured: false
    }
  ]
};

export const useProducts = () => {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simulando una llamada a una API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProducts(sampleProducts);
      } catch (err) {
        setError('Error al cargar los productos');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filterProducts = (query, productsToFilter) => {
    if (!query) return productsToFilter;
    
    const filtered = {};
    Object.entries(productsToFilter).forEach(([category, items]) => {
      const filteredItems = items.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
      );
      if (filteredItems.length > 0) filtered[category] = filteredItems;
    });
    return filtered;
  };

  return { 
    products, 
    loading, 
    error, 
    filterProducts 
  };
};

export default useProducts;
