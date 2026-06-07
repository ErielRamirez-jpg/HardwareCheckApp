import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import ComponentCard from '../components/ComponentCard';

export default function HomeScreen() {

  const hardwareItems = [
    {
      id: '1',
      name: 'Acer Predator Nitro',
      type: 'Laptop de Desarrollo',
      lastMaintenance: 'Abril 2026',
      status: 'ok' as const,
    },
    {
      id: '2',
      name: 'Servidor de Respaldos',
      type: 'Infraestructura',
      lastMaintenance: 'Noviembre 2025',
      status: 'critico' as const,
    },
    {
      id: '3',
      name: 'Nintendo Switch Lite',
      type: 'Consola de Prueba',
      lastMaintenance: 'Mayo 2026',
      status: 'warning' as const,
    },
  ];

  return (
    <ScrollView style={styles.backgroundColorContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>HardwareCheck</Text>
        <Text style={styles.subtitle}>Bitácora de Mantenimiento</Text>
        
        <View style={styles.listContainer}>
          {/* Mapeamos el arreglo para renderizar cada tarjeta pasándole el objeto data */}
          {hardwareItems.map((item) => (
            <ComponentCard 
              key={item.id} 
              data={item} 
              onPress={() => console.log(`Seleccionado: ${item.name}`)}
            />
          ))}
        </View>
      </View>
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
  listContainer: {
    width: '100%',
  },
});