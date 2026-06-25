import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import RecordVoiceScreen from '../screens/RecordVoiceScreen';
import VoiceHistoryScreen from '../screens/VoiceHistoryScreen';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';

import { HomeTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<HomeTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1f1f1f',
        },
        headerTintColor: '#ffffff',
        tabBarStyle: {
          backgroundColor: '#1f1f1f',
          borderTopColor: '#333333',
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#00e676',
        tabBarInactiveTintColor: '#aaaaaa',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen 
        name="Scan" 
        component={ScanScreen} 
        options={{
          title: 'Escáner QR',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen 
        name="RecordVoice" 
        component={RecordVoiceScreen} 
        options={{
          title: 'Grabar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mic-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen 
        name="VoiceHistory" 
        component={VoiceHistoryScreen} 
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen 
        name="Configuracion" 
        component={ConfiguracionScreen} 
        options={{
          title: 'Configuración',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

    </Tab.Navigator>
  );
}