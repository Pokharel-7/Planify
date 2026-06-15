import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '../../theme';

export function Skeleton({ width, height, style, borderRadius = radius.sm }: { width: number | `${number}%`; height: number; style?: ViewStyle; borderRadius?: number }) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: colors.borderLight, opacity }, style]}
    />
  );
}

export function TaskCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={16} style={{ marginBottom: 12 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Skeleton width={60} height={12} />
        <Skeleton width={26} height={26} borderRadius={13} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    marginBottom: 8,
  },
});
