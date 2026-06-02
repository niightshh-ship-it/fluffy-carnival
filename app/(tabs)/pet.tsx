import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { HypeBlob, HypeBlobRef } from '@/components/pet/HypeBlob';
import { StatBar } from '@/components/ui/StatBar';
import { Colors, Economy, Fonts, FontSize, PetStages, Radius, Spacing } from '@/constants/tokens';

const INIT = { stage: 1, level: 3, hunger: 65, mood: 80, energy: 40, hype: 42, coins: 420 };

export default function PetScreen() {
  const blobRef       = useRef<HypeBlobRef>(null);
  const entranceScale = useRef(new Animated.Value(0.4)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;

  const [hunger, setHunger] = useState(INIT.hunger);
  const [mood,   setMood]   = useState(INIT.mood);
  const [energy, setEnergy] = useState(INIT.energy);
  const [hype,   setHype]   = useState(INIT.hype);
  const [coins,  setCoins]  = useState(INIT.coins);
  const [stage,  setStage]  = useState(INIT.stage);

  const currentStage = PetStages[stage];
  const nextStage    = PetStages[stage + 1] ?? null;

  // Entrance animation when tab gains focus
  useFocusEffect(
    useCallback(() => {
      entranceScale.setValue(0.4);
      entranceOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(entranceScale, {
          toValue: 1, tension: 55, friction: 7, useNativeDriver: true,
        }),
        Animated.timing(entranceOpacity, {
          toValue: 1, duration: 280, useNativeDriver: true,
        }),
      ]).start();
      return () => {
        // Shrink out when leaving tab
        Animated.parallel([
          Animated.timing(entranceScale,   { toValue: 0.4, duration: 180, useNativeDriver: true }),
          Animated.timing(entranceOpacity, { toValue: 0,   duration: 180, useNativeDriver: true }),
        ]).start();
      };
    }, [])
  );

  // Coin flash
  const coinFlash = useRef(new Animated.Value(1)).current;
  const flashCoins = () =>
    Animated.sequence([
      Animated.spring(coinFlash, { toValue: 1.45, speed: 70, useNativeDriver: true }),
      Animated.spring(coinFlash, { toValue: 1,    speed: 18, useNativeDriver: true }),
    ]).start();

  // ── Actions ───────────────────────────────────────────────────────────────
  function feedHype() {
    if (coins < Economy.petFeedCostBase) return;
    setCoins(c => c - Economy.petFeedCostBase);
    setHunger(h => Math.min(100, h + 18));
    setMood(m => Math.min(100, m + 8));
    setHype(h => {
      const next = Math.min(100, h + 22);
      if (next >= 100 && stage < PetStages.length - 1) {
        setTimeout(() => { setStage(s => s + 1); setHype(0); }, 900);
      }
      return next;
    });
    blobRef.current?.triggerHypeBurst();
    flashCoins();
  }

  function play()  { setMood(m => Math.min(100, m + 20)); setEnergy(e => Math.max(0, e - 12)); }
  function walk()  { setEnergy(e => Math.min(100, e + 28)); setMood(m => Math.min(100, m + 10)); }
  function sleep_() { setEnergy(e => Math.min(100, e + 40)); }

  function hypeColor() {
    if (hype < 30) return Colors.violet;
    if (hype < 65) return Colors.pink;
    return Colors.lime;
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>ХАЙПОЖОРИК</Text>
          <Text style={styles.stageName}>{currentStage.emoji} {currentStage.name}</Text>
        </View>
        <View style={styles.topRight}>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>ур. {INIT.level}</Text>
          </View>
          <Animated.View style={[styles.coinPill, { transform: [{ scale: coinFlash }] }]}>
            <Ionicons name="logo-bitcoin" size={12} color={Colors.gold} />
            <Text style={styles.coinText}>{coins}</Text>
          </Animated.View>
        </View>
      </View>

      {/* Blob arena — fixed, not inside ScrollView */}
      <Animated.View
        style={[
          styles.arena,
          { opacity: entranceOpacity, transform: [{ scale: entranceScale }] },
        ]}
      >
        <HypeBlob
          ref={blobRef}
          hype={hype}
          hunger={hunger}
          mood={mood}
          onTap={() => setMood(m => Math.min(100, m + 3))}
        />
        <Text style={styles.tapHint}>тапай · тяни · корми хайпом</Text>
      </Animated.View>

      {/* Scrollable stats + actions */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hype bar */}
        <View style={styles.hypeSection}>
          <View style={styles.hypeHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="trending-up" size={14} color={hypeColor()} />
              <Text style={[styles.hypeLabel, { color: hypeColor() }]}>ХАЙП</Text>
            </View>
            <Text style={[styles.hypePct, { color: hypeColor() }]}>{hype}%</Text>
          </View>
          <View style={styles.hypeTrack}>
            <View style={[styles.hypeFill, { width: `${hype}%` as any, backgroundColor: hypeColor(), shadowColor: hypeColor() }]} />
            {[25, 50, 75].map(m => (
              <View key={m} style={[styles.hypeTick, { left: `${m}%` as any }]} />
            ))}
          </View>
          <Text style={styles.hypeHint}>
            {nextStage
              ? `До эволюции в «${nextStage.name}» ${nextStage.emoji}: ${100 - hype}%`
              : '✨ Максимальная эволюция достигнута'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <StatBar label="Сытость"    value={hunger} color={Colors.gold}   />
          <StatBar label="Настроение" value={mood}   color={Colors.pink}   />
          <StatBar label="Энергия"    value={energy} color={Colors.sky}    />
        </View>

        {/* FEED HYPE CTA */}
        <TouchableOpacity
          style={[styles.feedBtn, coins < Economy.petFeedCostBase && { opacity: 0.45 }]}
          onPress={feedHype}
          activeOpacity={0.82}
        >
          <LinearGradient
            colors={hype >= 65 ? [Colors.lime, '#8ed020'] : [Colors.violet, '#6a5cef']}
            style={styles.feedGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.feedEmoji}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.feedTitle}>ДОКОРМИТЬ ХАЙПОМ</Text>
              <Text style={styles.feedSub}>+22 хайп · +18 сытость · он кайфует</Text>
            </View>
            <View style={styles.feedCost}>
              <Ionicons name="logo-bitcoin" size={11} color={Colors.background} />
              <Text style={styles.feedCostTxt}>−{Economy.petFeedCostBase}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Action grid */}
        <View style={styles.actionGrid}>
          <ActionCard emoji="🎮" label="Поиграть"  sub="+20 настр."   accent={Colors.pink}   onPress={play}   />
          <ActionCard emoji="🚶" label="Выгулять"  sub="+28 энергия" accent={Colors.sky}    onPress={walk}   />
          <ActionCard emoji="💤" label="Спать"     sub="+40 энергия" accent={Colors.violet} onPress={sleep_} />
          <ActionCard emoji="🪞" label="Флекс"     sub="взрыв хайпа" accent={Colors.gold}
            onPress={() => blobRef.current?.triggerHypeBurst()} />
        </View>

        {/* Tip */}
        <View style={styles.tip}>
          <Ionicons name="flash-outline" size={13} color={Colors.lime} />
          <Text style={styles.tipText}>
            Выполняй движи — каждый XP даёт +{Economy.hypePerQuestXp * 100}% хайпа автоматически.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({ emoji, label, sub, accent, onPress }: {
  emoji: string; label: string; sub: string; accent: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, { borderColor: accent + '50' }]}
      onPress={onPress} activeOpacity={0.75}
    >
      <View style={[styles.actionIcon, { backgroundColor: accent + '18' }]}>
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 2,
  },
  title: {
    fontFamily: Fonts.bold, fontSize: FontSize.xl,
    color: Colors.text, letterSpacing: 2,
  },
  stageName: {
    fontFamily: Fonts.mono, fontSize: FontSize.xs,
    color: Colors.jade, letterSpacing: 0.8, marginTop: 2,
  },
  topRight: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 },
  levelPill: {
    backgroundColor: Colors.jadeDim, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.jade,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
  },
  levelText: { fontFamily: Fonts.monoBold, fontSize: FontSize.xs, color: Colors.jade },
  coinPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.goldDim, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.gold,
    paddingHorizontal: 9, paddingVertical: 3,
  },
  coinText: { fontFamily: Fonts.monoBold, fontSize: FontSize.xs, color: Colors.gold },

  arena: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  tapHint: {
    fontFamily: Fonts.mono, fontSize: FontSize.xs,
    color: Colors.textDisabled, letterSpacing: 1, marginTop: 2,
  },

  hypeSection: { gap: 6 },
  hypeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hypeLabel: { fontFamily: Fonts.semiBold, fontSize: FontSize.xs, letterSpacing: 2 },
  hypePct:   { fontFamily: Fonts.monoBold, fontSize: FontSize.lg },
  hypeTrack: {
    height: 10, backgroundColor: Colors.surface2,
    borderRadius: Radius.full, overflow: 'hidden', position: 'relative',
  },
  hypeFill: {
    height: '100%', borderRadius: Radius.full,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6,
  },
  hypeTick: {
    position: 'absolute', top: 2, bottom: 2,
    width: 1, backgroundColor: Colors.background, opacity: 0.45,
  },
  hypeHint: { fontFamily: Fonts.regular, fontSize: FontSize.xs, color: Colors.textMuted },

  statsCard: {
    backgroundColor: Colors.surface1, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, gap: 2,
  },

  feedBtn: {
    borderRadius: Radius.lg, overflow: 'hidden',
    shadowColor: Colors.violet,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14,
    elevation: 8,
  },
  feedGrad: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, padding: Spacing.md,
  },
  feedEmoji: { fontSize: 26 },
  feedTitle: { fontFamily: Fonts.bold, fontSize: FontSize.md, color: Colors.background, letterSpacing: 0.8 },
  feedSub:   { fontFamily: Fonts.regular, fontSize: FontSize.xs, color: 'rgba(10,10,20,0.6)', marginTop: 1 },
  feedCost: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  feedCostTxt: { fontFamily: Fonts.monoBold, fontSize: FontSize.sm, color: Colors.background },

  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard: {
    width: '47.5%', backgroundColor: Colors.surface1,
    borderRadius: Radius.lg, borderWidth: 1,
    padding: Spacing.md, alignItems: 'center', gap: 5,
  },
  actionIcon: { width: 50, height: 50, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontFamily: Fonts.semiBold, fontSize: FontSize.md, color: Colors.text },
  actionSub:   { fontFamily: Fonts.regular,  fontSize: FontSize.xs, color: Colors.textMuted },

  tip: {
    flexDirection: 'row', gap: 7, alignItems: 'flex-start',
    backgroundColor: Colors.surface1, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.limeDim, padding: Spacing.md,
  },
  tipText: { flex: 1, fontFamily: Fonts.regular, fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 17 },
});
