import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Compass, Heart, UtensilsCrossed } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { GlassBar } from './ui/GlassBar';
import { useRecipes } from '../context/RecipeContext';
import { useTheme } from '../theme/ThemeProvider';
import { palette, typography } from '../theme/tokens';
import { useAppRouter, useAppPathname } from '../utils/navigation';

export interface FloatingTabBarProps extends Partial<BottomTabBarProps> {
  visible?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

interface TabConfig {
  name: string;
  route: string;
  label: string;
  renderIcon: (active: boolean, color: string) => React.ReactNode;
  hasBadge?: boolean;
}

const CIRCLE_SIZE = 48;
const BAR_HEIGHT = 64;

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  state,
  navigation,
  descriptors,
  visible = true,
  containerStyle,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { favoriteRecipes } = useRecipes();
  const pathname = useAppPathname();
  const router = useAppRouter();

  const [barWidth, setBarWidth] = useState<number>(0);

  const activeIconColor = isDark ? palette.mint[300] : palette.forest[900];
  const inactiveIconColor = isDark ? 'rgba(243, 247, 244, 0.55)' : palette.forest[600];
  const heartActiveColor = isDark ? palette.peach[300] : colors.favoriteActive;

  const tabs: TabConfig[] = useMemo(
    () => [
      {
        name: 'index',
        route: '/',
        label: 'Home',
        renderIcon: (active, color) => (
          <Home size={22} color={color} strokeWidth={active ? 2.5 : 2} />
        ),
      },
      {
        name: 'explore',
        route: '/explore',
        label: 'Explore',
        renderIcon: (active, color) => (
          <Compass size={22} color={color} strokeWidth={active ? 2.5 : 2} />
        ),
      },
      {
        name: 'favorites',
        route: '/favorites',
        label: 'Favorites',
        hasBadge: true,
        renderIcon: (active, color) => (
          <Heart
            size={22}
            color={active ? heartActiveColor : color}
            fill={active ? heartActiveColor : palette.transparent}
            strokeWidth={active ? 2.5 : 2}
          />
        ),
      },
      {
        name: 'my-food',
        route: '/my-food',
        label: 'My Food',
        renderIcon: (active, color) => (
          <UtensilsCrossed size={22} color={color} strokeWidth={active ? 2.5 : 2} />
        ),
      },
    ],
    [heartActiveColor]
  );

  // Compute active tab index
  const activeIndex = useMemo(() => {
    if (state && typeof state.index === 'number') {
      // Find the tab whose route name matches state.routes[state.index].name
      const currentRouteName = state.routes[state.index]?.name;
      const foundIdx = tabs.findIndex((t) => t.name === currentRouteName);
      if (foundIdx !== -1) return foundIdx;
      return state.index;
    }

    // Fallback for standalone / Snack navigation
    if (pathname === '/' || pathname === '/index') return 0;
    if (pathname.startsWith('/explore')) return 1;
    if (pathname.startsWith('/favorites')) return 2;
    if (pathname.startsWith('/my-food')) return 3;
    return 0;
  }, [state, pathname, tabs]);

  // Animated sliding indicator
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const visibilityAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateYAnim = useRef(new Animated.Value(visible ? 0 : 80)).current;
  const isInitialized = useRef<boolean>(false);

  const useNative = Platform.OS !== 'web';

