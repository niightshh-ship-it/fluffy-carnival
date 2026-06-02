// Design system tokens for ДВИЖ
// Dark arcade aesthetic: dark canvas + vivid accent punches

export const Colors = {
  // Backgrounds — calm dark arcade canvas
  background: '#0b0c10',
  surface1: '#14161f',
  surface2: '#1a1d28',
  surface3: '#21253a',
  border: '#2a2d3e',

  // Typography
  text: '#f1f0f6',
  textSecondary: '#c8c7d4',
  textMuted: '#8a899c',
  textDisabled: '#4a4a5a',

  // Primary accent — lime (main CTA, one dominant per screen)
  lime: '#c6f24e',
  limeGlow: 'rgba(198, 242, 78, 0.25)',
  limeDim: 'rgba(198, 242, 78, 0.12)',

  // Energy / likes
  pink: '#ff4d8d',
  pinkGlow: 'rgba(255, 77, 141, 0.25)',
  pinkDim: 'rgba(255, 77, 141, 0.12)',

  // Coins / status / rating
  gold: '#e8c98a',
  goldGlow: 'rgba(232, 201, 138, 0.25)',
  goldDim: 'rgba(232, 201, 138, 0.12)',

  // Pet (Хайпожорик)
  jade: '#5fe3b0',
  jadeDim: 'rgba(95, 227, 176, 0.12)',

  // Rare quests / info
  sky: '#4db8ff',
  skyDim: 'rgba(77, 184, 255, 0.12)',

  // Epic quests
  violet: '#9b8cff',
  violetDim: 'rgba(155, 140, 255, 0.12)',

  // Rarity system
  rarityCommon: '#8a899c',
  rarityRare: '#4db8ff',
  rarityEpic: '#9b8cff',
  rarityLegendary: '#e8c98a',
} as const;

// Rarity tiers with full metadata
export const Rarities = {
  Обычный: { color: Colors.rarityCommon, glow: 'rgba(138, 137, 156, 0.2)', label: 'ОБЫЧНЫЙ' },
  Редкий: { color: Colors.rarityRare, glow: 'rgba(77, 184, 255, 0.25)', label: 'РЕДКИЙ' },
  Эпик: { color: Colors.rarityEpic, glow: 'rgba(155, 140, 255, 0.3)', label: 'ЭПИК' },
  Легендарка: { color: Colors.rarityLegendary, glow: 'rgba(232, 201, 138, 0.35)', label: 'ЛЕГЕНДАРКА' },
} as const;

export type RarityKey = keyof typeof Rarities;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 26,
  display: 34,
  hero: 48,
} as const;

export const Fonts = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semiBold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

// Coin economy config — tweak here without touching game logic
export const Economy = {
  questRewardMultiplier: 1.0,
  streakBonusPerDay: 0.1,      // +10% per streak day, max 2x
  streakBonusMax: 2.0,
  petFeedCostBase: 15,          // coins per feed action
  questRerollCost: 10,
  challengeMinBounty: 50,
  challengeMaxBounty: 1000,
  hypePerQuestXp: 0.5,          // hype gained = xp * 0.5
  evolutionHypeThreshold: 100,
} as const;

// Pet evolution stages
export const PetStages = [
  { stage: 0, name: 'Яйцо', emoji: '🥚', minLevel: 0 },
  { stage: 1, name: 'Детёныш', emoji: '🐣', minLevel: 1 },
  { stage: 2, name: 'Подросток', emoji: '🐥', minLevel: 5 },
  { stage: 3, name: 'Взрослый', emoji: '🐤', minLevel: 15 },
  { stage: 4, name: 'Легендарный', emoji: '✨', minLevel: 30 },
] as const;
