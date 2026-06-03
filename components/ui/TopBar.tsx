import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useGame } from '@/context/GameContext';
import { Colors, Fonts, FontSize, Radius } from '@/constants/tokens';

/** Animates a scale "bump" whenever `value` changes. */
function useBump(value: number) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.35, duration: 130, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 130, useNativeDriver: true }),
    ]).start();
  }, [value, scale]);
  return scale;
}

export function TopBar() {
  const { coins, hype, streak } = useGame();
  const coinScale = useBump(coins);
  const hypeScale = useBump(hype);

  return (
    <View style={styles.bar}>
      <View style={styles.chip}>
        <Icon name="coin" size={17} color={Colors.coin} />
        <Animated.Text style={[styles.num, { transform: [{ scale: coinScale }] }]}>
          {coins}
        </Animated.Text>
      </View>

      <View style={styles.chip}>
        <Icon name="bolt" size={17} color={Colors.lime} />
        <Animated.Text style={[styles.num, { transform: [{ scale: hypeScale }] }]}>
          {hype}
        </Animated.Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.streak}>
        <Icon name="flame" size={16} color={Colors.hot} />
        <Text style={styles.num}>{streak}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: Radius.md,
    backgroundColor: Colors.chipBg,
    borderWidth: 1,
    borderColor: Colors.chipBorder,
  },
  num: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  spacer: { flex: 1 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});

export default TopBar;
