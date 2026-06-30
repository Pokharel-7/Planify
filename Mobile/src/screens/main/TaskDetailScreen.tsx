import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Calendar,
  Ellipsis,
  Paperclip,
  Send,
  Square,
  SquareCheck,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar } from '../../components/cards';
import { PriorityBadge, StatusBadge } from '../../components/cards/Badge';
import { ScreenContainer } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { mapTask, taskService } from '../../services/taskService';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { Task } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskDetail'>;

interface SubtaskItem {
  _id: string;
  title: string;
  done: boolean;
}

interface CommentItem {
  _id: string;
  authorName: string;
  authorId: string;
  text: string;
  timeAgo: string;
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

export function TaskDetailScreen({ navigation, route }: Props) {
  const [task, setTask] = useState<Task | null>(null);
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    try {
      const apiTask = await taskService.getTask(route.params.taskId);
      const spaceName = apiTask.space?.name || apiTask.space || 'Project';
      const spaceId = typeof apiTask.space === 'object' ? apiTask.space._id : apiTask.space || 'x';
      setTask(mapTask(apiTask, spaceName, spaceId));
      setDescription(apiTask.description || '');

      const [rawSubtasks, rawComments] = await Promise.all([
        taskService.getSubtasks(route.params.taskId),
        taskService.getComments(route.params.taskId),
      ]);

      setSubtasks(
        rawSubtasks.map((s: any) => ({ _id: s._id, title: s.title, done: s.status === 'done' }))
      );
      setComments(
        rawComments.map((c) => ({
          _id: c._id,
          authorName: c.user?.name || 'Someone',
          authorId: c.user?._id || '',
          text: c.content,
          timeAgo: timeAgo(c.createdAt),
        }))
      );
    } catch {
      // Leave whatever loaded so far rather than blanking the screen
    } finally {
      setLoading(false);
    }
  }, [route.params.taskId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSubtask = async (s: SubtaskItem) => {
    setSubtasks((prev) => prev.map((x) => (x._id === s._id ? { ...x, done: !x.done } : x)));
    try {
      await taskService.toggleSubtask(s._id, s.done);
    } catch {
      // Revert on failure
      setSubtasks((prev) => prev.map((x) => (x._id === s._id ? { ...x, done: s.done } : x)));
    }
  };

  const sendComment = async () => {
    const text = comment.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      await taskService.addComment(route.params.taskId, text);
      setComment('');
      const rawComments = await taskService.getComments(route.params.taskId);
      setComments(
        rawComments.map((c) => ({
          _id: c._id,
          authorName: c.user?.name || 'Someone',
          authorId: c.user?._id || '',
          text: c.content,
          timeAgo: timeAgo(c.createdAt),
        }))
      );
    } catch {
      // Keep the typed text so the user doesn't lose it
    } finally {
      setPosting(false);
    }
  };

  const doneCount = subtasks.filter((s) => s.done).length;

  if (loading || !task) {
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
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Task
        </Text>
        <Pressable style={styles.iconButton} hitSlop={8}>
          <Ellipsis size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          <View style={[styles.projectChip, { backgroundColor: `${task.projectColor}1A` }]}>
            <View style={[styles.projectDot, { backgroundColor: task.projectColor }]} />
            <Text style={[styles.projectChipText, { color: task.projectColor }]}>{task.projectName}</Text>
          </View>
          <PriorityBadge priority={task.priority} />
        </View>

        <Text style={styles.title}>{task.title}</Text>

        <View style={styles.metaRow}>
          <StatusBadge status={task.status} />
          {task.dueDate ? (
            <View style={styles.dueRow}>
              <Calendar size={14} color={colors.textTertiary} />
              <Text style={styles.dueText}>{new Date(task.dueDate).toLocaleDateString()}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Assignee</Text>
          {task.assignee ? (
            <View style={styles.assigneeRow}>
              <Avatar member={task.assignee} size={32} />
              <Text style={styles.assigneeName}>{task.assignee.name}</Text>
            </View>
          ) : (
            <Text style={styles.unassigned}>Unassigned</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{description || 'No description yet.'}</Text>
        </View>

        {subtasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.subtaskHeader}>
              <Text style={styles.sectionLabel}>Subtasks</Text>
              <Text style={styles.subtaskCount}>
                {doneCount}/{subtasks.length}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(doneCount / subtasks.length) * 100}%` },
                ]}
              />
            </View>
            {subtasks.map((s) => (
              <Pressable key={s._id} style={styles.subtaskRow} onPress={() => toggleSubtask(s)}>
                {s.done ? (
                  <SquareCheck size={20} color={colors.primary} />
                ) : (
                  <Square size={20} color={colors.textTertiary} />
                )}
                <Text style={[styles.subtaskText, s.done && styles.subtaskTextDone]}>{s.title}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Comments</Text>
          {comments.length === 0 && <Text style={styles.unassigned}>No comments yet.</Text>}
          {comments.map((c) => (
            <View key={c._id} style={styles.commentRow}>
              <Avatar
                member={{ _id: c.authorId, name: c.authorName, email: '', avatarColor: colors.primary, initials: c.authorName.slice(0, 2).toUpperCase() }}
                size={30}
              />
              <View style={styles.commentBubble}>
                <View style={styles.commentHeaderRow}>
                  <Text style={styles.commentAuthor}>{c.authorName}</Text>
                  <Text style={styles.commentTime}>{c.timeAgo}</Text>
                </View>
                <Text style={styles.commentText}>{c.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      <View style={styles.commentInputRow}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          placeholderTextColor={colors.textTertiary}
          value={comment}
          onChangeText={setComment}
        />
        <Pressable style={styles.sendButton} onPress={sendComment} disabled={posting}>
          <Send size={18} color={colors.white} />
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
    paddingBottom: spacing.sm,
  },
  headerTitle: { ...typography.bodySemibold, color: colors.textPrimary },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: spacing.lg },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  projectChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xs, paddingVertical: 4, borderRadius: radius.full },
  projectDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  projectChipText: { ...typography.small, fontWeight: '700' },
  title: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  dueRow: { flexDirection: 'row', alignItems: 'center', marginLeft: spacing.sm },
  dueText: { ...typography.caption, color: colors.textTertiary, marginLeft: 4 },
  section: { marginTop: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.sm },
  assigneeRow: { flexDirection: 'row', alignItems: 'center' },
  assigneeName: { ...typography.bodyMedium, color: colors.textPrimary, marginLeft: spacing.sm },
  unassigned: { ...typography.body, color: colors.textTertiary },
  description: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  subtaskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtaskCount: { ...typography.caption, color: colors.textTertiary },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.borderLight, overflow: 'hidden', marginBottom: spacing.sm },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  subtaskText: { ...typography.body, color: colors.textPrimary, marginLeft: spacing.sm },
  subtaskTextDone: { color: colors.textTertiary, textDecorationLine: 'line-through' },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    ...shadow.sm,
  },
  attachmentIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  attachmentName: { ...typography.bodyMedium, color: colors.textPrimary },
  commentRow: { flexDirection: 'row', marginBottom: spacing.md },
  commentBubble: { flex: 1, marginLeft: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.sm },
  commentHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  commentAuthor: { ...typography.captionMedium, color: colors.textPrimary },
  commentTime: { ...typography.small, color: colors.textTertiary },
  commentText: { ...typography.body, color: colors.textSecondary },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  commentInput: {
    flex: 1,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});