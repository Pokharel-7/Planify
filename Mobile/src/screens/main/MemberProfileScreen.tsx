import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, TaskCard } from '../../components/cards';
import { ScreenContainer } from '../../components/ui';
import { allTasks, members } from '../../data/mockData';
import { MainStackParamList } from '../../navigation/types';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'MemberProfile'>;

export function MemberProfileScreen({ navigation, route }: Props) {
  const member = members.find((m) => m._id === route.params.memberId) ?? members[0];
  const memberTasks = allTasks.filter((t) => t.assignee?._id === member._id);

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Member profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Avatar member={member} size={88} />
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.email}>{member.email}</Text>

          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton}>
              <MessageCircle size={16} color={colors.primary} />
              <Text style={styles.actionText}>Message</Text>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Mail size={16} color={colors.primary} />
              <Text style={styles.actionText}>Email</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{memberTasks.length}</Text>
            <Text style={styles.statLabel}>Assigned tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{memberTasks.filter((t) => t.status === 'done').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Assigned tasks</Text>
        {memberTasks.length ? (
          memberTasks.map((t) => (
            <TaskCard key={t._id} task={t} onPress={() => navigation.navigate('TaskDetail', { taskId: t._id })} />
          ))
        ) : (
          <Text style={styles.emptyText}>No tasks assigned yet.</Text>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
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
  content: { paddingHorizontal: spacing.lg },
  profileSection: { alignItems: 'center', marginBottom: spacing.xl },
  name: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.md },
  email: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  actionRow: { flexDirection: 'row', marginTop: spacing.md },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  actionText: { ...typography.captionMedium, color: colors.primaryDark, marginLeft: spacing.xxs },
  statsRow: { flexDirection: 'row', marginBottom: spacing.xl },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    ...shadow.sm,
  },
  statValue: { ...typography.h3, color: colors.textPrimary },
  statLabel: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  sectionTitle: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.sm },
  emptyText: { ...typography.body, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.lg },
});
