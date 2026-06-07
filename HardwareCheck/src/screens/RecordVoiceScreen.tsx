import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function RecordVoiceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reporte Manos Libres</Text>
      <Text style={styles.description}>
        Espacio para las bitácoras de audio y transcripción de notas de voz.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#aaaaaa',
    textAlign: 'center',
  },
});