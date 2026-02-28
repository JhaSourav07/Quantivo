import React from 'react';

export default function CurrencyCard({ currency, selected, onSelect }) {
  const isSelected = selected === currency.code;
  
  return (
    <button
      onClick={() => onSelect(currency.code)}
      className={[
        'relative flex items-center gap-3 px-4 py-3 rounded-xl border text-left',
        'transition-all duration-150 group w-full',
        isSelected
          ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]'
          : 'bg-zinc-800/40 border-zinc-700/60 hover:border-zinc-600 hover:bg-zinc-800/70',
      ].join(' ')}
    >
      <span className="text-xl shrink-0 leading-none">{currency.flag}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-indigo-300' : 'text-zinc-200'}`}>
          {currency.symbol} · {currency.code}
        </p>
        <p className="text-xs text-zinc-500 truncate">{currency.name}</p>
      </div>
      {isSelected && (
        <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  );
}
