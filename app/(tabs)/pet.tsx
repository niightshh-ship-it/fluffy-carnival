import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { TopBar } from '@/components/ui/TopBar';
import { Toast } from '@/components/ui/Toast';
import CreatureSvg, { CreatureSvgRef } from '@/components/pet/CreatureSvg';
import { useGame } from '@/context/GameContext';
import { PET_STAGES } from '@/constants/data';
import { Colors, Fonts, FontSize, Radius } from '@/constants/tokens';

// Creature palette shifts as it evolves: lime → cyan → violet
const STAGE_COLORS = [Colors.lime, Colors.cyan, Colors.violet];

interface Spark { id: number; x: number; y: number; }

function Sparkle({ x, y }: { x: number; y: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, [anim]);
  const opacity = anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 0] });
  const scale = anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1.2, 0.4] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  return (
    <Animated.View style={[styles.spark, { left: x, top: y, opacity, transform: [{ scale }, { translateY }] }]}>
      <Icon name="spark" size={18} color={Colors.coin} />
    </Animated.View>
  );
}

export default function PetScreen() {
  const {
    petStage, petHunger, petEvo, petReaction, feedPet, clearReaction,
  } = useGame();
  const info = PET_STAGES[petStage];
  const creatureRef = useRef<CreatureSvgRef>(null);
  const [sparks, setSparks] = useState<Spark[]>([]);

  // Drive creature reaction animation off game state
  useEffect(() => {
    if (!petReaction) return;
    if (petReaction === 'fed') {
      creatureRef.current?.triggerFed();
    } else if (petReaction === 'evolve') {
      creatureRef.current?.triggerEvolve();
    }
    // sparkles burst
    const arr = Array.from({ length: 7 }, () => ({
      id: Math.random(), x: 30 + Math.random() * 160, y: 20 + Math.random() * 150,
    }));
    setSparks(arr);
    const t1 = setTimeout(() => setSparks([]), 700);
    const t2 = setTimeout(() => clearReaction(), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [petReaction, clearReaction]);

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pet}>
          <View style={styles.stageBadge}>
            <Text style={styles.stageBadgeTxt}>{info.badge}</Text>
          </View>

          <View style={styles.petStage}>
            <View style={styles.petFloor} />
            <CreatureSvg ref={creatureRef} stage={petStage} color={STAGE_COLORS[petStage]} size={220} />
            {sparks.map(s => <Sparkle key={s.id} x={s.x} y={s.y} />)}
          </View>

          <Text style={styles.petName}>{info.name}</Text>
          <Text style={styles.petMood}>{info.mood}</Text>

          {/* Meters */}
          <View style={styles.meters}>
            <View style={styles.meterRow}>
              <View style={styles.meterTop}>
                <Text style={styles.meterLabel}>Сытость</Text>
                <Text style={styles.meterPct}>{petHunger}%</Text>
              </View>
              <View style={styles.meter}>
                <View style={[styles.meterFill, { width: `${petHunger}%`, backgroundColor: Colors.lime }]} />
              </View>
            </View>

            <View style={styles.meterRow}>
              <View style={styles.meterTop}>
                <Text style={styles.meterLabel}>До эволюции</Text>
                <Text style={styles.meterPct}>{petEvo}%</Text>
              </View>
              <View style={styles.meter}>
                <View style={[styles.meterFill, styles.evoFill, { width: `${petEvo}%` }]} />
              </View>
            </View>
          </View>

          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} activeOpacity={0.85} onPress={feedPet}>
            <Icon name="bolt" size={18} color={Colors.background} />
            <Text style={styles.btnPrimaryTxt}>  Покормить · −50 хайп</Text>
          </TouchableOpacity>

          <View style={styles.petStats}>
            <View style={styles.pstat}>
              <Text style={styles.pstatV}>{petStage + 1}</Text>
              <Text style={styles.pstatL}>стадия</Text>
            </View>
            <View style={styles.pstat}>
              <Text style={styles.pstatV}>{Math.round(petHunger * 1.2)}</Text>
              <Text style={styles.pstatL}>настроение</Text>
            </View>
            <View style={styles.pstat}>
              <Text style={styles.pstatV}>{12 + petStage * 7}</Text>
              <Text style={styles.pstatL}>дней с тобой</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  screen: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 24 },

  pet: { alignItems: 'center' },
  stageBadge: {
    marginTop: 2, marginBottom: 6,
    paddingVertical: 6, paddingHorizontal: 13,
    borderRadius: Radius.md,
    backgroundColor: Colors.chipBg, borderWidth: 1, borderColor: Colors.chipBorder,
  },
  stageBadgeTxt: {
    fontFamily: Fonts.monoBold, fontSize: 12, letterSpacing: 1,
    color: Colors.cyan, textTransform: 'uppercase',
  },

  petStage: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  petFloor: {
    position: 'absolute', bottom: 16,
    width: 150, height: 24, borderRadius: 12,
    backgroundColor: Colors.lime, opacity: 0.18,
  },

  petName: { fontFamily: Fonts.display, fontSize: 28, color: Colors.text, marginTop: 2 },
  petMood: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textMuted, marginBottom: 16 },

  meters: { width: '100%', gap: 12, marginBottom: 18 },
  meterRow: {},
  meterTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  meterLabel: { fontFamily: Fonts.monoBold, fontSize: 13, color: Colors.text },
  meterPct: { fontFamily: Fonts.monoBold, fontSize: 13, color: Colors.textMuted },
  meter: {
    height: 14, borderRadius: 99,
    backgroundColor: Colors.trackBg,
    borderWidth: 1, borderColor: Colors.chipBorder,
    overflow: 'hidden',
  },
  meterFill: { height: '100%', borderRadius: 99 },
  evoFill: { backgroundColor: Colors.cyan },

  btn: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 15, paddingHorizontal: 18,
    borderRadius: Radius.md,
  },
  btnPrimary: {
    backgroundColor: Colors.lime,
    shadowColor: Colors.lime, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 18,
  },
  btnPrimaryTxt: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.background },

  petStats: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 14 },
  pstat: {
    flex: 1, padding: 13, borderRadius: Radius.lg,
    backgroundColor: Colors.surface1, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  pstatV: { fontFamily: Fonts.monoBold, fontSize: 20, color: Colors.text },
  pstatL: { fontFamily: Fonts.regular, fontSize: 11.5, color: Colors.textMuted, marginTop: 2 },

  spark: { position: 'absolute' },
});
