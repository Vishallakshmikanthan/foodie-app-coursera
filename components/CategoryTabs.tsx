import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { CATEGORIES } from '../data/recipes';
import { palette, typography, spacing } from '../theme/tokens';
import { haptics } from '../utils/haptics';
import { useReducedMotion } from '../utils/motion';

export interface CategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories?: readonly string[];
}

interface TabLayoutData {
  x: number;
  width: number;
}

// Omit 'My Food' from the home category tabs because My Food is a dedicated primary tab in the bottom bar
const HOME_CATEGORIES = CATEGORIES.filter((c) => c !== 'My Food');

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
  categories = HOME_CATEGORIES,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const layoutsRef = useRef<Record<string, TabLayoutData>>({});
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Animated values for underline position and width
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const isInitialized = useRef<boolean>(false);

  const isReducedMotion = useReducedMotion();
  const useNative = Platform.OS !== 'web';

  const animateIndicator = useCallback(
    (targetLayout: TabLayoutData, immediate = false) => {
      if (immediate || !isInitialized.current || isReducedMotion) {
        indicatorX.setValue(targetLayout.x);
        indicatorWidth.setValue(targetLayout.width);
        isInitialized.current = true;
      } else {
        Animated.parallel([
          Animated.spring(indicatorX, {
            toValue: targetLayout.x,
            tension: 75,
            friction: 10,
            useNativeDriver: useNative,
          }),
          Animated.spring(indicatorWidth, {
            toValue: targetLayout.width,
            tension: 75,
            friction: 10,
            useNativeDriver: false, // width animation requires layout/style
          }),
        ]).start();
      }
    },
    [indicatorX, indicatorWidth, useNative, isReducedMotion]
  );

  // Auto-scroll so the selected tab is comfortably centered
  const scrollToActiveTab = useCallback(
    (targetLayout: TabLayoutData) => {
      if (!scrollViewRef.current || containerWidth <= 0) return;
      const targetScrollX = Math.max(
        0,
        targetLayout.x - containerWidth / 2 + targetLayout.width / 2
      );
      scrollViewRef.current.scrollTo({ x: targetScrollX, animated: !isReducedMotion });
    },
    [containerWidth, isReducedMotion]
  );

  // Update underline when category changes or layout is ready
  useEffect(() => {
    const layout = layoutsRef.current[selectedCategory];
    if (layout) {
      animateIndicator(layout);
      scrollToActiveTab(layout);
    }
  }, [selectedCategory, animateIndicator, scrollToActiveTab]);

  const handleTabLayout = (category: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    layoutsRef.current[category] = { x, width };

    if (category === selectedCategory) {
      animateIndicator({ x, width }, !isInitialized.current);
      scrollToActiveTab({ x, width });
    }
  };

  const handleTabPress = (category: string) => {
    if (category !== selectedCategory) {
      haptics.tabChange();
      onSelectCategory(category);
    }
  };

  return (
    <View
      style={styles.wrapper}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Animated Sliding Underline */}
        <Animated.View
          style={[
            styles.underline,
            {
              left: indicatorX,
              width: indicatorWidth,
            },
          ]}
        />

        {/* Text Category Tabs */}
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              onPress={() => handleTabPress(category)}
              onLayout={(e) => handleTabLayout(category, e)}
              activeOpacity={0.75}
              style={styles.tabButton}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${category} recipes`}
            >
              <Text
                style={[
                  styles.tabText,
                  isSelected ? styles.tabTextSelected : styles.tabTextUnselected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
    position: 'relative',
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 6,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 6,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  tabTextSelected: {
    fontFamily: typography.families.bold,
    color: palette.text.onDark,
  },
  tabTextUnselected: {
    fontFamily: typography.families.medium,
    color: palette.text.onDarkSecondary,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    height: 2.5,
    backgroundColor: palette.coral[400],
    borderRadius: 2,
    zIndex: 1,
  },
});

export default CategoryTabs;
