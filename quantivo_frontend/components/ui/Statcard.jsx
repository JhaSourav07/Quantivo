'use client';

export default function StatCard({
  title,
  value,
  trend = null,
  trendLabel = '',
  icon = null,
  accentColor = 'indigo',
  prefix = '',
  suffix = '',
}) {
  const colors = {
    indigo:  { border: 'border-indigo-500/20',  icon: 'bg-indigo-500/10 text-indigo-400',  glow: 'shadow-[0_0_24px_rgba(99,102,241,0.08)]'  },
    emerald: { border: 'border-emerald-500/20', icon: 'bg-emerald-500/10 text-emerald-400', glow: 'shadow-[0_0_24px_rgba(34,197,94,0.08)]'    },
    violet:  { border: 'border-violet-500/20',  icon: 'bg-violet-500/10 text-violet-400',   glow: 'shadow-[0_0_24px_rgba(139,92,246,0.08)]'   },
    amber:   { border: 'border-amber-500/20',   icon: 'bg-amber-500/10 text-amber-400',     glow: 'shadow-[0_0_24px_rgba(245,158,11,0.08)]'   },
    red:     { border: 'border-red-500/20',     icon: 'bg-red-500/10 text-red-400',         glow: 'shadow-[0_0_24px_rgba(239,68,68,0.08)]'    },
  };

  const c = colors[accentColor] || colors.indigo;
  const isPositive = trend > 0;
  const isNeutral  = trend === null;

  return (
    <div
      className={[
        'bg-zinc-900 rounded-xl p-5 border transition-all duration-200',
        'hover:-translate-y-1 hover:border-zinc-700',
        c.border,
        c.glow,
      ].join(' ')}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${c.icon}`}>
            {icon}
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-zinc-100 tracking-tight">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>

      {!isNeutral && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="text-xs text-zinc-600">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}