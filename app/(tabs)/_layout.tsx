import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors, Fonts, FontSize } from '@/constants/tokens';

const TABS = [
  { name: 'dvizh',      label: 'ДВИЖ',    icon: 'flash',   iconOff: 'flash-outline'   },
  { name: 'feed',       label: 'ЛЕНТА',   icon: 'grid',    iconOff: 'grid-outline'    },
  { name: 'pet',        label: 'ЖОРИК',   icon: 'planet',  iconOff: 'planet-outline'  },
  { name: 'challenges', label: 'ВЫЗОВЫ',  icon: 'trophy',  iconOff: 'trophy-outline'  },
  { name: 'profile',    label: 'ПРОФИЛЬ', icon: 'person',  iconOff: 'person-outline'  },
] as const;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const tab = TABS.find(t => t.name === route.name);
          if (!tab) return null;
          const focused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.item}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(route.name)}
            >
              <View style={[styles.pill, focused && styles.pillActive]} />
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Ionicons
                  name={(focused ? tab.icon : tab.iconOff) as any}
                  size={22}
                  color={focused ? Colors.background : Colors.textMuted}
                />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
    backgroundColor: 'rgba(20,22,31,0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 22 : 6,
    paddingTop: 6,
    paddingHorizontal: 2,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingTop: 4,
    minWidth: 0,
  },
  pill: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: 'transparent',
    marginBottom: 1,
  },
  pillActive: { backgroundColor: Colors.lime },
  iconWrap: {
    width: 40, height: 32,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: Colors.lime },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: Colors.lime,
    fontFamily: Fonts.bold,
  },
});
