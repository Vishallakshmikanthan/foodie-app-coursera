import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Play, Heart, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Recipe } from '../types/recipe';
import { GlassSurface } from './ui/GlassSurface';
import { GlassChip } from './ui/GlassChip';
import { palette, typography, radii, shadows } from '../theme/tokens';
import { getCategoryTint, getDifficultyDots } from '../theme/categoryTints';

export interface HeroCardProps {
  recipe: Recipe;
  onToggleFavorite: (id: string) => void;
  onPress: (recipe: Recipe) => void;
  cardWidth: number;
  cardHeight?: number;
  style?: StyleProp<ViewStyle>;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  recipe,
  onToggleFavorite,
  onPress,
  cardWidth,
  cardHeight = 370,
  style,
}) => {
  const cardScale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  const tint = getCategoryTint(recipe.category);
  const diffDots = getDifficultyDots(recipe.difficulty);

  const handleCardPressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.97,
      tension: 65,
      friction: 7,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handleCardPressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handleFavoritePress = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      // Fallback
    }

    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.35,
        duration: 120,
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

  const handleStartCookingPress = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      // Fallback
    }
    onPress(recipe);
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          width: cardWidth,
          height: cardHeight,
          transform: [{ scale: cardScale }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handleCardPressIn}
        onPressOut={handleCardPressOut}
        onPress={() => onPress(recipe)}
        style={styles.innerTouchable}
        accessibilityRole="button"
        accessibilityLabel={`Featured recipe: ${recipe.name}`}
      >
        {/* Full-bleed Food Image */}
        <Image
          source={{ uri: recipe.image }}
          placeholder={{ blurhash: recipe.blurhash || tint.blurhash }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />

        {/* Top subtle scrim for badge visibility */}
        <LinearGradient
          colors={['rgba(14, 26, 23, 0.55)', 'rgba(14, 26, 23, 0.0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.topScrim}
        />

        {/* Bottom deep gradient with signature category glow and teal atmosphere */}
        <LinearGradient
          colors={[
            'rgba(14, 26, 23, 0.0)',
            tint.glowColor || 'rgba(73, 176, 161, 0.20)', // category glow
            'rgba(14, 26, 23, 0.70)',
            'rgba(14, 26, 23, 0.95)',
          ]}
          locations={[0.0, 0.35, 0.7, 1.0]}
          start={{ x: 0.5, y: 0.2 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.bottomScrim}
        />

        {/* Top Controls Row */}
        <View style={styles.topRow}>
          {/* Cook Time Chip: Signature white pill with dark text from reference */}
          <GlassChip
            label={`${recipe.preparationTime} min`}
            icon={Clock}
            variant="white"
            size="md"
            accessibilityLabel={`Takes ${recipe.preparationTime} minutes`}
          />

          {/* Frosted Glass Favorite Button */}
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <TouchableOpacity
              onPress={handleFavoritePress}
              activeOpacity={0.8}
              style={styles.favoriteButton}
              accessibilityRole="button"
              accessibilityLabel={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <GlassSurface
                variant="regular"
                borderRadius={20}
                intensity={Platform.OS === 'ios' ? 45 : 35}
                style={styles.favoriteGlass}
                contentContainerStyle={styles.favoriteCenter}
              >
                <Heart
                  size={19}
                  color={recipe.isFavorite ? palette.crimson[400] : palette.white}
                  fill={recipe.isFavorite ? palette.crimson[400] : 'transparent'}
                  strokeWidth={2.2}
                />
              </GlassSurface>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom Glass Caption Strip */}
        <View style={styles.bottomStripContainer}>
          <GlassSurface
            variant="prominent"
            borderRadius={22}
            borderWidth={1.2}
            intensity={Platform.OS === 'ios' ? 50 : 38}
            style={styles.captionGlass}
            contentContainerStyle={styles.captionContent}
          >
            {/* Dish Information */}
            <View style={styles.dishInfo}>
              <View style={styles.metaRow}>
                <Text style={styles.categoryBadgeText}>
                  {recipe.category.toUpperCase()}
                </Text>
                <View style={styles.dotSeparator} />
                <Text style={{ fontSize: 11, color: diffDots.color, letterSpacing: 1 }}>
                  {diffDots.dots}
                </Text>
                <View style={styles.dotSeparator} />
                <View style={styles.caloriesRow}>
                  <Flame size={12} color={palette.saffron[400]} />
                  <Text style={styles.caloriesText}>{recipe.calories} kcal</Text>
                </View>
              </View>

              <Text style={styles.dishTitle} numberOfLines={1}>
                {recipe.name}
              </Text>
            </View>

            {/* "Start cooking" Action Button */}
            <TouchableOpacity
              onPress={handleStartCookingPress}
              activeOpacity={0.85}
              style={styles.startCookingButton}
              accessibilityRole="button"
              accessibilityLabel={`Start cooking ${recipe.name}`}
            >
              <Text style={styles.startCookingText}>Cook</Text>
              <View style={styles.playIconCircle}>
                <Play size={11} color={palette.coral[500]} fill={palette.coral[500]} />
              </View>
            </TouchableOpacity>
          </GlassSurface>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: palette.forest[800],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  innerTouchable: {
    flex: 1,
    position: 'relative',
    justifyContent: 'space-between',
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    zIndex: 1,
  },
  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 190,
    zIndex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 10,
  },
  favoriteButton: {
    width: 40,
    height: 40,
  },
  favoriteGlass: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomStripContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    zIndex: 10,
  },
  captionGlass: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  captionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dishInfo: {
    flex: 1,
    marginRight: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontFamily: typography.families.bold,
    fontSize: 10.5,
    letterSpacing: 0.6,
    color: palette.mint[300],
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 6,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  caloriesText: {
    fontFamily: typography.families.medium,
    fontSize: 11,
    color: palette.saffron[400],
  },
  dishTitle: {
    fontFamily: typography.families.bold,
    fontSize: 18,
    color: palette.white,
    letterSpacing: -0.3,
  },
  startCookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.coral[500],
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: radii.pill,
    gap: 6,
    shadowColor: palette.coral[500],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  startCookingText: {
    fontFamily: typography.families.bold,
    fontSize: 13,
    color: palette.white,
    letterSpacing: -0.1,
  },
  playIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 1.5,
  },
});

export default HeroCard;
