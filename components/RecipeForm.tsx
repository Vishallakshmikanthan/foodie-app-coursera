import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Plus,
  Trash2,
  Clock,
  Users,
  Flame,
  Check,
  Sparkles,
} from 'lucide-react-native';
import { DifficultyLevel, RecipeFormData } from '../types/recipe';
import { RECIPE_CATEGORIES, DEFAULT_RECIPE_IMAGE } from '../data/recipes';
import { validateRecipeForm } from '../utils/recipeUtils';

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
      ? initialData.ingredients
      : ['']
  );
  const [newIngredientInput, setNewIngredientInput] = useState('');

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
    if (newIngredientInput.trim()) {
      setIngredients((prev) => [...prev, newIngredientInput.trim()]);
      setNewIngredientInput('');
      setErrors((prev) => ({ ...prev, ingredients: '' }));
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
    // Include pending input if user typed but didn't press add
    let finalIngredients = [...ingredients];
    if (newIngredientInput.trim()) {
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
      ingredients: finalIngredients,
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
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* 1. Recipe Name */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Recipe Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          placeholder="e.g. Creamy Mushroom Fettuccine"
          placeholderTextColor="#9CA3AF"
          style={[styles.input, errors.name ? styles.inputError : null]}
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
      </View>

      {/* 2. Recipe Image */}
      <View style={styles.section}>
        <Text style={styles.label}>Recipe Photo</Text>
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover" />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickImage}
            style={styles.pickImageButton}
            disabled={isPickingImage}
          >
            {isPickingImage ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Camera size={18} color="#FFFFFF" />
                <Text style={styles.pickImageButtonText}>Choose from Gallery</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Preset quick image selection */}
        <Text style={styles.subLabel}>Or select a preset photo:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
          {PRESET_IMAGES.map((preset, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setImage(preset.url)}
              activeOpacity={0.7}
              style={[
                styles.presetItem,
                image === preset.url && styles.presetItemSelected,
              ]}
            >
              <Image source={{ uri: preset.url }} style={styles.presetThumb} />
              <Text style={styles.presetLabel} numberOfLines={1}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. Category Selector */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Category <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.chipsContainer}>
          {RECIPE_CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
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
      <View style={styles.section}>
        <Text style={styles.label}>Difficulty Level</Text>
        <View style={styles.segmentedContainer}>
          {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map((level) => {
            const isSelected = difficulty === level;
            return (
              <TouchableOpacity
                key={level}
                onPress={() => setDifficulty(level)}
                activeOpacity={0.8}
                style={[
                  styles.segmentButton,
                  isSelected && styles.segmentButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    isSelected && styles.segmentButtonTextSelected,
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
        <View style={styles.metricCol}>
          <View style={styles.metricLabelRow}>
            <Clock size={15} color="#FF6B35" />
            <Text style={styles.metricLabel}>Prep (mins)</Text>
          </View>
          <TextInput
            value={prepTime}
            onChangeText={setPrepTime}
            keyboardType="numeric"
            placeholder="15"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.metricInput, errors.preparationTime ? styles.inputError : null]}
          />
        </View>

        {/* Servings */}
        <View style={styles.metricCol}>
          <View style={styles.metricLabelRow}>
            <Users size={15} color="#FF6B35" />
            <Text style={styles.metricLabel}>Servings</Text>
          </View>
          <TextInput
            value={servings}
            onChangeText={setServings}
            keyboardType="numeric"
            placeholder="2"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.metricInput, errors.servings ? styles.inputError : null]}
          />
        </View>

        {/* Calories */}
        <View style={styles.metricCol}>
          <View style={styles.metricLabelRow}>
            <Flame size={15} color="#EF4444" />
            <Text style={styles.metricLabel}>Calories</Text>
          </View>
          <TextInput
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            placeholder="350"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.metricInput, errors.calories ? styles.inputError : null]}
          />
        </View>
      </View>

      {/* 6. Ingredients */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.label}>
            Ingredients <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.countBadge}>{ingredients.filter(Boolean).length} items</Text>
        </View>

        {errors.ingredients ? (
          <Text style={styles.errorText}>{errors.ingredients}</Text>
        ) : null}

        {/* List of existing ingredients */}
        {ingredients.map((ing, index) => (
          <View key={index} style={styles.dynamicRow}>
            <View style={styles.indexCircle}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <TextInput
              value={ing}
              onChangeText={(text) => handleUpdateIngredient(text, index)}
              placeholder="e.g. 2 cups almond flour"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.dynamicInput]}
            />
            <TouchableOpacity
              onPress={() => handleRemoveIngredient(index)}
              style={styles.removeBtn}
              accessibilityLabel="Remove ingredient"
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add new ingredient field */}
        <View style={styles.addInputRow}>
          <TextInput
            value={newIngredientInput}
            onChangeText={setNewIngredientInput}
            placeholder="Type another ingredient..."
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.addInputField]}
            onSubmitEditing={handleAddIngredient}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={handleAddIngredient}
            activeOpacity={0.8}
            style={styles.addBtn}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 7. Step-by-Step Instructions */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.label}>
            Step-by-Step Instructions <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.countBadge}>{instructions.filter(Boolean).length} steps</Text>
        </View>

        {errors.instructions ? (
          <Text style={styles.errorText}>{errors.instructions}</Text>
        ) : null}

        {/* List of existing instructions */}
        {instructions.map((step, index) => (
          <View key={index} style={styles.dynamicStepRow}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Step {index + 1}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveInstruction(index)}
                style={styles.removeStepBtn}
                accessibilityLabel="Remove step"
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <TextInput
              value={step}
              onChangeText={(text) => handleUpdateInstruction(text, index)}
              placeholder="Describe this preparation step..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              style={[styles.input, styles.stepInput]}
            />
          </View>
        ))}

        {/* Add new instruction step */}
        <View style={styles.addStepContainer}>
          <TextInput
            value={newInstructionInput}
            onChangeText={setNewInstructionInput}
            placeholder="Type new step instruction..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={2}
            style={[styles.input, styles.stepInput]}
          />
          <TouchableOpacity
            onPress={handleAddInstruction}
            activeOpacity={0.8}
            style={styles.addStepBtn}
          >
            <Plus size={18} color="#FF6B35" />
            <Text style={styles.addStepBtnText}>+ Add Step</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Action Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        activeOpacity={0.85}
        disabled={isSubmitting}
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
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
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
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
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  pickImageButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
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
    borderColor: 'transparent',
    padding: 2,
  },
  presetItemSelected: {
    borderColor: '#FF6B35',
  },
  presetThumb: {
    width: 72,
    height: 52,
    borderRadius: 6,
  },
  presetLabel: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 3,
    textAlign: 'center',
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
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentButtonTextSelected: {
    color: '#FF6B35',
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  metricCol: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  metricInput: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
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
    backgroundColor: '#FF6B35',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  dynamicStepRow: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B35',
  },
  removeStepBtn: {
    padding: 4,
  },
  stepInput: {
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  addStepContainer: {
    marginTop: 6,
  },
  addStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    marginTop: 8,
  },
  addStepBtnText: {
    color: '#EA580C',
    fontWeight: '700',
    fontSize: 14,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
    marginTop: 10,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
