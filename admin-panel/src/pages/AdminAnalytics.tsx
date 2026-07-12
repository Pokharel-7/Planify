import { CreditCard, TrendingUp, UserCheck, Users } from 'lucide-react';
import { useEffect } from 'react';
import { AppShell } from '../components/AppShell';
import { useAdminStore } from '../store/useAdminStore';

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
        <Icon size={16} />
      </div>
      <div className="font-display text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-0.5 text-xs uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}

export default function AdminAnalytics() {
  const { analytics, loading, error, fetchAnalytics } = useAdminStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const maxSignups = analytics
    ? Math.max(...analytics.signupData.map((d) => d.count), 1)
    : 1;

  return (
    <AppShell>
      <div className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-500">02 · Analytics</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Platform overview</h1>
        <p className="mt-1 text-sm text-slate-500">Revenue and growth metrics across all workspaces.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && <div className="text-sm text-slate-400">Loading analytics…</div>}

      {analytics && (
        <>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={CreditCard}
              label="Total revenue"
              value={`${analytics.revenueBaseCurrency} ${analytics.totalRevenue.toLocaleString()}`}
              accent="bg-brand-50 text-brand-500"
            />
            <StatCard
              icon={Users}
              label="Total users"
              value={analytics.metrics.totalUsers}
              accent="bg-slate-100 text-slate-500"
            />
            <StatCard
              icon={UserCheck}
              label="Paid users"
              value={analytics.metrics.paidUsers}
              accent="bg-emerald-50 text-emerald-500"
            />
            <StatCard
              icon={TrendingUp}
              label="Conversion"
              value={`${analytics.conversionRate}%`}
              accent="bg-clay/10 text-clay"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Signups — last 12 weeks
            </h2>
            <div className="mt-5 flex items-end gap-1.5" style={{ height: 160 }}>
              {analytics.signupData.length === 0 && (
                <div className="flex w-full items-center justify-center text-sm text-slate-300">
                  No signup data yet
                </div>
              )}
              {analytics.signupData.map((d, i) => (
                <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
                  <div className="relative w-full">
                    <div
                      className="w-full rounded-t-sm bg-brand-500 transition group-hover:bg-brand-600"
                      style={{ height: `${Math.max((d.count / maxSignups) * 130, 3)}px` }}
                    />
                    <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-ink px-1.5 py-0.5 font-mono text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                      {d.count}
                    </div>
                  </div>
                  <div className="font-mono text-[9px] text-slate-300">{d.week.replace('Week ', 'W')}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
