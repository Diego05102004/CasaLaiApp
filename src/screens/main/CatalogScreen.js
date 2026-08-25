import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByCategory } from '../../redux/slices/productSlice';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const CatalogScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    // Cargar productos de la categoría 11 (Impresoras)
    dispatch(fetchProductsByCategory(11));
  }, [dispatch]);

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      {item.imagen ? (
        <Image 
          source={{ uri: item.imagen }} 
          style={styles.productImage}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.productImage, styles.productImagePlaceholder]}>
          <Ionicons name="image-outline" size={40} color={COLORS.gray} />
        </View>
      )}
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.nombre}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>{item.descripcion}</Text>
        
        <View style={styles.productDetails}>
          <View style={styles.stockContainer}>
            <Ionicons name="cube-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.stockText}>Stock: {item.stock}</Text>
          </View>
          <Text style={styles.productPrice}>${item.precio.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="print-outline" size={60} color={COLORS.gray} />
      <Text style={styles.emptyStateTitle}>No hay productos disponibles</Text>
      <Text style={styles.emptyStateText}>No se encontraron impresoras en el catálogo</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={60} color={COLORS.danger} />
      <Text style={styles.errorStateTitle}>Error al cargar productos</Text>
      <Text style={styles.errorStateText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => dispatch(fetchProductsByCategory(11))}
      >
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Catálogo de Impresoras</Text>
        <Text style={styles.subtitle}>{products.length} productos disponibles</Text>
      </View>

      {error ? (
        renderError()
      ) : products.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshing={loading}
          onRefresh={() => dispatch(fetchProductsByCategory(11))}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    ...theme.typography.h1,
    color: COLORS.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.lightGray,
  },
  productImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: theme.spacing.md,
  },
  productName: {
    ...theme.typography.subtitle,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  productDescription: {
    ...theme.typography.caption,
    color: COLORS.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    ...theme.typography.caption,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  productPrice: {
    ...theme.typography.subtitle,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: COLORS.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateTitle: {
    ...theme.typography.h3,
    color: COLORS.text,
    marginTop: theme.spacing.md,
  },
  emptyStateText: {
    ...theme.typography.body,
    color: COLORS.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorStateTitle: {
    ...theme.typography.h3,
    color: COLORS.danger,
    marginTop: theme.spacing.md,
  },
  errorStateText: {
    ...theme.typography.body,
    color: COLORS.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.lg,
  },
  retryButtonText: {
    ...theme.typography.bodyBold,
    color: COLORS.white,
  },
});

export default CatalogScreen;
