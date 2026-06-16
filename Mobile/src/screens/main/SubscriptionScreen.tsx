import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Check, ChevronRight, RefreshCw } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, ScreenContainer, Skeleton } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { ApiPlan, ApiSubscriptionInfo, subscriptionService } from '../../services/subscriptionService';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'Subscription'>;

function featureList(p: ApiPlan): string[] {
  const f = p.features;
  const list: string[] = [];
  list.push(f.maxWorkspaces === -1 ? 'Unlimited workspaces' : `${f.maxWorkspaces} workspace${f.maxWorkspaces !== 1 ? 's' : ''}`);
  list.push(f.maxSpaces === -1 ? 'Unlimited spaces' : `${f.maxSpaces} spaces`);
  list.push(f.maxTasks === -1 ? 'Unlimited tasks' : `${f.maxTasks} tasks`);
  if (f.hasGroupChat) list.push('Group chat');
  if (f.hasAccessControl) list.push('Access control');
  return list;
}

export function SubscriptionScreen({ navigation }: Props) {
  const [info, setInfo] = useState<ApiSubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [infoRes, plansRes] = await Promise.all([
        subscriptionService.getInfo(),
        subscriptionService.getPlans(),
      ]);
      setInfo(infoRes.data.data);
      setPlans(plansRes.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not load your subscription.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [upgradingId, setUpgradingId] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setUpgradingId(planId);
    try {
      const res = await subscriptionService.initiatePayment(planId, 1, 'annual');
      const { paymentUrl, paymentRequest } = res.data.data;
      navigation.navigate('PaymentWebView', { paymentUrl, paymentRequest });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not start payment. Please try again.');
    } finally {
      setUpgradingId(null);
    }
  };

  const planName = info?.plan ?? '—';

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Subscription</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Skeleton width="100%" height={110} style={{ marginBottom: spacing.md }} />
        ) : error ? (
          <View style={styles.errorCard}>
            <RefreshCw size={20} color={colors.textTertiary} />
            <Text style={styles.errorText}>{error}</Text>
            <Button label="Retry" variant="outline" size="sm" fullWidth={false} onPress={load} style={{ marginTop: spacing.sm }} />
          </View>
        ) : (
          <View style={styles.currentCard}>
            <View style={styles.currentTopRow}>
              <View>
                <Text style={styles.currentLabel}>Current plan</Text>
                <Text style={styles.currentPlanName}>{planName}</Text>
              </View>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{info?.status ?? 'Active'}</Text>
              </View>
            </View>
            {info?.seats ? <Text style={styles.currentMeta}>{info.seats} seats</Text> : null}
            {info?.renewsAt ? <Text style={styles.currentMeta}>Renews on {info.renewsAt}</Text> : null}
          </View>
        )}

        <Pressable style={styles.billingRow} onPress={() => navigation.navigate('BillingHistory')}>
          <Text style={styles.billingRowLabel}>Billing history</Text>
          <ChevronRight size={18} color={colors.textTertiary} />
        </Pressable>

        <Text style={styles.sectionTitle}>Available plans</Text>
        {plans.map((p) => {
          const isCurrent = p.name.toLowerCase() === planName.toLowerCase();
          return (
            <View key={p._id} style={[styles.planCard, isCurrent && styles.planCardActive]}>
              <View style={styles.planCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>{p.name}</Text>
                  <Text style={styles.planTagline}>{p.description}</Text>
                </View>
                <Text style={styles.planPrice}>
                  {p.baseCurrency} {p.basePrice}
                  <Text style={styles.planPriceUnit}>/mo</Text>
                </Text>
              </View>
              {featureList(p).map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Check size={15} color={colors.success} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
              <Button
                label={isCurrent ? 'Current plan' : 'Upgrade'}
                variant={isCurrent ? 'outline' : 'primary'}
                disabled={isCurrent}
                loading={upgradingId === p._id}
                onPress={() => handleUpgrade(p._id)}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          );
        })}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
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
  content: { paddingHorizontal: spacing.lg },
  errorCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  errorText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  currentCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  currentTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  currentLabel: { ...typography.caption, color: colors.primaryLight },
  currentPlanName: { ...typography.h2, color: colors.white, marginTop: 2 },
  planBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  planBadgeText: { ...typography.small, color: colors.white, fontWeight: '700' },
  currentMeta: { ...typography.caption, color: colors.primaryLight, marginTop: spacing.sm },
  billingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    marginBottom: spacing.xl,
    ...shadow.sm,
  },
  billingRowLabel: { ...typography.bodyMedium, color: colors.textPrimary },
  sectionTitle: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.sm },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  planCardActive: { borderColor: colors.primary },
  planCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  planName: { ...typography.h4, color: colors.textPrimary },
  planTagline: { ...typography.caption, color: colors.textTertiary, marginTop: 1 },
  planPrice: { ...typography.h3, color: colors.textPrimary },
  planPriceUnit: { ...typography.caption, color: colors.textTertiary },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  featureText: { ...typography.body, color: colors.textSecondary, marginLeft: spacing.xs },
});
