import React, {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Animated, View, PanResponder, StyleSheet } from 'react-native';
import { Colors } from '@/constants/tokens';

// ─── Config ───────────────────────────────────────────────────────────────────
const SIZE = 170;
const HALF = SIZE / 2;
const PARTICLE_COUNT = 12;
const PARTICLE_COLORS = [Colors.lime, Colors.pink, Colors.gold, Colors.violet, Colors.sky];

// 4 blob shapes: per-corner border-radius values (they cycle as a loop)
const SHAPES = [
  [62, 38, 56, 44],
  [44, 68, 38, 62],
  [56, 32, 70, 40],
  [36, 62, 44, 68],
];

// ─── Types ────────────────────────────────────────────────────────────────────
export interface HypeBlobRef {
  triggerHypeBurst: () => void;
}

interface Props {
  hype: number;    // 0–100
  hunger: number;  // 0–100
  mood: number;    // 0–100
  onTap?: () => void;
}

// ─── Color helpers ────────────────────────────────────────────────────────────
function hypeToShadowColor(hype: number) {
  if (hype < 30) return Colors.violet;
  if (hype < 65) return Colors.pink;
  return Colors.lime;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const HypeBlob = forwardRef<HypeBlobRef, Props>(
  ({ hype, hunger, mood, onTap }, ref) => {
    // ── Idle animations ──
    const breathe = useRef(new Animated.Value(0)).current;
    const morph   = useRef(new Animated.Value(0)).current;
    const sway    = useRef(new Animated.Value(0)).current;
    const blinkL  = useRef(new Animated.Value(1)).current;
    const blinkR  = useRef(new Animated.Value(1)).current;
    const ant1    = useRef(new Animated.Value(0)).current;
    const ant2    = useRef(new Animated.Value(0)).current;

    // ── Interaction animations ──
    const squishX   = useRef(new Animated.Value(1)).current;
    const squishY   = useRef(new Animated.Value(1)).current;
    const burstScale= useRef(new Animated.Value(1)).current;
    const dragX     = useRef(new Animated.Value(0)).current;
    const dragY     = useRef(new Animated.Value(0)).current;
    const eyeWide   = useRef(new Animated.Value(1)).current;

    // ── Hype color (JS driver, for backgroundColor interpolation) ──
    const hypeAnim = useRef(new Animated.Value(hype)).current;
    useEffect(() => {
      Animated.timing(hypeAnim, {
        toValue: hype,
        duration: 700,
        useNativeDriver: false,
      }).start();
    }, [hype]);

    // ── Particles ──
    const particles = useRef(
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        x:       new Animated.Value(0),
        y:       new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale:   new Animated.Value(0),
        color:   PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        size:    7 + (i % 3) * 4,
      }))
    ).current;

    // ── Start idle loops ──
    useEffect(() => {
      // Breathing (native)
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 2100, useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 0, duration: 2300, useNativeDriver: true }),
        ])
      ).start();

      // Shape morphing (JS — borderRadius)
      Animated.loop(
        Animated.sequence([
          Animated.timing(morph, { toValue: 1, duration: 2800, useNativeDriver: false }),
          Animated.timing(morph, { toValue: 2, duration: 3200, useNativeDriver: false }),
          Animated.timing(morph, { toValue: 3, duration: 2600, useNativeDriver: false }),
          Animated.timing(morph, { toValue: 0, duration: 3000, useNativeDriver: false }),
        ])
      ).start();

      // Sway (native)
      Animated.loop(
        Animated.sequence([
          Animated.timing(sway, { toValue: 1, duration: 2700, useNativeDriver: true }),
          Animated.timing(sway, { toValue: -1, duration: 2700, useNativeDriver: true }),
        ])
      ).start();

      // Antenna 1 (native)
      Animated.loop(
        Animated.sequence([
          Animated.timing(ant1, { toValue: 1, duration: 750, useNativeDriver: true }),
          Animated.timing(ant1, { toValue: -1, duration: 750, useNativeDriver: true }),
        ])
      ).start();

      // Antenna 2 — offset phase (native)
      const t = setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(ant2, { toValue: -1, duration: 600, useNativeDriver: true }),
            Animated.timing(ant2, { toValue: 1, duration: 600, useNativeDriver: true }),
          ])
        ).start();
      }, 350);

      return () => clearTimeout(t);
    }, []);

    // ── Blink loops (independent timing) ──
    useEffect(() => {
      let tL: ReturnType<typeof setTimeout>;
      let tR: ReturnType<typeof setTimeout>;
      const doBlinkL = () => {
        Animated.sequence([
          Animated.timing(blinkL, { toValue: 0.04, duration: 65, useNativeDriver: true }),
          Animated.timing(blinkL, { toValue: 1, duration: 90, useNativeDriver: true }),
        ]).start();
        tL = setTimeout(doBlinkL, 2200 + Math.random() * 4000);
      };
      const doBlinkR = () => {
        Animated.sequence([
          Animated.timing(blinkR, { toValue: 0.04, duration: 75, useNativeDriver: true }),
          Animated.timing(blinkR, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
        tR = setTimeout(doBlinkR, 3500 + Math.random() * 3500);
      };
      tL = setTimeout(doBlinkL, 900);
      tR = setTimeout(doBlinkR, 2400);
      return () => { clearTimeout(tL); clearTimeout(tR); };
    }, []);

    // ── Tap handler ──
    const handleTap = useCallback(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(squishX, { toValue: 1.32, speed: 70, bounciness: 0, useNativeDriver: true }),
          Animated.spring(squishY, { toValue: 0.72, speed: 70, bounciness: 0, useNativeDriver: true }),
          Animated.spring(eyeWide,  { toValue: 1.5,  speed: 60, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(squishX, { toValue: 1, speed: 7, bounciness: 24, useNativeDriver: true }),
          Animated.spring(squishY, { toValue: 1, speed: 7, bounciness: 24, useNativeDriver: true }),
          Animated.spring(eyeWide,  { toValue: 1, speed: 12, useNativeDriver: true }),
        ]),
      ]).start();
      onTap?.();
    }, [onTap]);

    // ── Hype burst (called from parent) ──
    const triggerHypeBurst = useCallback(() => {
      // Launch particles in all directions
      particles.forEach((p, i) => {
        const angle = (i / PARTICLE_COUNT) * 2 * Math.PI + Math.random() * 0.6;
        const dist  = 65 + Math.random() * 65;
        p.x.setValue(0);
        p.y.setValue(0);
        p.opacity.setValue(1);
        p.scale.setValue(1.8);
        Animated.parallel([
          Animated.timing(p.x,       { toValue: Math.cos(angle) * dist, duration: 800, useNativeDriver: true }),
          Animated.timing(p.y,       { toValue: Math.sin(angle) * dist, duration: 800, useNativeDriver: true }),
          Animated.timing(p.opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
          Animated.timing(p.scale,   { toValue: 0.1, duration: 800, useNativeDriver: true }),
        ]).start();
      });

      // Blob expands and bounces back
      Animated.sequence([
        Animated.spring(burstScale, { toValue: 1.5, speed: 55, bounciness: 0, useNativeDriver: true }),
        Animated.spring(burstScale, { toValue: 1,   speed: 5,  bounciness: 30, useNativeDriver: true }),
      ]).start();

      // Eyes go huge then settle
      Animated.sequence([
        Animated.spring(eyeWide, { toValue: 1.8, speed: 55, useNativeDriver: true }),
        Animated.delay(500),
        Animated.spring(eyeWide, { toValue: 1,   speed: 8,  useNativeDriver: true }),
      ]).start();
    }, []);

    useImperativeHandle(ref, () => ({ triggerHypeBurst }), [triggerHypeBurst]);

    // ── Pan responder (drag + tap detection) ──
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gs) => {
          dragX.setValue(gs.dx * 0.45);
          dragY.setValue(gs.dy * 0.38);
        },
        onPanResponderRelease: (_, gs) => {
          if (Math.abs(gs.dx) < 8 && Math.abs(gs.dy) < 8) handleTap();
          Animated.parallel([
            Animated.spring(dragX, { toValue: 0, bounciness: 18, speed: 9, useNativeDriver: true }),
            Animated.spring(dragY, { toValue: 0, bounciness: 18, speed: 9, useNativeDriver: true }),
          ]).start();
        },
        onPanResponderTerminate: () => {
          dragX.setValue(0);
          dragY.setValue(0);
        },
      })
    ).current;

    // ── Derived animated values ──
    const breatheX = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.055] });
    const breatheY = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 0.955] });
    const rotateV  = sway.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] });
    const ant1Rot  = ant1.interpolate({ inputRange: [-1, 1], outputRange: ['-24deg', '24deg'] });
    const ant2Rot  = ant2.interpolate({ inputRange: [-1, 1], outputRange: ['20deg', '-20deg'] });

    // Border radius cycling through 4 shapes
    const tlr = morph.interpolate({ inputRange: [0, 1, 2, 3], outputRange: SHAPES.map(s => s[0]) });
    const trr = morph.interpolate({ inputRange: [0, 1, 2, 3], outputRange: SHAPES.map(s => s[1]) });
    const brr = morph.interpolate({ inputRange: [0, 1, 2, 3], outputRange: SHAPES.map(s => s[2]) });
    const blr = morph.interpolate({ inputRange: [0, 1, 2, 3], outputRange: SHAPES.map(s => s[3]) });

    // Blob color: dark purple → pink → lime as hype rises
    const blobBg = hypeAnim.interpolate({
      inputRange:  [0,       20,       45,       70,       100],
      outputRange: ['#1a0f30', '#3d1f78', '#8b3db0', '#e03890', '#a8e032'],
    });
    // Outer atmospheric glow
    const outerGlow = hypeAnim.interpolate({
      inputRange:  [0,                        50,                           100],
      outputRange: ['rgba(45,20,100,0.18)',   'rgba(190,50,130,0.25)',      'rgba(180,230,50,0.28)'],
    });
    const innerGlow = hypeAnim.interpolate({
      inputRange:  [0,                        50,                           100],
      outputRange: ['rgba(80,40,160,0.22)',   'rgba(220,60,140,0.32)',      'rgba(198,242,78,0.38)'],
    });

    const shadowColor = hypeToShadowColor(hype);

    return (
      <View style={styles.root}>
        {/* ── Atmospheric glow rings ── */}
        <Animated.View style={[styles.glowOuter, { backgroundColor: outerGlow }]} />
        <Animated.View style={[styles.glowInner, { backgroundColor: innerGlow }]} />

        {/* ── Particles (pointer-events: none so they don't block touches) ── */}
        <View style={styles.particleLayer} pointerEvents="none">
          {particles.map((p, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  width:  p.size,
                  height: p.size,
                  borderRadius: p.size / 2,
                  backgroundColor: p.color,
                  shadowColor: p.color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.9,
                  shadowRadius: 4,
                  transform: [
                    { translateX: p.x },
                    { translateY: p.y },
                    { scale: p.scale },
                  ],
                  opacity: p.opacity,
                },
              ]}
            />
          ))}
        </View>

        {/* ── Drag layer ── */}
        <Animated.View
          style={{ transform: [{ translateX: dragX }, { translateY: dragY }] }}
          {...panResponder.panHandlers}
        >
          {/* Burst scale layer */}
          <Animated.View style={{ transform: [{ scale: burstScale }] }}>
            {/* Squish layer */}
            <Animated.View style={{ transform: [{ scaleX: squishX }, { scaleY: squishY }] }}>
              {/* Breathe + sway layer */}
              <Animated.View
                style={{
                  transform: [
                    { scaleX: breatheX },
                    { scaleY: breatheY },
                    { rotate: rotateV },
                  ],
                }}
              >
                {/* ── Antennae (pivot from bottom: double-height container trick) ── */}
                <View style={styles.antRow}>
                  {/* Antenna 1 */}
                  <Animated.View style={[styles.antPivot, { transform: [{ rotate: ant1Rot }] }]}>
                    <View style={styles.antStalk1} />
                    <View style={styles.antBall1} />
                  </Animated.View>

                  <View style={styles.antGap} />

                  {/* Antenna 2 */}
                  <Animated.View style={[styles.antPivot, styles.antPivot2, { transform: [{ rotate: ant2Rot }] }]}>
                    <View style={styles.antStalk2} />
                    <View style={styles.antBall2} />
                  </Animated.View>
                </View>

                {/* ── Main blob ── */}
                <Animated.View
                  style={[
                    styles.blob,
                    {
                      backgroundColor: blobBg,
                      borderTopLeftRadius:     tlr,
                      borderTopRightRadius:    trr,
                      borderBottomRightRadius: brr,
                      borderBottomLeftRadius:  blr,
                      shadowColor,
                    },
                  ]}
                >
                  {/* Gloss highlight */}
                  <View style={styles.gloss} />

                  {/* Bump / wart (ugly-cute protrusion) */}
                  <Animated.View style={[styles.bump, { backgroundColor: blobBg }]} />

                  {/* ── Eyes ── */}
                  <View style={styles.eyeRow}>
                    {/* Left eye — larger */}
                    <Animated.View
                      style={[styles.eye, styles.eyeL, { transform: [{ scaleY: blinkL }, { scale: eyeWide }] }]}
                    >
                      <View style={styles.pupilL} />
                      <View style={styles.shine} />
                    </Animated.View>

                    {/* Right eye — smaller, offset down */}
                    <Animated.View
                      style={[styles.eye, styles.eyeR, { transform: [{ scaleY: blinkR }, { scale: eyeWide }] }]}
                    >
                      <View style={styles.pupilR} />
                      <View style={styles.shineSmall} />
                    </Animated.View>
                  </View>

                  {/* ── Fangs ── */}
                  <View style={styles.fangRow}>
                    <View style={styles.fang} />
                    <View style={[styles.fang, styles.fangShort]} />
                  </View>
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const GLOW_OUTER = SIZE + 90;
const GLOW_INNER = SIZE + 42;
const ANT_H = 34; // visible stalk height
const ANT_PIVOT_H = ANT_H * 2; // container is 2× so center = bottom of stalk

