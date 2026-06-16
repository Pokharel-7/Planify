import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, OtpInput, ScreenContainer } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/authService';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export function OtpVerificationScreen({ navigation, route }: Props) {
  const { email, purpose } = route.params;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(45);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleVerify = async () => {
    if (code.length < 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.verifyOtp(email, code);
      if (purpose === 'reset') {
        navigation.navigate('ResetPassword', { email, otp: code });
      } else {
        navigation.navigate('PasswordChanged');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'That code is incorrect or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setSeconds(45);
    try {
      await authService.resendOtp(email);
    } catch {
      // silently ignore — user can retry after the timer resets
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={10}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.iconCircle}>
          <ShieldCheck size={28} color={colors.primary} />
        </View>

        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code we sent to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <OtpInput value={code} onChange={setCode} />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label="Verify"
          onPress={handleVerify}
          loading={loading}
          style={{ marginTop: spacing.xl }}
        />

        <View style={styles.resendRow}>
          {seconds > 0 ? (
            <Text style={styles.resendMuted}>Resend code in 0:{seconds.toString().padStart(2, '0')}</Text>
          ) : (
            <>
              <Text style={styles.resendMuted}>Didn&apos;t receive it? </Text>
              <Text style={styles.resendLink} onPress={handleResend}>
                Resend code
              </Text>
            </>
          )}
        </View>
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
  email: { color: colors.textPrimary, fontWeight: '600' },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.sm },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  resendMuted: { ...typography.body, color: colors.textTertiary },
  resendLink: { ...typography.bodySemibold, color: colors.primary },
});
