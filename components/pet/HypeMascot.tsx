import React, {
  forwardRef, useImperativeHandle, useRef, useEffect, useMemo, useCallback,
} from 'react';
import { Animated, Easing, PanResponder, StyleSheet, View } from 'react-native';
import Svg, {
  Path, Ellipse, Circle, G, Line, Defs, LinearGradient, RadialGradient, Stop,
} from 'react-native-svg';
import { Colors } from '@/constants/tokens';

/* ============================================================
   Хайпожорик — живой маскот (псевдо-3D в 2D).
   Слои: свечение-аура · тень на полу · пузырьки · тело с объёмным
   градиентом · глаза-Views (моргают, следят за пальцем).
   Реагирует на любое касание; настроение зависит от сытости.
   Всё на transform/opacity + native driver → плавно, без лагов.
   ============================================================ */

export type HypeMascotRef = {
  triggerFed: () => void;
  triggerEvolve: () => void;
};

interface Props {
  stage: number;
  color?: string;
  size?: number;
  hunger?: number;     // 0..100 — влияет на настроение
  active?: boolean;    // пауза анимаций когда экран не виден
  onTap?: () => void;
}

const VIEWBOX = 220;

/** Осветлить/затемнить hex-цвет на величину amt (-1..1). */
function shade(hex: string, amt: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const num = parseInt(full, 16);
  let r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  r = Math.round((t - r) * p) + r;
  g = Math.round((t - g) * p) + g;
  b = Math.round((t - b) * p) + b;
  return `rgb(${r},${g},${b})`;
}

function blob(cx: number, cy: number, radii: number[], squash = 1): string {
  const n = radii.length;
  const pts: [number, number][] = radii.map((r, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * squash];
  });
  let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) +
         ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }
  return d + 'Z';
}

interface Eye { x: number; y: number; r: number; }
interface StageData {
  radii: number[]; cx: number; cy: number; squash: number;
  eyes: Eye[]; pupil: number;
  mouth: string; mouthFill: boolean; teeth: number[] | null; brow: boolean;
}

const STAGES: StageData[] = [
  {
    radii: [40, 58, 60, 62, 61, 63, 60, 62, 60, 62, 61, 58], cx: 110, cy: 122, squash: 1.04,
    eyes: [{ x: 92, y: 110, r: 13 }, { x: 128, y: 110, r: 13 }], pupil: 5.5,
    mouth: 'M100 142 Q110 150 120 142', mouthFill: false, teeth: null, brow: false,
  },
  {
    radii: [58, 74, 66, 80, 70, 72, 84, 80, 86, 80, 72, 76, 70, 80, 66, 74], cx: 110, cy: 114, squash: 1.0,
    eyes: [{ x: 88, y: 100, r: 16 }, { x: 132, y: 100, r: 16 }], pupil: 7,
    mouth: 'M84 132 Q110 122 136 132 Q120 162 110 162 Q100 162 84 132 Z', mouthFill: true, teeth: [94, 124, 110, 128], brow: false,
  },
  {
    radii: [80, 64, 96, 68, 90, 66, 98, 70, 88, 64, 94, 68, 92, 66, 96, 70], cx: 110, cy: 108, squash: 1.0,
    eyes: [{ x: 80, y: 92, r: 15 }, { x: 140, y: 92, r: 15 }, { x: 110, y: 74, r: 11 }], pupil: 6.5,
    mouth: 'M74 128 Q110 116 146 128 Q138 168 110 168 Q82 168 74 128 Z', mouthFill: true, teeth: [88, 120, 108, 124, 128, 120], brow: true,
  },
];

const PARTICLE_COUNT = 9;
const PARTICLE_COLORS = [Colors.lime, Colors.cyan, Colors.coin, Colors.hot, Colors.violet];

interface ParticleNode {
  x: Animated.Value; y: Animated.Value; o: Animated.Value; s: Animated.Value;
  color: string; size: number;
}

/** Медленно всплывающий пузырёк-блик вокруг тела. */
function Bubble({ left, size, delay, dur, color, active }: {
  left: number; size: number; delay: number; dur: number; color: string; active: boolean;
}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.timing(t, { toValue: 1, duration: dur, delay, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [t, dur, delay, active]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [10, -95] });
  const opacity = t.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 0.5, 0.4, 0] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', bottom: 60, left,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, opacity,
        transform: [{ translateY }, { scale }],
      }}
    />
  );
}

