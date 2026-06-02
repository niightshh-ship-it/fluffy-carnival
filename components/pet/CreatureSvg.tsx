import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import Reanimated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useFrameCallback,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Ellipse, Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/tokens';

const AnimatedPath    = Reanimated.createAnimatedComponent(Path);
const AnimatedEllipse = Reanimated.createAnimatedComponent(Ellipse);
const AnimatedG       = Reanimated.createAnimatedComponent(G);

// ─── viewBox geometry ───────────────────────────────────────────────────────
const VB = 240;
const VB_H = 285;
const CX = 120;
const CY = 150;
const BODY_R = 70;

// ─── Morph noise (deterministic, captured by worklet) ───────────────────────
const VERT = 12;
const F1: number[] = [];
const F2: number[] = [];
const P1: number[] = [];
const P2: number[] = [];
const AMP: number[] = [];
for (let i = 0; i < VERT; i++) {
  F1.push(0.6 + (i % 5) * 0.21);
  F2.push(0.4 + (i % 4) * 0.16);
  P1.push(i * 1.9);
  P2.push(i * 1.1 + 0.7);
  AMP.push(0.5 + ((i * 53) % 100) / 100 * 0.9); // 0.5 … 1.4 (irregular)
}

function blobPath(cx: number, cy: number, baseR: number, t: number, amp: number) {
  'worklet';
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < VERT; i++) {
    const a = (i / VERT) * Math.PI * 2;
    const n =
      Math.sin(t * F1[i] + P1[i]) * 0.62 +
      Math.sin(t * F2[i] + P2[i]) * 0.38;
    const r = baseR * (1 + amp * AMP[i] * n);
    xs.push(cx + Math.cos(a) * r);
    ys.push(cy + Math.sin(a) * r);
  }
  const r2 = (v: number) => Math.round(v * 100) / 100;
  let d = `M${r2(xs[0])},${r2(ys[0])}`;
  for (let i = 0; i < VERT; i++) {
    const i0 = (i - 1 + VERT) % VERT;
    const i2 = (i + 1) % VERT;
    const i3 = (i + 2) % VERT;
    const c1x = xs[i] + (xs[i2] - xs[i0]) / 6;
    const c1y = ys[i] + (ys[i2] - ys[i0]) / 6;
    const c2x = xs[i2] - (xs[i3] - xs[i]) / 6;
    const c2y = ys[i2] - (ys[i3] - ys[i]) / 6;
    d += `C${r2(c1x)},${r2(c1y)} ${r2(c2x)},${r2(c2y)} ${r2(xs[i2])},${r2(ys[i2])}`;
  }
  return d + 'Z';
}

// ─── Hype → neon palette ────────────────────────────────────────────────────
export function paletteForHype(h: number) {
  if (h < 25)  return { core: '#7b3dff', mid: '#4a1fb0', rim: '#1a0a3e', hot: '#b07bff', shadow: Colors.violet };
  if (h < 50)  return { core: '#d65fff', mid: '#9030c8', rim: '#2e0f5e', hot: '#ff9af0', shadow: Colors.violet };
  if (h < 75)  return { core: '#ff5fb0', mid: '#d02888', rim: '#4a0f48', hot: '#ffa0d8', shadow: Colors.pink };
  if (h < 100) return { core: '#ff7ac0', mid: '#ff3d8a', rim: '#5a1858', hot: '#ffd0ec', shadow: Colors.pink };
  return         { core: '#eaff7a', mid: '#a8e022', rim: '#3a5810', hot: '#ffffb0', shadow: Colors.lime };
}

export interface CreatureRef {
  react: () => void;
  burst: () => void;
}

interface Props {
  size?: number;
  hype?: number;
  wild?: number;      // morph amplitude (chaos)
}

