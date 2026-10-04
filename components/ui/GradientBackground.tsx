import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '../../theme/tokens';

export type GradientPreset =
  | 'mint-to-forest'
  | 'forest-deep'
  | 'peach-warm'
  | 'hero-scrim'
  | 'hero-glow'
  | 'card-peach'
  | 'card-mint';

export interface GradientBackgroundProps extends ViewProps {
  /**
   * Pre-configured gradient preset per Phase 2 design system.
   * Default is 'mint-to-forest' (the signature Home atmosphere).
   */
  preset?: GradientPreset;
  /**
   * Custom color list to override the preset colors.
   */
  colors?: string[];
  /**
   * Positions of color stops (0 to 1).
   */
  locations?: number[];
  /**
   * Gradient start point. Default { x: 0.5, y: 0 }.
   */
  start?: { x: number; y: number };
  /**
   * Gradient end point. Default { x: 0.5, y: 1 }.
   */
  end?: { x: number; y: number };
  /**
   * If true, stretches to fill entire parent container via absolute fill.
   */
  fullScreen?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const PRESET_CONFIGS: Record<
  GradientPreset,
  {
    colors: string[];
    locations?: number[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  }
> = {
  // Signature Home screen atmosphere from reference yoga app:
  // Fades from sage-mint at top into dark forest green base at bottom.
  'mint-to-forest': {
    colors: [
      palette.sage[500], // #8CC9A8 (top)
      '#498675', // intermediate transition
      palette.forest[700], // #1B2B2F
      palette.forest[900], // #0E1A17 (deepest)
    ],
    locations: [0.0, 0.28, 0.65, 1.0],
    start: { x: 0.5, y: 0.0 },
    end: { x: 0.5, y: 1.0 },
  },

  // Deep dark base atmosphere for screens, modals, or sheets
  'forest-deep': {
    colors: [
      palette.forest[800], // #142225
      palette.forest[900], // #0E1A17
      palette.forest[950], // #070E0C
    ],
    locations: [0.0, 0.55, 1.0],
    start: { x: 0.5, y: 0.0 },
    end: { x: 0.5, y: 1.0 },
  },

  // Warm food accent gradient for recommended cards or morning breakfast themes
  'peach-warm': {
    colors: [
      palette.peach[200], // #FCBFA4
      palette.peach[300], // #F0B79F
      palette.forest[700], // #1B2B2F
      palette.forest[900], // #0E1A17
    ],
    locations: [0.0, 0.25, 0.70, 1.0],
    start: { x: 0.5, y: 0.0 },
    end: { x: 0.5, y: 1.0 },
  },

  // Bottom gradient scrim to place under text on recipe photos
  'hero-scrim': {
    colors: [
      'rgba(14, 26, 23, 0.0)',
      'rgba(14, 26, 23, 0.35)',
      'rgba(14, 26, 23, 0.85)',
      'rgba(14, 26, 23, 0.98)',
    ],
    locations: [0.0, 0.40, 0.80, 1.0],
    start: { x: 0.5, y: 0.0 },
    end: { x: 0.5, y: 1.0 },
  },

  // Glow under hero card dish (sampled teal accent from reference)
  'hero-glow': {
    colors: [
      'rgba(73, 176, 161, 0.40)', // teal-400
      'rgba(73, 176, 161, 0.15)',
      'rgba(27, 43, 47, 0.0)',
    ],
    locations: [0.0, 0.50, 1.0],
    start: { x: 0.5, y: 0.2 },
    end: { x: 0.5, y: 1.0 },
  },

  // Tinted card gradient for recommended cards (peach)
  'card-peach': {
    colors: [
      'rgba(252, 191, 164, 0.24)',
      'rgba(240, 183, 159, 0.12)',
      'rgba(27, 43, 47, 0.75)',
    ],
    locations: [0.0, 0.4, 1.0],
    start: { x: 0.2, y: 0.0 },
    end: { x: 0.8, y: 1.0 },
  },

  // Tinted card gradient for fresh salads / greens (mint)
  'card-mint': {
    colors: [
      'rgba(195, 235, 197, 0.25)',
      'rgba(140, 201, 168, 0.12)',
      'rgba(27, 43, 47, 0.75)',
    ],
    locations: [0.0, 0.4, 1.0],
    start: { x: 0.2, y: 0.0 },
    end: { x: 0.8, y: 1.0 },
  },
};

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  preset = 'mint-to-forest',
  colors,
  locations,
  start,
  end,
  fullScreen = false,
  children,
  style,
  ...restProps
}) => {
  const config = PRESET_CONFIGS[preset] || PRESET_CONFIGS['mint-to-forest'];

  const resolvedColors = colors && colors.length > 0 ? colors : config.colors;
  const resolvedLocations = locations || config.locations;
  const resolvedStart = start || config.start || { x: 0.5, y: 0.0 };
  const resolvedEnd = end || config.end || { x: 0.5, y: 1.0 };

  return (
    <LinearGradient
      colors={resolvedColors as [string, string, ...string[]]}
      locations={resolvedLocations as any}
      start={resolvedStart}
      end={resolvedEnd}
      style={[
        styles.base,
        fullScreen && StyleSheet.absoluteFill,
        style,
      ]}
      {...restProps}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  base: {
    position: 'relative',
  },
});

export default GradientBackground;
