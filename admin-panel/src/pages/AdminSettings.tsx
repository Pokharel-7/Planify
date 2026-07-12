import { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { useAdminStore } from '../store/useAdminStore';

export default function AdminSettings() {
  const { settings, error, fetchSettings, updateSettings } = useAdminStore();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) setPhone(settings.whatsappContactNumber || '');
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateSettings(phone);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-500">03 · Settings</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">System settings</h1>
        <p className="mt-1 text-sm text-slate-500">Platform-wide configuration.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
          Support WhatsApp number
        </label>
        <p className="mb-3 text-xs text-slate-400">
          Shown to users who need help — include the country code.
        </p>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1234567890"
          className="mb-5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500"
        />

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span className="ml-3 text-sm text-emerald-600">Saved ✓</span>}
      </form>
    </AppShell>
  );
}
