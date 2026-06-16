import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { TaskPriority, TaskStatus } from '../../types';

const PRIORITY_META: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: colors.priorityLow, bg: colors.successBg },
  medium: { label: 'Medium', color: colors.priorityMedium, bg: colors.warningBg },
  high: { label: 'High', color: colors.priorityHigh, bg: '#FFF1E7' },
  urgent: { label: 'Urgent', color: colors.priorityUrgent, bg: colors.dangerBg },
};

const STATUS_META: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo: { label: 'To Do', color: colors.statusTodo, bg: colors.surfaceMuted },
  inprogress: { label: 'In Progress', color: colors.statusInProgress, bg: colors.primaryLight },
  review: { label: 'In Review', color: colors.statusReview, bg: '#F3E8FD' },
  done: { label: 'Done', color: colors.statusDone, bg: colors.successBg },
  cancelled: { label: 'Cancelled', color: colors.statusCancelled, bg: colors.dangerBg },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const meta = PRIORITY_META[priority];
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const meta = STATUS_META[status];
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]}>
      <Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  text: { ...typography.small, fontWeight: '700' },
});
