import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { useRef } from 'react';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MiniBlobTab, MiniBlobTabRef } from '@/components/pet/MiniBlobTab';
import { Colors, Fonts, FontSize, Spacing } from '@/constants/tokens';

const TABS = [
  { name: 'dvizh',      label: 'ДВИЖ',       icon: 'flash',    iconOff: 'flash-outline'    },
  { name: 'feed',       label: 'ЛЕНТА',      icon: 'grid',     iconOff: 'grid-outline'     },
  { name: 'pet',        label: 'ХАЙПОЖОРИК', icon: null,       iconOff: null               }, // blob
  { name: 'challenges', label: 'ВЫЗОВЫ',     icon: 'trophy',   iconOff: 'trophy-outline'   },
  { name: 'profile',    label: 'ПРОФИЛЬ',    icon: 'person',   iconOff: 'person-outline'   },
] as const;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const blobRef = useRef<MiniBlobTabRef>(null);
  // Track previous index to detect tab change
  const prevIndex = useRef(state.index);

  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const tab    = TABS.find(t => t.name === route.name);
          if (!tab) return null;
          const focused = state.index === index;
          const isPet   = tab.name === 'pet';

          const handlePress = () => {
            if (isPet && !focused) {
              // Pop animation when switching TO Хайпожорик tab
              blobRef.current?.triggerPop();
            }
            navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.item}
              activeOpacity={0.7}
              onPress={handlePress}
            >
              {/* Active pill */}
              <View style={[styles.pill, focused && styles.pillActive]} />

              {/* Icon / blob */}
              {isPet ? (
                <View style={[styles.blobWrap, focused && styles.blobWrapActive]}>
                  <MiniBlobTab ref={blobRef} focused={focused} hype={50} />
                </View>
              ) : (
                <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                  <Ionicons
                    name={(focused ? tab.icon : tab.iconOff) as any}
                    size={22}
                    color={focused ? Colors.background : Colors.textMuted}
                  />
                </View>
              )}

              {/* Label */}
              <Text
                style={[
                  styles.label,
                  focused && styles.labelActive,
                  isPet && styles.labelPet,
                  isPet && focused && styles.labelPetActive,
                ]}
                numberOfLines={1}
              >
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
      screenOptions={{ headerShown: false }}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.surface1,
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
  pillActive: {
    backgroundColor: Colors.lime,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 4,
  },

  iconWrap: {
    width: 40, height: 32,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.lime,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },

  // Pet blob wrap
  blobWrap: {
    width: 40, height: 32,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 12,
  },
  blobWrapActive: {
    backgroundColor: 'rgba(198,242,78,0.12)',
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 10,
  },

  label: {
    fontFamily: Fonts.medium,
    fontSize: 8,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: Colors.lime,
    fontFamily: Fonts.bold,
  },
  labelPet: {
    fontSize: 7,
    letterSpacing: 0,
  },
  labelPetActive: {
    color: Colors.lime,
  },
});
