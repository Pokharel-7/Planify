import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, RefreshCw, Users, UserPlus, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, EmptyState, ScreenContainer, Skeleton } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { invitationService } from '../../services/invitationService';
import { memberService } from '../../services/memberService';
import { useAuthStore } from '../../store/useAuthStore';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'TeamMembers'>;

interface Row {
  _id: string;
  name: string;
  email: string;
  role: string;
  isOwner?: boolean;
  pending?: boolean;
}

export function TeamMembersScreen({ navigation }: Props) {
  const workspaceId = useAuthStore((s) => s.currentWorkspaceId);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError('');
    try {
      const [membersRes, invitesRes] = await Promise.all([
        memberService.getWorkspaceMembers(workspaceId),
        invitationService.getWorkspaceInvitations(workspaceId).catch(() => ({ data: { data: [] } })),
      ]);

      const raw = membersRes.data.data;
      const memberList = Array.isArray(raw) ? raw : (raw as any)?.members || [];

      const memberRows: Row[] = memberList.map((m: any) => ({
        _id: m._id,
        name: m.name,
        email: m.email,
        role: m.role,
        isOwner: m.isOwner,
      }));

      const pendingRows: Row[] = (invitesRes.data.data || [])
        .filter((inv: any) => inv.status === 'pending')
        .map((inv: any) => ({
          _id: inv._id,
          name: inv.email,
          email: inv.email,
          role: inv.role,
          pending: true,
        }));

      setRows([...memberRows, ...pendingRows]);
    } catch (err: any) {
      console.log('TEAM LOAD ERROR:', JSON.stringify(err?.response?.data), err?.message); setError(err?.response?.data?.message || 'Could not load team members.');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

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
        <Text style={styles.title}>Team</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.inviteRow} onPress={() => setInviteOpen(true)}>
          <View style={styles.inviteIcon}>
            <UserPlus size={16} color={colors.primary} />
          </View>
          <Text style={styles.inviteText}>Invite a member</Text>
        </Pressable>

        {!workspaceId || loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} width="100%" height={64} style={{ marginBottom: spacing.xs }} />)
        ) : error ? (
          <EmptyState
            icon={<RefreshCw size={30} color={colors.textTertiary} />}
            title="Couldn't load team"
            description={error}
            actionLabel="Retry"
            onAction={load}
          />
        ) : rows.length === 0 ? (
          <EmptyState icon={<Users size={30} color={colors.textTertiary} />} title="No team members yet" />
        ) : (
          rows.map((m, i) => (
            <Pressable
              key={m._id ?? i}
              style={[styles.row, m.pending && styles.rowPending]}
              disabled={m.pending}
              onPress={() => navigation.navigate('MemberProfile', { memberId: m._id })}
            >
              <View style={[styles.avatar, m.pending && styles.avatarPending]}>
                <Text style={styles.avatarInitials}>{(m.name || 'U').slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.name}>{m.pending ? m.email : m.name}</Text>
                <Text style={styles.email}>{m.pending ? 'Invitation sent' : m.email}</Text>
              </View>
              <View style={[styles.roleBadge, m.pending && styles.pendingBadge]}>
                <Text style={[styles.roleText, m.pending && styles.pendingText]}>
                  {m.pending ? 'pending' : m.isOwner ? 'owner' : m.role}
                </Text>
              </View>
            </Pressable>
          ))
        )}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>

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
  content: { paddingHorizontal: spacing.lg },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  inviteIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  inviteText: { ...typography.bodySemibold, color: colors.primaryDark },
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
  rowPending: { opacity: 0.7, borderStyle: 'dashed' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarPending: { backgroundColor: colors.textTertiary },
  avatarInitials: { ...typography.bodyMedium, color: colors.white, fontWeight: '700' },
  name: { ...typography.bodyMedium, color: colors.textPrimary },
  email: { ...typography.caption, color: colors.textTertiary, marginTop: 1 },
  roleBadge: { backgroundColor: colors.surfaceMuted, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  pendingBadge: { backgroundColor: colors.warningBg },
  roleText: { ...typography.small, color: colors.textSecondary, fontWeight: '700' },
  pendingText: { color: colors.warning },
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
