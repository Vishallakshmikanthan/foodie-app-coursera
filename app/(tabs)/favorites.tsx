import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Plus } from 'lucide-react-native';
import { GlassIconButton } from '../../components/ui';
import { useRecipes } from '../../context/RecipeContext';
import { RecipeCard } from '../../components/RecipeCard';
import { FeedSkeletonList } from '../../components/CardSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { useAppRouter } from '../../utils/navigation';
import { useTheme } from '../../theme/ThemeProvider';
import { palette, typography } from '../../theme/tokens';

export default function FavoritesScreen() {
  const router = useAppRouter();
  const { colors, isDark } = useTheme();
  const { favoriteRecipes, toggleFavorite, isLoading } = useRecipes();

  const showBackButton = router.canGoBack();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.borderSubtle,
            },
          ]}
        >
          {showBackButton && (
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={[
                styles.backButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : palette.gray[100],
                  borderColor: colors.borderSubtle,
                },
              ]}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
          )}

          <View style={[styles.headerTitleContainer, !showBackButton && { paddingLeft: 4 }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Favorites</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {favoriteRecipes.length} saved {favoriteRecipes.length === 1 ? 'recipe' : 'recipes'}
            </Text>
          </View>

          <GlassIconButton
            icon={Plus}
            size={38}
            iconSize={18}
            variant="peach"
            onPress={() => router.push('/add-recipe')}
            accessibilityLabel="Add New Recipe"
            accessibilityHint="Create your own custom recipe"
          />
        </View>

        {/* Favorite Recipes List */}
        {isLoading ? (
          <FeedSkeletonList count={3} />
        ) : (
          <FlatList
            data={favoriteRecipes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RecipeCard recipe={item} onToggleFavorite={toggleFavorite} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                icon={
                  <Heart
                    size={36}
                    color={colors.favoriteActive}
                    fill={isDark ? 'rgba(248, 113, 113, 0.2)' : palette.crimson[100]}
                  />
                }
                title="No favorite recipes yet"
                description="Explore mouthwatering recipes from our collection and tap the heart icon on any card to save your favorites here!"
                actionText="Explore Recipes"
                onAction={() => router.push('/explore')}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: typography.families.bold,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: typography.families.medium,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
});
