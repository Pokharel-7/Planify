import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../../theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tintBg: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ label, value, icon, tintBg, trend, trendUp }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: tintBg }]}>{icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend ? (
        <Text style={[styles.trend, { color: trendUp ? colors.success : colors.danger }]}>
          {trendUp ? '↑' : '↓'} {trend}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    ...shadow.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: { ...typography.h3, color: colors.textPrimary },
  label: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  trend: { ...typography.small, fontWeight: '700', marginTop: spacing.xxs },
});
