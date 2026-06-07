import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  return (
    <View style={styles.container}>

      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/logo-hardware.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>HardwareCheck</Text>
        <Text style={styles.tagline}>Gestión de Mantenimiento Técnico</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.placeholderText}>
          [Aquí Kevin integrará los CustomInput con validaciones]
        </Text>
        
        <Text style={styles.placeholderText}>
          [Aquí Kevin integrará el CustomButton]
        </Text>

        <Text 
          style={styles.bypassLink}
          onPress={() => navigation.replace('HomeTabs')}
        >
          Entrar directamente (Simulación de Login) →
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#00e676',
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#aaaaaa',
    fontStyle: 'italic',
    marginVertical: 12,
    textAlign: 'center',
  },
  bypassLink: {
    color: '#00e676',
    marginTop: 30,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});