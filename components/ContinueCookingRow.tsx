import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Play, Sparkles, X, ChevronRight, Clock, ChefHat } from 'lucide-react-native';
import { GlassSurface } from './ui/GlassSurface';
import { Recipe, CookingProgress } from '../types/recipe';
import { useRecipes } from '../context/RecipeContext';
import { useAppRouter } from '../utils/navigation';
import { palette, typography, radii } from '../theme/tokens';
import { haptics } from '../utils/haptics';

export interface ContinueCookingRowProps {
  onPressRecipe?: (recipe: Recipe) => void;
}

export const ContinueCookingRow: React.FC<ContinueCookingRowProps> = ({ onPressRecipe }) => {
  const router = useAppRouter();
  const { recipes, cookingProgress, clearCookingProgress } = useRecipes();

  // Find all active recipes with saved progress
  const activeItems = React.useMemo(() => {
    const list: { recipe: Recipe; progress: CookingProgress }[] = [];

    for (const [recipeId, progress] of Object.entries(cookingProgress)) {
      const recipe = recipes.find((r) => r.id === recipeId);
      if (recipe && progress.currentStep >= 1 && progress.currentStep <= recipe.instructions.length) {
        list.push({ recipe, progress });
      }
    }

    // Sort by most recently updated
    return list.sort((a, b) => (b.progress.lastUpdated || 0) - (a.progress.lastUpdated || 0));
  }, [recipes, cookingProgress]);

  if (activeItems.length === 0) {
    return null;
  }

  const handleResume = (recipe: Recipe) => {
    haptics.impactMedium();
    router.push({
      pathname: `/cook/${recipe.id}`,
      params: { id: recipe.id },
    });
  };

  const handleOpenDetail = (recipe: Recipe) => {
    if (onPressRecipe) {
      onPressRecipe(recipe);
    } else {
      router.push(`/recipe/${recipe.id}`);
    }
  };

  const handleDismiss = (recipeId: string) => {
    haptics.buttonPress();
    clearCookingProgress(recipeId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <View style={styles.pulseDot} />
          <Text style={styles.sectionTitle}>Continue Cooking</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeItems.length}</Text>
          </View>
        </View>

        <Text style={styles.subtext}>Resume where you left off</Text>
      </View>

      {/* Horizontal Cards Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeItems.map(({ recipe, progress }) => {
          const totalSteps = recipe.instructions.length;
          const currentStep = progress.currentStep;
          const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));
          const currentInstruction = recipe.instructions[currentStep - 1] || '';

          return (
            <GlassSurface
              key={recipe.id}
              variant="prominent"
              intensity={40}
              borderRadius={radii.xxl}
              borderWidth={1.2}
              style={styles.card}
              contentContainerStyle={styles.cardInner}
            >
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => handleOpenDetail(recipe)}
                style={styles.cardHeader}
              >
                {/* Thumbnail */}
                <View style={styles.thumbnailWrapper}>
                  <Image
                    source={{ uri: recipe.image }}
                    style={styles.thumbnail}
                    contentFit="cover"
                  />
                  <View style={styles.playIconOverlay}>
                    <ChefHat size={14} color={palette.white} />
                  </View>
                </View>

                {/* Recipe Info */}
                <View style={styles.recipeInfo}>
                  <View style={styles.categoryRow}>
                    <Text style={styles.categoryText}>{recipe.category}</Text>
                    <View style={styles.dotSeparator} />
                    <Text style={styles.timeText}>{recipe.preparationTime}m prep</Text>
                  </View>
                  <Text style={styles.recipeName} numberOfLines={1}>
                    {recipe.name}
                  </Text>
                </View>

                {/* Dismiss button */}
                <TouchableOpacity
                  onPress={() => handleDismiss(recipe.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.dismissBtn}
                  accessibilityLabel="Dismiss cooking progress"
                >
                  <X size={15} color={palette.text.onDarkSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Step info preview */}
              <View style={styles.stepInfoContainer}>
                <View style={styles.stepRow}>
                  <Text style={styles.stepCounterText}>
                    Step {currentStep} of {totalSteps}
                  </Text>
                  <Text style={styles.percentText}>{progressPercent}%</Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>

                {/* Next step instruction preview */}
                <Text style={styles.instructionPreview} numberOfLines={1}>
                  {currentInstruction}
                </Text>
              </View>

              {/* Action Button: Resume in Cook Mode */}
              <TouchableOpacity
                onPress={() => handleResume(recipe)}
                activeOpacity={0.85}
                style={styles.resumeButton}
                accessibilityRole="button"
                accessibilityLabel={`Resume cooking ${recipe.name}`}
              >
                <Play size={14} color={palette.forest[900]} fill={palette.forest[900]} />
                <Text style={styles.resumeButtonText}>Resume Cook Mode</Text>
                <ChevronRight size={14} color={palette.forest[900]} strokeWidth={2.5} />
              </TouchableOpacity>
            </GlassSurface>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
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
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.mint[300],
  },
  sectionTitle: {
    fontFamily: typography.families.bold,
    fontSize: 19,
    color: palette.text.onDark,
    letterSpacing: -0.3,
  },
  badge: {
    backgroundColor: 'rgba(195, 235, 197, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(195, 235, 197, 0.35)',
  },
  badgeText: {
    fontFamily: typography.families.bold,
    fontSize: 11,
    color: palette.mint[300],
  },
  subtext: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.text.onDarkSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    width: 285,
    padding: 14,
    backgroundColor: 'rgba(27, 43, 47, 0.65)',
  },
  cardInner: {
    // Inner surface
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: palette.forest[800],
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(14, 26, 23, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  categoryText: {
    fontFamily: typography.families.semiBold,
    fontSize: 11,
    color: palette.mint[300],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: palette.text.onDarkSecondary,
  },
  timeText: {
    fontFamily: typography.families.medium,
    fontSize: 11,
    color: palette.text.onDarkSecondary,
  },
  recipeName: {
    fontFamily: typography.families.bold,
    fontSize: 15,
    color: palette.white,
    letterSpacing: -0.2,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInfoContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stepCounterText: {
    fontFamily: typography.families.bold,
    fontSize: 12,
    color: palette.text.onDark,
  },
  percentText: {
    fontFamily: typography.families.bold,
    fontSize: 12,
    color: palette.mint[300],
  },
  progressTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.mint[300],
    borderRadius: 2.5,
  },
  instructionPreview: {
    fontFamily: typography.families.regular,
    fontSize: 12,
    color: palette.text.onDarkSecondary,
    lineHeight: 16,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: palette.mint[300],
    shadowColor: palette.mint[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  resumeButtonText: {
    fontFamily: typography.families.bold,
    fontSize: 13,
    color: palette.forest[900],
  },
});

export default ContinueCookingRow;
