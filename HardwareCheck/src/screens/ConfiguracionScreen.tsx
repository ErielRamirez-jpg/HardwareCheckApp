import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const ConfiguracionScreen = () => {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    Alert.alert(
      language === 'es' ? 'Tema cambiado' : 'Theme changed',
      language === 'es' ? `Modo ${isDarkMode ? 'Claro' : 'Oscuro'}` : `Switched to ${isDarkMode ? 'Light' : 'Dark'}`
    );
  };

  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    setLanguage(newLang);
    Alert.alert(
      language === 'es' ? 'Idioma cambiado' : 'Language changed',
      newLang === 'es' ? '🇪🇸 Español' : '🇺🇸 English'
    );
  };

  const handleLogout = () => {
    Alert.alert(
      language === 'es' ? 'Cerrar Sesión' : 'Log Out',
      language === 'es' ? '¿Estás seguro?' : 'Are you sure?',
      [
        { text: language === 'es' ? 'Cancelar' : 'Cancel', style: 'cancel' },
        {
          text: language === 'es' ? 'Sí, cerrar' : 'Yes',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0A0A0A' : '#F5F5F5' }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
        {language === 'es' ? 'Configuración' : 'Settings'}
      </Text>

      {/* Idioma */}
      <View style={styles.option}>
        <Text style={[styles.optionText, { color: isDarkMode ? '#fff' : '#000' }]}>
          {language === 'es' ? 'Idioma' : 'Language'}
        </Text>
        <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
          <Text style={styles.langText}>
            {language === 'es' ? '🇪🇸 Español' : '🇺🇸 English'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tema */}
      <View style={styles.option}>
        <Text style={[styles.optionText, { color: isDarkMode ? '#fff' : '#000' }]}>
          {language === 'es' ? 'Tema' : 'Theme'}
        </Text>
        <View style={styles.switchContainer}>
          <Text style={{ color: isDarkMode ? '#aaa' : '#666', marginRight: 10 }}>
            {isDarkMode ? (language === 'es' ? 'Oscuro' : 'Dark') : (language === 'es' ? 'Claro' : 'Light')}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#444', true: '#00FF9F' }}
            thumbColor={isDarkMode ? '#00CC7A' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Cerrar Sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>
          {language === 'es' ? 'Cerrar Sesión' : 'Log Out'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  optionText: { fontSize: 18 },
  langButton: {
    backgroundColor: '#00FF9F',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  langText: { color: '#000', fontWeight: '600' },
  switchContainer: { flexDirection: 'row', alignItems: 'center' },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: '#FF3B5C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default ConfiguracionScreen;