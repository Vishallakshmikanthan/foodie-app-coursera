import { palette } from './tokens';
import { DifficultyLevel } from '../types/recipe';

export interface CategoryTint {
  category: string;
  accent: string;
  badgeBg: string;
  badgeBorder: string;
  glowColor: string;
  gradientOverlay: [string, string, string];
  chipVariant: 'peach' | 'mint' | 'white' | 'default';
  blurhash: string;
}

// Category tints keyed to culinary mood
const CATEGORY_TINTS: Record<string, CategoryTint> = {
  breakfast: {
    category: 'Breakfast',
    accent: palette.peach[300],
    badgeBg: 'rgba(240, 183, 159, 0.18)',
    badgeBorder: 'rgba(240, 183, 159, 0.35)',
    glowColor: 'rgba(252, 191, 164, 0.16)',
    gradientOverlay: [
      'rgba(252, 191, 164, 0.18)', // peach-200 highlight
      'rgba(240, 183, 159, 0.08)',
      'rgba(20, 34, 37, 0.88)',
    ],
    chipVariant: 'peach',
    blurhash: 'L7IX2-~p00?b00_3%Mxu00Rj?bof',
  },
  lunch: {
    category: 'Lunch',
    accent: palette.saffron[400],
    badgeBg: 'rgba(242, 182, 90, 0.18)',
    badgeBorder: 'rgba(242, 182, 90, 0.35)',
    glowColor: 'rgba(242, 182, 90, 0.16)',
    gradientOverlay: [
      'rgba(242, 182, 90, 0.18)',
      'rgba(242, 182, 90, 0.08)',
      'rgba(20, 34, 37, 0.88)',
    ],
    chipVariant: 'default',
    blurhash: 'L8K-F?~q00%M4n_3%M?b00t7_3IU',
  },
  dinner: {
    category: 'Dinner',
    accent: palette.coral[400],
    badgeBg: 'rgba(240, 138, 106, 0.18)',
    badgeBorder: 'rgba(240, 138, 106, 0.35)',
    glowColor: 'rgba(240, 138, 106, 0.18)',
    gradientOverlay: [
      'rgba(240, 138, 106, 0.18)',
      'rgba(240, 138, 106, 0.08)',
      'rgba(20, 34, 37, 0.88)',
    ],
    chipVariant: 'peach',
    blurhash: 'L5Jk1r~p00of00t7%M_300IU_3j[',
  },
  salads: {
    category: 'Salads',
    accent: palette.mint[300],
    badgeBg: 'rgba(195, 235, 197, 0.18)',
    badgeBorder: 'rgba(195, 235, 197, 0.35)',
    glowColor: 'rgba(195, 235, 197, 0.16)',
    gradientOverlay: [
      'rgba(195, 235, 197, 0.18)', // mint-300 highlight
      'rgba(140, 201, 168, 0.08)',
      'rgba(20, 34, 37, 0.88)',
    ],
    chipVariant: 'mint',
    blurhash: 'L6K-e7~p00xt00?b%M_300xu_3of',
  },
  desserts: {
    category: 'Desserts',
    accent: '#F472B6', // rose-400
    badgeBg: 'rgba(244, 114, 182, 0.18)',
    badgeBorder: 'rgba(244, 114, 182, 0.35)',
    glowColor: 'rgba(244, 114, 182, 0.18)',
    gradientOverlay: [
      'rgba(244, 114, 182, 0.18)', // dusty rose highlight
      'rgba(244, 114, 182, 0.08)',
      'rgba(20, 34, 37, 0.88)',
    ],
    chipVariant: 'peach',
    blurhash: 'L25q#g00~q0000_300%M00IU00?b',
  },
  soups: {
    category: 'Soups',
    accent: palette.teal[400],
    badgeBg: 'rgba(73, 176, 161, 0.18)',
    badgeBorder: 'rgba(73, 176, 161, 0.35)',
    glowColor: 'rgba(73, 176, 161, 0.16)',
    gradientOverlay: [
      'rgba(73, 176, 161, 0.18)',
      'rgba(73, 176, 161, 0.08)',
      'rgba(20, 34, 37, 0.88)',
    ],
    chipVariant: 'mint',
    blurhash: 'L6K{9e_300IU00?b%Mxt00?b~qof',
  },
  drinks: {
    category: 'Drinks',
    accent: '#38BDF8', // sky-400
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    badgeBorder: 'rgba(56, 189, 248, 0.35)',
    glowColor: 'rgba(56, 189, 248, 0.16)',
    gradientOverlay: [
      'rgba(56, 189, 248, 0.18)',
      'rgba(73, 176, 161, 0.08)',
      'rgba(20, 34, 37, 0.88)',
    ],
    chipVariant: 'mint',
    blurhash: 'L9K-i{_300IU00?b%Mxt00?b~qof',
  },
  snacks: {
    category: 'Snacks',
    accent: '#F59E0B', // amber-500
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    badgeBorder: 'rgba(245, 158, 11, 0.35)',
    glowColor: 'rgba(245, 158, 11, 0.16)',
    gradientOverlay: [
      'rgba(245, 158, 11, 0.18)',
      'rgba(242, 182, 90, 0.08)',
      'rgba(20, 34, 37, 0.88)',
    ],
    chipVariant: 'default',
    blurhash: 'L6I4G*~p00of00t7%M_300IU_3j[',
  },
  vegetarian: {
    category: 'Vegetarian',
    accent: palette.mint[400],
    badgeBg: 'rgba(166, 220, 171, 0.18)',
    badgeBorder: 'rgba(166, 220, 171, 0.35)',
    glowColor: 'rgba(166, 220, 171, 0.16)',
    gradientOverlay: [
      'rgba(166, 220, 171, 0.18)',
      'rgba(140, 201, 168, 0.08)',
      'rgba(20, 34, 37, 0.88)',
    ],
    chipVariant: 'mint',
    blurhash: 'L7I#e|~q00?b00t7%M_300IU_3of',
  },
  'non-vegetarian': {
    category: 'Non-Vegetarian',
    accent: palette.coral[500],
    badgeBg: 'rgba(240, 138, 106, 0.18)',
    badgeBorder: 'rgba(240, 138, 106, 0.35)',
    glowColor: 'rgba(240, 138, 106, 0.16)',
    gradientOverlay: [
      'rgba(240, 138, 106, 0.18)',
      'rgba(240, 138, 106, 0.08)',
      'rgba(20, 34, 37, 0.88)',
    ],
    chipVariant: 'peach',
    blurhash: 'L9K{9e_300IU00?b%Mxt00?b~qof',
  },
  'my food': {
    category: 'My Food',
    accent: palette.peach[200],
    badgeBg: 'rgba(252, 191, 164, 0.18)',
    badgeBorder: 'rgba(252, 191, 164, 0.35)',
    glowColor: 'rgba(252, 191, 164, 0.16)',
    gradientOverlay: [
      'rgba(252, 191, 164, 0.18)',
      'rgba(240, 183, 159, 0.08)',
      'rgba(20, 34, 37, 0.88)',
    ],
    chipVariant: 'peach',
    blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
  },
};

