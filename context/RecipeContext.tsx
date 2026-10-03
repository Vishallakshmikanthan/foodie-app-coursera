import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Recipe, RecipeFormData } from '../types/recipe';
import { SEED_RECIPES, DEFAULT_RECIPE_IMAGE } from '../data/recipes';
import { storage } from '../utils/storage';

interface RecipeContextType {
  recipes: Recipe[];
  userRecipes: Recipe[];
  favoriteRecipes: Recipe[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toggleFavorite: (recipeId: string) => Promise<void>;
  isFavorite: (recipeId: string) => boolean;
  addRecipe: (data: RecipeFormData) => Promise<Recipe>;
  updateRecipe: (id: string, data: RecipeFormData) => Promise<boolean>;
  deleteRecipe: (id: string) => Promise<boolean>;
  getRecipeById: (id: string) => Recipe | undefined;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [editedRecipes, setEditedRecipes] = useState<Record<string, Recipe>>({});
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [storedUsers, storedFavs, storedEdits, storedDeleted] = await Promise.all([
        storage.getUserRecipes(),
        storage.getFavoriteIds(),
        storage.getEditedRecipes(),
        storage.getDeletedRecipeIds(),
      ]);

      setUserRecipes(storedUsers || []);
      setFavoriteIds(storedFavs || []);
      setEditedRecipes(storedEdits || {});
      setDeletedIds(storedDeleted || []);
    } catch (err) {
      console.error('Failed to load recipe data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute all available recipes combining seeds + edits + user recipes
  const allRecipes: Recipe[] = React.useMemo(() => {
    const deletedSet = new Set(deletedIds);
    const favSet = new Set(favoriteIds);

    // Process seed recipes with any edits
    const processedSeeds = SEED_RECIPES.filter((r) => !deletedSet.has(r.id)).map((seed) => {
      const edited = editedRecipes[seed.id];
      const base = edited ? { ...seed, ...edited } : seed;
      return {
        ...base,
        isFavorite: favSet.has(base.id),
      };
    });

    // Process user recipes with any edits
    const processedUsers = userRecipes
      .filter((r) => !deletedSet.has(r.id))
      .map((uRecipe) => {
        const edited = editedRecipes[uRecipe.id];
        const base = edited ? { ...uRecipe, ...edited } : uRecipe;
        return {
          ...base,
          isUserCreated: true,
          isFavorite: favSet.has(base.id),
        };
      });

    return [...processedUsers, ...processedSeeds];
  }, [userRecipes, favoriteIds, editedRecipes, deletedIds]);

  const activeUserRecipes: Recipe[] = React.useMemo(() => {
    return allRecipes.filter((r) => r.isUserCreated);
  }, [allRecipes]);

  const favoriteRecipes: Recipe[] = React.useMemo(() => {
    return allRecipes.filter((r) => r.isFavorite);
  }, [allRecipes]);

  const isFavorite = useCallback(
    (recipeId: string): boolean => {
      return favoriteIds.includes(recipeId);
    },
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (recipeId: string) => {
      setFavoriteIds((prev) => {
        const next = prev.includes(recipeId)
          ? prev.filter((id) => id !== recipeId)
          : [...prev, recipeId];
        // Persist to storage
        storage.saveFavoriteIds(next);
        return next;
      });
    },
    []
  );

  const addRecipe = useCallback(
    async (data: RecipeFormData): Promise<Recipe> => {
      const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newRecipe: Recipe = {
        id: newId,
        name: data.name.trim(),
        image: data.image && data.image.trim() ? data.image.trim() : DEFAULT_RECIPE_IMAGE,
        category: data.category.trim(),
        ingredients: data.ingredients.map((i) => i.trim()).filter(Boolean),
        instructions: data.instructions.map((i) => i.trim()).filter(Boolean),
        preparationTime: Number(data.preparationTime) || 15,
        servings: Number(data.servings) || 2,
        calories: Number(data.calories) || 300,
        difficulty: data.difficulty || 'Easy',
        isFavorite: false,
        isUserCreated: true,
      };

      const updated = [newRecipe, ...userRecipes];
      setUserRecipes(updated);
      await storage.saveUserRecipes(updated);
      return newRecipe;
    },
    [userRecipes]
  );

  const updateRecipe = useCallback(
    async (id: string, data: RecipeFormData): Promise<boolean> => {
      const isUser = userRecipes.some((r) => r.id === id);

      const updatedFields: Partial<Recipe> = {
        name: data.name.trim(),
        image: data.image && data.image.trim() ? data.image.trim() : DEFAULT_RECIPE_IMAGE,
        category: data.category.trim(),
        ingredients: data.ingredients.map((i) => i.trim()).filter(Boolean),
        instructions: data.instructions.map((i) => i.trim()).filter(Boolean),
        preparationTime: Number(data.preparationTime) || 15,
        servings: Number(data.servings) || 2,
        calories: Number(data.calories) || 300,
        difficulty: data.difficulty || 'Easy',
      };

      if (isUser) {
        const updatedUsers = userRecipes.map((r) =>
          r.id === id ? { ...r, ...updatedFields } : r
        );
        setUserRecipes(updatedUsers);
        await storage.saveUserRecipes(updatedUsers);
      } else {
        const updatedEdits = {
          ...editedRecipes,
          [id]: {
            ...(editedRecipes[id] || SEED_RECIPES.find((s) => s.id === id)!),
            ...updatedFields,
          },
        };
        setEditedRecipes(updatedEdits);
        await storage.saveEditedRecipes(updatedEdits);
      }
      return true;
    },
    [userRecipes, editedRecipes]
  );

  const deleteRecipe = useCallback(
    async (id: string): Promise<boolean> => {
      // 1. Remove from userRecipes
      const updatedUsers = userRecipes.filter((r) => r.id !== id);
      setUserRecipes(updatedUsers);
      await storage.saveUserRecipes(updatedUsers);

      // 2. Add to deleted IDs
      setDeletedIds((prev) => {
        const next = [...prev, id];
        storage.saveDeletedRecipeIds(next);
        return next;
      });

      // 3. Remove from favorites if present
      if (favoriteIds.includes(id)) {
        const nextFavs = favoriteIds.filter((favId) => favId !== id);
        setFavoriteIds(nextFavs);
        await storage.saveFavoriteIds(nextFavs);
      }

      return true;
    },
    [userRecipes, favoriteIds]
  );

  const getRecipeById = useCallback(
    (id: string): Recipe | undefined => {
      return allRecipes.find((r) => r.id === id);
    },
    [allRecipes]
  );

  return (
    <RecipeContext.Provider
      value={{
        recipes: allRecipes,
        userRecipes: activeUserRecipes,
        favoriteRecipes,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        toggleFavorite,
        isFavorite,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        getRecipeById,
        isLoading,
        refreshData: loadData,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};
