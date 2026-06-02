import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, FontSize, Radius, Spacing } from '@/constants/tokens';

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  color: string;
}

export function StatBar({ label, value, max = 100, color }: StatBarProps) {
  const pct = Math.min(Math.max(value / max, 0), 1);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${pct * 100}%` as any,
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.7,
              shadowRadius: 4,
            },
          ]}
        />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    width: 76,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surface3,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  value: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.sm,
    width: 28,
    textAlign: 'right',
  },
});
