import React, {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Animated as RNAnimated, View, PanResponder, StyleSheet } from 'react-native';
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

// ─── Geometry (SVG viewBox space) ───────────────────────────────────────────
const VB = 240;          // viewBox is 0 0 240 270
const VB_H = 270;
const CX = 120;
const CY = 132;
const BODY_R = 72;
const RENDER = 250;      // px size the Svg is drawn at

// ─── Morph noise tables (deterministic, captured by worklet) ────────────────
const VERT = 11;
const F1: number[] = [];
const F2: number[] = [];
const P1: number[] = [];
const P2: number[] = [];
const AMP: number[] = [];
for (let i = 0; i < VERT; i++) {
  F1.push(0.55 + (i % 4) * 0.17);
  F2.push(0.33 + (i % 3) * 0.13);
  P1.push(i * 1.7);
  P2.push(i * 0.9 + 1.1);
  AMP.push(0.55 + ((i * 37) % 100) / 100 * 0.7); // 0.55 … 1.25
}

// Smooth closed liquid path through morphing vertices (Catmull-Rom → Bézier)
function blobPath(cx: number, cy: number, baseR: number, t: number, amp: number) {
  'worklet';
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < VERT; i++) {
    const a = (i / VERT) * Math.PI * 2;
    const n =
      Math.sin(t * F1[i] + P1[i]) * 0.6 +
      Math.sin(t * F2[i] + P2[i]) * 0.4;
    const r = baseR * (1 + amp * AMP[i] * n);
    xs.push(cx + Math.cos(a) * r);
    ys.push(cy + Math.sin(a) * r);
  }
  const r2 = (v: number) => Math.round(v * 100) / 100;
  let d = `M${r2(xs[0])},${r2(ys[0])}`;
  for (let i = 0; i < VERT; i++) {
    const i0 = (i - 1 + VERT) % VERT;
    const i1 = i;
    const i2 = (i + 1) % VERT;
    const i3 = (i + 2) % VERT;
    const c1x = xs[i1] + (xs[i2] - xs[i0]) / 6;
    const c1y = ys[i1] + (ys[i2] - ys[i0]) / 6;
    const c2x = xs[i2] - (xs[i3] - xs[i1]) / 6;
    const c2y = ys[i2] - (ys[i3] - ys[i1]) / 6;
    d += `C${r2(c1x)},${r2(c1y)} ${r2(c2x)},${r2(c2y)} ${r2(xs[i2])},${r2(ys[i2])}`;
  }
  return d + 'Z';
}

// ─── Hype → palette ─────────────────────────────────────────────────────────
function paletteForHype(h: number) {
  // [core, mid, rim] stops + glow
  if (h < 25)  return { core: '#5a2db0', mid: '#34177a', rim: '#150a2e', glow: 'rgba(90,45,176,0.55)',  shadow: Colors.violet };
  if (h < 50)  return { core: '#b94fd0', mid: '#7a2da8', rim: '#2a0f55', glow: 'rgba(150,55,170,0.55)', shadow: Colors.violet };
  if (h < 75)  return { core: '#ff5fa6', mid: '#c0307e', rim: '#48103f', glow: 'rgba(220,55,140,0.6)',  shadow: Colors.pink };
  if (h < 100) return { core: '#ff9ad0', mid: '#e84d9a', rim: '#5a2050', glow: 'rgba(255,90,160,0.6)',  shadow: Colors.pink };
  return         { core: '#e8ff8a', mid: '#a0d828', rim: '#3a5810', glow: 'rgba(180,230,50,0.65)',  shadow: Colors.lime };
}

// ─── Particles (RN Animated overlay) ────────────────────────────────────────
const PARTICLE_COUNT = 16;
const PARTICLE_COLORS = [Colors.lime, Colors.pink, Colors.gold, Colors.violet, Colors.sky];

export interface HypeBlobRef {
  triggerHypeBurst: () => void;
}

interface Props {
  hype: number;
  hunger: number;
  mood: number;
  onTap?: () => void;
}

