import { Recipe } from '../types/recipe';
import { RecentlyViewedItem } from '../types/smart';

export type TimeOfDaySlot = 'morning' | 'lunch' | 'afternoon' | 'evening' | 'latenight';

export interface RecommendationResult {
  recipe: Recipe;
  score: number;
  reason: string;
}

/**
 * Determine the user's current meal slot based on local time
 */
export function getTimeOfDaySlot(date: Date = new Date()): TimeOfDaySlot {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 17.5) return 'afternoon';
  if (hour >= 17.5 && hour < 23) return 'evening';
  return 'latenight';
}

/**
 * Check if recipe category matches current time of day slot
 */
function matchesTimeSlot(category: string, slot: TimeOfDaySlot): boolean {
  const cat = category.toLowerCase();
  switch (slot) {
    case 'morning':
      return cat === 'breakfast' || cat === 'drinks';
    case 'lunch':
      return cat === 'lunch' || cat === 'salads' || cat === 'soups';
    case 'afternoon':
      return cat === 'snacks' || cat === 'desserts' || cat === 'drinks';
    case 'evening':
      return cat === 'dinner' || cat === 'soups' || cat === 'non-vegetarian' || cat === 'vegetarian';
    case 'latenight':
      return cat === 'snacks' || cat === 'desserts' || cat === 'drinks';
    default:
      return false;
  }
}

/**
 * Get friendly subtitle reason for the recommendation
 */
function getRecommendationReason(
  recipe: Recipe,
  slot: TimeOfDaySlot,
  isFavCategory: boolean,
  isRecentlyViewedCategory: boolean
): string {
  if (matchesTimeSlot(recipe.category, slot)) {
    switch (slot) {
      case 'morning':
        return recipe.preparationTime <= 20 ? 'Quick morning bite' : 'Fresh breakfast favorite';
      case 'lunch':
        return 'Ideal midday lunch';
      case 'afternoon':
        return 'Afternoon refreshment';
      case 'evening':
        return 'Perfect evening dinner';
      case 'latenight':
        return 'Late night comfort';
    }
  }

  if (isFavCategory) {
    return `Because you love ${recipe.category}`;
  }

  if (isRecentlyViewedCategory) {
    return 'Similar to recent dishes';
  }

  if (recipe.preparationTime <= 20) {
    return `Ready in ${recipe.preparationTime} min`;
  }

  if (recipe.calories < 400) {
    return 'Light & nutrient-rich';
  }

  return `${recipe.category} specialty`;
}

/**
 * Smart recommendation engine scoring all recipes
 */
export function getSmartRecommendations(
  allRecipes: Recipe[],
  favoriteRecipes: Recipe[],
  recentlyViewed: RecentlyViewedItem[] = [],
  limit: number = 6
): RecommendationResult[] {
  if (!allRecipes || allRecipes.length === 0) return [];

  const timeSlot = getTimeOfDaySlot();
  const recentIds = new Set(recentlyViewed.slice(0, 10).map((r) => r.recipeId));

  // Count favorite categories
  const favoriteCategoryCounts: Record<string, number> = {};
  for (const fav of favoriteRecipes) {
    const cat = fav.category.toLowerCase();
    favoriteCategoryCounts[cat] = (favoriteCategoryCounts[cat] || 0) + 1;
  }

  // Count recently viewed categories
  const recentCategoryCounts: Record<string, number> = {};
  for (const item of recentlyViewed.slice(0, 8)) {
    const found = allRecipes.find((r) => r.id === item.recipeId);
    if (found) {
      const cat = found.category.toLowerCase();
      recentCategoryCounts[cat] = (recentCategoryCounts[cat] || 0) + 1;
    }
  }

  const scoredList: RecommendationResult[] = allRecipes.map((recipe) => {
    let score = 50; // Baseline score
    const catLower = recipe.category.toLowerCase();

    // 1. Time of day matching (+35 points)
    const timeMatch = matchesTimeSlot(recipe.category, timeSlot);
    if (timeMatch) {
      score += 35;
    }

    // 2. Favorite category preference (+25 points)
    const favCount = favoriteCategoryCounts[catLower] || 0;
    const isFavCategory = favCount > 0;
    if (isFavCategory) {
      score += Math.min(25, favCount * 12);
    }

    // 3. Recently viewed category synergy (+18 points)
    const recentCatCount = recentCategoryCounts[catLower] || 0;
    const isRecentCategory = recentCatCount > 0;
    if (isRecentCategory) {
      score += Math.min(18, recentCatCount * 9);
    }

    // 4. Quick prep bonus (+10 points)
    if (recipe.preparationTime <= 25) {
      score += 10;
    }

    // 5. Already favorite boost (+12 points)
    if (recipe.isFavorite) {
      score += 12;
    }

    // 6. User-created dishes pride (+15 points)
    if (recipe.isUserCreated) {
      score += 15;
    }

    // 7. Prevent identical repetition: if viewed in the last 20 minutes, slight offset
    if (recentIds.has(recipe.id)) {
      score -= 8;
    }

    const reason = getRecommendationReason(recipe, timeSlot, isFavCategory, isRecentCategory);

    return {
      recipe,
      score,
      reason,
    };
  });

  // Sort by highest score first
  scoredList.sort((a, b) => b.score - a.score);

  // Guarantee category diversity in the top results
  const diversified: RecommendationResult[] = [];
  const seenCategories = new Set<string>();

  // Pass 1: pick top-scoring unique categories
  for (const item of scoredList) {
    if (!seenCategories.has(item.recipe.category.toLowerCase())) {
      diversified.push(item);
      seenCategories.add(item.recipe.category.toLowerCase());
      if (diversified.length >= limit) break;
    }
  }

  // Pass 2: fill remaining slots with next highest scores
  if (diversified.length < limit) {
    for (const item of scoredList) {
      if (!diversified.some((d) => d.recipe.id === item.recipe.id)) {
        diversified.push(item);
        if (diversified.length >= limit) break;
      }
    }
  }

  return diversified;
}
