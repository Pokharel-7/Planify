import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { colors, radius, spacing, typography } from '../../theme';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

const STATUS_ORDER: TaskStatus[] = ['todo', 'inprogress', 'review', 'done'];
const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do',
  inprogress: 'In Progress',
  review: 'In Review',
  done: 'Done',
  cancelled: 'Cancelled',
};

interface Props {
  task: Task;
  onPress?: () => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export function SwipeableTaskCard({ task, onPress, onStatusChange }: Props) {
  const swipeableRef = useRef<Swipeable>(null);
  const currentIndex = STATUS_ORDER.indexOf(task.status);
  const nextStatus = currentIndex >= 0 && currentIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIndex + 1] : null;
  const prevStatus = currentIndex > 0 ? STATUS_ORDER[currentIndex - 1] : null;

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>) => {
    if (!prevStatus) return null;
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1], extrapolate: 'clamp' });
    return (
      <View style={[styles.actionWrap, styles.leftAction]}>
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          <ArrowLeft size={18} color={colors.white} />
          <Text style={styles.actionText}>{STATUS_LABEL[prevStatus]}</Text>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    if (!nextStatus) return null;
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1], extrapolate: 'clamp' });
    return (
      <View style={[styles.actionWrap, styles.rightAction]}>
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          <Text style={styles.actionText}>{STATUS_LABEL[nextStatus]}</Text>
          <ArrowRight size={18} color={colors.white} />
        </Animated.View>
      </View>
    );
  };

  const handleSwipeableOpen = (direction: 'left' | 'right') => {
    swipeableRef.current?.close();
    if (direction === 'right' && nextStatus) {
      onStatusChange(task._id, nextStatus);
    } else if (direction === 'left' && prevStatus) {
      onStatusChange(task._id, prevStatus);
    }
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={prevStatus ? renderLeftActions : undefined}
      renderRightActions={nextStatus ? renderRightActions : undefined}
      onSwipeableOpen={handleSwipeableOpen}
      overshootLeft={false}
      overshootRight={false}
    >
      <TaskCard task={task} onPress={onPress} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionWrap: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  leftAction: {
    backgroundColor: colors.warning,
    alignItems: 'flex-start',
    paddingLeft: spacing.md,
  },
  rightAction: {
    backgroundColor: colors.success,
    alignItems: 'flex-end',
    paddingRight: spacing.md,
  },
  actionContent: { flexDirection: 'row', alignItems: 'center' },
  actionText: { ...typography.captionMedium, color: colors.white, marginHorizontal: spacing.xs },
});