const HypeMascot = forwardRef<HypeMascotRef, Props>(
  ({ stage, color = Colors.lime, size = 240, hunger = 100, active = true, onTap }, ref) => {
    const s = STAGES[Math.max(0, Math.min(STAGES.length - 1, stage))];
    const scale = size / VIEWBOX;
    const sad = hunger < 30;

    const ids = useRef({
      shade: `sh-${Math.random().toString(36).slice(2)}`,
      glow: `gl-${Math.random().toString(36).slice(2)}`,
    }).current;

    // --- body transform drivers (all native) ---
    const breath = useRef(new Animated.Value(0)).current;
    const float = useRef(new Animated.Value(0)).current;
    const reactX = useRef(new Animated.Value(1)).current;
    const reactY = useRef(new Animated.Value(1)).current;
    const hop = useRef(new Animated.Value(0)).current;
    const rot = useRef(new Animated.Value(0)).current;
    const leanX = useRef(new Animated.Value(0)).current;
    const leanY = useRef(new Animated.Value(0)).current;
    const glowA = useRef(new Animated.Value(0)).current;

    // --- eye drivers ---
    const blink = useRef(new Animated.Value(1)).current;
    const pupilX = useRef(new Animated.Value(0)).current;
    const pupilY = useRef(new Animated.Value(sad ? 0.4 : 0)).current;
    const squint = useRef(new Animated.Value(0)).current;
    const draggingRef = useRef(false);

    // --- particles ---
    const particles = useRef<ParticleNode[]>(
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        x: new Animated.Value(0), y: new Animated.Value(0),
        o: new Animated.Value(0), s: new Animated.Value(0),
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        size: 7 + (i % 3) * 4,
      }))
    ).current;

    const burst = useCallback(() => {
      particles.forEach((p, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.6;
        const dist = 70 + Math.random() * 60;
        p.x.setValue(0); p.y.setValue(0); p.o.setValue(1); p.s.setValue(1.6);
        Animated.parallel([
          Animated.timing(p.x, { toValue: Math.cos(angle) * dist, duration: 760, useNativeDriver: true }),
          Animated.timing(p.y, { toValue: Math.sin(angle) * dist, duration: 760, useNativeDriver: true }),
          Animated.timing(p.o, { toValue: 0, duration: 760, useNativeDriver: true }),
          Animated.timing(p.s, { toValue: 0.2, duration: 760, useNativeDriver: true }),
        ]).start();
      });
    }, [particles]);

    // --- idle loops: breathe + float + glow (slower when sad) ---
    useEffect(() => {
      if (!active) return;
      const bd = sad ? 2300 : 1600;
      const breathe = Animated.loop(Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: bd, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: bd, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]));
      const floating = Animated.loop(Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]));
      const glow = Animated.loop(Animated.sequence([
        Animated.timing(glowA, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowA, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]));
      breathe.start(); floating.start(); glow.start();
      return () => { breathe.stop(); floating.stop(); glow.stop(); };
    }, [breath, float, glowA, sad, active]);

    // --- random blinking + idle glancing ---
    const doBlink = useCallback((double = false) => {
      const one = Animated.sequence([
        Animated.timing(blink, { toValue: 0, duration: 70, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 110, useNativeDriver: true }),
      ]);
      if (double) {
        Animated.sequence([one, Animated.delay(90), Animated.sequence([
          Animated.timing(blink, { toValue: 0, duration: 70, useNativeDriver: true }),
          Animated.timing(blink, { toValue: 1, duration: 110, useNativeDriver: true }),
        ])]).start();
      } else {
        one.start();
      }
    }, [blink]);

    useEffect(() => {
      if (!active) return;
      let alive = true;
      const restY = sad ? 0.4 : 0;
      const scheduleBlink = () => {
        const delay = 2400 + Math.random() * 2600;
        setTimeout(() => {
          if (!alive) return;
          doBlink(Math.random() < 0.25);
          scheduleBlink();
        }, delay);
      };
      const scheduleGlance = () => {
        const delay = 3200 + Math.random() * 3000;
        setTimeout(() => {
          if (!alive) return;
          if (!draggingRef.current) {
            const gx = (Math.random() * 2 - 1) * 0.7;
            const gy = restY + (Math.random() * 2 - 1) * 0.4;
            Animated.parallel([
              Animated.spring(pupilX, { toValue: gx, useNativeDriver: true, friction: 6 }),
              Animated.spring(pupilY, { toValue: gy, useNativeDriver: true, friction: 6 }),
            ]).start(() => {
              setTimeout(() => {
                if (draggingRef.current) return;
                Animated.parallel([
                  Animated.spring(pupilX, { toValue: 0, useNativeDriver: true, friction: 6 }),
                  Animated.spring(pupilY, { toValue: restY, useNativeDriver: true, friction: 6 }),
                ]).start();
              }, 900);
            });
          }
          scheduleGlance();
        }, delay);
      };
      scheduleBlink(); scheduleGlance();
      return () => { alive = false; };
    }, [doBlink, pupilX, pupilY, sad, active]);

    // --- happy tap reaction ---
    const happyReact = useCallback(() => {
      reactX.stopAnimation(); reactY.stopAnimation(); hop.stopAnimation(); rot.stopAnimation();
      reactX.setValue(1); reactY.setValue(1);
      Animated.parallel([
        Animated.sequence([
          Animated.timing(reactX, { toValue: 1.16, duration: 110, useNativeDriver: true }),
          Animated.spring(reactX, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(reactY, { toValue: 0.82, duration: 110, useNativeDriver: true }),
          Animated.spring(reactY, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(hop, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(hop, { toValue: 0, friction: 5, tension: 90, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(rot, { toValue: 1, duration: 90, useNativeDriver: true }),
          Animated.timing(rot, { toValue: -1, duration: 120, useNativeDriver: true }),
          Animated.spring(rot, { toValue: 0, friction: 4, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(squint, { toValue: 1, duration: 120, useNativeDriver: true }),
          Animated.timing(squint, { toValue: 0, duration: 260, useNativeDriver: true }),
        ]),
      ]).start();
      doBlink(true);
      burst();
    }, [reactX, reactY, hop, rot, squint, doBlink, burst]);

    useImperativeHandle(ref, () => ({
      triggerFed: () => happyReact(),
      triggerEvolve: () => {
        reactX.setValue(1); reactY.setValue(1); rot.setValue(0);
        Animated.parallel([
          Animated.sequence([
            Animated.timing(reactX, { toValue: 0.55, duration: 280, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(reactX, { toValue: 1.3, duration: 340, easing: Easing.out(Easing.back(2.4)), useNativeDriver: true }),
            Animated.spring(reactX, { toValue: 1, friction: 4, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(reactY, { toValue: 0.55, duration: 280, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(reactY, { toValue: 1.3, duration: 340, easing: Easing.out(Easing.back(2.4)), useNativeDriver: true }),
            Animated.spring(reactY, { toValue: 1, friction: 4, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(rot, { toValue: -1, duration: 280, useNativeDriver: true }),
            Animated.timing(rot, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(rot, { toValue: 0, friction: 3, useNativeDriver: true }),
          ]),
        ]).start();
        burst();
        setTimeout(() => burst(), 240);
      },
    }), [happyReact, reactX, reactY, rot, burst]);

    // --- touch handling ---
    const updateTrack = useCallback((lx: number, ly: number) => {
      const nx = Math.max(-1, Math.min(1, (lx - size / 2) / (size / 2)));
      const ny = Math.max(-1, Math.min(1, (ly - size / 2) / (size / 2)));
      pupilX.setValue(nx);
      pupilY.setValue(ny);
      leanX.setValue(nx * 10);
      leanY.setValue(ny * 8);
    }, [size, pupilX, pupilY, leanX, leanY]);

    const springBack = useCallback(() => {
      const restY = sad ? 0.4 : 0;
      Animated.parallel([
        Animated.spring(leanX, { toValue: 0, friction: 6, useNativeDriver: true }),
        Animated.spring(leanY, { toValue: 0, friction: 6, useNativeDriver: true }),
        Animated.spring(pupilX, { toValue: 0, friction: 6, useNativeDriver: true }),
        Animated.spring(pupilY, { toValue: restY, friction: 6, useNativeDriver: true }),
      ]).start();
    }, [leanX, leanY, pupilX, pupilY, sad]);

    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: (e) => {
            draggingRef.current = true;
            updateTrack(e.nativeEvent.locationX, e.nativeEvent.locationY);
          },
          onPanResponderMove: (e) => {
            updateTrack(e.nativeEvent.locationX, e.nativeEvent.locationY);
          },
          onPanResponderRelease: (_e, gs) => {
            draggingRef.current = false;
            springBack();
            if (Math.abs(gs.dx) < 12 && Math.abs(gs.dy) < 12) {
              happyReact();
              onTap?.();
            }
          },
          onPanResponderTerminate: () => {
            draggingRef.current = false;
            springBack();
          },
        }),
      [happyReact, onTap, updateTrack, springBack]
    );

    // --- interpolations ---
    const breathScaleX = breath.interpolate({ inputRange: [0, 1], outputRange: [1, sad ? 1.02 : 1.045] });
    const breathScaleY = breath.interpolate({ inputRange: [0, 1], outputRange: [1, sad ? 0.985 : 0.955] });
    const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [3, sad ? -2 : -7] });
    const hopY = hop.interpolate({ inputRange: [0, 1], outputRange: [0, -26] });
    const rotate = rot.interpolate({ inputRange: [-1, 1], outputRange: ['-9deg', '9deg'] });

    const bodyTransform = [
      { translateX: leanX },
      { translateY: Animated.add(Animated.add(floatY, hopY), leanY) },
      { scaleX: Animated.multiply(breathScaleX, reactX) },
      { scaleY: Animated.multiply(breathScaleY, reactY) },
      { rotate },
    ];

    const glowOpacity = glowA.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.5] });
    const glowScale = glowA.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

    // floor shadow shrinks & fades as the creature lifts off
    const shadowScale = hop.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] });
    const shadowOpacity = hop.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.1] });

    const yTop = stage >= 2 ? 128 : 132;
    const tongueCy = stage >= 2 ? 160 : 154;
    const eyeOpen = Animated.multiply(blink, squint.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] }));

    const bodyPath = useMemo(() => blob(s.cx, s.cy, s.radii, s.squash), [s]);

    const lightColor = shade(color, 0.42);
    const darkColor = shade(color, -0.28);
    const glowSize = size * 1.25;

    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} {...panResponder.panHandlers}>
        {/* GLOW aura behind everything */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: glowSize, height: glowSize,
            opacity: glowOpacity, transform: [{ scale: glowScale }],
          }}
        >
          <Svg width={glowSize} height={glowSize}>
            <Defs>
              <RadialGradient id={ids.glow} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={color} stopOpacity={0.9} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={glowSize / 2} cy={glowSize / 2} r={glowSize / 2} fill={`url(#${ids.glow})`} />
          </Svg>
        </Animated.View>

        {/* floating bubbles */}
        <Bubble left={size * 0.30} size={9}  delay={0}    dur={3400} color="rgba(255,255,255,0.5)" active={active} />
        <Bubble left={size * 0.62} size={6}  delay={1200} dur={3000} color={color} active={active} />
        <Bubble left={size * 0.48} size={7}  delay={2200} dur={3800} color="rgba(255,255,255,0.4)" active={active} />
        <Bubble left={size * 0.70} size={5}  delay={600}  dur={3200} color={color} active={active} />

        {/* floor shadow */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute', bottom: 6,
            width: 150, height: 24, borderRadius: 75,
            backgroundColor: '#000',
            opacity: shadowOpacity,
            transform: [{ scaleX: shadowScale }],
          }}
        />

        {/* particle layer (above body) */}
        <View style={styles.particleLayer} pointerEvents="none">
          {particles.map((p, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  width: p.size, height: p.size, borderRadius: p.size / 2,
                  backgroundColor: p.color, opacity: p.o,
                  transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.s }],
                },
              ]}
            />
          ))}
        </View>

        {/* BODY */}
        <Animated.View style={{ width: size, height: size, transform: bodyTransform }}>
          <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} style={{ overflow: 'visible' }}>
            <Defs>
              {/* vertical volume: bright top → base → dark bottom */}
              <LinearGradient id={ids.shade} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={lightColor} stopOpacity={1} />
                <Stop offset="0.45" stopColor={color} stopOpacity={1} />
                <Stop offset="1" stopColor={darkColor} stopOpacity={1} />
              </LinearGradient>
            </Defs>

            {/* body with volumetric gradient */}
            <Path d={bodyPath} fill={`url(#${ids.shade})`} />

            {/* glossy specular highlight */}
            <Ellipse cx={s.cx - 22} cy={s.cy - 34} rx={26} ry={16} fill="#fff" opacity={0.28} />
            <Ellipse cx={s.cx - 30} cy={s.cy - 40} rx={9} ry={6} fill="#fff" opacity={0.5} />

            {stage >= 1 && (
              <>
                <Circle cx={s.cx - 30} cy={s.cy + 58} r={7} fill={darkColor} />
                <Circle cx={s.cx + 34} cy={s.cy + 52} r={5} fill={darkColor} />
              </>
            )}
            {stage >= 2 && <Circle cx={s.cx + 12} cy={s.cy + 66} r={6} fill={darkColor} />}

            {s.brow && (
              <G stroke="rgba(0,0,0,0.55)" strokeWidth={5} strokeLinecap="round">
                <Line x1={68} y1={74} x2={92} y2={82} />
                <Line x1={152} y1={74} x2={128} y2={82} />
              </G>
            )}

            {stage >= 1 && (
              <G fill="#fff" opacity={0.22}>
                <Circle cx={74} cy={124} r={8} />
                <Circle cx={146} cy={124} r={8} />
              </G>
            )}

            {/* mouth — sad gets a downturned curve */}
            {sad ? (
              <Path d={`M${s.cx - 16} ${yTop + 8} Q${s.cx} ${yTop - 4} ${s.cx + 16} ${yTop + 8}`}
                fill="none" stroke="rgba(10,8,6,0.62)" strokeWidth={4} strokeLinecap="round" />
            ) : s.mouthFill ? (
              <>
                <Path d={s.mouth} fill="rgba(10,8,6,0.62)" />
                {s.teeth && s.teeth.map((x, i) => (
                  <Path key={i} d={`M${x - 6} ${yTop} L${x + 6} ${yTop} L${x} ${yTop + 11} Z`} fill="#fff" />
                ))}
                <Ellipse cx={s.cx} cy={tongueCy} rx={13} ry={8} fill="#ff5b8a" />
              </>
            ) : (
              <Path d={s.mouth} fill="none" stroke="rgba(10,8,6,0.62)" strokeWidth={4} strokeLinecap="round" />
            )}
          </Svg>

          {/* EYES overlay */}
          {s.eyes.map((e, i) => {
            const left = (e.x - e.r) * scale;
            const top = (e.y - e.r) * scale;
            const d = e.r * 2 * scale;
            const pr = s.pupil * scale;
            const maxOff = (e.r - s.pupil - 1) * scale;
            const px = pupilX.interpolate({ inputRange: [-1, 1], outputRange: [-maxOff, maxOff] });
            const py = pupilY.interpolate({ inputRange: [-1, 1], outputRange: [-maxOff, maxOff] });
            return (
              <Animated.View
                key={i}
                style={{
                  position: 'absolute', left, top, width: d, height: d,
                  transform: [{ scaleY: eyeOpen }],
                }}
              >
                <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                  <Animated.View
                    style={{
                      position: 'absolute',
                      width: pr * 2, height: pr * 2, borderRadius: pr,
                      backgroundColor: '#15110b',
                      transform: [{ translateX: px }, { translateY: py }],
                    }}
                  >
                    <View style={{ position: 'absolute', top: pr * 0.2, left: pr * 0.7, width: pr * 0.8, height: pr * 0.8, borderRadius: pr * 0.4, backgroundColor: '#fff' }} />
                  </Animated.View>
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>
    );
  }
);

HypeMascot.displayName = 'HypeMascot';

const styles = StyleSheet.create({
  particleLayer: { position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, zIndex: 5 },
  particle: { position: 'absolute' },
});

export default HypeMascot;
