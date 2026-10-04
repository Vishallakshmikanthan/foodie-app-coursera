import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { CATEGORIES } from '../data/recipes';
import { useAppRouter } from '../utils/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { palette, typography } from '../theme/tokens';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  All: '🍽️',
  Breakfast: '🥞',
  Lunch: '🥗',
  Dinner: '🍝',
  Desserts: '🍰',
  Snacks: '🥟',
  Soups: '🍲',
  Salads: '🥬',
  Drinks: '🍹',
  Vegetarian: '🥑',
  'Non-Vegetarian': '🍗',
  'My Food': '👨‍🍳',
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const router = useAppRouter();
  const { colors, isDark } = useTheme();

  const handlePress = (category: string) => {
    if (category === 'My Food') {
      router.push('/my-food');
    } else {
      onSelectCategory(category);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          const isMyFood = category === 'My Food';

          return (
            <TouchableOpacity
              key={category}
              onPress={() => handlePress(category)}
              activeOpacity={0.7}
              style={[
                styles.categoryChip,
                isDark ? styles.categoryChipDark : styles.categoryChipLight,
                isSelected && (isDark ? styles.categoryChipSelectedDark : styles.categoryChipSelectedLight),
                isMyFood && !isSelected && (isDark ? styles.myFoodChipDark : styles.myFoodChipLight),
              ]}
            >
              <Text style={styles.emojiText}>{CATEGORY_EMOJIS[category] || '🍴'}</Text>
              <Text
                style={[
                  styles.categoryText,
                  { color: isDark ? colors.textSecondary : colors.textSecondary },
                  isSelected && styles.categoryTextSelected,
                  isMyFood && !isSelected && (isDark ? styles.myFoodTextDark : styles.myFoodTextLight),
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
  },
  categoryChipDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  categoryChipLight: {
    backgroundColor: palette.gray[100],
    borderColor: palette.gray[200],
  },
  categoryChipSelectedDark: {
    backgroundColor: palette.coral[500],
    borderColor: palette.coral[500],
    shadowColor: palette.coral[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryChipSelectedLight: {
    backgroundColor: palette.coral[500],
    borderColor: palette.coral[500],
    shadowColor: palette.coral[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  myFoodChipDark: {
    backgroundColor: 'rgba(240, 183, 159, 0.14)',
    borderColor: 'rgba(240, 183, 159, 0.32)',
  },
  myFoodChipLight: {
    backgroundColor: palette.peach[50],
    borderColor: palette.peach[500],
  },
  emojiText: {
    fontSize: 15,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: typography.families.semiBold,
  },
  categoryTextSelected: {
    color: palette.white,
    fontFamily: typography.families.bold,
  },
  myFoodTextDark: {
    color: palette.peach[200],
    fontFamily: typography.families.bold,
  },
  myFoodTextLight: {
    color: palette.coral[600],
    fontFamily: typography.families.bold,
  },
});
