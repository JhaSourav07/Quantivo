import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AccountInformation({ form, setForm, onSave, saved, error }) {
  const [showPwFields, setShowPwFields] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-200">Account Information</h2>
        <p className="text-xs text-zinc-600 mt-0.5">Update your display name and password</p>
      </div>

      <form onSubmit={onSave} className="p-6 space-y-4">
        {/* Success banner */}
        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Profile updated successfully
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Name (editable) + Email (read-only) */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Email address</label>
            <div className="px-3 py-2.5 rounded-lg bg-zinc-800/40 border border-zinc-700/50 text-sm text-zinc-500 cursor-not-allowed select-none">
              {form.email}
            </div>
            <p className="text-[10px] text-zinc-700">Email cannot be changed</p>
          </div>
        </div>

        {/* Password change toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowPwFields(v => !v)}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showPwFields ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {showPwFields ? 'Cancel password change' : 'Change password'}
          </button>
        </div>

        {showPwFields && (
          <div className="grid sm:grid-cols-2 gap-4 pt-1 border-t border-zinc-800">
            <Input
              label="Current password"
              type="password"
              value={form.currentPassword || ''}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              placeholder="Enter current password"
            />
            <Input
              label="New password"
              type="password"
              value={form.newPassword || ''}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Min 6 characters"
            />
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  );
}