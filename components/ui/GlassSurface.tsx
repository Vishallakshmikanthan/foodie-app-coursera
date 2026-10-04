import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
  AccessibilityInfo,
  ViewProps,
} from 'react-native';
import { BlurView, BlurTint } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { radii, shadows } from '../../theme/tokens';

/**
 * Context to track glass surface nesting depth.
 * Per Phase 2 spec: "Never stack more than two blur layers on screen at once.
 * Blur is the main performance cost, especially on Android."
 */
export const GlassNestingContext = createContext<number>(0);

export type GlassVariant =
  | 'regular'
  | 'subtle'
  | 'prominent'
  | 'clear'
  | 'mint'
  | 'peach'
  | 'coral'
  | 'white';

export interface GlassSurfaceProps extends ViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  variant?: GlassVariant;
  /**
   * Blur intensity from 1 to 100. Defaults to 40 per tokens.
   */
  intensity?: number;
  /**
   * Blur tint: 'dark' | 'light' | 'default'. Defaults to 'dark'.
   */
  tint?: BlurTint;
  /**
   * Border radius. Defaults to radii.xl (20).
   */
  borderRadius?: number;
  /**
   * Border width. Defaults to 1 for the razor-thin glass border.
   */
  borderWidth?: number;
  /**
   * If true, renders a simulated light edge where top border is brighter than bottom.
   * Default is true.
   */
  hasLightBorderEdge?: boolean;
  /**
   * If true, applies a subtle inner top-to-bottom gradient fill to avoid flat tint.
   * Default is true.
   */
  useInnerGradient?: boolean;
  /**
   * If true, skips blur effect and uses translucent solid background.
   * Also triggered automatically if Reduce Transparency is enabled or nested too deep.
   */
  noBlur?: boolean;
  /**
   * If true, forces blur even if nested inside another GlassSurface.
   */
  forceBlur?: boolean;
  /**
   * Enable soft shadow preset. Defaults to true.
   */
  hasShadow?: boolean;
}

interface GlassVariantConfig {
  gradientColors: [string, string];
  fallbackBg: string;
  borderTop: string;
  borderBottom: string;
  borderSides: string;
  defaultTint: BlurTint;
}

