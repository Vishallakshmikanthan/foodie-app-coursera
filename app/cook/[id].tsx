import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  Circle,
  ChefHat,
  ListFilter,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';
import { useRecipes } from '../../context/RecipeContext';
import { useAppRouter, useAppParams } from '../../utils/navigation';
import { detectTimerInText, formatTimerRemaining } from '../../utils/timerUtils';
import { formatIngredient } from '../../utils/ingredientUtils';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { GlassIconButton } from '../../components/ui/GlassIconButton';
import { palette, typography, radii } from '../../theme/tokens';
import { getCategoryTint } from '../../theme/categoryTints';
import { haptics } from '../../utils/haptics';
import { useReducedMotion } from '../../utils/motion';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CookModeScreen() {
  // Keep the device screen awake while cooking in the kitchen
  useKeepAwake();

  const router = useAppRouter();
  const { id } = useAppParams<{ id: string }>();
  const {
    getRecipeById,
    updateCookingProgress,
    clearCookingProgress,
    getRecipeProgress,
  } = useRecipes();

  const recipe = id ? getRecipeById(id) : undefined;
  const tint = recipe ? getCategoryTint(recipe.category) : getCategoryTint('Dinner');

  // Step state
  const isReducedMotion = useReducedMotion();
  const totalSteps = recipe ? recipe.instructions.length : 1;
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isCompletedModalVisible, setIsCompletedModalVisible] = useState<boolean>(false);
  const [isIngredientsModalVisible, setIsIngredientsModalVisible] = useState<boolean>(false);

  // Checked ingredients state inside cook mode
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerTotal, setTimerTotal] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [timerLabel, setTimerLabel] = useState<string>('');
  const [isTimerFinishedAlert, setIsTimerFinishedAlert] = useState<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  // Animations
  const stepOpacity = useRef(new Animated.Value(1)).current;
  const stepTranslateX = useRef(new Animated.Value(0)).current;
  const timerPulseAnim = useRef(new Animated.Value(1)).current;

  // Initialize from saved cooking progress
  useEffect(() => {
    if (!recipe) return;
    const saved = getRecipeProgress(recipe.id);
    if (saved && saved.currentStep >= 1) {
      const stepIdx = Math.min(saved.currentStep - 1, totalSteps - 1);
      setCurrentStepIndex(stepIdx);
      if (saved.completedSteps) {
        setCompletedSteps(new Set(saved.completedSteps));
      }
    }
  }, [recipe?.id]);

  // Save progress whenever step index changes
  const saveCurrentProgress = useCallback(
    (stepIdx: number, completedSet: Set<number>) => {
      if (!recipe) return;
      updateCookingProgress(recipe.id, stepIdx + 1, Array.from(completedSet));
    },
    [recipe, updateCookingProgress]
  );

  // Countdown timer effect
  useEffect(() => {
    if (isTimerActive && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerActive(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerActive, timerSeconds]);

  const handleTimerComplete = () => {
    setIsTimerFinishedAlert(true);
    haptics.timerComplete();

    if (!isReducedMotion) {
      // Pulse animation
      Animated.sequence([
        Animated.timing(timerPulseAnim, {
          toValue: 1.15,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(timerPulseAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  };

  const startTimer = (seconds: number, label: string) => {
    haptics.impactMedium();
    setTimerTotal(seconds);
    setTimerSeconds(seconds);
    setTimerLabel(label);
    setIsTimerActive(true);
    setIsTimerFinishedAlert(false);
  };

  const toggleTimerPause = () => {
    setIsTimerActive((prev) => !prev);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimerSeconds(timerTotal);
    setIsTimerFinishedAlert(false);
  };

  const addOneMinuteToTimer = () => {
    setTimerSeconds((prev) => prev + 60);
    setTimerTotal((prev) => prev + 60);
  };

  // Step transition
  const transitionToStep = (newIndex: number, direction: 'next' | 'prev') => {
    if (newIndex < 0 || newIndex >= totalSteps) return;

    haptics.stepChange();

    if (isReducedMotion) {
      setCurrentStepIndex(newIndex);
      const updatedCompleted = new Set(completedSteps);
      if (direction === 'next') {
        updatedCompleted.add(currentStepIndex + 1);
        setCompletedSteps(updatedCompleted);
      }
      saveCurrentProgress(newIndex, updatedCompleted);
      return;
    }

    const slideOut = direction === 'next' ? -50 : 50;
    const slideIn = direction === 'next' ? 50 : -50;

    Animated.parallel([
      Animated.timing(stepOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(stepTranslateX, {
        toValue: slideOut,
        duration: 120,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setCurrentStepIndex(newIndex);
      stepTranslateX.setValue(slideIn);

      // Mark previous step as completed
      const updatedCompleted = new Set(completedSteps);
      if (direction === 'next') {
        updatedCompleted.add(currentStepIndex + 1);
        setCompletedSteps(updatedCompleted);
      }
      saveCurrentProgress(newIndex, updatedCompleted);

      Animated.parallel([
        Animated.timing(stepOpacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(stepTranslateX, {
          toValue: 0,
          tension: 70,
          friction: 9,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      transitionToStep(currentStepIndex + 1, 'next');
    } else {
      // Final step complete!
      const updatedCompleted = new Set(completedSteps);
      updatedCompleted.add(totalSteps);
      setCompletedSteps(updatedCompleted);
      if (recipe) {
        clearCookingProgress(recipe.id);
      }
      haptics.timerComplete();
      setIsCompletedModalVisible(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      transitionToStep(currentStepIndex - 1, 'prev');
    }
  };

  const handleExit = () => {
    if (recipe) {
      saveCurrentProgress(currentStepIndex, completedSteps);
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  // Swipe gesture recognition
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 25 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          // Swiped left -> Next step
          handleNext();
        } else if (gestureState.dx > 50) {
          // Swiped right -> Prev step
          handlePrev();
        }
      },
    })
  ).current;

  if (!recipe) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Recipe Not Found</Text>
        <TouchableOpacity onPress={handleExit} style={styles.errorBtn}>
          <Text style={styles.errorBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentInstruction = recipe.instructions[currentStepIndex] || '';
  const detectedTimer = detectTimerInText(currentInstruction);
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <SafeAreaView style={styles.rootSafeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <GlassIconButton
            icon={X}
            size={40}
            iconSize={20}
            onPress={handleExit}
            accessibilityLabel="Exit Cook Mode and save progress"
          />

          <View style={styles.headerCenter}>
            <Text style={styles.headerRecipeTitle} numberOfLines={1}>
              {recipe.name}
            </Text>
            <Text style={styles.headerStepSubtitle}>
              Step {currentStepIndex + 1} of {totalSteps}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsIngredientsModalVisible(true)}
            activeOpacity={0.7}
            style={styles.ingredientsPill}
            accessibilityRole="button"
            accessibilityLabel="View recipe ingredients"
          >
            <ListFilter size={14} color={palette.mint[300]} />
            <Text style={styles.ingredientsPillText}>Ingredients</Text>
          </TouchableOpacity>
        </View>

        {/* Slim Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: tint.accent,
                shadowColor: tint.accent,
              },
            ]}
          />
        </View>

        {/* Main Step Body with Swipe Navigation */}
        <View style={styles.stepContainer} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              styles.stepAnimatedWrapper,
              {
                opacity: stepOpacity,
                transform: [{ translateX: stepTranslateX }],
              },
            ]}
          >
            {/* Step Counter Badge */}
            <View style={styles.stepMetaRow}>
              <View
                style={[
                  styles.stepBadge,
                  {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.18)',
                  },
                ]}
              >
                <ChefHat size={14} color={tint.accent} />
                <Text style={[styles.stepBadgeText, { color: tint.accent }]}>
                  STEP {currentStepIndex + 1} OF {totalSteps}
                </Text>
              </View>

              {completedSteps.has(currentStepIndex + 1) && (
                <View style={styles.completedTag}>
                  <CheckCircle2 size={13} color={palette.mint[300]} />
                  <Text style={styles.completedTagText}>Completed</Text>
                </View>
              )}
            </View>

            {/* Step Instruction Card */}
            <ScrollView
              style={styles.instructionScroll}
              contentContainerStyle={styles.instructionScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.instructionText}>
                {currentInstruction}
              </Text>

              {/* Automatic Timer Suggestion Card */}
              {detectedTimer && timerSeconds === 0 && (
                <GlassSurface
                  variant="prominent"
                  intensity={40}
                  borderRadius={radii.lg}
                  style={styles.timerSuggestionCard}
                >
                  <View style={styles.timerSuggestionLeft}>
                    <View style={[styles.timerIconCircle, { backgroundColor: 'rgba(242, 182, 90, 0.2)' }]}>
                      <Clock size={20} color={palette.saffron[400]} />
                    </View>
                    <View style={styles.timerSuggestionInfo}>
                      <Text style={styles.timerSuggestionHeading}>Timer Detected</Text>
                      <Text style={styles.timerSuggestionSub}>
                        {detectedTimer.actionText}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      startTimer(detectedTimer.durationSeconds, detectedTimer.actionText)
                    }
                    style={[styles.startTimerBtn, { backgroundColor: palette.coral[500] }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Start ${detectedTimer.label} countdown timer`}
                  >
                    <Play size={13} color={palette.white} fill={palette.white} />
                    <Text style={styles.startTimerBtnText}>Start {detectedTimer.label}</Text>
                  </TouchableOpacity>
                </GlassSurface>
              )}

              {/* Active Timer Display (if running or paused on this step) */}
              {timerTotal > 0 && (
                <Animated.View
                  style={[
                    styles.activeTimerCard,
                    { transform: [{ scale: timerPulseAnim }] },
                  ]}
                >
                  <GlassSurface
                    variant="peach"
                    intensity={55}
                    borderRadius={radii.xl}
                    style={styles.activeTimerSurface}
                  >
                    <View style={styles.activeTimerTopRow}>
                      <View style={styles.activeTimerHeadingRow}>
                        <Clock size={16} color={palette.peach[300]} />
                        <Text style={styles.activeTimerLabel} numberOfLines={1}>
                          {timerLabel || 'Step Countdown'}
                        </Text>
                      </View>

                      {isTimerFinishedAlert ? (
                        <View style={styles.timerDoneBadge}>
                          <Sparkles size={13} color={palette.mint[300]} />
                          <Text style={styles.timerDoneBadgeText}>DONE!</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={addOneMinuteToTimer}
                          activeOpacity={0.7}
                          style={styles.addMinuteBtn}
                        >
                          <Plus size={12} color={palette.white} />
                          <Text style={styles.addMinuteBtnText}>1 min</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Big Countdown Digits */}
                    <Text
                      style={[
                        styles.timerDigits,
                        isTimerFinishedAlert && styles.timerDigitsDone,
                      ]}
                    >
                      {formatTimerRemaining(timerSeconds)}
                    </Text>

                    {/* Timer progress ratio line */}
                    <View style={styles.timerProgressTrack}>
                      <View
                        style={[
                          styles.timerProgressFill,
                          {
                            width: `${Math.max(0, Math.min(100, (timerSeconds / timerTotal) * 100))}%`,
                          },
                        ]}
                      />
                    </View>

                    {/* Timer Controls Row */}
                    <View style={styles.timerControlsRow}>
                      <TouchableOpacity
                        onPress={resetTimer}
                        activeOpacity={0.7}
                        style={styles.timerControlBtn}
                        accessibilityLabel="Reset timer"
                      >
                        <RotateCcw size={16} color={palette.gray[300]} />
                        <Text style={styles.timerControlBtnText}>Reset</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={toggleTimerPause}
                        activeOpacity={0.8}
                        style={[
                          styles.timerMainPlayBtn,
                          { backgroundColor: isTimerActive ? palette.coral[500] : palette.mint[300] },
                        ]}
                        accessibilityLabel={isTimerActive ? 'Pause timer' : 'Resume timer'}
                      >
                        {isTimerActive ? (
                          <>
                            <Pause size={16} color={palette.white} />
                            <Text style={styles.timerMainPlayBtnText}>Pause</Text>
                          </>
                        ) : (
                          <>
                            <Play size={16} color={palette.forest[900]} fill={palette.forest[900]} />
                            <Text
                              style={[
                                styles.timerMainPlayBtnText,
                                { color: palette.forest[900] },
                              ]}
                            >
                              Resume
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </GlassSurface>
                </Animated.View>
              )}
            </ScrollView>
          </Animated.View>
        </View>

        {/* Glass Bottom Control Bar */}
        <View style={styles.bottomBarContainer}>
          <GlassSurface
            variant="prominent"
            intensity={50}
            borderRadius={radii.pill}
            borderWidth={1}
            style={styles.bottomBar}
            contentContainerStyle={styles.bottomBarContent}
          >
            {/* Prev Button */}
            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentStepIndex === 0}
              activeOpacity={0.75}
              style={[
                styles.navBtn,
                currentStepIndex === 0 && styles.navBtnDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Previous Step"
            >
              <ChevronLeft
                size={20}
                color={currentStepIndex === 0 ? palette.gray[600] : palette.white}
              />
              <Text
                style={[
                  styles.navBtnText,
                  currentStepIndex === 0 && styles.navBtnTextDisabled,
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            {/* Quick Timer Pill (Toggle / Status) */}
            {timerTotal > 0 ? (
              <TouchableOpacity
                onPress={toggleTimerPause}
                activeOpacity={0.8}
                style={[
                  styles.timerStatusChip,
                  isTimerActive && styles.timerStatusChipActive,
                ]}
              >
                <Clock
                  size={14}
                  color={isTimerActive ? palette.coral[500] : palette.gray[300]}
                />
                <Text
                  style={[
                    styles.timerStatusChipText,
                    isTimerActive && styles.timerStatusChipTextActive,
                  ]}
                >
                  {formatTimerRemaining(timerSeconds)}
                </Text>
              </TouchableOpacity>
            ) : detectedTimer ? (
              <TouchableOpacity
                onPress={() =>
                  startTimer(detectedTimer.durationSeconds, detectedTimer.actionText)
                }
                activeOpacity={0.8}
                style={styles.timerStatusChip}
              >
                <Clock size={14} color={palette.saffron[400]} />
                <Text style={styles.timerStatusChipText}>{detectedTimer.label}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.stepDotIndicator}>
                <Text style={styles.stepDotText}>
                  {currentStepIndex + 1}/{totalSteps}
                </Text>
              </View>
            )}

            {/* Next / Complete Button */}
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.85}
              style={[
                styles.nextBtn,
                { backgroundColor: currentStepIndex === totalSteps - 1 ? palette.mint[300] : palette.coral[500] },
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                currentStepIndex === totalSteps - 1
                  ? 'Complete Recipe'
                  : 'Next Step'
              }
            >
              <Text
                style={[
                  styles.nextBtnText,
                  currentStepIndex === totalSteps - 1 && { color: palette.forest[900] },
                ]}
              >
                {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
              </Text>
              <ChevronRight
                size={18}
                color={currentStepIndex === totalSteps - 1 ? palette.forest[900] : palette.white}
              />
            </TouchableOpacity>
          </GlassSurface>
        </View>

        {/* Ingredients Quick Sheet Modal */}
        <Modal
          visible={isIngredientsModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setIsIngredientsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Recipe Ingredients</Text>
                  <Text style={styles.modalSubtitle}>
                    {recipe.ingredients.length} items for {recipe.servings} servings
                  </Text>
                </View>
                <GlassIconButton
                  icon={X}
                  size={36}
                  iconSize={18}
                  onPress={() => setIsIngredientsModalVisible(false)}
                  accessibilityLabel="Close ingredients modal"
                />
              </View>

              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
              >
                {recipe.ingredients.map((ing, idx) => {
                  const isChecked = !!checkedIngredients[idx];
                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.7}
                      onPress={() =>
                        setCheckedIngredients((prev) => ({
                          ...prev,
                          [idx]: !prev[idx],
                        }))
                      }
                      style={[
                        styles.ingredientModalRow,
                        isChecked && styles.ingredientModalRowChecked,
                      ]}
                    >
                      {isChecked ? (
                        <CheckCircle2 size={20} color={palette.mint[300]} />
                      ) : (
                        <Circle size={20} color={palette.gray[500]} />
                      )}
                      <Text
                        style={[
                          styles.ingredientModalText,
                          isChecked && styles.ingredientModalTextChecked,
                        ]}
                      >
                        {formatIngredient(ing)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Recipe Finished Celebration Modal */}
        <Modal
          visible={isCompletedModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setIsCompletedModalVisible(false)}
        >
          <View style={styles.modalOverlayCenter}>
            <GlassSurface
              variant="prominent"
              intensity={60}
              borderRadius={radii.xxl}
              style={styles.celebrationCard}
            >
              <View style={styles.celebrationIconCircle}>
                <Sparkles size={36} color={palette.mint[300]} />
              </View>

              <Text style={styles.celebrationTitle}>Bon Appétit! 🎉</Text>
              <Text style={styles.celebrationSubtitle}>
                You completed cooking {recipe.name}!
              </Text>

              <View style={styles.celebrationStatsRow}>
                <View style={styles.celebrationStat}>
                  <Text style={styles.celebrationStatValue}>{recipe.preparationTime}</Text>
                  <Text style={styles.celebrationStatLabel}>mins cooked</Text>
                </View>
                <View style={styles.celebrationDivider} />
                <View style={styles.celebrationStat}>
                  <Text style={styles.celebrationStatValue}>{totalSteps}</Text>
                  <Text style={styles.celebrationStatLabel}>steps finished</Text>
                </View>
                <View style={styles.celebrationDivider} />
                <View style={styles.celebrationStat}>
                  <Text style={styles.celebrationStatValue}>{recipe.servings}</Text>
                  <Text style={styles.celebrationStatLabel}>servings made</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setIsCompletedModalVisible(false);
                  handleExit();
                }}
                style={styles.celebrationFinishBtn}
              >
                <Text style={styles.celebrationFinishBtnText}>Return to Recipe</Text>
                <ArrowRight size={18} color={palette.forest[900]} />
              </TouchableOpacity>
            </GlassSurface>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootSafeArea: {
    flex: 1,
    backgroundColor: palette.forest[900],
  },
  container: {
    flex: 1,
    backgroundColor: palette.forest[900],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerRecipeTitle: {
    fontFamily: typography.families.bold,
    fontSize: 15,
    color: palette.white,
    textAlign: 'center',
  },
  headerStepSubtitle: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.gray[400],
    marginTop: 2,
  },
  ingredientsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  ingredientsPillText: {
    fontFamily: typography.families.bold,
    fontSize: 12,
    color: palette.mint[300],
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepAnimatedWrapper: {
    flex: 1,
  },
  stepMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  stepBadgeText: {
    fontFamily: typography.families.extraBold,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  completedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(195, 235, 197, 0.15)',
  },
  completedTagText: {
    fontFamily: typography.families.bold,
    fontSize: 11,
    color: palette.mint[300],
  },
  instructionScroll: {
    flex: 1,
  },
  instructionScrollContent: {
    paddingBottom: 110,
  },
  instructionText: {
    fontFamily: typography.families.display,
    fontSize: 24,
    lineHeight: 36,
    color: palette.white,
    letterSpacing: 0.2,
    marginVertical: 10,
  },
  timerSuggestionCard: {
    marginTop: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerSuggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  timerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerSuggestionInfo: {
    flex: 1,
  },
  timerSuggestionHeading: {
    fontFamily: typography.families.bold,
    fontSize: 14,
    color: palette.white,
  },
  timerSuggestionSub: {
    fontFamily: typography.families.regular,
    fontSize: 12,
    color: palette.gray[300],
    marginTop: 2,
  },
  startTimerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
  },
  startTimerBtnText: {
    fontFamily: typography.families.bold,
    fontSize: 12,
    color: palette.white,
  },
  activeTimerCard: {
    marginTop: 20,
  },
  activeTimerSurface: {
    padding: 18,
  },
  activeTimerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activeTimerHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  activeTimerLabel: {
    fontFamily: typography.families.bold,
    fontSize: 13,
    color: palette.peach[200],
  },
  addMinuteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  addMinuteBtnText: {
    fontFamily: typography.families.bold,
    fontSize: 11,
    color: palette.white,
  },
  timerDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(195, 235, 197, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  timerDoneBadgeText: {
    fontFamily: typography.families.extraBold,
    fontSize: 11,
    color: palette.mint[300],
  },
  timerDigits: {
    fontFamily: typography.families.extraBold,
    fontSize: 48,
    color: palette.white,
    textAlign: 'center',
    marginVertical: 4,
    letterSpacing: 2,
  },
  timerDigitsDone: {
    color: palette.mint[300],
  },
  timerProgressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginVertical: 10,
    overflow: 'hidden',
  },
  timerProgressFill: {
    height: '100%',
    backgroundColor: palette.peach[300],
    borderRadius: 2,
  },
  timerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 6,
  },
  timerControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  timerControlBtnText: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.gray[300],
  },
  timerMainPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
  },
  timerMainPlayBtnText: {
    fontFamily: typography.families.bold,
    fontSize: 13,
    color: palette.white,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  bottomBar: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navBtnText: {
    fontFamily: typography.families.bold,
    fontSize: 14,
    color: palette.white,
  },
  navBtnTextDisabled: {
    color: palette.gray[600],
  },
  timerStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  timerStatusChipActive: {
    backgroundColor: 'rgba(240, 138, 106, 0.2)',
    borderWidth: 1,
    borderColor: palette.coral[500],
  },
  timerStatusChipText: {
    fontFamily: typography.families.bold,
    fontSize: 12,
    color: palette.gray[300],
  },
  timerStatusChipTextActive: {
    color: palette.coral[500],
  },
  stepDotIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepDotText: {
    fontFamily: typography.families.bold,
    fontSize: 12,
    color: palette.gray[400],
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  nextBtnText: {
    fontFamily: typography.families.bold,
    fontSize: 14,
    color: palette.white,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: palette.forest[900],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontFamily: typography.families.bold,
    fontSize: 18,
    color: palette.white,
    marginBottom: 16,
  },
  errorBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: palette.coral[500],
  },
  errorBtnText: {
    fontFamily: typography.families.bold,
    fontSize: 14,
    color: palette.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: palette.forest[800],
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '75%',
    paddingBottom: 34,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    fontFamily: typography.families.bold,
    fontSize: 18,
    color: palette.white,
  },
  modalSubtitle: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.gray[400],
    marginTop: 2,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  modalScrollContent: {
    paddingBottom: 20,
    gap: 8,
  },
  ingredientModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ingredientModalRowChecked: {
    backgroundColor: 'rgba(195, 235, 197, 0.08)',
    borderColor: 'rgba(195, 235, 197, 0.25)',
  },
  ingredientModalText: {
    fontFamily: typography.families.medium,
    fontSize: 14,
    color: palette.white,
    flex: 1,
  },
  ingredientModalTextChecked: {
    color: palette.gray[500],
    textDecorationLine: 'line-through',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  celebrationCard: {
    width: '100%',
    maxWidth: 340,
    padding: 28,
    alignItems: 'center',
  },
  celebrationIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(195, 235, 197, 0.18)',
    borderWidth: 1,
    borderColor: palette.mint[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  celebrationTitle: {
    fontFamily: typography.families.display,
    fontSize: 24,
    color: palette.white,
    marginBottom: 6,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontFamily: typography.families.regular,
    fontSize: 14,
    color: palette.gray[300],
    textAlign: 'center',
    marginBottom: 20,
  },
  celebrationStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  celebrationStat: {
    alignItems: 'center',
  },
  celebrationStatValue: {
    fontFamily: typography.families.extraBold,
    fontSize: 18,
    color: palette.mint[300],
  },
  celebrationStatLabel: {
    fontFamily: typography.families.regular,
    fontSize: 11,
    color: palette.gray[400],
    marginTop: 2,
  },
  celebrationDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  celebrationFinishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.mint[300],
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.pill,
    width: '100%',
    justifyContent: 'center',
  },
  celebrationFinishBtnText: {
    fontFamily: typography.families.bold,
    fontSize: 15,
    color: palette.forest[900],
  },
});
