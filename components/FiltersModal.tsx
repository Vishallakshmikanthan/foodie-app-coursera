import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import {
  X,
  Clock,
  Flame,
  Sparkles,
  RotateCcw,
  Check,
  ChefHat,
  SlidersHorizontal,
} from 'lucide-react-native';
import { GlassSurface } from './ui/GlassSurface';
import { Recipe, DifficultyLevel } from '../types/recipe';
import { RecipeFilterOptions } from '../types/smart';
import { palette, typography, radii } from '../theme/tokens';
import { haptics } from '../utils/haptics';

export interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  options: RecipeFilterOptions;
  onChangeOptions: (newOptions: RecipeFilterOptions) => void;
  recipes: Recipe[];
}

export function countActiveFilters(options: RecipeFilterOptions): number {
  let count = 0;
  if (options.maxCookTime) count++;
  if (options.difficulty && options.difficulty !== 'All') count++;
  if (options.diet && options.diet !== 'All') count++;
  if (options.maxCalories) count++;
  return count;
}

export function filterRecipesByOptions(
  recipes: Recipe[],
  options: RecipeFilterOptions,
  searchQuery: string = ''
): Recipe[] {
  const query = searchQuery.trim().toLowerCase();

  return recipes.filter((recipe) => {
    // 1. Search Query
    if (query.length > 0) {
      const matchesName = recipe.name.toLowerCase().includes(query);
      const matchesCategory = recipe.category.toLowerCase().includes(query);
      const matchesIngredients = recipe.ingredients.some((ing) => {
        const name = typeof ing === 'string' ? ing : ing.name;
        return name.toLowerCase().includes(query);
      });
      if (!matchesName && !matchesCategory && !matchesIngredients) {
        return false;
      }
    }

    // 2. Category
    if (options.category && options.category !== 'All') {
      if (recipe.category.toLowerCase() !== options.category.toLowerCase()) {
        return false;
      }
    }

    // 3. Max Cook Time
    if (options.maxCookTime !== undefined) {
      if (recipe.preparationTime > options.maxCookTime) {
        return false;
      }
    }

    // 4. Difficulty
    if (options.difficulty && options.difficulty !== 'All') {
      if (recipe.difficulty !== options.difficulty) {
        return false;
      }
    }

    // 5. Dietary
    if (options.diet && options.diet !== 'All') {
      if (options.diet === 'Vegetarian') {
        const isVeg =
          recipe.category === 'Vegetarian' ||
          recipe.category === 'Salad' ||
          recipe.category === 'Desserts' ||
          recipe.category === 'Breakfast';
        if (!isVeg) return false;
      } else if (options.diet === 'Non-Vegetarian') {
        const isNonVeg =
          recipe.category === 'Non-Vegetarian' ||
          recipe.name.toLowerCase().includes('chicken') ||
          recipe.name.toLowerCase().includes('beef') ||
          recipe.name.toLowerCase().includes('salmon') ||
          recipe.name.toLowerCase().includes('shrimp');
        if (!isNonVeg) return false;
      } else if (options.diet === 'Low-Calorie') {
        if (recipe.calories > 450) return false;
      }
    }

    // 6. Max Calories
    if (options.maxCalories !== undefined) {
      if (recipe.calories > options.maxCalories) {
        return false;
      }
    }

    return true;
  });
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  visible,
  onClose,
  options,
  onChangeOptions,
  recipes,
}) => {
  // Live calculate matching recipes
  const matchingRecipes = useMemo(() => {
    return filterRecipesByOptions(recipes, options);
  }, [recipes, options]);

  const activeCount = useMemo(() => {
    return countActiveFilters(options);
  }, [options]);

  const handleReset = () => {
    haptics.buttonPress();
    onChangeOptions({
      category: options.category, // preserve selected category tab
      maxCookTime: undefined,
      difficulty: 'All',
      diet: 'All',
      maxCalories: undefined,
    });
  };

  const handleApply = () => {
    haptics.impactLight();
    onClose();
  };

  const COOK_TIMES = [
    { label: 'Any Time', value: undefined },
    { label: '≤ 15 min', value: 15 },
    { label: '≤ 30 min', value: 30 },
    { label: '≤ 45 min', value: 45 },
    { label: '≤ 60 min', value: 60 },
  ];

  const DIFFICULTIES: { label: string; value: DifficultyLevel | 'All' }[] = [
    { label: 'All Levels', value: 'All' },
    { label: 'Easy', value: 'Easy' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Hard', value: 'Hard' },
  ];

  const DIETS: { label: string; value: NonNullable<RecipeFilterOptions['diet']> }[] = [
    { label: 'All Diets', value: 'All' },
    { label: '🌱 Vegetarian', value: 'Vegetarian' },
    { label: '🥩 Non-Vegetarian', value: 'Non-Vegetarian' },
    { label: '🥗 Low-Calorie (<450)', value: 'Low-Calorie' },
  ];

  const CALORIE_LIMITS = [
    { label: 'Any Calories', value: undefined },
    { label: '< 350 kcal', value: 350 },
    { label: '< 500 kcal', value: 500 },
    { label: '< 700 kcal', value: 700 },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <GlassSurface
          variant="prominent"
          intensity={Platform.OS === 'ios' ? 70 : 50}
          borderRadius={32}
          borderWidth={1.2}
          style={styles.sheetContainer}
          contentContainerStyle={styles.sheetInner}
        >
          {/* Top Sheet Drag Indicator */}
          <View style={styles.dragPill} />

          {/* Sheet Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <SlidersHorizontal size={18} color={palette.mint[300]} />
              <Text style={styles.title}>Filter Dishes</Text>
              {activeCount > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{activeCount} active</Text>
                </View>
              )}
            </View>

            <View style={styles.headerActions}>
              {activeCount > 0 && (
                <TouchableOpacity
                  onPress={handleReset}
                  activeOpacity={0.7}
                  style={styles.resetBtn}
                  accessibilityLabel="Reset all filters"
                >
                  <RotateCcw size={12} color={palette.peach[300]} />
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.closeBtn}
                accessibilityLabel="Close filter sheet"
              >
                <X size={18} color={palette.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Filters Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Section 1: Cooking Time */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Clock size={15} color={palette.text.onDarkSecondary} />
                <Text style={styles.sectionTitle}>Cooking Time</Text>
              </View>
              <View style={styles.chipsWrap}>
                {COOK_TIMES.map((time) => {
                  const isSelected = options.maxCookTime === time.value;
                  return (
                    <TouchableOpacity
                      key={time.label}
                      onPress={() => {
                        haptics.buttonPress();
                        onChangeOptions({ ...options, maxCookTime: time.value });
                      }}
                      activeOpacity={0.75}
                      style={[
                        styles.chip,
                        isSelected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                        ]}
                      >
                        {time.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 2: Difficulty */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <ChefHat size={15} color={palette.text.onDarkSecondary} />
                <Text style={styles.sectionTitle}>Preparation Level</Text>
              </View>
              <View style={styles.chipsWrap}>
                {DIFFICULTIES.map((diff) => {
                  const isSelected =
                    (options.difficulty || 'All') === diff.value;
                  return (
                    <TouchableOpacity
                      key={diff.label}
                      onPress={() => {
                        haptics.buttonPress();
                        onChangeOptions({ ...options, difficulty: diff.value });
                      }}
                      activeOpacity={0.75}
                      style={[
                        styles.chip,
                        isSelected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                        ]}
                      >
                        {diff.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 3: Dietary Lifestyle */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Sparkles size={15} color={palette.text.onDarkSecondary} />
                <Text style={styles.sectionTitle}>Diet & Nutrition</Text>
              </View>
              <View style={styles.chipsWrap}>
                {DIETS.map((diet) => {
                  const isSelected = (options.diet || 'All') === diet.value;
                  return (
                    <TouchableOpacity
                      key={diet.label}
                      onPress={() => {
                        haptics.buttonPress();
                        onChangeOptions({ ...options, diet: diet.value });
                      }}
                      activeOpacity={0.75}
                      style={[
                        styles.chip,
                        isSelected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                        ]}
                      >
                        {diet.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 4: Calorie Limit */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Flame size={15} color={palette.text.onDarkSecondary} />
                <Text style={styles.sectionTitle}>Maximum Calories</Text>
              </View>
              <View style={styles.chipsWrap}>
                {CALORIE_LIMITS.map((cal) => {
                  const isSelected = options.maxCalories === cal.value;
                  return (
                    <TouchableOpacity
                      key={cal.label}
                      onPress={() => {
                        haptics.buttonPress();
                        onChangeOptions({ ...options, maxCalories: cal.value });
                      }}
                      activeOpacity={0.75}
                      style={[
                        styles.chip,
                        isSelected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                        ]}
                      >
                        {cal.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Sticky Footer CTA */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleApply}
              activeOpacity={0.85}
              style={[
                styles.applyBtn,
                matchingRecipes.length === 0 && styles.applyBtnDisabled,
              ]}
              disabled={matchingRecipes.length === 0}
            >
              <Text style={styles.applyBtnText}>
                {matchingRecipes.length === 0
                  ? 'No Dishes Match'
                  : `Show ${matchingRecipes.length} ${
                      matchingRecipes.length === 1 ? 'Dish' : 'Dishes'
                    }`}
              </Text>
            </TouchableOpacity>
          </View>
        </GlassSurface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(7, 14, 12, 0.7)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    maxHeight: '85%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: 'rgba(14, 26, 23, 0.95)',
    borderTopWidth: 1.2,
    borderLeftWidth: 1.2,
    borderRightWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  sheetInner: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: typography.families.bold,
    fontSize: 18,
    color: palette.white,
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: 'rgba(240, 183, 159, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.peach[300],
  },
  countBadgeText: {
    fontFamily: typography.families.bold,
    fontSize: 11,
    color: palette.peach[300],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(240, 183, 159, 0.12)',
  },
  resetBtnText: {
    fontFamily: typography.families.semiBold,
    fontSize: 12,
    color: palette.peach[300],
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingVertical: 16,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontFamily: typography.families.bold,
    fontSize: 14,
    color: palette.text.onDarkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: palette.mint[300],
    borderColor: palette.mint[300],
  },
  chipUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  chipText: {
    fontSize: 13,
  },
  chipTextSelected: {
    fontFamily: typography.families.bold,
    color: palette.forest[900],
  },
  chipTextUnselected: {
    fontFamily: typography.families.medium,
    color: palette.text.onDark,
  },
  footer: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  applyBtn: {
    backgroundColor: palette.coral[500],
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.coral[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  applyBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowOpacity: 0,
  },
  applyBtnText: {
    fontFamily: typography.families.bold,
    fontSize: 15,
    color: palette.white,
  },
});

export default FiltersModal;
