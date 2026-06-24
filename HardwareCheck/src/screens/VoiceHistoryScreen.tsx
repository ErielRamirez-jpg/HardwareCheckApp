import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setGlobalLogs, removeGlobalLog } from '../store';
import { supabase } from '../services/supabaseClient';
import { colors } from '../Theme/Colors';

let AudioInstance: any = null;
try {
  AudioInstance = require('expo-av').Audio;
} catch (e) {
  console.log('Módulo de reproducción no disponible.');
}

export default function VoiceHistoryScreen() {
  // 1. LEEMOS LOS LOGS DESDE EL ESTADO GLOBAL DE REDUX
  const logs = useSelector((state: RootState) => state.voice.logs);
  const dispatch = useDispatch();

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
      
      // 2. GUARDAMOS EL CONTENIDO EN REDUX
      dispatch(setGlobalLogs(data || []));
    } catch (error: any) {
      console.error('Error fetching logs:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchVoiceLogs();
      return () => {
        if (soundObject) soundObject.unloadAsync();
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

  async function confirmDeleteLog(id: string) {
    Alert.alert(
      'Eliminar reporte',
      '¿Estás seguro de que quieres borrar esta nota de voz?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
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

              // 3. ELIMINAMOS TAMBIÉN DEL ESTADO GLOBAL DE REDUX
              dispatch(removeGlobalLog(id));
              console.log('Registro eliminado de Redux y Supabase con éxito.');
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
      <Text style={styles.subtitle}>Manejado con Redux global y persistencia en Supabase</Text>

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

            <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteLog(item.id)}>
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
  cardContainer: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cardPlaying: { borderColor: colors.primary, backgroundColor: colors.surface },
  cardMainAction: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: colors.text, flex: 1, marginRight: 10 },
  durationBadge: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  cardDate: { fontSize: 12, color: colors.textTertiary },
  deleteButton: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#2a1a1a', paddingHorizontal: 20, borderLeftWidth: 1, borderLeftColor: colors.border },
  deleteIcon: { fontSize: 16 }
});