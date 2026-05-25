import { View, StyleSheet, Animated, type ViewStyle } from 'react-native';
import { useEffect, useRef } from 'react';
import { colors } from '@/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: width as ViewStyle['width'],
          height: height as ViewStyle['height'],
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width="60%" height={18} borderRadius={6} />
      <View style={styles.spacer} />
      <Skeleton width="40%" height={14} borderRadius={6} />
      <View style={styles.spacer} />
      <View style={styles.row}>
        <Skeleton width="30%" height={32} borderRadius={8} />
        <Skeleton width="30%" height={32} borderRadius={8} />
        <Skeleton width="30%" height={32} borderRadius={8} />
      </View>
    </View>
  );
}

export function SkeletonDashboard() {
  return (
    <View style={styles.dashboard}>
      {/* Header stats */}
      <View style={styles.headerRow}>
        <Skeleton width="48%" height={80} borderRadius={16} />
        <Skeleton width="48%" height={80} borderRadius={16} />
      </View>
      {/* Section title */}
      <Skeleton width="40%" height={20} borderRadius={6} style={{ marginTop: 24, marginBottom: 12 }} />
      {/* Loan cards */}
      <SkeletonCard />
      <View style={styles.spacer} />
      <SkeletonCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[100],
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral[200],
    opacity: 0.5,
    width: '100%',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  spacer: {
    height: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dashboard: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
