import Badge from '../../components/ui/Badge';
import { useCurrency } from '../../context/CurrencyContext';

// Internal skeleton loader for the table
function Skeleton({ className = '' }) {
  return <div className={`rounded-lg bg-zinc-800 animate-pulse ${className}`} />;
}

export default function OrderHistoryTable({ orders, loaded, totalRevenue, successId, fmtDate }) {
  const { fmt } = useCurrency();
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Transaction History</h2>
          <p className="text-xs text-zinc-600 mt-0.5">{orders.length} orders total</p>
        </div>
        {orders.length > 0 && (
          <Badge variant="primary">{orders.length} total</Badge>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {['Order ID', 'Date', 'Item', 'Qty', 'Amount'].map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider ${
                    i === 0 || i === 1 || i === 2 ? 'text-left' : i === 4 ? 'text-right' : 'text-center'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {!loaded ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(5).fill(0).map((_, j) => (
                    <td key={j} className="px-5 py-4"><Skeleton className="h-4" /></td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-zinc-600">
                    <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">No orders yet — make your first sale</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order, i) => {
                const isNew = order._id === successId;
                return (
                  <tr
                    key={order._id}
                    className={`transition-all hover:bg-zinc-800/30 ${isNew ? 'bg-emerald-500/5' : ''}`}
                    style={{ animation: `fadeIn 0.3s ${i * 40}ms both` }}
                  >
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                        …{order._id.slice(-6)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-zinc-500">{fmtDate(order.createdAt)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-zinc-300 font-medium">
                        {order.items[0]?.productId?.name || <span className="text-zinc-600 italic">Deleted product</span>}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                        ×{order.items[0]?.qty}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-zinc-200 tabular-nums">
                        {fmt(order.totalAmount)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {loaded && orders.length > 0 && (
        <div className="px-6 py-3 border-t border-zinc-800/60 bg-zinc-900/50 flex justify-between items-center">
          <span className="text-xs text-zinc-600">{orders.length} transactions</span>
          <span className="text-xs text-zinc-500">
            Total: <span className="text-zinc-200 font-semibold">{fmt(totalRevenue)}</span>
          </span>
        </div>
      )}
    </div>
  );
}