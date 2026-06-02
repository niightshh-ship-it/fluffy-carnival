import React from 'react';
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
import { Colors, Fonts, FontSize, Radius, Spacing } from '@/constants/tokens';

// Placeholder profile — will come from Supabase auth/profiles in Step 2
const DEMO_PROFILE = {
  username: 'ghost_urban',
  avatar: '👻',
  level: 12,
  xp: 2840,
  xpToNext: 3500,
  coins: 420,
  streak: 3,
  questsDone: 47,
  totalHype: 1260,
  rank: 14,
};

const ACHIEVEMENTS = [
  { icon: '🔥', label: 'Стрик 3 дня', earned: true },
  { icon: '🏙️', label: 'Исследователь', earned: true },
  { icon: '🎭', label: 'Актёр', earned: true },
  { icon: '🏆', label: 'Топ-10 недели', earned: false },
  { icon: '⚡', label: '10 Эпик квестов', earned: false },
  { icon: '✨', label: 'Легендарный', earned: false },
];

const QUEST_HISTORY = [
  { title: 'Тайный агент', rarity: 'Эпик', xp: 150, coins: 80, daysAgo: 0 },
  { title: 'Рассвет на крыше', rarity: 'Редкий', xp: 80, coins: 45, daysAgo: 1 },
  { title: 'Добрый детектив', rarity: 'Легендарка', xp: 350, coins: 200, daysAgo: 2 },
];

export default function ProfileScreen() {
  const xpPct = DEMO_PROFILE.xp / DEMO_PROFILE.xpToNext;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ПРОФИЛЬ</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <Card style={styles.profileCard}>
          <LinearGradient
            colors={['rgba(198,242,78,0.06)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.profileTop}>
            <View style={styles.avatarRing}>
              <Text style={styles.avatarEmoji}>{DEMO_PROFILE.avatar}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{DEMO_PROFILE.username}</Text>
              <View style={styles.rankRow}>
                <Ionicons name="trophy" size={12} color={Colors.gold} />
                <Text style={styles.rankText}>#{DEMO_PROFILE.rank} в рейтинге недели</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Ionicons name="pencil-outline" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* XP bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLabel}>
                <Text style={{ color: Colors.lime }}>Ур. {DEMO_PROFILE.level}</Text>
                {'  '}
                <Text style={{ color: Colors.textMuted }}>
                  {DEMO_PROFILE.xp} / {DEMO_PROFILE.xpToNext} XP
                </Text>
              </Text>
              <Text style={styles.xpLabel}>
                <Text style={{ color: Colors.textMuted }}>→ Ур. {DEMO_PROFILE.level + 1}</Text>
              </Text>
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${xpPct * 100}%` as any }]} />
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="logo-bitcoin" size={16} color={Colors.gold} />
              <Text style={styles.statValue}>{DEMO_PROFILE.coins}</Text>
              <Text style={styles.statLabel}>монет</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="bonfire" size={16} color={Colors.pink} />
              <Text style={styles.statValue}>{DEMO_PROFILE.streak}</Text>
              <Text style={styles.statLabel}>стрик</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="flash" size={16} color={Colors.lime} />
              <Text style={styles.statValue}>{DEMO_PROFILE.questsDone}</Text>
              <Text style={styles.statLabel}>движей</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={16} color={Colors.jade} />
              <Text style={styles.statValue}>{DEMO_PROFILE.totalHype}</Text>
              <Text style={styles.statLabel}>хайп</Text>
            </View>
          </View>
        </Card>

        {/* Achievements */}
        <Text style={styles.sectionLabel}>ДОСТИЖЕНИЯ</Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((a, i) => (
            <View
              key={i}
              style={[styles.achievement, !a.earned && styles.achievementLocked]}
            >
              <Text style={[styles.achievementEmoji, !a.earned && styles.achievementEmojiLocked]}>
                {a.earned ? a.icon : '🔒'}
              </Text>
              <Text style={[styles.achievementLabel, !a.earned && styles.achievementLabelLocked]}>
                {a.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Quest history */}
        <Text style={styles.sectionLabel}>ИСТОРИЯ</Text>
        <Card style={styles.historyCard}>
          {QUEST_HISTORY.map((q, i) => (
            <View key={i} style={[styles.historyRow, i > 0 && styles.historyBorder]}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyTitle}>{q.title}</Text>
                <Text style={styles.historyDate}>
                  {q.daysAgo === 0 ? 'сегодня' : `${q.daysAgo}д назад`} · {q.rarity}
                </Text>
              </View>
              <View style={styles.historyRewards}>
                <Text style={[styles.historyReward, { color: Colors.lime }]}>+{q.xp} XP</Text>
                <Text style={[styles.historyReward, { color: Colors.gold }]}>+{q.coins} 🪙</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.signOutText}>Выйти</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.xxl,
    color: Colors.text,
    letterSpacing: 3,
  },

  profileCard: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.lime,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  avatarEmoji: { fontSize: 32 },
  profileInfo: { flex: 1 },
  username: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  rankText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.sm,
    color: Colors.gold,
  },
  editBtn: {
    padding: 6,
  },

  xpSection: { marginBottom: Spacing.md },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.xs,
  },
  xpTrack: {
    height: 6,
    backgroundColor: Colors.surface3,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: Colors.lime,
    borderRadius: Radius.full,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
  },

  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },

  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },

  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  achievement: {
    width: '30.5%',
    backgroundColor: Colors.surface1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  achievementLocked: { opacity: 0.4 },
  achievementEmoji: { fontSize: 26 },
  achievementEmojiLocked: { opacity: 0.5 },
  achievementLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
  },
  achievementLabelLocked: { color: Colors.textMuted },

  historyCard: { marginBottom: Spacing.lg },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  historyBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  historyLeft: { flex: 1 },
  historyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  historyDate: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  historyRewards: { alignItems: 'flex-end', gap: 2 },
  historyReward: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.xs,
  },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
  },
  signOutText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
});
