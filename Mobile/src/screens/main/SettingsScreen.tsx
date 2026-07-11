import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, ChevronRight, Moon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <SettingsRow label="Push notifications" sub="Task updates, mentions, meetings" value={pushEnabled} onChange={setPushEnabled} />
          <SettingsRow label="Email notifications" sub="Daily and weekly summaries" value={emailEnabled} onChange={setEmailEnabled} divider />
          <SettingsRow label="Task reminders" sub="Alerts before a task is due" value={taskReminders} onChange={setTaskReminders} divider />
        </View>

        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Moon size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Dark mode</Text>
              <Text style={styles.rowSub}>Coming soon</Text>
            </View>
            <Switch value={false} disabled trackColor={{ true: colors.primary, false: colors.border }} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.card}>
          <Pressable style={styles.row}>
            <Text style={styles.rowLabel}>Language</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>English</Text>
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </Pressable>
          <Pressable style={[styles.row, styles.divider]}>
            <Text style={styles.rowLabel}>Time zone</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>GMT+5:45 Kathmandu</Text>
              <ChevronRight size={16} color={colors.textTertiary} />
            </View>
          </Pressable>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </ScreenContainer>
  );
}

function SettingsRow({
  label,
  sub,
  value,
  onChange,
  divider,
}: {
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
  divider?: boolean;
}) {
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor={colors.white}
      />
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
  headerTitle: { ...typography.bodySemibold, color: colors.textPrimary },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: spacing.lg },
  sectionTitle: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.sm, marginTop: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm },
  divider: { borderTopWidth: 1, borderTopColor: colors.divider },
  rowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rowLabel: { ...typography.bodyMedium, color: colors.textPrimary },
  rowSub: { ...typography.caption, color: colors.textTertiary, marginTop: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  rowValue: { ...typography.body, color: colors.textTertiary, marginRight: spacing.xs },
});
