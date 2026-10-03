import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RecipeProvider } from './context/RecipeContext';
import { AppNavigationProvider, useAppPathname } from './utils/navigation';

// Screen imports for Expo Snack compatibility
import HomeScreen from './app/index';
import FavoritesScreen from './app/favorites';
import MyFoodScreen from './app/my-food';
import AddRecipeScreen from './app/add-recipe';
import EditRecipeScreen from './app/edit-recipe';
import RecipeDetailScreen from './app/recipe/[id]';

function SnackScreenRenderer() {
  const pathname = useAppPathname();

  if (pathname === '/favorites') {
    return <FavoritesScreen />;
  }
  if (pathname === '/my-food') {
    return <MyFoodScreen />;
  }
  if (pathname === '/add-recipe') {
    return <AddRecipeScreen />;
  }
  if (pathname === '/edit-recipe') {
    return <EditRecipeScreen />;
  }
  if (pathname === '/recipe' || pathname.startsWith('/recipe/')) {
    return <RecipeDetailScreen />;
  }

  return <HomeScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <RecipeProvider>
        <AppNavigationProvider>
          <StatusBar style="dark" />
          <SnackScreenRenderer />
        </AppNavigationProvider>
      </RecipeProvider>
    </SafeAreaProvider>
  );
}
