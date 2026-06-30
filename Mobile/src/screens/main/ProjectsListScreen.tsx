import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, FolderKanban, Plus, RefreshCw, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState, ScreenContainer, Skeleton } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { ApiSpace, workspaceService } from '../../services/workspaceService';
import { useAuthStore } from '../../store/useAuthStore';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'ProjectsList'>;

// Spaces don't carry a decorative color/icon from the backend yet — this
// mirrors them client-side so cards stay visually distinct.
const PALETTE = ['#4F9DFF', '#22C55E', '#F59E0B', '#A855F7', '#EF4444', '#0EA5E9'];
const EMOJI = ['🎨', '📱', '📈', '🧩', '🚀', '🗂️'];

export function ProjectsListScreen({ navigation }: Props) {
  const workspaceId = useAuthStore((s) => s.currentWorkspaceId);
  const [spaces, setSpaces] = useState<ApiSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (isRefresh = false) => {
      if (!workspaceId) return;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        const { data } = await workspaceService.getWorkspaceSpaces(workspaceId);
        setSpaces(data.data.filter((s) => !s.isDeleted));
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Could not load projects. Pull down to retry.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [workspaceId]
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Projects</Text>
        <Pressable style={styles.iconButton} hitSlop={8}>
          <Search size={19} color={colors.textPrimary} />
        </Pressable>
      </View>

      {!workspaceId || loading ? (
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width="48%" height={130} style={{ marginBottom: spacing.sm }} />
            ))}
          </View>
        </View>
      ) : error ? (
        <EmptyState
          icon={<RefreshCw size={30} color={colors.textTertiary} />}
          title="Couldn't load projects"
          description={error}
          actionLabel="Retry"
          onAction={() => load()}
        />
      ) : spaces.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={32} color={colors.textTertiary} />}
          title="No projects yet"
          description="Create your first project to start organizing work."
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
        >
          <View style={styles.gridRow}>
            {spaces.map((s, i) => (
              <Pressable
                key={s._id}
                style={styles.card}
                onPress={() => navigation.navigate('ProjectDetail', { projectId: s._id })}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${PALETTE[i % PALETTE.length]}1A` }]}>
                  <Text style={styles.icon}>{EMOJI[i % EMOJI.length]}</Text>
                </View>
                <Text style={styles.cardName} numberOfLines={1}>
                  {s.name}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {s.members?.length ?? 0} members
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      )}

      <View style={styles.fab}>
        <Pressable style={styles.fabInner}>
          <Plus size={26} color={colors.white} />
        </Pressable>
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
    paddingBottom: spacing.md,
  },
  title: { ...typography.h3, color: colors.textPrimary },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { paddingHorizontal: spacing.lg },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  icon: { fontSize: 18 },
  cardName: { ...typography.bodySemibold, color: colors.textPrimary },
  cardMeta: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
