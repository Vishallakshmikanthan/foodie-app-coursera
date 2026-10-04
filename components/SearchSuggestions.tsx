import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { History, Sparkles, X, ChevronRight } from 'lucide-react-native';
import { palette, typography, radii } from '../theme/tokens';
import { haptics } from '../utils/haptics';

export interface SearchSuggestionsProps {
  recentSearches: string[];
  onSelectQuery: (query: string) => void;
  onClearRecentSearches?: () => void;
  popularIngredients?: string[];
  style?: any;
}

const DEFAULT_INGREDIENTS = [
  'Avocado',
  'Garlic',
  'Chicken',
  'Salmon',
  'Pasta',
  'Egg',
  'Tomato',
  'Basil',
  'Mushrooms',
  'Lemon',
];

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  recentSearches,
  onSelectQuery,
  onClearRecentSearches,
  popularIngredients = DEFAULT_INGREDIENTS,
  style,
}) => {
  if (recentSearches.length === 0 && popularIngredients.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <History size={13} color={palette.text.onDarkSecondary} />
              <Text style={styles.sectionTitle}>Recent Searches</Text>
            </View>
            {onClearRecentSearches && (
              <TouchableOpacity
                onPress={() => {
                  haptics.buttonPress();
                  onClearRecentSearches();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {recentSearches.slice(0, 6).map((query, index) => (
              <TouchableOpacity
                key={`${query}-${index}`}
                onPress={() => {
                  haptics.buttonPress();
                  onSelectQuery(query);
                }}
                activeOpacity={0.7}
                style={styles.recentChip}
              >
                <Text style={styles.recentChipText}>{query}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Popular Ingredient Suggestions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Sparkles size={13} color={palette.mint[300]} />
            <Text style={styles.sectionTitle}>Search by Ingredient</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {popularIngredients.map((ingredient) => (
            <TouchableOpacity
              key={ingredient}
              onPress={() => {
                haptics.buttonPress();
                onSelectQuery(ingredient);
              }}
              activeOpacity={0.75}
              style={styles.ingredientChip}
            >
              <Text style={styles.ingredientChipText}>{ingredient}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    gap: 12,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontFamily: typography.families.bold,
    fontSize: 12,
    color: palette.text.onDarkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  clearText: {
    fontFamily: typography.families.medium,
    fontSize: 11,
    color: palette.peach[300],
  },
  chipsRow: {
    gap: 8,
    paddingRight: 10,
  },
  recentChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  recentChipText: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.text.onDark,
  },
  ingredientChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(195, 235, 197, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(195, 235, 197, 0.25)',
  },
  ingredientChipText: {
    fontFamily: typography.families.semiBold,
    fontSize: 12,
    color: palette.mint[300],
  },
});

export default SearchSuggestions;
