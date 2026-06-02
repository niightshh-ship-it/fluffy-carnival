import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HypeBlob, HypeBlobRef } from '@/components/pet/HypeBlob';
import { StatBar } from '@/components/ui/StatBar';
import { Colors, Economy, Fonts, FontSize, PetStages, Radius, Spacing } from '@/constants/tokens';

// ── Demo state (will come from Supabase in Step 7) ────────────────────────────
const INIT = { stage: 1, level: 3, hunger: 65, mood: 80, energy: 40, hype: 42, coins: 420 };

export default function PetScreen() {
  const blobRef = useRef<HypeBlobRef>(null);

  const [hunger, setHunger] = useState(INIT.hunger);
  const [mood,   setMood]   = useState(INIT.mood);
  const [energy, setEnergy] = useState(INIT.energy);
  const [hype,   setHype]   = useState(INIT.hype);
  const [coins,  setCoins]  = useState(INIT.coins);
  const [stage,  setStage]  = useState(INIT.stage);

  const currentStage = PetStages[stage];
  const nextStage    = PetStages[stage + 1] ?? null;

  // ── Coin flash animation ──────────────────────────────────────────────────
  const coinFlash = useRef(new Animated.Value(1)).current;
  const flashCoins = () => {
    Animated.sequence([
      Animated.spring(coinFlash, { toValue: 1.4, speed: 60, useNativeDriver: true }),
      Animated.spring(coinFlash, { toValue: 1,   speed: 20, useNativeDriver: true }),
    ]).start();
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  function feedHype() {
    const cost = Economy.petFeedCostBase;
    if (coins < cost) return;
    setCoins(c => c - cost);
    setHunger(h => Math.min(100, h + 18));
    setMood(m => Math.min(100, m + 8));
    setHype(h => {
      const next = Math.min(100, h + 22);
      // Evolution check
      if (next >= 100 && stage < PetStages.length - 1) {
        setTimeout(() => {
          setStage(s => s + 1);
          setHype(0);
        }, 900);
      }
      return next;
    });
    blobRef.current?.triggerHypeBurst();
    flashCoins();
  }

  function play() {
    setMood(m => Math.min(100, m + 20));
    setEnergy(e => Math.max(0, e - 12));
  }

  function walk() {
    setEnergy(e => Math.min(100, e + 28));
    setMood(m => Math.min(100, m + 10));
  }

  function sleep() {
    setEnergy(e => Math.min(100, e + 40));
  }

  // ── Hype progress bar color ───────────────────────────────────────────────
  function hypeBarColor() {
    if (hype < 30) return Colors.violet;
    if (hype < 65) return Colors.pink;
    return Colors.lime;
  }

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.screenTitle}>ЖОРИК</Text>
          <Text style={styles.stageName}>{currentStage.name}</Text>
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

      {/* ── Blob arena (fixed, not scrollable) ─────────────────────────────── */}
      <View style={styles.arena}>
        <HypeBlob
          ref={blobRef}
          hype={hype}
          hunger={hunger}
          mood={mood}
          onTap={() => setMood(m => Math.min(100, m + 3))}
        />

        {/* Tap hint — only shown when no interaction happened yet */}
        <Text style={styles.tapHint}>тапай · тяни · корми</Text>
      </View>

      {/* ── Scrollable section ─────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Hype progress ── */}
        <View style={styles.hypeSection}>
          <View style={styles.hypeHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="trending-up" size={14} color={hypeBarColor()} />
              <Text style={[styles.hypeLabel, { color: hypeBarColor() }]}>ХАЙП</Text>
            </View>
            <Text style={[styles.hypePct, { color: hypeBarColor() }]}>{hype}%</Text>
          </View>
          <View style={styles.hypeTrack}>
            <View style={[styles.hypeFill, { width: `${hype}%` as any, backgroundColor: hypeBarColor() }]} />
            {[25, 50, 75].map(m => (
              <View key={m} style={[styles.hypeTick, { left: `${m}%` as any }]} />
            ))}
          </View>
          {nextStage ? (
            <Text style={styles.hypeHint}>
              До эволюции в «{nextStage.name}» {nextStage.emoji}: {100 - hype}%
            </Text>
          ) : (
            <Text style={[styles.hypeHint, { color: Colors.gold }]}>
              Максимальная эволюция достигнута ✨
            </Text>
          )}
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsCard}>
          <StatBar label="Сытость"   value={hunger} color={Colors.gold} />
          <StatBar label="Настроение" value={mood}   color={Colors.pink} />
          <StatBar label="Энергия"   value={energy} color={Colors.sky}  />
        </View>

        {/* ── FEED HYPE — primary action ── */}
        <TouchableOpacity
          style={[styles.feedBtn, coins < Economy.petFeedCostBase && styles.feedBtnDisabled]}
          onPress={feedHype}
          activeOpacity={0.82}
        >
          <LinearGradient
            colors={hype >= 65 ? [Colors.lime, '#9ed630'] : [Colors.violet, '#7a6dff']}
            style={styles.feedGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.feedEmoji}>⚡</Text>
            <View>
              <Text style={styles.feedTitle}>ДОКОРМИТЬ ХАЙПОМ</Text>
              <Text style={styles.feedSub}>+22 хайп · +18 сытость</Text>
            </View>
            <View style={styles.feedCost}>
              <Ionicons name="logo-bitcoin" size={11} color={Colors.background} />
              <Text style={styles.feedCostText}>−{Economy.petFeedCostBase}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Other actions grid ── */}
        <View style={styles.actionGrid}>
          <ActionCard
            emoji="🎮" label="Поиграть" sub="+20 настр."
            accent={Colors.pink} onPress={play}
          />
          <ActionCard
            emoji="🚶" label="Выгулять" sub="+28 энергия"
            accent={Colors.sky} onPress={walk}
          />
          <ActionCard
            emoji="💤" label="Спать" sub="+40 энергия"
            accent={Colors.violet} onPress={sleep}
          />
          <ActionCard
            emoji="🪞" label="Флекс" sub="показать всем"
            accent={Colors.gold} onPress={() => blobRef.current?.triggerHypeBurst()}
          />
        </View>

        {/* ── Info tip ── */}
        <View style={styles.tip}>
          <Ionicons name="flash-outline" size={14} color={Colors.lime} />
          <Text style={styles.tipText}>
            Выполняй движи — каждый XP даёт {Economy.hypePerQuestXp * 100}% хайпа Жорику автоматически.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Action card component ──────────────────────────────────────────────────────
