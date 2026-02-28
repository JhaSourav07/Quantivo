'use client';
import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import ProfitChart from '../../components/charts/ProfitChart';
import Badge from '../../components/ui/Badge';

/* ── Animated counter hook ── */
function useCountUp(target, duration = 1000, enabled = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled || !target) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, enabled]);
  return value;
}

/* ── Stat card with count-up ── */
function MetricCard({ title, value, prefix = '$', icon, accentColor, trend, trendLabel, loaded }) {
  const animated = useCountUp(value, 900, loaded);

  const colors = {
    indigo:  { border: 'border-indigo-500/15',  iconBg: 'bg-indigo-500/10 text-indigo-400',  bar: 'bg-indigo-500' },
    emerald: { border: 'border-emerald-500/15', iconBg: 'bg-emerald-500/10 text-emerald-400', bar: 'bg-emerald-500' },
    violet:  { border: 'border-violet-500/15',  iconBg: 'bg-violet-500/10 text-violet-400',   bar: 'bg-violet-500' },
    amber:   { border: 'border-amber-500/15',   iconBg: 'bg-amber-500/10 text-amber-400',     bar: 'bg-amber-500'  },
  };
  const c = colors[accentColor] || colors.indigo;

  return (
    <div className={`bg-zinc-900 border ${c.border} rounded-xl p-5 transition-all duration-200 hover:-translate-y-1 hover:border-zinc-700 group`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${c.iconBg}`}>
          {icon}
        </div>
      </div>

      <p className="text-2xl font-bold text-zinc-100 tracking-tight tabular-nums">
        {prefix}{loaded ? animated.toLocaleString() : '—'}
      </p>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="text-xs text-zinc-600">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

/* ── Skeleton loader ── */
function Skeleton({ className = '' }) {
  return <div className={`rounded-lg bg-zinc-800 animate-pulse ${className}`} />;
}

/* ── Empty state ── */
function EmptyState({ message }) {
  return (
    <tr>
      <td colSpan={4} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2 text-zinc-600">
          <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm">{message}</p>
        </div>
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const [summary,    setSummary]    = useState({ totalRevenue: 0, totalProfit: 0, inventoryValue: 0 });
  const [chartData,  setChartData]  = useState([]);
  const [productPnL, setProductPnL] = useState([]);
  const [loaded,     setLoaded]     = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const [summaryRes, chartRes, inventoryRes, ordersRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/chart'),
        api.get('/inventory'),
        api.get('/orders'),
      ]);

      setSummary(summaryRes.data);
      setChartData(chartRes.data);

      // ── Product P&L ──
      const inventory = inventoryRes.data;
      const orders    = ordersRes.data;

      const pnl = inventory.map((item) => {
        let unitsSold = 0, revenue = 0, cost = 0;
        orders.forEach((order) => {
          order.items.forEach((oi) => {
            if (oi.productId && oi.productId._id === item._id) {
              unitsSold += oi.qty;
              revenue   += oi.qty * oi.productId.sellingPrice;
              cost      += oi.qty * oi.productId.costPrice;
            }
          });
        });
        return { id: item._id, name: item.name, unitsSold, revenue, profit: revenue - cost };
      });

      pnl.sort((a, b) => b.revenue - a.revenue);
      setProductPnL(pnl);
    } catch (err) {
      setError('Failed to load dashboard data.');
      console.error(err);
    } finally {
      setLoaded(true);
    }
  };

  const METRICS = [
    {
      title: 'Total Revenue',
      value: summary.totalRevenue,
      accentColor: 'indigo',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      title: 'Net Profit',
      value: summary.totalProfit,
      accentColor: 'emerald',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    },
    {
      title: 'Inventory Value',
      value: summary.inventoryValue,
      accentColor: 'violet',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    },
    {
      title: 'Products Tracked',
      value: productPnL.length,
      prefix: '',
      accentColor: 'amber',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
    },
  ];

  return (
    <AppLayout>
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Business Overview</h1>
          <p className="text-sm text-zinc-600 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 text-xs font-medium transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {!loaded
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)
          : METRICS.map((m, i) => (
              <div
                key={m.title}
                style={{ animation: `fadeIn 0.4s ${i * 80}ms both` }}
              >
                <MetricCard {...m} loaded={loaded} />
              </div>
            ))}
      </div>

      {/* ── Chart ── */}
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6"
        style={{ animation: 'fadeIn 0.5s 0.3s both' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">Revenue & Profit Trend</h2>
            <p className="text-xs text-zinc-600 mt-0.5">Daily breakdown across all orders</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Profit
            </span>
          </div>
        </div>
        {!loaded
          ? <Skeleton className="h-72" />
          : <ProfitChart data={chartData} />
        }
      </div>

      {/* ── P&L Table ── */}
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
        style={{ animation: 'fadeIn 0.5s 0.45s both' }}
      >
        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">Profit & Loss by Product</h2>
            <p className="text-xs text-zinc-600 mt-0.5">Performance breakdown per inventory item</p>
          </div>
          {productPnL.length > 0 && (
            <Badge variant="primary">{productPnL.length} products</Badge>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60">
                {['Product', 'Units Sold', 'Revenue', 'Net Profit / Loss'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider ${i === 0 ? 'text-left' : i === 3 ? 'text-right' : 'text-center'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {!loaded ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(4).fill(0).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : productPnL.length === 0 ? (
                <EmptyState message="No sales yet — make your first order to see P&L data" />
              ) : (
                productPnL.map((item, i) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-800/30 transition-colors group"
                    style={{ animation: `fadeIn 0.3s ${i * 60}ms both` }}
                  >
                    {/* Product name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:bg-zinc-700 transition-colors">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-zinc-200">{item.name}</span>
                      </div>
                    </td>

                    {/* Units sold */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-zinc-400 tabular-nums">{item.unitsSold}</span>
                    </td>

                    {/* Revenue */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-zinc-300 tabular-nums font-medium">
                        ${item.revenue.toLocaleString()}
                      </span>
                    </td>

                    {/* Profit badge */}
                    <td className="px-6 py-4 text-right">
                      <span
                        className={[
                          'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold',
                          item.profit >= 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20',
                        ].join(' ')}
                      >
                        {item.profit >= 0 ? '↑' : '↓'}
                        ${Math.abs(item.profit).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer summary */}
        {loaded && productPnL.length > 0 && (
          <div className="px-6 py-3 border-t border-zinc-800/60 bg-zinc-900/50 flex items-center justify-between">
            <span className="text-xs text-zinc-600">
              Total across {productPnL.length} product{productPnL.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-6 text-xs">
              <span className="text-zinc-500">
                Revenue: <span className="text-zinc-300 font-semibold tabular-nums">
                  ${productPnL.reduce((s, p) => s + p.revenue, 0).toLocaleString()}
                </span>
              </span>
              <span className="text-zinc-500">
                Profit: <span className={`font-semibold tabular-nums ${productPnL.reduce((s,p)=>s+p.profit,0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${productPnL.reduce((s, p) => s + p.profit, 0).toLocaleString()}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}