import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import HomeStack from './HomeStack';
import CartScreen from '../screens/main/CartScreen';
import COLORS from '../constants/colors';
import theme from '../constants/theme';

// Desactivar animaciones para no depender de Reanimated
const tabBarOptions = {
  keyboardHidesTabBar: true,
  tabBarHideOnKeyboard: true,
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: 'gray',
  headerShown: false,
  tabBarStyle: {
    display: 'flex',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  tabBarLabelStyle: {
    fontSize: 12,
    marginBottom: 5,
  },
};

const Tab = createBottomTabNavigator();

const CartIconWithBadge = ({ focused, color, size }) => {
  const cartItems = useSelector(state => state.cart.items);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <View>
      <Ionicons 
        name={focused ? 'cart' : 'cart-outline'} 
        size={size} 
        color={color} 
      />
      {itemCount > 0 && (
        <View style={[
          styles.badge,
          { 
            backgroundColor: COLORS.danger,
            borderColor: focused ? COLORS.background : COLORS.white
          }
        ]}>
          <Text style={styles.badgeText}>
            {itemCount > 9 ? '9+' : itemCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...tabBarOptions,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Inicio') {
            return <Ionicons
                     name={focused ? 'home' : 'home-outline'}
                     size={size}
                     color={color}
                   />;
          } else if (route.name === 'Carrito') {
            return <CartIconWithBadge focused={focused} color={color} size={size} />;
          }
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeStack} />
      <Tab.Screen name="Carrito" component={CartScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default BottomTabNavigator;
