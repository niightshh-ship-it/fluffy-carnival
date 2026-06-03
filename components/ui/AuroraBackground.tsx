import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { Colors } from '@/constants/tokens';

/**
 * Завораживающий переливающийся неон-фон.
 * Несколько больших мягких радиальных «орбов» медленно дрейфуют и пульсируют
 * на разных таймингах — их наложение даёт живой иридесцентный mesh-градиент.
 * Все анимации — только transform на native driver → плавно и дёшево.
 */

const { width: SCREEN_W } = Dimensions.get('window');

interface OrbDef {
  color: string;
  size: number;
  start: { x: number; y: number };
  drift: { x: number; y: number };
  dur: number;       // ms for one drift leg
  opacity: number;
}

const ORBS: OrbDef[] = [
  { color: Colors.violet, size: 460, start: { x: -120, y: -140 }, drift: { x: 70,  y: 60 },  dur: 9000,  opacity: 0.55 },
  { color: Colors.cyan,   size: 380, start: { x: 180,  y: 60 },   drift: { x: -60, y: 80 },  dur: 11000, opacity: 0.40 },
  { color: Colors.lime,   size: 320, start: { x: -60,  y: 360 },  drift: { x: 90,  y: -50 }, dur: 13000, opacity: 0.30 },
  { color: Colors.hot,    size: 300, start: { x: 200,  y: 460 },  drift: { x: -80, y: -70 }, dur: 10000, opacity: 0.32 },
];

function Orb({ def, active }: { def: OrbDef; active: boolean }) {
  const t = useRef(new Animated.Value(0)).current;
  const gradId = useRef(`orb-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: def.dur, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: def.dur, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, def.dur, active]);

  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, def.drift.x] });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, def.drift.y] });
  const scale = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.18, 1] });

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: def.size,
          height: def.size,
          left: def.start.x,
          top: def.start.y,
          opacity: def.opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    >
      <Svg width={def.size} height={def.size}>
        <Defs>
          <RadialGradient id={gradId} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={def.color} stopOpacity={0.9} />
            <Stop offset="1" stopColor={def.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={def.size / 2} cy={def.size / 2} r={def.size / 2} fill={`url(#${gradId})`} />
      </Svg>
    </Animated.View>
  );
}

export function AuroraBackground({ active = true }: { active?: boolean }) {
  return (
    <View style={styles.root} pointerEvents="none">
      {ORBS.map((def, i) => (
        <Orb key={i} def={def} active={active} />
      ))}
      {/* лёгкое затемнение сверху, чтобы фон оставался «лёгким» и контент читался */}
      <View style={styles.veil} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.background, overflow: 'hidden' },
  orb: { position: 'absolute' },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,11,18,0.35)' },
});

export default AuroraBackground;
