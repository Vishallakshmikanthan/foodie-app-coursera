import { useState, useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import {
  FadeInDown,
  FadeInUp,
  FadeIn,
  FadeOut,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

/**
 * Hook to check if the user has requested reduced motion at system level.
 * When enabled, all non-essential animations (card entry transitions, spring bounces)
 * should be skipped or made instantaneous.
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // Check initial status
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => {
        // Fallback to false if unsupported
        if (isMounted) {
          setReduceMotion(false);
        }
      });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (isMounted) {
          setReduceMotion(enabled);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  return reduceMotion;
}

/**
 * Animation tokens and configurations for M6 Motion and Haptics
 */
export const motionTokens = {
  // Stagger configuration (capped at first 6 items per M6 spec to avoid UI jank)
  stagger: {
    baseDelay: 50, // 50ms per item
    maxCappedItems: 6,
    maxTotalDelay: 300,
  },
  // Durations in milliseconds
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
  },
  // Spring presets
  spring: {
    // Crisp & snappy for buttons and tabs
    snappy: {
      damping: 15,
      stiffness: 180,
      mass: 0.8,
    },
    // Bouncy for hearts and favorites
    bouncy: {
      damping: 10,
      stiffness: 160,
      mass: 0.7,
    },
    // Gentle for modals and card expands
    gentle: {
      damping: 20,
      stiffness: 120,
      mass: 1.0,
    },
  },
};

/**
 * Calculate stagger delay for list items, capped at 6 items
 */
export function getStaggerDelay(
  index: number,
  baseDelay: number = motionTokens.stagger.baseDelay,
  maxItems: number = motionTokens.stagger.maxCappedItems
): number {
  const effectiveIndex = Math.min(Math.max(0, index), maxItems - 1);
  return effectiveIndex * baseDelay;
}

/**
 * Generates a Reanimated entering animation for list cards with staggered delay.
 * Returns undefined / instant if reduceMotion is active.
 */
export function getCardEnteringAnimation(index: number = 0, isReducedMotion: boolean = false) {
  if (isReducedMotion || Platform.OS === 'web') {
    return FadeIn.duration(80);
  }

  const delay = getStaggerDelay(index);
  return FadeInDown.delay(delay).duration(280).springify().damping(16);
}

/**
 * Generates a Reanimated entering animation for detail sections
 */
export function getSectionEnteringAnimation(order: number = 0, isReducedMotion: boolean = false) {
  if (isReducedMotion || Platform.OS === 'web') {
    return FadeIn.duration(100);
  }

  const delay = Math.min(order * 60, 240);
  return FadeInUp.delay(delay).duration(260).springify().damping(18);
}
