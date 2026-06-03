import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { TopBar } from '@/components/ui/TopBar';
import { Toast } from '@/components/ui/Toast';
import { useGame } from '@/context/GameContext';
import { QUESTS } from '@/constants/data';
import { Colors, Fonts, FontSize, Radius, Spacing } from '@/constants/tokens';

export default function QuestScreen() {
  const router = useRouter();
  const {
    questIdx, questState, acceptQuest, completeQuest, rerollQuest,
  } = useGame();
  const quest = QUESTS[questIdx];

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Твой квест</Text>

        {/* Game master */}
        <View style={styles.gm}>
          <View style={styles.gmAva}>
            <Text style={styles.gmAvaTxt}>GM</Text>
          </View>
          <View>
            <Text style={styles.gmName}>Гейм-мастер</Text>
            <View style={styles.gmState}>
              <View style={styles.live} />
              <Text style={styles.gmStateTxt}>придумал для тебя движ</Text>
            </View>
          </View>
        </View>

        {questState !== 'done' && (
          <View style={styles.card}>
            <Text style={styles.qTag}>{quest.tag}</Text>
            <Text style={styles.qText}>{quest.text}</Text>

            <View style={styles.qMeta}>
              <View style={styles.chip}>
                <Icon name="clock" size={14} color={Colors.text} />
                <Text style={styles.chipTxt}>{quest.time}</Text>
              </View>
              <View style={styles.chip}>
                <Icon name="target" size={14} color={Colors.text} />
                <Text style={styles.chipTxt}>{quest.diff}</Text>
              </View>
            </View>

            <View style={styles.qReward}>
              <View style={styles.rw}>
                <Icon name="coin" size={18} color={Colors.coin} />
                <Text style={[styles.rwTxt, { color: Colors.coin }]}>{quest.coin}</Text>
              </View>
              <View style={styles.rw}>
                <Icon name="bolt" size={18} color={Colors.lime} />
                <Text style={[styles.rwTxt, { color: Colors.lime }]}>{quest.hype}</Text>
              </View>
            </View>

            {questState === 'offer' && (
              <>
                <View style={styles.qActions}>
                  <TouchableOpacity style={[styles.btn, styles.btnPrimary, styles.flex1]} activeOpacity={0.85} onPress={acceptQuest}>
                    <Text style={styles.btnPrimaryTxt}>Принять</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnGhost, styles.flexGhost]} activeOpacity={0.7} onPress={rerollQuest}>
                    <Text style={styles.btnGhostTxt}>Скип</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={[styles.btn, styles.btnGhost, styles.btnSm, styles.reroll]} activeOpacity={0.7} onPress={rerollQuest}>
                  <Icon name="dice" size={16} color={Colors.text} />
                  <Text style={styles.btnGhostTxtSm}>  Другой квест</Text>
                </TouchableOpacity>
              </>
            )}

            {questState === 'accepted' && (
              <TouchableOpacity style={styles.dropzone} activeOpacity={0.8} onPress={completeQuest}>
                <Icon name="camera" size={40} color={Colors.cyan} />
                <Text style={styles.dzMain}>Загрузить пруф</Text>
                <Text style={styles.dzSub}>фото или видео · нажми чтобы засчитать</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {questState === 'done' && (
          <View style={[styles.card, { alignItems: 'center' }]}>
            <View style={styles.doneIcon}>
              <Icon name="check" size={32} color={Colors.background} />
            </View>
            <Text style={[styles.qText, { marginBottom: 6, textAlign: 'center' }]}>Квест засчитан!</Text>
            <Text style={styles.doneSub}>
              Хайп улетел в твоего Хайпожорика. Покорми его, чтобы рос быстрее.
            </Text>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary, styles.full]} activeOpacity={0.85} onPress={() => router.push('/(tabs)/pet')}>
              <Text style={styles.btnPrimaryTxt}>Покормить Хайпожорика</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGhost, styles.btnSm, styles.full, { marginTop: 10 }]} activeOpacity={0.7} onPress={rerollQuest}>
              <Text style={styles.btnGhostTxtSm}>Следующий квест</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  screen: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 24 },

  title: {
    fontFamily: Fonts.display,
    fontSize: FontSize.xxl,
    color: Colors.text,
    marginTop: 4, marginBottom: 14,
    lineHeight: 30,
  },

  gm: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 14 },
  gmAva: {
    width: 46, height: 46, borderRadius: 15,
    backgroundColor: Colors.lime,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.lime, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 18,
  },
  gmAvaTxt: { fontFamily: Fonts.display, fontSize: 16, color: Colors.background },
  gmName: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.text },
  gmState: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  live: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.cyan, marginRight: 6 },
  gmStateTxt: { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.cyan },

  card: {
    backgroundColor: Colors.surface1,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.5, shadowRadius: 28,
  },

  qTag: {
    fontFamily: Fonts.monoBold, fontSize: 11, letterSpacing: 1.5,
    color: Colors.cyan, marginBottom: 12,
  },
  qText: {
    fontFamily: Fonts.bold, fontSize: 23, lineHeight: 28,
    color: Colors.text, marginBottom: 16,
  },
  qMeta: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 7, paddingHorizontal: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.chipBg, borderWidth: 1, borderColor: Colors.chipBorder,
  },
  chipTxt: { fontFamily: Fonts.mono, fontSize: 13, color: Colors.text },

  qReward: { flexDirection: 'row', gap: 14, alignItems: 'center', paddingTop: 4 },
  rw: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rwTxt: { fontFamily: Fonts.monoBold, fontSize: 17 },

  qActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  flex1: { flex: 1 },
  flexGhost: { flexBasis: '34%' },

  btn: {
    paddingVertical: 15, paddingHorizontal: 18,
    borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row',
  },
  btnPrimary: {
    backgroundColor: Colors.lime,
    shadowColor: Colors.lime, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 18,
  },
  btnPrimaryTxt: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.background },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.borderStrong },
  btnGhostTxt: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.text },
  btnGhostTxtSm: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.text },
  btnSm: { paddingVertical: 10, paddingHorizontal: 14 },
  reroll: { marginTop: 10 },
  full: { width: '100%' },

  dropzone: {
    marginTop: 14,
    borderWidth: 2, borderColor: Colors.borderStrong, borderStyle: 'dashed',
    borderRadius: Radius.xl,
    backgroundColor: Colors.chipBg,
    alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 38, paddingHorizontal: 20,
  },
  dzMain: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.text },
  dzSub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textMuted },

  doneIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.lime,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 6, marginBottom: 14,
    shadowColor: Colors.lime, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 18,
  },
  doneSub: {
    fontFamily: Fonts.regular, fontSize: 14, color: Colors.textMuted,
    textAlign: 'center', marginBottom: 16, lineHeight: 20,
  },
});
