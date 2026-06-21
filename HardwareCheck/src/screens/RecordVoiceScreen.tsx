import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Audio } from 'expo-av';
import CustomButton from '../components/CustomButton';

export default function RecordVoiceScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  // Iniciar la grabación de audio
  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Solicitando permisos de micrófono...');
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Iniciando grabación...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('Grabando...');
    } catch (err) {
      console.error('Error al iniciar la grabación', err);
      Alert.alert('Error', 'No se pudo iniciar la grabación de audio.');
    }
  }

  // Detener la grabación de audio
  async function stopRecording() {
    console.log('Deteniendo grabación...');
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    
    const uri = recording.getURI();
    setRecording(null);
    setAudioUri(uri);
    console.log('Grabación guardada en:', uri);

    Alert.alert(
      'Reporte Guardado',
      'La nota de voz se ha registrado con éxito en la bitácora técnica de este mantenimiento.',
      [{ text: 'Entendido' }]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reporte Manos Libres</Text>
      <Text style={styles.description}>
        Graba notas de voz durante el mantenimiento para documentar tus hallazgos.
      </Text>

      <View style={styles.statusContainer}>
        <View style={[styles.indicator, isRecording ? styles.indicatorActive : styles.indicatorInactive]} />
        <Text style={styles.statusText}>
          {isRecording ? 'Grabando audio en alta calidad...' : 'Micrófono listo para reportar'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title={isRecording ? 'Detener Reporte' : 'Iniciar Grabación'}
          onPress={isRecording ? stopRecording : startRecording}
          variant={isRecording ? 'outline' : 'primary'}
        />
      </View>

      {audioUri && (
        <Text style={styles.uriText} numberOfLines={1}>
          Archivo generado: {audioUri.split('/').pop()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
    marginBottom: 40,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 40,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  indicatorActive: {
    backgroundColor: '#FF3B5C', // Rojo titilante de grabación
  },
  indicatorInactive: {
    backgroundColor: '#aaaaaa',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  uriText: {
    color: '#8A8A8A',
    fontSize: 12,
    marginTop: 20,
    fontStyle: 'italic',
  },
});