import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Heart,
  Share2,
  Bell,
  Menu,
  Play,
  Plus,
  Clock,
  Flame,
  Star,
  Sparkles,
  Utensils,
  Layers,
  ChefHat,
  Bookmark,
  Compass,
  Check,
} from 'lucide-react-native';

import {
  GlassSurface,
  GlassIconButton,
  GlassChip,
  GlassBar,
  GradientBackground,
} from '../components/ui';
import { palette, typography, radii, spacing, shadows } from '../theme/tokens';

const BRIGHT_FOOD_PHOTO =
  'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=85';

export default function GlassPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [bgMode, setBgMode] = useState<'dark' | 'bright' | 'split'>('dark');
  const [simulateReduceTransparency, setSimulateReduceTransparency] = useState(false);
  const [servingsMultiplier, setServingsMultiplier] = useState<'1x' | '2x' | '3x' | '4x'>('2x');
  const [selectedCategory, setSelectedCategory] = useState<string>('Breakfast');
  const [isFavorited, setIsFavorited] = useState(true);

  const categories = ['All', 'Breakfast', 'Salads', 'Desserts', 'Quick'];

  return (
    <View style={styles.container}>
      {/* Background Layer */}
      {bgMode === 'dark' && (
        <GradientBackground
          preset="mint-to-forest"
          fullScreen
          style={StyleSheet.absoluteFill}
        />
      )}

      {bgMode === 'bright' && (
        <Image
          source={{ uri: BRIGHT_FOOD_PHOTO }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
      )}

      {bgMode === 'split' && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={{ uri: BRIGHT_FOOD_PHOTO }}
            style={{ width: '100%', height: '50%' }}
            contentFit="cover"
          />
          <GradientBackground
            preset="mint-to-forest"
            style={{ width: '100%', height: '50%' }}
          />
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.sm,
            paddingBottom: insets.bottom + spacing.huge,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.headerRow}>
          <GlassIconButton
            icon={ArrowLeft}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            variant="regular"
            noBlur={simulateReduceTransparency}
          />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Glass UI Kit</Text>
            <Text style={styles.headerSubtitle}>M1 Component Verification</Text>
          </View>
          <GlassIconButton
            icon={Bell}
            badgeCount={3}
            onPress={() => {}}
            accessibilityLabel="Notifications"
            variant="regular"
            noBlur={simulateReduceTransparency}
          />
        </View>

        {/* Background Selector & Transparency Toggle */}
        <GlassBar
          variant="regular"
          size="sm"
          borderRadius={radii.xl}
          style={styles.controlPill}
          noBlur={simulateReduceTransparency}
        >
          <View style={styles.bgToggleRow}>
            {(['dark', 'bright', 'split'] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setBgMode(mode)}
                style={[
                  styles.bgTab,
                  bgMode === mode && styles.bgTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.bgTabText,
                    bgMode === mode && styles.bgTabTextActive,
                  ]}
                >
                  {mode === 'dark' ? 'Dark Base' : mode === 'bright' ? 'Bright Photo' : 'Split View'}
                </Text>
              </Pressable>
            ))}
          </View>
        </GlassBar>

        {/* Accessibility Simulator Chip */}
        <View style={styles.transparencyRow}>
          <Pressable
            onPress={() => setSimulateReduceTransparency(!simulateReduceTransparency)}
            style={[
              styles.transparencyToggle,
              simulateReduceTransparency && styles.transparencyToggleActive,
            ]}
          >
            <Layers size={14} color={simulateReduceTransparency ? palette.coral[400] : palette.text.onDarkSecondary} />
            <Text style={[styles.transparencyToggleText, simulateReduceTransparency && styles.transparencyToggleTextActive]}>
              {simulateReduceTransparency ? 'Transparency: Reduced (Solid)' : 'Transparency: Real Blur & Glass'}
            </Text>
          </Pressable>
        </View>

        {/* Section 1: Glass Icon Buttons (44pt circles) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Glass Icon Buttons (44pt Circles)</Text>
          <Text style={styles.sectionDescription}>
            44pt minimum touch target, light-edge border, tactile spring press & haptic feedback.
          </Text>

          <View style={styles.rowWrap}>
            <View style={styles.componentSample}>
              <GlassIconButton
                icon={Menu}
                accessibilityLabel="Menu"
                variant="regular"
                noBlur={simulateReduceTransparency}
              />
              <Text style={styles.sampleLabel}>Regular</Text>
            </View>

            <View style={styles.componentSample}>
              <GlassIconButton
                icon={Heart}
                iconColor={isFavorited ? palette.coral[500] : undefined}
                onPress={() => setIsFavorited(!isFavorited)}
                accessibilityLabel="Favorite"
                variant={isFavorited ? 'coral' : 'regular'}
                noBlur={simulateReduceTransparency}
              />
              <Text style={styles.sampleLabel}>{isFavorited ? 'Favorited' : 'Normal'}</Text>
            </View>

            <View style={styles.componentSample}>
              <GlassIconButton
                icon={Share2}
                accessibilityLabel="Share"
                variant="mint"
                noBlur={simulateReduceTransparency}
              />
              <Text style={styles.sampleLabel}>Mint</Text>
            </View>

            <View style={styles.componentSample}>
              <GlassIconButton
                icon={ChefHat}
                accessibilityLabel="Chef Hat"
                variant="peach"
                noBlur={simulateReduceTransparency}
              />
              <Text style={styles.sampleLabel}>Peach</Text>
            </View>

            <View style={styles.componentSample}>
              <GlassIconButton
                icon={Plus}
                accessibilityLabel="Add"
                variant="prominent"
                badgeCount={5}
                noBlur={simulateReduceTransparency}
              />
              <Text style={styles.sampleLabel}>Badge</Text>
            </View>

            <View style={styles.componentSample}>
              <GlassIconButton
                icon={Play}
                accessibilityLabel="Play"
                variant="white"
                noBlur={simulateReduceTransparency}
              />
              <Text style={styles.sampleLabel}>White</Text>
            </View>
          </View>
        </View>

        {/* Section 2: Glass Chips (Time chip, Filters, Badges) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Glass Chips (Pills)</Text>
          <Text style={styles.sectionDescription}>
            Includes signature reference opaque white chip (&quot;30 min&quot; with dark text) and translucent pills.
          </Text>

          <View style={styles.rowWrap}>
            <GlassChip
              variant="white"
              icon={Clock}
              label="30 min"
              noBlur={simulateReduceTransparency}
            />
            <GlassChip
              variant="default"
              icon={Flame}
              label="450 kcal"
              noBlur={simulateReduceTransparency}
            />
            <GlassChip
              variant="mint"
              icon={Sparkles}
              label="Fresh Herbs"
              noBlur={simulateReduceTransparency}
            />
            <GlassChip
              variant="peach"
              icon={Utensils}
              label="Easy Prep"
              noBlur={simulateReduceTransparency}
            />
            <GlassChip
              variant="coral"
              icon={Star}
              label="4.9 (128)"
              noBlur={simulateReduceTransparency}
            />
          </View>

          {/* Interactive Filter Pills */}
          <Text style={[styles.subHeading, { marginTop: spacing.lg }]}>
            Interactive Filter Chips (Toggle State)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {categories.map((cat) => (
              <GlassChip
                key={cat}
                label={cat}
                selected={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
                noBlur={simulateReduceTransparency}
              />
            ))}
          </ScrollView>
        </View>

        {/* Section 3: Glass Bars (Servings Scaler & Floating Navigation) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Glass Bars</Text>
          <Text style={styles.sectionDescription}>
            Wide capsules for the recipe servings scaler and the floating bottom navigation bar.
          </Text>

          {/* Servings Scaler Bar */}
          <Text style={styles.subHeading}>Servings Scaler Bar</Text>
          <GlassBar
            variant="regular"
            size="sm"
            style={styles.servingsBar}
            noBlur={simulateReduceTransparency}
          >
            <Text style={styles.servingsLabel}>Servings:</Text>
            <View style={styles.servingsPills}>
              {(['1x', '2x', '3x', '4x'] as const).map((mult) => (
                <Pressable
                  key={mult}
                  onPress={() => setServingsMultiplier(mult)}
                  style={[
                    styles.multiplierPill,
                    servingsMultiplier === mult && styles.multiplierPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.multiplierText,
                      servingsMultiplier === mult && styles.multiplierTextActive,
                    ]}
                  >
                    {mult}
                  </Text>
                </Pressable>
              ))}
            </View>
          </GlassBar>

          {/* Mock Floating Bottom Tab Bar */}
          <Text style={[styles.subHeading, { marginTop: spacing.lg }]}>
            Mock Floating Tab Bar (Reference Navigation Pill)
          </Text>
          <GlassBar
            variant="floating"
            size="lg"
            style={styles.mockTabBar}
            noBlur={simulateReduceTransparency}
          >
            <View style={styles.tabItemActive}>
              <ChefHat size={22} color={palette.white} />
            </View>
            <View style={styles.tabItem}>
              <Compass size={22} color={palette.text.onDarkSecondary} />
            </View>
            <View style={styles.tabItem}>
              <Bookmark size={22} color={palette.text.onDarkSecondary} />
            </View>
            <View style={styles.tabItem}>
              <Bell size={22} color={palette.text.onDarkSecondary} />
            </View>
          </GlassBar>
        </View>

        {/* Section 4: Glass Surface Hero Card Strip */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Hero Card Caption Strip (GlassSurface)</Text>
          <Text style={styles.sectionDescription}>
            Signature hero card preview: frosted caption strip with start cooking button and time badge.
          </Text>

          {/* Hero Card Container with Image */}
          <View style={styles.heroCardContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            {/* Top row with chips */}
            <View style={styles.heroTopRow}>
              <GlassChip
                variant="white"
                icon={Clock}
                label="25 min"
                noBlur={simulateReduceTransparency}
              />
              <GlassIconButton
                icon={Bookmark}
                accessibilityLabel="Bookmark recipe"
                variant="regular"
                noBlur={simulateReduceTransparency}
              />
            </View>

            {/* Bottom Glass Caption Strip */}
            <GlassSurface
              variant="prominent"
              borderRadius={radii.xxl}
              style={styles.heroCaptionStrip}
              noBlur={simulateReduceTransparency}
            >
              <View style={styles.heroCaptionContent}>
                <View style={styles.heroCaptionTextCol}>
                  <Text style={styles.heroDishTitle}>Truffle & Herb Buddha Bowl</Text>
                  <Text style={styles.heroDishSubtitle}>Healthy • 480 kcal • 4.9 ★</Text>
                </View>
                <GlassChip
                  variant="coral"
                  icon={Play}
                  iconPosition="right"
                  label="Start"
                  size="md"
                  onPress={() => {}}
                  noBlur={simulateReduceTransparency}
                />
              </View>
            </GlassSurface>
          </View>
        </View>

        {/* Section 5: Glass Surface Variants Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>GlassSurface Variants</Text>
          <Text style={styles.sectionDescription}>
            8 curated variants with light edge highlights and faint inner gradient fill.
          </Text>

          <View style={styles.variantsGrid}>
            {(['regular', 'subtle', 'prominent', 'clear', 'mint', 'peach', 'coral', 'white'] as const).map(
              (variant) => (
                <GlassSurface
                  key={variant}
                  variant={variant}
                  borderRadius={radii.lg}
                  style={styles.variantCard}
                  noBlur={simulateReduceTransparency}
                >
                  <Text
                    style={[
                      styles.variantTitle,
                      variant === 'white' && styles.variantTitleDark,
                    ]}
                  >
                    {variant.toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      styles.variantDesc,
                      variant === 'white' && styles.variantDescDark,
                    ]}
                  >
                    1px light top edge
                  </Text>
                </GlassSurface>
              )
            )}
          </View>
        </View>

        {/* Section 6: Nested Blur Guard Test */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Blur Nesting Guard (Performance)</Text>
          <Text style={styles.sectionDescription}>
            Phase 2 rule: &quot;Never stack more than two blur layers on screen&quot;. Nested GlassSurfaces automatically
            use context depth to skip inner blur and prevent Android performance drops.
          </Text>

          <GlassSurface
            variant="regular"
            borderRadius={radii.xl}
            style={styles.nestedOuter}
            noBlur={simulateReduceTransparency}
          >
            <Text style={styles.nestedOuterTitle}>Outer GlassSurface (Level 0 - Active Blur)</Text>
            <GlassSurface
              variant="subtle"
              borderRadius={radii.lg}
              style={styles.nestedInner}
              noBlur={simulateReduceTransparency}
            >
              <Text style={styles.nestedInnerTitle}>Inner GlassSurface (Level 1 - Auto-Bypassed Blur)</Text>
              <Text style={styles.nestedInnerDesc}>
                ✓ Zero frame drops on mid-range Android devices.
              </Text>
            </GlassSurface>
          </GlassSurface>
        </View>

        {/* Status Confirmation Badge */}
        <View style={styles.statusBadgeContainer}>
          <GlassSurface
            variant="mint"
            borderRadius={radii.pill}
            style={styles.statusBadge}
            noBlur={simulateReduceTransparency}
          >
            <Check size={16} color={palette.mint[300]} />
            <Text style={styles.statusBadgeText}>M1 Glass UI Kit Verified & Ready</Text>
          </GlassSurface>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.forest[900],
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.families.bold,
    fontSize: typography.scale.headline.fontSize,
    color: palette.text.onDark,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontFamily: typography.families.medium,
    fontSize: typography.scale.caption.fontSize,
    color: palette.text.onDarkSecondary,
  },
  controlPill: {
    marginVertical: spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  bgToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  bgTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  bgTabText: {
    fontFamily: typography.families.semiBold,
    fontSize: 12,
    color: palette.text.onDarkSecondary,
  },
  bgTabTextActive: {
    color: palette.white,
    fontFamily: typography.families.bold,
  },
  transparencyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  transparencyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  transparencyToggleActive: {
    backgroundColor: 'rgba(240, 138, 106, 0.18)',
    borderColor: palette.coral[400],
  },
  transparencyToggleText: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.text.onDarkSecondary,
  },
  transparencyToggleTextActive: {
    color: palette.coral[400],
    fontFamily: typography.families.bold,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeading: {
    fontFamily: typography.families.bold,
    fontSize: typography.scale.headline.fontSize,
    color: palette.text.onDark,
    marginBottom: 4,
  },
  sectionDescription: {
    fontFamily: typography.families.regular,
    fontSize: typography.scale.bodySmall.fontSize,
    color: palette.text.onDarkSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  subHeading: {
    fontFamily: typography.families.semiBold,
    fontSize: typography.scale.body.fontSize,
    color: palette.text.onDark,
    marginBottom: spacing.sm,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'center',
  },
  componentSample: {
    alignItems: 'center',
    gap: 6,
  },
  sampleLabel: {
    fontFamily: typography.families.medium,
    fontSize: 11,
    color: palette.text.onDarkSecondary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  servingsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  servingsLabel: {
    fontFamily: typography.families.semiBold,
    fontSize: 14,
    color: palette.text.onDark,
  },
  servingsPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  multiplierPill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  multiplierPillActive: {
    backgroundColor: palette.coral[500],
  },
  multiplierText: {
    fontFamily: typography.families.semiBold,
    fontSize: 13,
    color: palette.text.onDarkSecondary,
  },
  multiplierTextActive: {
    color: palette.white,
    fontFamily: typography.families.bold,
  },
  mockTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    height: 64,
  },
  tabItem: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCardContainer: {
    height: 260,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: spacing.md,
    ...shadows.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroCaptionStrip: {
    padding: spacing.md,
  },
  heroCaptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCaptionTextCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  heroDishTitle: {
    fontFamily: typography.families.bold,
    fontSize: 16,
    color: palette.text.onDark,
    marginBottom: 2,
  },
  heroDishSubtitle: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.text.onDarkSecondary,
  },
  variantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  variantCard: {
    width: '48%',
    padding: spacing.md,
    height: 80,
    justifyContent: 'center',
  },
  variantTitle: {
    fontFamily: typography.families.bold,
    fontSize: 13,
    color: palette.text.onDark,
    marginBottom: 2,
  },
  variantTitleDark: {
    color: palette.forest[900],
  },
  variantDesc: {
    fontFamily: typography.families.regular,
    fontSize: 11,
    color: palette.text.onDarkSecondary,
  },
  variantDescDark: {
    color: palette.forest[700],
  },
  nestedOuter: {
    padding: spacing.lg,
  },
  nestedOuterTitle: {
    fontFamily: typography.families.bold,
    fontSize: 14,
    color: palette.text.onDark,
    marginBottom: spacing.sm,
  },
  nestedInner: {
    padding: spacing.md,
  },
  nestedInnerTitle: {
    fontFamily: typography.families.semiBold,
    fontSize: 13,
    color: palette.text.onDark,
    marginBottom: 2,
  },
  nestedInnerDesc: {
    fontFamily: typography.families.regular,
    fontSize: 12,
    color: palette.text.onDarkSecondary,
  },
  statusBadgeContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  statusBadgeText: {
    fontFamily: typography.families.bold,
    fontSize: 13,
    color: palette.mint[300],
  },
});
