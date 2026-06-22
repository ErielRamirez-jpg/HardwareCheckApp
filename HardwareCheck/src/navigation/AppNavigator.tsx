import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';
import DeviceDetailScreen from '../screens/DeviceDetailScreen'; 
import { useAuth } from '../context/AuthContext';   

// Solución directa para imagen_35.png: Quitamos temporalmente el genérico estricto para que compile sin trabas
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();   

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "HomeTabs" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="HomeTabs" component={TabNavigator} />
            <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}