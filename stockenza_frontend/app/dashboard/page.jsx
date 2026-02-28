'use client';
import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import { useCurrency } from '../../context/CurrencyContext';

// ── Animated count-up hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 1200, started = true) {
  const [value, setValue] = useState(0);
  const raf              = useRef(null);

  useEffect(() => {
    if (!started || target === 0) { setValue(target); return; }
    const start = performance.now();
    const tick  = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, started]);

  return value;
}

// ── Custom chart tooltip ───────────────────────────────────────────────────────
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

// ── Skeleton ───────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`rounded-lg bg-zinc-800 animate-pulse ${className}`} />;
}

// ── Metric card ────────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color, icon, delay = 0, loaded }) {
  return (
    <div
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3"
      style={{ animation: `fadeIn 0.5s ${delay}ms cubic-bezier(0.16,1,0.3,1) both` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      {loaded ? (
        <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
      ) : (
        <Skeleton className="h-8 w-32" />
      )}
      {sub && (
        <p className="text-xs text-zinc-600">{sub}</p>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { fmt, isMounted } = useCurrency();

  const [inventory, setInventory] = useState([]);
  const [orders,    setOrders]    = useState([]);
  const [loaded,    setLoaded]    = useState(false);

  useEffect(() => {
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
    fetchAll();
  }, []);

  // ── Derived metrics ────────────────────────────────────────────────────────
  const totalRevenue  = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalCost     = orders.reduce((s, o) => {
    return s + o.items.reduce((si, item) => {
      const product = inventory.find((i) => i._id === (item.productId?._id || item.productId));
      return si + (product ? product.costPrice * item.qty : 0);
    }, 0);
  }, 0);
  const totalProfit   = totalRevenue - totalCost;
  const stockValue    = inventory.reduce((s, i) => s + i.costPrice  * i.quantity, 0);
  const lowStockItems = inventory.filter((i) => i.quantity > 0 && i.quantity <= 5);
  const outOfStock    = inventory.filter((i) => i.quantity === 0);

  // ── Chart data — revenue + profit grouped by month ─────────────────────────
  const chartData = (() => {
    const map = {};
    orders.forEach((order) => {
      const key   = new Date(order.createdAt).toLocaleString('en-US', { month: 'short', year: '2-digit' });
      const cost  = order.items.reduce((s, item) => {
        const product = inventory.find((i) => i._id === (item.productId?._id || item.productId));
        return s + (product ? product.costPrice * item.qty : 0);
      }, 0);
      if (!map[key]) map[key] = { month: key, revenue: 0, profit: 0 };
      map[key].revenue += order.totalAmount;
      map[key].profit  += order.totalAmount - cost;
    });
    // Last 6 months, oldest first
    return Object.values(map).slice(-6);
  })();

  // ── P&L per product ────────────────────────────────────────────────────────
  const pnlRows = inventory.map((item) => {
    const itemOrders = orders.filter((o) =>
      o.items.some((i) => (i.productId?._id || i.productId) === item._id)
    );
    const unitsSold = itemOrders.reduce((s, o) =>
      s + o.items.filter((i) => (i.productId?._id || i.productId) === item._id)
              .reduce((si, i) => si + i.qty, 0), 0);
    const revenue = unitsSold * item.sellingPrice;
    const cost    = unitsSold * item.costPrice;
    const profit  = revenue - cost;
    const margin  = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { ...item, unitsSold, revenue, cost, profit, margin };
  }).sort((a, b) => b.revenue - a.revenue);

  // Animated totals
  const animRevenue = useCountUp(totalRevenue, 1200, loaded);
  const animProfit  = useCountUp(totalProfit,  1200, loaded);
  const animStock   = useCountUp(stockValue,   1200, loaded);

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-600 mt-0.5">Business overview & analytics</p>
        </div>
        {/* Currency badge — shows active currency in the top right */}
        {isMounted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-500">
            <span>Showing in</span>
            <span className="font-semibold text-zinc-300">{fmt(0).replace(/[\d,.\s]/g, '').trim() || '…'}</span>
          </div>
        )}
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total revenue"
          value={isMounted ? fmt(animRevenue) : '—'}
          sub={`${orders.length} orders total`}
          color="text-indigo-400"
          delay={0}
          loaded={loaded && isMounted}
          icon={<svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard
          label="Net profit"
          value={isMounted ? fmt(animProfit) : '—'}
          sub={totalRevenue > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margin` : 'No sales yet'}
          color={totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}
          delay={80}
          loaded={loaded && isMounted}
          icon={<svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <MetricCard
          label="Stock value"
          value={isMounted ? fmt(animStock) : '—'}
          sub={`${inventory.length} products tracked`}
          color="text-violet-400"
          delay={160}
          loaded={loaded && isMounted}
          icon={<svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
        <MetricCard
          label="Alerts"
          value={`${lowStockItems.length + outOfStock.length}`}
          sub={`${outOfStock.length} out of stock · ${lowStockItems.length} low`}
          color={outOfStock.length > 0 ? 'text-red-400' : lowStockItems.length > 0 ? 'text-amber-400' : 'text-emerald-400'}
          delay={240}
          loaded={loaded}
          icon={<svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
      </div>

      {/* ── Revenue / Profit chart ── */}
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
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} width={70} />
              <Tooltip content={<CustomTooltip fmt={fmt} />} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#gradRevenue)" dot={false} />
              <Area type="monotone" dataKey="profit"  stroke="#10b981" strokeWidth={2} fill="url(#gradProfit)"  dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── P&L table ── */}
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
    </AppLayout>
  );
}