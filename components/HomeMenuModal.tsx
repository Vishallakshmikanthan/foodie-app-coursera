import { Image } from 'expo-image';
import {
  ChefHat,
  ChevronRight,
  Compass,
  Heart,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  X,
  ShoppingCart,
} from 'lucide-react-native';
import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRecipes } from '../context/RecipeContext';
import { palette, typography } from '../theme/tokens';
import { useAppRouter } from '../utils/navigation';
import { GlassSurface } from './ui/GlassSurface';

export interface HomeMenuModalProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
}

export const HomeMenuModal: React.FC<HomeMenuModalProps> = ({
  visible,
  onClose,
  userName = 'Vishal',
}) => {
  const router = useAppRouter();
  const { recipes, userRecipes, favoriteRecipes, shoppingList } = useRecipes();

  const handleNavigate = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={styles.drawerContent}
          onPress={(e) => e.stopPropagation()}
        >
          <GlassSurface
            variant="prominent"
            borderRadius={28}
            borderWidth={1.2}
            intensity={Platform.OS === 'ios' ? 60 : 45}
            style={styles.glassContainer}
            contentContainerStyle={styles.innerContainer}
          >
            {/* Header with Close Button */}
            <View style={styles.topBar}>
              <View style={styles.badgeRow}>
                <ChefHat size={16} color={palette.mint[300]} />
                <Text style={styles.headerTag}>FOODIE PREMIUM</Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close menu"
              >
                <X size={18} color={palette.text.onDark} />
              </TouchableOpacity>
            </View>

            {/* User Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                  }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userName} </Text>
                <Text style={styles.profileRole}>Master Home Chef</Text>
              </View>
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{recipes.length}</Text>
                <Text style={styles.statLabel}>Recipes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{favoriteRecipes.length}</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{userRecipes.length}</Text>
                <Text style={styles.statLabel}>My Recipes</Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            {/* Navigation Links */}
            <View style={styles.linksList}>
              <TouchableOpacity
                onPress={() => handleNavigate('/explore')}
                activeOpacity={0.75}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(73, 176, 161, 0.18)' }]}>
                  <Compass size={18} color={palette.teal[400]} />
                </View>
                <Text style={styles.menuText}>Explore Recipes</Text>
                <ChevronRight size={16} color={palette.text.onDarkSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigate('/favorites')}
                activeOpacity={0.75}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(248, 113, 113, 0.18)' }]}>
                  <Heart size={18} color={palette.crimson[400]} fill={palette.crimson[400]} />
                </View>
                <Text style={styles.menuText}>Saved Favorites</Text>
                {favoriteRecipes.length > 0 && (
                  <View style={styles.itemBadge}>
                    <Text style={styles.itemBadgeText}>{favoriteRecipes.length}</Text>
                  </View>
                )}
                <ChevronRight size={16} color={palette.text.onDarkSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigate('/my-food')}
                activeOpacity={0.75}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(240, 183, 159, 0.18)' }]}>
                  <UtensilsCrossed size={18} color={palette.peach[300]} />
                </View>
                <Text style={styles.menuText}>My Food Collection</Text>
                <ChevronRight size={16} color={palette.text.onDarkSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigate('/shopping-list')}
                activeOpacity={0.75}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(195, 235, 197, 0.18)' }]}>
                  <ShoppingCart size={18} color={palette.mint[300]} />
                </View>
                <Text style={styles.menuText}>Shopping List</Text>
                {shoppingList.length > 0 && (
                  <View style={[styles.itemBadge, { backgroundColor: palette.mint[300] }]}>
                    <Text style={[styles.itemBadgeText, { color: palette.forest[900] }]}>
                      {shoppingList.filter((i) => !i.isChecked).length}
                    </Text>
                  </View>
                )}
                <ChevronRight size={16} color={palette.text.onDarkSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigate('/add-recipe')}
                activeOpacity={0.75}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(240, 138, 106, 0.18)' }]}>
                  <PlusCircle size={18} color={palette.coral[400]} />
                </View>
                <Text style={styles.menuText}>Create New Recipe</Text>
                <ChevronRight size={16} color={palette.text.onDarkSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigate('/glass-preview')}
                activeOpacity={0.75}
                style={styles.menuItem}
              >
                <View style={[styles.menuIconBg, { backgroundColor: 'rgba(195, 235, 197, 0.18)' }]}>
                  <Sparkles size={18} color={palette.mint[300]} />
                </View>
                <Text style={styles.menuText}>Glass UI Kit Preview</Text>
                <ChevronRight size={16} color={palette.text.onDarkSecondary} />
              </TouchableOpacity>
            </View>

            {/* Footer Status */}
            <View style={styles.footerNote}>
              <ShieldCheck size={14} color={palette.mint[300]} />
              <Text style={styles.footerNoteText}>
                Phase 2 Dark Atmosphere Active
              </Text>
            </View>
          </GlassSurface>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 14, 12, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  drawerContent: {
    width: '100%',
    maxWidth: 360,
  },
  glassContainer: {
    padding: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  innerContainer: {
    // Surface inner
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTag: {
    fontFamily: typography.families.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: palette.mint[300],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: palette.mint[300],
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    fontFamily: typography.families.bold,
    fontSize: 16,
    color: palette.text.onDark,
  },
  profileRole: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: palette.mint[300],
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontFamily: typography.families.bold,
    fontSize: 16,
    color: palette.white,
  },
  statLabel: {
    fontFamily: typography.families.medium,
    fontSize: 11,
    color: palette.text.onDarkSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: 12,
  },
  linksList: {
    gap: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  menuIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontFamily: typography.families.semiBold,
    fontSize: 14,
    color: palette.text.onDark,
  },
  itemBadge: {
    backgroundColor: palette.coral[500],
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  itemBadgeText: {
    color: palette.white,
    fontSize: 11,
    fontFamily: typography.families.bold,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  footerNoteText: {
    fontFamily: typography.families.medium,
    fontSize: 11.5,
    color: palette.mint[300],
  },
});

export default HomeMenuModal;
