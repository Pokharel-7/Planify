import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeyRound } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Input, ScreenContainer } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/authService';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const { email, otp } = route.params;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!password || password.length < 8) next.password = 'Use at least 8 characters';
    if (confirm !== password) next.confirm = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.resetPassword(email, otp, password);
      navigation.navigate('PasswordChanged');
    } catch (err: any) {
      setErrors({ form: err?.response?.data?.message || 'Could not reset your password. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <KeyRound size={28} color={colors.primary} />
        </View>

        <Text style={styles.title}>Set a new password</Text>
        <Text style={styles.subtitle}>Choose a strong password you haven&apos;t used before.</Text>

        {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

        <Input
          label="New password"
          placeholder="At least 8 characters"
          isPassword
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />
        <Input
          label="Confirm new password"
          placeholder="Re-enter your password"
          isPassword
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
        />

        <Button label="Reset password" onPress={handleReset} loading={loading} style={{ marginTop: spacing.sm }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: spacing.lg },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xxs, marginBottom: spacing.xl },
  formError: { ...typography.caption, color: colors.danger, marginBottom: spacing.md },
});
