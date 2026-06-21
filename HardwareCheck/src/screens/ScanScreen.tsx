import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useDispatch } from 'react-redux';
import { addMaintenanceLog } from '../store/hardwareSlice';
import CustomButton from '../components/CustomButton';

export default function ScanScreen() {
  const dispatch = useDispatch();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  // Solicitar permisos nativos al montar la pantalla
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  // Función ejecutada inmediatamente al detectar el código de barras/QR
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    
    // Validamos si el QR coincide con algún ID de nuestro store ("1", "2" o "3")
    if (data === '1' || data === '2' || data === '3') {
      const today = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
      });

      // Modificamos el estado global en Redux
      dispatch(addMaintenanceLog({ id: data, status: 'ok', date: today }));
      
      Alert.alert(
        '¡Escaneo Exitoso!',
        `Se registró el mantenimiento preventivo para el componente ID: ${data}`,
        [{ text: 'Listo', onPress: () => setScanned(false) }]
      );
    } else {
      Alert.alert(
        'Código Inválido',
        'El código QR escaneado no pertenece a ningún componente registrado.',
        [{ text: 'Intentar de nuevo', onPress: () => setScanned(false) }]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.description}>Solicitando permiso para usar la cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No tenemos acceso a la cámara.</Text>
        <Text style={styles.description}>Por favor, activa los permisos en la configuración de tu teléfono.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escanear Código QR</Text>
      <Text style={styles.subtitle}>Apunta a la etiqueta del componente de hardware</Text>
      
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {scanned && (
        <CustomButton
          title="Escanear de nuevo"
          onPress={() => setScanned(false)}
          variant="outline"
        />
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaaaaa',
    textAlign: 'center',
    marginBottom: 24,
  },
  cameraContainer: {
    width: 280,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00FF9F', // Usando tu color verde neón tecnológico
    marginBottom: 24,
    backgroundColor: '#1E1E1E',
  },
  description: {
    fontSize: 14,
    color: '#aaaaaa',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B5C',
    marginBottom: 8,
  },
});