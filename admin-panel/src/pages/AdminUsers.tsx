import { Building2, Crown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { useAdminStore } from '../store/useAdminStore';
import type { AdminUser } from '../types';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  free: 'bg-slate-100 text-slate-500 border-slate-200',
  expired: 'bg-red-50 text-red-500 border-red-200',
};

export default function AdminUsers() {
  const { users, loading, error, fetchUsers, updateSubscription } = useAdminStore();
  const [editing, setEditing] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const togglePaid = async (user: AdminUser) => {
    await updateSubscription(user._id, { isPaid: !user.subscription.isPaid });
  };

  return (
    <AppShell>
      <div className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-500">01 · Accounts</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">All users</h1>
        <p className="mt-1 text-sm text-slate-500">
          {users.length} account{users.length !== 1 ? 's' : ''} across the platform.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Workspaces</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Loading users…
                </td>
              </tr>
            )}
            {!loading &&
              users.map((u) => (
                <tr key={u._id} className="transition hover:bg-slate-50/50">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-ink">{u.name}</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-ink">
                      {u.subscription.isPaid && <Crown size={13} className="text-amber-500" />}
                      {u.subscription.planName}
                    </div>
                    {u.subscription.isPaid && (
                      <div className="font-mono text-[11px] text-slate-400">
                        {u.subscription.planBaseCurrency} {u.subscription.planPrice}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ${
                        STATUS_STYLES[u.subscription.status] || STATUS_STYLES.free
                      }`}
                    >
                      {u.subscription.status}
                    </span>
                    {u.subscription.daysRemaining !== undefined && u.subscription.isPaid && (
                      <div className="mt-1 text-[11px] text-slate-400">
                        {u.subscription.daysRemaining}d left
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Building2 size={13} />
                      {u.workspaceCount}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setEditing(u)}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-600"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <SubscriptionModal
          user={editing}
          onClose={() => setEditing(null)}
          onTogglePaid={() => togglePaid(editing)}
        />
      )}
    </AppShell>
  );
}

function SubscriptionModal({
  user,
  onClose,
  onTogglePaid,
}: {
  user: AdminUser;
  onClose: () => void;
  onTogglePaid: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onTogglePaid();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
        <h2 className="mb-1 font-display text-xl font-semibold text-ink">{user.name}</h2>
        <p className="mb-5 text-sm text-slate-400">{user.email}</p>

        <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">Current plan</div>
          <div className="font-medium text-ink">{user.subscription.planName}</div>
          <div className="mt-1 text-xs text-slate-400">
            Status: <span className="font-medium">{user.subscription.status}</span>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 ${
            user.subscription.isPaid
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-brand-500 hover:bg-brand-600'
          }`}
        >
          {loading
            ? 'Updating…'
            : user.subscription.isPaid
              ? 'Revoke paid access'
              : 'Grant paid access (30 days)'}
        </button>

        <button
          onClick={onClose}
          className="mt-2 w-full rounded-lg py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
