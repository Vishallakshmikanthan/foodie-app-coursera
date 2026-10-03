import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Heart, UtensilsCrossed, PlusCircle } from 'lucide-react-native';
import { useRecipes } from '../context/RecipeContext';
import { useAppRouter, useAppPathname } from '../utils/navigation';

export const BottomNav: React.FC = () => {
  const pathname = useAppPathname();
  const router = useAppRouter();
  const { favoriteRecipes } = useRecipes();

  const navItems = [
    {
      key: 'home',
      label: 'Home',
      route: '/',
      icon: (active: boolean) => (
        <Home size={22} color={active ? '#FF6B35' : '#9CA3AF'} strokeWidth={active ? 2.5 : 2} />
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
          color={active ? '#E53935' : '#9CA3AF'}
          fill={active ? '#E53935' : 'transparent'}
          strokeWidth={active ? 2.5 : 2}
        />
      ),
    },
    {
      key: 'add',
      label: 'Add Recipe',
      route: '/add-recipe',
      isCenter: true,
      icon: (_active: boolean) => <PlusCircle size={28} color="#FFFFFF" strokeWidth={2.2} />,
    },
    {
      key: 'my-food',
      label: 'My Food',
      route: '/my-food',
      icon: (active: boolean) => (
        <UtensilsCrossed
          size={22}
          color={active ? '#FF6B35' : '#9CA3AF'}
          strokeWidth={active ? 2.5 : 2}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
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
              <View style={styles.centerButtonInner}>{item.icon(false)}</View>
              <Text style={styles.centerLabel}>{item.label}</Text>
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
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
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
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#FF6B35',
    fontWeight: '700',
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    top: -6,
  },
  centerButtonInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B35',
    marginTop: 3,
  },
});
