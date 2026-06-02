import React, { useEffect, useRef } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { CreatureSvg, CreatureRef } from '@/components/pet/CreatureSvg';

const SIZE = 86;

/**
 * Persistent Хайпожорик companion that floats on top of every screen.
 * Draggable; reacts to taps; tucks away on its own (pet) tab.
 */
export function FloatingBuddy({ hype = 50 }: { hype?: number }) {
  const pathname = usePathname();
  const creatureRef = useRef<CreatureRef>(null);

  // Position (offset from its default anchor, bottom-right above tab bar)
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const bob = useSharedValue(0);
  const appear = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const onPet = pathname?.includes('pet');

  useEffect(() => {
    appear.value = withSpring(onPet ? 0 : 1, { stiffness: 140, damping: 14 });
  }, [onPet]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3,
      onPanResponderMove: (_, gs) => {
        tx.value = gs.dx;
        ty.value = gs.dy;
      },
      onPanResponderRelease: (_, gs) => {
        if (Math.abs(gs.dx) < 6 && Math.abs(gs.dy) < 6) {
          // tap → playful hop + squish
          creatureRef.current?.react();
          ty.value = withSequence(
            withSpring(ty.value - 26, { stiffness: 400, damping: 9 }),
            withSpring(ty.value, { stiffness: 120, damping: 11 }),
          );
        } else {
          // settle where dropped, with a tiny bounce
          tx.value = withSpring(tx.value, { stiffness: 120, damping: 13 });
          ty.value = withSpring(ty.value, { stiffness: 120, damping: 13 });
        }
      },
    })
  ).current;

  const style = useAnimatedStyle(() => {
    const bobY = Math.sin(bob.value * Math.PI * 2) * 5;
    return {
      opacity: appear.value,
      transform: [
        { translateX: tx.value },
        { translateY: ty.value + bobY },
        { scale: 0.6 + appear.value * 0.4 },
      ],
    };
  });

  if (onPet) return null;

  return (
    <View style={styles.layer} pointerEvents="box-none">
      <Reanimated.View style={[styles.anchor, style]} {...pan.panHandlers}>
        <CreatureSvg ref={creatureRef} size={SIZE} hype={hype} wild={0.22} />
      </Reanimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  anchor: {
    position: 'absolute',
    right: 10,
    bottom: 86, // sits just above the tab bar
    width: SIZE,
    height: SIZE * (285 / 240),
  },
});
