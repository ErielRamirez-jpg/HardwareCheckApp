import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { colors } from '../Theme/Colors';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa correo y contraseña');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error de inicio de sesión', error.message);
    } else if (data.user) {
      login({ 
        id: data.user.id, 
        email: data.user.email! 
      });
    }
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
          placeholder="ejemplo@correo.com"
        />

        <CustomInput
          label="Contraseña"
          type="password"
          value={password}
          onChangeText={setPassword}
          placeholder="Ingresa tu contraseña"
        />

        <CustomButton
          title={loading ? "Procesando..." : "Iniciar Sesión"}
          onPress={handleLogin}
          variant="primary"
          disabled={loading}
        />

        <CustomButton
          title="Registrarse"
          onPress={() => navigation.navigate('Register')}
          variant="secondary"
        />

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
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
});