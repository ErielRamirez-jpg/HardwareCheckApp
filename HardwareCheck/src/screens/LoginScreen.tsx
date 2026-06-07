import React, { useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Importamos lo que creamos
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { colors } from '../Theme/Colors';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    
    // Simulación de login (puedes mejorar esto después)
    setTimeout(() => {
      setLoading(false);
      navigation.replace('HomeTabs');
    }, 800);
  };

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
        
        <CustomInput
          label="Correo electrónico"
          type="email"
          value={email}
          onChangeText={setEmail}
        />

        <CustomInput
          label="Contraseña"
          type="password"
          value={password}
          onChangeText={setPassword}
        />

        <CustomButton
          title="Iniciar Sesión"
          onPress={handleLogin}
          variant="primary"
          disabled={loading}
        />

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
    backgroundColor: colors.background,
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
    color: colors.text,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  bypassLink: {
    color: colors.primary,
    marginTop: 30,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});