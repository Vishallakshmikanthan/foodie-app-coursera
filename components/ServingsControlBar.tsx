import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Minus, Plus, Users } from 'lucide-react-native';
import { GlassSurface } from './ui/GlassSurface';
import { palette, typography, radii } from '../theme/tokens';
import { haptics } from '../utils/haptics';

export interface ServingsControlBarProps {
  baseServings: number;
  currentServings: number;
  multiplier: number;
  onMultiplierChange: (mult: number) => void;
  onServingsChange: (servings: number) => void;
  style?: StyleProp<ViewStyle>;
}

const PRESET_MULTIPLIERS = [1, 2, 3];

export const ServingsControlBar: React.FC<ServingsControlBarProps> = ({
  baseServings,
  currentServings,
  multiplier,
  onMultiplierChange,
  onServingsChange,
  style,
}) => {
  const triggerHaptic = () => {
    haptics.servingsChange();
  };

  const handlePresetPress = (preset: number) => {
    triggerHaptic();
    onMultiplierChange(preset);
  };

  const handleDecrement = () => {
    if (currentServings > 1) {
      triggerHaptic();
      onServingsChange(currentServings - 1);
    }
  };

  const handleIncrement = () => {
    if (currentServings < 24) {
      triggerHaptic();
      onServingsChange(currentServings + 1);
    }
  };

  // Determine if multiplier matches a preset
  const activePreset = PRESET_MULTIPLIERS.find((p) => Math.abs(p - multiplier) < 0.05);

  return (
    <GlassSurface
      variant="prominent"
      intensity={45}
      borderRadius={radii.xl}
      borderWidth={1}
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Left: Quick Multipliers */}
      <View style={styles.presetsRow}>
        <Text style={styles.sectionLabel}>SCALE</Text>
        {PRESET_MULTIPLIERS.map((preset) => {
          const isSelected = activePreset === preset;
          return (
            <TouchableOpacity
              key={preset}
              activeOpacity={0.7}
              onPress={() => handlePresetPress(preset)}
              style={[
                styles.presetPill,
                isSelected && styles.presetPillActive,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Scale recipe to ${preset} times`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.presetText,
                  isSelected && styles.presetTextActive,
                ]}
              >
                {preset}x
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Vertical divider */}
      <View style={styles.divider} />

      {/* Right: Exact Servings Stepper */}
      <View style={styles.stepperContainer}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={currentServings <= 1}
          activeOpacity={0.7}
          style={[
            styles.stepBtn,
            currentServings <= 1 && styles.stepBtnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Decrease servings"
        >
          <Minus size={15} color={currentServings <= 1 ? palette.gray[500] : palette.white} />
        </TouchableOpacity>

        <View style={styles.servingsInfo}>
          <Users size={14} color={palette.mint[300]} style={styles.userIcon} />
          <Text style={styles.servingsCount}>{currentServings}</Text>
          <Text style={styles.servingsUnit}>
            {currentServings === 1 ? 'serving' : 'servings'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={currentServings >= 24}
          activeOpacity={0.7}
          style={[
            styles.stepBtn,
            currentServings >= 24 && styles.stepBtnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Increase servings"
        >
          <Plus size={15} color={currentServings >= 24 ? palette.gray[500] : palette.white} />
        </TouchableOpacity>
      </View>
    </GlassSurface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabel: {
    fontFamily: typography.families.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: palette.gray[400],
    marginRight: 2,
  },
  presetPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetPillActive: {
    backgroundColor: palette.mint[300],
    borderColor: palette.mint[300],
    shadowColor: palette.mint[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  presetText: {
    fontFamily: typography.families.bold,
    fontSize: 13,
    color: palette.white,
  },
  presetTextActive: {
    color: palette.forest[900],
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 8,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'transparent',
  },
  servingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 4,
  },
  userIcon: {
    marginRight: 2,
  },
  servingsCount: {
    fontFamily: typography.families.extraBold,
    fontSize: 15,
    color: palette.white,
  },
  servingsUnit: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.gray[300],
  },
});