const VARIANT_CONFIGS: Record<GlassVariant, GlassVariantConfig> = {
  regular: {
    gradientColors: ['rgba(255, 255, 255, 0.16)', 'rgba(255, 255, 255, 0.04)'],
    fallbackBg: 'rgba(27, 43, 47, 0.85)',
    borderTop: 'rgba(255, 255, 255, 0.42)',
    borderBottom: 'rgba(255, 255, 255, 0.12)',
    borderSides: 'rgba(255, 255, 255, 0.22)',
    defaultTint: 'dark',
  },
  subtle: {
    gradientColors: ['rgba(255, 255, 255, 0.09)', 'rgba(255, 255, 255, 0.02)'],
    fallbackBg: 'rgba(27, 43, 47, 0.65)',
    borderTop: 'rgba(255, 255, 255, 0.24)',
    borderBottom: 'rgba(255, 255, 255, 0.06)',
    borderSides: 'rgba(255, 255, 255, 0.14)',
    defaultTint: 'dark',
  },
  prominent: {
    gradientColors: ['rgba(255, 255, 255, 0.26)', 'rgba(255, 255, 255, 0.10)'],
    fallbackBg: 'rgba(27, 43, 47, 0.95)',
    borderTop: 'rgba(255, 255, 255, 0.55)',
    borderBottom: 'rgba(255, 255, 255, 0.20)',
    borderSides: 'rgba(255, 255, 255, 0.35)',
    defaultTint: 'dark',
  },
  clear: {
    gradientColors: ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.01)'],
    fallbackBg: 'rgba(14, 26, 23, 0.50)',
    borderTop: 'rgba(255, 255, 255, 0.18)',
    borderBottom: 'rgba(255, 255, 255, 0.05)',
    borderSides: 'rgba(255, 255, 255, 0.10)',
    defaultTint: 'dark',
  },
  mint: {
    gradientColors: ['rgba(195, 235, 197, 0.28)', 'rgba(140, 201, 168, 0.08)'],
    fallbackBg: 'rgba(20, 38, 33, 0.88)',
    borderTop: 'rgba(195, 235, 197, 0.50)',
    borderBottom: 'rgba(140, 201, 168, 0.18)',
    borderSides: 'rgba(163, 214, 188, 0.30)',
    defaultTint: 'dark',
  },
  peach: {
    gradientColors: ['rgba(252, 191, 164, 0.28)', 'rgba(240, 183, 159, 0.08)'],
    fallbackBg: 'rgba(38, 26, 23, 0.88)',
    borderTop: 'rgba(252, 191, 164, 0.50)',
    borderBottom: 'rgba(240, 183, 159, 0.18)',
    borderSides: 'rgba(247, 167, 142, 0.30)',
    defaultTint: 'dark',
  },
  coral: {
    gradientColors: ['rgba(240, 138, 106, 0.30)', 'rgba(221, 115, 82, 0.10)'],
    fallbackBg: 'rgba(45, 24, 20, 0.90)',
    borderTop: 'rgba(240, 138, 106, 0.55)',
    borderBottom: 'rgba(221, 115, 82, 0.20)',
    borderSides: 'rgba(243, 152, 124, 0.35)',
    defaultTint: 'dark',
  },
  white: {
    // Reference: "30 min" crisp white pill with dark text
    gradientColors: ['rgba(255, 255, 255, 0.96)', 'rgba(255, 255, 255, 0.86)'],
    fallbackBg: '#FFFFFF',
    borderTop: 'rgba(255, 255, 255, 1.0)',
    borderBottom: 'rgba(230, 235, 232, 0.8)',
    borderSides: 'rgba(245, 248, 246, 0.9)',
    defaultTint: 'light',
  },
};

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  style,
  contentContainerStyle,
  variant = 'regular',
  intensity = 40,
  tint,
  borderRadius = radii.xl,
  borderWidth = 1,
  hasLightBorderEdge = true,
  useInnerGradient = true,
  noBlur = false,
  forceBlur = false,
  hasShadow = true,
  ...restProps
}) => {
  const nestingDepth = useContext(GlassNestingContext);
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // AccessibilityInfo reduce transparency is mobile-only; skip entirely on web
    if (Platform.OS !== 'web' && typeof AccessibilityInfo?.isReduceTransparencyEnabled === 'function') {
      try {
        AccessibilityInfo.isReduceTransparencyEnabled()
          .then((enabled) => {
            if (isMounted) {
              setReduceTransparency(Boolean(enabled));
            }
          })
          .catch(() => {});
      } catch {
        // Safe fallback
      }
    }

    let subscription: { remove?: () => void } | null = null;
    if (Platform.OS !== 'web' && typeof AccessibilityInfo?.addEventListener === 'function') {
      try {
        subscription = AccessibilityInfo.addEventListener(
          'reduceTransparencyChanged',
          (enabled: boolean) => {
            if (isMounted) {
              setReduceTransparency(Boolean(enabled));
            }
          }
        );
      } catch {
        // Listener not supported
      }
    }

    return () => {
      isMounted = false;
      subscription?.remove?.();
    };
  }, []);

  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.regular;
  const effectiveTint = tint || config.defaultTint;

  // Decide whether to use blur or fallback view
  // 1. Accessibility: reduceTransparency disables blur
  // 2. Performance: If already inside another glass surface (nestingDepth >= 1) and not forced, skip nested blur
  // 3. noBlur prop
  const shouldSkipBlur =
    reduceTransparency ||
    noBlur ||
    (!forceBlur && nestingDepth >= 1);

  // Check Liquid Glass on iOS
  const canUseLiquidGlass =
    !shouldSkipBlur &&
    Platform.OS === 'ios' &&
    !!GlassView &&
    !!isGlassEffectAPIAvailable &&
    isGlassEffectAPIAvailable();

  const borderStyles: ViewStyle = borderWidth > 0
    ? hasLightBorderEdge
      ? {
          borderWidth,
          borderTopColor: config.borderTop,
          borderBottomColor: config.borderBottom,
          borderLeftColor: config.borderSides,
          borderRightColor: config.borderSides,
        }
      : {
          borderWidth,
          borderColor: config.borderSides,
        }
    : {};

  const shadowStyles: ViewStyle = hasShadow
    ? {
        ...shadows.glass,
        // Keep Android elevation at 0 on glass to prevent harsh grey shadow polygons
        elevation: Platform.OS === 'android' ? 0 : shadows.glass.elevation,
      }
    : {};

  return (
    <View
      style={[
        styles.container,
        { borderRadius },
        borderStyles,
        shadowStyles,
        style,
      ]}
      {...restProps}
    >
      {/* Background layer: Liquid Glass, BlurView, or Translucent Fallback */}
      {!shouldSkipBlur ? (
        canUseLiquidGlass && GlassView ? (
          <GlassView
            style={[StyleSheet.absoluteFill, { borderRadius }]}
            glassEffectStyle={variant === 'clear' ? 'clear' : 'regular'}
            colorScheme={effectiveTint === 'light' ? 'light' : 'dark'}
          />
        ) : (
          <BlurView
            intensity={intensity}
            tint={effectiveTint}
            style={[StyleSheet.absoluteFill, { borderRadius }]}
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined}
          />
        )
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: config.fallbackBg,
              borderRadius,
            },
          ]}
        />
      )}

      {/* Faint inner gradient to give rich light-falloff aesthetic instead of a flat tint */}
      {useInnerGradient && (
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          {...(Platform.OS !== 'web' ? { pointerEvents: 'none' as const } : {})}
          style={[StyleSheet.absoluteFill, { borderRadius, pointerEvents: 'none' as const }]}
        />
      )}

      {/* Content wrapper with incremented nesting depth context */}
      <GlassNestingContext.Provider value={nestingDepth + 1}>
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      </GlassNestingContext.Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

export default GlassSurface;
