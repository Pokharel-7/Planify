import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Logo } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Logo size={84} />
        <Text style={styles.subtitle}>The clean, focused way to plan work with your team.</Text>
      </View>

      <View style={styles.footer}>
        <Button label="Create an account" onPress={() => navigation.navigate('Register')} />
        <View style={{ height: spacing.sm }} />
        <Button label="I already have an account" variant="outline" onPress={() => navigation.navigate('Login')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, justifyContent: 'space-between', paddingVertical: spacing.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
  footer: { paddingHorizontal: spacing.lg },
});
