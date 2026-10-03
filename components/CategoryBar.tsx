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
                isSelected && styles.categoryChipSelected,
                isMyFood && styles.myFoodChip,
              ]}
            >
              <Text style={styles.emojiText}>{CATEGORY_EMOJIS[category] || '🍴'}</Text>
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextSelected,
                  isMyFood && styles.myFoodText,
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
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  myFoodChip: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  emojiText: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  myFoodText: {
    color: '#EA580C',
    fontWeight: '700',
  },
});
