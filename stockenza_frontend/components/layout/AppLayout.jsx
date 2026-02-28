'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();

  const [authorized,   setAuthorized]   = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  // ── Auth guard ──
  useEffect(() => {
    const token = localStorage.getItem('stockenza_token');
    if (!token) {
      router.replace('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll while mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-indigo-500 animate-spin" />
          <p className="text-xs text-zinc-600">Authenticating…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />

      {/*
        ── Main content ──
        Desktop: offset by sidebar width (lg:ml-64)
        Mobile:  full width, no offset
      */}
      <main
        className="lg:ml-64 pt-16 min-h-screen"
        style={{ animation: 'pageIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      <style jsx global>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}