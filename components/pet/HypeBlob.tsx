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
const PARTICLE_COUNT = 14;
const PARTICLE_COLORS = [Colors.lime, Colors.pink, Colors.gold, Colors.violet, Colors.sky];

// Extreme blob shapes — more organic/gooey, 28–82 range
const SHAPES = [
  [72, 28, 62, 38],
  [32, 78, 32, 68],
  [62, 38, 78, 28],
  [28, 68, 42, 82],
  [68, 42, 35, 72],
];

export interface HypeBlobRef {
  triggerHypeBurst: () => void;
}

interface Props {
  hype: number;
  hunger: number;
  mood: number;
  onTap?: () => void;
  /** Scale the whole blob — used by pet screen entrance anim */
  entranceScale?: Animated.Value;
}

function hypeToShadowColor(hype: number) {
  if (hype < 30) return Colors.violet;
  if (hype < 65) return Colors.pink;
  return Colors.lime;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const HypeBlob = forwardRef<HypeBlobRef, Props>(
  ({ hype, hunger, mood, onTap, entranceScale }, ref) => {
    // Idle
    const breathe  = useRef(new Animated.Value(0)).current;
    const morph    = useRef(new Animated.Value(0)).current;
    const sway     = useRef(new Animated.Value(0)).current;
    const blinkL   = useRef(new Animated.Value(1)).current;
    const blinkR   = useRef(new Animated.Value(1)).current;
    const ant1     = useRef(new Animated.Value(0)).current;
    const ant2     = useRef(new Animated.Value(0)).current;
    // Drip idle oscillation
    const drip     = useRef(new Animated.Value(0)).current;

    // Interaction
    const squishX    = useRef(new Animated.Value(1)).current;
    const squishY    = useRef(new Animated.Value(1)).current;
    const burstScale = useRef(new Animated.Value(1)).current;
    const dragX      = useRef(new Animated.Value(0)).current;
    const dragY      = useRef(new Animated.Value(0)).current;
    const eyeWide    = useRef(new Animated.Value(1)).current;
    // Secondary wobble after tap (viscous aftershock)
    const wobble     = useRef(new Animated.Value(0)).current;

    // Hype color (JS driver)
    const hypeAnim = useRef(new Animated.Value(hype)).current;
    useEffect(() => {
      Animated.timing(hypeAnim, { toValue: hype, duration: 700, useNativeDriver: false }).start();
    }, [hype]);

    // Particles
    const particles = useRef(
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        x:       new Animated.Value(0),
        y:       new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale:   new Animated.Value(0),
        color:   PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        size:    6 + (i % 4) * 3,
      }))
    ).current;

    // ── Idle loops ────────────────────────────────────────────────────────────
    useEffect(() => {
      // Breathing — asymmetric timing feels more organic
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 0, duration: 2400, useNativeDriver: true }),
        ])
      ).start();

      // Shape morph — 5 shapes, slow cycle
      Animated.loop(
        Animated.sequence([
          Animated.timing(morph, { toValue: 1, duration: 2600, useNativeDriver: false }),
          Animated.timing(morph, { toValue: 2, duration: 3100, useNativeDriver: false }),
          Animated.timing(morph, { toValue: 3, duration: 2400, useNativeDriver: false }),
          Animated.timing(morph, { toValue: 4, duration: 2900, useNativeDriver: false }),
          Animated.timing(morph, { toValue: 0, duration: 2700, useNativeDriver: false }),
        ])
      ).start();

      // Sway — heavy, slow
      Animated.loop(
        Animated.sequence([
          Animated.timing(sway, { toValue: 1,  duration: 3200, useNativeDriver: true }),
          Animated.timing(sway, { toValue: -1, duration: 3200, useNativeDriver: true }),
        ])
      ).start();

      // Drip oscillation
      Animated.loop(
        Animated.sequence([
          Animated.timing(drip, { toValue: 1,  duration: 1400, useNativeDriver: false }),
          Animated.timing(drip, { toValue: -1, duration: 1800, useNativeDriver: false }),
        ])
      ).start();

      // Antennae
      Animated.loop(
        Animated.sequence([
          Animated.timing(ant1, { toValue: 1,  duration: 700, useNativeDriver: true }),
          Animated.timing(ant1, { toValue: -1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
      const t = setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(ant2, { toValue: -1, duration: 560, useNativeDriver: true }),
            Animated.timing(ant2, { toValue: 1,  duration: 560, useNativeDriver: true }),
          ])
        ).start();
      }, 320);
      return () => clearTimeout(t);
    }, []);

    // Blink loops
    useEffect(() => {
      let tL: ReturnType<typeof setTimeout>;
      let tR: ReturnType<typeof setTimeout>;
      const doL = () => {
        Animated.sequence([
          Animated.timing(blinkL, { toValue: 0.04, duration: 60, useNativeDriver: true }),
          Animated.timing(blinkL, { toValue: 1,    duration: 85, useNativeDriver: true }),
        ]).start();
        tL = setTimeout(doL, 2000 + Math.random() * 4000);
      };
      const doR = () => {
        Animated.sequence([
          Animated.timing(blinkR, { toValue: 0.04, duration: 70, useNativeDriver: true }),
          Animated.timing(blinkR, { toValue: 1,    duration: 95, useNativeDriver: true }),
        ]).start();
        tR = setTimeout(doR, 3200 + Math.random() * 3800);
      };
      tL = setTimeout(doL, 900);
      tR = setTimeout(doR, 2200);
      return () => { clearTimeout(tL); clearTimeout(tR); };
    }, []);

    // ── Tap: squish + viscous aftershock ────────────────────────────────────
    const handleTap = useCallback(() => {
      Animated.sequence([
        // Primary squish
        Animated.parallel([
          Animated.spring(squishX, { toValue: 1.35, speed: 80, bounciness: 0, useNativeDriver: true }),
          Animated.spring(squishY, { toValue: 0.68, speed: 80, bounciness: 0, useNativeDriver: true }),
          Animated.spring(eyeWide, { toValue: 1.55, speed: 70, useNativeDriver: true }),
        ]),
        // Settle back — heavy viscous spring (low bounciness)
        Animated.parallel([
          Animated.spring(squishX, { toValue: 1, speed: 4, bounciness: 6, useNativeDriver: true }),
          Animated.spring(squishY, { toValue: 1, speed: 4, bounciness: 6, useNativeDriver: true }),
          Animated.spring(eyeWide, { toValue: 1, speed: 8, useNativeDriver: true }),
        ]),
        // Viscous aftershock — tiny residual wobble
        Animated.parallel([
          Animated.spring(squishX, { toValue: 1.06, speed: 20, bounciness: 0, useNativeDriver: true }),
          Animated.spring(squishY, { toValue: 0.95, speed: 20, bounciness: 0, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(squishX, { toValue: 1, speed: 8, bounciness: 0, useNativeDriver: true }),
          Animated.spring(squishY, { toValue: 1, speed: 8, bounciness: 0, useNativeDriver: true }),
        ]),
      ]).start();
      onTap?.();
    }, [onTap]);

    // ── Hype burst ────────────────────────────────────────────────────────────
    const triggerHypeBurst = useCallback(() => {
      particles.forEach((p, i) => {
        const angle = (i / PARTICLE_COUNT) * 2 * Math.PI + Math.random() * 0.7;
        const dist  = 70 + Math.random() * 70;
        p.x.setValue(0); p.y.setValue(0);
        p.opacity.setValue(1); p.scale.setValue(2);
        Animated.parallel([
          Animated.timing(p.x,       { toValue: Math.cos(angle) * dist, duration: 850, useNativeDriver: true }),
          Animated.timing(p.y,       { toValue: Math.sin(angle) * dist, duration: 850, useNativeDriver: true }),
          Animated.timing(p.opacity, { toValue: 0,   duration: 850, useNativeDriver: true }),
          Animated.timing(p.scale,   { toValue: 0.1, duration: 850, useNativeDriver: true }),
        ]).start();
      });
      // Blob expands — viscous settle (not super bouncy)
      Animated.sequence([
        Animated.spring(burstScale, { toValue: 1.55, speed: 60, bounciness: 0, useNativeDriver: true }),
        Animated.spring(burstScale, { toValue: 1,    speed: 4,  bounciness: 10, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.spring(eyeWide, { toValue: 1.9, speed: 60, useNativeDriver: true }),
        Animated.delay(450),
        Animated.spring(eyeWide, { toValue: 1,   speed: 6,  useNativeDriver: true }),
      ]).start();
    }, []);

    useImperativeHandle(ref, () => ({ triggerHypeBurst }), [triggerHypeBurst]);

    // ── Pan responder ─────────────────────────────────────────────────────────
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gs) => {
          dragX.setValue(gs.dx * 0.42);
          dragY.setValue(gs.dy * 0.35);
        },
        onPanResponderRelease: (_, gs) => {
          if (Math.abs(gs.dx) < 8 && Math.abs(gs.dy) < 8) handleTap();
          // Viscous spring back — heavy fluid resistance
          Animated.parallel([
            Animated.spring(dragX, { toValue: 0, bounciness: 5, speed: 6, useNativeDriver: true }),
            Animated.spring(dragY, { toValue: 0, bounciness: 5, speed: 6, useNativeDriver: true }),
          ]).start();
        },
        onPanResponderTerminate: () => {
          dragX.setValue(0); dragY.setValue(0);
        },
      })
    ).current;

    // ── Derived values ────────────────────────────────────────────────────────
    const breatheX = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
    const breatheY = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] });
    const rotateV  = sway.interpolate({ inputRange: [-1, 1], outputRange: ['-6deg', '6deg'] });
    const ant1Rot  = ant1.interpolate({ inputRange: [-1, 1], outputRange: ['-26deg', '26deg'] });
    const ant2Rot  = ant2.interpolate({ inputRange: [-1, 1], outputRange: ['22deg', '-22deg'] });

    // 5-shape morph
    const tlr = morph.interpolate({ inputRange: [0,1,2,3,4], outputRange: SHAPES.map(s => s[0]) });
    const trr = morph.interpolate({ inputRange: [0,1,2,3,4], outputRange: SHAPES.map(s => s[1]) });
    const brr = morph.interpolate({ inputRange: [0,1,2,3,4], outputRange: SHAPES.map(s => s[2]) });
    const blr = morph.interpolate({ inputRange: [0,1,2,3,4], outputRange: SHAPES.map(s => s[3]) });

    // Drip shape
    const dripH = drip.interpolate({ inputRange: [-1, 1], outputRange: [14, 32] });
    const dripW = drip.interpolate({ inputRange: [-1, 1], outputRange: [20, 12] });
    const dripBR = drip.interpolate({ inputRange: [-1, 1], outputRange: [12, 7] });

    // Color by hype
    const blobBg = hypeAnim.interpolate({
      inputRange:  [0,        20,        45,        70,        100],
      outputRange: ['#180d2e','#3a1870', '#8030b0', '#d8358a', '#a0d828'],
    });
    const outerGlow = hypeAnim.interpolate({
      inputRange:  [0,                       50,                          100],
      outputRange: ['rgba(40,15,90,0.20)',   'rgba(180,45,125,0.26)',     'rgba(170,220,40,0.30)'],
    });
    const innerGlow = hypeAnim.interpolate({
      inputRange:  [0,                       50,                          100],
      outputRange: ['rgba(70,30,150,0.24)',  'rgba(215,55,140,0.34)',     'rgba(198,242,78,0.40)'],
    });
    // Inner depth layer — slightly lighter, translucent
    const innerLayer = hypeAnim.interpolate({
      inputRange:  [0,                        50,                          100],
      outputRange: ['rgba(90,50,180,0.35)',  'rgba(240,80,160,0.30)',      'rgba(220,255,100,0.28)'],
    });

    const shadowColor = hypeToShadowColor(hype);

    // Outer entrance scale (from pet screen)
    const outerTransform = entranceScale
      ? [{ scale: entranceScale }]
      : undefined;

    return (
      <Animated.View style={[styles.root, outerTransform && { transform: outerTransform }]}>
        {/* Atmospheric glow rings */}
        <Animated.View style={[styles.glowOuter, { backgroundColor: outerGlow }]} />
        <Animated.View style={[styles.glowInner, { backgroundColor: innerGlow }]} />

        {/* Particles */}
        <View style={styles.particleLayer} pointerEvents="none">
          {particles.map((p, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  width:  p.size, height: p.size, borderRadius: p.size / 2,
                  backgroundColor: p.color,
                  shadowColor: p.color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.9, shadowRadius: 5,
                  transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }],
                  opacity: p.opacity,
                },
              ]}
            />
          ))}
        </View>

        {/* Drag */}
        <Animated.View
          style={{ transform: [{ translateX: dragX }, { translateY: dragY }] }}
          {...panResponder.panHandlers}
        >
          {/* Burst scale */}
          <Animated.View style={{ transform: [{ scale: burstScale }] }}>
            {/* Squish */}
            <Animated.View style={{ transform: [{ scaleX: squishX }, { scaleY: squishY }] }}>
              {/* Breathe + sway */}
              <Animated.View style={{ transform: [{ scaleX: breatheX }, { scaleY: breatheY }, { rotate: rotateV }] }}>

                {/* Antennae */}
                <View style={styles.antRow}>
                  <Animated.View style={[styles.antPivot, { transform: [{ rotate: ant1Rot }] }]}>
                    <View style={styles.antStalk1} />
                    <View style={styles.antBall1} />
                  </Animated.View>
                  <View style={{ width: 48 }} />
                  <Animated.View style={[styles.antPivot, styles.antPivot2, { transform: [{ rotate: ant2Rot }] }]}>
                    <View style={styles.antStalk2} />
                    <View style={styles.antBall2} />
                  </Animated.View>
                </View>

                {/* Main blob */}
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
                  {/* Gloss */}
                  <View style={styles.gloss} />

                  {/* Inner depth layer — translucent fluid volume */}
                  <Animated.View style={[styles.innerLayer, { backgroundColor: innerLayer }]} />

                  {/* Wart/protrusion */}
                  <Animated.View style={[styles.bump, { backgroundColor: blobBg }]} />

                  {/* Eyes */}
                  <View style={styles.eyeRow}>
                    <Animated.View style={[styles.eye, styles.eyeL, { transform: [{ scaleY: blinkL }, { scale: eyeWide }] }]}>
                      <View style={styles.pupilL} />
                      <View style={styles.shine} />
                    </Animated.View>
                    <Animated.View style={[styles.eye, styles.eyeR, { transform: [{ scaleY: blinkR }, { scale: eyeWide }] }]}>
                      <View style={styles.pupilR} />
                      <View style={styles.shineSmall} />
                    </Animated.View>
                  </View>

                  {/* Fangs */}
                  <View style={styles.fangRow}>
                    <View style={styles.fang} />
                    <View style={[styles.fang, styles.fangShort]} />
                  </View>
                </Animated.View>

                {/* Drip — liquid drop hanging from bottom */}
                <View style={styles.dripWrap}>
                  <Animated.View
                    style={[
                      styles.dripDrop,
                      {
                        backgroundColor: blobBg,
                        width: dripW,
                        height: dripH,
                        borderRadius: dripBR,
                        shadowColor,
                      },
                    ]}
                  />
                </View>

              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    );
  }
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const GLOW_OUTER = SIZE + 90;
const GLOW_INNER = SIZE + 40;
const ANT_H = 34;
const ANT_PIVOT_H = ANT_H * 2;

