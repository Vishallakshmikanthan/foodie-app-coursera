import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CookingPot, Sparkles, Filter } from 'lucide-react-native';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { HomeHeader } from '../../components/HomeHeader';
import { HomeMenuModal } from '../../components/HomeMenuModal';
import { HeroCarousel } from '../../components/HeroCarousel';
import { RecommendedRow } from '../../components/RecommendedRow';
import { CategoryTabs } from '../../components/CategoryTabs';
import { RecipeCard } from '../../components/RecipeCard';
import { GlassRefreshControl } from '../../components/GlassRefreshControl';
import { FeedSkeletonList } from '../../components/CardSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { useRecipes } from '../../context/RecipeContext';
import { useAppRouter } from '../../utils/navigation';
import { useTheme } from '../../theme/ThemeProvider';
import { palette, typography } from '../../theme/tokens';
import { Recipe } from '../../types/recipe';

export default function HomeScreen() {
  const router = useAppRouter();
  const { colors, isDark } = useTheme();
  const {
    recipes,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    toggleFavorite,
    favoriteRecipes,
    isLoading,
    refreshData,
  } = useRecipes();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  // Filter recipes based on selected category and active search query
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Category filter: 'All' matches every recipe
      const matchesCategory =
        selectedCategory === 'All' ||
        recipe.category.toLowerCase() === selectedCategory.toLowerCase();

      // Search filter: matches recipe name, category or ingredients
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        recipe.name.toLowerCase().includes(query) ||
        recipe.ingredients.some((ing) => {
          const name = typeof ing === 'string' ? ing : ing.name;
          return name.toLowerCase().includes(query);
        });

      return matchesCategory && matchesSearch;
    });
  }, [recipes, selectedCategory, searchQuery]);

  const handleRecipePress = useCallback(
    (recipe: Recipe) => {
      router.push(`/recipe/${recipe.id}`);
    },
    [router]
  );

  const handleSeeAllRecommended = useCallback(() => {
    router.push('/explore');
  }, [router]);

  const handleFavoritesPress = useCallback(() => {
    router.push('/favorites');
  }, [router]);

  return (
    <View style={styles.rootContainer}>
      {/* Full-bleed Signature Mint-to-Forest Atmosphere Gradient */}
      <GradientBackground preset="mint-to-forest" fullScreen />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <GlassRefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          {/* Top Header Row with Glass Controls & Time-Aware Greeting */}
          <HomeHeader
            userName="Alex"
            favoritesCount={favoriteRecipes.length}
            onPressMenu={() => setIsMenuOpen(true)}
            onPressFavorites={handleFavoritesPress}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearchOpen={isSearchOpen}
            onToggleSearch={() => {
              setIsSearchOpen((prev) => !prev);
              if (isSearchOpen && searchQuery.length > 0) {
                setSearchQuery('');
              }
            }}
          />

          {/* Hero Carousel (Only shown when not deeply searching to avoid competing focus) */}
          {searchQuery.trim().length === 0 && (
            <HeroCarousel
              recipes={recipes}
              onToggleFavorite={toggleFavorite}
              onPressRecipe={handleRecipePress}
            />
          )}

          {/* Recommended For You Section (Shown when no search query is active) */}
          {searchQuery.trim().length === 0 && (
            <RecommendedRow
              recipes={recipes}
              onToggleFavorite={toggleFavorite}
              onPressRecipe={handleRecipePress}
              onPressSeeAll={handleSeeAllRecommended}
            />
          )}

          {/* Text-only Editorial Category Tabs with Sliding Underline */}
          <CategoryTabs
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Feed Header info */}
          <View style={styles.feedInfoRow}>
            <View style={styles.feedTitleContainer}>
              <Text style={styles.feedSectionTitle}>
                {searchQuery.trim().length > 0
                  ? 'Search Results'
                  : selectedCategory === 'All'
                  ? 'Curated Dishes'
                  : `${selectedCategory} Dishes`}
              </Text>
              <View style={styles.feedBadge}>
                <Text style={styles.feedBadgeText}>
                  {filteredRecipes.length}
                </Text>
              </View>
            </View>

            {selectedCategory !== 'All' && (
              <Text
                style={styles.resetFilterText}
                onPress={() => setSelectedCategory('All')}
              >
                Clear filter
              </Text>
            )}
          </View>

          {/* Filtered Recipe Cards List */}
          {isLoading ? (
            <FeedSkeletonList count={3} />
          ) : filteredRecipes.length > 0 ? (
            <View style={styles.cardsFeed}>
              {filteredRecipes.map((item, index) => (
                <RecipeCard
                  key={item.id}
                  recipe={item}
                  index={index}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <EmptyState
                icon={<CookingPot size={36} color={palette.mint[300]} />}
                title="No recipes found"
                description={
                  searchQuery.trim().length > 0
                    ? `No culinary matches found for "${searchQuery}". Try different keywords or reset filter.`
                    : `No recipes found in the ${selectedCategory} category yet.`
                }
                actionText="Reset Filters"
                onAction={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Side Menu Drawer / Modal */}
      <HomeMenuModal
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userName="Alex"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: palette.forest[900],
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    // Generous bottom padding so floating glass tab bar doesn't overlap any recipe
    paddingBottom: 125,
  },
  feedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 14,
  },
  feedTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedSectionTitle: {
    fontFamily: typography.families.bold,
    fontSize: 19,
    color: palette.text.onDark,
    letterSpacing: -0.3,
  },
  feedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  feedBadgeText: {
    fontFamily: typography.families.bold,
    fontSize: 12,
    color: palette.mint[300],
  },
  resetFilterText: {
    fontFamily: typography.families.semiBold,
    fontSize: 13,
    color: palette.peach[300],
    paddingVertical: 4,
    paddingLeft: 8,
  },
  cardsFeed: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: typography.families.medium,
    color: palette.text.onDarkSecondary,
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
});
