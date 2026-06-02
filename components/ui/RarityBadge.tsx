import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, FontSize, Radius, Rarities, RarityKey, Spacing } from '@/constants/tokens';

interface RarityBadgeProps {
  rarity: RarityKey;
}

export function RarityBadge({ rarity }: RarityBadgeProps) {
  const meta = Rarities[rarity];
  return (
    <View style={[styles.badge, { borderColor: meta.color, backgroundColor: meta.glow }]}>
      <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.xs,
    letterSpacing: 1.5,
  },
});
