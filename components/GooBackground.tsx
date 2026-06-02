import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Ellipse, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '@/constants/tokens';

const AnimatedEllipse = Reanimated.createAnimatedComponent(Ellipse);

const VW = 400;
const VH = 820;

// A slow-drifting neon blob driven by two timing loops
function useDrift(x0: number, x1: number, y0: number, y1: number, dx: number, dy: number) {
  const px = useSharedValue(0);
  const py = useSharedValue(0);
  useEffect(() => {
    px.value = withRepeat(withTiming(1, { duration: dx, easing: Easing.inOut(Easing.sin) }), -1, true);
    py.value = withRepeat(withTiming(1, { duration: dy, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);
  return useAnimatedProps(() => ({
    cx: x0 + (x1 - x0) * px.value,
    cy: y0 + (y1 - y0) * py.value,
  }));
}

export function GooBackground() {
  const a = useDrift(60, 180, 120, 280, 13000, 17000);
  const b = useDrift(320, 220, 200, 380, 15000, 12000);
  const c = useDrift(120, 300, 560, 460, 16000, 19000);
  const d = useDrift(280, 160, 700, 620, 14000, 15000);

  return (
    <View style={styles.fill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="gViolet" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#a98bff" stopOpacity={0.34} />
            <Stop offset="100%" stopColor="#a98bff" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="gPink" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ff3d8a" stopOpacity={0.28} />
            <Stop offset="100%" stopColor="#ff3d8a" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="gLime" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#d4ff45" stopOpacity={0.2} />
            <Stop offset="100%" stopColor="#d4ff45" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="gJade" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#4dffc4" stopOpacity={0.22} />
            <Stop offset="100%" stopColor="#4dffc4" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Rect x={0} y={0} width={VW} height={VH} fill={Colors.background} />
        <AnimatedEllipse animatedProps={a} rx={230} ry={230} fill="url(#gViolet)" />
        <AnimatedEllipse animatedProps={b} rx={210} ry={210} fill="url(#gPink)" />
        <AnimatedEllipse animatedProps={c} rx={240} ry={240} fill="url(#gJade)" />
        <AnimatedEllipse animatedProps={d} rx={220} ry={220} fill="url(#gLime)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
});
