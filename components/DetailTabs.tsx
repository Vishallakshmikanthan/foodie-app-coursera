import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { palette, typography } from '../theme/tokens';

export type DetailTabType = 'ingredients' | 'steps' | 'nutrition';

export interface DetailTabsProps {
  activeTab: DetailTabType;
  onTabChange: (tab: DetailTabType) => void;
  ingredientCount?: number;
  stepCount?: number;
}

interface TabDef {
  key: DetailTabType;
  label: string;
  badge?: number;
}

export const DetailTabs: React.FC<DetailTabsProps> = ({
  activeTab,
  onTabChange,
  ingredientCount,
  stepCount,
}) => {
  const tabs: TabDef[] = [
    { key: 'ingredients', label: 'Ingredients', badge: ingredientCount },
    { key: 'steps', label: 'Steps', badge: stepCount },
    { key: 'nutrition', label: 'Nutrition' },
  ];

  const layoutsRef = useRef<Record<string, { x: number; width: number }>>({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const isInitialized = useRef<boolean>(false);

  const useNative = Platform.OS !== 'web';

  const animateIndicator = useCallback(
    (targetLayout: { x: number; width: number }, immediate = false) => {
      if (immediate || !isInitialized.current) {
        indicatorX.setValue(targetLayout.x);
        indicatorWidth.setValue(targetLayout.width);
        isInitialized.current = true;
      } else {
        Animated.parallel([
          Animated.spring(indicatorX, {
            toValue: targetLayout.x,
            tension: 80,
            friction: 10,
            useNativeDriver: useNative,
          }),
          Animated.spring(indicatorWidth, {
            toValue: targetLayout.width,
            tension: 80,
            friction: 10,
            useNativeDriver: false,
          }),
        ]).start();
      }
    },
    [indicatorX, indicatorWidth, useNative]
  );

  useEffect(() => {
    const layout = layoutsRef.current[activeTab];
    if (layout) {
      animateIndicator(layout);
    }
  }, [activeTab, animateIndicator]);

  const handleTabLayout = (key: DetailTabType, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    layoutsRef.current[key] = { x, width };

    if (key === activeTab) {
      animateIndicator({ x, width }, !isInitialized.current);
    }
  };

  const handleTabPress = (tabKey: DetailTabType) => {
    if (tabKey !== activeTab) {
      try {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } catch {
        // Fallback
      }
      onTabChange(tabKey);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              onLayout={(e) => handleTabLayout(tab.key, e)}
              onPress={() => handleTabPress(tab.key)}
              activeOpacity={0.75}
              style={styles.tabButton}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} tab`}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
              {tab.badge !== undefined && (
                <View
                  style={[
                    styles.badge,
                    isActive ? styles.badgeActive : styles.badgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      isActive ? styles.badgeTextActive : styles.badgeTextInactive,
                    ]}
                  >
                    {tab.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Underline track */}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.indicator,
            {
              transform: [{ translateX: indicatorX }],
              width: indicatorWidth,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tabLabel: {
    fontFamily: typography.families.bold,
    fontSize: 16,
  },
  tabLabelActive: {
    color: palette.white,
  },
  tabLabelInactive: {
    color: palette.gray[400],
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    backgroundColor: palette.mint[300],
  },
  badgeInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeText: {
    fontFamily: typography.families.bold,
    fontSize: 11,
  },
  badgeTextActive: {
    color: palette.forest[900],
  },
  badgeTextInactive: {
    color: palette.gray[400],
  },
  track: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 1,
    position: 'relative',
  },
  indicator: {
    height: 3,
    backgroundColor: palette.mint[300],
    borderRadius: 2,
    position: 'absolute',
    top: -0.5,
    shadowColor: palette.mint[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});
