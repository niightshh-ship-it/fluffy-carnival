import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Icon } from '@/components/ui/Icon';
import { ScreenBg } from '@/components/ui/ScreenBg';
import { TopBar } from '@/components/ui/TopBar';
import { Toast } from '@/components/ui/Toast';
import HypeMascot, { HypeMascotRef } from '@/components/pet/HypeMascot';
import { useGame } from '@/context/GameContext';
import { PET_STAGES } from '@/constants/data';
import { Colors, Fonts, FontSize, Radius } from '@/constants/tokens';

// Creature palette shifts as it evolves: lime → cyan → violet
const STAGE_COLORS = [Colors.lime, Colors.cyan, Colors.violet];

export default function PetScreen() {
  const {
    petStage, petHunger, petEvo, petReaction, feedPet, clearReaction,
  } = useGame();
  const info = PET_STAGES[petStage];
  const mascotRef = useRef<HypeMascotRef>(null);
  const focused = useIsFocused();

  // Drive mascot reaction animation off game state (feed / evolve)
  useEffect(() => {
    if (!petReaction) return;
    if (petReaction === 'fed') {
      mascotRef.current?.triggerFed();
    } else if (petReaction === 'evolve') {
      mascotRef.current?.triggerEvolve();
    }
    const t = setTimeout(() => clearReaction(), 1200);
    return () => clearTimeout(t);
  }, [petReaction, clearReaction]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenBg />
      <TopBar />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pet}>
          <View style={styles.stageBadge}>
            <Text style={styles.stageBadgeTxt}>{info.badge}</Text>
          </View>

          <View style={styles.petStage}>
            <HypeMascot
              ref={mascotRef}
              stage={petStage}
              color={STAGE_COLORS[petStage]}
              size={240}
              hunger={petHunger}
              active={focused}
            />
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
  safe: { flex: 1, backgroundColor: 'transparent' },
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
});
