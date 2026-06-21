import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux'; 
import { store } from './src/store';    
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';  

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
}