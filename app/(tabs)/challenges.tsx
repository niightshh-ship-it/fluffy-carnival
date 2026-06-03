import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { TopBar } from '@/components/ui/TopBar';
import { Colors, Fonts, FontSize, Radius } from '@/constants/tokens';

export default function ChallengesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <TopBar />
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Icon name="trophy" size={40} color={Colors.coin} />
        </View>
        <Text style={styles.title}>Вызовы</Text>
        <Text style={styles.sub}>
          Бросай вызовы друзьям и ставь хайп на кон.{'\n'}Скоро здесь будет жарко.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 32, paddingBottom: 80 },
  iconWrap: {
    width: 80, height: 80, borderRadius: Radius.xl,
    backgroundColor: Colors.chipBg, borderWidth: 1, borderColor: Colors.chipBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontFamily: Fonts.display, fontSize: FontSize.display, color: Colors.text },
  sub: { fontFamily: Fonts.regular, fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
