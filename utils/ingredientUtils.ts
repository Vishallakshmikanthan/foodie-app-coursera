import { Ingredient } from '../types/recipe';

const UNICODE_FRACTIONS: Record<string, number> = {
  '½': 0.5,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '¼': 0.25,
  '¾': 0.75,
  '⅕': 0.2,
  '⅖': 0.4,
  '⅗': 0.6,
  '⅘': 0.8,
  '⅙': 1 / 6,
  '⅚': 5 / 6,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
};

const UNITS = [
  'tablespoons',
  'tablespoon',
  'tbsp',
  'tbs',
  'teaspoons',
  'teaspoon',
  'tsp',
  'cups',
  'cup',
  'c',
  'ounces',
  'ounce',
  'oz',
  'pounds',
  'pound',
  'lbs',
  'lb',
  'kilograms',
  'kilogram',
  'kg',
  'grams',
  'gram',
  'g',
  'gm',
  'milliliters',
  'milliliter',
  'ml',
  'liters',
  'liter',
  'l',
  'slices',
  'slice',
  'cloves',
  'clove',
  'pinches',
  'pinch',
  'dashes',
  'dash',
  'pieces',
  'piece',
  'cans',
  'can',
  'stalks',
  'stalk',
  'sprigs',
  'sprig',
  'bunches',
  'bunch',
  'packages',
  'package',
  'pkg',
  'heads',
  'head',
  'bottles',
  'bottle',
  'handfuls',
  'handful',
];

// Regex matching unit at start of words (case-insensitive)
const UNIT_REGEX = new RegExp(
  `^(${UNITS.join('|')})(?:\\b|\\s|\\.|,)(.*)$`,
  'i'
);

/**
 * Parses numeric string including fractions, mixed numbers, and unicode fractions
 * Examples: "2", "1/2", "1 1/2", "2.5", "½", "1½", "2-3", "2 to 3"
 */
function parseQuantityString(str: string): { quantity: number; rest: string } | null {
  const trimmed = str.trim();
  if (!trimmed) return null;

  // Check for leading unicode fraction mixed with number, e.g. "1½"
  const mixedUnicodeMatch = trimmed.match(/^(\d+)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])(.*)$/);
  if (mixedUnicodeMatch) {
    const whole = parseInt(mixedUnicodeMatch[1], 10);
    const fraction = UNICODE_FRACTIONS[mixedUnicodeMatch[2]] || 0;
    return { quantity: whole + fraction, rest: mixedUnicodeMatch[3].trim() };
  }

  // Check for standalone unicode fraction, e.g. "½"
  const singleUnicodeMatch = trimmed.match(/^([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])(.*)$/);
  if (singleUnicodeMatch) {
    const fraction = UNICODE_FRACTIONS[singleUnicodeMatch[1]] || 0;
    return { quantity: fraction, rest: singleUnicodeMatch[2].trim() };
  }

  // Check for range with hyphen or "to", e.g. "2-3" or "2 to 3"
  const rangeMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)(.*)$/i);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    // Use average or lower bound for calculation
    const avg = (low + high) / 2;
    return { quantity: avg, rest: rangeMatch[3].trim() };
  }

  // Check for mixed fraction like "1 1/2" or "2 1/4"
  const mixedFractionMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)(.*)$/);
  if (mixedFractionMatch) {
    const whole = parseInt(mixedFractionMatch[1], 10);
    const num = parseInt(mixedFractionMatch[2], 10);
    const den = parseInt(mixedFractionMatch[3], 10);
    if (den !== 0) {
      return { quantity: whole + num / den, rest: mixedFractionMatch[4].trim() };
    }
  }

  // Check for simple fraction like "1/2" or "3/4"
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)(.*)$/);
  if (fractionMatch) {
    const num = parseInt(fractionMatch[1], 10);
    const den = parseInt(fractionMatch[2], 10);
    if (den !== 0) {
      return { quantity: num / den, rest: fractionMatch[3].trim() };
    }
  }

  // Check for standard decimal or integer number, e.g. "2", "2.5"
  const decimalMatch = trimmed.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (decimalMatch) {
    const qty = parseFloat(decimalMatch[1]);
    return { quantity: qty, rest: decimalMatch[2].trim() };
  }

  return null;
}

/**
 * Parses an ingredient string or object into a structured Ingredient
 * e.g. "2 cups all-purpose flour" -> { quantity: 2, unit: "cups", name: "all-purpose flour" }
 * e.g. "1/2 tsp red chili flakes" -> { quantity: 0.5, unit: "tsp", name: "red chili flakes" }
 * e.g. "Salt to taste" -> { name: "Salt to taste" }
 */
