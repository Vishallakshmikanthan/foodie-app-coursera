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
import { useTheme } from '../theme/ThemeProvider';
import { palette, typography } from '../theme/tokens';

export default function AddRecipeScreen() {
  const router = useAppRouter();
  const { colors, isDark } = useTheme();
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Add New Recipe</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Create your culinary masterpiece
            </Text>
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
});
