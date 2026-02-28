'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/layout/AppLayout';
import { useCurrency } from '../../context/CurrencyContext';

// Import newly separated components
import ProfileSidebar from '../../app/profile/ProfileSidebar';
import AccountInformation from '../../app/profile/AccountInformation';
import CurrencyPreference from '../../app/profile/CurrencyPreference';
import ActiveSession from '../../app/profile/ActiveSession';
import DangerZone from '../../app/profile/DangerZone';
import PlaceholderSection from '../../app/profile/PlaceholderSection';

const SECTIONS = [
  { label: 'Account',       icon: '👤' },
  { label: 'Notifications', icon: '🔔' },
  { label: 'Security',      icon: '🔒' },
  { label: 'Billing',       icon: '💳' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { currency, setCurrencyCode } = useCurrency();

  // State
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const [currencySaved, setCurrencySaved] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [activeSection, setActiveSection] = useState('Account');
  const [pendingCode, setPendingCode] = useState(currency.code);

  // Sync pending code
  useEffect(() => { setPendingCode(currency.code); }, [currency.code]);

  // Load user
  useEffect(() => {
    try {
      const stored = localStorage.getItem('stockenza_user');
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        setForm({ name: u.name || '', email: u.email || '' });
      }
    } catch {}
  }, []);

  // Handlers
  const handleSave = (e) => {
    e.preventDefault();
    const updated = { ...user, ...form };
    localStorage.setItem('stockenza_user', JSON.stringify(updated));
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCurrencySave = () => {
    setCurrencyCode(pendingCode);
    setCurrencySaved(true);
    setTimeout(() => setCurrencySaved(false), 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem('stockenza_token');
    localStorage.removeItem('stockenza_user');
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Profile</h1>
        <p className="text-sm text-zinc-600 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        
        <ProfileSidebar 
          user={user}
          initials={initials}
          currency={currency}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sections={SECTIONS}
        />

        <div className="lg:col-span-3 space-y-5">
          {activeSection === 'Account' ? (
            <>
              <AccountInformation 
                form={form} 
                setForm={setForm} 
                onSave={handleSave} 
                saved={saved} 
              />
              <CurrencyPreference 
                currency={currency}
                pendingCode={pendingCode}
                setPendingCode={setPendingCode}
                onSave={handleCurrencySave}
                saved={currencySaved}
              />
              <ActiveSession user={user} />
              <DangerZone onLogout={handleLogout} />
            </>
          ) : (
            <PlaceholderSection activeSection={activeSection} sections={SECTIONS} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
