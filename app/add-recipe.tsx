import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRecipes } from '../context/RecipeContext';
import { RecipeForm } from '../components/RecipeForm';
import { RecipeFormData } from '../types/recipe';
import { useAppRouter } from '../utils/navigation';

export default function AddRecipeScreen() {
  const router = useAppRouter();
  const { addRecipe } = useRecipes();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: RecipeFormData) => {
    try {
      setIsSubmitting(true);
      await addRecipe(data);

      if (Platform.OS === 'web') {
        window.alert('Recipe saved successfully!');
        router.replace('/my-food');
      } else {
        Alert.alert(
          'Success! 🎉',
          'Recipe saved successfully! Your new recipe is now available in My Recipes.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/my-food'),
            },
          ]
        );
      }
    } catch (err) {
      console.error('Failed to save recipe:', err);
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
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
            <Text style={styles.headerTitle}>Add New Recipe</Text>
            <Text style={styles.headerSubtitle}>Create your culinary masterpiece</Text>
          </View>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Recipe Form */}
        <RecipeForm
          onSubmit={handleSubmit}
          submitButtonText="Save Recipe"
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
});
