import { Image } from 'expo-image';
import { Heart, Menu, Search, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { palette, typography } from '../theme/tokens';
import { GlassIconButton } from './ui/GlassIconButton';
import { GlassSurface } from './ui/GlassSurface';

export interface HomeHeaderProps {
  userName?: string;
  avatarUrl?: string;
  favoritesCount: number;
  onPressMenu: () => void;
  onPressAvatar?: () => void;
  onPressFavorites: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName = 'Vishal',
  avatarUrl,
  favoritesCount,
  onPressMenu,
  onPressAvatar,
  onPressFavorites,
  searchQuery,
  onSearchChange,
  isSearchOpen,
  onToggleSearch,
}) => {
  const searchInputRef = useRef<TextInput>(null);
  const searchHeightAnim = useRef(new Animated.Value(isSearchOpen ? 1 : 0)).current;

  // Time-aware greeting logic
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  }, []);

  // Animate search bar open/close
  useEffect(() => {
    Animated.spring(searchHeightAnim, {
      toValue: isSearchOpen ? 1 : 0,
      tension: 65,
      friction: 9,
      useNativeDriver: false,
    }).start(() => {
      if (isSearchOpen) {
        searchInputRef.current?.focus();
      }
    });
  }, [isSearchOpen, searchHeightAnim]);

  return (
    <View style={styles.container}>
      {/* Top Controls Row */}
      <View style={styles.controlsRow}>
        {/* Left: Glass Menu Button */}
        <GlassIconButton
          icon={Menu}
          size={44}
          iconSize={22}
          variant="regular"
          iconColor={palette.forest[900]}
          onPress={onPressMenu}
          accessibilityLabel="Open menu"
          accessibilityHint="Opens navigation drawer and settings"
        />

        {/* Right Controls: Search, Favorites Badge, Avatar */}
        <View style={styles.rightActions}>
          {/* Glass Search Button */}
          <GlassIconButton
            icon={isSearchOpen ? X : Search}
            size={44}
            iconSize={20}
            variant="regular"
            iconColor={palette.forest[900]}
            onPress={onToggleSearch}
            accessibilityLabel={isSearchOpen ? 'Close search' : 'Search recipes'}
          />

          {/* Glass Favorites Button with Badge */}
          <GlassIconButton
            icon={Heart}
            size={44}
            iconSize={20}
            variant="regular"
            iconColor={favoritesCount > 0 ? palette.coral[500] : palette.forest[900]}
            badgeCount={favoritesCount}
            onPress={onPressFavorites}
            accessibilityLabel="View favorite recipes"
            accessibilityHint="Navigates to saved favorites"
          />

          {/* User Chef Avatar */}
          <TouchableOpacity
            onPress={onPressAvatar || onPressMenu}
            activeOpacity={0.8}
            style={styles.avatarButton}
            accessibilityRole="button"
            accessibilityLabel={`User profile: ${userName}`}
            accessibilityHint="Navigates to chef profile and settings"
          >
            <View style={styles.avatarFrame}>
              <Image
                source={{
                  uri:
                    avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                }}
                style={styles.avatarImage}
                contentFit="cover"
                transition={200}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting & Editorial Headline */}
      <View style={styles.textContainer}>
        {/* Dark text on mint surface per spec */}
        <Text style={styles.greetingText}>
          {greeting}, {userName}
        </Text>

        <Text style={styles.headlineText}>
          <Text style={styles.leadingDash}>— </Text>
          What are you craving today?
        </Text>
      </View>

      {/* Expandable Glass Search Overlay Bar */}
      {isSearchOpen && (
        <Animated.View
          style={[
            styles.searchWrapper,
            {
              opacity: searchHeightAnim,
              transform: [
                {
                  translateY: searchHeightAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <GlassSurface
            variant="prominent"
            borderRadius={16}
            intensity={Platform.OS === 'ios' ? 45 : 35}
            style={styles.searchGlass}
            contentContainerStyle={styles.searchInner}
          >
            <Search size={18} color={palette.forest[900]} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Search recipes, ingredients, courses..."
              placeholderTextColor="rgba(14, 26, 23, 0.55)"
              style={styles.searchInput}
              clearButtonMode="never"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => onSearchChange('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.clearButton}
              >
                <X size={16} color={palette.forest[900]} />
              </TouchableOpacity>
            )}
          </GlassSurface>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(14, 26, 23, 0.25)',
    padding: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarFrame: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginTop: 2,
    marginBottom: 10,
  },
  greetingText: {
    fontFamily: typography.families.bold,
    fontSize: 12.5,
    letterSpacing: 0.6,
    color: palette.forest[900], // dark text on mint surface
    textTransform: 'uppercase',
    opacity: 0.8,
    marginBottom: 4,
  },
  headlineText: {
    fontFamily: typography.families.display,
    fontSize: 27,
    lineHeight: 33,
    color: palette.forest[900], // dark text on mint surface
    letterSpacing: -0.4,
  },
  leadingDash: {
    fontFamily: typography.families.regular,
    color: palette.forest[700],
    fontWeight: '300',
  },
  searchWrapper: {
    marginTop: 8,
    marginBottom: 6,
  },
  searchGlass: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(14, 26, 23, 0.18)',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 46,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    fontFamily: typography.families.medium,
    color: palette.forest[900],
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
});

export default HomeHeader;
