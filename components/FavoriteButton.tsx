import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { palette } from '../theme/tokens';

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

  const heartActiveColor = activeColor || colors.favoriteActive;
  const heartInactiveColor = inactiveColor || (isDark ? colors.textSecondary : palette.gray[400]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={(e) => {
        if (e && typeof e.stopPropagation === 'function') {
          e.stopPropagation();
        }
        onPress();
      }}
      style={[
        styles.button,
        isDark ? styles.buttonDark : styles.buttonLight,
        isFavorite && (isDark ? styles.buttonActiveDark : styles.buttonActiveLight),
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={size}
        color={isFavorite ? heartActiveColor : heartInactiveColor}
        fill={isFavorite ? heartActiveColor : palette.transparent}
        strokeWidth={2}
      />
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
