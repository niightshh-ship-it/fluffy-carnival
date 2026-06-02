import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors, Fonts, FontSize } from '@/constants/tokens';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.label}>ПРОФИЛЬ</Text>
        <Text style={styles.sub}>твой профиль будет здесь</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { fontFamily: Fonts.bold, fontSize: FontSize.xxl, color: Colors.pink },
  sub: { fontFamily: Fonts.regular, fontSize: FontSize.sm, color: Colors.textMuted },
});
