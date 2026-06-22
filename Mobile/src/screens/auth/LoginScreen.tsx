import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Checkbox, Divider, Input, Logo, ScreenContainer } from '../../components/ui';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const setSession = useAuthStore((s) => s.setSession);
  const google = useGoogleAuth();

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const { data } = await authService.login({ email: email.trim(), password });
      setSession(data.user, data.token);
      // RootNavigator swaps to MainFlow automatically once a token exists.
    } catch (err: any) {
      setErrors({ form: err?.response?.data?.message || 'Invalid email or password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Logo size={48} showWordmark={false} />
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to continue to your workspace.</Text>

        {errors.form ? (
          <View style={styles.formError}>
            <Text style={styles.formErrorText}>{errors.form}</Text>
          </View>
        ) : null}

        <Input
          label="Email address"
          placeholder="you@company.com"
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon={<Mail size={18} color={colors.textTertiary} />}
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          isPassword
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />

        <View style={styles.optionsRow}>
          <Checkbox checked={remember} onToggle={() => setRemember((r) => !r)} label="Remember me" />
          <Text style={styles.forgot} onPress={() => navigation.navigate('ForgotPassword')}>
            Forgot password?
          </Text>
        </View>

        <Button label="Log In" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.sm }} />

        <Divider label="or continue with" />

        <Button
          label="Continue with Google"
          variant="outline"
          onPress={google.signIn}
          loading={google.loading}
        />
        {google.error ? <Text style={styles.googleError}>{google.error}</Text> : null}

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <Text style={styles.footerLink} onPress={() => navigation.navigate('Register')}>
            Sign up
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  headerRow: { marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xxs, marginBottom: spacing.xl },
  formError: { backgroundColor: colors.dangerBg, borderRadius: 12, padding: spacing.sm, marginBottom: spacing.md },
  formErrorText: { ...typography.caption, color: colors.danger },
  googleError: { ...typography.caption, color: colors.danger, marginTop: spacing.sm, textAlign: 'center' },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  forgot: { ...typography.captionMedium, color: colors.primary },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { ...typography.body, color: colors.textSecondary },
  footerLink: { ...typography.bodySemibold, color: colors.primary },
});
