import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { Colors, Fonts, FontSize } from '@/constants/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  name: IconName;
  activeName: IconName;
  color: string;
  focused: boolean;
  size: number;
}

function TabIcon({ name, activeName, color, focused, size }: TabIconProps) {
  return (
    <View style={focused ? styles.iconActive : undefined}>
      {focused && <View style={[styles.glow, { backgroundColor: Colors.limeGlow }]} />}
      <Ionicons name={focused ? activeName : name} size={size} color={color} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.lime,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface1,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.medium,
          fontSize: FontSize.xs,
          letterSpacing: 0.5,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dvizh"
        options={{
          title: 'ДВИЖ',
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon name="flash-outline" activeName="flash" color={color} focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'ЛЕНТА',
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon name="grid-outline" activeName="grid" color={color} focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="pet"
        options={{
          title: 'ЖОРИК',
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon name="heart-outline" activeName="heart" color={color} focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'ВЫЗОВЫ',
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon name="trophy-outline" activeName="trophy" color={color} focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'ПРОФИЛЬ',
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon name="person-outline" activeName="person" color={color} focused={focused} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconActive: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    opacity: 0.7,
  },
});
