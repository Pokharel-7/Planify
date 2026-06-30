import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Building2, ChevronRight, FolderKanban, TrendingUp, Users } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ui';
import { useEnsureWorkspaceContext } from '../../hooks/useEnsureWorkspaceContext';
import { MainStackParamList } from '../../navigation/types';
import { memberService } from '../../services/memberService';
import { taskService } from '../../services/taskService';
import { workspaceService } from '../../services/workspaceService';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'AdminDashboard'>;

interface Stats {
  totalMembers: number;
  activeToday: number;
  totalSpaces: number;
  totalTasks: number;
  completedTasks: number;
}

export function AdminDashboardScreen({ navigation }: Props) {
  const { workspaceId } = useEnsureWorkspaceContext();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const [membersRes, spacesRes, tasks] = await Promise.all([
        memberService.getWorkspaceMembers(workspaceId),
        workspaceService.getWorkspaceSpaces(workspaceId),
        taskService.getWorkspaceTasks(workspaceId),
      ]);

      const rawMembers = membersRes.data?.data;
      const memberList = Array.isArray(rawMembers) ? rawMembers : rawMembers?.members || [];
      const activeToday = memberList.filter((m: any) => m.status === 'active').length;

      setStats({
        totalMembers: memberList.length,
        activeToday,
        totalSpaces: spacesRes.data?.data?.length || 0,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'done').length,
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const completionRate = stats && stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Admin</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading || !stats ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.statsGrid}>
            <StatBlock icon={<Users size={18} color={colors.primary} />} value={stats.totalMembers} label="Members" />
            <StatBlock icon={<TrendingUp size={18} color={colors.success} />} value={stats.activeToday} label="Clocked in" />
            <StatBlock icon={<Building2 size={18} color={colors.warning} />} value={stats.totalSpaces} label="Spaces" />
            <StatBlock icon={<FolderKanban size={18} color={colors.priorityHigh} />} value={stats.totalTasks} label="Tasks" />
          </View>

          <View style={styles.mrrCard}>
            <Text style={styles.mrrLabel}>Task completion rate</Text>
            <Text style={styles.mrrValue}>{completionRate}%</Text>
            <Text style={styles.mrrTrend}>
              {stats.completedTasks} of {stats.totalTasks} tasks completed
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.menuCard}>
            <Pressable style={styles.menuRow} onPress={() => navigation.navigate('ManageUsers')}>
              <Text style={styles.menuLabel}>Manage users</Text>
              <ChevronRight size={18} color={colors.textTertiary} />
            </Pressable>
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

function StatBlock({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <View style={styles.statBlock}>
      <View style={styles.statIconWrap}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  content: { paddingHorizontal: spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.md },
  statBlock: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: { ...typography.h3, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  mrrCard: {
    backgroundColor: colors.black,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  mrrLabel: { ...typography.caption, color: colors.textTertiary },
  mrrValue: { ...typography.h1, color: colors.white, marginTop: spacing.xxs },
  mrrTrend: { ...typography.caption, color: colors.success, marginTop: spacing.xs },
  sectionTitle: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.sm },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.sm,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.sm },
  menuDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  menuLabel: { ...typography.bodyMedium, color: colors.textPrimary },
});
