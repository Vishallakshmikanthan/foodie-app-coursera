import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera,
  ChefHat,
  Heart,
  UtensilsCrossed,
  Flame,
  ShoppingCart,
  Moon,
  Sun,
  Laptop,
  Compass,
  Sparkles,
  Sliders,
  RotateCcw,
  Check,
  Edit2,
  Trash2,
  ShieldCheck,
} from 'lucide-react-native';
import { GradientBackground } from '../components/ui/GradientBackground';
import { GlassSurface } from '../components/ui/GlassSurface';
import { GlassIconButton } from '../components/ui/GlassIconButton';
import { OnboardingModal } from '../components/OnboardingModal';
import { useUserProfile } from '../context/UserProfileContext';
import { useRecipes } from '../context/RecipeContext';
import { useTheme, ThemeMode } from '../theme/ThemeProvider';
import { palette, typography, radii } from '../theme/tokens';
import { useAppRouter } from '../utils/navigation';
import { haptics } from '../utils/haptics';

export default function ProfileScreen() {
  const router = useAppRouter();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { profile, updateProfile, resetAllData } = useUserProfile();
  const { recipes, favoriteRecipes, userRecipes, cookingProgress, shoppingList } = useRecipes();

  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile.name || 'Vishal');

  // Count cooked recipes (completed cook mode progress)
  const cookedCount = useMemo(() => {
    let count = 0;
    for (const prog of Object.values(cookingProgress)) {
      if (prog && prog.currentStep >= prog.totalSteps && prog.totalSteps > 0) {
        count++;
      }
    }
    return count;
  }, [cookingProgress]);

  const handlePickAvatar = async () => {
    try {
      haptics.buttonPress();
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo Permission',
          'Please allow photo access to choose your custom chef portrait.'
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
        await updateProfile({ avatar: result.assets[0].uri });
        haptics.formSuccess();
      }
    } catch (err) {
      console.warn('Avatar picker error:', err);
    }
  };

  const handleSaveName = async () => {
    const trimmed = editedName.trim();
    if (trimmed) {
      await updateProfile({ name: trimmed });
      haptics.selection();
    }
    setIsEditingName(false);
  };

  const handleResetData = () => {
    haptics.destructive();
    Alert.alert(
      'Reset All Foodie Data',
      'Are you sure you want to clear custom recipes, favorites, and reset preferences? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            haptics.formSuccess();
            Alert.alert('Reset Complete', 'App data has been restored to default state.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.rootContainer}>
      {/* Full-bleed Signature Atmosphere Gradient */}
      <GradientBackground preset="mint-to-forest" fullScreen />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top Header Row */}
        <View style={styles.headerBar}>
          <GlassIconButton
            icon={ArrowLeft}
            size={44}
            iconSize={20}
            variant="regular"
            iconColor={palette.text.onDark}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          />

          <Text style={styles.headerTitle}>Chef Profile</Text>

          <GlassIconButton
            icon={Sliders}
            size={44}
            iconSize={20}
            variant="regular"
            iconColor={palette.mint[300]}
            onPress={() => {
              haptics.buttonPress();
              setIsOnboardingModalOpen(true);
            }}
            accessibilityLabel="Preferences and tastes"
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Profile Identity Card */}
          <GlassSurface
            variant="prominent"
            borderRadius={24}
            borderWidth={1.2}
            style={styles.profileCard}
            contentContainerStyle={styles.profileInner}
          >
            {/* Avatar with Camera Overlay */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                onPress={handlePickAvatar}
                activeOpacity={0.85}
                style={styles.avatarButton}
                accessibilityRole="button"
                accessibilityLabel="Change profile picture"
              >
                <View style={styles.avatarFrame}>
                  <Image source={{ uri: profile.avatar }} style={styles.avatarImage} contentFit="cover" />
                  <View style={styles.cameraPill}>
                    <Camera size={13} color={palette.forest[900]} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Editable Name & Tag */}
            <View style={styles.identityDetails}>
              {isEditingName ? (
                <View style={styles.editNameRow}>
                  <TextInput
                    value={editedName}
                    onChangeText={setEditedName}
                    style={styles.nameInput}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSaveName}
                  />
                  <TouchableOpacity
                    onPress={handleSaveName}
                    style={styles.saveNameBtn}
                    accessibilityLabel="Save chef name"
                  >
                    <Check size={16} color={palette.forest[900]} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setEditedName(profile.name);
                    setIsEditingName(true);
                  }}
                  activeOpacity={0.8}
                  style={styles.nameDisplayRow}
                  accessibilityLabel="Tap to edit chef name"
                >
                  <Text style={styles.userNameText}>{profile.name}</Text>
                  <Edit2 size={15} color={palette.mint[300]} style={styles.editIcon} />
                </TouchableOpacity>
              )}

              <View style={styles.badgeRow}>
                <ChefHat size={14} color={palette.mint[300]} />
                <Text style={styles.userRoleText}>Master Home Chef</Text>
              </View>

              <Text style={styles.userBioText}>{profile.bio}</Text>
            </View>

            {/* Preference Chips Preview */}
            <View style={styles.prefChipsRow}>
              {profile.dietaryPreference && profile.dietaryPreference !== 'All' && (
                <View style={styles.prefChip}>
                  <Text style={styles.prefChipText}>🥗 {profile.dietaryPreference}</Text>
                </View>
              )}
              {profile.favoriteCuisines?.map((c) => (
                <View key={c} style={styles.prefChip}>
                  <Text style={styles.prefChipText}>{c}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => {
                haptics.buttonPress();
                setIsOnboardingModalOpen(true);
              }}
              activeOpacity={0.8}
              style={styles.editPrefButton}
              accessibilityRole="button"
              accessibilityLabel="Customize dietary and cuisine preferences"
            >
              <Sparkles size={14} color={palette.forest[900]} />
              <Text style={styles.editPrefButtonText}>Customize Taste & Diets</Text>
            </TouchableOpacity>
          </GlassSurface>

          {/* Culinary Stats Grid */}
          <Text style={styles.sectionHeader}>Culinary Stats</Text>
          <View style={styles.statsGrid}>
            <GlassSurface
              variant="subtle"
              borderRadius={18}
              style={styles.statTile}
              contentContainerStyle={styles.statTileInner}
            >
              <Flame size={20} color={palette.coral[400]} />
              <Text style={styles.statBigNumber}>{cookedCount}</Text>
              <Text style={styles.statCaption}>Cooked Dishes</Text>
            </GlassSurface>

            <GlassSurface
              variant="subtle"
              borderRadius={18}
              style={styles.statTile}
              contentContainerStyle={styles.statTileInner}
            >
              <Heart size={20} color={palette.crimson[400]} fill={palette.crimson[400]} />
              <Text style={styles.statBigNumber}>{favoriteRecipes.length}</Text>
              <Text style={styles.statCaption}>Favorites</Text>
            </GlassSurface>

            <GlassSurface
              variant="subtle"
              borderRadius={18}
              style={styles.statTile}
              contentContainerStyle={styles.statTileInner}
            >
              <UtensilsCrossed size={20} color={palette.peach[300]} />
              <Text style={styles.statBigNumber}>{userRecipes.length}</Text>
              <Text style={styles.statCaption}>My Recipes</Text>
            </GlassSurface>

            <GlassSurface
              variant="subtle"
              borderRadius={18}
              style={styles.statTile}
              contentContainerStyle={styles.statTileInner}
            >
              <ShoppingCart size={20} color={palette.mint[300]} />
              <Text style={styles.statBigNumber}>{shoppingList.length}</Text>
              <Text style={styles.statCaption}>Shopping Items</Text>
            </GlassSurface>
          </View>

          {/* Theme Appearance Mode Toggle */}
          <Text style={styles.sectionHeader}>Appearance Theme</Text>
          <GlassSurface
            variant="subtle"
            borderRadius={20}
            style={styles.themeContainer}
            contentContainerStyle={styles.themeInner}
          >
            {(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => {
              const isActive = themeMode === mode;
              const labels: Record<ThemeMode, { title: string; icon: any }> = {
                dark: { title: 'Dark', icon: Moon },
                light: { title: 'Light', icon: Sun },
                system: { title: 'System', icon: Laptop },
              };
              const IconComp = labels[mode].icon;

              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => {
                    haptics.selection();
                    setThemeMode(mode);
                  }}
                  activeOpacity={0.75}
                  style={[
                    styles.themeModeBtn,
                    isActive && styles.themeModeBtnActive,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Theme mode: ${labels[mode].title}`}
                >
                  <IconComp
                    size={18}
                    color={isActive ? palette.forest[900] : palette.text.onDarkSecondary}
                  />
                  <Text
                    style={[
                      styles.themeModeText,
                      isActive && styles.themeModeTextActive,
                    ]}
                  >
                    {labels[mode].title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </GlassSurface>

          {/* Quick Access Menu Items */}
          <Text style={styles.sectionHeader}>Quick Access</Text>
          <View style={styles.quickAccessList}>
            <TouchableOpacity
              onPress={() => router.push('/my-food')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Navigate to My Food collection"
            >
              <GlassSurface
                variant="subtle"
                borderRadius={18}
                style={styles.accessItem}
                contentContainerStyle={styles.accessItemInner}
              >
                <View style={[styles.accessIconBg, { backgroundColor: 'rgba(240, 183, 159, 0.18)' }]}>
                  <UtensilsCrossed size={18} color={palette.peach[300]} />
                </View>
                <View style={styles.accessItemContent}>
                  <Text style={styles.accessItemTitle}>My Food Collection</Text>
                  <Text style={styles.accessItemSubtitle}>{userRecipes.length} custom creations</Text>
                </View>
              </GlassSurface>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/shopping-list')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Navigate to Shopping List"
            >
              <GlassSurface
                variant="subtle"
                borderRadius={18}
                style={styles.accessItem}
                contentContainerStyle={styles.accessItemInner}
              >
                <View style={[styles.accessIconBg, { backgroundColor: 'rgba(195, 235, 197, 0.18)' }]}>
                  <ShoppingCart size={18} color={palette.mint[300]} />
                </View>
                <View style={styles.accessItemContent}>
                  <Text style={styles.accessItemTitle}>Shopping List</Text>
                  <Text style={styles.accessItemSubtitle}>
                    {shoppingList.length} total items ({shoppingList.filter((i) => !i.isChecked).length} remaining)
                  </Text>
                </View>
              </GlassSurface>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/explore')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Explore full recipe catalogue"
            >
              <GlassSurface
                variant="subtle"
                borderRadius={18}
                style={styles.accessItem}
                contentContainerStyle={styles.accessItemInner}
              >
                <View style={[styles.accessIconBg, { backgroundColor: 'rgba(73, 176, 161, 0.18)' }]}>
                  <Compass size={18} color={palette.teal[400]} />
                </View>
                <View style={styles.accessItemContent}>
                  <Text style={styles.accessItemTitle}>Explore Recipes</Text>
                  <Text style={styles.accessItemSubtitle}>{recipes.length} world-class recipes</Text>
                </View>
              </GlassSurface>
            </TouchableOpacity>
          </View>

          {/* Reset & QA Controls */}
          <Text style={styles.sectionHeader}>Preferences & Data</Text>
          <View style={styles.dangerSection}>
            <TouchableOpacity
              onPress={handleResetData}
              activeOpacity={0.8}
              style={styles.resetButton}
              accessibilityRole="button"
              accessibilityLabel="Reset all app data"
            >
              <Trash2 size={16} color={palette.crimson[400]} />
              <Text style={styles.resetButtonText}>Reset All App Data & History</Text>
            </TouchableOpacity>
          </View>

          {/* App Credits & QA Badging */}
          <View style={styles.appFooter}>
            <View style={styles.footerBadge}>
              <ShieldCheck size={14} color={palette.mint[300]} />
              <Text style={styles.footerBadgeText}>Foodie Premium v1.0.0</Text>
            </View>
            <Text style={styles.footerCredit}>
              Designed for Coursera Capstone & Google DeepMind
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Onboarding Preferences Re-tuning Modal */}
      <OnboardingModal
        visible={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        isInitialLaunch={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: palette.forest[900],
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: typography.families.bold,
    fontSize: 18,
    color: palette.text.onDark,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  profileCard: {
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  profileInner: {
    alignItems: 'center',
  },
  avatarSection: {
    marginBottom: 14,
  },
  avatarButton: {
    minHeight: 44,
    minWidth: 44,
  },
  avatarFrame: {
    width: 88,
    height: 88,
    borderRadius: 44,
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
  cameraPill: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: palette.mint[300],
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.forest[900],
  },
  identityDetails: {
    alignItems: 'center',
    marginBottom: 14,
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    minHeight: 44,
  },
  userNameText: {
    fontFamily: typography.families.display,
    fontSize: 24,
    color: palette.text.onDark,
  },
  editIcon: {
    marginTop: 2,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    minHeight: 44,
  },
  nameInput: {
    fontFamily: typography.families.display,
    fontSize: 22,
    color: palette.mint[300],
    borderBottomWidth: 1.5,
    borderBottomColor: palette.mint[300],
    paddingVertical: 2,
    paddingHorizontal: 6,
    minWidth: 140,
    textAlign: 'center',
  },
  saveNameBtn: {
    backgroundColor: palette.mint[300],
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  userRoleText: {
    fontFamily: typography.families.semiBold,
    fontSize: 12.5,
    color: palette.mint[300],
    letterSpacing: 0.5,
  },
  userBioText: {
    fontFamily: typography.families.regular,
    fontSize: 13,
    color: palette.text.onDarkSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  prefChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
  },
  prefChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  prefChipText: {
    fontFamily: typography.families.medium,
    fontSize: 11.5,
    color: palette.text.onDark,
  },
  editPrefButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: palette.mint[300],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
    minHeight: 44,
  },
  editPrefButtonText: {
    fontFamily: typography.families.bold,
    fontSize: 13,
    color: palette.forest[900],
  },
  sectionHeader: {
    fontFamily: typography.families.bold,
    fontSize: 14,
    letterSpacing: 0.8,
    color: palette.mint[300],
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statTile: {
    flex: 1,
    minWidth: '46%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  statTileInner: {
    padding: 14,
    alignItems: 'center',
  },
  statBigNumber: {
    fontFamily: typography.families.bold,
    fontSize: 22,
    color: palette.text.onDark,
    marginTop: 6,
    marginBottom: 2,
  },
  statCaption: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.text.onDarkSecondary,
  },
  themeContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    marginBottom: 24,
  },
  themeInner: {
    flexDirection: 'row',
    padding: 6,
    gap: 6,
  },
  themeModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    minHeight: 44,
  },
  themeModeBtnActive: {
    backgroundColor: palette.mint[300],
  },
  themeModeText: {
    fontFamily: typography.families.semiBold,
    fontSize: 13,
    color: palette.text.onDarkSecondary,
  },
  themeModeTextActive: {
    color: palette.forest[900],
    fontFamily: typography.families.bold,
  },
  quickAccessList: {
    gap: 10,
    marginBottom: 24,
  },
  accessItem: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  accessItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minHeight: 44,
  },
  accessIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  accessItemContent: {
    flex: 1,
  },
  accessItemTitle: {
    fontFamily: typography.families.semiBold,
    fontSize: 14.5,
    color: palette.text.onDark,
  },
  accessItemSubtitle: {
    fontFamily: typography.families.regular,
    fontSize: 12,
    color: palette.text.onDarkSecondary,
    marginTop: 2,
  },
  dangerSection: {
    marginBottom: 24,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    minHeight: 44,
  },
  resetButtonText: {
    fontFamily: typography.families.semiBold,
    fontSize: 13.5,
    color: palette.crimson[400],
  },
  appFooter: {
    alignItems: 'center',
    paddingTop: 12,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  footerBadgeText: {
    fontFamily: typography.families.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: palette.mint[300],
  },
  footerCredit: {
    fontFamily: typography.families.regular,
    fontSize: 11,
    color: palette.text.onDarkSecondary,
    opacity: 0.7,
  },
});
