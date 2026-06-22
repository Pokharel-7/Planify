import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CircleCheckBig } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, ScreenContainer } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PasswordChanged'>;

export function PasswordChangedScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <CircleCheckBig size={40} color={colors.success} />
        </View>
        <Text style={styles.title}>All set!</Text>
        <Text style={styles.subtitle}>Your password has been updated. You can now log in with your new password.</Text>

        <Button
          label="Back to log in"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: radius.xxl,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

