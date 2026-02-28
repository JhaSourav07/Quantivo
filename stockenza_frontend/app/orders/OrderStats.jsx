import { useCurrency } from '../../context/CurrencyContext';

export default function OrderStats({ orders, totalRevenue, todayOrders, inventory, loaded }) {
  const { fmt } = useCurrency();
  const stats = [
    { label: 'Total orders',      value: orders.length,                                        color: 'text-zinc-200' },
    { label: 'Total revenue',     value: fmt(totalRevenue),                                    color: 'text-indigo-400' },
    { label: "Today's orders",    value: todayOrders,                                          color: 'text-emerald-400' },
    { label: 'Products in stock', value: inventory.filter(i => i.quantity > 0).length,         color: 'text-violet-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
          style={{ animation: `fadeIn 0.4s ${i * 60}ms both` }}
        >
          <p className="text-xs text-zinc-600 mb-1">{s.label}</p>
          <p className={`text-lg font-bold ${s.color}`}>{loaded ? s.value : '—'}</p>
        </div>
      ))}
    </div>
  );
}