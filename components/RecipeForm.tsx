import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Plus,
  Trash2,
  Clock,
  Users,
  Flame,
  Check,
} from 'lucide-react-native';
import { DifficultyLevel, RecipeFormData } from '../types/recipe';
import { RECIPE_CATEGORIES, DEFAULT_RECIPE_IMAGE } from '../data/recipes';
import { validateRecipeForm } from '../utils/recipeUtils';
import { formatIngredient, parseIngredients } from '../utils/ingredientUtils';
import { useTheme } from '../theme/ThemeProvider';
import { palette, typography } from '../theme/tokens';

interface RecipeFormProps {
  initialData?: RecipeFormData;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  submitButtonText: string;
  isSubmitting?: boolean;
}

const PRESET_IMAGES = [
  {
    label: 'Healthy Salad',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Pasta & Italian',
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281290?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Gourmet Burger',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Sweet Dessert',
    url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
  },
];

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting = false,
}) => {
  const { colors, isDark } = useTheme();

  const [name, setName] = useState(initialData?.name || '');
  const [image, setImage] = useState(initialData?.image || DEFAULT_RECIPE_IMAGE);
  const [category, setCategory] = useState(initialData?.category || RECIPE_CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    initialData?.difficulty || 'Easy'
  );
  const [prepTime, setPrepTime] = useState(
    initialData?.preparationTime ? String(initialData.preparationTime) : '20'
  );
  const [servings, setServings] = useState(
    initialData?.servings ? String(initialData.servings) : '4'
  );
  const [calories, setCalories] = useState(
    initialData?.calories ? String(initialData.calories) : '350'
  );

  // Ingredients state
  const [ingredients, setIngredients] = useState<string[]>(
    initialData?.ingredients && initialData.ingredients.length > 0
      ? initialData.ingredients.map((ing) => (typeof ing === 'string' ? ing : formatIngredient(ing)))
      : ['']
  );
  const [ingredientMode, setIngredientMode] = useState<'structured' | 'free'>('structured');
  const [newIngredientInput, setNewIngredientInput] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newName, setNewName] = useState('');

  // Instructions state
  const [instructions, setInstructions] = useState<string[]>(
    initialData?.instructions && initialData.instructions.length > 0
      ? initialData.instructions
      : ['']
  );
  const [newInstructionInput, setNewInstructionInput] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPickingImage, setIsPickingImage] = useState(false);

  // Image picker handler
  const handlePickImage = async () => {
    try {
      setIsPickingImage(true);
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Permission to access photo gallery is required to choose a custom recipe photo.'
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        setImage(pickerResult.assets[0].uri);
      }
    } catch (err) {
      console.error('Error selecting image:', err);
      Alert.alert('Image Selection', 'Could not open image picker. You can choose a preset image below.');
    } finally {
      setIsPickingImage(false);
    }
  };

  // Add ingredient
  const handleAddIngredient = () => {
    if (ingredientMode === 'structured') {
      const parts: string[] = [];
      if (newQty.trim()) parts.push(newQty.trim());
      if (newUnit.trim()) parts.push(newUnit.trim());
      if (newName.trim()) parts.push(newName.trim());
      if (parts.length > 0) {
        setIngredients((prev) => [...prev, parts.join(' ')]);
        setNewQty('');
        setNewUnit('');
        setNewName('');
        setErrors((prev) => ({ ...prev, ingredients: '' }));
      }
    } else {
      if (newIngredientInput.trim()) {
        setIngredients((prev) => [...prev, newIngredientInput.trim()]);
        setNewIngredientInput('');
        setErrors((prev) => ({ ...prev, ingredients: '' }));
      }
    }
  };

  // Remove ingredient
  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Update specific ingredient
  const handleUpdateIngredient = (text: string, index: number) => {
    setIngredients((prev) => {
      const copy = [...prev];
      copy[index] = text;
      return copy;
    });
  };

  // Add instruction
  const handleAddInstruction = () => {
    if (newInstructionInput.trim()) {
      setInstructions((prev) => [...prev, newInstructionInput.trim()]);
      setNewInstructionInput('');
      setErrors((prev) => ({ ...prev, instructions: '' }));
    }
  };

  // Remove instruction
  const handleRemoveInstruction = (index: number) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  // Update specific instruction
  const handleUpdateInstruction = (text: string, index: number) => {
    setInstructions((prev) => {
      const copy = [...prev];
      copy[index] = text;
      return copy;
    });
  };

  // Handle Form Submission
  const handleSubmit = async () => {
    let finalIngredients = [...ingredients];
    if (ingredientMode === 'structured') {
      const parts: string[] = [];
      if (newQty.trim()) parts.push(newQty.trim());
      if (newUnit.trim()) parts.push(newUnit.trim());
      if (newName.trim()) parts.push(newName.trim());
      if (parts.length > 0) {
        finalIngredients.push(parts.join(' '));
      }
    } else if (newIngredientInput.trim()) {
      finalIngredients.push(newIngredientInput.trim());
    }
    finalIngredients = finalIngredients.filter((i) => i.trim().length > 0);

    let finalInstructions = [...instructions];
    if (newInstructionInput.trim()) {
      finalInstructions.push(newInstructionInput.trim());
    }
    finalInstructions = finalInstructions.filter((i) => i.trim().length > 0);

    const formData: RecipeFormData = {
      name: name.trim(),
      image: image.trim() || DEFAULT_RECIPE_IMAGE,
      category,
      difficulty,
      preparationTime: parseInt(prepTime, 10) || 0,
      servings: parseInt(servings, 10) || 0,
      calories: parseInt(calories, 10) || 0,
      ingredients: parseIngredients(finalIngredients),
      instructions: finalInstructions,
    };

    const validation = validateRecipeForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert('Validation Error', 'Please check the form and fill in all required fields.');
      return;
    }

    setErrors({});
    await onSubmit(formData);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* 1. Recipe Name */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>
          Recipe Name <Text style={[styles.required, { color: colors.error }]}>*</Text>
        </Text>
        <TextInput
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          placeholder="e.g. Creamy Mushroom Fettuccine"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: errors.name ? colors.error : colors.inputBorder,
              color: colors.text,
            },
          ]}
        />
        {errors.name ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text> : null}
      </View>

      {/* 2. Recipe Image */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>Recipe Photo</Text>
        <View style={[styles.imagePreviewContainer, { backgroundColor: colors.backgroundElevated }]}>
          <Image
            source={{ uri: image }}
            style={styles.imagePreview}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickImage}
            style={styles.pickImageButton}
            disabled={isPickingImage}
          >
            {isPickingImage ? (
              <ActivityIndicator color={palette.white} size="small" />
            ) : (
              <>
                <Camera size={18} color={palette.white} />
                <Text style={styles.pickImageButtonText}>Choose from Gallery</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Preset quick image selection */}
        <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Or select a preset photo:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
          {PRESET_IMAGES.map((preset, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setImage(preset.url)}
              activeOpacity={0.7}
              style={[
                styles.presetItem,
                image === preset.url && { borderColor: colors.primary },
              ]}
            >
              <Image
                source={{ uri: preset.url }}
                style={styles.presetThumb}
                contentFit="cover"
                transition={300}
                cachePolicy="memory-disk"
              />
              <Text
                style={[
                  styles.presetLabel,
                  { color: colors.textSecondary },
                  image === preset.url && { color: colors.primary, fontFamily: typography.families.bold },
                ]}
                numberOfLines={1}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. Category Selector */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>
          Category <Text style={[styles.required, { color: colors.error }]}>*</Text>
        </Text>
        <View style={styles.chipsContainer}>
          {RECIPE_CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.chipBackground,
                    borderColor: isSelected ? colors.primary : colors.chipBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: isSelected ? palette.white : colors.textSecondary,
                      fontFamily: isSelected ? typography.families.bold : typography.families.medium,
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. Difficulty Selector */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>Difficulty Level</Text>
        <View style={[styles.segmentedContainer, { backgroundColor: colors.inputBackground }]}>
          {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map((level) => {
            const isSelected = difficulty === level;
            return (
              <TouchableOpacity
                key={level}
                onPress={() => setDifficulty(level)}
                activeOpacity={0.8}
                style={[
                  styles.segmentButton,
                  isSelected && {
                    backgroundColor: isDark ? colors.surfaceElevated : palette.white,
                    shadowColor: palette.black,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    {
                      color: isSelected ? colors.primary : colors.textMuted,
                      fontFamily: isSelected ? typography.families.bold : typography.families.medium,
                    },
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 5. Metrics Row: Prep Time, Servings, Calories */}
      <View style={styles.metricsRow}>
        {/* Prep Time */}
        <View style={[styles.metricCol, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.metricLabelRow}>
            <Clock size={15} color={colors.primary} />
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Prep (mins)</Text>
          </View>
          <TextInput
            value={prepTime}
            onChangeText={setPrepTime}
            keyboardType="numeric"
            placeholder="15"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              styles.metricInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: errors.preparationTime ? colors.error : colors.inputBorder,
                color: colors.text,
              },
            ]}
          />
        </View>

        {/* Servings */}
        <View style={[styles.metricCol, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.metricLabelRow}>
            <Users size={15} color={colors.primary} />
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Servings</Text>
          </View>
          <TextInput
            value={servings}
            onChangeText={setServings}
            keyboardType="numeric"
            placeholder="2"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              styles.metricInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: errors.servings ? colors.error : colors.inputBorder,
                color: colors.text,
              },
            ]}
          />
        </View>

        {/* Calories */}
        <View style={[styles.metricCol, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.metricLabelRow}>
            <Flame size={15} color={colors.accentSaffron} />
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Calories</Text>
          </View>
          <TextInput
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            placeholder="350"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              styles.metricInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: errors.calories ? colors.error : colors.inputBorder,
                color: colors.text,
              },
            ]}
          />
        </View>
      </View>

      {/* 6. Ingredients */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.label, { color: colors.text }]}>
            Ingredients <Text style={[styles.required, { color: colors.error }]}>*</Text>
          </Text>
          <Text style={[styles.countBadge, { backgroundColor: colors.chipBackground, color: colors.textSecondary }]}>
            {ingredients.filter(Boolean).length} items
          </Text>
        </View>

        {errors.ingredients ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{errors.ingredients}</Text>
        ) : null}

        {/* List of existing ingredients */}
        {ingredients.map((ing, index) => (
          <View key={index} style={styles.dynamicRow}>
            <View
              style={[
                styles.indexCircle,
                { backgroundColor: isDark ? 'rgba(240, 138, 106, 0.18)' : palette.peach[100] },
              ]}
            >
              <Text style={[styles.indexText, { color: colors.primary }]}>{index + 1}</Text>
            </View>
            <TextInput
              value={ing}
              onChangeText={(text) => handleUpdateIngredient(text, index)}
              placeholder="e.g. 2 cups almond flour"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                styles.dynamicInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
            />
            <TouchableOpacity
              onPress={() => handleRemoveIngredient(index)}
              style={styles.removeBtn}
              accessibilityLabel="Remove ingredient"
            >
              <Trash2 size={18} color={colors.deleteButton} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Mode selector between structured entry and free text */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => setIngredientMode('structured')}
            activeOpacity={0.7}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: ingredientMode === 'structured' ? colors.primary : 'rgba(255,255,255,0.08)',
              borderWidth: 1,
              borderColor: ingredientMode === 'structured' ? colors.primary : colors.borderSubtle,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: typography.families.bold,
                color: ingredientMode === 'structured' ? palette.white : colors.textSecondary,
              }}
            >
              Structured (Qty, Unit, Name)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIngredientMode('free')}
            activeOpacity={0.7}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: ingredientMode === 'free' ? colors.primary : 'rgba(255,255,255,0.08)',
              borderWidth: 1,
              borderColor: ingredientMode === 'free' ? colors.primary : colors.borderSubtle,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: typography.families.bold,
                color: ingredientMode === 'free' ? palette.white : colors.textSecondary,
              }}
            >
              Free Text
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add new ingredient field */}
        {ingredientMode === 'structured' ? (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={newQty}
                onChangeText={setNewQty}
                placeholder="Qty (2)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                style={[
                  styles.input,
                  {
                    flex: 1,
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
              />
              <TextInput
                value={newUnit}
                onChangeText={setNewUnit}
                placeholder="Unit (cups, tbsp)"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  {
                    flex: 1.5,
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Ingredient name (e.g. olive oil)"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  {
                    flex: 1,
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                onSubmitEditing={handleAddIngredient}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={handleAddIngredient}
                activeOpacity={0.8}
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
              >
                <Plus size={18} color={palette.white} />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.addInputRow}>
            <TextInput
              value={newIngredientInput}
              onChangeText={setNewIngredientInput}
              placeholder="e.g. 2 cups almond flour"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                styles.addInputField,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              onSubmitEditing={handleAddIngredient}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={handleAddIngredient}
              activeOpacity={0.8}
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
            >
              <Plus size={18} color={palette.white} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 7. Step-by-Step Instructions */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.label, { color: colors.text }]}>
            Step-by-Step Instructions <Text style={[styles.required, { color: colors.error }]}>*</Text>
          </Text>
          <Text style={[styles.countBadge, { backgroundColor: colors.chipBackground, color: colors.textSecondary }]}>
            {instructions.filter(Boolean).length} steps
          </Text>
        </View>

        {errors.instructions ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{errors.instructions}</Text>
        ) : null}

        {/* List of existing instructions */}
        {instructions.map((step, index) => (
          <View
            key={index}
            style={[
              styles.dynamicStepRow,
              {
                backgroundColor: isDark ? colors.backgroundSecondary : palette.gray[50],
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.primary }]}>Step {index + 1}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveInstruction(index)}
                style={styles.removeStepBtn}
                accessibilityLabel="Remove step"
              >
                <Trash2 size={16} color={colors.deleteButton} />
              </TouchableOpacity>
            </View>
            <TextInput
              value={step}
              onChangeText={(text) => handleUpdateInstruction(text, index)}
              placeholder="Describe this preparation step..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={[
                styles.input,
                styles.stepInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
            />
          </View>
        ))}

        {/* Add new instruction step */}
        <View style={styles.addStepContainer}>
          <TextInput
            value={newInstructionInput}
            onChangeText={setNewInstructionInput}
            placeholder="Type new step instruction..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={2}
            style={[
              styles.input,
              styles.stepInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
          />
          <TouchableOpacity
            onPress={handleAddInstruction}
            activeOpacity={0.8}
            style={[
              styles.addStepBtn,
              {
                backgroundColor: isDark ? 'rgba(240, 138, 106, 0.15)' : palette.peach[50],
                borderColor: isDark ? 'rgba(240, 138, 106, 0.35)' : palette.peach[500],
              },
            ]}
          >
            <Plus size={18} color={colors.primary} />
            <Text style={[styles.addStepBtnText, { color: colors.primary }]}>+ Add Step</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Action Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        activeOpacity={0.85}
        disabled={isSubmitting}
        style={[
          styles.submitButton,
          { backgroundColor: colors.primary, shadowColor: colors.primary },
          isSubmitting && styles.submitButtonDisabled,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color={palette.white} size="small" />
        ) : (
          <>
            <Check size={20} color={palette.white} strokeWidth={2.5} />
            <Text style={styles.submitButtonText}>{submitButtonText}</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontFamily: typography.families.bold,
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 13,
    fontFamily: typography.families.semiBold,
    marginTop: 12,
    marginBottom: 8,
  },
  required: {
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: typography.families.regular,
  },
  errorText: {
    fontSize: 13,
    fontFamily: typography.families.medium,
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  pickImageButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 26, 23, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pickImageButtonText: {
    color: palette.white,
    fontSize: 13,
    fontFamily: typography.families.semiBold,
  },
  presetRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  presetItem: {
    width: 80,
    marginRight: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: palette.transparent,
    padding: 2,
  },
  presetThumb: {
    width: 72,
    height: 52,
    borderRadius: 6,
  },
  presetLabel: {
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
    fontFamily: typography.families.medium,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonText: {
    fontSize: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCol: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: typography.families.semiBold,
  },
  metricInput: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: typography.families.bold,
    paddingVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  countBadge: {
    fontSize: 12,
    fontFamily: typography.families.semiBold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dynamicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  indexCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 12,
    fontFamily: typography.families.bold,
  },
  dynamicInput: {
    flex: 1,
  },
  removeBtn: {
    padding: 8,
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  addInputField: {
    flex: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: palette.white,
    fontFamily: typography.families.bold,
    fontSize: 14,
  },
  dynamicStepRow: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 13,
    fontFamily: typography.families.bold,
  },
  removeStepBtn: {
    padding: 4,
  },
  stepInput: {
    textAlignVertical: 'top',
  },
  addStepContainer: {
    marginTop: 6,
  },
  addStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    marginTop: 8,
  },
  addStepBtnText: {
    fontFamily: typography.families.bold,
    fontSize: 14,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: palette.white,
    fontSize: 16,
    fontFamily: typography.families.bold,
  },
});
