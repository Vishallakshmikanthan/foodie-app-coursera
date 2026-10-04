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
import { PortraitCard } from './PortraitCard';
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
  // Select 5-6 curated dishes for the recommended row
  const recommendedRecipes = useMemo(() => {
    if (!recipes || recipes.length === 0) return [];
    // Prioritize varied dishes: dinner, snack, dessert, salad
    const preferredIds = ['seed-3', 'seed-9', 'seed-10', 'seed-12', 'seed-7', 'seed-13'];
    const curated = preferredIds
      .map((id) => recipes.find((r) => r.id === id))
      .filter((r): r is Recipe => Boolean(r));

    if (curated.length >= 4) {
      return curated;
    }

    return recipes.slice(2, 8);
  }, [recipes]);

  if (recommendedRecipes.length === 0) {
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
        {recommendedRecipes.map((recipe, index) => {
          // Give the first recommended item the "Started" progress indicator to echo the reference yoga app
          const hasProgress = index === 0;

          return (
            <View key={recipe.id} style={styles.cardWrapper}>
              <PortraitCard
                recipe={recipe}
                onToggleFavorite={onToggleFavorite}
                onPress={onPressRecipe}
                hasStartedProgress={hasProgress}
                currentStep={2}
                totalSteps={4}
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
