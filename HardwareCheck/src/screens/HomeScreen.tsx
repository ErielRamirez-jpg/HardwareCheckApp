import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSelector } from 'react-redux'; 
import { RootState } from '../store';      
import ComponentCard from '../components/ComponentCard';

export default function HomeScreen() {
  const hardwareItems = useSelector((state: RootState) => state.hardware.items);

  return (
    <ScrollView style={styles.backgroundColorContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>HardwareCheck</Text>
        <Text style={styles.subtitle}>Bitácora de Mantenimiento</Text>
        <View style={styles.listContainer}>
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