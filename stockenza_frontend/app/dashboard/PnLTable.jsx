import Skeleton from '../../components/ui/Skeleton';

export default function PnLTable({ loaded, pnlRows, isMounted, fmt, totalRevenue, totalCost, totalProfit }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-200">Profit & Loss by Product</h2>
        <p className="text-xs text-zinc-600 mt-0.5">Revenue, cost, and margin per SKU</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {['Product', 'Units Sold', 'Revenue', 'Cost', 'Profit', 'Margin'].map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {!loaded ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(6).fill(0).map((_, j) => (
                    <td key={j} className="px-5 py-4"><Skeleton className="h-4" /></td>
                  ))}
                </tr>
              ))
            ) : pnlRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-zinc-600">
                  No inventory yet — add products to see your P&amp;L
                </td>
              </tr>
            ) : (
              pnlRows.map((row, i) => (
                <tr
                  key={row._id}
                  className="hover:bg-zinc-800/30 transition-colors"
                  style={{ animation: `fadeIn 0.3s ${i * 40}ms both` }}
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{row.name}</p>
                      <p className="text-xs text-zinc-600">{row.quantity} in stock</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-zinc-400">{row.unitsSold}</td>
                  <td className="px-5 py-4 text-right text-sm text-zinc-300 tabular-nums">{isMounted ? fmt(row.revenue) : '—'}</td>
                  <td className="px-5 py-4 text-right text-sm text-zinc-500 tabular-nums">{isMounted ? fmt(row.cost) : '—'}</td>
                  <td className={`px-5 py-4 text-right text-sm font-semibold tabular-nums ${row.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isMounted ? (row.profit >= 0 ? '+' : '') + fmt(row.profit) : '—'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      row.margin >= 30 ? 'bg-emerald-500/10 text-emerald-400' :
                      row.margin >= 10 ? 'bg-amber-500/10 text-amber-400' :
                                         'bg-red-500/10 text-red-400'
                    }`}>
                      {row.margin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {loaded && pnlRows.length > 0 && (
            <tfoot>
              <tr className="border-t border-zinc-700 bg-zinc-800/30">
                <td className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Totals</td>
                <td className="px-5 py-3 text-right text-xs text-zinc-400">{pnlRows.reduce((s, r) => s + r.unitsSold, 0)}</td>
                <td className="px-5 py-3 text-right text-xs font-semibold text-zinc-300 tabular-nums">{isMounted ? fmt(totalRevenue) : '—'}</td>
                <td className="px-5 py-3 text-right text-xs text-zinc-500 tabular-nums">{isMounted ? fmt(totalCost) : '—'}</td>
                <td className={`px-5 py-3 text-right text-xs font-bold tabular-nums ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isMounted ? (totalProfit >= 0 ? '+' : '') + fmt(totalProfit) : '—'}
                </td>
                <td className="px-5 py-3 text-right text-xs text-zinc-500">
                  {totalRevenue > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}%` : '—'}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}