import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TabNavigator from './TabNavigator';
import DeviceDetailScreen from '../screens/DeviceDetailScreen'; 
import { useAuth } from '../context/AuthContext';   

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();   

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ 
                headerShown: true,
                title: 'Crear Cuenta',
                headerBackTitle: 'Volver',
              }} 
            />
          </>
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