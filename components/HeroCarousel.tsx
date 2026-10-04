import React, { useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Recipe } from '../types/recipe';
import { HeroCard } from './HeroCard';
import { palette, radii } from '../theme/tokens';

export interface HeroCarouselProps {
  recipes: Recipe[];
  onToggleFavorite: (id: string) => void;
  onPressRecipe: (recipe: Recipe) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  recipes,
  onToggleFavorite,
  onPressRecipe,
}) => {
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;

  // Selected 3 to 5 featured spotlight recipes
  const featuredRecipes = useMemo(() => {
    if (!recipes || recipes.length === 0) return [];
    // Prioritize high-visual seed recipes or favorites
    const priorityIds = ['seed-1', 'seed-4', 'seed-2', 'seed-6', 'seed-16'];
    const curated = priorityIds
      .map((id) => recipes.find((r) => r.id === id))
      .filter((r): r is Recipe => Boolean(r));

    if (curated.length >= 3) {
      return curated.slice(0, 5);
    }

    // Fallback: take top 4
    return recipes.slice(0, 4);
  }, [recipes]);

  // Card geometry
  const CARD_WIDTH = Math.min(width * 0.82, 330);
  const CARD_SPACING = 14;
  const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;
  const SIDE_INSET = (width - CARD_WIDTH) / 2;
  const CARD_HEIGHT = 360;

  if (featuredRecipes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingLeft: SIDE_INSET,
            paddingRight: SIDE_INSET - CARD_SPACING,
          },
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: Platform.OS !== 'web' }
        )}
      >
        {featuredRecipes.map((recipe, index) => {
          const inputRange = [
            (index - 1) * SNAP_INTERVAL,
            index * SNAP_INTERVAL,
            (index + 1) * SNAP_INTERVAL,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.93, 1.0, 0.93],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.82, 1.0, 0.82],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={recipe.id}
              style={[
                styles.cardWrapper,
                {
                  marginRight: CARD_SPACING,
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            >
              <HeroCard
                recipe={recipe}
                cardWidth={CARD_WIDTH}
                cardHeight={CARD_HEIGHT}
                onToggleFavorite={onToggleFavorite}
                onPress={onPressRecipe}
              />
            </Animated.View>
          );
        })}
      </Animated.ScrollView>

      {/* Pagination Indicator Dots */}
      <View style={styles.paginationRow}>
        {featuredRecipes.map((recipe, index) => {
          const dotWidth = scrollX.interpolate({
            inputRange: [
              (index - 1) * SNAP_INTERVAL,
              index * SNAP_INTERVAL,
              (index + 1) * SNAP_INTERVAL,
            ],
            outputRange: [6, 20, 6],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * SNAP_INTERVAL,
              index * SNAP_INTERVAL,
              (index + 1) * SNAP_INTERVAL,
            ],
            outputRange: [0.35, 1.0, 0.35],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={recipe.id}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: palette.mint[300],
  },
});

export default HeroCarousel;
