import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import { Recipe } from '../types/recipe';
import { useRecipes } from '../context/RecipeContext';
import { useUserProfile } from '../context/UserProfileContext';
import { PortraitCard } from './PortraitCard';
import { getSmartRecommendations } from '../utils/recommendationEngine';
import { palette, typography } from '../theme/tokens';

export interface RecommendedRowProps {
  recipes: Recipe[];
  onToggleFavorite: (id: string) => void;
  onPressRecipe: (recipe: Recipe) => void;
  onPressSeeAll: () => void;
}

export const RecommendedRow: React.FC<RecommendedRowProps> = ({
  recipes,
  onToggleFavorite,
  onPressRecipe,
  onPressSeeAll,
}) => {
  const { cookingProgress, favoriteRecipes, recentlyViewed } = useRecipes();
  const { profile } = useUserProfile();

  // Smart recommendations scored by time-of-day, user profile preferences, favorites, and view history
  const recommendedItems = useMemo(() => {
    return getSmartRecommendations(recipes, favoriteRecipes, recentlyViewed, 8, profile);
  }, [recipes, favoriteRecipes, recentlyViewed, profile]);

  if (recommendedItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
        </View>

        <TouchableOpacity
          onPress={onPressSeeAll}
          activeOpacity={0.7}
          style={styles.seeAllButton}
          accessibilityRole="button"
          accessibilityLabel="See all recommended recipes"
        >
          <Text style={styles.seeAllText}>See all</Text>
          <ChevronRight size={15} color={palette.peach[300]} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Cards Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recommendedItems.map(({ recipe, reason }) => {
          const recipeProgress = cookingProgress[recipe.id];
          const hasRealProgress =
            recipeProgress &&
            recipeProgress.currentStep > 0 &&
            recipeProgress.currentStep <= recipe.instructions.length;

          return (
            <View key={recipe.id} style={styles.cardWrapper}>
              <PortraitCard
                recipe={recipe}
                onToggleFavorite={onToggleFavorite}
                onPress={onPressRecipe}
                hasStartedProgress={Boolean(hasRealProgress)}
                currentStep={recipeProgress?.currentStep}
                totalSteps={recipe.instructions.length}
                subtitle={reason}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: typography.families.bold,
    fontSize: 19,
    color: palette.text.onDark,
    letterSpacing: -0.3,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingLeft: 8,
  },
  seeAllText: {
    fontFamily: typography.families.semiBold,
    fontSize: 13,
    color: palette.peach[300],
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  cardWrapper: {
    // Spacer handled by gap
  },
});

export default RecommendedRow;
