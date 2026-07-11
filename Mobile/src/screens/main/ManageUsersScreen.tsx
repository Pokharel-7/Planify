import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar } from '../../components/cards';
import { Button, ScreenContainer, SearchBar } from '../../components/ui';
import { useEnsureWorkspaceContext } from '../../hooks/useEnsureWorkspaceContext';
import { MainStackParamList } from '../../navigation/types';
import { memberService } from '../../services/memberService';
import { invitationService } from '../../services/invitationService';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'ManageUsers'>;

interface MemberRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  initials: string;
}

const PROJECT_COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];
function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
}

export function ManageUsersScreen({ navigation }: Props) {
  const { workspaceId } = useEnsureWorkspaceContext();
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const load = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await memberService.getWorkspaceMembers(workspaceId);
      const raw = res.data?.data;
      const list = Array.isArray(raw) ? raw : raw?.members || [];
      setMembers(
        list.map((m: any) => {
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
            role: m.role || 'member',
            avatarColor: colorForId(u._id),
            initials,
          };
        })
      );
    } catch {
      // Leave whatever was previously loaded
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = members.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));

  const sendInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) {
      setInviteError('Enter an email address');
      return;
    }
    if (!workspaceId) return;
    setInviting(true);
    setInviteError('');
    try {
      await invitationService.sendInvite(workspaceId, email, 'member');
      setInviteEmail('');
      setInviteOpen(false);
      load();
    } catch (err: any) {
      setInviteError(err?.response?.data?.message || 'Could not send invite. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Manage users</Text>
        <Pressable onPress={() => setInviteOpen(true)} style={styles.iconButton} hitSlop={8}>
          <Plus size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search users" />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 && <Text style={styles.emptyText}>No members yet — invite someone to get started.</Text>}
          {filtered.map((m) => (
            <View key={m._id} style={styles.row}>
              <Avatar member={m} size={40} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.name}>{m.name}</Text>
                <Text style={styles.email}>{m.email}</Text>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{m.role}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}

      <Modal visible={inviteOpen} transparent animationType="fade" onRequestClose={() => setInviteOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite a member</Text>
              <Pressable onPress={() => setInviteOpen(false)} hitSlop={8}>
                <X size={18} color={colors.textTertiary} />
              </Pressable>
            </View>

            {inviteError ? <Text style={styles.errorText}>{inviteError}</Text> : null}

            <TextInput
              style={styles.modalInput}
              placeholder="teammate@company.com"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              keyboardType="email-address"
              value={inviteEmail}
              onChangeText={setInviteEmail}
            />

            <Button label="Send invite" onPress={sendInvite} loading={inviting} style={{ marginTop: spacing.md }} />
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
  title: { ...typography.h3, color: colors.textPrimary },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.caption, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xl },
  list: { paddingHorizontal: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    ...shadow.sm,
  },
  name: { ...typography.bodyMedium, color: colors.textPrimary },
  email: { ...typography.caption, color: colors.textTertiary, marginTop: 1 },
  roleBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    backgroundColor: colors.surfaceMuted,
  },
  roleText: { ...typography.small, fontWeight: '700', color: colors.textSecondary, textTransform: 'capitalize' },
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