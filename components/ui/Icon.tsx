/* ДВИЖ — inline SVG icon set for React Native. <Icon name="..."/> inherits `color`. */
import React from 'react';
import Svg, { G, Path, Circle, Rect } from 'react-native-svg';
import { Colors } from '@/constants/tokens';

export type IconName =
  | 'coin' | 'bolt' | 'flame' | 'play' | 'comment' | 'plus' | 'camera'
  | 'spark' | 'check' | 'dice' | 'clock' | 'target' | 'feed' | 'pet'
  | 'up' | 'person' | 'trophy';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color = Colors.text }: IconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    coin: (
      <G>
        <Circle cx={12} cy={12} r={9} fill={color} />
        <Circle cx={12} cy={12} r={9} fill="none" stroke="rgba(0,0,0,.25)" strokeWidth={1.5} />
        <Path
          d="M12 7v10M9.5 9.2c0-1.2 1.1-1.8 2.5-1.8s2.5.6 2.5 1.8-1.1 1.6-2.5 1.6-2.5.5-2.5 1.7 1.1 1.9 2.5 1.9 2.5-.7 2.5-1.9"
          fill="none" stroke="rgba(0,0,0,.4)" strokeWidth={1.6} strokeLinecap="round"
        />
      </G>
    ),
    bolt: <Path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" fill={color} />,
    flame: <Path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1-.5-2-.5-2 2 1 3 3 3 5a5.5 5.5 0 1 1-11 0c0-5 4.5-7 5.5-12z" fill={color} />,
    play: <Path d="M7 5v14l12-7z" fill={color} />,
    comment: <Path d="M21 11.5a8.5 7.5 0 0 1-12 6.8L3 20l1.7-5A7.5 7.5 0 0 1 21 11.5z" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />,
    plus: <Path d="M12 5v14M5 12h14" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />,
    camera: (
      <G fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round">
        <Path d="M3 8.5A2 2 0 0 1 5 6.5h2l1.5-2h7L18 6.5h1a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <Circle cx={12} cy={13} r={3.2} />
      </G>
    ),
    spark: <Path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill={color} />,
    check: <Path d="M4 12.5l5 5 11-11" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />,
    dice: (
      <G fill="none" stroke={color} strokeWidth={2}>
        <Rect x={4} y={4} width={16} height={16} rx={3} />
        <Circle cx={9} cy={9} r={1.3} fill={color} />
        <Circle cx={15} cy={15} r={1.3} fill={color} />
        <Circle cx={15} cy={9} r={1.3} fill={color} />
        <Circle cx={9} cy={15} r={1.3} fill={color} />
      </G>
    ),
    clock: (
      <G fill="none" stroke={color} strokeWidth={2}>
        <Circle cx={12} cy={12} r={8.5} />
        <Path d="M12 7v5l3.5 2" strokeLinecap="round" />
      </G>
    ),
    target: (
      <G fill="none" stroke={color} strokeWidth={2}>
        <Circle cx={12} cy={12} r={8.5} />
        <Circle cx={12} cy={12} r={4.5} />
        <Circle cx={12} cy={12} r={1} fill={color} />
      </G>
    ),
    feed: (
      <G fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round">
        <Rect x={4} y={4} width={16} height={7} rx={2} />
        <Rect x={4} y={14} width={16} height={6} rx={2} />
      </G>
    ),
    pet: (
      <G>
        <Path d="M12 4c4 0 7 3 7 7.5 0 1.6-.5 2.3.3 4.3.6 1.5-.6 3.2-2.3 3.2-1.2 0-1.6-.6-3-.6h-4c-1.4 0-1.8.6-3 .6-1.7 0-2.9-1.7-2.3-3.2.8-2 .3-2.7.3-4.3C5 7 8 4 12 4z" fill={color} />
        <Circle cx={9.5} cy={10.5} r={1.3} fill="#000" opacity={0.6} />
        <Circle cx={14.5} cy={10.5} r={1.3} fill="#000" opacity={0.6} />
      </G>
    ),
    up: <Path d="M12 19V6M6 11l6-6 6 6" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />,
    person: (
      <G fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx={12} cy={8} r={4} />
        <Path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
      </G>
    ),
    trophy: (
      <G fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M7 4h10v5a5 5 0 0 1-10 0z" />
        <Path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M9 19h6M12 14v5" />
      </G>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {paths[name]}
    </Svg>
  );
}

export default Icon;
