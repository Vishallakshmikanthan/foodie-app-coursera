import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { UserProfile, DEFAULT_USER_PROFILE, DietaryPreference } from '../types/user';
import { storage } from '../utils/storage';

interface UserProfileContextType {
  profile: UserProfile;
  isLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setName: (name: string) => Promise<void>;
  setAvatar: (avatarUri: string) => Promise<void>;
  setDietaryPreference: (diet: DietaryPreference) => Promise<void>;
  setFavoriteCuisines: (cuisines: string[]) => Promise<void>;
  completeOnboarding: (data?: Partial<UserProfile>) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProfile = useCallback(async () => {
    try {
      const stored = await storage.getUserProfile();
      setProfile(stored);
    } catch (err) {
      console.warn('Failed to load user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      setProfile((prev) => {
        const next: UserProfile = { ...prev, ...updates };
        storage.saveUserProfile(next);
        return next;
      });
    },
    []
  );

  const setName = useCallback(
    async (name: string) => {
      await updateProfile({ name: name.trim() || 'Foodie Chef' });
    },
    [updateProfile]
  );

  const setAvatar = useCallback(
    async (avatarUri: string) => {
      await updateProfile({ avatar: avatarUri });
    },
    [updateProfile]
  );

  const setDietaryPreference = useCallback(
    async (diet: DietaryPreference) => {
      await updateProfile({ dietaryPreference: diet });
    },
    [updateProfile]
  );

  const setFavoriteCuisines = useCallback(
    async (cuisines: string[]) => {
      await updateProfile({ favoriteCuisines: cuisines });
    },
    [updateProfile]
  );

  const completeOnboarding = useCallback(
    async (data?: Partial<UserProfile>) => {
      await updateProfile({
        ...data,
        hasCompletedOnboarding: true,
      });
    },
    [updateProfile]
  );

  const resetOnboarding = useCallback(async () => {
    await updateProfile({ hasCompletedOnboarding: false });
  }, [updateProfile]);

  const resetAllData = useCallback(async () => {
    await storage.clearAllData();
    setProfile(DEFAULT_USER_PROFILE);
  }, []);

  const value = useMemo<UserProfileContextType>(
    () => ({
      profile,
      isLoading,
      updateProfile,
      setName,
      setAvatar,
      setDietaryPreference,
      setFavoriteCuisines,
      completeOnboarding,
      resetOnboarding,
      resetAllData,
    }),
    [
      profile,
      isLoading,
      updateProfile,
      setName,
      setAvatar,
      setDietaryPreference,
      setFavoriteCuisines,
      completeOnboarding,
      resetOnboarding,
      resetAllData,
    ]
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};

export function useUserProfile(): UserProfileContextType {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
