import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LayoutGrid, List as ListIcon, Plus, SlidersHorizontal } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SwipeableTaskCard } from '../../components/cards';
import { ScreenContainer } from '../../components/ui';
import { useEnsureWorkspaceContext } from '../../hooks/useEnsureWorkspaceContext';
import { MainStackParamList } from '../../navigation/types';
import { taskService } from '../../services/taskService';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { Task, TaskStatus } from '../../types';

const FILTERS: { key: TaskStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To Do' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'review', label: 'In Review' },
  { key: 'done', label: 'Done' },
];

export function TasksScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { workspaceId } = useEnsureWorkspaceContext();
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const tasks = await taskService.getWorkspaceTasks(workspaceId);
      setAllTasks(tasks);
    } catch {
      // Keep whatever was previously loaded rather than clearing the screen
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [workspaceId]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const handleStatusChange = async (taskId: string, newStatus: any) => {
    setAllTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
    } catch {
      loadTasks();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const filtered = useMemo(
    () => (filter === 'all' ? allTasks : allTasks.filter((t) => t.status === filter)),
    [filter, allTasks]
  );

  const grouped = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = { todo: [], inprogress: [], review: [], done: [], cancelled: [] };
    allTasks.forEach((t) => groups[t.status].push(t));
    return groups;
  }, [allTasks]);

  const openTask = (taskId: string) => {
    navigation.navigate('TaskDetail', { taskId });
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton} onPress={() => setView(view === 'list' ? 'kanban' : 'list')}>
            {view === 'list' ? (
              <LayoutGrid size={19} color={colors.textPrimary} />
            ) : (
              <ListIcon size={19} color={colors.textPrimary} />
            )}
          </Pressable>
          <Pressable style={styles.iconButton}>
            <SlidersHorizontal size={19} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingRight: spacing.lg }}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : view === 'list' ? (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {filtered.map((task) => (
            <SwipeableTaskCard key={task._id} task={task} onPress={() => openTask(task._id)} onStatusChange={handleStatusChange} />
          ))}
          {filtered.length === 0 && <Text style={styles.emptyText}>No tasks here yet.</Text>}
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kanbanContent}>
          {(Object.keys(grouped) as TaskStatus[])
            .filter((s) => s !== 'cancelled')
            .map((status) => (
              <View key={status} style={styles.kanbanColumn}>
                <View style={styles.kanbanColumnHeader}>
                  <Text style={styles.kanbanColumnTitle}>{COLUMN_LABEL[status]}</Text>
                  <View style={styles.kanbanCountBadge}>
                    <Text style={styles.kanbanCountText}>{grouped[status].length}</Text>
                  </View>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {grouped[status].map((task) => (
                    <SwipeableTaskCard key={task._id} task={task} onPress={() => openTask(task._id)} onStatusChange={handleStatusChange} />
                  ))}
                </ScrollView>
              </View>
            ))}
        </ScrollView>
      )}

      <Pressable style={styles.fab} onPress={() => navigation.navigate('CreateTask')}>
        <Plus size={26} color={colors.white} />
      </Pressable>
    </ScreenContainer>
  );
}

const COLUMN_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do',
  inprogress: 'In Progress',
  review: 'In Review',
  done: 'Done',
  cancelled: 'Cancelled',
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: { ...typography.h2, color: colors.textPrimary },
  headerActions: { flexDirection: 'row' },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  filterRow: { marginTop: spacing.md, paddingLeft: spacing.lg, flexGrow: 0 },
  filterChip: {
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterLabel: { ...typography.captionMedium, color: colors.textSecondary },
  filterLabelActive: { color: colors.white },
  listContent: { padding: spacing.lg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.body, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xl },
  kanbanContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  kanbanColumn: { width: 260, marginRight: spacing.md },
  kanbanColumnHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  kanbanColumnTitle: { ...typography.bodySemibold, color: colors.textPrimary, marginRight: spacing.xs },
  kanbanCountBadge: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  kanbanCountText: { ...typography.small, color: colors.textSecondary, fontWeight: '700' },
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

