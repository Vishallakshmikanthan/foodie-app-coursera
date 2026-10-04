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
} from 'lucide-react-native';
import { GlassSurface } from '../../components/ui';
import { useRecipes } from '../../context/RecipeContext';
import { RecipeCard } from '../../components/RecipeCard';
import { FeedSkeletonList } from '../../components/CardSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { confirmAction } from '../../utils/recipeUtils';
import { Recipe } from '../../types/recipe';
import { useAppRouter } from '../../utils/navigation';
import { useTheme } from '../../theme/ThemeProvider';
import { palette, typography } from '../../theme/tokens';
import { haptics } from '../../utils/haptics';

export default function MyFoodScreen() {
  const router = useAppRouter();
  const { colors, isDark } = useTheme();
  const { userRecipes, toggleFavorite, deleteRecipe, isLoading } = useRecipes();

  const showBackButton = router.canGoBack();

  const handleEdit = (recipe: Recipe) => {
    router.push({
      pathname: '/edit-recipe',
      params: { id: recipe.id },
    });
  };

  const handleDelete = (id: string) => {
    haptics.destructive();
    confirmAction({
      title: 'Delete Recipe',
      message: 'Are you sure you want to delete this recipe? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        haptics.destructive();
        await deleteRecipe(id);
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.borderSubtle,
            },
          ]}
        >
          {showBackButton && (
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={[
                styles.backButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : palette.gray[100],
                  borderColor: colors.borderSubtle,
                },
              ]}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
          )}

          <View style={[styles.headerTitleContainer, !showBackButton && { paddingLeft: 4 }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Food</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Personal Recipe Management
            </Text>
          </View>

          <View style={styles.headerRightAction}>
            <View
              style={[
                styles.counterBadge,
                { backgroundColor: colors.chipBackground },
              ]}
            >
              <Text style={[styles.counterBadgeText, { color: colors.textSecondary }]}>
                {userRecipes.length} {userRecipes.length === 1 ? 'recipe' : 'recipes'}
              </Text>
            </View>
          </View>
        </View>

        {/* FlatList with Add New Recipe Card as ListHeaderComponent */}
        <FlatList
          data={userRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <RecipeCard
              recipe={item}
              index={index}
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
              {/* + Add New Recipe Banner Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/add-recipe')}
                style={[
                  styles.addRecipeCard,
                  {
                    backgroundColor: isDark ? 'rgba(240, 183, 159, 0.12)' : palette.peach[50],
                    borderColor: isDark ? 'rgba(240, 183, 159, 0.35)' : palette.peach[500],
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Add New Recipe"
              >
                <View
                  style={[
                    styles.addIconCircle,
                    { backgroundColor: colors.primary, shadowColor: colors.primary },
                  ]}
                >
                  <Plus size={24} color={palette.white} strokeWidth={2.5} />
                </View>
                <View style={styles.addCardTextContainer}>
                  <Text
                    style={[
                      styles.addCardTitle,
                      { color: isDark ? palette.peach[200] : palette.peach[700] },
                    ]}
                  >
                    + Add New Recipe
                  </Text>
                  <Text
                    style={[
                      styles.addCardSubtitle,
                      { color: isDark ? palette.peach[300] : palette.peach[800] },
                    ]}
                  >
                    Share your custom secret ingredients and culinary creations
                  </Text>
                </View>
              </TouchableOpacity>

              {/* My Recipes Section Header */}
              <View style={styles.sectionHeadingRow}>
                <View style={styles.sectionTitleRow}>
                  <ChefHat size={20} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>My Recipes</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <FeedSkeletonList count={2} />
            ) : (
              <EmptyState
                icon={<ChefHat size={36} color={colors.primary} />}
                title="No personal recipes yet"
                description="You haven't created any recipes yet. Tap the '+ Add New Recipe' button above to create your first delicious masterpiece!"
                actionText="+ Create Your First Recipe"
                onAction={() => router.push('/add-recipe')}
              />
            )
          }
        />

        {/* Floating Glass '+' FAB Button (Per M2 specification) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/add-recipe')}
          style={styles.floatingFabWrapper}
          accessibilityRole="button"
          accessibilityLabel="Add Recipe Floating Button"
        >
          <GlassSurface
            variant="coral"
            intensity={50}
            borderRadius={28}
            borderWidth={1.5}
            style={styles.floatingFab}
          >
            <Plus size={24} color={palette.white} strokeWidth={2.8} />
          </GlassSurface>
        </TouchableOpacity>
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
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: typography.families.bold,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: typography.families.medium,
    marginTop: 2,
  },
  headerRightAction: {
    alignItems: 'flex-end',
  },
  listContent: {
    padding: 16,
    paddingBottom: 130,
  },
  listHeader: {
    marginBottom: 16,
  },
  addRecipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
    fontFamily: typography.families.extraBold,
    marginBottom: 3,
  },
  addCardSubtitle: {
    fontSize: 12,
    fontFamily: typography.families.regular,
    lineHeight: 16,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.families.bold,
  },
  counterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterBadgeText: {
    fontSize: 12,
    fontFamily: typography.families.semiBold,
  },
  floatingFabWrapper: {
    position: 'absolute',
    right: 20,
    bottom: 96,
    zIndex: 99,
  },
  floatingFab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.coral[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
});
