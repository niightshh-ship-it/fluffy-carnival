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
import { StatBar } from '@/components/ui/StatBar';
import { Colors, Economy, Fonts, FontSize, PetStages, Radius, Spacing } from '@/constants/tokens';

// Placeholder pet state — will sync from Supabase in Step 7
const DEMO_PET = {
  name: 'Хайпожорик',
  stage: 1,
  level: 3,
  hunger: 65,
  mood: 80,
  energy: 40,
  hype: 62,
};

const currentStage = PetStages[DEMO_PET.stage];

export default function PetScreen() {
  const [hunger, setHunger] = useState(DEMO_PET.hunger);
  const [mood, setMood] = useState(DEMO_PET.mood);
  const [energy, setEnergy] = useState(DEMO_PET.energy);
  const [hype, setHype] = useState(DEMO_PET.hype);

  function feed() {
    setHunger(Math.min(100, hunger + 20));
    setMood(Math.min(100, mood + 5));
  }
  function play() {
    setMood(Math.min(100, mood + 20));
    setEnergy(Math.max(0, energy - 10));
  }
  function walk() {
    setEnergy(Math.min(100, energy + 25));
    setMood(Math.min(100, mood + 10));
  }

  const nextStage = PetStages[DEMO_PET.stage + 1];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ЖОРИК</Text>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>ур. {DEMO_PET.level}</Text>
          </View>
        </View>

        {/* Pet display */}
        <Card glowColor={Colors.jade} style={styles.petCard}>
          <LinearGradient
            colors={['rgba(95,227,176,0.06)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          <View style={styles.petBody}>
            <Text style={styles.petEmoji}>{currentStage.emoji}</Text>
            <Text style={styles.petName}>{DEMO_PET.name}</Text>
            <Text style={styles.petStage}>{currentStage.name}</Text>
          </View>

          {/* Hype progress */}
          <View style={styles.hypeSection}>
            <View style={styles.hypeHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="trending-up" size={14} color={Colors.jade} />
                <Text style={styles.hypeLabel}>ХАЙП — прогресс к эволюции</Text>
              </View>
              <Text style={styles.hypeValue}>{hype}%</Text>
            </View>
            <View style={styles.hypeTrack}>
              <View style={[styles.hypeFill, { width: `${hype}%` as any }]} />
              {/* Milestone marks */}
              {[25, 50, 75].map((m) => (
                <View
                  key={m}
                  style={[styles.hypeMark, { left: `${m}%` as any }]}
                />
              ))}
            </View>
            {nextStage && (
              <Text style={styles.hypeHint}>
                До эволюции в «{nextStage.name}» {nextStage.emoji}: {100 - hype}%
              </Text>
            )}
          </View>
        </Card>

        {/* Stat bars */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionLabel}>СОСТОЯНИЕ</Text>
          <StatBar label="Сытость" value={hunger} color={Colors.gold} />
          <StatBar label="Настроение" value={mood} color={Colors.pink} />
          <StatBar label="Энергия" value={energy} color={Colors.sky} />
        </Card>

        {/* Actions */}
        <Text style={styles.sectionLabel}>ДЕЙСТВИЯ</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionCard, { borderColor: Colors.gold }]} onPress={feed}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.goldDim }]}>
              <Text style={styles.actionEmoji}>🍖</Text>
            </View>
            <Text style={styles.actionName}>Покормить</Text>
            <View style={styles.actionCost}>
              <Ionicons name="logo-bitcoin" size={10} color={Colors.gold} />
              <Text style={[styles.actionCostText, { color: Colors.gold }]}>
                −{Economy.petFeedCostBase}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { borderColor: Colors.pink }]} onPress={play}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.pinkDim }]}>
              <Text style={styles.actionEmoji}>🎮</Text>
            </View>
            <Text style={styles.actionName}>Поиграть</Text>
            <Text style={styles.actionCostText}>Бесплатно</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { borderColor: Colors.sky }]} onPress={walk}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.skyDim }]}>
              <Text style={styles.actionEmoji}>🚶</Text>
            </View>
            <Text style={styles.actionName}>Выгулять</Text>
            <Text style={styles.actionCostText}>Бесплатно</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { borderColor: Colors.violet }]}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.violetDim }]}>
              <Text style={styles.actionEmoji}>💤</Text>
            </View>
            <Text style={styles.actionName}>Спать</Text>
            <Text style={styles.actionCostText}>Восст.</Text>
          </TouchableOpacity>
        </View>

        {/* Hype tip */}
        <Card style={styles.tipCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.jade} />
          <Text style={styles.tipText}>
            Хайп растёт когда ты выполняешь движи. Каждый XP = +{Economy.hypePerQuestXp * 100}% хайпа Жорику.
          </Text>
        </Card>
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
  levelPill: {
    backgroundColor: Colors.jadeDim,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.jade,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  levelText: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.sm,
    color: Colors.jade,
  },

  petCard: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    overflow: 'hidden',
    paddingVertical: Spacing.xl,
  },
  petBody: { alignItems: 'center', marginBottom: Spacing.lg },
  petEmoji: { fontSize: 80, marginBottom: Spacing.sm },
  petName: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.xl,
    color: Colors.text,
    letterSpacing: 1,
  },
  petStage: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.sm,
    color: Colors.jade,
    letterSpacing: 1,
    marginTop: 2,
  },

  hypeSection: { width: '100%' },
  hypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hypeLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  hypeValue: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.md,
    color: Colors.jade,
  },
  hypeTrack: {
    height: 10,
    backgroundColor: Colors.surface3,
    borderRadius: Radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  hypeFill: {
    height: '100%',
    backgroundColor: Colors.jade,
    borderRadius: Radius.full,
    shadowColor: Colors.jade,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  hypeMark: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    width: 1,
    backgroundColor: Colors.background,
    opacity: 0.4,
  },
  hypeHint: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },

  statsCard: { marginBottom: Spacing.md },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionCard: {
    width: '47.5%',
    backgroundColor: Colors.surface1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionEmoji: { fontSize: 26 },
  actionName: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  actionCost: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionCostText: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  tipCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderColor: Colors.jadeDim,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
