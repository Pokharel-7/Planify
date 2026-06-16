import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Building2, Check, Mail } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState, ScreenContainer } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { ApiInvitation, invitationService } from '../../services/invitationService';
import { useAuthStore } from '../../store/useAuthStore';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'Invitations'>;

export function InvitationsScreen({ navigation }: Props) {
  const setWorkspaceContext = useAuthStore((s) => s.setWorkspaceContext);
  const [invitations, setInvitations] = useState<ApiInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await invitationService.getMyInvitations();
      setInvitations(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not load invitations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const accept = async (invite: ApiInvitation) => {
    setAcceptingId(invite._id);
    try {
      const res = await invitationService.acceptInvite(invite.token);
      const { workspace, role } = res.data.data;
      // Switch active workspace to the one just joined so the rest of the
      // app immediately reflects the new membership.
      setWorkspaceContext(workspace._id, role);
      setInvitations((prev) => prev.filter((i) => i._id !== invite._id));
      navigation.goBack();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not accept this invitation.');
    } finally {
      setAcceptingId(null);
    }
  };

  const workspaceName = (w: ApiInvitation['workspaceId']) => (typeof w === 'string' ? 'a workspace' : w.name);

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Invitations</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {invitations.length === 0 ? (
            <EmptyState icon={<Mail size={30} color={colors.textTertiary} />} title="No pending invitations" />
          ) : (
            invitations.map((inv) => (
              <View key={inv._id} style={styles.card}>
                <View style={styles.cardIcon}>
                  <Building2 size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.workspaceName}>{workspaceName(inv.workspaceId)}</Text>
                  <Text style={styles.inviteMeta}>
                    Invited by {inv.invitedBy?.name || 'a team member'} · {inv.role}
                  </Text>
                </View>
                <Pressable
                  style={styles.acceptButton}
                  onPress={() => accept(inv)}
                  disabled={acceptingId === inv._id}
                >
                  {acceptingId === inv._id ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Check size={16} color={colors.white} />
                  )}
                </Pressable>
              </View>
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
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.lg },
  errorText: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
  card: {
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
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceName: { ...typography.bodyMedium, color: colors.textPrimary },
  inviteMeta: { ...typography.caption, color: colors.textTertiary, marginTop: 1, textTransform: 'capitalize' },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});