import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

/** Small sort indicator shown inside clickable header cells */
function SortIcon({ columnKey, sortConfig }) {
  if (sortConfig.key !== columnKey) {
    // Inactive: show a neutral double-arrow
    return (
      <svg className="inline-block ml-1 w-3 h-3 text-zinc-700" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5 6l3-3 3 3H5zm6 4l-3 3-3-3h6z" />
      </svg>
    );
  }
  return sortConfig.direction === 'asc' ? (
    <svg className="inline-block ml-1 w-3 h-3 text-indigo-400" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 4l4 6H4l4-6z" />
    </svg>
  ) : (
    <svg className="inline-block ml-1 w-3 h-3 text-indigo-400" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 12L4 6h8l-4 6z" />
    </svg>
  );
}

export default function InventoryTable({
  items, filtered, loaded, isMounted, fmt,
  openEdit, handleDelete, deleteId,
  sortConfig, onSort,
}) {
  const stockStatus = (qty) => {
    if (qty === 0) return { label: 'Out of stock', cls: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (qty <= 5)  return { label: 'Low stock',    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return              { label: 'In stock',       cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  // Config for each header column: label, sort key (null = not sortable), alignment
  const headers = [
    { label: 'Product',  sortKey: 'name',         align: 'left'   },
    { label: 'SKU',      sortKey: null,            align: 'left'   },
    { label: 'Category', sortKey: null,            align: 'left'   },
    { label: 'Cost',     sortKey: null,            align: 'right'  },
    { label: 'Price',    sortKey: 'sellingPrice',  align: 'right'  },
    { label: 'Margin',   sortKey: null,            align: 'right'  },
    { label: 'Stock',    sortKey: 'quantity',      align: 'center' },
    { label: 'Status',   sortKey: null,            align: 'left'   },
    { label: '',         sortKey: null,            align: ''       },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Products</h2>
          <p className="text-xs text-zinc-600 mt-0.5">{filtered.length} of {items.length} products</p>
        </div>
        {items.length > 0 && <Badge variant="default">{items.length} total</Badge>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {headers.map(({ label, sortKey, align }, i) => {
                const isSortable = !!sortKey;
                const isActive   = sortConfig.key === sortKey;
                const alignClass =
                  align === 'right'  ? 'text-right'  :
                  align === 'center' ? 'text-center' :
                  align === 'left'   ? 'text-left'   : '';

                return (
                  <th
                    key={label + i}
                    className={`px-5 py-3 text-xs font-medium uppercase tracking-wider whitespace-nowrap ${alignClass} ${
                      isSortable
                        ? 'text-zinc-500 cursor-pointer select-none hover:text-zinc-300 transition-colors'
                        : 'text-zinc-600'
                    } ${isActive ? 'text-indigo-400' : ''}`}
                    onClick={isSortable ? () => onSort(sortKey) : undefined}
                    title={isSortable ? `Sort by ${label}` : undefined}
                  >
                    {label}
                    {isSortable && (
                      <SortIcon columnKey={sortKey} sortConfig={sortConfig} />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {!loaded ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>{Array(9).fill(0).map((_, j) => (<td key={j} className="px-5 py-4"><Skeleton className="h-4" /></td>))}</tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-zinc-600">
                    <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-sm">{items.length === 0 ? 'No products yet — add your first one' : 'No products match your filters'}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item, i) => {
                const margin = ((item.sellingPrice - item.costPrice) / item.sellingPrice * 100);
                const status = stockStatus(item.quantity);
                return (
                  <tr
                    key={item._id}
                    className="hover:bg-zinc-800/30 transition-colors"
                    style={{ animation: `fadeIn 0.3s ${i * 35}ms both` }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-8 h-8 rounded-md object-cover bg-zinc-800 border border-zinc-700 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700/50 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 18h18M3 12V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v12" />
                            </svg>
                          </div>
                        )}
                        <p className="text-sm font-medium text-zinc-200">{item.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                        {item.sku || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-zinc-500">{item.category || '—'}</span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-zinc-500 tabular-nums">
                      {isMounted ? fmt(item.costPrice) : '—'}
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-zinc-300 font-medium tabular-nums">
                      {isMounted ? fmt(item.sellingPrice) : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`text-xs font-medium ${margin >= 30 ? 'text-emerald-400' : margin >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-semibold text-zinc-300">{item.quantity}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-full border ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(item)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-600 hover:text-zinc-200 hover:bg-zinc-700 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deleteId === item._id}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          {deleteId === item._id ? (
                            <span className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-red-400 rounded-full animate-spin" />
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}