import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../Theme/Colors';
import StatusBadge from './StatusBadge';

interface HardwareData {
  id: string;
  name: string;
  type: string;
  lastMaintenance?: string;
  status?: 'ok' | 'critico' | 'warning';
}

interface ComponentCardProps {
  data: HardwareData;
  onPress?: () => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ data, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <Text style={styles.name}>{data.name}</Text>
        <StatusBadge status={data.status || 'ok'} />
      </View>

      <Text style={styles.type}>{data.type}</Text>
      
      {data.lastMaintenance && (
        <Text style={styles.maintenance}>
          Último mantenimiento: {data.lastMaintenance}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  type: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  maintenance: {
    color: colors.textTertiary,
    fontSize: 13,
    marginTop: 4,
  },
});

export default ComponentCard;