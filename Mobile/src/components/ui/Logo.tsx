import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
}

export function Logo({ size = 64, showWordmark = true }: LogoProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={{ width: size, height: size, borderRadius: size * 0.24 }}
        resizeMode="contain"
      />
      {showWordmark ? <Text style={styles.wordmark}>Planify</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  wordmark: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
});
