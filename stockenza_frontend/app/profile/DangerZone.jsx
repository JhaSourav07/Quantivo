'use client';
import { useState } from 'react';
import Button from '../../components/ui/Button';

export default function DangerZone({ onLogout, onResetData }) {
  // Two-step confirmation state for the destructive reset action
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting,    setResetting]    = useState(false);
  const [resetDone,    setResetDone]    = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await onResetData();
      setResetDone(true);
      setConfirmReset(false);
      setTimeout(() => setResetDone(false), 3500);
    } catch {
      // error is handled + alerted inside onResetData
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-red-500/20 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="px-6 py-4 border-b border-red-500/10">
        <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        <p className="text-xs text-zinc-600 mt-0.5">Irreversible actions — proceed with caution</p>
      </div>

      {/* ── Row 1: Reset business data ── */}
      <div className="px-6 py-5 border-b border-zinc-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-300">Reset all business data</p>
            <p className="text-xs text-zinc-600 mt-0.5">
              Permanently deletes all inventory, orders &amp; revenue records.
              Your account, email, and password remain intact.
            </p>
          </div>

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="shrink-0 px-4 py-2 text-xs font-semibold rounded-lg border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/50 transition-all"
            >
              Reset data
            </button>
          ) : (
            /* Inline two-step confirmation */
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <p className="text-xs text-amber-400 font-medium sm:max-w-[160px] text-center sm:text-right">
                This cannot be undone. Are you sure?
              </p>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resetting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Yes, delete everything'
                )}
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                disabled={resetting}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Success banner */}
        {resetDone && (
          <div className="mt-3 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs text-emerald-400 font-medium">
              All business data deleted successfully. Your account is untouched.
            </p>
          </div>
        )}
      </div>

      {/* ── Row 2: Sign out ── */}
      <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-300">Sign out of Stockenza</p>
          <p className="text-xs text-zinc-600 mt-0.5">You'll need to sign back in to access your dashboard</p>
        </div>
        <Button variant="danger" onClick={onLogout} className="shrink-0">Sign out</Button>
      </div>
    </div>
  );
}
