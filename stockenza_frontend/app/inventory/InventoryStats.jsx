export default function InventoryStats({ items, loaded, isMounted, fmt }) {
  const totalStockValue  = items.reduce((s, i) => s + i.costPrice  * i.quantity, 0);
  const totalRetailValue = items.reduce((s, i) => s + i.sellingPrice * i.quantity, 0);
  const lowStock         = items.filter((i) => i.quantity > 0 && i.quantity <= 5).length;
  const outOfStock       = items.filter((i) => i.quantity === 0).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Total SKUs',   value: items.length,                          color: 'text-zinc-200'   },
        { label: 'Stock value',  value: isMounted ? fmt(totalStockValue)  : '—', color: 'text-indigo-400' },
        { label: 'Retail value', value: isMounted ? fmt(totalRetailValue) : '—', color: 'text-violet-400' },
        { label: 'Stock alerts', value: `${lowStock + outOfStock}`,              color: outOfStock > 0 ? 'text-red-400' : 'text-amber-400' },
      ].map((s, i) => (
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