import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../../theme';

interface SnackbarProps {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
}

export function Snackbar({ visible, message, actionLabel, onAction, onDismiss }: SnackbarProps) {
  const translateY = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 80,
      duration: 220,
      useNativeDriver: true,
    }).start();

    if (visible) {
      const t = setTimeout(onDismiss, 3000);
      return () => clearTimeout(t);
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]} pointerEvents={visible ? 'auto' : 'none'}>
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    backgroundColor: colors.black,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.lg,
  },
  message: { ...typography.body, color: colors.white, flex: 1, marginRight: spacing.sm },
  action: { ...typography.bodySemibold, color: colors.primaryLight },
});
