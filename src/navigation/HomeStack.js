import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from '../screens/main/HomeScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import PaymentScreen from '../screens/main/PaymentScreen';
import COLORS from '../constants/colors';
import ProfileScreen from '../screens/main/ProfileScreen';
import { View } from 'react-native';

const Stack = createStackNavigator();

// Componente para envolver las pantallas con SafeAreaView
const SafeAreaWrapper = ({ children }) => (
  <View style={{ flex: 1 }}>
    <SafeAreaView 
      style={{ flex: 1 }}
      edges={['right', 'left', 'top']}
    >
      {children}
    </SafeAreaView>
  </View>
);

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="Home">
        {() => (
          <SafeAreaWrapper>
            <HomeScreen />
          </SafeAreaWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{
          headerShown: true,
          title: 'Detalles del Producto',
          headerBackTitle: 'Atrás',
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: '#000',
        }}
      />
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{
          headerShown: true,
          title: 'Pago',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          headerShown: true,
          title: 'Mi Perfil',
          headerBackTitle: 'Atrás',
          headerStyle: {
            backgroundColor: COLORS.primary,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
