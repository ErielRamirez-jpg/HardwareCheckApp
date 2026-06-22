import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { supabase } from '../services/supabaseClient';
import ComponentCard from '../components/ComponentCard';

type Device = {
  id: string;
  name: string;
  description: string;
  status: 'OK' | 'WARNING' | 'CRITICO';
  last_maintenance: string;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused(); 
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de Agregar Nuevo Equipo
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<'OK' | 'WARNING' | 'CRITICO'>('OK'); // <-- ESTADO PARA EL STATUS
  const [inserting, setInserting] = useState(false);

  // Cargar dispositivos de Supabase
  async function fetchDevices() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setDevices(data || []);
    } catch (error: any) {
      Alert.alert('Error al cargar datos', error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isFocused) {
      fetchDevices();
    }
  }, [isFocused]);

  // FUNCIÓN PARA AGREGAR EL EQUIPO EN SUPABASE
  async function handleAddDevice() {
    if (!newName.trim() || !newDescription.trim()) {
      Alert.alert('Campos vacíos', 'Por favor ingresa el nombre y la descripción del equipo.');
      return;
    }

    try {
      setInserting(true);
      const currentDate = new Date().toLocaleDateString('es-HN', { year: 'numeric', month: 'long' });
      const manualId = Date.now().toString();

      const { data, error } = await supabase
        .from('devices')
        .insert([
          {
            id: manualId,
            name: newName.trim(),
            description: newDescription.trim(),
            status: newStatus, // <-- AHORA SE GUARDA EL ESTADO SELECCIONADO
            last_maintenance: `Registrado el: ${currentDate}`
          }
        ])
        .select();

      if (error) throw error;

      Alert.alert('Éxito', 'Equipo registrado correctamente en la bitácora.');
      setIsAddModalVisible(false);
      setNewName('');
      setNewDescription('');
      setNewStatus('OK'); // Reset del estado
      
      fetchDevices();
    } catch (error: any) {
      console.error("Error completo de Supabase al insertar:", error);
      Alert.alert('Error al guardar', error.message || 'Error desconocido.');
    } finally {
      setInserting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00875F" />
        <Text style={styles.loadingText}>Sincronizando con Supabase...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.backgroundColorContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>HardwareCheck</Text>
        <Text style={styles.subtitle}>Bitácora de Mantenimiento</Text>

        {/* BARRA DE ACCIÓN RÁPIDA */}
        <View style={styles.actionHeader}>
          <Text style={styles.sectionTitle}>Equipos bajo Control</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setIsAddModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ AGREGAR</Text>
          </TouchableOpacity>
        </View>

        {/* LISTADO DE COMPONENTES */}
        <View style={styles.listContainer}>
          {devices.length === 0 ? (
            <Text style={styles.noDataText}>No hay dispositivos registrados en la base de datos.</Text>
          ) : (
            devices.map((item) => {
              const lowerStatus = item.status.toLowerCase() as 'ok' | 'warning' | 'critico';
              const cardData = {
                ...item,
                status: lowerStatus,
                type: lowerStatus 
              };

              return (
                <ComponentCard
                  key={item.id}
                  data={cardData}
                  onPress={() => navigation.navigate('DeviceDetail', { deviceId: item.id })}
                />
              );
            })
          )}
        </View>
      </View>

      {/* MODAL DE REGISTRO PARA NUEVOS EQUIPOS */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registrar Nuevo Equipo</Text>
            
            <TextInput 
              style={styles.input} 
              value={newName} 
              onChangeText={setNewName} 
              placeholder="Nombre del equipo (ej. Servidor Central)" 
              placeholderTextColor="#666" 
            />
            
            <TextInput 
              style={styles.input} 
              value={newDescription} 
              onChangeText={setNewDescription} 
              placeholder="Descripción o especificaciones" 
              placeholderTextColor="#666" 
            />

            {/* SELECCIÓN DE ESTADO ANTES DE GUARDAR */}
            <Text style={styles.label}>Estado del Equipo:</Text>
            <View style={styles.statusSelectorContainer}>
              <TouchableOpacity 
                style={[styles.statusOption, newStatus === 'OK' && styles.statusOkActive]}
                onPress={() => setNewStatus('OK')}
              >
                <Text style={[styles.statusText, newStatus === 'OK' && styles.textActive]}>OK</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.statusOption, newStatus === 'WARNING' && styles.statusWarningActive]}
                onPress={() => setNewStatus('WARNING')}
              >
                <Text style={[styles.statusText, newStatus === 'WARNING' && styles.textActive]}>WARNING</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.statusOption, newStatus === 'CRITICO' && styles.statusCriticoActive]}
                onPress={() => setNewStatus('CRITICO')}
              >
                <Text style={[styles.statusText, newStatus === 'CRITICO' && styles.textActive]}>CRÍTICO</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, styles.saveBtn]} 
                onPress={handleAddDevice}
                disabled={inserting}
              >
                <Text style={styles.btnText}>{inserting ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backgroundColorContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 30,
  },
  center: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaaaaa',
    marginBottom: 25,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#00875F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  listContainer: {
    width: '100%',
  },
  noDataText: {
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'center', 
    padding: 20 
  },
  modalContent: { 
    backgroundColor: '#1E1E1E', 
    padding: 20, 
    borderRadius: 12 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#ffffff', 
    marginBottom: 15 
  },
  input: { 
    backgroundColor: '#121212', 
    color: '#fff', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 12, 
    fontSize: 16 
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600'
  },
  statusSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  statusOption: {
    flex: 0.31,
    paddingVertical: 10,
    backgroundColor: '#121212',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333'
  },
  statusText: {
    color: '#aaa',
    fontWeight: 'bold',
    fontSize: 12
  },
  statusOkActive: {
    backgroundColor: '#00875F',
    borderColor: '#00875F'
  },
  statusWarningActive: {
    backgroundColor: '#FFB800',
    borderColor: '#FFB800'
  },
  statusCriticoActive: {
    backgroundColor: '#E25858',
    borderColor: '#E25858'
  },
  textActive: {
    color: '#fff'
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },
  modalBtn: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#666',
  },
  saveBtn: {
    backgroundColor: '#00875F',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});