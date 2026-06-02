import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/tokens';

const S = 26; // mini blob size

export interface MiniBlobTabRef {
  triggerPop: () => void;
}

interface Props {
  focused: boolean;
}

/**
 * Static little Хайпожорик head used as the pet tab icon.
 * No continuous animation (keeps the tab bar cheap) — only a pop on press.
 */
export const MiniBlobTab = forwardRef<MiniBlobTabRef, Props>(({ focused }, ref) => {
  const popScale = useRef(new Animated.Value(1)).current;

  const triggerPop = () => {
    Animated.sequence([
      Animated.spring(popScale, { toValue: 1.5, speed: 80, bounciness: 0, useNativeDriver: true }),
      Animated.spring(popScale, { toValue: 1, speed: 5, bounciness: 8, useNativeDriver: true }),
    ]).start();
  };

  useImperativeHandle(ref, () => ({ triggerPop }), []);

  return (
    <Animated.View style={{ transform: [{ scale: popScale }] }}>
      <View
        style={[
          styles.blob,
          {
            backgroundColor: focused ? Colors.violet : 'rgba(138,137,156,0.32)',
            shadowColor: focused ? Colors.violet : 'transparent',
          },
        ]}
      >
        <View style={styles.gloss} />
        <View style={styles.eyes}>
          <View style={[styles.eye, styles.eyeL]} />
          <View style={[styles.eye, styles.eyeR]} />
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  blob: {
    width: S, height: S,
    // asymmetric organic corners (static)
    borderTopLeftRadius: 13,
    borderTopRightRadius: 9,
    borderBottomRightRadius: 14,
    borderBottomLeftRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 6,
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute', top: 3, left: 4,
    width: S * 0.4, height: S * 0.18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 6,
    transform: [{ rotate: '-15deg' }],
  },
  eyes: {
    position: 'absolute',
    top: S * 0.32, left: S * 0.14,
    flexDirection: 'row', gap: 4,
    alignItems: 'flex-start',
  },
  eye: { backgroundColor: '#f5f4ff' },
  eyeL: { width: 7, height: 7, borderRadius: 4 },
  eyeR: { width: 4.5, height: 4.5, borderRadius: 3, marginTop: 2 },
});
