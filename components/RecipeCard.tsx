import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Clock, Flame, Users, Edit3, Trash2 } from 'lucide-react-native';
import { Recipe } from '../types/recipe';
import { FavoriteButton } from './FavoriteButton';
import { getDifficultyColor } from '../utils/recipeUtils';
import { useAppRouter } from '../utils/navigation';

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
  const diffColors = getDifficultyColor(recipe.difficulty);

  const handleCardPress = () => {
    router.push(`/recipe/${recipe.id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleCardPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`View recipe for ${recipe.name}`}
    >
      {/* Top Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: recipe.image }}
          style={styles.image}
          resizeMode="cover"
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
        <Text style={styles.title} numberOfLines={2}>
          {recipe.name}
        </Text>

        {/* Meta Info Row */}
        <View style={styles.metaRow}>
          {/* Prep Time */}
          <View style={styles.metaItem}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.metaText}>{recipe.preparationTime} mins</Text>
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
            <Users size={14} color="#6B7280" />
            <Text style={styles.metaText}>{recipe.servings} serv</Text>
          </View>

          {/* Calories */}
          <View style={styles.metaItem}>
            <Flame size={14} color="#EF4444" />
            <Text style={styles.metaText}>{recipe.calories} kcal</Text>
          </View>
        </View>

        {/* Manage Action Buttons for My Recipes */}
        {showManageActions && (
          <View style={styles.actionsRow}>
            {onEdit && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onEdit(recipe);
                }}
                style={[styles.actionBtn, styles.editBtn]}
              >
                <Edit3 size={15} color="#2563EB" />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onDelete(recipe.id);
                }}
                style={[styles.actionBtn, styles.deleteBtn]}
              >
                <Trash2 size={15} color="#DC2626" />
                <Text style={styles.deleteBtnText}>Delete</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#1F2937',
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
    color: '#6B7280',
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  editBtnText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteBtnText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
  },
});