export function parseIngredient(raw: string | Ingredient): Ingredient {
  if (typeof raw === 'object' && raw !== null && 'name' in raw) {
    return {
      quantity: typeof raw.quantity === 'number' && !isNaN(raw.quantity) ? raw.quantity : undefined,
      unit: raw.unit ? raw.unit.trim() : undefined,
      name: raw.name ? raw.name.trim() : '',
    };
  }

  if (typeof raw !== 'string') {
    return { name: String(raw || '') };
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return { name: '' };
  }

  // Attempt to parse leading quantity
  const qtyResult = parseQuantityString(trimmed);
  if (!qtyResult) {
    // No quantity found, return as pure name
    return { name: trimmed };
  }

  const { quantity, rest } = qtyResult;
  if (!rest) {
    return { quantity, name: '' };
  }

  // Check if rest starts with a recognized unit
  const unitMatch = rest.match(UNIT_REGEX);
  if (unitMatch) {
    const unit = unitMatch[1].toLowerCase();
    const remainingName = unitMatch[2].replace(/^[\s,.-]+/, '').trim();
    return {
      quantity,
      unit,
      name: remainingName || unit,
    };
  }

  // If no standard unit, the rest is the ingredient name (e.g. "2 large eggs", "1 ripe Hass avocado")
  return {
    quantity,
    name: rest,
  };
}

/**
 * Batch parses an array of ingredients
 */
export function parseIngredients(list: (string | Ingredient)[]): Ingredient[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => parseIngredient(item))
    .filter((ing) => ing.name.length > 0 || (ing.quantity && ing.quantity > 0));
}

/**
 * Formats a numeric quantity into a human-readable fraction or decimal
 * Examples: 0.5 -> "1/2", 1.5 -> "1 1/2", 2.25 -> "2 1/4", 3 -> "3"
 */
export function formatQuantity(quantity?: number, multiplier: number = 1): string {
  if (quantity === undefined || quantity === null || isNaN(quantity) || quantity <= 0) {
    return '';
  }

  const val = quantity * multiplier;
  if (val <= 0) return '';

  const whole = Math.floor(val);
  const frac = val - whole;

  // Fraction lookup with tolerance
  const eps = 0.05;
  let fracStr = '';

  if (Math.abs(frac - 0.125) < eps) fracStr = '1/8';
  else if (Math.abs(frac - 0.2) < eps) fracStr = '1/5';
  else if (Math.abs(frac - 0.25) < eps) fracStr = '1/4';
  else if (Math.abs(frac - 0.333) < eps) fracStr = '1/3';
  else if (Math.abs(frac - 0.375) < eps) fracStr = '3/8';
  else if (Math.abs(frac - 0.5) < eps) fracStr = '1/2';
  else if (Math.abs(frac - 0.625) < eps) fracStr = '5/8';
  else if (Math.abs(frac - 0.666) < eps) fracStr = '2/3';
  else if (Math.abs(frac - 0.75) < eps) fracStr = '3/4';
  else if (Math.abs(frac - 0.875) < eps) fracStr = '7/8';

  if (fracStr) {
    return whole > 0 ? `${whole} ${fracStr}` : fracStr;
  }

  if (frac < 0.01) {
    return `${whole}`;
  }

  // Format to at most 1 decimal place if close, else 2
  const formatted = val.toFixed(1);
  return formatted.endsWith('.0') ? `${whole}` : formatted;
}

/**
 * Formats an ingredient into an editorial string with scaled amount
 * e.g. { quantity: 2, unit: "cups", name: "flour" }, 1.5 -> "3 cups flour"
 */
export function formatIngredient(ingredient: Ingredient | string, multiplier: number = 1): string {
  const parsed = parseIngredient(ingredient);
  const qtyStr = formatQuantity(parsed.quantity, multiplier);

  if (!qtyStr) {
    return parsed.name;
  }

  if (parsed.unit) {
    return `${qtyStr} ${parsed.unit} ${parsed.name}`;
  }

  return `${qtyStr} ${parsed.name}`;
}

/**
 * Scales an ingredient by multiplier
 */
export function scaleIngredient(ingredient: Ingredient, multiplier: number = 1): Ingredient {
  return {
    ...ingredient,
    quantity:
      typeof ingredient.quantity === 'number' && !isNaN(ingredient.quantity)
        ? ingredient.quantity * multiplier
        : undefined,
  };
}

/**
 * Scales an array of ingredients
 */
export function scaleIngredients(ingredients: Ingredient[], multiplier: number = 1): Ingredient[] {
  return ingredients.map((ing) => scaleIngredient(ing, multiplier));
}
