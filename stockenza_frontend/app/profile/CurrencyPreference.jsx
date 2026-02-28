import React from 'react';
import Button from '../../components/ui/Button';
import CurrencyCard from './CurrencyCard';
import { CURRENCIES, formatCurrency } from '../../lib/currencies';

export default function CurrencyPreference({ currency, pendingCode, setPendingCode, onSave, saved }) {
  const pendingCurrency = CURRENCIES.find((c) => c.code === pendingCode);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">Currency Preference</h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              All prices, revenue, and profit figures across the dashboard will display in your chosen currency
            </p>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 shrink-0">
            <span className="text-lg leading-none">{pendingCurrency?.flag}</span>
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium leading-none mb-0.5">Preview</p>
              <p className="text-sm font-bold text-indigo-400 font-mono leading-none">
                {formatCurrency(1234.5, pendingCode)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Currency updated — all figures now show in {currency.name} ({currency.symbol})
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {CURRENCIES.map((c) => (
            <CurrencyCard
              key={c.code}
              currency={c}
              selected={pendingCode}
              onSelect={setPendingCode}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 gap-4 flex-wrap">
          <p className="text-xs text-zinc-600">
            {pendingCode !== currency.code
              ? <>Unsaved change — will apply <span className="text-zinc-400 font-medium">{pendingCurrency?.name}</span> site-wide</>
              : <>Currently using <span className="text-zinc-400 font-medium">{currency.flag} {currency.name}</span></>
            }
          </p>
          <Button
            onClick={onSave}
            disabled={pendingCode === currency.code}
          >
            Save preference
          </Button>
        </div>
      </div>
    </div>
  );
}
