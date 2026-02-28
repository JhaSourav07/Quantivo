import React from 'react';

export default function PlaceholderSection({ activeSection, sections }) {
  const icon = sections.find(s => s.label === activeSection)?.icon;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl mb-4">
        {icon}
      </div>
      <p className="text-sm font-semibold text-zinc-300 mb-1">{activeSection} Settings</p>
      <p className="text-xs text-zinc-600">This section is coming soon.</p>
    </div>
  );
}