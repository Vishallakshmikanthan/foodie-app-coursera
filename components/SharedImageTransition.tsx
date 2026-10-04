import React from 'react';
import { StyleProp, Platform } from 'react-native';
import { Image, ImageProps, ImageStyle } from 'expo-image';
import Animated, { SharedTransition } from 'react-native-reanimated';
import { useReducedMotion } from '../utils/motion';

/**
 * Shared Image Transition Component (M6 Motion & Haptics)
 *
 * ARCHITECTURAL DESIGN & FALLBACK STRATEGY:
 * -----------------------------------------
 * 1. Native Shared Element Transition:
 *    When running on native platforms (iOS / Android), this component mounts an
 *    Animated Expo Image using Reanimated's `sharedTransitionTag`. This binds the
 *    recipe image on the list/carousel card to the full-bleed hero image on the
 *    Recipe Detail screen.
 *
 * 2. Reduced Motion Fallback:
 *    If the system setting for Reduce Motion is enabled, shared transitions are
 *    bypassed to avoid motion sickness or disorientation, falling back to an
 *    instant load.
 *
 * 3. Web & Expo Snack Fallback:
 *    On React Native Web or Snack preview environments where native shared element
 *    drivers are not linked, the component gracefully falls back to standard `expo-image`
 *    with a smooth 150ms cross-fade transition and disk/memory cache policy.
 */

// Create Animated component from Expo Image
const AnimatedExpoImage = Animated.createAnimatedComponent(Image);

// Custom smooth shared transition configuration (250ms duration)
export const customSharedTransition = new SharedTransition().duration(250);

export interface SharedImageProps extends Omit<ImageProps, 'style'> {
  recipeId: string;
  style?: StyleProp<ImageStyle>;
  disableSharedTransition?: boolean;
}

export const SharedImage: React.FC<SharedImageProps> = ({
  recipeId,
  style,
  disableSharedTransition = false,
  transition = 150,
  cachePolicy = 'memory-disk',
  contentFit = 'cover',
  placeholder = 'L5K-F@~q00%M4n_3%M?b00t7_3IU',
  ...rest
}) => {
  const isReducedMotion = useReducedMotion();
  const tag = `recipe-hero-${recipeId}`;

  // Fallback condition: Web, Reduce Motion, or explicitly disabled
  const shouldDisableSharedTransition =
    disableSharedTransition || isReducedMotion || Platform.OS === 'web';

  if (shouldDisableSharedTransition) {
    return (
      <Image
        {...rest}
        style={style}
        contentFit={contentFit}
        placeholder={placeholder}
        transition={isReducedMotion ? 0 : 150}
        cachePolicy={cachePolicy}
      />
    );
  }

  return (
    <AnimatedExpoImage
      {...rest}
      sharedTransitionTag={tag}
      sharedTransitionStyle={customSharedTransition}
      style={style as any}
      contentFit={contentFit}
      placeholder={placeholder}
      transition={150}
      cachePolicy={cachePolicy}
    />
  );
};

export default SharedImage;
