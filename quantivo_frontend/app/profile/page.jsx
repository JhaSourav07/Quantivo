'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

export default function ProfilePage() {
  const router  = useRouter();
  const [user,  setUser]  = useState(null);
  const [saved, setSaved] = useState(false);
  const [form,  setForm]  = useState({ name: '', email: '' });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('quantivo_user');
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        setForm({ name: u.name || '', email: u.email || '' });
      }
    } catch {}
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleSave = (e) => {
    e.preventDefault();
    const updated = { ...user, ...form };
    localStorage.setItem('quantivo_user', JSON.stringify(updated));
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem('quantivo_token');
    localStorage.removeItem('quantivo_user');
    router.push('/login');
  };

  const SECTIONS = [
    { label: 'Account', icon: '👤' },
    { label: 'Notifications', icon: '🔔' },
    { label: 'Security', icon: '🔒' },
    { label: 'Billing', icon: '💳' },
  ];

  const [activeSection, setActiveSection] = useState('Account');

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Profile</h1>
        <p className="text-sm text-zinc-600 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">

        {/* ── Left nav ── */}
        <div className="lg:col-span-1 space-y-1">
          {/* Avatar card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3 shadow-[0_0_20px_rgba(99,102,241,0.35)]">
              {initials}
            </div>
            <p className="text-sm font-semibold text-zinc-200">{user?.name || 'User'}</p>
            <p className="text-xs text-zinc-600 mt-0.5 truncate">{user?.email || ''}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active
            </div>
          </div>

          {/* Nav items */}
          {SECTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => setActiveSection(s.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeSection === s.label
                  ? 'bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500 pl-[10px]'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 border-l-2 border-transparent pl-[10px]'
              }`}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Right content ── */}
        <div className="lg:col-span-3 space-y-5">

          {activeSection === 'Account' && (
            <>
              {/* Account info */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-200">Account Information</h2>
                  <p className="text-xs text-zinc-600 mt-0.5">Update your name and email address</p>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                  {saved && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Profile updated successfully
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Full name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                    />
                    <Input
                      label="Email address"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Save changes</Button>
                  </div>
                </form>
              </div>

              {/* Session info */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-200">Active Session</h2>
                  <p className="text-xs text-zinc-600 mt-0.5">Your current login session details</p>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { label: 'Account ID', value: user?._id ? `…${user._id.slice(-8)}` : '—' },
                    { label: 'Logged in as', value: user?.email || '—' },
                    { label: 'Session type', value: 'JWT (30 days)' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2 border-b border-zinc-800/60 last:border-0">
                      <span className="text-xs text-zinc-600">{label}</span>
                      <span className="text-xs text-zinc-400 font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="bg-zinc-900 border border-red-500/20 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-red-500/10">
                  <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
                  <p className="text-xs text-zinc-600 mt-0.5">Irreversible actions — proceed with caution</p>
                </div>
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-300">Sign out of Quantivo</p>
                    <p className="text-xs text-zinc-600 mt-0.5">You'll need to sign back in to access your dashboard</p>
                  </div>
                  <Button variant="danger" onClick={handleLogout}>
                    Sign out
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeSection !== 'Account' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl mb-4">
                {SECTIONS.find(s => s.label === activeSection)?.icon}
              </div>
              <p className="text-sm font-semibold text-zinc-300 mb-1">{activeSection} Settings</p>
              <p className="text-xs text-zinc-600">This section is coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}