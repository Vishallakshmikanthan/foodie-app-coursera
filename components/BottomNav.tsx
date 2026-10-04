import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Heart, UtensilsCrossed, PlusCircle } from 'lucide-react-native';
import { useRecipes } from '../context/RecipeContext';
import { useAppRouter, useAppPathname } from '../utils/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { palette, typography } from '../theme/tokens';

export const BottomNav: React.FC = () => {
  const pathname = useAppPathname();
  const router = useAppRouter();
  const { favoriteRecipes } = useRecipes();
  const { colors, isDark } = useTheme();

  const activeColor = colors.primary; // palette.coral[500]
  const inactiveColor = isDark ? colors.textMuted : palette.gray[400];
  const heartActiveColor = colors.favoriteActive;

  const navItems = [
    {
      key: 'home',
      label: 'Home',
      route: '/',
      icon: (active: boolean) => (
        <Home size={22} color={active ? activeColor : inactiveColor} strokeWidth={active ? 2.5 : 2} />
      ),
    },
    {
      key: 'favorites',
      label: 'Favorites',
      route: '/favorites',
      badge: favoriteRecipes.length > 0 ? favoriteRecipes.length : undefined,
      icon: (active: boolean) => (
        <Heart
          size={22}
          color={active ? heartActiveColor : inactiveColor}
          fill={active ? heartActiveColor : palette.transparent}
          strokeWidth={active ? 2.5 : 2}
        />
      ),
    },
    {
      key: 'add',
      label: 'Add Recipe',
      route: '/add-recipe',
      isCenter: true,
      icon: (_active: boolean) => <PlusCircle size={28} color={palette.white} strokeWidth={2.2} />,
    },
    {
      key: 'my-food',
      label: 'My Food',
      route: '/my-food',
      icon: (active: boolean) => (
        <UtensilsCrossed
          size={22}
          color={active ? activeColor : inactiveColor}
          strokeWidth={active ? 2.5 : 2}
        />
      ),
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? palette.forest[950] : palette.white,
          borderTopColor: colors.border,
        },
      ]}
    >
      {navItems.map((item) => {
        const isActive =
          item.route === '/'
            ? pathname === '/' || pathname === '/index'
            : pathname.startsWith(item.route);

        if (item.isCenter) {
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
              style={styles.centerButton}
              accessibilityRole="button"
              accessibilityLabel="Add New Recipe"
            >
              <View
                style={[
                  styles.centerButtonInner,
                  { backgroundColor: activeColor, shadowColor: activeColor },
                ]}
              >
                {item.icon(false)}
              </View>
              <Text
                style={[
                  styles.centerLabel,
                  { color: activeColor },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <View style={styles.iconContainer}>
              {item.icon(isActive)}
              {item.badge !== undefined && (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.navLabel,
                { color: isActive ? activeColor : inactiveColor },
                isActive && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: palette.white,
    fontSize: 10,
    fontFamily: typography.families.bold,
  },
  navLabel: {
    fontSize: 12,
    fontFamily: typography.families.medium,
    marginTop: 4,
  },
  navLabelActive: {
    fontFamily: typography.families.bold,
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    top: -6,
  },
  centerButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  centerLabel: {
    fontSize: 11,
    fontFamily: typography.families.semiBold,
    marginTop: 3,
  },
});
