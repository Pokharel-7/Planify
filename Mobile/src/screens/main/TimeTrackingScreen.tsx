import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Pause, Play, Square } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ui';
import { timeEntries } from '../../data/mockData';
import { MainStackParamList } from '../../navigation/types';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'TimeTracking'>;

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function TimeTrackingScreen({ navigation }: Props) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const stop = () => {
    setRunning(false);
    setSeconds(0);
  };

  const todayEntries = timeEntries.filter((e) => e.date === 'Today');
  const yesterdayEntries = timeEntries.filter((e) => e.date === 'Yesterday');
  const todayTotal = todayEntries.reduce((sum, e) => sum + e.durationMinutes, 0);

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Time Tracking</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.timerCard}>
        <Text style={styles.timerLabel}>{running ? 'Finalize onboarding wireframes' : 'No active timer'}</Text>
        <Text style={styles.timerValue}>{formatDuration(seconds)}</Text>
        <View style={styles.timerControls}>
          {running ? (
            <>
              <Pressable style={styles.controlButtonSecondary} onPress={() => setRunning(false)}>
                <Pause size={20} color={colors.textPrimary} />
              </Pressable>
              <Pressable style={styles.controlButtonDanger} onPress={stop}>
                <Square size={18} color={colors.white} />
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.controlButtonPrimary} onPress={() => setRunning(true)}>
              <Play size={22} color={colors.white} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{(todayTotal / 60).toFixed(1)}h</Text>
          <Text style={styles.summaryLabel}>Today</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>18.5h</Text>
          <Text style={styles.summaryLabel}>This week</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>72h</Text>
          <Text style={styles.summaryLabel}>This month</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.historyList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Today</Text>
        {todayEntries.map((e) => (
          <TimeEntryRow key={e._id} entry={e} />
        ))}
        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Yesterday</Text>
        {yesterdayEntries.map((e) => (
          <TimeEntryRow key={e._id} entry={e} />
        ))}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </ScreenContainer>
  );
}

function TimeEntryRow({ entry }: { entry: (typeof timeEntries)[number] }) {
  const hours = Math.floor(entry.durationMinutes / 60);
  const mins = entry.durationMinutes % 60;
  return (
    <View style={styles.entryRow}>
      <View style={[styles.entryStripe, { backgroundColor: entry.projectColor }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.entryTitle} numberOfLines={1}>
          {entry.taskTitle}
        </Text>
        <Text style={styles.entryProject}>{entry.projectName}</Text>
      </View>
      <Text style={styles.entryDuration}>
        {hours > 0 ? `${hours}h ` : ''}{mins}m
      </Text>
    </View>
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
  title: { ...typography.h3, color: colors.textPrimary },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadow.sm,
  },
  timerLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  timerValue: { fontSize: 42, fontWeight: '700', color: colors.textPrimary, letterSpacing: 1, marginBottom: spacing.lg },
  timerControls: { flexDirection: 'row', alignItems: 'center' },
  controlButtonPrimary: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonSecondary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  controlButtonDanger: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  summaryValue: { ...typography.h4, color: colors.textPrimary },
  summaryLabel: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  historyList: { padding: spacing.lg },
  sectionTitle: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.sm },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  entryStripe: { width: 4, height: '100%', borderRadius: 2, marginRight: spacing.sm },
  entryTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  entryProject: { ...typography.caption, color: colors.textTertiary, marginTop: 1 },
  entryDuration: { ...typography.bodySemibold, color: colors.textPrimary },
});
