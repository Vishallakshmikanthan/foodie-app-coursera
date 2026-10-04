import React from 'react';
import { StyleProp, ViewStyle, Platform } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useReducedMotion, getStaggerDelay } from '../utils/motion';

export interface AnimatedCardWrapperProps {
  children: React.ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
  disableAnimation?: boolean;
}

/**
 * AnimatedCardWrapper (M6 Motion & Haptics)
 * Applies a staggered fade-and-rise entry animation to list cards.
 * Automatically caps at the first 6 items (40-60ms stagger) to ensure
 * smooth 60fps performance on all devices.
 * Completely respects Reduce Motion accessibility settings.
 */
export const AnimatedCardWrapper: React.FC<AnimatedCardWrapperProps> = ({
  children,
  index = 0,
  style,
  disableAnimation = false,
}) => {
  const isReducedMotion = useReducedMotion();

  if (disableAnimation || isReducedMotion || Platform.OS === 'web') {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  const delay = getStaggerDelay(index, 50, 6);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(280).springify().damping(16)}
      style={style}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedCardWrapper;
