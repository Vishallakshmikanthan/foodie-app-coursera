import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  ChefHat,
  Sparkles,
} from 'lucide-react-native';
import { useRecipes } from '../context/RecipeContext';
import { RecipeCard } from '../components/RecipeCard';
import { EmptyState } from '../components/EmptyState';
import { BottomNav } from '../components/BottomNav';
import { confirmAction } from '../utils/recipeUtils';
import { Recipe } from '../types/recipe';
import { useAppRouter } from '../utils/navigation';

export default function MyFoodScreen() {
  const router = useAppRouter();
  const { userRecipes, toggleFavorite, deleteRecipe } = useRecipes();

  const handleEdit = (recipe: Recipe) => {
    router.push({
      pathname: '/edit-recipe',
      params: { id: recipe.id },
    });
  };

  const handleDelete = (id: string) => {
    confirmAction({
      title: 'Delete Recipe',
      message: 'Are you sure you want to delete this recipe? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await deleteRecipe(id);
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            activeOpacity={0.7}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color="#1F2937" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>My Food</Text>
            <Text style={styles.headerSubtitle}>Personal Recipe Management</Text>
          </View>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* FlatList with Add New Recipe Card as ListHeaderComponent */}
        <FlatList
          data={userRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onToggleFavorite={toggleFavorite}
              showManageActions={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {/* + Add New Recipe Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/add-recipe')}
                style={styles.addRecipeCard}
                accessibilityRole="button"
                accessibilityLabel="Add New Recipe"
              >
                <View style={styles.addIconCircle}>
                  <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <View style={styles.addCardTextContainer}>
                  <Text style={styles.addCardTitle}>+ Add New Recipe</Text>
                  <Text style={styles.addCardSubtitle}>
                    Share your custom secret ingredients and culinary creations
                  </Text>
                </View>
              </TouchableOpacity>

              {/* My Recipes Section Header */}
              <View style={styles.sectionHeadingRow}>
                <View style={styles.sectionTitleRow}>
                  <ChefHat size={20} color="#FF6B35" />
                  <Text style={styles.sectionTitle}>My Recipes</Text>
                </View>
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeText}>
                    {userRecipes.length} {userRecipes.length === 1 ? 'recipe' : 'recipes'}
                  </Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon={<ChefHat size={36} color="#FF6B35" />}
              title="No personal recipes yet"
              description="You haven't created any recipes yet. Tap the '+ Add New Recipe' button above to create your first delicious masterpiece!"
              actionText="+ Create Your First Recipe"
              onAction={() => router.push('/add-recipe')}
            />
          }
        />

        {/* Bottom Navigation */}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  listHeader: {
    marginBottom: 16,
  },
  addRecipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  addIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addCardTextContainer: {
    flex: 1,
  },
  addCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#C2410C',
    marginBottom: 3,
  },
  addCardSubtitle: {
    fontSize: 12,
    color: '#9A3412',
    lineHeight: 16,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  counterBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
});
