import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
}

const HEIGHTS: Record<Size, number> = { sm: 40, md: 48, lg: 56 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  icon,
  iconPosition = 'left',
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant].container,
        { height: HEIGHTS[size] },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' ? <View style={styles.iconLeft}>{icon}</View> : null}
          <Text style={[styles.label, variantStyles[variant].label]}>{label}</Text>
          {icon && iconPosition === 'right' ? <View style={styles.iconRight}>{icon}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  fullWidth: { width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  label: { ...typography.button },
  iconLeft: { marginRight: spacing.xs },
  iconRight: { marginLeft: spacing.xs },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});

const variantStyles: Record<Variant, { container: ViewStyle; label: { color: string } }> = {
  primary: {
    container: { backgroundColor: colors.primary },
    label: { color: colors.white },
  },
  secondary: {
    container: { backgroundColor: colors.primaryLight },
    label: { color: colors.primaryDark },
  },
  outline: {
    container: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border },
    label: { color: colors.textPrimary },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    label: { color: colors.primary },
  },
  danger: {
    container: { backgroundColor: colors.danger },
    label: { color: colors.white },
  },
};
