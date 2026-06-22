import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Checkbox, Divider, Input, ScreenContainer } from '../../components/ui';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/authService';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const google = useGoogleAuth();

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Full name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Use at least 8 characters';
    if (!agree) next.agree = 'You must accept the Terms to continue';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.register({ name: name.trim(), email: email.trim(), password });
      navigation.navigate('OtpVerification', { email: email.trim(), purpose: 'register' });
    } catch (err: any) {
      setErrors({ form: err?.response?.data?.message || 'Could not create your account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Start organizing your team&apos;s work in minutes.</Text>

        {errors.form ? (
          <View style={styles.formError}>
            <Text style={styles.formErrorText}>{errors.form}</Text>
          </View>
        ) : null}

        <Input
          label="Full name"
          placeholder="Jane Cooper"
          leftIcon={<User size={18} color={colors.textTertiary} />}
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
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
          placeholder="At least 8 characters"
          isPassword
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          hint={!errors.password ? 'Use 8+ characters with a mix of letters and numbers' : undefined}
        />

        <Checkbox
          checked={agree}
          onToggle={() => setAgree((a) => !a)}
          label={
            <Text style={styles.agreeText}>
              I agree to the <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          }
        />
        {errors.agree ? <Text style={styles.agreeError}>{errors.agree}</Text> : null}

        <Button label="Create account" onPress={handleRegister} loading={loading} style={{ marginTop: spacing.lg }} />

        <Divider label="or sign up with" />
        <Button
          label="Continue with Google"
          variant="outline"
          onPress={google.signIn}
          loading={google.loading}
        />
        {google.error ? <Text style={styles.googleError}>{google.error}</Text> : null}

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
            Log in
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  title: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xxs, marginBottom: spacing.xl },
  formError: { backgroundColor: colors.dangerBg, borderRadius: 12, padding: spacing.sm, marginBottom: spacing.md },
  formErrorText: { ...typography.caption, color: colors.danger },
  googleError: { ...typography.caption, color: colors.danger, marginTop: spacing.sm, textAlign: 'center' },
  agreeText: { ...typography.body, color: colors.textSecondary },
  link: { color: colors.primary, fontWeight: '600' },
  agreeError: { ...typography.caption, color: colors.danger, marginTop: spacing.xxs, marginLeft: 28 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { ...typography.body, color: colors.textSecondary },
  footerLink: { ...typography.bodySemibold, color: colors.primary },
});
