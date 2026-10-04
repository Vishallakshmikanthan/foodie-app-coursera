import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { palette } from '../theme/tokens';
import { haptics } from '../utils/haptics';
import { useReducedMotion, motionTokens } from '../utils/motion';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
  activeColor?: string;
  inactiveColor?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onPress,
  size = 20,
  style,
  activeColor,
  inactiveColor,
}) => {
  const { colors, isDark } = useTheme();
  const isReducedMotion = useReducedMotion();

  // Reanimated scale for heart spring pop
  const scale = useSharedValue(1);

  const animatedHeartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = (e?: any) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }

    // Trigger haptic feedback
    haptics.favorite();

    // Trigger spring-pop animation if reduce motion is off
    if (!isReducedMotion && Platform.OS !== 'web') {
      scale.value = withSequence(
        withSpring(1.35, motionTokens.spring.bouncy),
        withSpring(1, motionTokens.spring.snappy)
      );
    }

    onPress();
  };

  const heartActiveColor = activeColor || colors.favoriteActive;
  const heartInactiveColor = inactiveColor || (isDark ? colors.textSecondary : palette.gray[400]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.button,
        isDark ? styles.buttonDark : styles.buttonLight,
        isFavorite && (isDark ? styles.buttonActiveDark : styles.buttonActiveLight),
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Animated.View style={animatedHeartStyle}>
        <Heart
          size={size}
          color={isFavorite ? heartActiveColor : heartInactiveColor}
          fill={isFavorite ? heartActiveColor : palette.transparent}
          strokeWidth={2}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDark: {
    backgroundColor: 'rgba(14, 26, 23, 0.72)',
    borderColor: palette.glass.borderSubtle,
  },
  buttonLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  buttonActiveDark: {
    backgroundColor: 'rgba(248, 113, 113, 0.22)',
    borderColor: 'rgba(248, 113, 113, 0.45)',
  },
  buttonActiveLight: {
    backgroundColor: palette.crimson[50],
    borderColor: palette.crimson[200],
  },
});

export default FavoriteButton;
