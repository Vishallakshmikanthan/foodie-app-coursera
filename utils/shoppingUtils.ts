import { Ingredient } from '../types/recipe';
import { ShoppingItem } from '../types/smart';

/**
 * Categorize common ingredients into grocery sections
 */
export function categorizeIngredient(name: string): ShoppingItem['category'] {
  const lower = name.toLowerCase();

  if (
    lower.includes('egg') ||
    lower.includes('milk') ||
    lower.includes('butter') ||
    lower.includes('cheese') ||
    lower.includes('cream') ||
    lower.includes('yogurt') ||
    lower.includes('parmesan') ||
    lower.includes('mozzarella') ||
    lower.includes('cheddar')
  ) {
    return 'Dairy & Eggs';
  }

  if (
    lower.includes('chicken') ||
    lower.includes('beef') ||
    lower.includes('pork') ||
    lower.includes('salmon') ||
    lower.includes('fish') ||
    lower.includes('shrimp') ||
    lower.includes('bacon') ||
    lower.includes('turkey') ||
    lower.includes('meat') ||
    lower.includes('tuna')
  ) {
    return 'Meat & Seafood';
  }

  if (
    lower.includes('onion') ||
    lower.includes('garlic') ||
    lower.includes('tomato') ||
    lower.includes('avocado') ||
    lower.includes('lemon') ||
    lower.includes('lime') ||
    lower.includes('basil') ||
    lower.includes('cilantro') ||
    lower.includes('parsley') ||
    lower.includes('lettuce') ||
    lower.includes('spinach') ||
    lower.includes('pepper') ||
    lower.includes('mushroom') ||
    lower.includes('cucumber') ||
    lower.includes('carrot') ||
    lower.includes('blueberry') ||
    lower.includes('berry') ||
    lower.includes('apple') ||
    lower.includes('banana') ||
    lower.includes('rosemary') ||
    lower.includes('herb') ||
    lower.includes('kale')
  ) {
    return 'Produce';
  }

  if (
    lower.includes('bread') ||
    lower.includes('sourdough') ||
    lower.includes('bagel') ||
    lower.includes('bun') ||
    lower.includes('tortilla') ||
    lower.includes('crust') ||
    lower.includes('croissant')
  ) {
    return 'Bakery';
  }

  if (
    lower.includes('oil') ||
    lower.includes('flour') ||
    lower.includes('sugar') ||
    lower.includes('salt') ||
    lower.includes('spice') ||
    lower.includes('vinegar') ||
    lower.includes('sauce') ||
    lower.includes('pasta') ||
    lower.includes('noodle') ||
    lower.includes('rice') ||
    lower.includes('honey') ||
    lower.includes('syrup') ||
    lower.includes('baking powder') ||
    lower.includes('baking soda') ||
    lower.includes('vanilla') ||
    lower.includes('cinnamon') ||
    lower.includes('chili flakes') ||
    lower.includes('broth') ||
    lower.includes('stock')
  ) {
    return 'Pantry & Spices';
  }

  return 'Other';
}

/**
 * Merge ingredients into existing shopping list, aggregating matching quantities
 */
export function mergeIngredientsIntoList(
  currentList: ShoppingItem[],
  newIngredients: Ingredient[],
  recipeId?: string,
  recipeName?: string,
  multiplier: number = 1
): ShoppingItem[] {
  const result: ShoppingItem[] = [...currentList];

  for (const ing of newIngredients) {
    const rawQuantity = ing.quantity !== undefined ? ing.quantity * multiplier : undefined;
    const cleanUnit = (ing.unit || '').trim().toLowerCase();
    const cleanName = ing.name.trim();
    const lowerName = cleanName.toLowerCase();

    // Check if item with identical or very close name already exists in unchecked items
    const existingIndex = result.findIndex(
      (item) =>
        !item.isChecked &&
        item.name.toLowerCase() === lowerName &&
        (item.unit || '').toLowerCase() === cleanUnit
    );

    if (existingIndex !== -1 && rawQuantity !== undefined && result[existingIndex].quantity !== undefined) {
      // Aggregate quantities
      const existing = result[existingIndex];
      const aggregatedQuantity = Math.round((existing.quantity! + rawQuantity) * 100) / 100;
      result[existingIndex] = {
        ...existing,
        quantity: aggregatedQuantity,
        addedAt: Date.now(),
      };
    } else {
      // Add as new item
      const newItem: ShoppingItem = {
        id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        quantity: rawQuantity !== undefined ? Math.round(rawQuantity * 100) / 100 : undefined,
        unit: ing.unit,
        isChecked: false,
        recipeId,
        recipeName,
        category: categorizeIngredient(cleanName),
        addedAt: Date.now(),
      };
      result.push(newItem);
    }
  }

  return result;
}

/**
 * Format a shopping item for display (e.g., "2 cups All-purpose Flour")
 */
export function formatShoppingItem(item: ShoppingItem): string {
  if (item.quantity !== undefined && item.unit) {
    return `${item.quantity} ${item.unit} ${item.name}`;
  }
  if (item.quantity !== undefined) {
    return `${item.quantity} ${item.name}`;
  }
  return item.name;
}