function ActionCard({
  emoji, label, sub, accent, onPress,
}: {
  emoji: string; label: string; sub: string; accent: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, { borderColor: accent + '55' }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.actionIcon, { backgroundColor: accent + '18' }]}>
        <Text style={styles.actionEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 4,
  },
  screenTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.xxl,
    color: Colors.text,
    letterSpacing: 3,
  },
  stageName: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.xs,
    color: Colors.jade,
    letterSpacing: 1,
    marginTop: 1,
  },
  topRight: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 },
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
    fontSize: FontSize.xs,
    color: Colors.jade,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  coinText: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.xs,
    color: Colors.gold,
  },

  // Blob arena
  arena: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  tapHint: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.xs,
    color: Colors.textDisabled,
    letterSpacing: 1,
    marginTop: 4,
  },

  // Hype bar
  hypeSection: { gap: 6 },
  hypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hypeLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.xs,
    letterSpacing: 2,
  },
  hypePct: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.lg,
  },
  hypeTrack: {
    height: 10,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  hypeFill: {
    height: '100%',
    borderRadius: Radius.full,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  hypeTick: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    width: 1,
    backgroundColor: Colors.background,
    opacity: 0.5,
  },
  hypeHint: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // Stats
  statsCard: {
    backgroundColor: Colors.surface1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 2,
  },

  // Feed hype button
  feedBtn: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: Colors.violet,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  feedBtnDisabled: { opacity: 0.45 },
  feedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  feedEmoji: { fontSize: 26 },
  feedTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.md,
    color: Colors.background,
    letterSpacing: 1,
  },
  feedSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.xs,
    color: 'rgba(10,10,20,0.65)',
    marginTop: 1,
  },
  feedCost: {
    marginLeft: 'auto' as any,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  feedCostText: {
    fontFamily: Fonts.monoBold,
    fontSize: FontSize.sm,
    color: Colors.background,
  },

  // Action grid
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
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
  actionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  actionSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // Tip
  tip: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: Colors.surface1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.limeDim,
    padding: Spacing.md,
  },
  tipText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 17,
  },
});
