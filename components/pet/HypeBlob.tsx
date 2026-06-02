import React, { useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Animated as RNAnimated, View, PanResponder, StyleSheet } from 'react-native';
import Reanimated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { CreatureSvg, CreatureRef } from '@/components/pet/CreatureSvg';
import { Colors } from '@/constants/tokens';

const PARTICLE_COUNT = 18;
const PARTICLE_COLORS = [Colors.lime, Colors.pink, Colors.gold, Colors.violet, Colors.sky, Colors.jade];

export interface HypeBlobRef {
  triggerHypeBurst: () => void;
}

interface Props {
  hype: number;
  hunger: number;
  mood: number;
  onTap?: () => void;
}

const RENDER = 250;

export const HypeBlob = forwardRef<HypeBlobRef, Props>(({ hype, onTap }, ref) => {
  const creatureRef = useRef<CreatureRef>(null);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: new RNAnimated.Value(0),
      y: new RNAnimated.Value(0),
      opacity: new RNAnimated.Value(0),
      scale: new RNAnimated.Value(0),
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      size: 6 + (i % 4) * 4,
    }))
  ).current;

  const triggerHypeBurst = useCallback(() => {
    creatureRef.current?.burst();
    particles.forEach((p, i) => {
      const angle = (i / PARTICLE_COUNT) * 2 * Math.PI + Math.random() * 0.7;
      const dist = 85 + Math.random() * 80;
      p.x.setValue(0); p.y.setValue(0);
      p.opacity.setValue(1); p.scale.setValue(2.2);
      RNAnimated.parallel([
        RNAnimated.timing(p.x,       { toValue: Math.cos(angle) * dist, duration: 900, useNativeDriver: true }),
        RNAnimated.timing(p.y,       { toValue: Math.sin(angle) * dist, duration: 900, useNativeDriver: true }),
        RNAnimated.timing(p.opacity, { toValue: 0,   duration: 900, useNativeDriver: true }),
        RNAnimated.timing(p.scale,   { toValue: 0.1, duration: 900, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  useImperativeHandle(ref, () => ({ triggerHypeBurst }), [triggerHypeBurst]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2,
      onPanResponderMove: (_, gs) => {
        dragX.value = gs.dx * 0.45;
        dragY.value = gs.dy * 0.4;
      },
      onPanResponderRelease: (_, gs) => {
        if (Math.abs(gs.dx) < 8 && Math.abs(gs.dy) < 8) {
          creatureRef.current?.react();
          onTap?.();
        }
        dragX.value = withSpring(0, { stiffness: 110, damping: 11, mass: 1.5 });
        dragY.value = withSpring(0, { stiffness: 110, damping: 11, mass: 1.5 });
      },
      onPanResponderTerminate: () => {
        dragX.value = withSpring(0, { stiffness: 110, damping: 11 });
        dragY.value = withSpring(0, { stiffness: 110, damping: 11 });
      },
    })
  ).current;

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }, { translateY: dragY.value }],
  }));

  return (
    <View style={styles.root}>
      {/* Particles */}
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
                shadowOpacity: 0.9, shadowRadius: 7,
                opacity: p.opacity,
                transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }],
              },
            ]}
          />
        ))}
      </View>

      <Reanimated.View style={dragStyle} {...panResponder.panHandlers}>
        <CreatureSvg ref={creatureRef} size={RENDER} hype={hype} wild={0.2} />
      </Reanimated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  particleLayer: {
    position: 'absolute',
    top: '52%',
    left: '50%',
    width: 0, height: 0,
    zIndex: 5,
  },
  particle: { position: 'absolute' },
});
