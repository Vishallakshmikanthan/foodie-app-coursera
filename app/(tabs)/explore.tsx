import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  X,
  Plus,
  Compass,
  Clock,
  Sparkles,
  CookingPot,
  SlidersHorizontal,
} from 'lucide-react-native';
import { GlassIconButton, GlassChip } from '../../components/ui';
import { useRecipes } from '../../context/RecipeContext';
import { RecipeCard } from '../../components/RecipeCard';
import { FeedSkeletonList } from '../../components/CardSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { FiltersModal, countActiveFilters, filterRecipesByOptions } from '../../components/FiltersModal';
import { SearchSuggestions } from '../../components/SearchSuggestions';
import { useAppRouter } from '../../utils/navigation';
import { useTheme } from '../../theme/ThemeProvider';
import { palette, typography, radii } from '../../theme/tokens';
import { RecipeFilterOptions } from '../../types/smart';
import { haptics } from '../../utils/haptics';

const QUICK_FILTERS = [
  { id: 'all', label: 'All Dishes' },
  { id: 'quick', label: '⚡ Under 30 min' },
  { id: 'easy', label: '🌱 Easy Prep' },
  { id: 'comfort', label: '🍲 Comfort Food' },
  { id: 'light', label: '🥗 Fresh & Healthy' },
];