export const HypeBlob = forwardRef<HypeBlobRef, Props>(
  ({ hype, hunger, mood, onTap }, ref) => {
    const pal = paletteForHype(hype);

    // ── Reanimated shared values ──
    const clock   = useSharedValue(0);
    const breathe = useSharedValue(0);   // 0..1 yoyo
    const sway    = useSharedValue(0);   // -1..1
    const drip    = useSharedValue(0);   // 0..1
    const ant1    = useSharedValue(0);   // -1..1
    const ant2    = useSharedValue(0);
    const blinkL  = useSharedValue(1);
    const blinkR  = useSharedValue(1);

    const squishX = useSharedValue(1);
    const squishY = useSharedValue(1);
    const burst   = useSharedValue(1);
    const dragX   = useSharedValue(0);
    const dragY   = useSharedValue(0);
    const eyeWide = useSharedValue(1);

    // Continuous organic clock
    useFrameCallback((info) => {
      const dt = (info.timeSincePreviousFrame ?? 16) / 1000;
      clock.value += dt * 1.15;
    });

    // Idle loops
    useEffect(() => {
      breathe.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
      sway.value    = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true);
      drip.value    = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }), -1, true);
      ant1.value    = withRepeat(withTiming(1, { duration: 700,  easing: Easing.inOut(Easing.sin) }), -1, true);
      ant2.value    = withDelay(300, withRepeat(withTiming(1, { duration: 560, easing: Easing.inOut(Easing.sin) }), -1, true));
    }, []);

    // Blink — independent randomised timers
    useEffect(() => {
      let tL: ReturnType<typeof setTimeout>;
      let tR: ReturnType<typeof setTimeout>;
      const doL = () => {
        blinkL.value = withSequence(withTiming(0.06, { duration: 60 }), withTiming(1, { duration: 90 }));
        tL = setTimeout(doL, 2000 + Math.random() * 4200);
      };
      const doR = () => {
        blinkR.value = withSequence(withTiming(0.06, { duration: 70 }), withTiming(1, { duration: 100 }));
        tR = setTimeout(doR, 3000 + Math.random() * 4000);
      };
      tL = setTimeout(doL, 1000);
      tR = setTimeout(doR, 2400);
      return () => { clearTimeout(tL); clearTimeout(tR); };
    }, []);

    // ── Particles ──
    const particles = useRef(
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        x: new RNAnimated.Value(0),
        y: new RNAnimated.Value(0),
        opacity: new RNAnimated.Value(0),
        scale: new RNAnimated.Value(0),
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        size: 6 + (i % 4) * 3,
      }))
    ).current;

    // ── Tap: viscous squish ──
    const handleTap = useCallback(() => {
      squishX.value = withSequence(
        withSpring(1.34, { stiffness: 600, damping: 14 }),
        withSpring(1, { stiffness: 90, damping: 10 }),
        withSpring(1.05, { stiffness: 200, damping: 18 }),
        withSpring(1, { stiffness: 200, damping: 22 }),
      );
      squishY.value = withSequence(
        withSpring(0.68, { stiffness: 600, damping: 14 }),
        withSpring(1, { stiffness: 90, damping: 10 }),
        withSpring(0.96, { stiffness: 200, damping: 18 }),
        withSpring(1, { stiffness: 200, damping: 22 }),
      );
      eyeWide.value = withSequence(
        withSpring(1.5, { stiffness: 500, damping: 12 }),
        withSpring(1, { stiffness: 120, damping: 14 }),
      );
      onTap?.();
    }, [onTap]);

    // ── Hype burst ──
    const triggerHypeBurst = useCallback(() => {
      particles.forEach((p, i) => {
        const angle = (i / PARTICLE_COUNT) * 2 * Math.PI + Math.random() * 0.7;
        const dist = 80 + Math.random() * 70;
        p.x.setValue(0); p.y.setValue(0);
        p.opacity.setValue(1); p.scale.setValue(2);
        RNAnimated.parallel([
          RNAnimated.timing(p.x,       { toValue: Math.cos(angle) * dist, duration: 880, useNativeDriver: true }),
          RNAnimated.timing(p.y,       { toValue: Math.sin(angle) * dist, duration: 880, useNativeDriver: true }),
          RNAnimated.timing(p.opacity, { toValue: 0,   duration: 880, useNativeDriver: true }),
          RNAnimated.timing(p.scale,   { toValue: 0.1, duration: 880, useNativeDriver: true }),
        ]).start();
      });
      burst.value = withSequence(
        withSpring(1.55, { stiffness: 500, damping: 13 }),
        withSpring(1, { stiffness: 70, damping: 9 }),
      );
      eyeWide.value = withSequence(
        withSpring(1.9, { stiffness: 400, damping: 11 }),
        withDelay(420, withSpring(1, { stiffness: 80, damping: 12 })),
      );
    }, []);

    useImperativeHandle(ref, () => ({ triggerHypeBurst }), [triggerHypeBurst]);

    // ── Drag / tap pan responder ──
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2,
        onPanResponderMove: (_, gs) => {
          dragX.value = gs.dx * 0.42;
          dragY.value = gs.dy * 0.35;
        },
        onPanResponderRelease: (_, gs) => {
          if (Math.abs(gs.dx) < 8 && Math.abs(gs.dy) < 8) handleTap();
          dragX.value = withSpring(0, { stiffness: 120, damping: 12, mass: 1.4 });
          dragY.value = withSpring(0, { stiffness: 120, damping: 12, mass: 1.4 });
        },
        onPanResponderTerminate: () => {
          dragX.value = withSpring(0, { stiffness: 120, damping: 12 });
          dragY.value = withSpring(0, { stiffness: 120, damping: 12 });
        },
      })
    ).current;

    // ── Animated props ──
    const bodyProps = useAnimatedProps(() => ({
      d: blobPath(CX, CY, BODY_R, clock.value, 0.12),
    }));
    const innerProps = useAnimatedProps(() => ({
      d: blobPath(CX, CY, BODY_R * 0.7, clock.value + 12, 0.16),
    }));
    const ant1Props = useAnimatedProps(() => ({
      rotation: (ant1.value * 2 - 1) * 24,
      originX: 104, originY: 70,
    }));
    const ant2Props = useAnimatedProps(() => ({
      rotation: (ant2.value * 2 - 1) * -20,
      originX: 138, originY: 72,
    }));

    // Eyes — look down slightly when mood/hunger is low
    const droop = Math.max(0, (50 - Math.min(mood, hunger)) / 50) * 5; // 0..5px
    const eyeLProps = useAnimatedProps(() => ({
      ry: 21 * blinkL.value * eyeWide.value,
      rx: 19 * eyeWide.value,
    }));
    const eyeRProps = useAnimatedProps(() => ({
      ry: 13 * blinkR.value * eyeWide.value,
      rx: 12 * eyeWide.value,
    }));

    const dripProps = useAnimatedProps(() => ({
      ry: 12 + drip.value * 16,
      cy: 204 + drip.value * 6,
      rx: 16 - drip.value * 5,
    }));

    // Container transform (drag → burst → squish → breathe → sway)
    const containerStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: dragX.value },
        { translateY: dragY.value },
        { scale: burst.value },
        { scaleX: squishX.value * (1 + breathe.value * 0.06) },
        { scaleY: squishY.value * (1 - breathe.value * 0.05) },
        { rotate: `${(sway.value * 2 - 1) * 6}deg` },
      ],
    }));

    return (
      <View style={styles.root}>
        {/* Particle layer */}
        <View style={styles.particleLayer} pointerEvents="none">
          {particles.map((p, i) => (
            <RNAnimated.View
              key={i}
              style={[
                styles.particle,
                {
                  width: p.size, height: p.size, borderRadius: p.size / 2,
                  backgroundColor: p.color,
                  shadowColor: p.color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.9, shadowRadius: 6,
                  opacity: p.opacity,
                  transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }],
                },
              ]}
            />
          ))}
        </View>

        {/* The creature */}
        <Reanimated.View style={containerStyle} {...panResponder.panHandlers}>
          <Svg width={RENDER} height={RENDER * (VB_H / VB)} viewBox={`0 0 ${VB} ${VB_H}`}>
            <Defs>
              <RadialGradient id="body" cx="42%" cy="34%" r="75%">
                <Stop offset="0%"   stopColor={pal.core} />
                <Stop offset="55%"  stopColor={pal.mid} />
                <Stop offset="100%" stopColor={pal.rim} />
              </RadialGradient>
              <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%"   stopColor={pal.glow} />
                <Stop offset="70%"  stopColor={pal.glow} stopOpacity={0.25} />
                <Stop offset="100%" stopColor={pal.glow} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id="inner" cx="50%" cy="42%" r="60%">
                <Stop offset="0%"   stopColor="#ffffff" stopOpacity={0.18} />
                <Stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
              </RadialGradient>
            </Defs>

            {/* Atmospheric glow */}
            <Ellipse cx={CX} cy={CY + 4} rx={118} ry={112} fill="url(#glow)" />

            {/* Antennae (behind body) */}
            <AnimatedG animatedProps={ant1Props}>
              <Path d={`M104,70 Q100,48 101,36`} stroke="rgba(255,255,255,0.22)" strokeWidth={5} strokeLinecap="round" fill="none" />
              <Circle cx={101} cy={33} r={7} fill={Colors.lime} opacity={0.95} />
              <Circle cx={101} cy={33} r={11} fill={Colors.lime} opacity={0.18} />
            </AnimatedG>
            <AnimatedG animatedProps={ant2Props}>
              <Path d={`M138,72 Q143,52 142,42`} stroke="rgba(255,255,255,0.18)" strokeWidth={4} strokeLinecap="round" fill="none" />
              <Circle cx={142} cy={39} r={5.5} fill={Colors.pink} opacity={0.95} />
              <Circle cx={142} cy={39} r={9} fill={Colors.pink} opacity={0.18} />
            </AnimatedG>

            {/* Drip (behind body bottom) */}
            <AnimatedEllipse animatedProps={dripProps} cx={118} fill="url(#body)" opacity={0.92} />

            {/* Main morphing body */}
            <AnimatedPath animatedProps={bodyProps} fill="url(#body)" />

            {/* Inner depth layer */}
            <AnimatedPath animatedProps={innerProps} fill="url(#inner)" />

            {/* Gloss highlight */}
            <Ellipse cx={96} cy={98} rx={30} ry={15} fill="rgba(255,255,255,0.16)" rotation={-20} originX={96} originY={98} />

            {/* Eyes — asymmetric */}
            <AnimatedEllipse animatedProps={eyeLProps} cx={104} cy={122} fill="#f5f4ff" />
            <Circle cx={106} cy={124 + droop} r={11} fill="#0a0a14" />
            <Circle cx={110} cy={120 + droop} r={3.5} fill="rgba(255,255,255,0.95)" />

            <AnimatedEllipse animatedProps={eyeRProps} cx={148} cy={130} fill="#f5f4ff" />
            <Circle cx={149} cy={132 + droop} r={6.5} fill="#0a0a14" />
            <Circle cx={151} cy={129 + droop} r={2.2} fill="rgba(255,255,255,0.9)" />

            {/* Fangs */}
            <Path d="M110,168 L116,168 L113,182 Z" fill="rgba(255,255,255,0.9)" />
            <Path d="M122,170 L127,170 L124.5,180 Z" fill="rgba(255,255,255,0.82)" />
          </Svg>
        </Reanimated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  root: {
    width: RENDER,
    height: RENDER * (VB_H / VB),
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleLayer: {
    position: 'absolute',
    top: RENDER * (VB_H / VB) * (CY / VB_H),
    left: RENDER / 2,
    width: 0, height: 0,
    zIndex: 5,
  },
  particle: { position: 'absolute' },
});
