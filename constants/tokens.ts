// Design system tokens for ДВИЖ
// Dark arcade aesthetic: dark canvas + vivid accent punches

export const Colors = {
  // Backgrounds — deep ink canvas, surfaces have a faint violet tint for warmth
  background: '#08080f',
  surface1: '#15131f',
  surface2: '#1d1a2c',
  surface3: '#272238',
  border: '#332d48',

  // Typography
  text: '#f6f4ff',
  textSecondary: '#cfcbe4',
  textMuted: '#948fb0',
  textDisabled: '#4f4a66',

  // Primary accent — punchy neon lime
  lime: '#d4ff45',
  limeGlow: 'rgba(212, 255, 69, 0.4)',
  limeDim: 'rgba(212, 255, 69, 0.14)',

  // Energy / likes — hot neon pink
  pink: '#ff3d8a',
  pinkGlow: 'rgba(255, 61, 138, 0.42)',
  pinkDim: 'rgba(255, 61, 138, 0.14)',

  // Coins / status / rating — richer gold
  gold: '#ffd76a',
  goldGlow: 'rgba(255, 215, 106, 0.4)',
  goldDim: 'rgba(255, 215, 106, 0.14)',

  // Pet (Хайпожорик) — electric jade
  jade: '#4dffc4',
  jadeDim: 'rgba(77, 255, 196, 0.14)',

  // Rare quests / info — vivid sky
  sky: '#3db4ff',
  skyDim: 'rgba(61, 180, 255, 0.14)',

  // Epic quests — saturated violet
  violet: '#a98bff',
  violetDim: 'rgba(169, 139, 255, 0.16)',

  // Rarity system
  rarityCommon: '#948fb0',
  rarityRare: '#3db4ff',
  rarityEpic: '#a98bff',
  rarityLegendary: '#ffd76a',
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
