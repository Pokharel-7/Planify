import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell,
  CircleCheckBig,
  Clock,
  Flame,
  LogIn,
  LogOut,
  MessageCircle,
  Plus,
  Search,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { Avatar, ProjectCard, SectionHeader, StatCard, TaskCard } from '../../components/cards';
import { ScreenContainer } from '../../components/ui';
import { useEnsureWorkspaceContext } from '../../hooks/useEnsureWorkspaceContext';
import { MainStackParamList } from '../../navigation/types';
import { taskService } from '../../services/taskService';
import { memberService } from '../../services/memberService';
import { workspaceService } from '../../services/workspaceService';
import { useAuthStore } from '../../store/useAuthStore';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { ActivityItem, Member, Project, Task } from '../../types';

const PROJECT_COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];
function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { workspaceId } = useEnsureWorkspaceContext();
  const authUser = useAuthStore((s) => s.user);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clockedIn, setClockedIn] = useState(false);
  const [clockLoading, setClockLoading] = useState(false);

  const currentMember: Member = {
    _id: authUser?._id || '',
    name: authUser?.name || 'there',
    email: authUser?.email || '',
    avatarColor: colors.primary,
    initials: (authUser?.name || '?')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  };

  const load = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const [fetchedTasks, spacesRes, activityRes] = await Promise.all([
        taskService.getWorkspaceTasks(workspaceId),
        workspaceService.getWorkspaceSpaces(workspaceId),
        workspaceService.getWorkspaceActivity(workspaceId, 5).catch(() => ({ data: { data: [] } })),
      ]);

      setTasks(fetchedTasks);

      const spaces = spacesRes.data?.data || [];
      setProjects(
        spaces.map((s: any) => {
          const spaceTasks = fetchedTasks.filter((t) => t.projectName === s.name);
          return {
            _id: s._id,
            name: s.name,
            color: colorForId(s._id),
            icon: '📁',
            memberCount: s.members?.length ?? 0,
            taskCount: spaceTasks.length,
            completedCount: spaceTasks.filter((t) => t.status === 'done').length,
          };
        })
      );

      const activities = activityRes.data?.data || [];
      setRecentActivity(
        activities.map((a: any) => ({
          _id: a._id,
          actor: {
            _id: a.user?._id || '',
            name: a.user?.name || 'Someone',
            email: a.user?.email || '',
            avatarColor: colors.primary,
            initials: (a.user?.name || '?').slice(0, 2).toUpperCase(),
          },
          action: a.description || '',
          target: '',
          timeAgo: timeAgo(a.createdAt),
        }))
      );
    } catch {
      // Leave whatever was already loaded rather than blanking the screen
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const todayTasks = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === today);
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((t) => t.dueDate && new Date(t.dueDate).getTime() > now)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [tasks]);

  const toggleClock = async () => {
    if (!workspaceId) return;
    setClockLoading(true);
    const next = !clockedIn;
    try {
      await memberService.updateMyStatus(workspaceId, next ? 'active' : 'inactive');
      setClockedIn(next);
    } catch {
      // Leave state unchanged on failure
    } finally {
      setClockLoading(false);
    }
  };

  const inProgressCount = tasks.filter((t) => t.status === 'inprogress').length;
  const completedCount = tasks.filter((t) => t.status === 'done').length;

  if (loading) {
    return (
      <ScreenContainer edges={['top', 'left', 'right']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingSmall}>Good morning,</Text>
            <Text style={styles.greetingName}>{currentMember.name.split(' ')[0]} 👋</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton} onPress={() => navigation.navigate('ConversationList')}>
              <MessageCircle size={20} color={colors.textPrimary} />
            </Pressable>
            <View style={styles.iconButton}>
              <Search size={20} color={colors.textPrimary} />
            </View>
            <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Tabs')}>
              <Bell size={20} color={colors.textPrimary} />
              <View style={styles.notifDot} />
            </Pressable>
            <Avatar member={currentMember} size={38} />
          </View>
        </View>

        {/* Quick stats */}
        <Pressable style={[styles.clockCard, clockedIn && styles.clockCardActive]} onPress={toggleClock} disabled={clockLoading}>
          <View style={styles.clockIconWrap}>
            {clockedIn ? <LogOut size={18} color={colors.white} /> : <LogIn size={18} color={colors.primary} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.clockTitle, clockedIn && styles.clockTitleActive]}>
              {clockedIn ? "You're clocked in" : 'Clock in for today'}
            </Text>
            <Text style={[styles.clockSubtitle, clockedIn && styles.clockSubtitleActive]}>
              {clockedIn ? 'Tap to clock out' : 'Tap to start tracking your time'}
            </Text>
          </View>
        </Pressable>

        <View style={styles.statsRow}>
          <StatCard
            label="Due today"
            value={todayTasks.length}
            icon={<Clock size={17} color={colors.primary} />}
            tintBg={colors.primaryLight}
          />
          <View style={{ width: spacing.sm }} />
          <StatCard
            label="In progress"
            value={inProgressCount}
            icon={<Flame size={17} color={colors.warning} />}
            tintBg={colors.warningBg}
          />
          <View style={{ width: spacing.sm }} />
          <StatCard
            label="Completed"
            value={completedCount}
            icon={<CircleCheckBig size={17} color={colors.success} />}
            tintBg={colors.successBg}
          />
        </View>

        {/* Today's tasks */}
        <SectionHeader title="Today's tasks" actionLabel="See all" onAction={() => navigation.navigate('Tabs')} />
        {todayTasks.length === 0 && <Text style={styles.emptyText}>Nothing due today.</Text>}
        {todayTasks.map((task) => (
          <TaskCard key={task._id} task={task} onPress={() => navigation.navigate('TaskDetail', { taskId: task._id })} />
        ))}

        {/* Recent projects */}
        <SectionHeader title="Recent projects" actionLabel="See all" onAction={() => navigation.navigate('ProjectsList')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
          {projects.map((p) => (
            <ProjectCard
              key={p._id}
              project={p}
              style={styles.projectCardInline}
              onPress={() => navigation.navigate('ProjectDetail', { projectId: p._id })}
            />
          ))}
        </ScrollView>

        {/* Upcoming */}
        <SectionHeader title="Upcoming tasks" actionLabel="See all" onAction={() => navigation.navigate('Tabs')} />
        {upcomingTasks.length === 0 && <Text style={styles.emptyText}>No upcoming tasks.</Text>}
        {upcomingTasks.map((task) => (
          <TaskCard key={task._id} task={task} onPress={() => navigation.navigate('TaskDetail', { taskId: task._id })} />
        ))}

        {/* Recent activity */}
        <SectionHeader title="Recent activity" />
        <View style={styles.activityCard}>
          {recentActivity.length === 0 && (
            <Text style={[styles.emptyText, { padding: spacing.sm }]}>No recent activity.</Text>
          )}
          {recentActivity.map((item, i) => (
            <View key={item._id} style={[styles.activityRow, i > 0 && styles.meetingDivider]}>
              <Avatar member={item.actor} size={30} />
              <Text style={styles.activityText}>
                <Text style={styles.activityActor}>{item.actor.name.split(' ')[0]}</Text> {item.action}
              </Text>
              <Text style={styles.activityTime}>{item.timeAgo}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* Floating action button */}
      <Pressable style={styles.fab} onPress={() => navigation.navigate('CreateTask')}>
        <Plus size={26} color={colors.white} />
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.caption, color: colors.textTertiary, marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  greetingSmall: { ...typography.body, color: colors.textSecondary },
  greetingName: { ...typography.h3, color: colors.textPrimary },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  statsRow: { flexDirection: 'row', marginBottom: spacing.lg },
  clockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  clockCardActive: { backgroundColor: colors.success, borderColor: colors.success },
  clockIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  clockTitle: { ...typography.bodySemibold, color: colors.textPrimary },
  clockTitleActive: { color: colors.white },
  clockSubtitle: { ...typography.caption, color: colors.textTertiary, marginTop: 1 },
  clockSubtitleActive: { color: 'rgba(255,255,255,0.85)' },
  activityCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  activityRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm },
  meetingDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  activityText: { ...typography.caption, color: colors.textSecondary, flex: 1, marginLeft: spacing.sm, marginRight: spacing.xs },
  activityActor: { color: colors.textPrimary, fontWeight: '700' },
  activityTime: { ...typography.small, color: colors.textTertiary },
  projectCardInline: { width: 200, marginRight: spacing.sm },
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
