import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ui';
import { projects } from '../../data/mockData';
import { MainStackParamList } from '../../navigation/types';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'Reports'>;

const RANGES = ['Weekly', 'Monthly', 'Yearly'] as const;

const WEEKLY_DATA = [
  { label: 'Mon', completed: 4, pending: 2 },
  { label: 'Tue', completed: 6, pending: 3 },
  { label: 'Wed', completed: 3, pending: 4 },
  { label: 'Thu', completed: 8, pending: 1 },
  { label: 'Fri', completed: 5, pending: 2 },
  { label: 'Sat', completed: 2, pending: 0 },
  { label: 'Sun', completed: 0, pending: 0 },
];

export function ReportsScreen({ navigation }: Props) {
  const [range, setRange] = useState<(typeof RANGES)[number]>('Weekly');
  const maxValue = Math.max(...WEEKLY_DATA.map((d) => d.completed + d.pending));

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Reports</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.rangeRow}>
        {RANGES.map((r) => (
          <Pressable key={r} onPress={() => setRange(r)} style={[styles.rangeChip, range === r && styles.rangeChipActive]}>
            <Text style={[styles.rangeLabel, range === r && styles.rangeLabelActive]}>{r}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>28</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>70%</Text>
            <Text style={styles.statLabel}>On-time rate</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Completed vs Pending</Text>
          <View style={styles.chartRow}>
            {WEEKLY_DATA.map((d) => (
              <View key={d.label} style={styles.chartColumn}>
                <View style={styles.chartTrack}>
                  <View style={[styles.chartSegmentPending, { height: `${(d.pending / maxValue) * 100}%` }]} />
                  <View style={[styles.chartSegmentCompleted, { height: `${(d.completed / maxValue) * 100}%` }]} />
                </View>
                <Text style={styles.chartLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.legendText}>Pending</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>By project</Text>
        {projects.map((p) => {
          const pct = Math.round((p.completedCount / p.taskCount) * 100);
          return (
            <View key={p._id} style={styles.projectRow}>
              <View style={styles.projectRowTop}>
                <Text style={styles.projectName}>{p.name}</Text>
                <Text style={styles.projectPct}>{pct}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: p.color }]} />
              </View>
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
  rangeRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  rangeChip: {
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  rangeChipActive: { backgroundColor: colors.primary },
  rangeLabel: { ...typography.captionMedium, color: colors.textSecondary },
  rangeLabelActive: { color: colors.white },
  content: { paddingHorizontal: spacing.lg },
  statsRow: { flexDirection: 'row', marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  statValue: { ...typography.h4, color: colors.textPrimary },
  statLabel: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.xl,
    ...shadow.sm,
  },
  chartTitle: { ...typography.bodySemibold, color: colors.textPrimary, marginBottom: spacing.md },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', height: 120, alignItems: 'flex-end' },
  chartColumn: { alignItems: 'center', width: 28 },
  chartTrack: { width: 16, height: 100, justifyContent: 'flex-end' },
  chartSegmentCompleted: { width: 16, backgroundColor: colors.success, borderRadius: 4 },
  chartSegmentPending: { width: 16, backgroundColor: colors.warning, borderRadius: 4, marginTop: 2 },
  chartLabel: { ...typography.small, color: colors.textTertiary, marginTop: spacing.xs },
  legendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.sm },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendText: { ...typography.small, color: colors.textSecondary },
  sectionTitle: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.sm },
  projectRow: { marginBottom: spacing.md },
  projectRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  projectName: { ...typography.bodyMedium, color: colors.textPrimary },
  projectPct: { ...typography.bodyMedium, color: colors.textSecondary },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.borderLight, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
});
