import React from 'react';

export default function ProfileSidebar({ user, initials, currency, activeSection, setActiveSection, sections }) {
  return (
    <div className="lg:col-span-1 space-y-1">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3 shadow-[0_0_20px_rgba(99,102,241,0.35)]">
          {initials}
        </div>
        <p className="text-sm font-semibold text-zinc-200">{user?.name || 'User'}</p>
        <p className="text-xs text-zinc-600 mt-0.5 truncate">{user?.email || ''}</p>

        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Active
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium">
            <span>{currency.flag}</span>
            <span>{currency.code}</span>
          </div>
        </div>
      </div>

      {sections.map((s) => (
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
  );
}
