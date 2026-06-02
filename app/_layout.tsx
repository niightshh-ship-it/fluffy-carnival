import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Platform, View, StyleSheet } from 'react-native';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
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

  const navigator = (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );

  if (isWeb) {
    return (
      <View style={styles.webOuter}>
        <StatusBar style="light" />
        <View style={styles.webPhone}>{navigator}</View>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.background} />
      {navigator}
    </>
  );
}

const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    backgroundColor: '#060709',
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
