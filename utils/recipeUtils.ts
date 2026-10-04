import { Alert, Platform } from 'react-native';
import { DifficultyLevel, RecipeFormData } from '../types/recipe';
import { palette, difficultyColors } from '../theme/tokens';

export function validateRecipeForm(data: RecipeFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Recipe name is required.';
  }

  if (!data.category || !data.category.trim()) {
    errors.category = 'Please select a category.';
  }

  if (!data.ingredients || data.ingredients.length === 0) {
    errors.ingredients = 'Please add at least one ingredient.';
  } else {
    const hasValidIngredient = data.ingredients.some((ing) => ing && ing.trim().length > 0);
    if (!hasValidIngredient) {
      errors.ingredients = 'At least one ingredient cannot be empty.';
    }
  }

  if (!data.instructions || data.instructions.length === 0) {
    errors.instructions = 'Please add at least one instruction step.';
  } else {
    const hasValidInstruction = data.instructions.some(
      (step) => step && step.trim().length > 0
    );
    if (!hasValidInstruction) {
      errors.instructions = 'At least one instruction step cannot be empty.';
    }
  }

  if (isNaN(data.preparationTime) || data.preparationTime <= 0) {
    errors.preparationTime = 'Preparation time must be a positive number in minutes.';
  }

  if (isNaN(data.servings) || data.servings <= 0) {
    errors.servings = 'Servings must be a positive number.';
  }

  if (isNaN(data.calories) || data.calories < 0) {
    errors.calories = 'Calories must be 0 or greater.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function getDifficultyColor(
  difficulty: DifficultyLevel,
  isDark: boolean = true
): {
  bg: string;
  text: string;
  border: string;
} {
  const scheme = isDark ? difficultyColors.dark : difficultyColors.light;
  return scheme[difficulty] || scheme.default;
}

export function confirmAction({
  title,
  message,
  onConfirm,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}) {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      onConfirm();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: 'cancel' },
        { text: confirmText, style: 'destructive', onPress: onConfirm },
      ],
      { cancelable: true }
    );
  }
}
