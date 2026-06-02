import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/tokens';

const S = 26; // mini blob size

// Simplified 3-shape morph for mini blob
const MINI_SHAPES = [
  [65, 35, 60, 40],
  [35, 70, 38, 65],
  [62, 40, 72, 30],
];

export interface MiniBlobTabRef {
  triggerPop: () => void;
}

interface Props {
  focused: boolean;
  hype?: number; // 0-100, drives color
}

export const MiniBlobTab = forwardRef<MiniBlobTabRef, Props>(({ focused, hype = 50 }, ref) => {
  const breathe  = useRef(new Animated.Value(0)).current;
  const morph    = useRef(new Animated.Value(0)).current;
  const popScale = useRef(new Animated.Value(1)).current;
  const hypeAnim = useRef(new Animated.Value(hype)).current;

  useEffect(() => {
    Animated.timing(hypeAnim, { toValue: hype, duration: 600, useNativeDriver: false }).start();
  }, [hype]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(morph, { toValue: 1, duration: 2400, useNativeDriver: false }),
        Animated.timing(morph, { toValue: 2, duration: 2800, useNativeDriver: false }),
        Animated.timing(morph, { toValue: 0, duration: 2200, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const triggerPop = () => {
    Animated.sequence([
      Animated.spring(popScale, { toValue: 1.6, speed: 80, bounciness: 0, useNativeDriver: true }),
      Animated.spring(popScale, { toValue: 1,   speed: 5,  bounciness: 8, useNativeDriver: true }),
    ]).start();
  };

  useImperativeHandle(ref, () => ({ triggerPop }), []);

  const bx = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const by = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 0.93] });
  const tl = morph.interpolate({ inputRange: [0,1,2], outputRange: MINI_SHAPES.map(s => s[0]) });
  const tr = morph.interpolate({ inputRange: [0,1,2], outputRange: MINI_SHAPES.map(s => s[1]) });
  const br = morph.interpolate({ inputRange: [0,1,2], outputRange: MINI_SHAPES.map(s => s[2]) });
  const bl = morph.interpolate({ inputRange: [0,1,2], outputRange: MINI_SHAPES.map(s => s[3]) });

  const bg = hypeAnim.interpolate({
    inputRange:  [0,        50,        100],
    outputRange: ['#3a1870','#c030a0', '#90d020'],
  });

  const activeColor = focused ? Colors.lime : Colors.textMuted;

  return (
    <Animated.View style={{ transform: [{ scale: popScale }] }}>
      <Animated.View style={{ transform: [{ scaleX: bx }, { scaleY: by }] }}>
        <Animated.View
          style={[
            styles.blob,
            {
              backgroundColor: focused ? bg : 'rgba(138,137,156,0.3)',
              borderTopLeftRadius:     tl,
              borderTopRightRadius:    tr,
              borderBottomRightRadius: br,
              borderBottomLeftRadius:  bl,
              shadowColor: focused ? activeColor : 'transparent',
            },
          ]}
        >
          {/* Mini gloss */}
          <View style={styles.gloss} />
          {/* Mini eyes */}
          <View style={styles.eyes}>
            <View style={[styles.eye, styles.eyeL]} />
            <View style={[styles.eye, styles.eyeR]} />
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  blob: {
    width: S, height: S,
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
  eye: {
    backgroundColor: '#f5f4ff',
    overflow: 'hidden',
  },
  eyeL: { width: 7, height: 7, borderRadius: 4 },
  eyeR: { width: 4.5, height: 4.5, borderRadius: 3, marginTop: 2 },
});
