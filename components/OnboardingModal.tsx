import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  Sparkles,
  Camera,
  ChevronRight,
  ChevronLeft,
  Check,
  ChefHat,
  X,
} from 'lucide-react-native';
import { GlassSurface } from './ui/GlassSurface';
import { GradientBackground } from './ui/GradientBackground';
import { useUserProfile } from '../context/UserProfileContext';
import {
  DietaryPreference,
  DIETARY_OPTIONS,
  CUISINE_OPTIONS,
  AVATAR_PRESETS,
} from '../types/user';
import { palette, typography, radii } from '../theme/tokens';
import { haptics } from '../utils/haptics';

export interface OnboardingModalProps {
  visible: boolean;
  onClose?: () => void;
  isInitialLaunch?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  onClose,
  isInitialLaunch = false,
}) => {
  const { profile, completeOnboarding } = useUserProfile();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setNameState] = useState<string>(profile.name || 'Vishal');
  const [avatar, setAvatarState] = useState<string>(profile.avatar || AVATAR_PRESETS[0].uri);
  const [diet, setDietState] = useState<DietaryPreference>(profile.dietaryPreference || 'All');
  const [cuisines, setCuisinesState] = useState<string[]>(
    profile.favoriteCuisines?.length ? profile.favoriteCuisines : ['Italian', 'Japanese', 'Mexican']
  );

  // Sync state whenever modal opens
  useEffect(() => {
    if (visible) {
      setStep(1);
      setNameState(profile.name || 'Vishal');
      setAvatarState(profile.avatar || AVATAR_PRESETS[0].uri);
      setDietState(profile.dietaryPreference || 'All');
      setCuisinesState(
        profile.favoriteCuisines?.length ? profile.favoriteCuisines : ['Italian', 'Japanese', 'Mexican']
      );
    }
  }, [visible, profile]);

  const handlePickCustomAvatar = async () => {
    try {
      haptics.buttonPress();
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo Permission',
          'Please allow photo access to choose a custom chef portrait.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarState(result.assets[0].uri);
        haptics.formSuccess();
      }
    } catch (err) {
      console.warn('Avatar pick error:', err);
    }
  };

  const handleToggleCuisine = (cName: string) => {
    haptics.selection();
    setCuisinesState((prev) =>
      prev.includes(cName) ? prev.filter((c) => c !== cName) : [...prev, cName]
    );
  };

  const handleSkip = async () => {
    haptics.buttonPress();
    await completeOnboarding({
      name: name.trim() || 'Foodie Chef',
      avatar,
      dietaryPreference: diet,
      favoriteCuisines: cuisines,
    });
    if (onClose) onClose();
  };

  const handleFinish = async () => {
    haptics.celebration();
    await completeOnboarding({
      name: name.trim() || 'Foodie Chef',
      avatar,
      dietaryPreference: diet,
      favoriteCuisines: cuisines.length ? cuisines : ['Italian', 'Japanese'],
    });
    if (onClose) onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose || handleSkip}
    >
      <View style={styles.container}>
        {/* Atmosphere Background */}
        <GradientBackground preset="mint-to-forest" fullScreen />

        {/* Top Navigation Bar */}
        <View style={styles.topHeader}>
          <View style={styles.brandingRow}>
            <ChefHat size={18} color={palette.mint[300]} />
            <Text style={styles.brandingText}>FOODIE WELCOME</Text>
          </View>

          {/* Skip / Close Link */}
          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={0.7}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={styles.skipButtonText}>
              {isInitialLaunch ? 'Skip for now' : 'Close'}
            </Text>
            {isInitialLaunch ? (
              <ChevronRight size={14} color={palette.mint[300]} />
            ) : (
              <X size={16} color={palette.text.onDarkSecondary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Step Progress Pills */}
        <View style={styles.progressRow}>
          {[1, 2, 3].map((stepIdx) => {
            const isActive = stepIdx === step;
            const isCompleted = stepIdx < step;

            return (
              <View
                key={stepIdx}
                style={[
                  styles.progressTrack,
                  isActive && styles.progressTrackActive,
                  isCompleted && styles.progressTrackCompleted,
                ]}
              />
            );
          })}
        </View>

        {/* Step Content */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* STEP 1: IDENTITY & AVATAR */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.headerTextBlock}>
                <Text style={styles.stepTag}>STEP 1 OF 3</Text>
                <Text style={styles.stepTitle}>Who's in the kitchen?</Text>
                <Text style={styles.stepSubtitle}>
                  Set up your chef profile so we can personalize your culinary home.
                </Text>
              </View>

              {/* Avatar Selector */}
              <View style={styles.avatarSection}>
                <TouchableOpacity
                  onPress={handlePickCustomAvatar}
                  activeOpacity={0.85}
                  style={styles.avatarPickerButton}
                  accessibilityRole="button"
                  accessibilityLabel="Change avatar image"
                >
                  <View style={styles.avatarFrame}>
                    <Image source={{ uri: avatar }} style={styles.avatarImage} contentFit="cover" />
                    <View style={styles.cameraBadge}>
                      <Camera size={14} color={palette.forest[900]} />
                    </View>
                  </View>
                </TouchableOpacity>
                <Text style={styles.avatarHint}>Tap avatar to upload photo</Text>

                {/* Preset Avatars */}
                <View style={styles.presetRow}>
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = avatar === preset.uri;
                    return (
                      <TouchableOpacity
                        key={preset.id}
                        onPress={() => {
                          haptics.selection();
                          setAvatarState(preset.uri);
                        }}
                        style={[
                          styles.presetCircle,
                          isSelected && styles.presetCircleSelected,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Select avatar preset: ${preset.label}`}
                      >
                        <Image source={{ uri: preset.uri }} style={styles.presetImage} contentFit="cover" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Name Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>YOUR CHEF NAME</Text>
                <GlassSurface
                  variant="prominent"
                  borderRadius={18}
                  style={styles.inputGlass}
                  contentContainerStyle={styles.inputInner}
                >
                  <TextInput
                    value={name}
                    onChangeText={setNameState}
                    placeholder="Enter your name..."
                    placeholderTextColor="rgba(243, 247, 244, 0.45)"
                    style={styles.textInput}
                    returnKeyType="done"
                    maxLength={32}
                    accessibilityLabel="Chef name input"
                  />
                  {name.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setNameState('')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.clearInputBtn}
                      accessibilityLabel="Clear name"
                    >
                      <X size={16} color={palette.text.onDarkSecondary} />
                    </TouchableOpacity>
                  )}
                </GlassSurface>
              </View>

              {/* Bottom Action */}
              <TouchableOpacity
                onPress={() => {
                  haptics.buttonPress();
                  setStep(2);
                }}
                activeOpacity={0.8}
                style={styles.primaryButton}
                accessibilityRole="button"
                accessibilityLabel="Next: Dietary Preferences"
              >
                <Text style={styles.primaryButtonText}>Next: Taste & Diet</Text>
                <ChevronRight size={18} color={palette.forest[900]} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: DIETARY PREFERENCE */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.headerTextBlock}>
                <Text style={styles.stepTag}>STEP 2 OF 3</Text>
                <Text style={styles.stepTitle}>Any dietary lifestyle?</Text>
                <Text style={styles.stepSubtitle}>
                  Choose your diet to automatically surface dishes tailored for you.
                </Text>
              </View>

              {/* Dietary Choices Grid */}
              <View style={styles.dietsList}>
                {DIETARY_OPTIONS.map((opt) => {
                  const isSelected = diet === opt.id;

                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => {
                        haptics.selection();
                        setDietState(opt.id);
                      }}
                      activeOpacity={0.8}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`${opt.label}: ${opt.description}`}
                    >
                      <GlassSurface
                        variant={isSelected ? 'mint' : 'subtle'}
                        borderRadius={18}
                        borderWidth={isSelected ? 1.8 : 1}
                        style={[
                          styles.dietCard,
                          isSelected && styles.dietCardSelected,
                        ]}
                        contentContainerStyle={styles.dietCardInner}
                      >
                        <Text style={styles.dietEmoji}>{opt.emoji}</Text>
                        <View style={styles.dietInfo}>
                          <Text
                            style={[
                              styles.dietLabel,
                              isSelected && styles.dietLabelSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                          <Text style={styles.dietDesc}>{opt.description}</Text>
                        </View>
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleSelected,
                          ]}
                        >
                          {isSelected && <Check size={13} color={palette.forest[900]} strokeWidth={3} />}
                        </View>
                      </GlassSurface>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Bottom Actions */}
              <View style={styles.navButtonsRow}>
                <TouchableOpacity
                  onPress={() => {
                    haptics.buttonPress();
                    setStep(1);
                  }}
                  activeOpacity={0.8}
                  style={styles.backButton}
                  accessibilityRole="button"
                  accessibilityLabel="Back to Step 1"
                >
                  <ChevronLeft size={18} color={palette.text.onDark} />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    haptics.buttonPress();
                    setStep(3);
                  }}
                  activeOpacity={0.8}
                  style={styles.primaryButtonFlex}
                  accessibilityRole="button"
                  accessibilityLabel="Next: Favorite Cuisines"
                >
                  <Text style={styles.primaryButtonText}>Next: Cuisines</Text>
                  <ChevronRight size={18} color={palette.forest[900]} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3: FAVORITE CUISINES */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.headerTextBlock}>
                <Text style={styles.stepTag}>STEP 3 OF 3</Text>
                <Text style={styles.stepTitle}>What cuisines tempt you?</Text>
                <Text style={styles.stepSubtitle}>
                  Select your favorites to power intelligent dish recommendations.
                </Text>
              </View>

              {/* Selection Count Badge */}
              <View style={styles.counterRow}>
                <Sparkles size={14} color={palette.mint[300]} />
                <Text style={styles.counterText}>
                  {cuisines.length} {cuisines.length === 1 ? 'cuisine' : 'cuisines'} selected
                </Text>
              </View>

              {/* Cuisines Grid */}
              <View style={styles.cuisinesGrid}>
                {CUISINE_OPTIONS.map((c) => {
                  const isSelected = cuisines.includes(c.name);

                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => handleToggleCuisine(c.name)}
                      activeOpacity={0.75}
                      style={[
                        styles.cuisineChip,
                        isSelected && styles.cuisineChipSelected,
                      ]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={`Cuisine: ${c.name}`}
                    >
                      <Text style={styles.cuisineEmoji}>{c.emoji}</Text>
                      <Text
                        style={[
                          styles.cuisineName,
                          isSelected && styles.cuisineNameSelected,
                        ]}
                      >
                        {c.name}
                      </Text>
                      {isSelected && (
                        <View style={styles.cuisineCheck}>
                          <Check size={11} color={palette.forest[900]} strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Bottom Actions */}
              <View style={styles.navButtonsRow}>
                <TouchableOpacity
                  onPress={() => {
                    haptics.buttonPress();
                    setStep(2);
                  }}
                  activeOpacity={0.8}
                  style={styles.backButton}
                  accessibilityRole="button"
                  accessibilityLabel="Back to Step 2"
                >
                  <ChevronLeft size={18} color={palette.text.onDark} />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleFinish}
                  activeOpacity={0.85}
                  style={styles.finishButton}
                  accessibilityRole="button"
                  accessibilityLabel="Complete onboarding and start exploring"
                >
                  <Sparkles size={18} color={palette.forest[900]} />
                  <Text style={styles.finishButtonText}>Start Cooking</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.forest[900],
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  brandingText: {
    fontFamily: typography.families.bold,
    fontSize: 11.5,
    letterSpacing: 1.4,
    color: palette.mint[300],
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minHeight: 44,
  },
  skipButtonText: {
    fontFamily: typography.families.semiBold,
    fontSize: 13,
    color: palette.text.onDarkSecondary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    marginBottom: 20,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  progressTrackActive: {
    backgroundColor: palette.mint[300],
  },
  progressTrackCompleted: {
    backgroundColor: palette.teal[400],
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
  },
  headerTextBlock: {
    marginBottom: 24,
  },
  stepTag: {
    fontFamily: typography.families.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: palette.peach[300],
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  stepTitle: {
    fontFamily: typography.families.display,
    fontSize: 28,
    lineHeight: 34,
    color: palette.text.onDark,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontFamily: typography.families.regular,
    fontSize: 14.5,
    lineHeight: 21,
    color: palette.text.onDarkSecondary,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarPickerButton: {
    minHeight: 44,
    minWidth: 44,
  },
  avatarFrame: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    borderColor: palette.mint[300],
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: palette.mint[300],
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.forest[900],
  },
  avatarHint: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.mint[300],
    marginTop: 8,
    marginBottom: 14,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  presetCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  presetCircleSelected: {
    borderColor: palette.mint[300],
    borderWidth: 2.5,
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontFamily: typography.families.bold,
    fontSize: 11,
    letterSpacing: 1,
    color: palette.text.onDarkSecondary,
    marginBottom: 8,
  },
  inputGlass: {
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    fontFamily: typography.families.semiBold,
    fontSize: 16,
    color: palette.text.onDark,
  },
  clearInputBtn: {
    padding: 6,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dietsList: {
    gap: 10,
    marginBottom: 28,
  },
  dietCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dietCardSelected: {
    borderColor: palette.mint[300],
  },
  dietCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  dietEmoji: {
    fontSize: 24,
    marginRight: 14,
  },
  dietInfo: {
    flex: 1,
  },
  dietLabel: {
    fontFamily: typography.families.bold,
    fontSize: 15,
    color: palette.text.onDark,
  },
  dietLabelSelected: {
    color: palette.mint[300],
  },
  dietDesc: {
    fontFamily: typography.families.regular,
    fontSize: 12,
    color: palette.text.onDarkSecondary,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    backgroundColor: palette.mint[300],
    borderColor: palette.mint[300],
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  counterText: {
    fontFamily: typography.families.semiBold,
    fontSize: 13,
    color: palette.mint[300],
  },
  cuisinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  cuisineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    gap: 6,
    minHeight: 44,
  },
  cuisineChipSelected: {
    backgroundColor: 'rgba(195, 235, 197, 0.22)',
    borderColor: palette.mint[300],
  },
  cuisineEmoji: {
    fontSize: 16,
  },
  cuisineName: {
    fontFamily: typography.families.semiBold,
    fontSize: 13.5,
    color: palette.text.onDark,
  },
  cuisineNameSelected: {
    color: palette.mint[300],
    fontFamily: typography.families.bold,
  },
  cuisineCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.mint[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  navButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: 44,
  },
  backButtonText: {
    fontFamily: typography.families.semiBold,
    fontSize: 14,
    color: palette.text.onDark,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.mint[300],
    height: 52,
    borderRadius: radii.full,
    shadowColor: palette.mint[300],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    minHeight: 44,
  },
  primaryButtonFlex: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.mint[300],
    height: 52,
    borderRadius: radii.full,
    minHeight: 44,
  },
  primaryButtonText: {
    fontFamily: typography.families.bold,
    fontSize: 15,
    color: palette.forest[900],
  },
  finishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.mint[300],
    height: 52,
    borderRadius: radii.full,
    shadowColor: palette.mint[300],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
    minHeight: 44,
  },
  finishButtonText: {
    fontFamily: typography.families.bold,
    fontSize: 15.5,
    color: palette.forest[900],
    letterSpacing: -0.2,
  },
});

export default OnboardingModal;
