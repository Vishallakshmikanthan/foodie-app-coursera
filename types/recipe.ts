export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface Ingredient {
  quantity?: number;
  unit?: string;
  name: string;
}

export interface CookingProgress {
  recipeId: string;
  currentStep: number; // 1-indexed for display (1 to totalSteps)
  totalSteps: number;
  completedSteps: number[]; // 1-indexed step numbers completed
  lastUpdated: number; // epoch timestamp in ms
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  blurhash?: string;
  category: string;
  ingredients: Ingredient[];
  instructions: string[];
  preparationTime: number;
  servings: number;
  calories: number;
  difficulty: DifficultyLevel;
  isFavorite: boolean;
  isUserCreated: boolean;
}

export type RecipeFormData = {
  name: string;
  image: string;
  category: string;
  ingredients: (Ingredient | string)[];
  instructions: string[];
  preparationTime: number;
  servings: number;
  calories: number;
  difficulty: DifficultyLevel;
};
