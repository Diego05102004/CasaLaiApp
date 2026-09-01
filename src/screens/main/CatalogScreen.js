import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import ProductCard from '../../components/ProductCard';
import ComboCard from '../../components/ComboCard';
import COLORS from '../../constants/colors';
import theme from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const CatalogScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { products, combos, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const catalogItems = [...(products || []), ...(combos || [])];

  const renderCatalogItem = ({ item }) => (
    item?.isCombo || item?.type === 'combo'
      ? <ComboCard combo={item} />
      : <ProductCard product={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="print-outline" size={60} color={COLORS.gray} />
      <Text style={styles.emptyStateTitle}>No hay productos disponibles</Text>
      <Text style={styles.emptyStateText}>No se encontraron productos ni combos en el catálogo</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={60} color={COLORS.danger} />
      <Text style={styles.errorStateTitle}>Error al cargar productos</Text>
      <Text style={styles.errorStateText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => dispatch(fetchProducts())}
      >
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && catalogItems.length === 0) {
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
        <Text style={styles.title}>Catálogo</Text>
        <Text style={styles.subtitle}>
          {products.length} productos y {combos.length} combos disponibles
        </Text>
      </View>

      {error ? (
        renderError()
      ) : catalogItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={catalogItems}
          renderItem={renderCatalogItem}
          keyExtractor={(item) => `${item.type || 'product'}-${item.id}`}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshing={loading}
          onRefresh={() => dispatch(fetchProducts())}
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
