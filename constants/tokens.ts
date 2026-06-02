// Design tokens — placeholder до утверждения финального дизайна
export const Colors = {
  background:   '#0b0c10',
  surface1:     '#14161f',
  surface2:     '#1a1d28',
  border:       '#2a2d3e',
  text:         '#f1f0f6',
  textSecondary:'#c8c7d4',
  textMuted:    '#8a899c',
  // accents — временные, будут обновлены после дизайн-сессии
  lime:   '#c6f24e',
  pink:   '#ff4d8d',
  gold:   '#e8c98a',
  violet: '#9b8cff',
  sky:    '#4db8ff',
  jade:   '#5fe3b0',
} as const;

export const Fonts = {
  regular:  'SpaceGrotesk_400Regular',
  medium:   'SpaceGrotesk_500Medium',
  semiBold: 'SpaceGrotesk_600SemiBold',
  bold:     'SpaceGrotesk_700Bold',
  mono:     'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

export const FontSize = {
  xs:      10,
  sm:      12,
  md:      14,
  lg:      16,
  xl:      20,
  xxl:     26,
  display: 34,
  hero:    48,
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const Radius = {
  sm:   10,
  md:   16,
  lg:   20,
  xl:   28,
  full: 9999,
} as const;
