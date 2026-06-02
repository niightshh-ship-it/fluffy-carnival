import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { Colors, Fonts, FontSize, Radius, Rarities, RarityKey, Spacing } from '@/constants/tokens';

const DEMO_QUEST = {
  title: 'Тайный агент',
  task: 'Подойди к случайному прохожему и скажи, что ты потерял питомца-осьминога. Сними реакцию.',
  category: 'Социальный',
  categoryIcon: 'people-outline' as const,
  difficulty: 3,
  rarity: 'Эпик' as RarityKey,
  xp: 150,
  coins: 80,
  timeMin: 15,
};

// Pulsing animated dot
function PulseDot({ color }: { color: string }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: color,
        opacity: anim,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
      }}
    />
  );
}

// Press-scale button wrapper
function PressButton({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: object;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={onPress}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
}

export default function DvizhScreen() {
  const rarity = Rarities[DEMO_QUEST.rarity];

  // Quest card entrance animation
  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
      delay: 200,
    }).start();
  }, []);

  const cardStyle = {
    opacity: cardAnim,
    transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) }],
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.wordmark}>ДВИЖ</Text>
            <View style={styles.gmRow}>
              <PulseDot color={Colors.jade} />
              <Text style={styles.gmLabel}>Гейм-мастер онлайн</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.coinBadge} activeOpacity={0.8}>
            <Ionicons name="logo-bitcoin" size={14} color={Colors.gold} />
            <Text style={styles.coinText}>420</Text>
          </TouchableOpacity>
        </View>

        {/* ── GM terminal ── */}
        <View style={styles.terminal}>
          <Text style={styles.terminalLine}>
            <Text style={styles.terminalPrompt}>{'> '}</Text>
            <Text style={styles.terminalText}>Анализирую район... квест готов.</Text>
          </Text>
        </View>

        {/* ── Quest card ── */}
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Rarity top bar */}
          <LinearGradient
            colors={[rarity.color, 'transparent']}
            style={styles.rarityBar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />

          {/* Ambient glow bg */}
          <LinearGradient
            colors={[rarity.glow, 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <View style={styles.cardInner}>
            {/* Badge row */}
            <View style={styles.badgeRow}>
              <RarityBadge rarity={DEMO_QUEST.rarity} />
              <View style={styles.flames}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < DEMO_QUEST.difficulty ? 'flame' : 'flame-outline'}
                    size={13}
                    color={i < DEMO_QUEST.difficulty ? Colors.pink : Colors.textDisabled}
                  />
                ))}
              </View>
            </View>

            {/* Title */}
            <Text style={styles.questTitle}>{DEMO_QUEST.title}</Text>

            {/* Task */}
            <Text style={styles.questTask}>{DEMO_QUEST.task}</Text>

            {/* Category */}
            <View style={styles.categoryRow}>
              <Ionicons name={DEMO_QUEST.categoryIcon} size={13} color={Colors.sky} />
              <Text style={styles.categoryText}>{DEMO_QUEST.category}</Text>
              <View style={styles.dot} />
              <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.timeText}>~{DEMO_QUEST.timeMin} мин</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Rewards */}
            <View style={styles.rewards}>
              <View style={styles.rewardChip}>
                <Ionicons name="star" size={14} color={Colors.lime} />
                <Text style={[styles.rewardVal, { color: Colors.lime }]}>{DEMO_QUEST.xp} XP</Text>
              </View>
              <View style={styles.rewardChip}>
                <Ionicons name="logo-bitcoin" size={14} color={Colors.gold} />
                <Text style={[styles.rewardVal, { color: Colors.gold }]}>{DEMO_QUEST.coins}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── CTA ── */}
        <PressButton onPress={() => {}} style={styles.ctaWrap}>
          <LinearGradient
            colors={[Colors.lime, '#9ed630']}
            style={styles.cta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="flash" size={20} color={Colors.background} />
            <Text style={styles.ctaText}>ПРИНЯТЬ ДВИЖ</Text>
          </LinearGradient>
        </PressButton>

        {/* ── Secondary actions ── */}
        <View style={styles.secondRow}>
          <TouchableOpacity style={styles.secBtn} activeOpacity={0.7}>
            <Ionicons name="refresh-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.secText}>Реролл</Text>
            <View style={styles.costPill}>
              <Ionicons name="logo-bitcoin" size={10} color={Colors.gold} />
              <Text style={styles.costText}>10</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secBtn} activeOpacity={0.7}>
            <Ionicons name="play-skip-forward-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.secText}>Пропустить</Text>
          </TouchableOpacity>
        </View>

        {/* ── Streak card ── */}
        <View style={styles.streakCard}>
          <View style={styles.streakLeft}>
            <Ionicons name="bonfire" size={20} color={Colors.pink} />
            <View>
              <Text style={styles.streakTitle}>Стрик 3 дня 🔥</Text>
              <Text style={styles.streakSub}>Не прерывай — завтра будет ×1.3</Text>
            </View>
          </View>
          <Text style={styles.streakBonus}>+30%</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.md,
    paddingBottom: 32,
    gap: Spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wordmark: {
    fontFamily: Fonts.bold,
    fontSize: 40,
    color: Colors.lime,
    letterSpacing: 6,
    lineHeight: 44,
    // Lime glow text on web via shadow
    textShadowColor: Colors.limeGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  gmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  gmLabel: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.xs,
    color: Colors.jade,
    letterSpacing: 0.5,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 7,
    marginTop: 6,
  },
  coinText: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.md,
    color: Colors.gold,
  },

  // Terminal
  terminal: {
    backgroundColor: Colors.surface1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.jade + '55',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  terminalLine: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  terminalPrompt: {
    color: Colors.jade,
  },
  terminalText: {
    color: Colors.textSecondary,
  },

  // Quest card
  card: {
    backgroundColor: Colors.surface1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: Colors.violet,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  rarityBar: {
    height: 3,
    width: '100%',
  },
  cardInner: {
    padding: Spacing.md + 2,
    gap: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flames: {
    flexDirection: 'row',
    gap: 2,
  },
  questTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.xxl + 2,
    color: Colors.text,
    lineHeight: 32,
  },
  questTask: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  categoryText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.sm,
    color: Colors.sky,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  timeText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  rewards: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rewardVal: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.md,
  },

  // CTA
  ctaWrap: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 17,
  },
  ctaText: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.lg,
    color: Colors.background,
    letterSpacing: 2.5,
  },

  // Secondary row
  secondRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  costPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  costText: {
    fontFamily: Fonts.monoBold,
    fontSize: 9,
    color: Colors.gold,
  },

  // Streak
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.pinkDim,
    padding: Spacing.md,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  streakTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  streakSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  streakBonus: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.xl,
    color: Colors.gold,
  },
});
