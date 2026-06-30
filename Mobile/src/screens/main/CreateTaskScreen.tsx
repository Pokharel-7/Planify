import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, ChevronDown, Plus, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar } from '../../components/cards';
import { Button, Input, ScreenContainer } from '../../components/ui';
import { useEnsureWorkspaceContext } from '../../hooks/useEnsureWorkspaceContext';
import { MainStackParamList } from '../../navigation/types';
import { memberService } from '../../services/memberService';
import { taskService } from '../../services/taskService';
import { workspaceService } from '../../services/workspaceService';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import { Member, TaskPriority } from '../../types';

type Props = NativeStackScreenProps<MainStackParamList, 'CreateTask'>;

const PRIORITIES: { key: TaskPriority; label: string; color: string }[] = [
  { key: 'low', label: 'Low', color: colors.priorityLow },
  { key: 'medium', label: 'Medium', color: colors.priorityMedium },
  { key: 'high', label: 'High', color: colors.priorityHigh },
  { key: 'urgent', label: 'Urgent', color: colors.priorityUrgent },
];

const PROJECT_COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];
function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
}

interface ProjectOption {
  _id: string;
  name: string;
  color: string;
  icon: string;
  firstListId: string | null;
}

export function CreateTaskScreen({ navigation, route }: Props) {
  const { workspaceId } = useEnsureWorkspaceContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState<string | null>(route.params?.projectId ?? null);
  const [members, setMembers] = useState<Member[]>([]);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectError, setNewProjectError] = useState('');

  const loadWorkspaceData = async () => {
    if (!workspaceId) return;
    try {
      const [spacesRes, membersRes] = await Promise.all([
        workspaceService.getWorkspaceSpaces(workspaceId),
        memberService.getWorkspaceMembers(workspaceId),
      ]);

      const spaces = spacesRes.data?.data || [];
      const projectOptions: ProjectOption[] = await Promise.all(
        spaces.map(async (s: any) => {
          let firstListId: string | null = null;
          try {
            const metaRes = await workspaceService.getSpaceListsMetadata(s._id);
            const lists = metaRes.data?.data || [];
            firstListId = lists[0]?._id ?? null;
          } catch {
            firstListId = null;
          }
          return {
            _id: s._id,
            name: s.name,
            color: colorForId(s._id),
            icon: '📁',
            firstListId,
          };
        })
      );

      setProjects(projectOptions);
      if (!projectId && projectOptions.length > 0) {
        setProjectId(projectOptions[0]._id);
      }

      const rawMembers = membersRes.data?.data;
      const memberList = Array.isArray(rawMembers) ? rawMembers : rawMembers?.members || [];
      setMembers(
        memberList.map((m: any) => {
          const u = m.user || m;
          const initials = (u.name || '?')
            .split(' ')
            .map((p: string) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return {
            _id: u._id,
            name: u.name,
            email: u.email,
            avatarColor: colorForId(u._id),
            initials,
          };
        })
      );
    } catch {
      setError('Could not load projects and team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [workspaceId]);

  const selectedProject = projects.find((p) => p._id === projectId) ?? projects[0];

  const handleCreateProject = async () => {
    const name = newProjectName.trim();
    if (!name) {
      setNewProjectError('Give your project a name');
      return;
    }
    if (!workspaceId) return;
    setCreatingProject(true);
    setNewProjectError('');
    try {
      const res = await workspaceService.createSpace(workspaceId, name);
      const newSpace = res.data.data;
      // A brand-new space has no lists yet, and tasks can only be created
      // inside a list — so give it one default list right away instead of
      // leaving the user stuck with "no list to add the task to yet".
      await workspaceService.createList(newSpace._id, 'Tasks');
      setNewProjectName('');
      setNewProjectOpen(false);
      setLoading(true);
      await loadWorkspaceData();
      setProjectId(newSpace._id);
    } catch (err: any) {
      setNewProjectError(err?.response?.data?.message || 'Could not create the project. Please try again.');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Give the task a title');
      return;
    }
    if (!selectedProject) {
      setError('Choose or create a project first.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      // Older projects (created before lists were auto-provisioned) may
      // still have zero lists — fix that on the spot instead of blocking
      // the user with an error they can't act on from this screen.
      let listId = selectedProject.firstListId;
      if (!listId) {
        const listRes = await workspaceService.createList(selectedProject._id, 'Tasks');
        listId = listRes.data.data._id;
      }

      await taskService.createTask(listId, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        assignee: assigneeId || undefined,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      });
      navigation.goBack();
    } catch (err: any) {
      console.log('CREATE TASK ERROR:', JSON.stringify(err?.response?.data), err?.message); setError(err?.response?.data?.message || 'Could not create the task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <X size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>New task</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input
          label="Task title"
          placeholder="e.g. Design the empty state illustration"
          value={title}
          onChangeText={setTitle}
          error={error}
        />
        <Input
          label="Description (optional)"
          placeholder="Add more context..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ height: 90, textAlignVertical: 'top', paddingTop: spacing.sm }}
        />

        <View style={styles.fieldLabelRow}>
          <Text style={styles.fieldLabel}>Project</Text>
          <Pressable onPress={() => setNewProjectOpen(true)} style={styles.newProjectLink} hitSlop={8}>
            <Plus size={13} color={colors.primary} />
            <Text style={styles.newProjectLinkText}>New project</Text>
          </Pressable>
        </View>
        <View style={styles.projectPicker}>
          {projects.map((p) => (
            <Pressable
              key={p._id}
              onPress={() => setProjectId(p._id)}
              style={[styles.projectChip, projectId === p._id && { borderColor: p.color, backgroundColor: `${p.color}14` }]}
            >
              <Text style={styles.projectChipEmoji}>{p.icon}</Text>
              <Text style={[styles.projectChipLabel, projectId === p._id && { color: p.color }]} numberOfLines={1}>
                {p.name}
              </Text>
            </Pressable>
          ))}
          {projects.length === 0 && (
            <Pressable style={styles.emptyProjectCard} onPress={() => setNewProjectOpen(true)}>
              <Plus size={18} color={colors.primary} />
              <Text style={styles.emptyProjectText}>Create your first project</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.fieldLabel}>Priority</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => (
            <Pressable
              key={p.key}
              onPress={() => setPriority(p.key)}
              style={[styles.priorityChip, priority === p.key && { backgroundColor: p.color }]}
            >
              <Text style={[styles.priorityLabel, priority === p.key && { color: colors.white }]}>{p.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Assignee</Text>
        <View style={styles.assigneeRow}>
          {members.map((m) => (
            <Pressable
              key={m._id}
              onPress={() => setAssigneeId(assigneeId === m._id ? null : m._id)}
              style={[styles.assigneePill, assigneeId === m._id && styles.assigneePillActive]}
            >
              <Avatar member={m} size={24} />
              <Text style={[styles.assigneePillText, assigneeId === m._id && styles.assigneePillTextActive]}>
                {m.name.split(' ')[0]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Due date</Text>
        <Pressable style={styles.dateRow} onPress={() => setShowDatePicker(true)}>
          <Calendar size={18} color={colors.textTertiary} />
          <Text style={[styles.dateText, dueDate && styles.dateTextSet]}>
            {dueDate ? dueDate.toLocaleDateString() : 'Set a due date'}
          </Text>
          <ChevronDown size={16} color={colors.textTertiary} style={{ marginLeft: 'auto' }} />
        </Pressable>
        {dueDate && (
          <Pressable onPress={() => setDueDate(null)} hitSlop={8}>
            <Text style={styles.clearDate}>Clear date</Text>
          </Pressable>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (event.type === 'set' && selectedDate) {
                setDueDate(selectedDate);
              }
              if (Platform.OS === 'android') {
                setShowDatePicker(false);
              }
            }}
          />
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Create task" onPress={handleCreate} loading={submitting} />
      </View>

      <Modal visible={newProjectOpen} transparent animationType="fade" onRequestClose={() => setNewProjectOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New project</Text>
              <Pressable onPress={() => setNewProjectOpen(false)} hitSlop={8}>
                <X size={18} color={colors.textTertiary} />
              </Pressable>
            </View>

            {newProjectError ? <Text style={styles.errorText}>{newProjectError}</Text> : null}

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Website Redesign"
              placeholderTextColor={colors.textTertiary}
              value={newProjectName}
              onChangeText={setNewProjectName}
              autoFocus
            />

            <Button label="Create project" onPress={handleCreateProject} loading={creatingProject} style={{ marginTop: spacing.md }} />
          </View>
        </View>
      </Modal>
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
  emptyText: { ...typography.caption, color: colors.textTertiary },
  content: { paddingHorizontal: spacing.lg },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs, marginBottom: spacing.sm },
  fieldLabel: { ...typography.label, color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.xs },
  newProjectLink: { flexDirection: 'row', alignItems: 'center' },
  newProjectLinkText: { ...typography.captionMedium, color: colors.primary, marginLeft: 2 },
  projectPicker: { marginBottom: spacing.lg },
  projectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  projectChipEmoji: { fontSize: 16, marginRight: spacing.xs },
  projectChipLabel: { ...typography.bodyMedium, color: colors.textPrimary, flexShrink: 1 },
  emptyProjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  emptyProjectText: { ...typography.bodyMedium, color: colors.primary, marginLeft: spacing.xs },
  priorityRow: { flexDirection: 'row', marginBottom: spacing.lg },
  priorityChip: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  priorityLabel: { ...typography.captionMedium, color: colors.textSecondary },
  assigneeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg },
  assigneePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  assigneePillActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  assigneePillText: { ...typography.captionMedium, color: colors.textSecondary, marginLeft: spacing.xxs },
  assigneePillTextActive: { color: colors.primaryDark },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 50,
    paddingHorizontal: spacing.md,
  },
  dateText: { ...typography.body, color: colors.textTertiary, marginLeft: spacing.sm },
  dateTextSet: { color: colors.textPrimary },
  clearDate: { ...typography.captionMedium, color: colors.danger, marginTop: spacing.xs },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadow.md,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard: { width: '100%', backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, ...shadow.lg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  modalTitle: { ...typography.h3, color: colors.textPrimary },
  errorText: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
  modalInput: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
});



