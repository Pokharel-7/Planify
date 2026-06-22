import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (token) {
        // MainFlow is mounted by RootNavigator once a session exists.
        return;
      }
      navigation.replace(hasCompletedOnboarding ? 'Welcome' : 'Onboarding');
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoLetter}>P</Text>
        </View>
        <Text style={styles.wordmark}>Planify</Text>
        <Text style={styles.tagline}>Plan smarter. Work together.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  logoLetter: { color: colors.white, fontSize: 40, fontWeight: '700' },
  wordmark: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.lg },
  tagline: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxs },
});