const styles = StyleSheet.create({
  root: {
    width:  SIZE + 90,
    height: SIZE + 90 + ANT_H, // extra top space for antennae
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },

  glowOuter: {
    position: 'absolute',
    bottom: 10,
    width:  GLOW_OUTER,
    height: GLOW_OUTER,
    borderRadius: GLOW_OUTER / 2,
  },
  glowInner: {
    position: 'absolute',
    bottom: 10,
    width:  GLOW_INNER,
    height: GLOW_INNER,
    borderRadius: GLOW_INNER / 2,
  },

  particleLayer: {
    position: 'absolute',
    bottom: 10 + SIZE / 2,
    alignSelf: 'center',
    width: 0,
    height: 0,
  },
  particle: {
    position: 'absolute',
  },

  // Antenna layout
  antRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: -4,
    zIndex: 1,
  },
  antGap: { width: 48 },

  // Double-height pivot container — rotation center = bottom of stalk
  antPivot: {
    width: 6,
    height: ANT_PIVOT_H,
    alignItems: 'center',
    justifyContent: 'flex-start', // stalk in top half → pivot at center = stalk bottom
  },
  antPivot2: {
    width: 5,
    height: ANT_PIVOT_H * 0.85,
  },
  antStalk1: {
    width: 5,
    height: ANT_H,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 3,
  },
  antStalk2: {
    width: 4,
    height: ANT_H * 0.75,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 3,
  },
  antBall1: {
    position: 'absolute',
    top: -9,
    width:  12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.lime,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 7,
  },
  antBall2: {
    position: 'absolute',
    top: -7,
    width:  9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.pink,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },

  // Blob
  blob: {
    width:  SIZE,
    height: SIZE,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 14,
  },

  gloss: {
    position: 'absolute',
    top: 14,
    left: 22,
    width:  SIZE * 0.44,
    height: SIZE * 0.22,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 40,
    transform: [{ rotate: '-18deg' }],
  },

  // The protrusion that makes it look organically ugly
  bump: {
    position: 'absolute',
    top: -18,
    right: 22,
    width:  52,
    height: 52,
    borderRadius: 26,
    opacity: 0.75,
  },

  // Eyes
  eyeRow: {
    position: 'absolute',
    top: SIZE * 0.30,
    left: SIZE * 0.16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  eye: {
    backgroundColor: '#f5f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  eyeL: { width: 42, height: 42, borderRadius: 21 },
  eyeR: { width: 26, height: 26, borderRadius: 13, marginTop: 12 },
  pupilL: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#0a0a14' },
  pupilR: { width: 13, height: 13, borderRadius: 7,  backgroundColor: '#0a0a14' },
  shine: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  shineSmall: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  // Fangs
  fangRow: {
    position: 'absolute',
    bottom: SIZE * 0.11,
    left:   SIZE * 0.3,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'flex-start',
  },
  fang: {
    width: 0,
    height: 0,
    borderLeftWidth:  5,
    borderRightWidth: 5,
    borderTopWidth:   13,
    borderLeftColor:  'transparent',
    borderRightColor: 'transparent',
    borderTopColor:   'rgba(255,255,255,0.88)',
  },
  fangShort: {
    borderTopWidth: 9,
    marginTop: 4,
  },
});
