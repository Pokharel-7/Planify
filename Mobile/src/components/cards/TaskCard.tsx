import { SquareCheck, MessageCircle } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { Task } from '../../types';
import { Avatar } from './Avatar';
import { PriorityBadge } from './Badge';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.stripe, { backgroundColor: task.projectColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.project} numberOfLines={1}>
            {task.projectName}
          </Text>
          <PriorityBadge priority={task.priority} />
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {task.title}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            {task.dueDate ? <Text style={styles.due}>{task.dueDate}</Text> : null}
            {task.subtasksTotal ? (
              <View style={styles.metaItem}>
                <SquareCheck size={13} color={colors.textTertiary} />
                <Text style={styles.metaText}>
                  {task.subtasksDone}/{task.subtasksTotal}
                </Text>
              </View>
            ) : null}
            {task.commentCount ? (
              <View style={styles.metaItem}>
                <MessageCircle size={13} color={colors.textTertiary} />
                <Text style={styles.metaText}>{task.commentCount}</Text>
              </View>
            ) : null}
          </View>
          {task.assignee ? <Avatar member={task.assignee} size={26} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadow.sm,
  },
  pressed: { opacity: 0.85 },
  stripe: { width: 4 },
  content: { flex: 1, padding: spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xxs },
  project: { ...typography.small, color: colors.textTertiary, fontWeight: '700', flexShrink: 1, marginRight: spacing.xs },
  title: { ...typography.bodySemibold, color: colors.textPrimary, marginBottom: spacing.sm },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginLeft: spacing.sm },
  metaText: { ...typography.small, color: colors.textTertiary, marginLeft: 3 },
  due: { ...typography.small, color: colors.textTertiary },
});

