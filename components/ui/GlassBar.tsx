import React from 'react';
import {
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
  ViewProps,
} from 'react-native';
import { GlassSurface, GlassVariant } from './GlassSurface';
import { radii, shadows } from '../../theme/tokens';

export type GlassBarVariant =
  | 'regular'
  | 'subtle'
  | 'prominent'
  | 'floating'
  | 'mint'
  | 'peach';

export type GlassBarSize = 'sm' | 'md' | 'lg' | 'auto';

export interface GlassBarProps extends ViewProps {
  children?: React.ReactNode;
  variant?: GlassBarVariant;
  size?: GlassBarSize;
  borderRadius?: number;
  borderWidth?: number;
  intensity?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  hasShadow?: boolean;
  noBlur?: boolean;
  testID?: string;
}

export const GlassBar: React.FC<GlassBarProps> = ({
  children,
  variant = 'regular',
  size = 'md',
  borderRadius = radii.pill,
  borderWidth = 1,
  intensity = 45,
  paddingHorizontal,
  paddingVertical,
  style,
  contentContainerStyle,
  hasShadow = true,
  noBlur = false,
  testID,
  ...rest
}) => {
  const isFloating = variant === 'floating';
  const surfaceVariant: GlassVariant = isFloating ? 'prominent' : variant;

  const sizeStyles: ViewStyle = {
    sm: {
      minHeight: 40,
      paddingVertical: paddingVertical ?? 6,
      paddingHorizontal: paddingHorizontal ?? 12,
    },
    md: {
      minHeight: 52,
      paddingVertical: paddingVertical ?? 8,
      paddingHorizontal: paddingHorizontal ?? 16,
    },
    lg: {
      minHeight: 64,
      paddingVertical: paddingVertical ?? 10,
      paddingHorizontal: paddingHorizontal ?? 20,
    },
    auto: {
      paddingVertical: paddingVertical ?? 8,
      paddingHorizontal: paddingHorizontal ?? 16,
    },
  }[size];

  const floatingStyles: ViewStyle = isFloating
    ? {
        ...shadows.glass,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: Platform.OS === 'android' ? 0 : 8,
      }
    : {};

  return (
    <GlassSurface
      variant={surfaceVariant}
      intensity={intensity}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      noBlur={noBlur}
      hasShadow={hasShadow && !isFloating}
      style={[
        styles.bar,
        sizeStyles,
        floatingStyles,
        style,
      ]}
      contentContainerStyle={[
        styles.contentRow,
        contentContainerStyle,
      ]}
      testID={testID}
      {...rest}
    >
      {children}
    </GlassSurface>
  );
};

const styles = StyleSheet.create({
  bar: {
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default GlassBar;
