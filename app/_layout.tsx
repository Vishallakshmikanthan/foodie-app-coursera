import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RecipeProvider } from '../context/RecipeContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RecipeProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFFFFF' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="my-food" />
          <Stack.Screen name="add-recipe" />
          <Stack.Screen name="edit-recipe" />
          <Stack.Screen name="recipe/[id]" />
        </Stack>
      </RecipeProvider>
    </SafeAreaProvider>
  );
}
