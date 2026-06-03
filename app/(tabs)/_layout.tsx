import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon, IconName } from '@/components/ui/Icon';
import { Colors, Fonts, FontSize } from '@/constants/tokens';

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'dvizh',      label: 'Квест',     icon: 'target' },
  { name: 'feed',       label: 'Лента',     icon: 'feed'   },
  { name: 'pet',        label: 'Хайпожор',  icon: 'pet'    },
  { name: 'challenges', label: 'Вызовы',    icon: 'trophy' },
  { name: 'profile',    label: 'Профиль',   icon: 'person' },
];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const tab = TABS.find(t => t.name === route.name);
        if (!tab) return null;
        const focused = state.index === index;
        const color = focused ? Colors.cyan : Colors.textMuted;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(route.name)}
          >
            <View style={[styles.ico, focused && styles.icoActive]}>
              <Icon name={tab.icon} size={24} color={color} />
            </View>
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    gap: 4,
    backgroundColor: 'rgba(11,11,18,0.92)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  ico: { transform: [{ translateY: 0 }] },
  icoActive: { transform: [{ translateY: -1 }] },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.xs,
    letterSpacing: 0.2,
  },
});
