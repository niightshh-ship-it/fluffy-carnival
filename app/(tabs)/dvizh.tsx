import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { Colors, Fonts, FontSize, Radius, Spacing } from '@/constants/tokens';

// Placeholder quest shown before Supabase/AI is connected (Step 3)
const DEMO_QUEST = {
  title: 'Тайный агент',
  task:
    'Подойди к случайному прохожему и скажи, что ты потерял питомца-осьминога. Сними реакцию.',
  category: 'Социальный',
  difficulty: 3,
  rarity: 'Эпик' as const,
  xp: 150,
  coins: 80,
};

export default function DvizhScreen() {
  const [questReady] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>ДВИЖ</Text>
            <View style={styles.gmRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.gmLabel}>Гейм-мастер онлайн</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.coinBadge}>
            <Ionicons name="logo-bitcoin" size={14} color={Colors.gold} />
            <Text style={styles.coinCount}>420</Text>
          </TouchableOpacity>
        </View>

        {/* GM terminal */}
        <Card style={styles.terminal}>
          <Text style={styles.terminalPrefix}>{'>'} GM_SYSTEM</Text>
          <Text style={styles.terminalText}>
            Анализирую твой район... Прокладываю квест... Готово.
          </Text>
          <Text style={styles.terminalCursor}>█</Text>
        </Card>

        {/* Quest card */}
        {questReady && (
          <Card glowColor={Colors.violet} style={styles.questCard}>
            <LinearGradient
              colors={['rgba(155,140,255,0.08)', 'transparent']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.questHeader}>
              <RarityBadge rarity={DEMO_QUEST.rarity} />
              <View style={styles.diffRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < DEMO_QUEST.difficulty ? 'flame' : 'flame-outline'}
                    size={12}
                    color={i < DEMO_QUEST.difficulty ? Colors.pink : Colors.textDisabled}
                  />
                ))}
              </View>
            </View>

            <Text style={styles.questTitle}>{DEMO_QUEST.title}</Text>
            <Text style={styles.questTask}>{DEMO_QUEST.task}</Text>

            <View style={styles.categoryTag}>
              <Ionicons name="people-outline" size={12} color={Colors.sky} />
              <Text style={styles.categoryText}>{DEMO_QUEST.category}</Text>
            </View>

            <View style={styles.rewardRow}>
              <View style={styles.rewardItem}>
                <Ionicons name="star" size={14} color={Colors.lime} />
                <Text style={styles.rewardValue}>{DEMO_QUEST.xp} XP</Text>
              </View>
              <View style={styles.rewardItem}>
                <Ionicons name="logo-bitcoin" size={14} color={Colors.gold} />
                <Text style={styles.rewardValue}>{DEMO_QUEST.coins} монет</Text>
              </View>
              <View style={styles.rewardItem}>
                <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                <Text style={[styles.rewardValue, { color: Colors.textMuted }]}>~15 мин</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Actions */}
        <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.lime, '#a8d93a']}
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="flash" size={20} color={Colors.background} />
            <Text style={styles.btnPrimaryText}>ПРИНЯТЬ ДВИЖ</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.btnSecondary}>
            <Ionicons name="refresh-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.btnSecondaryText}>Реролл (−10 монет)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary}>
            <Ionicons name="skip-forward-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.btnSecondaryText}>Пропустить</Text>
          </TouchableOpacity>
        </View>

        {/* Streak */}
        <Card style={styles.streakCard}>
          <View style={styles.streakRow}>
            <Ionicons name="bonfire" size={22} color={Colors.pink} />
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>Стрик 3 дня 🔥</Text>
              <Text style={styles.streakSub}>Выполни движ сегодня, чтобы не потерять</Text>
            </View>
            <Text style={[styles.streakBonus, { color: Colors.gold }]}>+30%</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  appName: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.display,
    color: Colors.lime,
    letterSpacing: 4,
    lineHeight: 38,
  },
  gmRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.jade,
    shadowColor: Colors.jade,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
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
    gap: 4,
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    marginTop: 4,
  },
  coinCount: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.md,
    color: Colors.gold,
  },

  terminal: {
    marginBottom: Spacing.md,
    borderColor: Colors.jade,
  },
  terminalPrefix: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.xs,
    color: Colors.jade,
    marginBottom: 4,
    letterSpacing: 1,
  },
  terminalText: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  terminalCursor: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.sm,
    color: Colors.jade,
    marginTop: 2,
  },

  questCard: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  diffRow: { flexDirection: 'row', gap: 2 },
  questTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.xxl,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  questTask: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.md,
  },
  categoryText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.sm,
    color: Colors.sky,
    letterSpacing: 0.3,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  rewardItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rewardValue: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.sm,
    color: Colors.text,
  },

  btnPrimary: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
  },
  btnPrimaryText: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.lg,
    color: Colors.background,
    letterSpacing: 2,
  },

  secondaryActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  btnSecondaryText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  streakCard: {
    borderColor: Colors.pinkDim,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  streakInfo: { flex: 1 },
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
    fontSize: FontSize.lg,
  },
});
