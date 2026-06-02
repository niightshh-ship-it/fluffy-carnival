import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { usePathname } from 'expo-router';
import Reanimated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Ellipse, Path, G, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '@/constants/tokens';

const AnimatedG = Reanimated.createAnimatedComponent(G);
const AnimatedEllipse = Reanimated.createAnimatedComponent(Ellipse);

const VW = 400;
const VH = 820;

/**
 * Хайпожорик smeared across the background like brushstrokes of paint —
 * soft colour smears with his eyes and mouth faintly showing through.
 * Cheap: one slow drift + slow blink. Fades away on his own (pet) screen.
 */
export function SmearBackground() {
  const pathname = usePathname();
  const onPet = pathname?.includes('pet');

  // Whole-smear slow drift (paint slowly flowing)
  const drift = useSharedValue(0);
  // Metamorphic appear when arriving on a non-pet tab
  const appear = useSharedValue(0);
  // Slow blink of the embedded eyes
  const blink = useSharedValue(1);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  useEffect(() => {
    // he "flows in" and spreads when you land on another tab
    appear.value = withTiming(onPet ? 0 : 1, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [onPet]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const tick = () => {
      blink.value = withTiming(0.12, { duration: 140 }, () => {
        blink.value = withTiming(1, { duration: 220 });
      });
      timers.push(setTimeout(tick, 3200 + Math.random() * 4000));
    };
    timers.push(setTimeout(tick, 2000));
    return () => timers.forEach(clearTimeout);
  }, []);

  const driftG = useAnimatedProps(() => ({
    // gentle paint flow + slight spreading scale on appear
    originX: VW / 2,
    originY: VH / 2,
    scale: 1.06 - appear.value * 0.06,
    translateX: (drift.value * 2 - 1) * 14,
    translateY: (drift.value * 2 - 1) * -10,
    opacity: appear.value,
  }));

  const eyeL = useAnimatedProps(() => ({ ry: 26 * blink.value }));
  const eyeR = useAnimatedProps(() => ({ ry: 17 * blink.value }));

  return (
    <View style={styles.fill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="sViolet" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#9b8cff" stopOpacity={0.9} />
            <Stop offset="100%" stopColor="#9b8cff" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="sPink" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ff4d8d" stopOpacity={0.9} />
            <Stop offset="100%" stopColor="#ff4d8d" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="sJade" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#5fe3b0" stopOpacity={0.9} />
            <Stop offset="100%" stopColor="#5fe3b0" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="sLime" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#c6f24e" stopOpacity={0.9} />
            <Stop offset="100%" stopColor="#c6f24e" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Calm dark canvas */}
        <Rect x={0} y={0} width={VW} height={VH} fill={Colors.background} />

        {/* The smeared creature */}
        <AnimatedG animatedProps={driftG}>
          {/* Paint-stroke smears (elongated, rotated, low opacity) */}
          <Ellipse cx={120} cy={185} rx={210} ry={72}  fill="url(#sViolet)" opacity={0.16} rotation={-28} originX={120} originY={185} />
          <Ellipse cx={300} cy={330} rx={185} ry={62}  fill="url(#sPink)"   opacity={0.13} rotation={22}  originX={300} originY={330} />
          <Ellipse cx={210} cy={420} rx={170} ry={95}  fill="url(#sViolet)" opacity={0.12} rotation={8}   originX={210} originY={420} />
          <Ellipse cx={150} cy={560} rx={215} ry={78}  fill="url(#sJade)"   opacity={0.12} rotation={-16} originX={150} originY={560} />
          <Ellipse cx={290} cy={690} rx={175} ry={64}  fill="url(#sLime)"   opacity={0.10} rotation={26}  originX={290} originY={690} />

          {/* Face hint nestled in the central smear — eyes + mouth showing through */}
          <G opacity={0.9}>
            <AnimatedEllipse animatedProps={eyeL} cx={176} cy={398} rx={22} fill="#f1f0f6" opacity={0.20} />
            <Ellipse cx={179} cy={400} rx={9} ry={11} fill="#0a0a14" opacity={0.28} />

            <AnimatedEllipse animatedProps={eyeR} cx={236} cy={410} rx={14} fill="#f1f0f6" opacity={0.17} />
            <Ellipse cx={238} cy={412} rx={5.5} ry={7} fill="#0a0a14" opacity={0.24} />

            {/* soft open mouth smear */}
            <Path d="M168,452 Q206,486 246,454 Q206,470 168,452 Z" fill="#0a0a14" opacity={0.20} />
          </G>
        </AnimatedG>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
});
