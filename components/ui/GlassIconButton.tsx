import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Animated,
  View,
  Text,
  GestureResponderEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassSurface, GlassVariant } from './GlassSurface';
import { palette, typography, radii } from '../../theme/tokens';

export interface GlassIconButtonProps {
  /**
   * Icon to render inside the button. Can be a component (e.g. Lucide icon) or ReactNode.
   */
  icon: React.ComponentType<{ size?: number; color?: string }> | React.ReactNode;
  /**
   * Action when pressed.
   */
  onPress?: (event: GestureResponderEvent) => void;
  /**
   * Outer button size (diameter). Default is 44 (44pt touch target).
   */
  size?: number;
  /**
   * Inner icon size. Default is 20.
   */
  iconSize?: number;
  /**
   * Icon tint color. Defaults to #F3F7F4 (or dark #0E1A17 for white variant).
   */
  iconColor?: string;
  /**
   * Glass variant. Defaults to 'regular'.
   */
  variant?: GlassVariant;
  /**
   * Optional notification / counter badge.
   */
  badgeCount?: number;
  /**
   * Optional dot indicator (e.g., unread alert).
   */
  showBadgeDot?: boolean;
  /**
   * Accessibility label for screen readers. Required for accessibility.
   */
  accessibilityLabel: string;
  /**
   * Optional accessibility hint.
   */
  accessibilityHint?: string;
  /**
   * Disabled state.
   */
  disabled?: boolean;
  /**
   * Trigger light haptic feedback on press. Default true.
   */
  hapticFeedback?: boolean;
  /**
   * Custom style for the outer container.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Blur intensity override.
   */
  intensity?: number;
  /**
   * Skip blur effect and use solid/translucent styling.
   */
  noBlur?: boolean;
  /**
   * Optional test ID.
   */
  testID?: string;
}

export const GlassIconButton: React.FC<GlassIconButtonProps> = ({
  icon,
  onPress,
  size = 44,
  iconSize = 20,
  iconColor,
  variant = 'regular',
  badgeCount,
  showBadgeDot = false,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  hapticFeedback = true,
  style,
  intensity = 40,
  noBlur = false,
  testID,
}) => {
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return;
    if (hapticFeedback) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Graceful fallback on web or unsupported devices
      }
    }
    onPress?.(e);
  };

  const defaultIconColor =
    variant === 'white'
      ? palette.forest[900]
      : variant === 'mint'
      ? palette.mint[300]
      : variant === 'peach'
      ? palette.peach[200]
      : variant === 'coral'
      ? palette.coral[400]
      : palette.text.onDark;

  const finalIconColor = iconColor || defaultIconColor;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as React.ComponentType<{ size?: number; color?: string }>;
    return <IconComponent size={iconSize} color={finalIconColor} />;
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        testID={testID}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        style={styles.pressable}
      >
        <GlassSurface
          variant={variant}
          intensity={intensity}
          borderRadius={size / 2}
          noBlur={noBlur}
          style={[
            styles.surface,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
          contentContainerStyle={styles.centerContent}
        >
          {renderIcon()}
        </GlassSurface>

        {/* Optional Badge Count or Dot */}
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : badgeCount}
            </Text>
          </View>
        )}

        {showBadgeDot && !badgeCount && (
          <View style={styles.badgeDot} />
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pressable: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surface: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  badgeContainer: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: radii.pill,
    backgroundColor: palette.coral[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: palette.forest[900],
    zIndex: 10,
  },
  badgeText: {
    color: palette.white,
    fontSize: 10,
    fontFamily: typography.families.bold,
    textAlign: 'center',
    lineHeight: 12,
  },
  badgeDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: radii.pill,
    backgroundColor: palette.coral[500],
    borderWidth: 1.5,
    borderColor: palette.forest[900],
    zIndex: 10,
  },
});

export default GlassIconButton;