const DEFAULT_TINT: CategoryTint = {
  category: 'Dish',
  accent: palette.sage[500],
  badgeBg: 'rgba(140, 201, 168, 0.18)',
  badgeBorder: 'rgba(140, 201, 168, 0.35)',
  glowColor: 'rgba(140, 201, 168, 0.14)',
  gradientOverlay: [
    'rgba(140, 201, 168, 0.16)',
    'rgba(140, 201, 168, 0.06)',
    'rgba(20, 34, 37, 0.88)',
  ],
  chipVariant: 'default',
  blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
};

/**
 * Get the art-directed tint configuration for any recipe category.
 */
export function getCategoryTint(category?: string): CategoryTint {
  if (!category) return DEFAULT_TINT;
  const key = category.trim().toLowerCase();
  return CATEGORY_TINTS[key] || DEFAULT_TINT;
}

export interface DifficultyDotsInfo {
  dots: string;
  activeCount: number;
  label: string;
  color: string;
}

/**
 * Renders subtle difficulty dots (●○○ Easy, ●●○ Med, ●●● Hard)
 * Replaces busy colored pill badges as requested in M4.
 */
export function getDifficultyDots(difficulty: DifficultyLevel): DifficultyDotsInfo {
  switch (difficulty) {
    case 'Easy':
      return {
        dots: '●○○',
        activeCount: 1,
        label: 'Easy',
        color: palette.mint[300],
      };
    case 'Medium':
      return {
        dots: '●●○',
        activeCount: 2,
        label: 'Medium',
        color: palette.saffron[400],
      };
    case 'Hard':
      return {
        dots: '●●●',
        activeCount: 3,
        label: 'Hard',
        color: palette.coral[400],
      };
    default:
      return {
        dots: '●○○',
        activeCount: 1,
        label: difficulty || 'Easy',
        color: palette.sage[500],
      };
  }
}
