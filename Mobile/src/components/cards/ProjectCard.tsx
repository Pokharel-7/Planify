import { Users } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { Project } from '../../types';

export function ProjectCard({
  project,
  onPress,
  style,
}: {
  project: Project;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const progress = project.taskCount ? project.completedCount / project.taskCount : 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${project.color}1A` }]}>
          <Text style={styles.icon}>{project.icon}</Text>
        </View>
        {project.dueDate ? <Text style={styles.due}>Due {project.dueDate}</Text> : null}
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {project.name}
      </Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: project.color }]} />
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.progressLabel}>
          {project.completedCount}/{project.taskCount} tasks
        </Text>
        <View style={styles.membersRow}>
          <Users size={13} color={colors.textTertiary} />
          <Text style={styles.membersText}>{project.memberCount}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadow.sm,
  },
  pressed: { opacity: 0.85 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  iconWrap: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 18 },
  due: { ...typography.small, color: colors.textTertiary },
  name: { ...typography.bodySemibold, color: colors.textPrimary, marginBottom: spacing.sm },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.borderLight, overflow: 'hidden', marginBottom: spacing.xs },
  progressFill: { height: 6, borderRadius: 3 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressLabel: { ...typography.small, color: colors.textTertiary },
  membersRow: { flexDirection: 'row', alignItems: 'center' },
  membersText: { ...typography.small, color: colors.textTertiary, marginLeft: 3 },
});
