import { DifficultyLevel } from './recipe';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  rawText?: string;
  isChecked: boolean;
  recipeId?: string;
  recipeName?: string;
  category?: 'Produce' | 'Dairy & Eggs' | 'Meat & Seafood' | 'Pantry & Spices' | 'Bakery' | 'Other';
  addedAt: number;
}

export interface RecipeFilterOptions {
  maxCookTime?: number; // In minutes: 15, 30, 45, 60 or undefined for any
  difficulty?: DifficultyLevel | 'All';
  diet?: 'All' | 'Vegetarian' | 'Non-Vegetarian' | 'Low-Calorie';
  maxCalories?: number; // e.g. 400, 600, 800
  category?: string;
  searchQuery?: string;
}

export interface RecentlyViewedItem {
  recipeId: string;
  viewedAt: number;
}

export interface ScoredRecipe {
  recipeId: string;
  score: number;
  reason: string;
}