export const CreatureSvg = forwardRef<CreatureRef, Props>(
  ({ size = 250, hype = 50, wild = 0.2 }, ref) => {
    const pal = paletteForHype(hype);
    const H = size * (VB_H / VB);

    const clock    = useSharedValue(0);
    const breathe  = useSharedValue(0);
    const sway     = useSharedValue(0);
    const drip     = useSharedValue(0);
    const horn1    = useSharedValue(0);
    const horn2    = useSharedValue(0);
    const limbL    = useSharedValue(0);
    const limbR    = useSharedValue(0);
    const blinkL   = useSharedValue(1);
    const blinkR   = useSharedValue(1);
    const blink3   = useSharedValue(1);
    const corePulse = useSharedValue(0);

    const squishX  = useSharedValue(1);
    const squishY  = useSharedValue(1);
    const burstV   = useSharedValue(1);
    const eyeWide  = useSharedValue(1);

    // Continuous organic + buzzy clock
    useFrameCallback((info) => {
      const dt = (info.timeSincePreviousFrame ?? 16) / 1000;
      clock.value += dt * 1.25;
    });

    useEffect(() => {
      breathe.value   = withRepeat(withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.sin) }), -1, true);
      sway.value      = withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }), -1, true);
      drip.value      = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true);
      horn1.value     = withRepeat(withTiming(1, { duration: 640, easing: Easing.inOut(Easing.sin) }), -1, true);
      horn2.value     = withDelay(220, withRepeat(withTiming(1, { duration: 520, easing: Easing.inOut(Easing.sin) }), -1, true));
      limbL.value     = withRepeat(withTiming(1, { duration: 820, easing: Easing.inOut(Easing.sin) }), -1, true);
      limbR.value     = withDelay(300, withRepeat(withTiming(1, { duration: 760, easing: Easing.inOut(Easing.sin) }), -1, true));
      corePulse.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }), -1, true);
    }, []);

    // Independent blinking (3 eyes)
    useEffect(() => {
      const timers: ReturnType<typeof setTimeout>[] = [];
      const loop = (sv: typeof blinkL, min: number, rng: number, dur: number) => {
        const tick = () => {
          sv.value = withSequence(withTiming(0.06, { duration: 55 }), withTiming(1, { duration: 90 }));
          timers.push(setTimeout(tick, min + Math.random() * rng));
        };
        timers.push(setTimeout(tick, 600 + Math.random() * 1500));
      };
      loop(blinkL, 1900, 4000, 60);
      loop(blinkR, 2600, 3600, 60);
      loop(blink3, 1400, 2600, 50);
      return () => timers.forEach(clearTimeout);
    }, []);

    // Reaction methods
    const react = () => {
      squishX.value = withSequence(
        withSpring(1.36, { stiffness: 600, damping: 13 }),
        withSpring(1, { stiffness: 85, damping: 9 }),
        withSpring(1.05, { stiffness: 200, damping: 18 }),
        withSpring(1, { stiffness: 200, damping: 22 }),
      );
      squishY.value = withSequence(
        withSpring(0.66, { stiffness: 600, damping: 13 }),
        withSpring(1, { stiffness: 85, damping: 9 }),
        withSpring(0.96, { stiffness: 200, damping: 18 }),
        withSpring(1, { stiffness: 200, damping: 22 }),
      );
      eyeWide.value = withSequence(
        withSpring(1.55, { stiffness: 500, damping: 11 }),
        withSpring(1, { stiffness: 120, damping: 14 }),
      );
    };
    const burst = () => {
      burstV.value = withSequence(
        withSpring(1.55, { stiffness: 480, damping: 12 }),
        withSpring(1, { stiffness: 65, damping: 8 }),
      );
      eyeWide.value = withSequence(
        withSpring(1.95, { stiffness: 380, damping: 10 }),
        withDelay(400, withSpring(1, { stiffness: 75, damping: 11 })),
      );
    };
    useImperativeHandle(ref, () => ({ react, burst }), []);

    // Animated props
    const bodyProps  = useAnimatedProps(() => ({ d: blobPath(CX, CY, BODY_R, clock.value, wild) }));
    const innerProps = useAnimatedProps(() => ({ d: blobPath(CX, CY, BODY_R * 0.62, clock.value + 14, wild * 1.3) }));

    const horn1Props = useAnimatedProps(() => ({ rotation: (horn1.value * 2 - 1) * 18, originX: 88,  originY: 92 }));
    const horn2Props = useAnimatedProps(() => ({ rotation: (horn2.value * 2 - 1) * -16, originX: 152, originY: 92 }));
    const limbLProps = useAnimatedProps(() => ({ rotation: (limbL.value * 2 - 1) * 22, originX: 56,  originY: 158 }));
    const limbRProps = useAnimatedProps(() => ({ rotation: (limbR.value * 2 - 1) * -22, originX: 184, originY: 158 }));

    const eyeLProps = useAnimatedProps(() => ({ ry: 22 * blinkL.value * eyeWide.value, rx: 20 * eyeWide.value }));
    const eyeRProps = useAnimatedProps(() => ({ ry: 14 * blinkR.value * eyeWide.value, rx: 13 * eyeWide.value }));
    const eye3Props = useAnimatedProps(() => ({ ry: 9 * blink3.value * eyeWide.value, rx: 9 * eyeWide.value }));
    const coreProps = useAnimatedProps(() => ({
      opacity: 0.4 + corePulse.value * 0.4,
      rx: 30 + corePulse.value * 8,
      ry: 26 + corePulse.value * 7,
    }));
    const dripProps = useAnimatedProps(() => ({
      ry: 12 + drip.value * 18,
      cy: 218 + drip.value * 8,
      rx: 15 - drip.value * 5,
    }));

    // Container: drag-free; breathe + sway + squish + burst + buzzy jitter
    const containerStyle = useAnimatedStyle(() => {
      const jx = Math.sin(clock.value * 21) * 1.1;
      const jy = Math.cos(clock.value * 17) * 0.9;
      return {
        transform: [
          { translateX: jx },
          { translateY: jy },
          { scale: burstV.value },
          { scaleX: squishX.value * (1 + breathe.value * 0.07) },
          { scaleY: squishY.value * (1 - breathe.value * 0.06) },
          { rotate: `${(sway.value * 2 - 1) * 7}deg` },
        ],
      };
    });

    return (
      <Reanimated.View style={containerStyle}>
        <Svg width={size} height={H} viewBox={`0 0 ${VB} ${VB_H}`}>
          <Defs>
            <RadialGradient id="cbody" cx="42%" cy="32%" r="78%">
              <Stop offset="0%"   stopColor={pal.core} />
              <Stop offset="52%"  stopColor={pal.mid} />
              <Stop offset="100%" stopColor={pal.rim} />
            </RadialGradient>
            <RadialGradient id="cglow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%"   stopColor={pal.core} stopOpacity={0.55} />
              <Stop offset="65%"  stopColor={pal.core} stopOpacity={0.2} />
              <Stop offset="100%" stopColor={pal.core} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="ccore" cx="50%" cy="50%" r="50%">
              <Stop offset="0%"   stopColor={pal.hot} stopOpacity={0.95} />
              <Stop offset="100%" stopColor={pal.hot} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="cinner" cx="50%" cy="40%" r="60%">
              <Stop offset="0%"   stopColor="#ffffff" stopOpacity={0.2} />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* Atmospheric glow */}
          <Ellipse cx={CX} cy={CY + 4} rx={120} ry={116} fill="url(#cglow)" />

          {/* Horns (behind body) */}
          <AnimatedG animatedProps={horn1Props}>
            <Path d="M88,96 Q78,66 86,48 Q92,62 96,94 Z" fill="url(#cbody)" />
            <Circle cx={85} cy={48} r={5} fill={Colors.lime} />
            <Circle cx={85} cy={48} r={9} fill={Colors.lime} opacity={0.22} />
          </AnimatedG>
          <AnimatedG animatedProps={horn2Props}>
            <Path d="M152,96 Q164,68 158,52 Q150,64 144,94 Z" fill="url(#cbody)" />
            <Circle cx={159} cy={52} r={4.5} fill={Colors.pink} />
            <Circle cx={159} cy={52} r={8} fill={Colors.pink} opacity={0.22} />
          </AnimatedG>

          {/* Wobbly side limbs */}
          <AnimatedG animatedProps={limbLProps}>
            <Path d="M58,150 Q34,160 26,178 Q44,170 62,166 Z" fill="url(#cbody)" />
            <Circle cx={27} cy={178} r={6} fill={pal.core} />
          </AnimatedG>
          <AnimatedG animatedProps={limbRProps}>
            <Path d="M182,150 Q206,162 214,180 Q196,172 178,166 Z" fill="url(#cbody)" />
            <Circle cx={213} cy={180} r={6} fill={pal.core} />
          </AnimatedG>

          {/* Drip */}
          <AnimatedEllipse animatedProps={dripProps} cx={116} fill="url(#cbody)" opacity={0.92} />

          {/* Body */}
          <AnimatedPath animatedProps={bodyProps} fill="url(#cbody)" />

          {/* Pulsing inner core */}
          <AnimatedEllipse animatedProps={coreProps} cx={118} cy={150} fill="url(#ccore)" />

          {/* Inner depth + gloss */}
          <AnimatedPath animatedProps={innerProps} fill="url(#cinner)" />
          <Ellipse cx={94} cy={112} rx={30} ry={15} fill="rgba(255,255,255,0.18)" rotation={-20} originX={94} originY={112} />

          {/* Third eye on stalk */}
          <Path d="M120,90 Q118,76 120,68" stroke={pal.hot} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.6} />
          <AnimatedEllipse animatedProps={eye3Props} cx={120} cy={64} fill="#f6f4ff" />
          <Circle cx={120} cy={64} r={4} fill="#0a0a14" />

          {/* Main asymmetric eyes */}
          <AnimatedEllipse animatedProps={eyeLProps} cx={100} cy={142} fill="#f6f4ff" />
          <Circle cx={103} cy={144} r={11} fill="#0a0a14" />
          <Circle cx={107} cy={140} r={3.6} fill="rgba(255,255,255,0.95)" />

          <AnimatedEllipse animatedProps={eyeRProps} cx={150} cy={150} fill="#f6f4ff" />
          <Circle cx={151} cy={152} r={7} fill="#0a0a14" />
          <Circle cx={153} cy={149} r={2.4} fill="rgba(255,255,255,0.9)" />

          {/* Goofy open mouth + fangs + tongue */}
          <Path d="M96,182 Q120,210 146,184 Q120,196 96,182 Z" fill="#1a0a22" opacity={0.85} />
          <Path d="M120,193 Q128,205 124,210 Q116,206 116,194 Z" fill={Colors.pink} opacity={0.8} />
          <Path d="M104,184 L110,184 L107,196 Z" fill="rgba(255,255,255,0.92)" />
          <Path d="M134,185 L139,185 L136.5,195 Z" fill="rgba(255,255,255,0.85)" />
        </Svg>
      </Reanimated.View>
    );
  }
);
