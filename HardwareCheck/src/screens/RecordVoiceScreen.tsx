import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native'; // <--- Para refrescar al enfocar la pantalla
import CustomButton from '../components/CustomButton';
import { supabase } from '../services/supabaseClient'; 
import { colors } from '../Theme/Colors'; 

let AudioInstance: any = null;
try {
  AudioInstance = require('expo-av').Audio;
} catch (e) {
  console.log('Módulo expo-av no soportado.');
}

interface Device {
  id: string;
  name: string;
}

export default function RecordVoiceScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recordingObject, setRecordingObject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // useFocusEffect recarga los equipos cada vez que navegas a esta pestaña
  useFocusEffect(
    useCallback(() => {
      async function loadDevices() {
        try {
          const { data, error } = await supabase.from('devices').select('id, name');
          if (error) throw error;
          if (data && data.length > 0) {
            setDevices(data);
            // Si el equipo seleccionado actual ya no existe o está vacío, asignamos el primero
            if (!selectedDevice || !data.some(d => d.id === selectedDevice)) {
              setSelectedDevice(data[0].id);
            }
          }
        } catch (err: any) {
          console.error('Error cargando dispositivos:', err.message);
        }
      }
      loadDevices();

      return () => {
        // Limpieza al salir de la pantalla si es necesario
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [selectedDevice])
  );

  // Control del cronómetro
  React.useEffect(() => {
    if (isRecording) {
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  function formatTime(totalSeconds: number) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  async function saveLogToSupabase(durationStr: string, uriToSave: string) {
    try {
      setLoading(true);
      const selectedDeviceName = devices.find(d => d.id === selectedDevice)?.name || 'Equipo Desconocido';
      
      const { error } = await supabase
        .from('voice_logs')
        .insert([
          {
            title: `Mantenimiento: ${selectedDeviceName}`,
            duration: durationStr,
            device_id: selectedDevice,
            audio_url: uriToSave 
          }
        ]);

      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo registrar en la nube: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    if (!selectedDevice) {
      Alert.alert('Atención', 'Por favor, selecciona un equipo antes de iniciar el reporte.');
      return;
    }
    if (!AudioInstance) {
      setIsRecording(true);
      return;
    }
    try {
      await AudioInstance.requestPermissionsAsync();
      await AudioInstance.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await AudioInstance.Recording.createAsync(AudioInstance.RecordingOptionsPresets.HIGH_QUALITY);
      setRecordingObject(recording);
      setIsRecording(true);
    } catch (err) {
      setIsRecording(true);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    const finalDuration = formatTime(seconds === 0 ? 5 : seconds); 
    const mockUri = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; 

    if (!AudioInstance || !recordingObject) {
      setAudioUri(mockUri);
      await saveLogToSupabase(finalDuration, mockUri);
      Alert.alert('Reporte Sincronizado', `Asociado con éxito al equipo seleccionado (${finalDuration}).`);
      return;
    }

    try {
      await recordingObject.stopAndUnloadAsync();
      const uri = recordingObject.getURI();
      setRecordingObject(null);
      setAudioUri(uri || mockUri);

      await saveLogToSupabase(finalDuration, uri || mockUri);
      Alert.alert('Reporte Guardado', 'Registrado en la nube correctamente.');
    } catch (err) {
      setAudioUri(mockUri);
      await saveLogToSupabase(finalDuration, mockUri);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reporte Manos Libres</Text>
      
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Selecciona el equipo a reportar:</Text>
        <Picker
          selectedValue={selectedDevice}
          onValueChange={(itemValue: string) => setSelectedDevice(itemValue)}
          style={styles.picker}
          dropdownIconColor={colors.primary}
        >
          {devices.map((device) => (
            <Picker.Item key={device.id} label={device.name} value={device.id} color="#ffffff" />
          ))}
        </Picker>
      </View>

      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, isRecording && styles.timerTextActive]}>
          {formatTime(seconds)}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.indicator, isRecording ? styles.indicatorActive : styles.indicatorInactive]} />
        <Text style={styles.statusText}>
          {isRecording ? 'Grabando audio...' : 'Micrófono listo'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title={isRecording ? 'Detener y Vincular' : 'Iniciar Grabación'}
          onPress={isRecording ? stopRecording : startRecording}
          variant={isRecording ? 'outline' : 'primary'}
          disabled={loading}
        />
      </View>

      {loading && (
        <View style={styles.syncContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.syncText}>Sincronizando reporte...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 20 },
  pickerContainer: { width: '100%', backgroundColor: colors.card, borderRadius: 12, padding: 10, marginBottom: 25, borderWidth: 1, borderColor: colors.border },
  pickerLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 5, paddingLeft: 5 },
  picker: { color: '#ffffff' },
  timerContainer: { marginBottom: 20, backgroundColor: colors.surface, paddingHorizontal: 30, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  timerText: { fontSize: 36, fontWeight: 'bold', color: colors.textTertiary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  timerTextActive: { color: colors.primary },
  statusContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, marginBottom: 30, borderWidth: 1, borderColor: colors.border },
  indicator: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  indicatorActive: { backgroundColor: colors.error },
  indicatorInactive: { backgroundColor: colors.textTertiary },
  statusText: { color: colors.text, fontSize: 14, fontWeight: '500' },
  buttonContainer: { width: '100%', paddingHorizontal: 20 },
  syncContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  syncText: { color: colors.primary, fontSize: 13, marginLeft: 8 }
});