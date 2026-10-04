import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
} from 'lucide-react-native';
import { GlassIconButton, GlassChip } from '../../components/ui';
import { useRecipes } from '../../context/RecipeContext';
import { RecipeCard } from '../../components/RecipeCard';
import { FeedSkeletonList } from '../../components/CardSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { useAppRouter } from '../../utils/navigation';
import { useTheme } from '../../theme/ThemeProvider';
import { palette, typography, radii } from '../../theme/tokens';

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
    isLoading,
  } = useRecipes();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(recipes.map((r) => r.category)));
    return ['All', ...unique];
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Category filter
      const matchesCat =
        selectedCategory === 'All' ||
        recipe.category.toLowerCase() === selectedCategory.toLowerCase();

      // Search query filter
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        recipe.name.toLowerCase().includes(query) ||
        recipe.category.toLowerCase().includes(query) ||
        recipe.ingredients.some((ing) => ing.toLowerCase().includes(query));

      // Quick filter
      let matchesQuick = true;
      if (activeQuickFilter === 'quick') {
        matchesQuick = recipe.preparationTime <= 30;
      } else if (activeQuickFilter === 'easy') {
        matchesQuick = recipe.difficulty === 'Easy';
      } else if (activeQuickFilter === 'comfort') {
        matchesQuick =
          recipe.category === 'Dinner' ||
          recipe.category === 'Lunch' ||
          recipe.name.toLowerCase().includes('pasta') ||
          recipe.name.toLowerCase().includes('curry');
      } else if (activeQuickFilter === 'light') {
        matchesQuick =
          recipe.category === 'Salad' ||
          recipe.calories < 450 ||
          recipe.name.toLowerCase().includes('salad') ||
          recipe.name.toLowerCase().includes('bowl');
      }

      return matchesCat && matchesSearch && matchesQuick;
    });
  }, [recipes, selectedCategory, searchQuery, activeQuickFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setActiveQuickFilter('all');
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

          {/* Search Bar */}
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
              placeholder="Search dishes, ingredients, tags..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              clearButtonMode="while-editing"
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
                  onPress={() => setActiveQuickFilter(filter.id)}
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
                  onPress={() => setSelectedCategory(cat)}
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
          <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
          </Text>
        </View>

        {/* Recipe Cards List */}
        {isLoading ? (
          <FeedSkeletonList count={3} />
        ) : (
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RecipeCard recipe={item} onToggleFavorite={toggleFavorite} />
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
  searchBar: {
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
