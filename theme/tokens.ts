/**
 * Foodie Theme Tokens
 * Phase 2 Design System tokens derived from the yoga-app dark-first reference.
 */

export const palette = {
  // Fresh Greens (The core atmosphere)
  mint: {
    100: '#EBF7EC',
    200: '#D5F1D7',
    300: '#C3EBC5', // sampled: hero card, light surfaces
    400: '#A6DCAB',
    500: '#86C78C',
  },
  sage: {
    400: '#A3D6BC',
    500: '#8CC9A8', // eyeballed: top-of-screen gradient start
    600: '#71B38F',
  },
  teal: {
    300: '#69C4B6',
    400: '#49B0A1', // sampled: hero card glow & accents
    500: '#34998B',
  },
  forest: {
    600: '#243A3F',
    700: '#1B2B2F', // sampled: dark screen base / card surface
    800: '#142225', // intermediate dark surface
    850: '#101C1A',
    900: '#0E1A17', // eyeballed: deepest screen background & text on mint
    950: '#070E0C', // ultra-deep background
  },

  // Warm Food Accents
  peach: {
    50: '#FFF7ED',
    100: '#FDECE5',
    200: '#FCBFA4', // sampled: lighter peach highlight
    300: '#F0B79F', // sampled: recommended-card tint
    400: '#E59D7F',
    500: '#FDBA74',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
  },
  coral: {
    300: '#F7A78E',
    400: '#F3987C',
    500: '#F08A6A', // eyeballed: primary action, replaces #FF6B35
    600: '#DD7352',
    700: '#C25B3C',
  },
  saffron: {
    300: '#F8CE85',
    400: '#F2B65A', // new: calories, ratings, badges, highlights
    500: '#DE9E3E',
  },

  // Neutrals & Grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // State & Status Colors
  crimson: {
    50: '#FFF0F0',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  emerald: {
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
  },
  amber: {
    400: '#FBBF24',
    500: '#F59E0B',
  },
  blue: {
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
  },

  // Monochrome & Glass
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Text & Content
  text: {
    onDark: '#F3F7F4',
    onDarkSecondary: '#9DB3AA',
    onDarkMuted: '#678278',
    onMint: '#0E1A17',
  },

  glass: {
    fill: 'rgba(255, 255, 255, 0.14)',
    fillSubtle: 'rgba(255, 255, 255, 0.08)',
    fillStrong: 'rgba(255, 255, 255, 0.22)',
    border: 'rgba(255, 255, 255, 0.28)',
    borderSubtle: 'rgba(255, 255, 255, 0.14)',
    borderStrong: 'rgba(255, 255, 255, 0.40)',
    blurIntensity: 40,
  },
} as const;

export const difficultyColors = {
  dark: {
    Easy: {
      bg: 'rgba(73, 176, 161, 0.15)',
      text: palette.sage[500],
      border: 'rgba(73, 176, 161, 0.35)',
    },
    Medium: {
      bg: 'rgba(242, 182, 90, 0.15)',
      text: palette.saffron[400],
      border: 'rgba(242, 182, 90, 0.35)',
    },
    Hard: {
      bg: 'rgba(248, 113, 113, 0.15)',
      text: palette.crimson[400],
      border: 'rgba(248, 113, 113, 0.35)',
    },
    default: {
      bg: 'rgba(255, 255, 255, 0.08)',
      text: palette.text.onDarkSecondary,
      border: 'rgba(255, 255, 255, 0.16)',
    },
  },
  light: {
    Easy: { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' },
    Medium: { bg: '#FFF3E0', text: '#E65100', border: '#FFE0B2' },
    Hard: { bg: '#FFEBEE', text: '#C62828', border: '#FFCDD2' },
    default: { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0' },
  },
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
} as const;

export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 9999,
  full: 9999,
} as const;

export const typography = {
  families: {
    regular: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    semiBold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
    extraBold: 'Manrope_800ExtraBold',
    display: 'Fraunces_700Bold',
    displaySemiBold: 'Fraunces_600SemiBold',
  },
  scale: {
    display: {
      fontSize: 32,
      lineHeight: 40,
      fontFamily: 'Fraunces_700Bold',
      letterSpacing: -0.5,
    },
    titleLarge: {
      fontSize: 26,
      lineHeight: 32,
      fontFamily: 'Manrope_700Bold',
      letterSpacing: -0.3,
    },
    title: {
      fontSize: 22,
      lineHeight: 28,
      fontFamily: 'Manrope_700Bold',
      letterSpacing: -0.2,
    },
    headline: {
      fontSize: 18,
      lineHeight: 24,
      fontFamily: 'Manrope_600SemiBold',
    },
    bodyLarge: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'Manrope_500Medium',
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontFamily: 'Manrope_400Regular',
    },
    bodySmall: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: 'Manrope_400Regular',
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'Manrope_500Medium',
    },
    micro: {
      fontSize: 10,
      lineHeight: 14,
      fontFamily: 'Manrope_600SemiBold',
    },
  },
} as const;

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  glowCoral: {
    shadowColor: '#F08A6A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  glowMint: {
    shadowColor: '#C3EBC5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export interface ThemeColors {
  // Screens & Surfaces
  background: string;
  backgroundSecondary: string;
  backgroundElevated: string;
  surface: string;
  surfaceElevated: string;
  surfaceSubtle: string;
  surfaceGlass: string;
  surfaceGlassStrong: string;

  // Primary & Accents
  primary: string;
  primaryHover: string;
  primaryPressed: string;
  primarySubtle: string;
  accentMint: string;
  accentSage: string;
  accentTeal: string;
  accentPeach: string;
  accentPeachLight: string;
  accentSaffron: string;

  // Typography
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  textOnPrimary: string;
  textOnMint: string;

  // Borders & Dividers
  border: string;
  borderSubtle: string;
  borderGlass: string;
  borderGlassSubtle: string;
  borderFocus: string;

  // Inputs & Chips
  inputBackground: string;
  inputBorder: string;
  chipBackground: string;
  chipBorder: string;
  chipSelectedBackground: string;
  chipSelectedBorder: string;

  // Badges & Actions
  badgeBackground: string;
  badgeText: string;
  favoriteActive: string;
  favoriteInactive: string;
  favoriteBackground: string;
  deleteButton: string;
  deleteButtonBg: string;
  deleteButtonBorder: string;
  editButton: string;
  editButtonBg: string;
  editButtonBorder: string;

  // Feedback & Status
  success: string;
  successBg: string;
  successBorder: string;
  warning: string;
  warningBg: string;
  warningBorder: string;
  error: string;
  errorBg: string;
  errorBorder: string;
}

