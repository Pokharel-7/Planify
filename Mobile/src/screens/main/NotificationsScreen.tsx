import { AtSign, Bell, CheckCheck, FolderKanban, ListChecks, RefreshCw } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState, ScreenContainer, Skeleton } from '../../components/ui';
import { ApiNotification, notificationService } from '../../services/notificationService';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type FilterKey = 'all' | 'unread' | 'COMMENT_MENTION' | 'TASK_UPDATE' | 'SPACE_INVITATION';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'COMMENT_MENTION', label: 'Mentions' },
  { key: 'TASK_UPDATE', label: 'Tasks' },
  { key: 'SPACE_INVITATION', label: 'Projects' },
];

function iconFor(type: string) {
  if (type.includes('MENTION')) return AtSign;
  if (type.includes('TASK')) return ListChecks;
  if (type.includes('SPACE') || type.includes('INVIT')) return FolderKanban;
  return Bell;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsScreen() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const { data } = await notificationService.getNotifications({ limit: 50 });
      setItems(data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not load notifications. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'unread') return items.filter((n) => !n.read);
    return items.filter((n) => n.type === filter);
  }, [filter, items]);

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationService.markAllAsRead();
    } catch {
      load(); // resync with server if the optimistic update didn't actually take
    }
  };

  const markOneRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    try {
      await notificationService.markAsRead(id);
    } catch {
      // non-critical — next full refresh will resync
    }
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Pressable style={styles.markReadButton} onPress={markAllRead}>
          <CheckCheck size={15} color={colors.primary} />
          <Text style={styles.markReadText}>Mark all read</Text>
        </Pressable>
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
        <View style={styles.list}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonRow}>
              <Skeleton width={40} height={40} borderRadius={20} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Skeleton width="70%" height={14} style={{ marginBottom: 6 }} />
                <Skeleton width="90%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : error ? (
        <EmptyState
          icon={<RefreshCw size={30} color={colors.textTertiary} />}
          title="Couldn't load notifications"
          description={error}
          actionLabel="Retry"
          onAction={() => load()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Bell size={32} color={colors.textTertiary} />} title="You're all caught up" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
        >
          {filtered.map((n) => {
            const Icon = iconFor(n.type);
            return (
              <Pressable key={n._id} style={[styles.row, !n.read && styles.rowUnread]} onPress={() => markOneRead(n._id)}>
                <View style={styles.systemIcon}>
                  <Icon size={18} color={colors.primary} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>{n.title}</Text>
                  <Text style={styles.rowBody} numberOfLines={2}>
                    {n.body}
                  </Text>
                  <Text style={styles.rowTime}>{timeAgo(n.createdAt)}</Text>
                </View>
                {!n.read ? <View style={styles.unreadDot} /> : null}
              </Pressable>
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
    paddingTop: spacing.sm,
  },
  title: { ...typography.h2, color: colors.textPrimary },
  markReadButton: { flexDirection: 'row', alignItems: 'center' },
  markReadText: { ...typography.captionMedium, color: colors.primary, marginLeft: 4 },
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
  list: { padding: spacing.lg },
  skeletonRow: { flexDirection: 'row', marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  rowUnread: { backgroundColor: colors.primaryLight, borderColor: 'transparent' },
  systemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: { flex: 1, marginLeft: spacing.sm },
  rowTitle: { ...typography.bodySemibold, color: colors.textPrimary },
  rowBody: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  rowTime: { ...typography.small, color: colors.textTertiary, marginTop: spacing.xs },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: spacing.xs, marginTop: 6 },
});
