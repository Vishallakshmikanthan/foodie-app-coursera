import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  X,
  Heart,
  ChefHat,
  CookingPot,
  Sparkles,
} from 'lucide-react-native';
import { GlassIconButton } from '../components/ui';
import { useRecipes } from '../context/RecipeContext';
import { CategoryBar } from '../components/CategoryBar';
import { RecipeCard } from '../components/RecipeCard';
import { EmptyState } from '../components/EmptyState';
import { BottomNav } from '../components/BottomNav';
import { useAppRouter } from '../utils/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { palette, typography } from '../theme/tokens';

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
  } = useRecipes();

  // Filter recipes based on selected category and search query
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Category filter: 'All' matches all recipes
      const matchesCategory =
        selectedCategory === 'All' ||
        recipe.category.toLowerCase() === selectedCategory.toLowerCase();

      // Search filter: matches recipe name or any ingredient
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        recipe.name.toLowerCase().includes(query) ||
        recipe.category.toLowerCase().includes(query) ||
        recipe.ingredients.some((ing) => ing.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [recipes, selectedCategory, searchQuery]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top Header Section */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={styles.brandRow}>
            <View style={[styles.logoBadge, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
              <CookingPot size={22} color={palette.white} strokeWidth={2.5} />
            </View>
            <View style={styles.brandTextContainer}>
              <Text style={[styles.brandName, { color: colors.text }]}>Foodie</Text>
              <Text style={[styles.greetingText, { color: colors.textSecondary }]}>
                Delicious meals made simple
              </Text>
            </View>

            {/* Quick Header Actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => router.push('/favorites')}
                activeOpacity={0.7}
                style={[
                  styles.headerIconButton,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : palette.gray[100],
                    borderColor: colors.borderSubtle,
                  },
                ]}
                accessibilityLabel="Go to Favorites"
              >
                <Heart
                  size={20}
                  color={colors.favoriteActive}
                  fill={favoriteRecipes.length > 0 ? colors.favoriteActive : palette.transparent}
                />
                {favoriteRecipes.length > 0 && (
                  <View style={[styles.headerBadge, { backgroundColor: colors.error }]}>
                    <Text style={styles.headerBadgeText}>
                      {favoriteRecipes.length > 99 ? '99+' : favoriteRecipes.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/my-food')}
                activeOpacity={0.7}
                style={[
                  styles.headerIconButton,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : palette.gray[100],
                    borderColor: colors.borderSubtle,
                  },
                ]}
                accessibilityLabel="Go to My Food"
              >
                <ChefHat size={20} color={colors.primary} />
              </TouchableOpacity>

              <GlassIconButton
                icon={Sparkles}
                size={38}
                iconSize={18}
                variant="mint"
                onPress={() => router.push('/glass-preview')}
                accessibilityLabel="Glass UI Kit Preview"
                accessibilityHint="Opens the Phase 2 Glass UI Kit preview screen"
              />
            </View>
          </View>

          {/* Welcoming Message & Subheader */}
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            What would you like to cook today? ✨
          </Text>

          {/* Search Field */}
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
              placeholder="Search recipes, ingredients, tags..."
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
        </View>

        {/* Horizontal Category Bar */}
        <CategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Recipe Feed Header */}
        <View style={styles.feedInfoBar}>
          <Text style={[styles.feedTitle, { color: colors.text }]}>
            {selectedCategory === 'All' ? 'All Recipes' : `${selectedCategory} Recipes`}
          </Text>
          <Text style={[styles.feedCount, { color: colors.textSecondary }]}>
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
          </Text>
        </View>

        {/* Recipe Feed List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading fresh recipes...
            </Text>
          </View>
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
                title="No recipes found"
                description={
                  searchQuery.trim().length > 0
                    ? `No recipes match "${searchQuery}". Try a different search term or reset filters.`
                    : `No recipes found in ${selectedCategory} category.`
                }
                actionText="Reset Filter"
                onAction={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              />
            }
          />
        )}

        {/* Persistent Bottom Navigation */}
        <BottomNav />
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
    paddingBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  brandTextContainer: {
    flex: 1,
  },
  brandName: {
    fontSize: 22,
    fontFamily: typography.families.bold,
    letterSpacing: -0.5,
  },
  greetingText: {
    fontSize: 12,
    fontFamily: typography.families.medium,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
  },
  headerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  headerBadgeText: {
    color: palette.white,
    fontSize: 9,
    fontFamily: typography.families.bold,
  },
  welcomeTitle: {
    fontSize: 16,
    fontFamily: typography.families.bold,
    marginVertical: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 6,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.families.regular,
    padding: 0,
  },
  feedInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  feedTitle: {
    fontSize: 17,
    fontFamily: typography.families.bold,
  },
  feedCount: {
    fontSize: 13,
    fontFamily: typography.families.medium,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: typography.families.medium,
  },
});
