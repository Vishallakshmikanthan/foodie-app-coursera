import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Clock,
  Users,
  Flame,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  ChefHat,
} from 'lucide-react-native';
import { useRecipes } from '../../context/RecipeContext';
import { FavoriteButton } from '../../components/FavoriteButton';
import { getDifficultyColor, confirmAction } from '../../utils/recipeUtils';
import { useAppRouter, useAppParams } from '../../utils/navigation';
import { useTheme } from '../../theme/ThemeProvider';
import { palette, typography } from '../../theme/tokens';

export default function RecipeDetailScreen() {
  const router = useAppRouter();
  const { id } = useAppParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const { getRecipeById, toggleFavorite, deleteRecipe, isLoading } = useRecipes();

  // State to track checked ingredients as user cooks
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});

  const recipe = id ? getRecipeById(id) : undefined;

  const toggleCheckIngredient = (index: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleEdit = () => {
    if (!recipe) return;
    router.push({
      pathname: '/edit-recipe',
      params: { id: recipe.id },
    });
  };

  const handleDelete = () => {
    if (!recipe) return;
    confirmAction({
      title: 'Delete Recipe',
      message: 'Are you sure you want to delete this recipe? This cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await deleteRecipe(recipe.id);
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/my-food');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading recipe details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorTitle, { color: colors.error }]}>Recipe Not Found</Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            We could not find the recipe you were looking for. It may have been deleted.
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            style={[styles.backHomeBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.backHomeBtnText}>← Return to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const diffColors = getDifficultyColor(recipe.difficulty, isDark);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Fixed Navigation Header with Back and Favorite */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.borderSubtle,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            activeOpacity={0.7}
            style={[
              styles.headerIconBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6',
                borderColor: colors.borderSubtle,
              },
            ]}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerCenterTitle, { color: colors.text }]} numberOfLines={1}>
            {recipe.name}
          </Text>

          <View style={styles.headerRightActions}>
            {recipe.isUserCreated && (
              <>
                <TouchableOpacity
                  onPress={handleEdit}
                  activeOpacity={0.7}
                  style={[
                    styles.headerIconBtn,
                    {
                      backgroundColor: colors.editButtonBg,
                      borderColor: colors.editButtonBorder,
                    },
                  ]}
                  accessibilityLabel="Edit recipe"
                >
                  <Edit3 size={18} color={colors.editButton} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  activeOpacity={0.7}
                  style={[
                    styles.headerIconBtn,
                    {
                      backgroundColor: colors.deleteButtonBg,
                      borderColor: colors.deleteButtonBorder,
                    },
                  ]}
                  accessibilityLabel="Delete recipe"
                >
                  <Trash2 size={18} color={colors.deleteButton} />
                </TouchableOpacity>
              </>
            )}

            {/* Favorite / Unfavorite Button */}
            <FavoriteButton
              isFavorite={recipe.isFavorite}
              onPress={() => toggleFavorite(recipe.id)}
              size={20}
            />
          </View>
        </View>

        {/* Scrollable Recipe Details */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Large Hero Image Container */}
          <View
            style={[
              styles.heroImageContainer,
              { backgroundColor: isDark ? palette.forest[800] : palette.gray[200] },
            ]}
          >
            <Image
              source={{ uri: recipe.image }}
              style={styles.heroImage}
              contentFit="cover"
              transition={300}
              cachePolicy="memory-disk"
            />
            {/* Category Overlay Tag */}
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{recipe.category}</Text>
            </View>

            {recipe.isUserCreated && (
              <View style={[styles.userCreatedTag, { backgroundColor: colors.primary }]}>
                <ChefHat size={12} color={palette.white} />
                <Text style={styles.userCreatedTagText}>Created by You</Text>
              </View>
            )}
          </View>

          {/* Recipe Title & Meta Info */}
          <View
            style={[
              styles.titleSection,
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.recipeTitle, { color: colors.text }]}>{recipe.name}</Text>

            {/* Key Stats Metric Cards */}
            <View style={styles.metricsGrid}>
              {/* Preparation Time */}
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.backgroundSecondary : palette.gray[50],
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Clock size={20} color={colors.primary} />
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  {recipe.preparationTime} mins
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Prep Time</Text>
              </View>

              {/* Servings */}
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.backgroundSecondary : palette.gray[50],
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Users size={20} color={colors.primary} />
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  {recipe.servings} people
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Servings</Text>
              </View>

              {/* Calories */}
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.backgroundSecondary : palette.gray[50],
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Flame size={20} color={colors.accentSaffron} />
                <Text style={[styles.metricValue, { color: colors.accentSaffron }]}>
                  {recipe.calories} kcal
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Calories</Text>
              </View>

              {/* Difficulty Level */}
              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: diffColors.bg, borderColor: diffColors.border },
                ]}
              >
                <Text style={[styles.diffLevelText, { color: diffColors.text }]}>
                  {recipe.difficulty}
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Difficulty</Text>
              </View>
            </View>
          </View>

          {/* Ingredients Section */}
          <View
            style={[
              styles.cardSection,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Ingredients</Text>
              <Text
                style={[
                  styles.badgeCount,
                  {
                    backgroundColor: colors.chipBackground,
                    color: colors.primary,
                    borderColor: colors.chipBorder,
                  },
                ]}
              >
                {recipe.ingredients.length} items
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Tap an ingredient to check it off while cooking:
            </Text>

            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => {
                const isChecked = !!checkedIngredients[index];
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    onPress={() => toggleCheckIngredient(index)}
                    style={[
                      styles.ingredientItem,
                      {
                        backgroundColor: isChecked
                          ? colors.successBg
                          : isDark
                          ? colors.backgroundSecondary
                          : palette.gray[50],
                        borderColor: isChecked ? colors.successBorder : colors.borderSubtle,
                      },
                    ]}
                  >
                    {isChecked ? (
                      <CheckCircle2 size={20} color={colors.success} />
                    ) : (
                      <Circle size={20} color={colors.textMuted} />
                    )}
                    <Text
                      style={[
                        styles.ingredientText,
                        { color: colors.text },
                        isChecked && [
                          styles.ingredientTextChecked,
                          { color: colors.textMuted },
                        ],
                      ]}
                    >
                      {ingredient}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Step-by-Step Instructions Section */}
          <View
            style={[
              styles.cardSection,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                Step-by-Step Instructions
              </Text>
              <Text
                style={[
                  styles.badgeCount,
                  {
                    backgroundColor: colors.chipBackground,
                    color: colors.primary,
                    borderColor: colors.chipBorder,
                  },
                ]}
              >
                {recipe.instructions.length} steps
              </Text>
            </View>

            <View style={styles.instructionsList}>
              {recipe.instructions.map((step, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepCard,
                    {
                      backgroundColor: isDark ? colors.backgroundSecondary : palette.gray[50],
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepLabel, { color: colors.primary }]}>Step {index + 1}</Text>
                    <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* If user created, action buttons */}
          {recipe.isUserCreated && (
            <View
              style={[
                styles.userActionsCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.userActionsTitle, { color: colors.text }]}>
                Manage Your Recipe
              </Text>
              <View style={styles.userActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleEdit}
                  style={[
                    styles.editActionBtn,
                    { backgroundColor: colors.editButton },
                  ]}
                >
                  <Edit3 size={18} color={palette.white} />
                  <Text style={styles.editActionBtnText}>Edit Recipe</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleDelete}
                  style={[
                    styles.deleteActionBtn,
                    { backgroundColor: colors.deleteButton },
                  ]}
                >
                  <Trash2 size={18} color={palette.white} />
                  <Text style={styles.deleteActionBtnText}>Delete Recipe</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerCenterTitle: {
    fontSize: 16,
    fontFamily: typography.families.bold,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroImageContainer: {
    width: '100%',
    height: 270,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  categoryTag: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(14, 26, 23, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryTagText: {
    color: palette.white,
    fontFamily: typography.families.bold,
    fontSize: 13,
  },
  userCreatedTag: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  userCreatedTagText: {
    color: palette.white,
    fontFamily: typography.families.bold,
    fontSize: 12,
  },
  titleSection: {
    padding: 18,
    borderBottomWidth: 1,
  },
  recipeTitle: {
    fontSize: 24,
    fontFamily: typography.families.display,
    lineHeight: 30,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  metricValue: {
    fontSize: 13,
    fontFamily: typography.families.bold,
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: typography.families.medium,
  },
  diffLevelText: {
    fontSize: 14,
    fontFamily: typography.families.extraBold,
    marginTop: 4,
    marginBottom: 2,
  },
  cardSection: {
    marginTop: 14,
    padding: 18,
    borderRadius: 18,
    marginHorizontal: 14,
    borderWidth: 1,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 18,
    fontFamily: typography.families.bold,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: typography.families.regular,
    marginBottom: 12,
  },
  badgeCount: {
    fontSize: 12,
    fontFamily: typography.families.semiBold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  ingredientText: {
    fontSize: 14,
    flex: 1,
    fontFamily: typography.families.medium,
  },
  ingredientTextChecked: {
    textDecorationLine: 'line-through',
  },
  instructionsList: {
    gap: 12,
    marginTop: 8,
  },
  stepCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: palette.white,
    fontFamily: typography.families.extraBold,
    fontSize: 13,
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 13,
    fontFamily: typography.families.bold,
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    fontFamily: typography.families.regular,
    lineHeight: 21,
  },
  userActionsCard: {
    marginHorizontal: 14,
    marginTop: 16,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  userActionsTitle: {
    fontSize: 15,
    fontFamily: typography.families.bold,
    marginBottom: 12,
    textAlign: 'center',
  },
  userActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  editActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  editActionBtnText: {
    color: palette.white,
    fontFamily: typography.families.bold,
    fontSize: 14,
  },
  deleteActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  deleteActionBtnText: {
    color: palette.white,
    fontFamily: typography.families.bold,
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: typography.families.medium,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: typography.families.bold,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: typography.families.regular,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  backHomeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  backHomeBtnText: {
    color: palette.white,
    fontFamily: typography.families.bold,
    fontSize: 14,
  },
});
