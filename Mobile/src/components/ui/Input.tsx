import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  isPassword,
  onFocus,
  onBlur,
  style,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(!!isPassword);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputContainerFocused,
          !!error && styles.inputContainerError,
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {isPassword ? (
          <Pressable onPress={() => setSecure((s) => !s)} hitSlop={10} style={styles.rightIcon}>
            {secure ? (
              <EyeOff size={20} color={colors.textTertiary} />
            ) : (
              <Eye size={20} color={colors.textTertiary} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', marginBottom: spacing.md },
  label: { ...typography.label, color: colors.textPrimary, marginBottom: spacing.xs },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  inputContainerError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  leftIcon: { marginRight: spacing.xs },
  rightIcon: { marginLeft: spacing.xs, padding: spacing.xxs },
  errorText: { ...typography.caption, color: colors.danger, marginTop: spacing.xxs },
  hintText: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xxs },
});
