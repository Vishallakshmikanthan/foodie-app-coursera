import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRecipes } from '../context/RecipeContext';
import { RecipeForm } from '../components/RecipeForm';
import { RecipeFormData } from '../types/recipe';
import { useAppRouter, useAppParams } from '../utils/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { palette, typography } from '../theme/tokens';

export default function EditRecipeScreen() {
  const router = useAppRouter();
  const { id } = useAppParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const { getRecipeById, updateRecipe, isLoading } = useRecipes();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recipe = id ? getRecipeById(id) : undefined;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>Loading recipe details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorTitle, { color: colors.error }]}>Recipe Not Found</Text>
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>
            The recipe you are trying to edit could not be found.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/my-food')}
            style={[styles.returnButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.returnButtonText}>Return to My Food</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initialFormData: RecipeFormData = {
    name: recipe.name,
    image: recipe.image,
    category: recipe.category,
    difficulty: recipe.difficulty,
    preparationTime: recipe.preparationTime,
    servings: recipe.servings,
    calories: recipe.calories,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
  };

  const handleSubmit = async (data: RecipeFormData) => {
    try {
      setIsSubmitting(true);
      await updateRecipe(recipe.id, data);

      if (Platform.OS === 'web') {
        window.alert('Recipe updated successfully!');
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/my-food');
        }
      } else {
        Alert.alert(
          'Updated! ✨',
          'Recipe updated successfully! All changes have been saved.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/my-food');
                }
              },
            },
          ]
        );
      }
    } catch (err) {
      console.error('Failed to update recipe:', err);
      Alert.alert('Error', 'Failed to update recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.borderSubtle,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/my-food');
              }
            }}
            activeOpacity={0.7}
            style={[
              styles.backButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : palette.gray[100],
                borderColor: colors.borderSubtle,
              },
            ]}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Recipe</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {recipe.name}
            </Text>
          </View>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Recipe Form populated with existing data */}
        <RecipeForm
          initialData={initialFormData}
          onSubmit={handleSubmit}
          submitButtonText="Save Changes"
          isSubmitting={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitleContainer: {
    alignItems: 'center',
    maxWidth: '70%',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: typography.families.bold,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: typography.families.medium,
    marginTop: 2,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centerText: {
    fontSize: 15,
    fontFamily: typography.families.medium,
    textAlign: 'center',
    marginTop: 10,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: typography.families.bold,
  },
  returnButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  returnButtonText: {
    color: palette.white,
    fontFamily: typography.families.bold,
    fontSize: 14,
  },
});
