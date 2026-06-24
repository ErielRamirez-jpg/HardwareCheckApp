import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // <--- Para refrescar el historial al entrar
import { supabase } from '../services/supabaseClient';
import { colors } from '../Theme/Colors';

let AudioInstance: any = null;
try {
  AudioInstance = require('expo-av').Audio;
} catch (e) {
  console.log('Módulo de reproducción no disponible.');
}

interface VoiceLog {
  id: string;
  created_at: string;
  title: string;
  duration: string;
  audio_url: string;
}

export default function VoiceHistoryScreen() {
  const [logs, setLogs] = useState<VoiceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [soundObject, setSoundObject] = useState<any>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  async function fetchVoiceLogs() {
    try {
      const { data, error } = await supabase
        .from('voice_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching logs:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Refresca automáticamente la lista cada vez que el usuario vuelve al Historial
  useFocusEffect(
    useCallback(() => {
      fetchVoiceLogs();
      return () => {
        if (soundObject) {
          soundObject.unloadAsync();
        }
      };
    }, [soundObject])
  );

  async function handlePlayAudio(url: string, id: string) {
    if (!AudioInstance) {
      Alert.alert('Simulación de Audio', 'Reproduciendo pista en entorno de pruebas con éxito.');
      return;
    }
    try {
      if (soundObject) {
        await soundObject.unloadAsync();
        setSoundObject(null);
        if (playingId === id) {
          setPlayingId(null);
          return;
        }
      }
      setPlayingId(id);
      const { sound } = await AudioInstance.Sound.createAsync({ uri: url }, { shouldPlay: true });
      setSoundObject(sound);
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          setPlayingId(null);
          setSoundObject(null);
        }
      });
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo reproducir el archivo.');
      setPlayingId(null);
    }
  }

  // Nueva función para eliminar registros de Supabase
  async function confirmDeleteLog(id: string) {
    Alert.alert(
      'Eliminar reporte',
      '¿Estás seguro de que quieres borrar esta nota de voz? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Si el audio que se va a borrar está sonando, lo apagamos primero
              if (playingId === id && soundObject) {
                await soundObject.unloadAsync();
                setSoundObject(null);
                setPlayingId(null);
              }

              const { error } = await supabase
                .from('voice_logs')
                .delete()
                .eq('id', id);

              if (error) throw error;

              // Actualizamos el estado de manera local para una interfaz rápida
              setLogs((prevLogs) => prevLogs.filter(log => log.id !== id));
              console.log('Registro eliminado con éxito.');
            } catch (err: any) {
              Alert.alert('Error', 'No se pudo eliminar el reporte: ' + err.message);
            }
          }
        }
      ]
    );
  }

  function formatDate(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-HN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audios de Mantenimiento</Text>
      <Text style={styles.subtitle}>Presiona un reporte para escuchar o la papelera para eliminar</Text>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchVoiceLogs} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <View style={[styles.cardContainer, playingId === item.id && styles.cardPlaying]}>
            <TouchableOpacity 
              style={styles.cardMainAction} 
              onPress={() => handlePlayAudio(item.audio_url, item.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.durationBadge}>
                  {playingId === item.id ? '🔊 Sonando' : `⏱️ ${item.duration || '0:00'}`}
                </Text>
              </View>
              <Text style={styles.cardDate}>Registrado el: {formatDate(item.created_at)}</Text>
            </TouchableOpacity>

            {/* Botón de eliminación técnica */}
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => confirmDeleteLog(item.id)}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 40 },
  centerContainer: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 20 },
  cardContainer: { 
    flexDirection: 'row', 
    backgroundColor: colors.card, 
    borderRadius: 10, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: colors.border,
    overflow: 'hidden'
  },
  cardPlaying: { borderColor: colors.primary, backgroundColor: colors.surface },
  cardMainAction: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: colors.text, flex: 1, marginRight: 10 },
  durationBadge: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  cardDate: { fontSize: 12, color: colors.textTertiary },
  deleteButton: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#2a1a1a', 
    paddingHorizontal: 20,
    borderLeftWidth: 1,
    borderLeftColor: colors.border
  },
  deleteIcon: { fontSize: 16 }
});