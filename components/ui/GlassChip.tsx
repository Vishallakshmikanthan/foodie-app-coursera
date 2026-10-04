import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassSurface, GlassVariant } from './GlassSurface';
import { palette, typography, radii } from '../../theme/tokens';

export type GlassChipVariant =
  | 'default'
  | 'white'
  | 'mint'
  | 'peach'
  | 'coral'
  | 'subtle';

export type GlassChipSize = 'sm' | 'md' | 'lg';

export interface GlassChipProps {
  /**
   * Text label for the chip (e.g. "30 min", "Vegetarian", "★ 4.8").
   */
  label: string;
  /**
   * Optional icon component or element.
   */
  icon?: React.ComponentType<{ size?: number; color?: string }> | React.ReactNode;
  /**
   * Icon position relative to label. Default 'left'.
   */
  iconPosition?: 'left' | 'right';
  /**
   * Chip variant. Note: 'white' represents the signature opaque/frosted white pill
   * like the "30 min" hero chip in the reference yoga app.
   */
  variant?: GlassChipVariant;
  /**
   * Size preset. Defaults to 'md'.
   */
  size?: GlassChipSize;
  /**
   * Whether the chip is in a selected/active state (for filters or tabs).
   */
  selected?: boolean;
  /**
   * Callback when pressed. If provided, chip becomes interactive with touch feedback.
   */
  onPress?: () => void;
  /**
   * Custom container style.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom text style.
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * Trigger light haptics on press. Default true.
   */
  hapticFeedback?: boolean;
  /**
   * Accessibility label override.
   */
  /**
   * Accessibility label override.
   */
  accessibilityLabel?: string;
  /**
   * Skip blur effect and use solid/translucent styling.
   */
  noBlur?: boolean;
  /**
   * Optional test ID.
   */
  testID?: string;
}

export const GlassChip: React.FC<GlassChipProps> = ({
  label,
  icon,
  iconPosition = 'left',
  variant = 'default',
  size = 'md',
  selected = false,
  onPress,
  style,
  textStyle,
  hapticFeedback = true,
  accessibilityLabel,
  noBlur = false,
  testID,
}) => {
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const isInteractive = typeof onPress === 'function';

  const handlePressIn = () => {
    if (!isInteractive) return;
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (!isInteractive) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  const handlePress = () => {
    if (!isInteractive) return;
    if (hapticFeedback) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Fallback gracefully on web
      }
    }
    onPress?.();
  };

  // Determine surface variant mapping
  let surfaceVariant: GlassVariant = 'regular';
  if (selected) {
    surfaceVariant = 'coral';
  } else {
    switch (variant) {
      case 'white':
        surfaceVariant = 'white';
        break;
      case 'mint':
        surfaceVariant = 'mint';
        break;
      case 'peach':
        surfaceVariant = 'peach';
        break;
      case 'coral':
        surfaceVariant = 'coral';
        break;
      case 'subtle':
        surfaceVariant = 'subtle';
        break;
      default:
        surfaceVariant = 'regular';
    }
  }

  // Determine text & icon color based on variant and dark-contrast rules
  let contentColor: string = palette.text.onDark;
  if (selected) {
    contentColor = palette.white;
  } else if (variant === 'white') {
    // Crucial rule from spec: dark text on light/mint/white areas
    contentColor = palette.forest[900];
  } else if (variant === 'mint') {
    contentColor = palette.mint[300];
  } else if (variant === 'peach') {
    contentColor = palette.peach[200];
  } else if (variant === 'coral') {
    contentColor = palette.coral[400];
  }

  // Size configurations
  const sizeConfig = {
    sm: {
      paddingVertical: 3,
      paddingHorizontal: 8,
      fontSize: 11,
      iconSize: 12,
      gap: 4,
      borderRadius: radii.pill,
    },
    md: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      fontSize: 13,
      iconSize: 14,
      gap: 6,
      borderRadius: radii.pill,
    },
    lg: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 15,
      iconSize: 16,
      gap: 8,
      borderRadius: radii.pill,
    },
  }[size];

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as React.ComponentType<{ size?: number; color?: string }>;
    return <IconComponent size={sizeConfig.iconSize} color={contentColor} />;
  };

  const chipContent = (
    <GlassSurface
      variant={surfaceVariant}
      borderRadius={sizeConfig.borderRadius}
      noBlur={noBlur}
      style={[
        styles.surface,
        {
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: sizeConfig.borderRadius,
        },
        selected && styles.selectedSurface,
      ]}
      contentContainerStyle={[styles.contentRow, { gap: sizeConfig.gap }]}
    >
      {iconPosition === 'left' && renderIcon()}
      <Text
        style={[
          styles.text,
          {
            color: contentColor,
            fontSize: sizeConfig.fontSize,
          },
          variant === 'white' && styles.whiteVariantText,
          selected && styles.selectedText,
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {iconPosition === 'right' && renderIcon()}
    </GlassSurface>
  );

  if (isInteractive) {
    return (
      <Animated.View
        style={[{ transform: [{ scale: scaleAnim }] }, style]}
      >
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || label}
          accessibilityState={{ selected }}
          testID={testID}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          {chipContent}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={style}>{chipContent}</View>;
};

const styles = StyleSheet.create({
  surface: {
    alignSelf: 'flex-start',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: typography.families.semiBold,
    letterSpacing: -0.1,
  },
  whiteVariantText: {
    fontFamily: typography.families.bold,
    color: palette.forest[900],
  },
  selectedSurface: {
    borderWidth: 1.5,
    borderColor: palette.coral[400],
  },
  selectedText: {
    fontFamily: typography.families.bold,
    color: palette.white,
  },
});

export default GlassChip;
