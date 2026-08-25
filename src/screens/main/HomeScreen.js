import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground
} from 'react-native';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import ProductCard from '../../components/ProductCard';
import ScreenWithHeader from '../../components/common/ScreenWithHeader';
import { useProducts } from '../../hooks/useProducts';
import { useSearch } from '../../hooks/useSearch';
import { useCart } from '../../hooks/useCart';
import { IMAGES } from '../../config/images';
import MenuModal from '../../components/common/MenuModal';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Títulos para las secciones
const sectionTitles = {
  featured: 'Ofertas Especiales',
  impresoras: 'Impresoras',
  tintas: 'Tintas',
  cartuchos: 'Cartuchos de Tóner'
};

// Componente para el slider de ofertas
const FeaturedSlider = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Efecto para el auto-desplazamiento
  useEffect(() => {
    if (items.length <= 1) return;
    
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % items.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 2000);

    return () => clearInterval(interval);
  }, [currentIndex, items.length]);

  // Manejar el scroll manual
  const handleScroll = (event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  // Asegurarse de que el índice esté dentro de los límites
  const getItemLayout = (_, index) => ({
    length: width - 40,
    offset: (width - 40) * index,
    index,
  });

  const renderItem = ({ item }) => {
    // Verificar si el item tiene una imagen válida
    const imageSource = item.imageSource || 
                       (item.image ? { uri: item.image } : require('../../assets/images/producto-default.jpg'));
    
    return (
      <View style={styles.slide}>
        <View style={styles.featuredCard}>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
            </Text>
          </View>
          <Image 
            source={imageSource}
            style={styles.featuredImage}
            resizeMode="cover"
            defaultSource={require('../../assets/images/producto-default.jpg')}
            onError={(error) => {
              console.log('Error al cargar la imagen:', error);
              // Si hay un error, usar la imagen por defecto
              if (typeof imageSource === 'object') {
                imageSource.uri = null;
              }
            }}
          />
          <View style={styles.featuredInfo}>
            <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>${item.originalPrice?.toFixed(2) || item.price.toFixed(2)}</Text>
              <Text style={styles.discountedPrice}>${item.price.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (!items || items.length === 0) return null;

  return (
    <View style={styles.sliderContainer}>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        initialScrollIndex={0}
        snapToInterval={width - 40} // Ajustar el snap para que se alinee correctamente
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.sliderContentContainer}
      />
      {items.length > 1 && (
        <View style={styles.pagination}>
          {items.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive
              ]}
              onPress={() => {
                flatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                });
                setCurrentIndex(index);
              }}
              activeOpacity={0.7}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// Componente para la sección de categorías
const CategorySection = ({ title, items, onPressItem }) => {
  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <ProductCard 
        product={item} 
        onPress={() => onPressItem(item)}
      />
    </View>
  );

  // Verificar si hay elementos para mostrar
  if (!items || items.length === 0) {
    return null; // No mostrar la sección si no hay elementos
  }

  return (
    <View style={styles.categorySection}>
      <Text style={styles.sectionTitle}>{title} ({items.length})</Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        ListEmptyComponent={
          <View style={{padding: 16}}>
            <Text>No hay productos en esta categoría</Text>
          </View>
        }
      />
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  // Usar hooks personalizados
  const { products, loading, error } = useProducts();
  const { searchQuery, setSearchQuery, searchResults, filterData } = useSearch();
  const { addItem } = useCart();

  // Estado para el modal del menú
  const [menuVisible, setMenuVisible] = useState(false);

  // Filtrar productos cuando cambia el término de búsqueda o los productos
  const filteredSections = searchQuery ? searchResults : products;
  
  // Depuración: Mostrar las categorías disponibles
  console.log('Categorías disponibles:', Object.keys(filteredSections).filter(cat => cat !== 'featured'));
  Object.entries(filteredSections).forEach(([category, items]) => {
    if (category !== 'featured') {
      console.log(`Categoría ${category}:`, items?.length || 0, 'productos');
    }
  });
  
  // Manejar búsqueda
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      filterData(products);
    }
  };

  // Manejar clic en producto
  const handleProductPress = (product) => {
    // Agregar al carrito al hacer clic
    addItem(product, 1);
    console.log('Producto agregado al carrito:', product.name);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <>
      <ScreenWithHeader onSearch={handleSearch}>
        <ImageBackground
          source={IMAGES.BACKGROUND}
          style={styles.backgroundImage}
          resizeMode="cover">
          <View style={styles.backgroundImage}>
            <Image
              source={IMAGES.BACKGROUND}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: 'cover',
                position: 'absolute',
              }}
            />
          </View>
          <ScrollView style={styles.container}>
            <View style={styles.contentContainer}>
              {/* Sección de ofertas destacadas */}
              {filteredSections.featured && filteredSections.featured.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeader}>Ofertas Especiales</Text>
                  <FeaturedSlider items={filteredSections.featured} />
                </View>
              )}

            {/* Secciones por categoría */}
            {Object.keys(filteredSections).map(category => {
              if (category === 'featured') return null; // Ya mostramos las ofertas arriba

              return (
                <CategorySection
                  key={category}
                  title={sectionTitles[category] || category}
                  items={filteredSections[category]}
                  onPressItem={handleProductPress}
                />
              );
            })}
            </View>
          </ScrollView>
        </ImageBackground>
      </ScreenWithHeader>

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
    backgroundColor: 'transparent',
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo semitransparente solo para el contenido
    borderRadius: 12,
    margin: 10,
    padding: 10,
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject, // Esto hará que la imagen ocupe toda la pantalla
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
    color: COLORS.darkGray,
  },
  // Estilos para el slider de ofertas
  sliderContainer: {
    height: 240, // Reducir altura total del slider
    paddingVertical: 8,
  },
  slide: {
    width: width - 60, // Hacer las tarjetas un poco más angostas
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    ...theme.shadow.sm,
    marginBottom: 8,
    height: 240, // Reducir altura de las tarjetas
  },
  featuredCard: {
    flex: 1,
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 1,
  },
  discountText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 11,
  },
  featuredImage: {
    width: '100%',
    height: 150, // Reducir altura de la imagen
    backgroundColor: '#f8f8f8',
  },
  featuredInfo: {
    padding: 10,
    backgroundColor: '#fff',
  },
  featuredName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: COLORS.text,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  sliderContentContainer: {
    paddingHorizontal: 8,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
    width: 20,
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
  // Estilos para las secciones de categorías
  categorySection: {
    marginBottom: 24,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
    color: COLORS.darkGray,
  },
  categoryList: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  productCard: {
    width: 160,
    marginRight: 12,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default HomeScreen;
