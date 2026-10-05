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
  ImageBackground,
  Alert
} from 'react-native';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import ProductCard from '../../components/ProductCard';
import ComboCard from '../../components/ComboCard';
import ComboDetailModal from '../../components/ComboDetailModal';
import ProductDetailModal from '../../components/ProductDetailModal';
import ScreenWithHeader from '../../components/common/ScreenWithHeader';
import { useProducts } from '../../hooks/useProducts';
import { useSearch } from '../../hooks/useSearch';
import { useCart } from '../../hooks/useCart';
import { IMAGES } from '../../config/images';
import MenuModal from '../../components/common/MenuModal';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const sectionTitles = {
  featured: 'Ofertas Especiales',
  impresoras: 'Impresoras',
  tintas: 'Tintas',
  cartuchos: 'Cartuchos de Tóner',
  combos: 'Combos'
};

const FeaturedSlider = ({ items, onPressItem }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

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

  const handleScroll = (event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const getItemLayout = (_, index) => ({
    length: width - 40,
    offset: (width - 40) * index,
    index,
  });

  const renderItem = ({ item }) => {
    const imageSource = item.imageSource || 
                       (item.image ? { uri: item.image } : require('../../assets/images/producto-default.jpg'));
    const itemPrice = Number(item.price ?? item.precio ?? 0);
    const origPrice = Number(item.originalPrice ?? itemPrice);

    return (
      <TouchableOpacity 
        style={styles.slide}
        activeOpacity={0.9}
        onPress={() => onPressItem && onPressItem(item)}
      >
        <View style={styles.featuredCard}>
          {origPrice > itemPrice && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {Math.round(((origPrice - itemPrice) / origPrice) * 100)}% OFF
              </Text>
            </View>
          )}
          <Image 
            source={imageSource}
            style={styles.featuredImage}
            resizeMode="cover"
            defaultSource={require('../../assets/images/producto-default.jpg')}
          />
          <View style={styles.featuredInfo}>
            <Text style={styles.featuredName} numberOfLines={1}>{item.name || item.nombre}</Text>
            <View style={styles.priceContainer}>
              {origPrice > itemPrice && (
                <Text style={styles.originalPrice}>${origPrice.toFixed(2)}</Text>
              )}
              <Text style={styles.discountedPrice}>${itemPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!items || items.length === 0) return null;

  return (
    <View style={styles.sliderContainer}>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item.id || item.id_producto || index).toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        initialScrollIndex={0}
        snapToInterval={width - 40}
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

const CategorySection = ({ title, items, onPressItem, onPressCombo, onAddComboToCart }) => {
  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      {item?.isCombo || item?.type === 'combo' ? (
        <ComboCard 
          combo={item} 
          onPress={() => onPressCombo(item)} 
          onAddToCart={() => onAddComboToCart(item)}
        />
      ) : (
        <ProductCard product={item} onPress={onPressItem} />
      )}
    </View>
  );

  if (!items || items.length === 0) return null;

  return (
    <View style={styles.categorySection}>
      <Text style={styles.sectionTitle}>{title} ({items.length})</Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item?.id || item?.id_producto || index).toString()}
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
  const { products, loading } = useProducts();
  const { searchQuery, setSearchQuery, searchResults, filterData } = useSearch();
  const { addItem } = useCart();

  const handleAddToCart = (product) => {
    try {
      addItem(product, 1);
    } catch (error) {
      Alert.alert('Stock insuficiente', error.message);
    }
  };

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [comboModalVisible, setComboModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredSections = searchQuery ? searchResults : products;
  
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      filterData(products);
    }
  };

  const handleProductPress = (product) => {
    if (product?.isCombo || product?.type === 'combo') {
      setSelectedCombo(product);
      setComboModalVisible(true);
    } else {
      setSelectedProduct(product);
    }
  };

  const handleComboPress = (combo) => {
    setSelectedCombo(combo);
    setComboModalVisible(true);
  };

  const allProductsList = Object.values(filteredSections || {})
    .flat()
    .filter(item => item && !item.isCombo && item.type !== 'combo');

  const selectedProdId = selectedProduct?.id || selectedProduct?.id_producto;
  const selectedCategory = selectedProduct?.category
    || selectedProduct?.categoria_nombre
    || selectedProduct?.categoria;
  const relatedProducts = allProductsList.filter((product) => {
    const productCategory = product?.category
      || product?.categoria_nombre
      || product?.categoria;

    return productCategory === selectedCategory
      && (product.id || product.id_producto) !== selectedProdId;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10 }}>Cargando productos...</Text>
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
              {filteredSections.featured && filteredSections.featured.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeader}>Ofertas Especiales</Text>
                  <FeaturedSlider 
                    items={filteredSections.featured} 
                    onPressItem={handleProductPress}
                  />
                </View>
              )}

              {Object.keys(filteredSections).map(category => {
                if (category === 'featured') return null;

                return (
                  <CategorySection
                    key={category}
                    title={sectionTitles[category] || category}
                    items={filteredSections[category]}
                    onPressItem={handleProductPress}
                    onPressCombo={handleComboPress}
                    onAddComboToCart={handleAddToCart}
                  />
                );
              })}
            </View>
          </ScrollView>
        </ImageBackground>
      </ScreenWithHeader>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons name="menu" size={24} color={COLORS.white} />
      </TouchableOpacity>

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />

      <ComboDetailModal
        visible={comboModalVisible}
        combo={selectedCombo}
        onClose={() => setComboModalVisible(false)}
        onAddToCart={(combo) => addItem(combo, 1)}
      />

      <ProductDetailModal
        visible={!!selectedProduct}
        product={selectedProduct}
        relatedProducts={relatedProducts}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product, quantity) => addItem(product, quantity || 1)}
        onSelectProduct={(product) => setSelectedProduct(product)}
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    margin: 10,
    padding: 10,
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
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
  sliderContainer: {
    height: 240,
    paddingVertical: 8,
  },
  slide: {
    width: width - 60,
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    ...theme.shadow.sm,
    marginBottom: 8,
    height: 240,
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
    height: 150,
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