export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface Recipe {
  id: string;
  name: string;
  image: string;
  category: string;
  ingredients: string[];
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
  ingredients: string[];
  instructions: string[];
  preparationTime: number;
  servings: number;
  calories: number;
  difficulty: DifficultyLevel;
};