export const darkColors: ThemeColors = {
  background: palette.forest[900], // #0E1A17
  backgroundSecondary: palette.forest[850], // #101C1A
  backgroundElevated: palette.forest[800], // #142225
  surface: palette.forest[700], // #1B2B2F
  surfaceElevated: palette.forest[600], // #243A3F
  surfaceSubtle: 'rgba(255, 255, 255, 0.05)',
  surfaceGlass: palette.glass.fill,
  surfaceGlassStrong: palette.glass.fillStrong,

  primary: palette.coral[500], // #F08A6A
  primaryHover: palette.coral[400],
  primaryPressed: palette.coral[600],
  primarySubtle: 'rgba(240, 138, 106, 0.16)',
  accentMint: palette.mint[300], // #C3EBC5
  accentSage: palette.sage[500], // #8CC9A8
  accentTeal: palette.teal[400], // #49B0A1
  accentPeach: palette.peach[300], // #F0B79F
  accentPeachLight: palette.peach[200], // #FCBFA4
  accentSaffron: palette.saffron[400], // #F2B65A

  text: '#F3F7F4', // text on dark
  textSecondary: '#9DB3AA', // muted text on dark
  textMuted: '#678278', // subtle placeholder
  textInverse: palette.forest[900], // #0E1A17
  textOnPrimary: palette.white,
  textOnMint: palette.forest[900], // #0E1A17

  border: 'rgba(255, 255, 255, 0.10)',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderGlass: palette.glass.border,
  borderGlassSubtle: palette.glass.borderSubtle,
  borderFocus: palette.sage[500],

  inputBackground: 'rgba(255, 255, 255, 0.07)',
  inputBorder: 'rgba(255, 255, 255, 0.14)',
  chipBackground: 'rgba(255, 255, 255, 0.07)',
  chipBorder: 'rgba(255, 255, 255, 0.12)',
  chipSelectedBackground: palette.coral[500],
  chipSelectedBorder: palette.coral[500],

  badgeBackground: 'rgba(255, 255, 255, 0.12)',
  badgeText: '#F3F7F4',
  favoriteActive: palette.crimson[400],
  favoriteInactive: '#9DB3AA',
  favoriteBackground: 'rgba(255, 255, 255, 0.12)',
  deleteButton: palette.crimson[400],
  deleteButtonBg: 'rgba(248, 113, 113, 0.12)',
  deleteButtonBorder: 'rgba(248, 113, 113, 0.25)',
  editButton: palette.teal[400],
  editButtonBg: 'rgba(73, 176, 161, 0.12)',
  editButtonBorder: 'rgba(73, 176, 161, 0.25)',

  success: palette.teal[400],
  successBg: 'rgba(73, 176, 161, 0.15)',
  successBorder: 'rgba(73, 176, 161, 0.3)',
  warning: palette.saffron[400],
  warningBg: 'rgba(242, 182, 90, 0.15)',
  warningBorder: 'rgba(242, 182, 90, 0.3)',
  error: palette.crimson[400],
  errorBg: 'rgba(248, 113, 113, 0.15)',
  errorBorder: 'rgba(248, 113, 113, 0.3)',
};

