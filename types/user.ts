export type DietaryPreference =
  | 'All'
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Keto'
  | 'Pescatarian';

export interface UserProfile {
  name: string;
  avatar: string;
  dietaryPreference: DietaryPreference;
  favoriteCuisines: string[];
  hasCompletedOnboarding: boolean;
  bio?: string;
}

export const DIETARY_OPTIONS: { id: DietaryPreference; label: string; description: string; emoji: string }[] = [
  { id: 'All', label: 'No Restrictions', description: 'Explore everything without limits', emoji: '🍽️' },
  { id: 'Vegetarian', label: 'Vegetarian', description: 'Plant-based with dairy & eggs', emoji: '🥦' },
  { id: 'Vegan', label: 'Strict Vegan', description: '100% plant-derived meals only', emoji: '🌱' },
  { id: 'Pescatarian', label: 'Pescatarian', description: 'Vegetarian plus fresh seafood', emoji: '🐟' },
  { id: 'Gluten-Free', label: 'Gluten-Free', description: 'Zero wheat, barley, or rye', emoji: '🌾' },
  { id: 'Keto', label: 'Keto Friendly', description: 'High healthy fat & very low carb', emoji: '🥑' },
];

export const CUISINE_OPTIONS: { id: string; name: string; emoji: string }[] = [
  { id: 'Italian', name: 'Italian', emoji: '🍝' },
  { id: 'Japanese', name: 'Japanese', emoji: '🍣' },
  { id: 'Mexican', name: 'Mexican', emoji: '🌮' },
  { id: 'Indian', name: 'Indian', emoji: '🍛' },
  { id: 'Mediterranean', name: 'Mediterranean', emoji: '🫒' },
  { id: 'Thai', name: 'Thai', emoji: '🍜' },
  { id: 'American', name: 'American', emoji: '🍔' },
  { id: 'French', name: 'French', emoji: '🥐' },
  { id: 'Moroccan', name: 'Moroccan', emoji: '🍲' },
  { id: 'Chinese', name: 'Chinese', emoji: '🥟' },
];

export const AVATAR_PRESETS: { id: string; label: string; uri: string }[] = [
  {
    id: 'chef-1',
    label: 'Modern Gourmet',
    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'chef-2',
    label: 'Culinary Master',
    uri: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'chef-3',
    label: 'Artisanal Baker',
    uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'chef-4',
    label: 'Spice Enthusiast',
    uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Vishal',
  avatar: AVATAR_PRESETS[0].uri,
  dietaryPreference: 'All',
  favoriteCuisines: ['Italian', 'Japanese', 'Mexican', 'Indian'],
  hasCompletedOnboarding: false,
  bio: 'Passionate home cook exploring world flavors & wholesome ingredients',
};
