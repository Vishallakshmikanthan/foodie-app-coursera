import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, CookingProgress } from '../types/recipe';
import { parseIngredients } from './ingredientUtils';

const STORAGE_KEYS = {
  USER_RECIPES: '@foodie_user_recipes',
  FAVORITES: '@foodie_favorites',
  EDITED_RECIPES: '@foodie_edited_recipes',
  DELETED_RECIPES: '@foodie_deleted_recipes',
  COOKING_PROGRESS: '@foodie_cooking_progress',
};

export const storage = {
  async getUserRecipes(): Promise<Recipe[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_RECIPES);
      if (!data) return [];
      const parsed: any[] = JSON.parse(data);
      // Migrate and normalize ingredients
      return parsed.map((r) => ({
        ...r,
        ingredients: parseIngredients(r.ingredients || []),
      }));
    } catch (error) {
      console.error('Error reading user recipes from storage:', error);
      return [];
    }
  },

  async saveUserRecipes(recipes: Recipe[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_RECIPES, JSON.stringify(recipes));
    } catch (error) {
      console.error('Error saving user recipes to storage:', error);
    }
  },

  async getFavoriteIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading favorites from storage:', error);
      return [];
    }
  },

  async saveFavoriteIds(ids: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(ids));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  },

  async getEditedRecipes(): Promise<Record<string, Recipe>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EDITED_RECIPES);
      if (!data) return {};
      const parsed: Record<string, any> = JSON.parse(data);
      const migrated: Record<string, Recipe> = {};
      for (const [id, r] of Object.entries(parsed)) {
        migrated[id] = {
          ...r,
          ingredients: parseIngredients(r.ingredients || []),
        };
      }
      return migrated;
    } catch (error) {
      console.error('Error reading edited recipes from storage:', error);
      return {};
    }
  },

  async saveEditedRecipes(recipes: Record<string, Recipe>): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EDITED_RECIPES, JSON.stringify(recipes));
    } catch (error) {
      console.error('Error saving edited recipes to storage:', error);
    }
  },

  async getDeletedRecipeIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_RECIPES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading deleted recipes from storage:', error);
      return [];
    }
  },

  async saveDeletedRecipeIds(ids: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DELETED_RECIPES, JSON.stringify(ids));
    } catch (error) {
      console.error('Error saving deleted recipes to storage:', error);
    }
  },

  // Cook Mode Progress Persistence
  async getCookingProgress(): Promise<Record<string, CookingProgress>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COOKING_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading cooking progress from storage:', error);
      return {};
    }
  },

  async saveCookingProgress(progress: Record<string, CookingProgress>): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COOKING_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving cooking progress to storage:', error);
    }
  },

  async getRecipeProgress(recipeId: string): Promise<CookingProgress | undefined> {
    try {
      const progressMap = await this.getCookingProgress();
      return progressMap[recipeId];
    } catch (error) {
      console.error(`Error reading cooking progress for recipe ${recipeId}:`, error);
      return undefined;
    }
  },

  async saveRecipeProgress(
    recipeId: string,
    currentStep: number,
    totalSteps: number,
    completedSteps: number[] = []
  ): Promise<CookingProgress> {
    try {
      const progressMap = await this.getCookingProgress();
      const updated: CookingProgress = {
        recipeId,
        currentStep,
        totalSteps,
        completedSteps,
        lastUpdated: Date.now(),
      };
      progressMap[recipeId] = updated;
      await this.saveCookingProgress(progressMap);
      return updated;
    } catch (error) {
      console.error(`Error saving cooking progress for recipe ${recipeId}:`, error);
      return {
        recipeId,
        currentStep,
        totalSteps,
        completedSteps,
        lastUpdated: Date.now(),
      };
    }
  },

  async clearRecipeProgress(recipeId: string): Promise<void> {
    try {
      const progressMap = await this.getCookingProgress();
      if (progressMap[recipeId]) {
        delete progressMap[recipeId];
        await this.saveCookingProgress(progressMap);
      }
    } catch (error) {
      console.error(`Error clearing cooking progress for recipe ${recipeId}:`, error);
    }
  },
};