export const lightColors: ThemeColors = {
  background: palette.gray[50],
  backgroundSecondary: palette.white,
  backgroundElevated: palette.white,
  surface: palette.white,
  surfaceElevated: palette.gray[100],
  surfaceSubtle: palette.gray[100],
  surfaceGlass: 'rgba(255, 255, 255, 0.85)',
  surfaceGlassStrong: 'rgba(255, 255, 255, 0.95)',

  primary: palette.coral[500],
  primaryHover: palette.coral[600],
  primaryPressed: palette.coral[700],
  primarySubtle: palette.peach[100],
  accentMint: palette.mint[300],
  accentSage: palette.sage[500],
  accentTeal: palette.teal[400],
  accentPeach: palette.peach[300],
  accentPeachLight: palette.peach[200],
  accentSaffron: palette.saffron[400],

  text: palette.forest[900],
  textSecondary: palette.gray[600],
  textMuted: palette.gray[400],
  textInverse: '#F3F7F4',
  textOnPrimary: palette.white,
  textOnMint: palette.forest[900],

  border: palette.gray[200],
  borderSubtle: palette.gray[100],
  borderGlass: 'rgba(255, 255, 255, 0.5)',
  borderGlassSubtle: 'rgba(255, 255, 255, 0.2)',
  borderFocus: palette.coral[500],

  inputBackground: palette.gray[100],
  inputBorder: palette.gray[200],
  chipBackground: palette.gray[100],
  chipBorder: palette.gray[200],
  chipSelectedBackground: palette.coral[500],
  chipSelectedBorder: palette.coral[500],

  badgeBackground: palette.gray[100],
  badgeText: palette.gray[600],
  favoriteActive: palette.crimson[500],
  favoriteInactive: palette.gray[400],
  favoriteBackground: 'rgba(255, 255, 255, 0.92)',
  deleteButton: palette.crimson[600],
  deleteButtonBg: palette.crimson[50],
  deleteButtonBorder: palette.crimson[200],
  editButton: palette.blue[600],
  editButtonBg: '#EFF6FF',
  editButtonBorder: '#BFDBFE',

  success: palette.emerald[500],
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',
  warning: palette.amber[500],
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',
  error: palette.crimson[500],
  errorBg: palette.crimson[50],
  errorBorder: palette.crimson[200],
};

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
  palette: typeof palette;
}

export const darkTheme: Theme = {
  isDark: true,
  colors: darkColors,
  spacing,
  radii,
  typography,
  shadows,
  palette,
};

export const lightTheme: Theme = {
  isDark: false,
  colors: lightColors,
  spacing,
  radii,
  typography,
  shadows,
  palette,
};
