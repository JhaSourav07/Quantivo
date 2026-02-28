import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from '../../components/ui/Skeleton';

function CustomTooltip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-zinc-500 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-400 capitalize">{p.dataKey}:</span>
          <span className="font-semibold text-zinc-100">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function RevenueProfitChart({ loaded, chartData, fmt }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Revenue & Profit</h2>
          <p className="text-xs text-zinc-600 mt-0.5">Monthly performance breakdown</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />Revenue</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Profit</span>
        </div>
      </div>

      {!loaded ? (
        <Skeleton className="h-52 w-full" />
      ) : chartData.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-zinc-600 text-sm">
          No orders yet — make your first sale to see trends
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} width={70} />
            <Tooltip content={<CustomTooltip fmt={fmt} />} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#gradRevenue)" dot={false} />
            <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="url(#gradProfit)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}