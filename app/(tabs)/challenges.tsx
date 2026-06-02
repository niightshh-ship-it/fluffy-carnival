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
import { Colors, Economy, Fonts, FontSize, Radius, Spacing } from '@/constants/tokens';

// Placeholder challenges — will come from Supabase in Step 8
const DEMO_CHALLENGES = [
  {
    id: '1',
    author: 'ghost_urban',
    avatar: '👻',
    text: 'Принесите мне кофе с молоком и корицей до 19:00. Место: у фонтана на Пушкина.',
    bounty: 200,
    circle: 'Центр',
    takers: 2,
    status: 'open' as const,
    expiresIn: '3ч 20м',
  },
  {
    id: '2',
    author: 'katya_boom',
    avatar: '🔥',
    text: 'Сделайте фото самой креативной уличной арт-надписи в городе. Лучший пруф забирает банк.',
    bounty: 500,
    circle: 'Онлайн',
    takers: 7,
    status: 'open' as const,
    expiresIn: '21ч',
  },
  {
    id: '3',
    author: 'neon_vanya',
    avatar: '🦊',
    text: 'Кто споёт мне Happy Birthday на улице — получит 150 монет.',
    bounty: 150,
    circle: 'Онлайн',
    takers: 4,
    status: 'hot' as const,
    expiresIn: '1ч 10м',
  },
];

interface ChallengeCardProps {
  challenge: (typeof DEMO_CHALLENGES)[0];
}

function ChallengeCard({ challenge }: ChallengeCardProps) {
  const isHot = challenge.status === 'hot';

  return (
    <Card glowColor={isHot ? Colors.pink : undefined} style={styles.challengeCard}>
      {isHot && (
        <View style={styles.hotBadge}>
          <Ionicons name="flame" size={10} color={Colors.background} />
          <Text style={styles.hotText}>ГОРИТ</Text>
        </View>
      )}

      <View style={styles.challengeHeader}>
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 16 }}>{challenge.avatar}</Text>
          </View>
          <Text style={styles.authorName}>{challenge.author}</Text>
        </View>
        <View style={styles.bountyBadge}>
          <Ionicons name="logo-bitcoin" size={12} color={Colors.gold} />
          <Text style={styles.bountyText}>{challenge.bounty}</Text>
        </View>
      </View>

      <Text style={styles.challengeText}>{challenge.text}</Text>

      <View style={styles.challengeMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={12} color={Colors.sky} />
          <Text style={[styles.metaText, { color: Colors.sky }]}>{challenge.circle}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.metaText}>{challenge.takers} берут</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.metaText}>{challenge.expiresIn}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.takeBtn}>
        <Text style={styles.takeBtnText}>Взять вызов</Text>
        <Ionicons name="arrow-forward" size={14} color={Colors.lime} />
      </TouchableOpacity>
    </Card>
  );
}

export default function ChallengesScreen() {
  const [tab, setTab] = useState<'feed' | 'my'>('feed');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ВЫЗОВЫ</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'feed' && styles.tabActive]}
          onPress={() => setTab('feed')}
        >
          <Text style={[styles.tabText, tab === 'feed' && styles.tabTextActive]}>Лента</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'my' && styles.tabActive]}
          onPress={() => setTab('my')}
        >
          <Text style={[styles.tabText, tab === 'my' && styles.tabTextActive]}>Мои</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Create CTA */}
        <TouchableOpacity style={styles.createBtn} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.violet, '#7b6cdf']}
            style={styles.createGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.createLeft}>
              <Ionicons name="add-circle" size={22} color={Colors.text} />
              <View>
                <Text style={styles.createTitle}>Бросить вызов</Text>
                <Text style={styles.createSub}>Минимум {Economy.challengeMinBounty} монет в банк</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.text} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Safety notice */}
        <Card style={styles.safetyCard}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.sky} />
          <Text style={styles.safetyText}>
            Вызовы только внутри района или онлайн. Анонимные сделки между чужими — не допускаются. Всё с фото-пруфом.
          </Text>
        </Card>

        {/* Challenge list */}
        {DEMO_CHALLENGES.map((c) => (
          <ChallengeCard key={c.id} challenge={c} />
        ))}

        {/* Empty state for "Мои" */}
        {tab === 'my' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏆</Text>
            <Text style={styles.emptyTitle}>Твои вызовы появятся здесь</Text>
            <Text style={styles.emptyText}>Брось свой первый вызов или прими чужой</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.xxl,
    color: Colors.text,
    letterSpacing: 3,
  },

  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.violetDim,
    borderColor: Colors.violet,
  },
  tabText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  tabTextActive: { color: Colors.violet },

  content: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },

  createBtn: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: Colors.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  createLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  createTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  createSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.xs,
    color: 'rgba(241,240,246,0.65)',
  },

  safetyCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    borderColor: Colors.skyDim,
  },
  safetyText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 17,
  },

  challengeCard: { position: 'relative', overflow: 'visible' },
  hotBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.pink,
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  hotText: {
    fontFamily: Fonts.monoBold,
    fontSize: 9,
    color: Colors.background,
    letterSpacing: 1,
  },

  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  bountyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bountyText: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.sm,
    color: Colors.gold,
  },
  challengeText: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: Spacing.sm,
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  takeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  takeBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.sm,
    color: Colors.lime,
  },

  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.lg,
    color: Colors.text,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
});
