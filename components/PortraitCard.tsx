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
import { GlassChip } from './ui/GlassChip';
import { palette, typography, radii } from '../theme/tokens';

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

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      tension: 60,
      friction: 8,
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

  const handleFavoritePress = () => {
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
        { transform: [{ scale: scaleAnim }] },
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
        {/* Peach tinted gradient surface per design tokens */}
        <LinearGradient
          colors={[
            'rgba(252, 191, 164, 0.24)', // peach-200 tint
            'rgba(240, 183, 159, 0.10)',
            'rgba(27, 43, 47, 0.85)',
          ]}
          locations={[0.0, 0.35, 1.0]}
          start={{ x: 0.2, y: 0.0 }}
          end={{ x: 0.8, y: 1.0 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Image Thumbnail */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.image }}
            style={styles.image}
            contentFit="cover"
            transition={250}
            cachePolicy="memory-disk"
          />

          {/* Scrim for contrast */}
          <LinearGradient
            colors={['rgba(14, 26, 23, 0.45)', 'transparent']}
            style={styles.imageScrim}
          />

          {/* Time Chip */}
          <View style={styles.timeChipWrapper}>
            <GlassChip
              label={`${recipe.preparationTime}m`}
              icon={Clock}
              size="sm"
              variant="peach"
            />
          </View>

          {/* Favorite Heart */}
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
            >
              <Heart
                size={16}
                color={recipe.isFavorite ? palette.crimson[400] : palette.white}
                fill={recipe.isFavorite ? palette.crimson[400] : 'transparent'}
                strokeWidth={2.2}
              />
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
              <Text style={styles.categoryText}>{recipe.category}</Text>
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
    borderWidth: 1,
    borderColor: 'rgba(252, 191, 164, 0.28)',
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
    zIndex: 2,
  },
  favoriteWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  heartButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(14, 26, 23, 0.60)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: typography.families.bold,
    fontSize: 13.5,
    lineHeight: 18,
    color: palette.text.onDark,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryText: {
    fontFamily: typography.families.semiBold,
    fontSize: 11,
    color: palette.peach[200],
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginHorizontal: 5,
  },
  caloriesText: {
    fontFamily: typography.families.medium,
    fontSize: 11,
    color: palette.text.onDarkSecondary,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBarsRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 3,
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
    fontFamily: typography.families.medium,
    fontSize: 10,
    color: palette.peach[200],
  },
});

export default PortraitCard;
