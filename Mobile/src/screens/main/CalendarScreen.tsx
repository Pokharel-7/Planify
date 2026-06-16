import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CalendarClock, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ui';
import { useEnsureWorkspaceContext } from '../../hooks/useEnsureWorkspaceContext';
import { MainStackParamList } from '../../navigation/types';
import { taskService } from '../../services/taskService';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { Task } from '../../types';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function CalendarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { workspaceId } = useEnsureWorkspaceContext();
  const today = new Date();
  const [viewDate, setViewDate] = useState(today);
  const [selectedKey, setSelectedKey] = useState(toDateKey(today.getFullYear(), today.getMonth(), today.getDate()));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const fetched = await taskService.getWorkspaceTasks(workspaceId);
      setTasks(fetched.filter((t) => !!t.dueDate));
    } catch {
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const d = new Date(t.dueDate);
      const key = toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
      map[key] = map[key] ? [...map[key], t] : [t];
    });
    return map;
  }, [tasks]);

  const weeks = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [year, month]);

  const changeMonth = (delta: number) => {
    setViewDate(new Date(year, month + delta, 1));
  };

  const selectedTasks = tasksByDate[selectedKey] ?? [];

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <Pressable style={styles.fabSmall} onPress={() => navigation.navigate('CreateTask')}>
          <Plus size={18} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.monthRow}>
        <Pressable onPress={() => changeMonth(-1)} style={styles.chevronButton} hitSlop={8}>
          <ChevronLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.monthLabel}>
          {MONTHS[month]} {year}
        </Text>
        <Pressable onPress={() => changeMonth(1)} style={styles.chevronButton} hitSlop={8}>
          <ChevronRight size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={styles.weekdayLabel}>
            {w}
          </Text>
        ))}
      </View>

      {weeks.map((row, i) => (
        <View key={i} style={styles.weekRow}>
          {row.map((d, j) => {
            if (d === null) return <View key={j} style={styles.dayCell} />;
            const key = toDateKey(year, month, d);
            const isSelected = key === selectedKey;
            const isToday = key === toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
            const hasEvents = !!tasksByDate[key];
            return (
              <Pressable key={j} style={styles.dayCell} onPress={() => setSelectedKey(key)}>
                <View style={[styles.dayCircle, isSelected && styles.dayCircleSelected, isToday && !isSelected && styles.dayCircleToday]}>
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected, isToday && !isSelected && styles.dayTextToday]}>
                    {d}
                  </Text>
                </View>
                {hasEvents ? <View style={[styles.eventDot, isSelected && { backgroundColor: colors.white }]} /> : null}
              </Pressable>
            );
          })}
        </View>
      ))}

      <View style={styles.agendaHeader}>
        <Text style={styles.agendaTitle}>
          {selectedTasks.length} {selectedTasks.length === 1 ? 'task due' : 'tasks due'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.agendaList} showsVerticalScrollIndicator={false}>
          {selectedTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <CalendarClock size={32} color={colors.textTertiary} />
              <Text style={styles.emptyText}>Nothing due this day</Text>
            </View>
          ) : (
            selectedTasks.map((t) => (
              <Pressable
                key={t._id}
                style={styles.eventCard}
                onPress={() => navigation.navigate('TaskDetail', { taskId: t._id })}
              >
                <View style={[styles.eventStripe, { backgroundColor: t.projectColor }]} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{t.title}</Text>
                  <Text style={styles.eventMeta}>{t.projectName} · Due date</Text>
                </View>
              </Pressable>
            ))
          )}
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
  fabSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.md },
  monthLabel: { ...typography.h4, color: colors.textPrimary },
  chevronButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.md },
  weekdayLabel: { flex: 1, textAlign: 'center', ...typography.small, color: colors.textTertiary, fontWeight: '700' },
  weekRow: { flexDirection: 'row', paddingHorizontal: spacing.lg },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayCircleSelected: { backgroundColor: colors.primary },
  dayCircleToday: { borderWidth: 1.5, borderColor: colors.primary },
  dayText: { ...typography.body, color: colors.textPrimary },
  dayTextSelected: { color: colors.white, fontWeight: '700' },
  dayTextToday: { color: colors.primary, fontWeight: '700' },
  eventDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 2 },
  agendaHeader: { paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  agendaTitle: { ...typography.bodySemibold, color: colors.textPrimary },
  agendaList: { paddingHorizontal: spacing.lg },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadow.sm,
  },
  eventStripe: { width: 4 },
  eventContent: { flex: 1, padding: spacing.sm },
  eventTitle: { ...typography.bodySemibold, color: colors.textPrimary },
  eventMeta: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { ...typography.body, color: colors.textTertiary, marginTop: spacing.sm },
});
