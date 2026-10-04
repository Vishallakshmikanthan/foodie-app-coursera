import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { palette, radii } from '../theme/tokens';

interface ShimmerBoxProps {
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

export const ShimmerBox: React.FC<ShimmerBoxProps> = ({
  style,
  borderRadius = 8,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.75,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.shimmerBase,
        {
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

export const ListCardSkeleton: React.FC<{ style?: StyleProp<ViewStyle> }> = ({
  style,
}) => {
  return (
    <View style={[styles.listCardContainer, style]}>
      {/* Image Skeleton Box */}
      <View style={styles.listImagePlaceholder}>
        <ShimmerBox style={styles.imageFill} borderRadius={0} />

        {/* Top Controls Placeholders */}
        <View style={styles.topRow}>
          <ShimmerBox style={styles.timeChipPlaceholder} borderRadius={14} />
          <ShimmerBox style={styles.favoritePlaceholder} borderRadius={18} />
        </View>
      </View>

      {/* Content Skeleton */}
      <View style={styles.contentContainer}>
        {/* Category & Difficulty Row */}
        <View style={styles.metaTopRow}>
          <ShimmerBox style={styles.categoryBadgePlaceholder} borderRadius={6} />
          <ShimmerBox style={styles.dotsPlaceholder} borderRadius={4} />
        </View>

        {/* Title Lines */}
        <ShimmerBox style={styles.titleLine1} borderRadius={6} />
        <ShimmerBox style={styles.titleLine2} borderRadius={6} />

        {/* Meta info row */}
        <View style={styles.metaBottomRow}>
          <ShimmerBox style={styles.metaItemPlaceholder} borderRadius={6} />
          <ShimmerBox style={styles.metaItemPlaceholder} borderRadius={6} />
          <ShimmerBox style={styles.metaItemPlaceholder} borderRadius={6} />
        </View>
      </View>
    </View>
  );
};

export const HeroCardSkeleton: React.FC<{
  cardWidth?: number;
  cardHeight?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ cardWidth = 320, cardHeight = 360, style }) => {
  return (
    <View
      style={[
        styles.heroCardContainer,
        { width: cardWidth, height: cardHeight },
        style,
      ]}
    >
      <ShimmerBox style={styles.imageFill} borderRadius={28} />

      {/* Top Controls Placeholders */}
      <View style={styles.topRow}>
        <ShimmerBox style={styles.timeChipPlaceholder} borderRadius={16} />
        <ShimmerBox style={styles.favoritePlaceholder} borderRadius={20} />
      </View>

      {/* Glass Caption Strip Placeholder */}
      <View style={styles.heroCaptionStrip}>
        <View style={{ flex: 1 }}>
          <ShimmerBox style={styles.heroStripCategory} borderRadius={4} />
          <ShimmerBox style={styles.heroStripTitle} borderRadius={6} />
        </View>
        <ShimmerBox style={styles.heroPlayButton} borderRadius={20} />
      </View>
    </View>
  );
};

export const PortraitCardSkeleton: React.FC<{
  style?: StyleProp<ViewStyle>;
}> = ({ style }) => {
  return (
    <View style={[styles.portraitCardContainer, style]}>
      {/* Top Image Box */}
      <View style={styles.portraitImageBox}>
        <ShimmerBox style={styles.imageFill} borderRadius={0} />
        <ShimmerBox style={styles.portraitChip} borderRadius={10} />
      </View>

      {/* Content */}
      <View style={styles.portraitContent}>
        <ShimmerBox style={styles.portraitTitleLine1} borderRadius={4} />
        <ShimmerBox style={styles.portraitTitleLine2} borderRadius={4} />
        <ShimmerBox style={styles.portraitSubtitle} borderRadius={4} />
      </View>
    </View>
  );
};

export const FeedSkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View style={styles.skeletonFeed}>
      {Array.from({ length: count }).map((_, idx) => (
        <ListCardSkeleton key={idx} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  shimmerBase: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  imageFill: {
    width: '100%',
    height: '100%',
  },
  listCardContainer: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: palette.forest[850],
  },
  listImagePlaceholder: {
    width: '100%',
    height: 195,
    position: 'relative',
    backgroundColor: palette.forest[900],
  },
  topRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeChipPlaceholder: {
    width: 75,
    height: 28,
  },
  favoritePlaceholder: {
    width: 36,
    height: 36,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  metaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadgePlaceholder: {
    width: 70,
    height: 18,
  },
  dotsPlaceholder: {
    width: 48,
    height: 14,
  },
  titleLine1: {
    width: '85%',
    height: 18,
    marginBottom: 6,
  },
  titleLine2: {
    width: '60%',
    height: 18,
    marginBottom: 14,
  },
  metaBottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItemPlaceholder: {
    width: 65,
    height: 14,
  },
  heroCardContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: palette.forest[800],
    position: 'relative',
  },
  heroCaptionStrip: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    height: 64,
    borderRadius: 22,
    backgroundColor: 'rgba(14, 26, 23, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroStripCategory: {
    width: 60,
    height: 10,
    marginBottom: 6,
  },
  heroStripTitle: {
    width: '75%',
    height: 16,
  },
  heroPlayButton: {
    width: 40,
    height: 40,
  },
  portraitCardContainer: {
    width: 165,
    height: 236,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: palette.forest[800],
  },
  portraitImageBox: {
    width: '100%',
    height: 124,
    position: 'relative',
    backgroundColor: palette.forest[900],
  },
  portraitChip: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 45,
    height: 20,
  },
  portraitContent: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  portraitTitleLine1: {
    width: '90%',
    height: 14,
    marginBottom: 4,
  },
  portraitTitleLine2: {
    width: '70%',
    height: 14,
    marginBottom: 8,
  },
  portraitSubtitle: {
    width: '50%',
    height: 12,
  },
  skeletonFeed: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
