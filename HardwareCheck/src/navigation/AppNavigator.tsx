import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';   // ← Añadido

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user } = useAuth();   // ← Añadido

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "HomeTabs" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="HomeTabs" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}