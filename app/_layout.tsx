import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Platform, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { SmearBackground } from '@/components/SmearBackground';
import { Colors } from '@/constants/tokens';

SplashScreen.preventAutoHideAsync();

const isWeb = Platform.OS === 'web';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  // Transparent navigator so the smeared-creature background shows through
  const scene = (
    <View style={styles.scene}>
      <SmearBackground />
      <View style={styles.navLayer}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      {isWeb ? (
        <View style={styles.webOuter}>
          <View style={styles.webPhone}>{scene}</View>
        </View>
      ) : (
        scene
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1, backgroundColor: Colors.background },
  navLayer: { ...StyleSheet.absoluteFillObject },
  webOuter: {
    flex: 1,
    backgroundColor: '#050507',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webPhone: {
    width: 390,
    // @ts-ignore — web-only CSS property
    height: '100vh',
    maxHeight: 844,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
});