const styles = StyleSheet.create({
  root: {
    width:  SIZE + 90,
    height: SIZE + 100 + ANT_H,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 18,
  },
  glowOuter: {
    position: 'absolute',
    bottom: 18,
    width:  GLOW_OUTER, height: GLOW_OUTER,
    borderRadius: GLOW_OUTER / 2,
  },
  glowInner: {
    position: 'absolute',
    bottom: 18,
    width:  GLOW_INNER, height: GLOW_INNER,
    borderRadius: GLOW_INNER / 2,
  },
  particleLayer: {
    position: 'absolute',
    bottom: 18 + SIZE / 2,
    alignSelf: 'center',
    width: 0, height: 0,
  },
  particle: { position: 'absolute' },

  antRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: -4,
    zIndex: 1,
  },
  antPivot: {
    width: 6, height: ANT_PIVOT_H,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  antPivot2: { width: 5, height: ANT_PIVOT_H * 0.82 },
  antStalk1: {
    width: 5, height: ANT_H,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 3,
  },
  antStalk2: {
    width: 4, height: ANT_H * 0.72,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 3,
  },
  antBall1: {
    position: 'absolute', top: -9,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.lime,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 7,
  },
  antBall2: {
    position: 'absolute', top: -7,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: Colors.pink,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 5,
  },

  blob: {
    width: SIZE, height: SIZE,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55, shadowRadius: 28,
    elevation: 16,
  },
  gloss: {
    position: 'absolute', top: 14, left: 20,
    width: SIZE * 0.42, height: SIZE * 0.20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 40,
    transform: [{ rotate: '-18deg' }],
  },
  innerLayer: {
    position: 'absolute',
    top: SIZE * 0.15, left: SIZE * 0.12,
    width: SIZE * 0.76, height: SIZE * 0.70,
    borderRadius: SIZE * 0.3,
  },
  bump: {
    position: 'absolute', top: -18, right: 22,
    width: 52, height: 52, borderRadius: 26,
    opacity: 0.72,
  },

  eyeRow: {
    position: 'absolute',
    top: SIZE * 0.30, left: SIZE * 0.15,
    flexDirection: 'row',
    alignItems: 'flex-start', gap: 16,
  },
  eye: {
    backgroundColor: '#f5f4ff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28, shadowRadius: 3,
  },
  eyeL: { width: 42, height: 42, borderRadius: 21 },
  eyeR: { width: 26, height: 26, borderRadius: 13, marginTop: 12 },
  pupilL: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#09090f' },
  pupilR: { width: 13, height: 13, borderRadius: 7,  backgroundColor: '#09090f' },
  shine: {
    position: 'absolute', top: 7, right: 7,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  shineSmall: {
    position: 'absolute', top: 4, right: 4,
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  fangRow: {
    position: 'absolute',
    bottom: SIZE * 0.11, left: SIZE * 0.30,
    flexDirection: 'row', gap: 7,
  },
  fang: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 13,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: 'rgba(255,255,255,0.86)',
  },
  fangShort: { borderTopWidth: 9, marginTop: 4 },

  // Liquid drip at the bottom
  dripWrap: {
    alignItems: 'center',
    marginTop: -6,
  },
  dripDrop: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 6,
  },
});
