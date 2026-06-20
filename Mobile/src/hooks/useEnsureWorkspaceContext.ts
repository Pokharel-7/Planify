import { useEffect, useState } from 'react';
import { workspaceService } from '../services/workspaceService';
import { useAuthStore } from '../store/useAuthStore';

/**
 * On login, Planify (web) lets a user belong to multiple workspaces and pick
 * one explicitly. This mobile build auto-selects the first workspace the
 * user belongs to so screens have a workspaceId to query against — a
 * workspace switcher is a natural follow-up, not yet built.
 */
export function useEnsureWorkspaceContext() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const currentWorkspaceId = useAuthStore((s) => s.currentWorkspaceId);
  const setWorkspaceContext = useAuthStore((s) => s.setWorkspaceContext);
  const [loading, setLoading] = useState(!currentWorkspaceId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || currentWorkspaceId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    workspaceService
      .getMyWorkspaces()
      .then(async ({ data }) => {
        if (cancelled) return;
        let first = data.data[0];

        if (!first) {
          // Brand new account with no workspace yet — create one automatically
          // so the user lands as its owner instead of hitting a dead end.
          const workspaceName = user?.name ? `${user.name}'s Workspace` : 'My Workspace';
          const created = await workspaceService.createWorkspace(workspaceName);
          first = created.data.data;
          setWorkspaceContext(first._id, 'owner');
          return;
        }

        const membership = first.members.find((m) => {
          const uid = typeof m.user === 'string' ? m.user : m.user._id;
          return uid === user?._id;
        });
        const role = (membership?.role as any) ?? 'member';
        setWorkspaceContext(first._id, role);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || 'Could not load your workspace.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, currentWorkspaceId]);

  return { workspaceId: currentWorkspaceId, loading, error };
}