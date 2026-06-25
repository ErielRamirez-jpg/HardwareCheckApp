
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { supabase } from '../services/supabaseClient';
import CustomButton from '../components/CustomButton';
import { colors } from '../Theme/Colors';

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para registrar equipo nuevo si no existe el QR
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [qrCodeId, setQrCodeId] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<'OK' | 'WARNING' | 'CRITICO'>('OK');

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  // Resetear el escáner cuando entres o regreses a la pestaña
  useEffect(() => {
    if (isFocused) {
      setScanned(false);
      setLoading(false);
    }
  }, [isFocused]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    // Evitamos escaneos dobles mientras procesamos
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);
    const cleanedId = data.trim();

    try {
      console.log("Escaneado ID:", cleanedId); // Esto te ayudará a ver si el QR se lee bien

      // 1. Buscar si el dispositivo con ese ID de QR ya existe en Supabase
      const { data: device, error } = await supabase
        .from('devices')
        .select('id')
        .eq('id', cleanedId)
        .maybeSingle(); 

      if (error) {
        throw new Error(
          "Error de Supabase (revisa los permisos RLS o el tipo de columna ID): " + error.message
        );
      }

      if (device) {
        // CASO A: ¡Ya existe!
        Alert.alert('Equipo Encontrado', 'Abriendo bitácora del dispositivo...', [
          { text: 'OK', onPress: () => {
            navigation.navigate('DeviceDetail', { deviceId: device.id });
            setScanned(false);
          }}
        ]);
      } else {
        // CASO B: No existe. ¡AQUÍ ES DONDE DEBE ENTRAR PARA AGREGAR!
        console.log("No existe, abriendo modal para registrar");
        Alert.alert(
          'Código QR Nuevo',
          `El equipo con ID [${cleanedId}] no está registrado. ¿Deseas agregarlo a la bitácora?`,
          [
            { 
              text: 'Cancelar', 
              onPress: () => {
                setScanned(false);
                setLoading(false);
              }, 
              style: 'cancel' 
            },
            { 
              text: 'Registrar', 
              onPress: () => {
                setQrCodeId(cleanedId);
                setIsAddModalVisible(true); // ¡ABRE EL MODAL!
              } 
            }
          ],
          { cancelable: false }
        );
      }
    } catch (err: any) {
      Alert.alert('Error al verificar QR', err.message);
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  // Guardar el equipo nuevo usando el ID del QR escaneado
  async function handleAddDeviceFromQR() {
    if (!newName.trim() || !newDescription.trim()) {
      Alert.alert('Campos vacíos', 'Por favor ingresa el nombre y la descripción.');
      return;
    }

    try {
      setLoading(true);
      // Usamos Honduras como locale para el formato de fecha
      const currentDate = new Date().toLocaleDateString('es-HN', { year: 'numeric', month: 'long' });

      const { error } = await supabase
        .from('devices')
        .insert([
          {
            id: qrCodeId, // Se inserta el texto plano del QR como llave primaria
            name: newName.trim(),
            description: newDescription.trim(),
            status: newStatus,
            last_maintenance: `Registrado vía QR el: ${currentDate}`
          }
        ]);

      if (error) throw error;

      Alert.alert('¡Éxito!', 'Equipo guardado correctamente en la nube.', [
        {
          text: 'Ver Detalle',
          onPress: () => {
            const createdId = qrCodeId;
            setIsAddModalVisible(false);
            setNewName('');
            setNewDescription('');
            setNewStatus('OK');
            setScanned(false);
            
            navigation.navigate('DeviceDetail', { deviceId: createdId });
          }
        }
      ]);

    } catch (error: any) {
      Alert.alert('Error al guardar', error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  }

  if (hasPermission === null) return <View style={styles.containerVisible}><Text style={styles.description}>Solicitando permisos...</Text></View>;
  if (hasPermission === false) return <View style={styles.containerVisible}><Text style={styles.errorText}>Sin acceso a la cámara.</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escanear Código QR</Text>
      <Text style={styles.subtitle}>Apunta a la etiqueta del componente de hardware</Text>
      
      <View style={styles.cameraContainer}>
        {isFocused && !isAddModalVisible && (
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Verificando en Supabase...</Text>
          </View>
        )}
      </View>

      {scanned && !loading && !isAddModalVisible && (
        <CustomButton title="Escanear de nuevo" onPress={() => setScanned(false)} variant="outline" />
      )}

      {/* MODAL DE REGISTRO INTEGRADO EN EL ESCÁNER */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Equipo (QR: {qrCodeId})</Text>
            
            <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Nombre del equipo (ej. Servidor Central)" placeholderTextColor="#666" />
            <TextInput style={styles.input} value={newDescription} onChangeText={setNewDescription} placeholder="Descripción o especificaciones" placeholderTextColor="#666" />

            <Text style={styles.label}>Estado Inicial:</Text>
            <View style={styles.statusSelectorContainer}>
              <TouchableOpacity style={[styles.statusOption, newStatus === 'OK' && styles.statusOkActive]} onPress={() => setNewStatus('OK')}>
                <Text style={[styles.statusText, newStatus === 'OK' && styles.textActive]}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.statusOption, newStatus === 'WARNING' && styles.statusWarningActive]} onPress={() => setNewStatus('WARNING')}>
                <Text style={[styles.statusText, newStatus === 'WARNING' && styles.textActive]}>WARNING</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.statusOption, newStatus === 'CRITICO' && styles.statusCriticoActive]} onPress={() => setNewStatus('CRITICO')}>
                <Text style={[styles.statusText, newStatus === 'CRITICO' && styles.textActive]}>CRÍTICO</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => { 
                  setIsAddModalVisible(false); 
                  setScanned(false); 
                  setLoading(false);
                }}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleAddDeviceFromQR} disabled={loading}>
                <Text style={styles.btnText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  containerVisible: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  cameraContainer: { width: 280, height: 280, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: colors.primary, marginBottom: 24, backgroundColor: colors.card, position: 'relative' },
  description: { fontSize: 14, color: colors.textSecondary },
  errorText: { fontSize: 16, fontWeight: 'bold', color: colors.error },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.card, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15 },
  input: { backgroundColor: colors.background, color: colors.text, padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.textSecondary, fontSize: 14, marginBottom: 8, fontWeight: '600' },
  statusSelectorContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statusOption: { flex: 0.31, paddingVertical: 10, backgroundColor: colors.background, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statusText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: 12 },
  statusOkActive: { backgroundColor: '#00875F', borderColor: '#00875F' },
  statusWarningActive: { backgroundColor: colors.warning, borderColor: colors.warning },
  statusCriticoActive: { backgroundColor: colors.error, borderColor: colors.error },
  textActive: { color: colors.white },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 0.48, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { borderWidth: 1, borderColor: colors.border },
  saveBtn: { backgroundColor: colors.primaryDark },
  btnText: { color: colors.white, fontWeight: 'bold', fontSize: 16 }
});