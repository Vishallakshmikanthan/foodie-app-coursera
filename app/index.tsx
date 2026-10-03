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
import { useRecipes } from '../context/RecipeContext';
import { CategoryBar } from '../components/CategoryBar';
import { RecipeCard } from '../components/RecipeCard';
import { EmptyState } from '../components/EmptyState';
import { BottomNav } from '../components/BottomNav';
import { useAppRouter } from '../utils/navigation';

export default function HomeScreen() {
  const router = useAppRouter();
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Top Header Section */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <CookingPot size={22} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View style={styles.brandTextContainer}>
              <Text style={styles.brandName}>Foodie</Text>
              <Text style={styles.greetingText}>Delicious meals made simple</Text>
            </View>

            {/* Quick Header Actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => router.push('/favorites')}
                activeOpacity={0.7}
                style={styles.headerIconButton}
                accessibilityLabel="Go to Favorites"
              >
                <Heart size={20} color="#E53935" fill={favoriteRecipes.length > 0 ? '#E53935' : 'transparent'} />
                {favoriteRecipes.length > 0 && (
                  <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>
                      {favoriteRecipes.length > 99 ? '99+' : favoriteRecipes.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/my-food')}
                activeOpacity={0.7}
                style={styles.headerIconButton}
                accessibilityLabel="Go to My Food"
              >
                <ChefHat size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Welcoming Message & Subheader */}
          <Text style={styles.welcomeTitle}>What would you like to cook today? ✨</Text>

          {/* Search Field */}
          <View style={styles.searchBar}>
            <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search recipes, ingredients, tags..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={16} color="#6B7280" />
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
          <Text style={styles.feedTitle}>
            {selectedCategory === 'All' ? 'All Recipes' : `${selectedCategory} Recipes`}
          </Text>
          <Text style={styles.feedCount}>
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
          </Text>
        </View>

        {/* Recipe Feed List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Loading fresh recipes...</Text>
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
                icon={<CookingPot size={32} color="#9CA3AF" />}
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
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#FF6B35',
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
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  greetingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginVertical: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
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
    fontWeight: '700',
    color: '#1F2937',
  },
  feedCount: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
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
    color: '#6B7280',
    fontWeight: '500',
  },
});
