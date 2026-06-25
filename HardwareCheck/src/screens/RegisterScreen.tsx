import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { colors } from '../Theme/Colors';
import { supabase } from '../services/supabaseClient';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim() }
        }
      });

      if (error) {
        Alert.alert(
          error.message.includes('already') ? 'Correo ya registrado' : 'Error al registrarse',
          error.message.includes('already') 
            ? 'Ya existe una cuenta con este correo electrónico.' 
            : error.message
        );
     } else if (data.user) {
        Alert.alert(
          '¡Registro exitoso! 🎉',
          'Tu cuenta ha sido creada correctamente.\n\nAhora puedes iniciar sesión.',
          [
            { 
              text: 'Ir a Iniciar Sesión', 
              onPress: () => navigation.navigate('Login')   // Cambiado de replace a navigate
            }
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Ingresa tus datos</Text>

          <CustomInput
            label="Nombre completo"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Juan Pérez García"
          />

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
            placeholder="Mínimo 6 caracteres"
          />

          <CustomButton
            title={loading ? "Registrando..." : "Registrarse"}
            onPress={handleRegister}
            variant="primary"
            disabled={loading}
          />

          <CustomButton
            title="Volver"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
});