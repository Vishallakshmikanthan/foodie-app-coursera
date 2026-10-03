import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../types/recipe';

const STORAGE_KEYS = {
  USER_RECIPES: '@foodie_user_recipes',
  FAVORITES: '@foodie_favorites',
  EDITED_RECIPES: '@foodie_edited_recipes',
  DELETED_RECIPES: '@foodie_deleted_recipes',
};

export const storage = {
  async getUserRecipes(): Promise<Recipe[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_RECIPES);
      return data ? JSON.parse(data) : [];
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
      return data ? JSON.parse(data) : {};
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
};
