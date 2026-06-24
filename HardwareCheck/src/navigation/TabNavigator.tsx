import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import RecordVoiceScreen from '../screens/RecordVoiceScreen';
import VoiceHistoryScreen from '../screens/VoiceHistoryScreen'; // <--- 1. IMPORTAMOS LA NUEVA PANTALLA
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
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Scan" 
        component={ScanScreen} 
        options={{ title: 'Escáner QR' }}
      />
      <Tab.Screen 
        name="RecordVoice" 
        component={RecordVoiceScreen} 
        options={{ title: 'Grabar' }}
      />
      
      <Tab.Screen 
        name="VoiceHistory" 
        component={VoiceHistoryScreen} 
        options={{ title: 'Historial' }}
      />
    </Tab.Navigator>
  );
}