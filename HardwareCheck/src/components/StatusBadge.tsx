import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../Theme/Colors';

interface StatusBadgeProps {
  status: 'ok' | 'critico' | 'warning';
  label?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getStyle = () => {
    switch (status) {
      case 'critico': return styles.critico;
      case 'warning': return styles.warning;
      case 'ok':
      default: return styles.ok;
    }
  };

  const getText = () => label || status.toUpperCase();

  return (
    <View style={[styles.badge, getStyle()]}>
      <Text style={styles.text}>{getText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  ok: {
    backgroundColor: colors.success + '30',
    borderWidth: 1,
    borderColor: colors.success,
  },
  critico: {
    backgroundColor: colors.error + '30',
    borderWidth: 1,
    borderColor: colors.error,
  },
  warning: {
    backgroundColor: colors.warning + '30',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  text: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default StatusBadge;