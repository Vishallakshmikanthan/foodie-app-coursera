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

export default function EditRecipeScreen() {
  const router = useAppRouter();
  const { id } = useAppParams<{ id: string }>();
  const { getRecipeById, updateRecipe, isLoading } = useRecipes();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recipe = id ? getRecipeById(id) : undefined;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.centerText}>Loading recipe details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Recipe Not Found</Text>
          <Text style={styles.centerText}>
            The recipe you are trying to edit could not be found.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/my-food')}
            style={styles.returnButton}
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/my-food');
              }
            }}
            activeOpacity={0.7}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color="#1F2937" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Edit Recipe</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
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
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    maxWidth: '70%',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
  },
  returnButton: {
    marginTop: 20,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
