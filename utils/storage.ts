import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, CookingProgress } from '../types/recipe';
import { ShoppingItem, RecentlyViewedItem } from '../types/smart';
import { UserProfile, DEFAULT_USER_PROFILE } from '../types/user';
import { parseIngredients } from './ingredientUtils';

const STORAGE_KEYS = {
  USER_RECIPES: '@foodie_user_recipes',
  FAVORITES: '@foodie_favorites',
  EDITED_RECIPES: '@foodie_edited_recipes',
  DELETED_RECIPES: '@foodie_deleted_recipes',
  COOKING_PROGRESS: '@foodie_cooking_progress',
  RECENTLY_VIEWED: '@foodie_recently_viewed',
  RECENT_SEARCHES: '@foodie_recent_searches',
  SHOPPING_LIST: '@foodie_shopping_list',
  USER_PROFILE: '@foodie_user_profile',
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

  // Recently Viewed Recipes (Ordered by most recent, capped at 20)
  async getRecentlyViewed(): Promise<RecentlyViewedItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading recently viewed from storage:', error);
      return [];
    }
  },

  async addRecentlyViewed(recipeId: string): Promise<RecentlyViewedItem[]> {
    try {
      const current = await this.getRecentlyViewed();
      const filtered = current.filter((item) => item.recipeId !== recipeId);
      const updated = [{ recipeId, viewedAt: Date.now() }, ...filtered].slice(0, 20);
      await AsyncStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error adding recently viewed recipe:', error);
      return [];
    }
  },

  // Recent Search Queries (Capped at 10)
  async getRecentSearches(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading recent searches from storage:', error);
      return [];
    }
  },

  async addRecentSearch(query: string): Promise<string[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    try {
      const current = await this.getRecentSearches();
      const filtered = current.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error saving recent search:', error);
      return [];
    }
  },

  async clearRecentSearches(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  },

  // Shopping List Persistence
  async getShoppingList(): Promise<ShoppingItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading shopping list from storage:', error);
      return [];
    }
  },

  async saveShoppingList(items: ShoppingItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving shopping list:', error);
    }
  },

  // User Profile Persistence
  async getUserProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!data) return DEFAULT_USER_PROFILE;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_USER_PROFILE,
        ...parsed,
      };
    } catch (error) {
      console.error('Error reading user profile from storage:', error);
      return DEFAULT_USER_PROFILE;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile to storage:', error);
    }
  },

  // Complete data reset for QA and testing
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all app data:', error);
    }
  },
};

