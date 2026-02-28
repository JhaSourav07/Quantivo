'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import { useCurrency } from '../../context/CurrencyContext';

// Import our newly extracted components
import { useCountUp } from '../../hooks/useCountUp';
import MetricCard from '../../components/ui/MetricCard';
import RevenueProfitChart from '../../app/dashboard/RevenueProfitChart';
import PnLTable from '../../app/dashboard/PnLTable';

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

  // ── Derived metrics ──
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

  // ── Chart data ──
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
    return Object.values(map).slice(-6);
  })();

  // ── P&L per product ──
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

      <RevenueProfitChart loaded={loaded} chartData={chartData} fmt={fmt} />
      
      <PnLTable 
        loaded={loaded} 
        pnlRows={pnlRows} 
        isMounted={isMounted} 
        fmt={fmt} 
        totalRevenue={totalRevenue} 
        totalCost={totalCost} 
        totalProfit={totalProfit} 
      />
    </AppLayout>
  );
}