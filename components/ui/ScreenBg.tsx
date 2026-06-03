import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

/**
 * Backmost layer for a tab screen: the animated aurora with an opaque dark
 * base. Being opaque, the focused screen fully covers the others stacked
 * behind it. Animation pauses when the screen isn't focused.
 */
export function ScreenBg() {
  const focused = useIsFocused();
  return <AuroraBackground active={focused} />;
}

export default ScreenBg;
