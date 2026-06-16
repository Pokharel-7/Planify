import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Ellipsis, Plus, RefreshCw, UserPlus } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState, ScreenContainer, Skeleton } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { ApiSpace, workspaceService } from '../../services/workspaceService';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'ProjectDetail'>;

const TABS = ['Overview', 'Tasks', 'Members', 'Files'] as const;

export function ProjectDetailScreen({ navigation, route }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const [space, setSpace] = useState<ApiSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await workspaceService.getSpace(route.params.projectId);
      setSpace(data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not load this project.');
    } finally {
      setLoading(false);
    }
  }, [route.params.projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const members = space?.members ?? [];

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {space?.name ?? 'Project'}
        </Text>
        <Pressable style={styles.iconButton} hitSlop={8}>
          <Ellipsis size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Skeleton width="100%" height={140} />
        </View>
      ) : error || !space ? (
        <EmptyState
          icon={<RefreshCw size={30} color={colors.textTertiary} />}
          title="Couldn't load project"
          description={error}
          actionLabel="Retry"
          onAction={load}
        />
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.projectName}>{space.name}</Text>
            {space.description ? <Text style={styles.description}>{space.description}</Text> : null}
            <Text style={styles.memberCount}>{members.length} members</Text>
          </View>

          <View style={styles.tabRow}>
            {TABS.map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={styles.tabButton}>
                <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>{t}</Text>
                {tab === t ? <View style={styles.tabIndicator} /> : null}
              </Pressable>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {tab === 'Overview' ? (
              <Text style={styles.description}>
                {space.description || 'No description yet for this project.'}
              </Text>
            ) : null}

            {tab === 'Tasks' ? (
              <Text style={styles.note}>
                Task lists live under this project's Lists in the web app hierarchy. Fetching them
                here needs a "list this space's tasks" call — next step once the list ID flow is wired.
              </Text>
            ) : null}

            {tab === 'Members' ? (
              <>
                <Pressable style={styles.inviteRow}>
                  <View style={styles.inviteIcon}>
                    <UserPlus size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.inviteText}>Invite members</Text>
                </Pressable>
                {members.length === 0 ? (
                  <Text style={styles.note}>No members listed.</Text>
                ) : (
                  members.map((m, i) => {
                    const isPopulated = typeof m.user === 'object';
                    const name = isPopulated ? (m.user as any).name : 'Member';
                    return (
                      <View key={i} style={styles.memberRow}>
                        <View style={styles.memberAvatar}>
                          <Text style={styles.memberInitials}>{name.slice(0, 2).toUpperCase()}</Text>
                        </View>
                        <View style={{ marginLeft: spacing.sm }}>
                          <Text style={styles.memberName}>{name}</Text>
                          <Text style={styles.memberRole}>{m.role}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            ) : null}

            {tab === 'Files' ? <Text style={styles.note}>No files uploaded yet.</Text> : null}

            <View style={{ height: spacing.xxxl }} />
          </ScrollView>
        </>
      )}

      <View style={styles.fab}>
        <Plus size={26} color={colors.white} />
      </View>
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
  headerTitle: { ...typography.bodySemibold, color: colors.textPrimary, flex: 1, marginHorizontal: spacing.sm, textAlign: 'center' },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadow.sm,
  },
  projectName: { ...typography.h4, color: colors.textPrimary },
  description: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 22 },
  memberCount: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.sm },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  tabButton: { marginRight: spacing.lg, paddingBottom: spacing.sm },
  tabLabel: { ...typography.bodyMedium, color: colors.textTertiary },
  tabLabelActive: { color: colors.textPrimary, fontWeight: '700' },
  tabIndicator: { height: 2, backgroundColor: colors.primary, borderRadius: 1, marginTop: spacing.xs },
  content: { padding: spacing.lg },
  note: { ...typography.body, color: colors.textTertiary, lineHeight: 20 },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  inviteIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  inviteText: { ...typography.bodySemibold, color: colors.primaryDark },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  memberAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  memberInitials: { ...typography.captionMedium, color: colors.white, fontWeight: '700' },
  memberName: { ...typography.bodyMedium, color: colors.textPrimary },
  memberRole: { ...typography.caption, color: colors.textTertiary, marginTop: 1 },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.lg,
  },
});

