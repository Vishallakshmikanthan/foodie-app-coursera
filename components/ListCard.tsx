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
import { Clock, Flame, Users, Edit3, Trash2, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Recipe } from '../types/recipe';
import { GlassSurface } from './ui/GlassSurface';
import { GlassChip } from './ui/GlassChip';
import { useAppRouter } from '../utils/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { palette, typography, radii, shadows } from '../theme/tokens';
import { getCategoryTint, getDifficultyDots } from '../theme/categoryTints';

export interface ListCardProps {
  recipe: Recipe;
  onToggleFavorite: (id: string) => void;
  onPress?: (recipe: Recipe) => void;
  showManageActions?: boolean;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const ListCard: React.FC<ListCardProps> = ({
  recipe,
  onToggleFavorite,
  onPress,
  showManageActions = false,
  onEdit,
  onDelete,
  style,
}) => {
  const router = useAppRouter();
  const { colors, isDark } = useTheme();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  // Category tint and subtle difficulty dots
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

  const handleCardPress = () => {
    if (onPress) {
      onPress(recipe);
    } else {
      router.push(`/recipe/${recipe.id}`);
    }
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
        toValue: 1.35,
        duration: 110,
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
          borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : colors.border,
          backgroundColor: isDark ? palette.forest[850] : colors.surface,
        },
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleCardPress}
        style={styles.innerTouchable}
        accessibilityRole="button"
        accessibilityLabel={`View recipe for ${recipe.name}`}
      >
        {/* Per-category ambient tint gradient overlay */}
        <LinearGradient
          colors={tint.gradientOverlay}
          start={{ x: 0.1, y: 0.0 }}
          end={{ x: 0.9, y: 1.0 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Top Image Container with Scrims */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.image }}
            placeholder={{ blurhash: recipe.blurhash || tint.blurhash }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />

          {/* Top Scrim for pill contrast */}
          <LinearGradient
            colors={['rgba(14, 26, 23, 0.65)', 'rgba(14, 26, 23, 0.0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.topScrim}
          />

          {/* Bottom Scrim with subtle category glow */}
          <LinearGradient
            colors={[
              'rgba(14, 26, 23, 0.0)',
              tint.glowColor,
              'rgba(14, 26, 23, 0.75)',
              'rgba(14, 26, 23, 0.95)',
            ]}
            locations={[0.0, 0.45, 0.78, 1.0]}
            start={{ x: 0.5, y: 0.1 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.bottomScrim}
          />

          {/* Top Controls Row */}
          <View style={styles.topRow}>
            {/* Glass Time Chip */}
            <GlassChip
              label={`${recipe.preparationTime} min`}
              icon={Clock}
              variant={tint.chipVariant}
              size="sm"
              accessibilityLabel={`Preparation time ${recipe.preparationTime} minutes`}
            />

            {/* Glass Favorite Button */}
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <TouchableOpacity
                onPress={handleFavoritePress}
                activeOpacity={0.8}
                style={styles.favoriteButton}
                accessibilityRole="button"
                accessibilityLabel={
                  recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'
                }
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <GlassSurface
                  variant="regular"
                  borderRadius={18}
                  intensity={Platform.OS === 'ios' ? 45 : 35}
                  style={styles.favoriteGlass}
                  contentContainerStyle={styles.favoriteCenter}
                >
                  <Heart
                    size={17}
                    color={recipe.isFavorite ? palette.crimson[400] : palette.white}
                    fill={recipe.isFavorite ? palette.crimson[400] : 'transparent'}
                    strokeWidth={2.2}
                  />
                </GlassSurface>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Header Row: Category Tag & Difficulty Dots */}
          <View style={styles.categoryRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: tint.badgeBg, borderColor: tint.badgeBorder },
              ]}
            >
              <Text style={[styles.categoryBadgeText, { color: tint.accent }]}>
                {recipe.category.toUpperCase()}
              </Text>
            </View>

            {/* Subtle Difficulty Dots & Label (No busy pills!) */}
            <View style={styles.difficultyContainer}>
              <Text style={[styles.difficultyDotsText, { color: diffDots.color }]}>
                {diffDots.dots}
              </Text>
              <Text style={[styles.difficultyLabel, { color: colors.textSecondary }]}>
                {diffDots.label}
              </Text>
            </View>
          </View>

          {/* Dish Title */}
          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
            numberOfLines={2}
          >
            {recipe.name}
          </Text>

          {/* Subtle Metadata Line */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Users size={13} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {recipe.servings} serv
              </Text>
            </View>

            <View style={styles.dotSeparator} />

            <View style={styles.metaItem}>
              <Flame size={13} color={palette.saffron[400]} strokeWidth={2.2} />
              <Text style={[styles.metaText, { color: palette.saffron[400] }]}>
                {recipe.calories} kcal
              </Text>
            </View>

            <View style={styles.dotSeparator} />

            <View style={styles.metaItem}>
              <Clock size={13} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {recipe.preparationTime} mins
              </Text>
            </View>
          </View>

          {/* Manage Action Buttons for My Food Screen */}
          {showManageActions && (
            <View
              style={[
                styles.actionsRow,
                { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.10)' : colors.borderSubtle },
              ]}
            >
              {onEdit && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onEdit(recipe);
                  }}
                  style={styles.actionBtnWrapper}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${recipe.name}`}
                >
                  <GlassSurface
                    variant="regular"
                    borderRadius={12}
                    style={styles.actionBtnGlass}
                    contentContainerStyle={styles.actionBtnInner}
                  >
                    <Edit3 size={14} color={palette.peach[300]} strokeWidth={2.2} />
                    <Text style={[styles.actionBtnText, { color: palette.peach[300] }]}>
                      Edit
                    </Text>
                  </GlassSurface>
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onDelete(recipe.id);
                  }}
                  style={styles.actionBtnWrapper}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${recipe.name}`}
                >
                  <GlassSurface
                    variant="regular"
                    borderRadius={12}
                    style={styles.actionBtnGlass}
                    contentContainerStyle={styles.actionBtnInner}
                  >
                    <Trash2 size={14} color={palette.crimson[400]} strokeWidth={2.2} />
                    <Text style={[styles.actionBtnText, { color: palette.crimson[400] }]}>
                      Delete
                    </Text>
                  </GlassSurface>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: radii.xl, // 22pt
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1.2,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  innerTouchable: {
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: 195,
    position: 'relative',
    backgroundColor: palette.forest[900],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  bottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  topRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  favoriteButton: {
    borderRadius: 18,
  },
  favoriteGlass: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  favoriteCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontFamily: typography.families.bold,
    letterSpacing: 0.8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  difficultyDotsText: {
    fontSize: 12,
    letterSpacing: 1.5,
  },
  difficultyLabel: {
    fontSize: 12,
    fontFamily: typography.families.medium,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.families.bold,
    marginBottom: 10,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
  },
  metaText: {
    fontSize: 12.5,
    fontFamily: typography.families.medium,
  },
  dotSeparator: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  actionBtnWrapper: {
    flex: 1,
  },
  actionBtnGlass: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    gap: 6,
  },
  actionBtnText: {
    fontFamily: typography.families.semiBold,
    fontSize: 13,
  },
});
