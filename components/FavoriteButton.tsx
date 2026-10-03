import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Heart } from 'lucide-react-native';

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
  size = 22,
  style,
  activeColor = '#E53935',
  inactiveColor = '#757575',
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={(e) => {
        // Prevent event propagation if inside a card
        e.stopPropagation?.();
        onPress();
      }}
      style={[styles.button, isFavorite && styles.buttonActive, style]}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={size}
        color={isFavorite ? activeColor : inactiveColor}
        fill={isFavorite ? activeColor : 'transparent'}
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonActive: {
    backgroundColor: '#FFF0F0',
  },
});
