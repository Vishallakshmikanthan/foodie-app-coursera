import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { RecipeProvider } from '../context/RecipeContext';
import { ThemeProvider } from '../theme/ThemeProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { palette } from '../theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <RecipeProvider>
            <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.forest[900] },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="add-recipe" options={{ headerShown: false }} />
            <Stack.Screen name="edit-recipe" options={{ headerShown: false }} />
            <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="cook/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="glass-preview" options={{ headerShown: false }} />
          </Stack>
        </RecipeProvider>
      </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

