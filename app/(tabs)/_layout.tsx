import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors, Fonts, FontSize, Spacing } from '@/constants/tokens';

const TABS = [
  { name: 'dvizh',      label: 'ДВИЖ',    icon: 'flash',    iconOff: 'flash-outline'    },
  { name: 'feed',       label: 'ЛЕНТА',   icon: 'grid',     iconOff: 'grid-outline'     },
  { name: 'pet',        label: 'ЖОРИК',   icon: 'heart',    iconOff: 'heart-outline'    },
  { name: 'challenges', label: 'ВЫЗОВЫ',  icon: 'trophy',   iconOff: 'trophy-outline'   },
  { name: 'profile',    label: 'ПРОФИЛЬ', icon: 'person',   iconOff: 'person-outline'   },
] as const;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;
          const focused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.item}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(route.name)}
            >
              {/* Active pill indicator */}
              <View style={[styles.pill, focused && styles.pillActive]} />

              {/* Icon */}
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Ionicons
                  name={(focused ? tab.icon : tab.iconOff) as any}
                  size={22}
                  color={focused ? Colors.background : Colors.textMuted}
                />
              </View>

              {/* Label */}
              <Text style={[styles.label, focused && styles.labelActive]}>
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
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.surface1,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  pill: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginBottom: 2,
  },
  pillActive: {
    backgroundColor: Colors.lime,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.lime,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
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
