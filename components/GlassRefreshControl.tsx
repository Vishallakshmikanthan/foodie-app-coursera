import React, { useEffect } from 'react';
import { RefreshControl, RefreshControlProps, Platform, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';
import { palette } from '../theme/tokens';
import { haptics } from '../utils/haptics';
import { useReducedMotion } from '../utils/motion';

export interface GlassRefreshControlProps extends Omit<RefreshControlProps, 'onRefresh'> {
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
  tintColor?: string;
  colors?: string[];
}

/**
 * GlassRefreshControl (M6 Motion & Haptics)
 * Enhances standard RefreshControl with:
 * - Branded palette colors (mint, coral, teal)
 * - Tactile haptic notification on pull release
 * - Clean platform fallback
 */
export const GlassRefreshControl: React.FC<GlassRefreshControlProps> = ({
  refreshing,
  onRefresh,
  tintColor = palette.mint[300],
  colors = [palette.mint[300], palette.coral[500], palette.teal[400]],
  ...props
}) => {
  const handleRefresh = async () => {
    // Fire subtle tactile confirmation upon pull release
    haptics.refresh();
    await onRefresh();
  };

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={tintColor}
      colors={colors}
      progressBackgroundColor={palette.forest[800]}
      titleColor={palette.mint[300]}
      {...props}
    />
  );
};

/**
 * GlassSpinner (M6 Branded Indicator)
 * A glass-styled rotating & pulsing loading spinner with Reanimated.
 */
export const GlassSpinner: React.FC<{ size?: number; color?: string }> = ({
  size = 28,
  color = palette.mint[300],
}) => {
  const isReducedMotion = useReducedMotion();
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!isReducedMotion) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1,
        false
      );
      pulse.value = withRepeat(
        withTiming(1.15, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [isReducedMotion, rotation, pulse]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: isReducedMotion ? 1 : pulse.value },
      ],
    };
  });

  return (
    <View style={[styles.spinnerContainer, { width: size, height: size }]}>
      <Animated.View style={animatedStyle}>
        <Sparkles size={size} color={color} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GlassRefreshControl;
