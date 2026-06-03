import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { TopBar } from '@/components/ui/TopBar';
import { useGame } from '@/context/GameContext';
import { Colors, Fonts, FontSize, Radius } from '@/constants/tokens';

export default function ProfileScreen() {
  const { coins, hype, streak } = useGame();

  const stats = [
    { v: coins, l: 'монет', color: Colors.coin },
    { v: hype, l: 'хайпа', color: Colors.lime },
    { v: streak, l: 'дней стрик', color: Colors.hot },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.ava}>
            <Icon name="person" size={44} color={Colors.background} />
          </View>
          <Text style={styles.name}>двиган</Text>
          <Text style={styles.handle}>@dvizh_player</Text>
        </View>

        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.stat}>
              <Text style={[styles.statV, { color: s.color }]}>{s.v}</Text>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.soon}>Полный профиль скоро появится</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: 18 },
  header: { alignItems: 'center', gap: 6, marginTop: 12, marginBottom: 24 },
  ava: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: Colors.violet,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    shadowColor: Colors.violet, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20,
  },
  name: { fontFamily: Fonts.display, fontSize: FontSize.xxl, color: Colors.text },
  handle: { fontFamily: Fonts.mono, fontSize: FontSize.md, color: Colors.textMuted },

  statsRow: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1, padding: 16, borderRadius: Radius.lg,
    backgroundColor: Colors.surface1, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  statV: { fontFamily: Fonts.monoBold, fontSize: 22 },
  statL: { fontFamily: Fonts.regular, fontSize: 11.5, color: Colors.textMuted, marginTop: 4 },

  soon: { fontFamily: Fonts.regular, fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginTop: 32 },
});
