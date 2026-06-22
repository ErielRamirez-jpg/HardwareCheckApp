import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert, ScrollView, TextInput, Modal, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabaseClient';
import CustomButton from '../components/CustomButton';

type Device = {
  id: string;
  name: string;
  description: string;
  status: 'OK' | 'WARNING' | 'CRITICO';
  last_maintenance: string;
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export default function DeviceDetailScreen({ route, navigation }: any) {
  const { deviceId } = route.params || { deviceId: '1' }; 
  const [device, setDevice] = useState<Device | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Estados para el Modal de Edición
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<'OK' | 'WARNING' | 'CRITICO'>('OK'); // <-- NUEVO: Estado para editar estatus

  useEffect(() => {
    fetchDeviceData();
  }, [deviceId]);

  async function fetchDeviceData() {
    try {
      setLoading(true);
      const { data: deviceData, error: deviceError } = await supabase
        .from('devices')
        .select('*')
        .eq('id', deviceId)
        .single();

      if (deviceError) throw deviceError;
      setDevice(deviceData);
      setEditName(deviceData.name);
      setEditDescription(deviceData.description);
      setEditStatus(deviceData.status); // Inicializar estatus actual

      const { data: tasksData, error: tasksError } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('device_id', deviceId);

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
    } catch (error: any) {
      Alert.alert('Error de Conexión', error.message);
    } finally {
      setLoading(false);
    }
  }

  // ACCIÓN: Resolver Mantenimiento Rápido (Set OK)
  async function resolveMaintenance() {
    if (!device) return;
    try {
      setUpdating(true);
      const currentDate = new Date().toLocaleDateString('es-HN', { year: 'numeric', month: 'long' });
      const { error } = await supabase
        .from('devices')
        .update({ status: 'OK', last_maintenance: `Último mantenimiento: ${currentDate}` })
        .eq('id', deviceId);

      if (error) throw error;
      setDevice({ ...device, status: 'OK', last_maintenance: `Último mantenimiento: ${currentDate}` });
      setEditStatus('OK');
      Alert.alert('Éxito', 'Estado actualizado a OK de forma exitosa.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(false);
    }
  }

  // ACCIÓN: Editar Dispositivo (AHORA INCLUYE NOMBRE, DESCRIPCIÓN Y STATUS)
  async function handleUpdateDevice() {
    try {
      setUpdating(true);
      const currentDate = new Date().toLocaleDateString('es-HN', { year: 'numeric', month: 'long' });
      
      const { error } = await supabase
        .from('devices')
        .update({ 
          name: editName, 
          description: editDescription,
          status: editStatus,
          last_maintenance: `Actualizado el: ${currentDate}`
        })
        .eq('id', deviceId);

      if (error) throw error;
      
      setDevice(device ? { 
        ...device, 
        name: editName, 
        description: editDescription, 
        status: editStatus,
        last_maintenance: `Actualizado el: ${currentDate}`
      } : null);
      
      setIsEditModalVisible(false);
      Alert.alert('Éxito', 'Dispositivo y estatus actualizados correctamente.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(false);
    }
  }

  // ACCIÓN: Eliminar Dispositivo (CON SOLUCIÓN CASCADA PARA RELACIONES)
  async function handleDeleteDevice() {
    Alert.alert(
      'Eliminar Equipo',
      '¿Estás seguro de que deseas eliminar este dispositivo? Se borrarán también todas sus tareas asociadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // 1. SOLUCIÓN CRÍTICA: Eliminar primero las tareas vinculadas para evitar el fallo de Foreign Key
              const { error: tasksDeleteError } = await supabase
                .from('maintenance_tasks')
                .delete()
                .eq('device_id', deviceId);
                
              if (tasksDeleteError) throw tasksDeleteError;

              // 2. Ahora que está libre de dependencias, borramos el dispositivo
              const { error: deviceDeleteError } = await supabase
                .from('devices')
                .delete()
                .eq('id', deviceId);
                
              if (deviceDeleteError) throw deviceDeleteError;
              
              Alert.alert('Eliminado', 'El dispositivo fue removido por completo.');
              navigation.goBack(); 
            } catch (error: any) {
              console.error(error);
              Alert.alert('Error al eliminar', error.message || 'Problema de restricciones en Supabase');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  async function toggleTaskCompletion(taskId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase.from('maintenance_tasks').update({ completed: !currentStatus }).eq('id', taskId);
      if (error) throw error;
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00875F" />
        <Text style={styles.loadingText}>Cargando bitácora técnica...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{device?.name}</Text>
          <Text style={styles.description}>{device?.description}</Text>
        </View>
        
        {/* BOTÓN: Abrir Modal de Edición */}
        <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditModalVisible(true)}>
          <Text style={styles.editBtnText}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.dateText}>{device?.last_maintenance}</Text>

      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>Estado Actual:</Text>
        <View style={[
          styles.badge, 
          device?.status === 'OK' && styles.badgeOk,
          device?.status === 'WARNING' && styles.badgeWarning,
          device?.status === 'CRITICO' && styles.badgeCritico
        ]}>
          <Text style={styles.badgeText}>{device?.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Tareas de Control Técnico</Text>
      {tasks.length === 0 ? (
        <Text style={styles.noTasks}>No hay tareas asignadas.</Text>
      ) : (
        tasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <Text style={[styles.taskTitle, task.completed && styles.taskCompletedText]}>{task.title}</Text>
            <View style={styles.taskButtonContainer}>
              <CustomButton
                title={task.completed ? 'Terminada ✓' : 'Marcar Terminada'}
                onPress={() => toggleTaskCompletion(task.id, task.completed)}
                variant={task.completed ? 'outline' : 'primary'}
              />
            </View>
          </View>
        ))
      )}

      <View style={styles.divider} />

      {device?.status !== 'OK' && (
        <View style={styles.actionContainer}>
          <CustomButton
            title={updating ? 'Actualizando...' : 'Finalizar Mantenimiento (Set OK)'}
            onPress={resolveMaintenance}
            disabled={updating}
            variant="primary"
          />
        </View>
      )}

      {/* BOTÓN: Eliminar dispositivo */}
      <View style={{ marginTop: 10 }}>
        <CustomButton 
          title="Eliminar Dispositivo de Bitácora" 
          onPress={handleDeleteDevice} 
          variant="outline" 
        />
      </View>

      <View style={styles.backButtonContainer}>
        <CustomButton title="Volver al Inicio" onPress={() => navigation.goBack()} variant="outline" />
      </View>

      {/* MODAL PARA EDITAR INFORMACIÓN Y CAMBIAR ESTATUS */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Equipo</Text>
            
            <Text style={styles.label}>Nombre:</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Nombre del dispositivo" placeholderTextColor="#666" />
            
            <Text style={styles.label}>Descripción:</Text>
            <TextInput style={styles.input} value={editDescription} onChangeText={setEditDescription} placeholder="Descripción" placeholderTextColor="#666" />
            
            {/* AGREGADO: Selector de Estatus Dinámico */}
            <Text style={styles.label}>Cambiar Estado:</Text>
            <View style={styles.statusSelectorContainer}>
              <TouchableOpacity 
                style={[styles.statusOption, editStatus === 'OK' && styles.statusOkActive]}
                onPress={() => setEditStatus('OK')}
              >
                <Text style={[styles.statusText, editStatus === 'OK' && styles.textActive]}>OK</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.statusOption, editStatus === 'WARNING' && styles.statusWarningActive]}
                onPress={() => setEditStatus('WARNING')}
              >
                <Text style={[styles.statusText, editStatus === 'WARNING' && styles.textActive]}>WARNING</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.statusOption, editStatus === 'CRITICO' && styles.statusCriticoActive]}
                onPress={() => setEditStatus('CRITICO')}
              >
                <Text style={[styles.statusText, editStatus === 'CRITICO' && styles.textActive]}>CRÍTICO</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setIsEditModalVisible(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleUpdateDevice} disabled={updating}>
                <Text style={styles.btnText}>{updating ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  center: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#ffffff', marginTop: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  description: { fontSize: 16, color: '#aaaaaa', marginTop: 4 },
  editBtn: { backgroundColor: '#1E1E1E', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  editBtnText: { color: '#00875F', fontWeight: 'bold', fontSize: 14 },
  dateText: { fontSize: 13, color: '#666666', marginBottom: 20, fontStyle: 'italic', marginTop: 4 },
  statusBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 14, borderRadius: 8 },
  statusLabel: { color: '#ffffff', fontSize: 15, marginRight: 10 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeOk: { backgroundColor: '#00875F' },
  badgeWarning: { backgroundColor: '#D97706' },
  badgeCritico: { backgroundColor: '#E11D48' },
  badgeText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#2A2A2A', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 16 },
  noTasks: { color: '#666666', fontStyle: 'italic' },
  taskCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 12, borderRadius: 8, marginBottom: 10 },
  taskTitle: { color: '#ffffff', fontSize: 14, flex: 1, marginRight: 10 },
  taskCompletedText: { textDecorationLine: 'line-through', color: '#666666' },
  taskButtonContainer: { paddingVertical: 6, paddingHorizontal: 12, minHeight: 36 },
  actionContainer: { marginTop: 10 },
  backButtonContainer: { marginTop: 12, marginBottom: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 15 },
  label: { color: '#aaa', fontSize: 14, marginBottom: 6, marginTop: 10, fontWeight: '600' },
  input: { backgroundColor: '#121212', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 5, fontSize: 16 },
  statusSelectorContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 10 },
  statusOption: { flex: 0.31, paddingVertical: 10, backgroundColor: '#121212', borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  statusText: { color: '#aaa', fontWeight: 'bold', fontSize: 12 },
  statusOkActive: { backgroundColor: '#00875F', borderColor: '#00875F' },
  statusWarningActive: { backgroundColor: '#D97706', borderColor: '#D97706' },
  statusCriticoActive: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  textActive: { color: '#fff' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 0.48, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { borderWidth: 1, borderColor: '#666' },
  saveBtn: { backgroundColor: '#00875F' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});