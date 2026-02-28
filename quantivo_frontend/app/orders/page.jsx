'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

function Skeleton({ className = '' }) {
  return <div className={`rounded-lg bg-zinc-800 animate-pulse ${className}`} />;
}

export default function OrdersPage() {
  const [inventory,   setInventory]   = useState([]);
  const [orders,      setOrders]      = useState([]);
  const [loaded,      setLoaded]      = useState(false);
  const [selectedId,  setSelectedId]  = useState('');
  const [quantity,    setQuantity]    = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [successId,   setSuccessId]   = useState(null); // flash last order id

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [invRes, ordRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/orders'),
      ]);
      setInventory(invRes.data);
      setOrders(ordRes.data);
    } catch (e) { console.error(e); }
    finally     { setLoaded(true); }
  };

  const selectedProduct = inventory.find((i) => i._id === selectedId);
  const totalAmount     = selectedProduct && quantity
    ? selectedProduct.sellingPrice * Number(quantity)
    : 0;
  const profit = selectedProduct && quantity
    ? (selectedProduct.sellingPrice - selectedProduct.costPrice) * Number(quantity)
    : 0;

  const handleSale = async (e) => {
    e.preventDefault();
    if (!selectedId || !quantity || Number(quantity) <= 0) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/orders', {
        items: [{ productId: selectedId, qty: Number(quantity) }],
        totalAmount,
      });
      setSuccessId(data._id);
      setTimeout(() => setSuccessId(null), 3000);
      setSelectedId('');
      setQuantity('');
      await fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete sale.');
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  /* ── Summary stats ── */
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const todayOrders  = orders.filter((o) => {
    const d = new Date(o.createdAt);
    const n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Orders & Sales</h1>
          <p className="text-sm text-zinc-600 mt-0.5">Process sales and view transaction history</p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total orders',    value: orders.length,                     color: 'text-zinc-200'   },
          { label: 'Total revenue',   value: `$${totalRevenue.toLocaleString()}`, color: 'text-indigo-400' },
          { label: 'Today\'s orders', value: todayOrders,                        color: 'text-emerald-400'},
          { label: 'Products in stock', value: inventory.filter(i=>i.quantity>0).length, color: 'text-violet-400' },
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

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left: POS form ── */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-zinc-200">New Sale</h2>
            </div>

            {/* Success flash */}
            {successId && (
              <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Sale recorded successfully!
              </div>
            )}

            <form onSubmit={handleSale} className="space-y-4">
              {/* Product selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Product</label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all cursor-pointer"
                >
                  <option value="">Select a product…</option>
                  {inventory.map((item) => (
                    <option key={item._id} value={item._id} disabled={item.quantity === 0}>
                      {item.name} — ${item.sellingPrice} {item.quantity === 0 ? '(out of stock)' : `(${item.quantity} left)`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Quantity</label>
                <input
                  type="number"
                  placeholder="1"
                  min="1"
                  max={selectedProduct?.quantity || ''}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all"
                />
                {selectedProduct && (
                  <p className="text-xs text-zinc-600">{selectedProduct.quantity} units available</p>
                )}
              </div>

              {/* Selected product info */}
              {selectedProduct && (
                <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Unit price</span>
                    <span className="text-zinc-300">${selectedProduct.sellingPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Unit cost</span>
                    <span className="text-zinc-400">${selectedProduct.costPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Unit margin</span>
                    <span className="text-emerald-400 font-semibold">
                      ${selectedProduct.sellingPrice - selectedProduct.costPrice}
                    </span>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="pt-3 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-500">Total amount</span>
                  <span className="text-xl font-bold text-indigo-400 tabular-nums">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
                {profit > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-600">Est. profit</span>
                    <span className="text-sm font-semibold text-emerald-400 tabular-nums">
                      +${profit.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitting || !selectedId || !quantity}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing…
                  </span>
                ) : 'Complete Sale'}
              </Button>
            </form>
          </div>
        </div>

        {/* ── Right: Order history ── */}
        <div className="lg:col-span-2">
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
                          {/* Order ID */}
                          <td className="px-5 py-4">
                            <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                              …{order._id.slice(-6)}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4">
                            <span className="text-xs text-zinc-500">{fmtDate(order.createdAt)}</span>
                          </td>

                          {/* Product */}
                          <td className="px-5 py-4">
                            <span className="text-sm text-zinc-300 font-medium">
                              {order.items[0]?.productId?.name || <span className="text-zinc-600 italic">Deleted product</span>}
                            </span>
                          </td>

                          {/* Qty */}
                          <td className="px-5 py-4 text-center">
                            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                              ×{order.items[0]?.qty}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-4 text-right">
                            <span className="text-sm font-semibold text-zinc-200 tabular-nums">
                              ${order.totalAmount.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {loaded && orders.length > 0 && (
              <div className="px-6 py-3 border-t border-zinc-800/60 bg-zinc-900/50 flex justify-between items-center">
                <span className="text-xs text-zinc-600">{orders.length} transactions</span>
                <span className="text-xs text-zinc-500">
                  Total: <span className="text-zinc-200 font-semibold">${totalRevenue.toLocaleString()}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}