  // Handle visibility changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(visibilityAnim, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: useNative,
      }),
      Animated.spring(translateYAnim, {
        toValue: visible ? 0 : 80,
        tension: 65,
        friction: 10,
        useNativeDriver: useNative,
      }),
    ]).start();
  }, [visible, visibilityAnim, translateYAnim, useNative]);

  // Update sliding indicator position
  useEffect(() => {
    if (barWidth <= 0) return;

    const tabWidth = barWidth / tabs.length;
    const targetX = activeIndex * tabWidth + (tabWidth - CIRCLE_SIZE) / 2;

    if (!isInitialized.current) {
      translateX.setValue(targetX);
      isInitialized.current = true;
    } else {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: targetX,
          tension: 68,
          friction: 10,
          useNativeDriver: useNative,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.92,
            duration: 80,
            useNativeDriver: useNative,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 70,
            friction: 8,
            useNativeDriver: useNative,
          }),
        ]),
      ]).start();
    }
  }, [activeIndex, barWidth, tabs.length, translateX, scaleAnim, useNative]);

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const width = e.nativeEvent.layout.width;
      if (width > 0 && width !== barWidth) {
        setBarWidth(width);
        const tabWidth = width / tabs.length;
        const targetX = activeIndex * tabWidth + (tabWidth - CIRCLE_SIZE) / 2;
        translateX.setValue(targetX);
        isInitialized.current = true;
      }
    },
    [barWidth, activeIndex, tabs.length, translateX]
  );

  const triggerHaptic = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // Graceful fallback
    }
  };

  const handleTabPress = (tab: TabConfig, index: number) => {
    triggerHaptic();

    if (navigation && state) {
      const route = state.routes.find((r) => r.name === tab.name) || state.routes[index];
      if (route) {
        const isFocused = state.index === index;
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params);
        }
        return;
      }
    }

    // Standalone / Snack navigation
    if (pathname !== tab.route) {
      router.push(tab.route as any);
    }
  };

  // Safe bottom inset spacing
  const bottomPosition = Math.max(insets.bottom, 10) + 6;

  return (
    <Animated.View
      {...(Platform.OS !== 'web' ? { pointerEvents: 'box-none' as const } : {})}
      style={[
        styles.wrapper,
        {
          bottom: bottomPosition,
          opacity: visibilityAnim,
          transform: [{ translateY: translateYAnim }],
          pointerEvents: 'box-none' as const,
        },
        containerStyle,
      ]}
    >
      <GlassBar
        variant="floating"
        intensity={Platform.OS === 'ios' ? 45 : 35}
        borderRadius={34}
        borderWidth={1.2}
        style={styles.glassBar}
        contentContainerStyle={styles.barContent}
        onLayout={handleLayout}
      >
        {/* Animated Active Glass Circle Indicator */}
        {barWidth > 0 && (
          <Animated.View
            {...(Platform.OS !== 'web' ? { pointerEvents: 'none' as const } : {})}
            style={[
              styles.activeCircleIndicator,
              {
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                borderRadius: CIRCLE_SIZE / 2,
                transform: [{ translateX }, { scale: scaleAnim }],
                pointerEvents: 'none' as const,
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.16)'
                  : 'rgba(27, 43, 47, 0.10)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.32)'
                  : 'rgba(27, 43, 47, 0.22)',
                shadowColor: isDark ? palette.mint[300] : palette.forest[900],
              },
            ]}
          />
        )}

        {/* 4 Tab Buttons */}
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          const iconColor = isActive ? activeIconColor : inactiveIconColor;

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => handleTabPress(tab, index)}
              activeOpacity={0.75}
              style={styles.tabButton}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <View style={styles.iconWrapper}>
                {tab.renderIcon(isActive, iconColor)}

                {/* Badge for Favorites */}
                {tab.hasBadge && favoriteRecipes.length > 0 && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: colors.primary,
                        borderColor: isDark ? palette.forest[900] : palette.white,
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {favoriteRecipes.length > 99 ? '99+' : favoriteRecipes.length}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </GlassBar>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  glassBar: {
    width: '100%',
    maxWidth: 380,
    height: BAR_HEIGHT,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  barContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    height: '100%',
    width: '100%',
  },
  activeCircleIndicator: {
    position: 'absolute',
    top: (BAR_HEIGHT - 12 - CIRCLE_SIZE) / 2,
    borderWidth: 1.2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: palette.white,
    fontSize: 9.5,
    fontFamily: typography.families.bold,
    textAlign: 'center',
    lineHeight: 12,
  },
});

export default FloatingTabBar;
