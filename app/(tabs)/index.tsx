import { CookingPot, SlidersHorizontal } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeedSkeletonList } from '../../components/CardSkeleton';
import { CategoryTabs } from '../../components/CategoryTabs';
import { ContinueCookingRow } from '../../components/ContinueCookingRow';
import { EmptyState } from '../../components/EmptyState';
import { FiltersModal, countActiveFilters, filterRecipesByOptions } from '../../components/FiltersModal';
import { GlassRefreshControl } from '../../components/GlassRefreshControl';
import { HeroCarousel } from '../../components/HeroCarousel';
import { HomeHeader } from '../../components/HomeHeader';
import { HomeMenuModal } from '../../components/HomeMenuModal';
import { RecipeCard } from '../../components/RecipeCard';
import { RecommendedRow } from '../../components/RecommendedRow';
import { SearchSuggestions } from '../../components/SearchSuggestions';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { useRecipes } from '../../context/RecipeContext';
import { useTheme } from '../../theme/ThemeProvider';
import { palette, typography, radii } from '../../theme/tokens';
import { Recipe } from '../../types/recipe';
import { RecipeFilterOptions } from '../../types/smart';
import { useAppRouter } from '../../utils/navigation';
import { haptics } from '../../utils/haptics';

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
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    isLoading,
    refreshData,
  } = useRecipes();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterOptions, setFilterOptions] = useState<RecipeFilterOptions>({
    difficulty: 'All',
    diet: 'All',
  });

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  const activeFiltersCount = useMemo(() => {
    return countActiveFilters(filterOptions);
  }, [filterOptions]);

  // Filter recipes based on selected category, active search query, and smart filter options
  const filteredRecipes = useMemo(() => {
    return filterRecipesByOptions(
      recipes,
      { ...filterOptions, category: selectedCategory },
      searchQuery
    );
  }, [recipes, filterOptions, selectedCategory, searchQuery]);

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
            userName="Vishal"
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

          {/* Search Suggestions (Recent Searches + Ingredient Chips) */}
          {isSearchOpen && (
            <SearchSuggestions
              recentSearches={recentSearches}
              onSelectQuery={(q) => {
                setSearchQuery(q);
                addRecentSearch(q);
              }}
              onClearRecentSearches={clearRecentSearches}
              style={{ marginHorizontal: 20 }}
            />
          )}

          {/* Hero Carousel (Only shown when not searching to avoid competing focus) */}
          {searchQuery.trim().length === 0 && (
            <HeroCarousel
              recipes={recipes}
              onToggleFavorite={toggleFavorite}
              onPressRecipe={handleRecipePress}
            />
          )}

          {/* Continue Cooking Row (Shown when returning user has active progress) */}
          {searchQuery.trim().length === 0 && (
            <ContinueCookingRow onPressRecipe={handleRecipePress} />
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

          {/* Feed Header info with Smart Filter Button */}
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

            <View style={styles.feedActionsRow}>
              {/* Glass Filter Button with Active Count Badge */}
              <TouchableOpacity
                onPress={() => {
                  haptics.buttonPress();
                  setIsFilterModalOpen(true);
                }}
                activeOpacity={0.75}
                style={[
                  styles.filterBtn,
                  activeFiltersCount > 0 && styles.filterBtnActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Open filters"
              >
                <SlidersHorizontal
                  size={13}
                  color={activeFiltersCount > 0 ? palette.forest[900] : palette.mint[300]}
                />
                <Text
                  style={[
                    styles.filterBtnText,
                    activeFiltersCount > 0 && styles.filterBtnTextActive,
                  ]}
                >
                  Filter
                </Text>
                {activeFiltersCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {(selectedCategory !== 'All' || activeFiltersCount > 0) && (
                <Text
                  style={styles.resetFilterText}
                  onPress={() => {
                    setSelectedCategory('All');
                    setFilterOptions({ difficulty: 'All', diet: 'All' });
                  }}
                >
                  Reset
                </Text>
              )}
            </View>
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
                    : 'No recipes match your active filter combination.'
                }
                actionText="Reset All Filters"
                onAction={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setFilterOptions({ difficulty: 'All', diet: 'All' });
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
        userName="Vishal"
      />

      {/* Smart Filters Bottom Sheet Modal */}
      <FiltersModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        options={filterOptions}
        onChangeOptions={setFilterOptions}
        recipes={recipes}
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
  feedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  filterBtnActive: {
    backgroundColor: palette.mint[300],
    borderColor: palette.mint[300],
  },
  filterBtnText: {
    fontFamily: typography.families.semiBold,
    fontSize: 12,
    color: palette.mint[300],
  },
  filterBtnTextActive: {
    color: palette.forest[900],
  },
  filterBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.coral[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontFamily: typography.families.bold,
    fontSize: 9.5,
    color: palette.white,
  },
  resetFilterText: {
    fontFamily: typography.families.semiBold,
    fontSize: 12.5,
    color: palette.peach[300],
    paddingVertical: 4,
    paddingLeft: 4,
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
