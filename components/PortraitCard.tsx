import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Recipe } from '../types/recipe';
import { GlassSurface } from './ui/GlassSurface';
import { GlassChip } from './ui/GlassChip';
import { palette, typography, radii } from '../theme/tokens';
import { getCategoryTint, getDifficultyDots } from '../theme/categoryTints';

export interface PortraitCardProps {
  recipe: Recipe;
  onToggleFavorite: (id: string) => void;
  onPress: (recipe: Recipe) => void;
  hasStartedProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export const PortraitCard: React.FC<PortraitCardProps> = ({
  recipe,
  onToggleFavorite,
  onPress,
  hasStartedProgress = false,
  currentStep = 2,
  totalSteps = 5,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  const tint = getCategoryTint(recipe.category);
  const diffDots = getDifficultyDots(recipe.difficulty);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 65,
      friction: 7,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handleFavoritePress = (e?: any) => {
    e?.stopPropagation?.();

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // Fallback
    }

    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    onToggleFavorite(recipe.id);
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }],
          borderColor: tint.badgeBorder || 'rgba(252, 191, 164, 0.28)',
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(recipe)}
        style={styles.touchable}
        accessibilityRole="button"
        accessibilityLabel={`Recommended recipe: ${recipe.name}`}
      >
        {/* Category tinted gradient surface per design tokens */}
        <LinearGradient
          colors={tint.gradientOverlay}
          locations={[0.0, 0.35, 1.0]}
          start={{ x: 0.2, y: 0.0 }}
          end={{ x: 0.8, y: 1.0 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Image Thumbnail */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.image }}
            placeholder={{ blurhash: recipe.blurhash || tint.blurhash }}
            style={styles.image}
            contentFit="cover"
            transition={250}
            cachePolicy="memory-disk"
          />

          {/* Scrim for contrast */}
          <LinearGradient
            colors={['rgba(14, 26, 23, 0.55)', 'transparent']}
            style={styles.imageScrim}
          />

          {/* Time Chip */}
          <View style={styles.timeChipWrapper}>
            <GlassChip
              label={`${recipe.preparationTime}m`}
              icon={Clock}
              size="sm"
              variant={tint.chipVariant}
            />
          </View>

          {/* Glass Favorite Heart Button */}
          <Animated.View
            style={[
              styles.favoriteWrapper,
              { transform: [{ scale: heartScale }] },
            ]}
          >
            <TouchableOpacity
              onPress={handleFavoritePress}
              activeOpacity={0.7}
              style={styles.heartButton}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel={
                recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <GlassSurface
                variant="regular"
                borderRadius={15}
                intensity={35}
                style={styles.favoriteGlass}
                contentContainerStyle={styles.favoriteCenter}
              >
                <Heart
                  size={14}
                  color={recipe.isFavorite ? palette.crimson[400] : palette.white}
                  fill={recipe.isFavorite ? palette.crimson[400] : 'transparent'}
                  strokeWidth={2.2}
                />
              </GlassSurface>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Card Body */}
        <View style={styles.body}>
          {/* Dish Title */}
          <Text style={styles.title} numberOfLines={2}>
            {recipe.name}
          </Text>

          {/* Subtitle / Progress indicator */}
          {hasStartedProgress ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarsRow}>
                {Array.from({ length: totalSteps }).map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.stepBar,
                      idx < currentStep ? styles.stepBarActive : styles.stepBarInactive,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.progressText}>Started · Step {currentStep}/{totalSteps}</Text>
            </View>
          ) : (
            <View style={styles.subtitleRow}>
              <Text style={[styles.categoryText, { color: tint.accent }]}>
                {recipe.category}
              </Text>
              <View style={styles.dot} />
              <Text style={[styles.diffDots, { color: diffDots.color }]}>
                {diffDots.dots}
              </Text>
              <View style={styles.dot} />
              <Text style={styles.caloriesText}>{recipe.calories} kcal</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 165,
    height: 236,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1.2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    backgroundColor: palette.forest[800],
  },
  touchable: {
    flex: 1,
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: 124,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  timeChipWrapper: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  favoriteWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  heartButton: {
    borderRadius: 15,
  },
  favoriteGlass: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  favoriteCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14.5,
    fontFamily: typography.families.bold,
    color: palette.white,
    lineHeight: 18.5,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: typography.families.semiBold,
  },
  dot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  diffDots: {
    fontSize: 9.5,
    letterSpacing: 0.8,
  },
  caloriesText: {
    fontSize: 11,
    fontFamily: typography.families.medium,
    color: palette.gray[400],
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBarsRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 4,
  },
  stepBar: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  stepBarActive: {
    backgroundColor: palette.peach[300],
  },
  stepBarInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressText: {
    fontSize: 10.5,
    fontFamily: typography.families.semiBold,
    color: palette.peach[200],
  },
});
