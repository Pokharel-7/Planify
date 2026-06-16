import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Input, ScreenContainer } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/authService';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      navigation.navigate('OtpVerification', { email: email.trim(), purpose: 'reset' });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'We could not find an account with that email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={10}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.iconCircle}>
          <Mail size={28} color={colors.primary} />
        </View>

        <Text style={styles.title}>Forgot password?</Text>
        <Text style={styles.subtitle}>
          No worries — enter the email linked to your account and we&apos;ll send you a reset code.
        </Text>

        <Input
          label="Email address"
          placeholder="you@company.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={error}
        />

        <Button label="Send reset code" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: spacing.lg },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xxs, marginBottom: spacing.xl },
});
