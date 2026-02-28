import React from 'react';

export default function ActiveSession({ user }) {
  const sessionDetails = [
    { label: 'Account ID',   value: user?._id ? `…${user._id.slice(-8)}` : '—' },
    { label: 'Logged in as', value: user?.email || '—' },
    { label: 'Session type', value: 'JWT (30 days)' },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-200">Active Session</h2>
        <p className="text-xs text-zinc-600 mt-0.5">Your current login session details</p>
      </div>
      <div className="p-6 space-y-3">
        {sessionDetails.map(({ label, value }) => (
          <div key={label} className="flex justify-between py-2 border-b border-zinc-800/60 last:border-0">
            <span className="text-xs text-zinc-600">{label}</span>
            <span className="text-xs text-zinc-400 font-mono">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}