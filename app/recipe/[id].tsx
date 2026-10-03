import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
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

export default function RecipeDetailScreen() {
  const router = useAppRouter();
  const { id } = useAppParams<{ id: string }>();
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading recipe details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Recipe Not Found</Text>
          <Text style={styles.errorText}>
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
            style={styles.backHomeBtn}
          >
            <Text style={styles.backHomeBtnText}>← Return to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const diffColors = getDifficultyColor(recipe.difficulty);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Fixed Navigation Header with Back and Favorite */}
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
            style={styles.headerIconBtn}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color="#1F2937" />
          </TouchableOpacity>

          <Text style={styles.headerCenterTitle} numberOfLines={1}>
            {recipe.name}
          </Text>

          <View style={styles.headerRightActions}>
            {recipe.isUserCreated && (
              <>
                <TouchableOpacity
                  onPress={handleEdit}
                  activeOpacity={0.7}
                  style={styles.headerIconBtn}
                  accessibilityLabel="Edit recipe"
                >
                  <Edit3 size={18} color="#2563EB" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  activeOpacity={0.7}
                  style={styles.headerIconBtn}
                  accessibilityLabel="Delete recipe"
                >
                  <Trash2 size={18} color="#DC2626" />
                </TouchableOpacity>
              </>
            )}

            {/* Favorite / Unfavorite Button */}
            <FavoriteButton
              isFavorite={recipe.isFavorite}
              onPress={() => toggleFavorite(recipe.id)}
              size={22}
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
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: recipe.image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Category Overlay Tag */}
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{recipe.category}</Text>
            </View>

            {recipe.isUserCreated && (
              <View style={styles.userCreatedTag}>
                <ChefHat size={12} color="#FFFFFF" />
                <Text style={styles.userCreatedTagText}>Created by You</Text>
              </View>
            )}
          </View>

          {/* Recipe Title & Meta Info */}
          <View style={styles.titleSection}>
            <Text style={styles.recipeTitle}>{recipe.name}</Text>

            {/* Key Stats Metric Cards */}
            <View style={styles.metricsGrid}>
              {/* Preparation Time */}
              <View style={styles.metricCard}>
                <Clock size={20} color="#FF6B35" />
                <Text style={styles.metricValue}>{recipe.preparationTime} mins</Text>
                <Text style={styles.metricLabel}>Prep Time</Text>
              </View>

              {/* Servings */}
              <View style={styles.metricCard}>
                <Users size={20} color="#FF6B35" />
                <Text style={styles.metricValue}>{recipe.servings} people</Text>
                <Text style={styles.metricLabel}>Servings</Text>
              </View>

              {/* Calories */}
              <View style={styles.metricCard}>
                <Flame size={20} color="#EF4444" />
                <Text style={styles.metricValue}>{recipe.calories} kcal</Text>
                <Text style={styles.metricLabel}>Calories</Text>
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
                <Text style={styles.metricLabel}>Difficulty</Text>
              </View>
            </View>
          </View>

          {/* Ingredients Section */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeading}>Ingredients</Text>
              <Text style={styles.badgeCount}>{recipe.ingredients.length} items</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
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
                      isChecked && styles.ingredientItemChecked,
                    ]}
                  >
                    {isChecked ? (
                      <CheckCircle2 size={20} color="#16A34A" />
                    ) : (
                      <Circle size={20} color="#9CA3AF" />
                    )}
                    <Text
                      style={[
                        styles.ingredientText,
                        isChecked && styles.ingredientTextChecked,
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
          <View style={styles.cardSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeading}>Step-by-Step Instructions</Text>
              <Text style={styles.badgeCount}>{recipe.instructions.length} steps</Text>
            </View>

            <View style={styles.instructionsList}>
              {recipe.instructions.map((step, index) => (
                <View key={index} style={styles.stepCard}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepLabel}>Step {index + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* If user created, action buttons */}
          {recipe.isUserCreated && (
            <View style={styles.userActionsCard}>
              <Text style={styles.userActionsTitle}>Manage Your Recipe</Text>
              <View style={styles.userActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleEdit}
                  style={styles.editActionBtn}
                >
                  <Edit3 size={18} color="#FFFFFF" />
                  <Text style={styles.editActionBtnText}>Edit Recipe</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleDelete}
                  style={styles.deleteActionBtn}
                >
                  <Trash2 size={18} color="#FFFFFF" />
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
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
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
    backgroundColor: '#E5E7EB',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  categoryTag: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  categoryTagText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  userCreatedTag: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  userCreatedTagText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  titleSection: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recipeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 28,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  diffLevelText: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 2,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 18,
    borderRadius: 16,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
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
    fontWeight: '800',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  badgeCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  ingredientItemChecked: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  ingredientText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    fontWeight: '500',
  },
  ingredientTextChecked: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  instructionsList: {
    gap: 12,
    marginTop: 8,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
  },
  userActionsCard: {
    marginHorizontal: 12,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userActionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
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
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  editActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  deleteActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  backHomeBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
