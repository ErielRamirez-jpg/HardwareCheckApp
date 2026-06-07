import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { colors } from '../Theme/Colors';

interface CustomInputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'phone';
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  type = 'text',
  value,
  onChangeText,
  error,
}) => {
  const [internalError, setInternalError] = useState('');

  const validate = (text: string) => {
    if (!text.trim()) return 'Este campo es requerido';

    if (type === 'email') {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(text)) return 'Correo electrónico inválido';
    }

    if (type === 'phone') {
      const regex = /^[\+]?[\d\s\-\(\)]{8,15}$/;
      if (!regex.test(text)) return 'Número de teléfono inválido';
    }

    if (type === 'password' && text.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    return '';
  };

  const handleChange = (text: string) => {
    onChangeText(text);
    setInternalError(validate(text));
  };

  const showError = error || internalError;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TextInput
        style={[styles.input, showError ? styles.inputError : {}]}
        value={value}
        onChangeText={handleChange}
        secureTextEntry={type === 'password'}
        keyboardType={type === 'email' ? 'email-address' : type === 'phone' ? 'phone-pad' : 'default'}
        autoCapitalize="none"
      />
      
      {showError && <Text style={styles.errorText}>{showError}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    color: colors.textSecondary,
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    fontSize: 16,
  },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4 },
});

export default CustomInput;