import React from 'react';
import { Provider } from 'react-redux'; // Si usas Redux
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext'; // Ajusta la ruta de tu AuthContext
import AppNavigator from './src/navigation/AppNavigator';
import { store } from './src/store'; // Si usas Redux

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        {/* CRÍTICO: El AuthProvider debe envolver al AppNavigator */}
        <AuthProvider> 
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </Provider>
  );
}