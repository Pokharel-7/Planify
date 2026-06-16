import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, FileText } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState, ScreenContainer } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { ApiTransaction, subscriptionService } from '../../services/subscriptionService';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'BillingHistory'>;

const STATUS_COLOR: Record<string, { color: string; bg: string; label: string }> = {
  completed: { color: colors.success, bg: colors.successBg, label: 'Paid' },
  pending: { color: colors.warning, bg: colors.warningBg, label: 'Pending' },
  failed: { color: colors.danger, bg: colors.dangerBg, label: 'Failed' },
  refunded: { color: colors.textTertiary, bg: colors.surfaceMuted, label: 'Refunded' },
};

export function BillingHistoryScreen({ navigation }: Props) {
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await subscriptionService.getTransactions();
      setTransactions(res.data.data);
    } catch {
      // Leave empty on failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Billing history</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : transactions.length === 0 ? (
        <EmptyState icon={<FileText size={32} color={colors.textTertiary} />} title="No invoices yet" />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {transactions.map((tx) => {
            const statusStyle = STATUS_COLOR[tx.status] || STATUS_COLOR.pending;
            return (
              <View key={tx._id} style={styles.row}>
                <View style={styles.rowIcon}>
                  <FileText size={17} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowDate}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.rowPlan}>{tx.planId?.name || 'Subscription'}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
                  </View>
                </View>
                <Text style={styles.rowAmount}>{tx.totalAmount || tx.amount}</Text>
              </View>
            );
          })}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: { ...typography.h3, color: colors.textPrimary },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rowDate: { ...typography.bodyMedium, color: colors.textPrimary },
  rowPlan: { ...typography.caption, color: colors.textTertiary, marginTop: 1 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: spacing.xs, paddingVertical: 2, marginTop: 4 },
  statusText: { ...typography.small, fontWeight: '700' },
  rowAmount: { ...typography.bodySemibold, color: colors.textPrimary, marginRight: spacing.sm },
});