import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RecipeProvider } from './context/RecipeContext';
import { ThemeProvider } from './theme/ThemeProvider';
import { AppNavigationProvider, useAppPathname } from './utils/navigation';
import { FloatingTabBar } from './components/FloatingTabBar';
import { palette } from './theme/tokens';

// Screen imports for Expo Snack compatibility
import HomeScreen from './app/(tabs)/index';
import ExploreScreen from './app/(tabs)/explore';
import FavoritesScreen from './app/(tabs)/favorites';
import MyFoodScreen from './app/(tabs)/my-food';
import AddRecipeScreen from './app/add-recipe';
import EditRecipeScreen from './app/edit-recipe';
import RecipeDetailScreen from './app/recipe/[id]';
import GlassPreviewScreen from './app/glass-preview';

function SnackScreenRenderer() {
  const pathname = useAppPathname();

  const isTabScreen =
    pathname === '/' ||
    pathname === '/index' ||
    pathname === '/explore' ||
    pathname === '/favorites' ||
    pathname === '/my-food';

  const renderCurrentScreen = () => {
    if (pathname === '/explore') {
      return <ExploreScreen />;
    }
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
    if (pathname === '/glass-preview') {
      return <GlassPreviewScreen />;
    }

    return <HomeScreen />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.forest[900] }}>
      {renderCurrentScreen()}
      {isTabScreen && <FloatingTabBar />}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RecipeProvider>
          <AppNavigationProvider>
            <StatusBar style="light" />
            <SnackScreenRenderer />
          </AppNavigationProvider>
        </RecipeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