export default function ExploreScreen() {
  const router = useAppRouter();
  const { colors, isDark } = useTheme();
  const {
    recipes,
    selectedCategory,
    setSelectedCategory,
    toggleFavorite,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    isLoading,
  } = useRecipes();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<RecipeFilterOptions>({
    difficulty: 'All',
    diet: 'All',
  });

  const categories = useMemo(() => {
    const unique = Array.from(new Set(recipes.map((r) => r.category)));
    return ['All', ...unique];
  }, [recipes]);

  const activeFiltersCount = useMemo(() => {
    return countActiveFilters(filterOptions);
  }, [filterOptions]);

  const filteredRecipes = useMemo(() => {
    // 1. Base filter via multi-faceted filter options & search query
    const baseFiltered = filterRecipesByOptions(
      recipes,
      { ...filterOptions, category: selectedCategory },
      searchQuery
    );

    // 2. Apply quick filters
    if (activeQuickFilter === 'all') return baseFiltered;

    return baseFiltered.filter((recipe) => {
      if (activeQuickFilter === 'quick') {
        return recipe.preparationTime <= 30;
      }
      if (activeQuickFilter === 'easy') {
        return recipe.difficulty === 'Easy';
      }
      if (activeQuickFilter === 'comfort') {
        return (
          recipe.category === 'Dinner' ||
          recipe.category === 'Lunch' ||
          recipe.name.toLowerCase().includes('pasta') ||
          recipe.name.toLowerCase().includes('curry')
        );
      }
      if (activeQuickFilter === 'light') {
        return (
          recipe.category === 'Salad' ||
          recipe.calories < 450 ||
          recipe.name.toLowerCase().includes('salad') ||
          recipe.name.toLowerCase().includes('bowl')
        );
      }
      return true;
    });
  }, [recipes, filterOptions, selectedCategory, searchQuery, activeQuickFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setActiveQuickFilter('all');
    setFilterOptions({ difficulty: 'All', diet: 'All' });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.titleIconBadge}>
              <Compass size={22} color={colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Explore</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Discover culinary inspiration
              </Text>
            </View>

            <GlassIconButton
              icon={Plus}
              size={38}
              iconSize={18}
              variant="peach"
              onPress={() => router.push('/add-recipe')}
              accessibilityLabel="Add New Recipe"
              accessibilityHint="Create your own custom recipe"
            />
          </View>

          {/* Search Bar + Filter Button Row */}
          <View style={styles.searchRow}>
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => {
                  if (searchQuery.trim()) {
                    addRecentSearch(searchQuery.trim());
                  }
                }}
                placeholder="Search dishes, ingredients, tags..."
                placeholderTextColor={colors.textMuted}
                style={[styles.searchInput, { color: colors.text }]}
                clearButtonMode="while-editing"
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => {
                haptics.buttonPress();
                setIsFilterModalOpen(true);
              }}
              activeOpacity={0.75}
              style={[
                styles.filterIconButton,
                activeFiltersCount > 0 && styles.filterIconButtonActive,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Open filter sheet"
            >
              <SlidersHorizontal
                size={18}
                color={activeFiltersCount > 0 ? palette.forest[900] : palette.mint[300]}
              />
              {activeFiltersCount > 0 && (
                <View style={styles.filterDotBadge}>
                  <Text style={styles.filterDotBadgeText}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Suggestions (Recent Searches + Ingredient Chips) */}
          <SearchSuggestions
            recentSearches={recentSearches}
            onSelectQuery={(q) => {
              setSearchQuery(q);
              addRecentSearch(q);
            }}
            onClearRecentSearches={clearRecentSearches}
          />

          {/* Quick Filter Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickFiltersContainer}
            style={styles.quickFiltersScrollView}
          >
            {QUICK_FILTERS.map((filter) => {
              const isSelected = activeQuickFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  onPress={() => {
                    haptics.tabChange();
                    setActiveQuickFilter(filter.id);
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.quickFilterChip,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : palette.gray[100],
                      borderColor: isSelected
                        ? colors.primary
                        : isDark
                        ? 'rgba(255, 255, 255, 0.12)'
                        : palette.gray[200],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.quickFilterText,
                      {
                        color: isSelected
                          ? palette.white
                          : isDark
                          ? colors.textSecondary
                          : palette.gray[700],
                        fontFamily: isSelected
                          ? typography.families.bold
                          : typography.families.medium,
                      },
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Category Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
            style={styles.categoriesScrollView}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    haptics.tabChange();
                    setSelectedCategory(cat);
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(195, 235, 197, 0.18)'
                          : palette.mint[100]
                        : 'transparent',
                      borderColor: isSelected
                        ? palette.mint[300]
                        : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      {
                        color: isSelected
                          ? isDark
                            ? palette.mint[300]
                            : palette.forest[900]
                          : colors.textMuted,
                        fontFamily: isSelected
                          ? typography.families.bold
                          : typography.families.medium,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Results Bar */}
        <View style={styles.resultsBar}>
          <Text style={[styles.resultsTitle, { color: colors.text }]}>
            {selectedCategory === 'All' ? 'All Discoveries' : `${selectedCategory}`}
          </Text>
          <View style={styles.resultsRightRow}>
            {activeFiltersCount > 0 && (
              <TouchableOpacity
                onPress={handleResetFilters}
                activeOpacity={0.7}
                style={styles.clearFiltersChip}
              >
                <Text style={styles.clearFiltersChipText}>
                  Reset ({activeFiltersCount})
                </Text>
              </TouchableOpacity>
            )}
            <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
              {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
            </Text>
          </View>
        </View>

        {/* Recipe Cards List */}
        {isLoading ? (
          <FeedSkeletonList count={3} />
        ) : (
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.id}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}
            removeClippedSubviews={Platform.OS !== 'web'}
            renderItem={({ item, index }) => (
              <RecipeCard recipe={item} index={index} onToggleFavorite={toggleFavorite} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                icon={<CookingPot size={32} color={colors.textMuted} />}
                title="No matching recipes found"
                description={
                  searchQuery.trim().length > 0
                    ? `No recipes match "${searchQuery}". Try a different keyword or reset active filters.`
                    : 'No recipes found for the selected filter combination.'
                }
                actionText="Reset All Filters"
                onAction={handleResetFilters}
              />
            }
          />
        )}

        {/* Smart Filters Bottom Sheet Modal */}
        <FiltersModal
          visible={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          options={filterOptions}
          onChangeOptions={setFilterOptions}
          recipes={recipes}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: typography.families.bold,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: typography.families.medium,
    marginTop: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.families.regular,
    padding: 0,
  },
  filterIconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterIconButtonActive: {
    backgroundColor: palette.mint[300],
    borderColor: palette.mint[300],
  },
  filterDotBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.coral[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterDotBadgeText: {
    fontFamily: typography.families.bold,
    fontSize: 9.5,
    color: palette.white,
  },
  resultsRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearFiltersChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(240, 183, 159, 0.15)',
    borderWidth: 1,
    borderColor: palette.peach[300],
  },
  clearFiltersChipText: {
    fontFamily: typography.families.semiBold,
    fontSize: 11,
    color: palette.peach[300],
  },
  quickFiltersScrollView: {
    marginTop: 10,
  },
  quickFiltersContainer: {
    gap: 8,
    paddingRight: 16,
  },
  quickFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  quickFilterText: {
    fontSize: 12,
  },
  categoriesScrollView: {
    marginTop: 8,
    marginBottom: 4,
  },
  categoriesContainer: {
    gap: 6,
    paddingRight: 16,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontFamily: typography.families.bold,
  },
  resultsCount: {
    fontSize: 13,
    fontFamily: typography.families.medium,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
});
