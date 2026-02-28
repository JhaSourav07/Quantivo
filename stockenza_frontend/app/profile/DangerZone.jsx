import React from 'react';
import Button from '../../components/ui/Button';

export default function DangerZone({ onLogout }) {
  return (
    <div className="bg-zinc-900 border border-red-500/20 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-red-500/10">
        <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        <p className="text-xs text-zinc-600 mt-0.5">Irreversible actions — proceed with caution</p>
      </div>
      <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-300">Sign out of Stockenza</p>
          <p className="text-xs text-zinc-600 mt-0.5">You'll need to sign back in to access your dashboard</p>
        </div>
        <Button variant="danger" onClick={onLogout}>Sign out</Button>
      </div>
    </div>
  );
}
