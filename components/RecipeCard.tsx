import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Clock, Flame, Users, Edit3, Trash2 } from 'lucide-react-native';
import { Recipe } from '../types/recipe';
import { FavoriteButton } from './FavoriteButton';
import { getDifficultyColor } from '../utils/recipeUtils';
import { useAppRouter } from '../utils/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { palette, typography } from '../theme/tokens';

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite: (id: string) => void;
  showManageActions?: boolean;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (id: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onToggleFavorite,
  showManageActions = false,
  onEdit,
  onDelete,
}) => {
  const router = useAppRouter();
  const { colors, isDark } = useTheme();
  const diffColors = getDifficultyColor(recipe.difficulty, isDark);

  const handleCardPress = () => {
    router.push(`/recipe/${recipe.id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleCardPress}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surface : colors.surface,
          borderColor: colors.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`View recipe for ${recipe.name}`}
    >
      {/* Top Image Container */}
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: isDark ? palette.forest[800] : palette.gray[200] },
        ]}
      >
        <Image
          source={{ uri: recipe.image }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />

        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{recipe.category}</Text>
        </View>

        {/* Favorite Button */}
        <View style={styles.favoriteButtonWrapper}>
          <FavoriteButton
            isFavorite={recipe.isFavorite}
            onPress={() => onToggleFavorite(recipe.id)}
          />
        </View>
      </View>

      {/* Content Container */}
      <View style={styles.content}>
        {/* Title */}
        <Text
          style={[
            styles.title,
            { color: colors.text },
          ]}
          numberOfLines={2}
        >
          {recipe.name}
        </Text>

        {/* Meta Info Row */}
        <View style={styles.metaRow}>
          {/* Prep Time */}
          <View style={styles.metaItem}>
            <Clock size={14} color={isDark ? colors.textSecondary : palette.gray[500]} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {recipe.preparationTime} mins
            </Text>
          </View>

          {/* Difficulty Badge */}
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: diffColors.bg, borderColor: diffColors.border },
            ]}
          >
            <Text style={[styles.difficultyText, { color: diffColors.text }]}>
              {recipe.difficulty}
            </Text>
          </View>

          {/* Servings */}
          <View style={styles.metaItem}>
            <Users size={14} color={isDark ? colors.textSecondary : palette.gray[500]} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {recipe.servings} serv
            </Text>
          </View>

          {/* Calories */}
          <View style={styles.metaItem}>
            <Flame size={14} color={colors.accentSaffron} />
            <Text style={[styles.metaText, { color: colors.accentSaffron }]}>
              {recipe.calories} kcal
            </Text>
          </View>
        </View>

        {/* Manage Action Buttons for My Recipes */}
        {showManageActions && (
          <View
            style={[
              styles.actionsRow,
              { borderTopColor: colors.borderSubtle },
            ]}
          >
            {onEdit && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onEdit(recipe);
                }}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: colors.editButtonBg,
                    borderColor: colors.editButtonBorder,
                  },
                ]}
              >
                <Edit3 size={15} color={colors.editButton} />
                <Text style={[styles.editBtnText, { color: colors.editButton }]}>Edit</Text>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onDelete(recipe.id);
                }}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: colors.deleteButtonBg,
                    borderColor: colors.deleteButtonBorder,
                  },
                ]}
              >
                <Trash2 size={15} color={colors.deleteButton} />
                <Text style={[styles.deleteBtnText, { color: colors.deleteButton }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(14, 26, 23, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  categoryBadgeText: {
    color: palette.white,
    fontSize: 12,
    fontFamily: typography.families.bold,
    letterSpacing: 0.3,
  },
  favoriteButtonWrapper: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 17,
    fontFamily: typography.families.bold,
    marginBottom: 10,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontFamily: typography.families.medium,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: typography.families.bold,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  editBtnText: {
    fontFamily: typography.families.semiBold,
    fontSize: 13,
  },
  deleteBtnText: {
    fontFamily: typography.families.semiBold,
    fontSize: 13,
  },
});
