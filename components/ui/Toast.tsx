import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { useGame } from '@/context/GameContext';
import { Colors, Fonts, FontSize, Radius } from '@/constants/tokens';

/** Floating toast pinned above the tab bar. Reads `toast` from game state, auto-clears. */
export function Toast() {
  const { toast, clearToast } = useGame();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start(
        () => clearToast()
      );
    }, 1600);
    return () => clearTimeout(t);
  }, [toast, anim, clearToast]);

  if (!toast) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.toast, { opacity: anim, transform: [{ translateX: -0.5 }, { translateY }] }]}
    >
      <Text style={styles.text}>{toast}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: Radius.pill,
    zIndex: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  text: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
});

export default Toast;
