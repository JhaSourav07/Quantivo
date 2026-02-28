import React from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AccountInformation({ form, setForm, onSave, saved }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-200">Account Information</h2>
        <p className="text-xs text-zinc-600 mt-0.5">Update your name and email address</p>
      </div>
      <form onSubmit={onSave} className="p-6 space-y-4">
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
  );
}