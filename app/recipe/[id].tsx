import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Share2,
  Clock,
  Flame,
  ChefHat,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  ShoppingCart,
  Check,
} from 'lucide-react-native';
import { useRecipes } from '../../context/RecipeContext';
import { FavoriteButton } from '../../components/FavoriteButton';
import { confirmAction, getDifficultyColor } from '../../utils/recipeUtils';
import { useAppRouter, useAppParams } from '../../utils/navigation';
import { formatIngredient } from '../../utils/ingredientUtils';
import { detectTimerInText } from '../../utils/timerUtils';
import { ServingsControlBar } from '../../components/ServingsControlBar';
import { DetailTabs, DetailTabType } from '../../components/DetailTabs';
import { ShoppingListModal } from '../../components/ShoppingListModal';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { GlassIconButton } from '../../components/ui/GlassIconButton';
import { GlassChip } from '../../components/ui/GlassChip';
import { SharedImage } from '../../components/SharedImageTransition';
import { palette, typography, radii } from '../../theme/tokens';
import { getCategoryTint } from '../../theme/categoryTints';
import { haptics } from '../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_IMAGE_HEIGHT = Math.min(380, SCREEN_WIDTH * 0.95);

export default function RecipeDetailScreen() {
  const router = useAppRouter();
  const { id } = useAppParams<{ id: string }>();
  const {
    getRecipeById,
    toggleFavorite,
    deleteRecipe,
    isLoading,
    getRecipeProgress,
    updateCookingProgress,
    addRecentlyViewed,
    addToShoppingList,
    shoppingList,
  } = useRecipes();

  const recipe = id ? getRecipeById(id) : undefined;
  const progress = recipe ? getRecipeProgress(recipe.id) : undefined;

  // Track recently viewed
  useEffect(() => {
    if (recipe?.id) {
      addRecentlyViewed(recipe.id);
    }
  }, [recipe?.id, addRecentlyViewed]);

  // Shopping list modal state & confirmation toast
  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);
  const [justAddedToList, setJustAddedToList] = useState(false);

  // Servings and live scaling state
  const baseServings = recipe?.servings || 2;
  const [currentServings, setCurrentServings] = useState<number>(baseServings);
  const multiplier = baseServings > 0 ? currentServings / baseServings : 1;

  // Tab state: 'ingredients' | 'steps' | 'nutrition'
  const [activeTab, setActiveTab] = useState<DetailTabType>('ingredients');

  // Checked ingredients tracker
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});

  const tint = recipe ? getCategoryTint(recipe.category) : getCategoryTint('Dinner');

  const handleMultiplierChange = (newMult: number) => {
    haptics.servingsChange();
    setCurrentServings(Math.round(baseServings * newMult));
  };

  const handleServingsChange = (newServings: number) => {
    haptics.servingsChange();
    setCurrentServings(newServings);
  };

  const toggleCheckIngredient = (index: number) => {
    haptics.buttonPress();
    setCheckedIngredients((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAddToShoppingList = async () => {
    if (!recipe) return;
    haptics.notificationSuccess();
    await addToShoppingList(recipe.ingredients, recipe.id, recipe.name, multiplier);
    setJustAddedToList(true);
    setTimeout(() => {
      setJustAddedToList(false);
    }, 3000);
  };

  const handleShare = async () => {
    if (!recipe) return;
    try {
      await Share.share({
        title: recipe.name,
        message: `Check out this delicious ${recipe.name} recipe on Foodie! Prep time: ${recipe.preparationTime} mins, ${recipe.servings} servings.`,
      });
    } catch (err) {
      console.log('Error sharing recipe:', err);
    }
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
    haptics.destructive();
    confirmAction({
      title: 'Delete Recipe',
      message: 'Are you sure you want to delete this recipe? This cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        haptics.destructive();
        await deleteRecipe(recipe.id);
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/my-food');
        }
      },
    });
  };

  const handleStartCooking = (startAtStep?: number) => {
    if (!recipe) return;
    haptics.impactMedium();
    if (startAtStep !== undefined) {
      updateCookingProgress(recipe.id, startAtStep);
    }
    router.push({
      pathname: `/cook/${recipe.id}`,
      params: { id: recipe.id },
    });
  };

  const handleResetProgressAndCook = () => {
    if (!recipe) return;
    haptics.impactMedium();
    updateCookingProgress(recipe.id, 1, []);
    router.push({
      pathname: `/cook/${recipe.id}`,
      params: { id: recipe.id },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={palette.mint[300]} />
        <Text style={styles.loadingText}>Loading recipe details...</Text>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.centerContainer}>
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
      </SafeAreaView>
    );
  }

  const diffColors = getDifficultyColor(recipe.difficulty, true);
  const totalInstructions = recipe.instructions.length;
  const hasSavedProgress = !!progress && progress.currentStep >= 1 && progress.currentStep <= totalInstructions;

  // Estimated nutrition calculations based on live scaled multiplier
  const scaledCalories = Math.round(recipe.calories * multiplier);
  const perServingCalories = Math.round(recipe.calories);
  const estimatedProtein = Math.round((recipe.calories * 0.22) / 4);
  const estimatedCarbs = Math.round((recipe.calories * 0.50) / 4);
  const estimatedFat = Math.round((recipe.calories * 0.28) / 9);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Full-Bleed Hero Image Container */}
        <View style={styles.heroWrapper}>
          <SharedImage
            recipeId={recipe.id}
            source={{ uri: recipe.image }}
            placeholder={{ blurhash: recipe.blurhash || 'L5K-F@~q00%M4n_3%M?b00t7_3IU' }}
            style={styles.heroImage}
            contentFit="cover"
          />

          {/* Bottom Gradient Scrim into Forest Dark */}
          <LinearGradient
            colors={['transparent', 'rgba(14, 26, 23, 0.4)', palette.forest[900]]}
            locations={[0.3, 0.7, 1.0]}
            style={styles.heroScrim}
          />

          {/* Floating Top Controls Header */}
          <SafeAreaView style={styles.heroHeaderOverlay} edges={['top']}>
            <GlassIconButton
              icon={ArrowLeft}
              size={42}
              iconSize={20}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }}
              accessibilityLabel="Go back"
            />

            <View style={styles.heroRightActions}>
              <GlassIconButton
                icon={ShoppingCart}
                size={42}
                iconSize={19}
                iconColor={palette.mint[300]}
                onPress={() => setIsShoppingModalOpen(true)}
                accessibilityLabel="Open shopping list"
              />

              <GlassIconButton
                icon={Share2}
                size={42}
                iconSize={19}
                onPress={handleShare}
                accessibilityLabel="Share recipe"
              />

              {recipe.isUserCreated && (
                <>
                  <GlassIconButton
                    icon={Edit3}
                    size={42}
                    iconSize={18}
                    iconColor={palette.peach[300]}
                    onPress={handleEdit}
                    accessibilityLabel="Edit recipe"
                  />
                  <GlassIconButton
                    icon={Trash2}
                    size={42}
                    iconSize={18}
                    iconColor={palette.coral[500]}
                    onPress={handleDelete}
                    accessibilityLabel="Delete recipe"
                  />
                </>
              )}

              <FavoriteButton
                isFavorite={recipe.isFavorite}
                onPress={() => toggleFavorite(recipe.id)}
                size={20}
              />
            </View>
          </SafeAreaView>

          {/* Hero Bottom Info (Overlaid on Gradient) */}
          <View style={styles.heroBottomContent}>
            <View style={styles.heroBadgeRow}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: tint.badgeBg, borderColor: tint.badgeBorder },
                ]}
              >
                <Text style={[styles.categoryBadgeText, { color: tint.accent }]}>
                  {recipe.category}
                </Text>
              </View>

              {recipe.isUserCreated && (
                <View style={styles.userBadge}>
                  <ChefHat size={12} color={palette.white} />
                  <Text style={styles.userBadgeText}>My Recipe</Text>
                </View>
              )}

              {hasSavedProgress && (
                <View style={styles.startedBadge}>
                  <Sparkles size={11} color={palette.mint[300]} />
                  <Text style={styles.startedBadgeText}>
                    Started · Step {progress.currentStep}/{totalInstructions}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.recipeTitle}>{recipe.name}</Text>

            {/* Quick Meta Chips */}
            <View style={styles.metaChipsRow}>
              <GlassChip
                label={`${recipe.preparationTime} min`}
                icon={Clock}
                size="sm"
                variant="white"
              />
              <GlassChip
                label={recipe.difficulty}
                size="sm"
                variant="subtle"
                textStyle={{ color: diffColors.text }}
              />
              <GlassChip
                label={`${scaledCalories} kcal`}
                icon={Flame}
                size="sm"
                variant="peach"
              />
            </View>
          </View>
        </View>

        {/* Signature Glass Servings Control Bar (Live Scaler) */}
        <ServingsControlBar
          baseServings={baseServings}
          currentServings={currentServings}
          multiplier={multiplier}
          onMultiplierChange={handleMultiplierChange}
          onServingsChange={handleServingsChange}
        />

        {/* Tabbed Content (Ingredients, Steps, Nutrition) */}
        <DetailTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          ingredientCount={recipe.ingredients.length}
          stepCount={recipe.instructions.length}
        />

        {/* TAB 1: INGREDIENTS */}
        {activeTab === 'ingredients' && (
          <View style={styles.tabContentContainer}>
            <View style={styles.tabSectionHeaderRow}>
              <View>
                <Text style={styles.tabSectionHeading}>Ingredients</Text>
                <Text style={styles.tabSectionSub}>
                  Scaled for {currentServings} {currentServings === 1 ? 'serving' : 'servings'} ({multiplier.toFixed(1)}x)
                </Text>
              </View>

              {Object.keys(checkedIngredients).some((k) => checkedIngredients[Number(k)]) && (
                <TouchableOpacity
                  onPress={() => setCheckedIngredients({})}
                  activeOpacity={0.7}
                  style={styles.resetChecksBtn}
                >
                  <RotateCcw size={12} color={palette.gray[400]} />
                  <Text style={styles.resetChecksBtnText}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Shopping List Quick Add Action */}
            <View style={styles.shoppingActionRow}>
              <TouchableOpacity
                onPress={handleAddToShoppingList}
                activeOpacity={0.82}
                style={[
                  styles.addShoppingBtn,
                  justAddedToList && styles.addShoppingBtnActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Add ingredients to shopping list"
              >
                {justAddedToList ? (
                  <>
                    <Check size={16} color={palette.forest[900]} strokeWidth={2.5} />
                    <Text style={styles.addShoppingBtnTextActive}>
                      Added {recipe.ingredients.length} items to Shopping List!
                    </Text>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={15} color={palette.mint[300]} />
                    <Text style={styles.addShoppingBtnText}>
                      Add all to Shopping List ({recipe.ingredients.length} items)
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsShoppingModalOpen(true)}
                activeOpacity={0.7}
                style={styles.viewShoppingListBtn}
              >
                <Text style={styles.viewShoppingListText}>View List</Text>
              </TouchableOpacity>
            </View>

            {/* Ingredients List with Live Scaled Quantities */}
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => {
                const isChecked = !!checkedIngredients[index];
                const formatted = formatIngredient(ingredient, multiplier);

                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.75}
                    onPress={() => toggleCheckIngredient(index)}
                    style={[
                      styles.ingredientCard,
                      isChecked && styles.ingredientCardChecked,
                    ]}
                  >
                    <View style={styles.checkIconWrapper}>
                      {isChecked ? (
                        <CheckCircle2 size={22} color={palette.mint[300]} />
                      ) : (
                        <Circle size={22} color={palette.gray[500]} />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.ingredientText,
                        isChecked && styles.ingredientTextChecked,
                      ]}
                    >
                      {formatted}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 2: STEPS */}
        {activeTab === 'steps' && (
          <View style={styles.tabContentContainer}>
            <View style={styles.tabSectionHeaderRow}>
              <View>
                <Text style={styles.tabSectionHeading}>Step-by-Step Instructions</Text>
                <Text style={styles.tabSectionSub}>
                  {recipe.instructions.length} sequential steps
                </Text>
              </View>
            </View>

            {/* Steps List */}
            <View style={styles.stepsList}>
              {recipe.instructions.map((stepText, index) => {
                const stepNum = index + 1;
                const isCompleted = progress?.completedSteps?.includes(stepNum);
                const isCurrent = progress?.currentStep === stepNum;
                const timerDetected = detectTimerInText(stepText);

                return (
                  <GlassSurface
                    key={index}
                    variant={isCurrent ? 'mint' : 'subtle'}
                    intensity={30}
                    borderRadius={radii.xl}
                    style={styles.stepCard}
                  >
                    <View style={styles.stepCardHeader}>
                      <View
                        style={[
                          styles.stepNumberBadge,
                          {
                            backgroundColor: isCurrent
                              ? palette.mint[300]
                              : 'rgba(255, 255, 255, 0.1)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.stepNumberText,
                            isCurrent && { color: palette.forest[900] },
                          ]}
                        >
                          {stepNum}
                        </Text>
                      </View>

                      <View style={styles.stepCardTitleRow}>
                        <Text
                          style={[
                            styles.stepCardLabel,
                            isCurrent && { color: palette.mint[300] },
                          ]}
                        >
                          Step {stepNum}
                        </Text>
                        {isCompleted && (
                          <View style={styles.stepDoneTag}>
                            <CheckCircle2 size={12} color={palette.mint[300]} />
                            <Text style={styles.stepDoneTagText}>Done</Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={() => handleStartCooking(stepNum)}
                        activeOpacity={0.8}
                        style={styles.stepCookBtn}
                        accessibilityLabel={`Cook Step ${stepNum} in full screen`}
                      >
                        <Play size={11} color={palette.white} fill={palette.white} />
                        <Text style={styles.stepCookBtnText}>Cook</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.stepInstructionText}>{stepText}</Text>

                    {/* Detected timer badge inside step card */}
                    {timerDetected && (
                      <View style={styles.stepTimerChip}>
                        <Clock size={12} color={palette.saffron[400]} />
                        <Text style={styles.stepTimerChipText}>
                          ⏱️ {timerDetected.label} timer available in Cook Mode
                        </Text>
                      </View>
                    )}
                  </GlassSurface>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 3: NUTRITION */}
        {activeTab === 'nutrition' && (
          <View style={styles.tabContentContainer}>
            <View style={styles.tabSectionHeaderRow}>
              <View>
                <Text style={styles.tabSectionHeading}>Nutritional Profile</Text>
                <Text style={styles.tabSectionSub}>
                  Values calculated for {currentServings} servings
                </Text>
              </View>
            </View>

            {/* Calories Overview Card */}
            <GlassSurface
              variant="prominent"
              intensity={40}
              borderRadius={radii.xxl}
              style={styles.nutritionOverviewCard}
            >
              <View style={styles.nutritionCaloriesRow}>
                <View>
                  <Text style={styles.nutritionCaloriesLabel}>Total Calories</Text>
                  <Text style={styles.nutritionCaloriesValue}>{scaledCalories} kcal</Text>
                  <Text style={styles.nutritionCaloriesSub}>
                    {perServingCalories} kcal per serving
                  </Text>
                </View>

                <View style={styles.caloriesFlameCircle}>
                  <Flame size={28} color={palette.saffron[400]} />
                </View>
              </View>

              {/* Macro Progress Bar */}
              <View style={styles.macroTrack}>
                <View style={[styles.macroSegment, { flex: 22, backgroundColor: palette.mint[300] }]} />
                <View style={[styles.macroSegment, { flex: 50, backgroundColor: palette.peach[300] }]} />
                <View style={[styles.macroSegment, { flex: 28, backgroundColor: palette.saffron[400] }]} />
              </View>

              {/* Macro Breakdown Row */}
              <View style={styles.macrosRow}>
                <View style={styles.macroItem}>
                  <View style={[styles.macroDot, { backgroundColor: palette.mint[300] }]} />
                  <Text style={styles.macroValue}>{Math.round(estimatedProtein * multiplier)}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>

                <View style={styles.macroDivider} />

                <View style={styles.macroItem}>
                  <View style={[styles.macroDot, { backgroundColor: palette.peach[300] }]} />
                  <Text style={styles.macroValue}>{Math.round(estimatedCarbs * multiplier)}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>

                <View style={styles.macroDivider} />

                <View style={styles.macroItem}>
                  <View style={[styles.macroDot, { backgroundColor: palette.saffron[400] }]} />
                  <Text style={styles.macroValue}>{Math.round(estimatedFat * multiplier)}g</Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              </View>
            </GlassSurface>

            {/* Health & Diet Badges */}
            <View style={styles.dietTagsRow}>
              <View style={styles.dietTag}>
                <Info size={13} color={palette.mint[300]} />
                <Text style={styles.dietTagText}>High Protein</Text>
              </View>
              <View style={styles.dietTag}>
                <Info size={13} color={palette.peach[300]} />
                <Text style={styles.dietTagText}>Clean Ingredients</Text>
              </View>
              <View style={styles.dietTag}>
                <Info size={13} color={palette.saffron[400]} />
                <Text style={styles.dietTagText}>{recipe.category}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Glass Bottom Bar: Start / Resume Cooking */}
      <SafeAreaView style={styles.stickyBottomBar} edges={['bottom']}>
        <GlassSurface
          variant="prominent"
          intensity={55}
          borderRadius={radii.pill}
          borderWidth={1}
          style={styles.stickySurface}
          contentContainerStyle={styles.stickyContent}
        >
          {hasSavedProgress ? (
            <>
              <TouchableOpacity
                onPress={handleResetProgressAndCook}
                activeOpacity={0.7}
                style={styles.restartBtn}
                accessibilityLabel="Restart recipe from Step 1"
              >
                <RotateCcw size={16} color={palette.gray[400]} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleStartCooking()}
                activeOpacity={0.88}
                style={[styles.primaryCookBtn, { backgroundColor: palette.coral[500] }]}
                accessibilityRole="button"
                accessibilityLabel={`Resume cooking ${recipe.name} at Step ${progress.currentStep}`}
              >
                <Play size={16} color={palette.white} fill={palette.white} />
                <Text style={styles.primaryCookBtnText}>
                  Resume Cooking · Step {progress.currentStep}/{totalInstructions}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => handleStartCooking(1)}
              activeOpacity={0.88}
              style={[styles.primaryCookBtn, { backgroundColor: palette.coral[500] }]}
              accessibilityRole="button"
              accessibilityLabel={`Start cooking ${recipe.name}`}
            >
              <ChefHat size={18} color={palette.white} />
              <Text style={styles.primaryCookBtnText}>Start Cooking</Text>
            </TouchableOpacity>
          )}
        </GlassSurface>
      </SafeAreaView>

      {/* Shopping List Modal */}
      <ShoppingListModal
        visible={isShoppingModalOpen}
        onClose={() => setIsShoppingModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.forest[900],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroWrapper: {
    width: '100%',
    height: HERO_IMAGE_HEIGHT,
    position: 'relative',
    backgroundColor: palette.forest[800],
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  heroHeaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  heroRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroBottomContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontFamily: typography.families.bold,
    fontSize: 12,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.coral[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  userBadgeText: {
    fontFamily: typography.families.bold,
    fontSize: 11,
    color: palette.white,
  },
  startedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(195, 235, 197, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  startedBadgeText: {
    fontFamily: typography.families.bold,
    fontSize: 11,
    color: palette.mint[300],
  },
  recipeTitle: {
    fontFamily: typography.families.display,
    fontSize: 26,
    lineHeight: 32,
    color: palette.white,
    marginBottom: 12,
  },
  metaChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabContentContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  tabSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  tabSectionHeading: {
    fontFamily: typography.families.bold,
    fontSize: 18,
    color: palette.white,
  },
  tabSectionSub: {
    fontFamily: typography.families.regular,
    fontSize: 12,
    color: palette.gray[400],
    marginTop: 2,
  },
  resetChecksBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  resetChecksBtnText: {
    fontFamily: typography.families.medium,
    fontSize: 11,
    color: palette.gray[300],
  },
  shoppingActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  addShoppingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(195, 235, 197, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(195, 235, 197, 0.25)',
  },
  addShoppingBtnActive: {
    backgroundColor: palette.mint[300],
    borderColor: palette.mint[300],
  },
  addShoppingBtnText: {
    fontFamily: typography.families.semiBold,
    fontSize: 12.5,
    color: palette.mint[300],
  },
  addShoppingBtnTextActive: {
    fontFamily: typography.families.bold,
    fontSize: 12.5,
    color: palette.forest[900],
  },
  viewShoppingListBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  viewShoppingListText: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.text.onDarkSecondary,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  ingredientCardChecked: {
    backgroundColor: 'rgba(195, 235, 197, 0.06)',
    borderColor: 'rgba(195, 235, 197, 0.2)',
  },
  checkIconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientText: {
    fontFamily: typography.families.medium,
    fontSize: 14,
    color: palette.white,
    flex: 1,
    lineHeight: 20,
  },
  ingredientTextChecked: {
    color: palette.gray[500],
    textDecorationLine: 'line-through',
  },
  stepsList: {
    gap: 12,
  },
  stepCard: {
    padding: 16,
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: typography.families.extraBold,
    fontSize: 13,
    color: palette.white,
  },
  stepCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginLeft: 10,
  },
  stepCardLabel: {
    fontFamily: typography.families.bold,
    fontSize: 14,
    color: palette.white,
  },
  stepDoneTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(195, 235, 197, 0.15)',
  },
  stepDoneTagText: {
    fontFamily: typography.families.bold,
    fontSize: 10,
    color: palette.mint[300],
  },
  stepCookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepCookBtnText: {
    fontFamily: typography.families.bold,
    fontSize: 11,
    color: palette.white,
  },
  stepInstructionText: {
    fontFamily: typography.families.regular,
    fontSize: 14,
    lineHeight: 22,
    color: palette.white,
  },
  stepTimerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(242, 182, 90, 0.12)',
    alignSelf: 'flex-start',
  },
  stepTimerChipText: {
    fontFamily: typography.families.medium,
    fontSize: 11,
    color: palette.saffron[400],
  },
  nutritionOverviewCard: {
    padding: 20,
    marginBottom: 16,
  },
  nutritionCaloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nutritionCaloriesLabel: {
    fontFamily: typography.families.medium,
    fontSize: 13,
    color: palette.gray[400],
  },
  nutritionCaloriesValue: {
    fontFamily: typography.families.extraBold,
    fontSize: 32,
    color: palette.white,
    marginTop: 2,
  },
  nutritionCaloriesSub: {
    fontFamily: typography.families.regular,
    fontSize: 12,
    color: palette.mint[300],
    marginTop: 2,
  },
  caloriesFlameCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(242, 182, 90, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(242, 182, 90, 0.3)',
  },
  macroTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 12,
    gap: 2,
  },
  macroSegment: {
    height: '100%',
    borderRadius: 2,
  },
  macrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  macroValue: {
    fontFamily: typography.families.extraBold,
    fontSize: 16,
    color: palette.white,
  },
  macroLabel: {
    fontFamily: typography.families.medium,
    fontSize: 11,
    color: palette.gray[400],
    marginTop: 2,
  },
  macroDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dietTagsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dietTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dietTagText: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.white,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 4,
  },
  stickySurface: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  stickyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  primaryCookBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    shadowColor: palette.coral[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryCookBtnText: {
    fontFamily: typography.families.bold,
    fontSize: 15,
    color: palette.white,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: palette.forest[900],
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: typography.families.medium,
    color: palette.gray[400],
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: typography.families.bold,
    color: palette.white,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: typography.families.regular,
    textAlign: 'center',
    color: palette.gray[400],
    marginBottom: 20,
    lineHeight: 20,
  },
  backHomeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.pill,
    backgroundColor: palette.coral[500],
  },
  backHomeBtnText: {
    color: palette.white,
    fontFamily: typography.families.bold,
    fontSize: 14,
  },
});
