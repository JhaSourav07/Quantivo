'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import { useCurrency } from '../../context/CurrencyContext';

import { useCountUp } from '../../hooks/useCountUp';
import MetricCard from '../../components/ui/MetricCard';
import RevenueProfitChart from '../../app/dashboard/RevenueProfitChart';
import PnLTable from '../../app/dashboard/PnLTable';

// ── Date range pill options ────────────────────────────────────────────────────
const DATE_RANGES = [
  { label: 'Today',    value: 'today'    },
  { label: '7 Days',   value: '7days'    },
  { label: '30 Days',  value: '30days'   },
  { label: '1 Year',   value: '1year'    },
  { label: 'All Time', value: 'all-time' },
];

/**
 * Converts a date-range key into { startDate, endDate } ISO strings.
 * "Today" spans from 00:00:00.000 → 23:59:59.999 of the current day.
 * "All Time" returns nulls so the backend omits the createdAt filter entirely.
 */
function getDateRange(range) {
  if (range === 'all-time') return { startDate: null, endDate: null };

  const end   = new Date();
  const start = new Date();

  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (range === '7days') {
    start.setDate(start.getDate() - 7);
  } else if (range === '30days') {
    start.setDate(start.getDate() - 30);
  } else if (range === '1year') {
    start.setFullYear(start.getFullYear() - 1);
  }

  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

/** Build a query-string from a { startDate, endDate } object. Returns '' for all-time. */
function buildQs({ startDate, endDate }) {
  if (!startDate || !endDate) return '';
  return `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
}

/**
 * Transform raw daily chart data into the correct granularity.
 *
 * Problem: The backend always returns daily rows (one per YYYY-MM-DD).
 * For short ranges (today / 7 days) we want day-level labels.
 * For longer ranges (30 days / 1 year / all-time) we want MONTHLY labels —
 * which means we must AGGREGATE the daily rows into monthly buckets first.
 * Simply relabelling each daily row with a month name creates duplicate
 * X-axis ticks and double-counts values in Recharts.
 */
function transformChartData(rawData, dateRange) {
  const useDayLabel = dateRange === 'today' || dateRange === '7days';

  if (useDayLabel) {
    // Day-level — one point per row, label as "Mar 1"
    return rawData.map((d) => {
      const dt    = new Date(d.date);
      const label = dt.toLocaleString('en-US', { month: 'short', day: 'numeric' });
      return { ...d, month: label };
    });
  }

  // Month-level — aggregate daily rows into monthly buckets
  const buckets = {}; // key: "Mar '26" → { month, revenue, profit }

  rawData.forEach((d) => {
    // Parse date as UTC to avoid timezone-induced day-shift
    const dt    = new Date(d.date + 'T00:00:00Z');
    const key   = dt.toLocaleString('en-US', {
      month:    'short',
      year:     '2-digit',
      timeZone: 'UTC',
    });

    if (!buckets[key]) {
      // Preserve insertion order by noting the sort key (year-month number)
      const sortKey = dt.getUTCFullYear() * 100 + dt.getUTCMonth();
      buckets[key]  = { month: key, revenue: 0, profit: 0, _sortKey: sortKey };
    }

    buckets[key].revenue += d.revenue;
    buckets[key].profit  += d.profit;
  });

  return Object.values(buckets)
    .sort((a, b) => a._sortKey - b._sortKey)
    .map(({ _sortKey, ...rest }) => ({
      ...rest,
      revenue: Math.round(rest.revenue * 100) / 100,
      profit:  Math.round(rest.profit  * 100) / 100,
    }));
}

export default function DashboardPage() {
  const { fmt, isMounted } = useCurrency();

  // ── Date range state ──────────────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState('30days');

  // ── Data state ────────────────────────────────────────────────────────────────
  const [inventory, setInventory] = useState([]);
  const [summary,   setSummary]   = useState(null);
  const [chartData, setChartData] = useState([]);
  const [pnlRows,   setPnlRows]   = useState([]);
  const [loaded,    setLoaded]    = useState(false);

  // ── Fetch everything; re-runs whenever dateRange changes ──────────────────────
  const fetchAll = useCallback(async () => {
    setLoaded(false);
    try {
      const dates = getDateRange(dateRange);
      const qs    = buildQs(dates);

      // All four requests fire in parallel
      const [invRes, summaryRes, chartRes, pnlRes] = await Promise.all([
        api.get('/inventory'),                  // stock value + alerts (always all-time)
        api.get(`/reports/summary${qs}`),       // KPI cards
        api.get(`/reports/chart${qs}`),         // chart
        api.get(`/reports/pnl${qs}`),           // P&L table — server-side date filter
      ]);

      setInventory(invRes.data);
      setSummary(summaryRes.data);
      setPnlRows(pnlRes.data);

      // ── Transform chart data with correct aggregation ──
      const mappedChart = transformChartData(chartRes.data, dateRange);
      setChartData(mappedChart);

    } catch (e) { console.error(e); }
    finally     { setLoaded(true); }
  }, [dateRange]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived display values ────────────────────────────────────────────────────
  const totalRevenue = summary?.totalRevenue  ?? 0;
  const totalProfit  = summary?.totalProfit   ?? 0;
  const stockValue   = summary?.inventoryValue ?? 0;
  const orderCount   = summary?.orderCount    ?? 0;
  const totalCost    = pnlRows.reduce((s, r) => s + r.cost, 0);

  // Alerts are always all-time — operational stock level, not a time-series metric
  const lowStockItems = inventory.filter((i) => i.quantity > 0 && i.quantity <= 5);
  const outOfStock    = inventory.filter((i) => i.quantity === 0);

  // Animated count-up for the three monetary KPI cards
  const animRevenue = useCountUp(totalRevenue, 1200, loaded);
  const animProfit  = useCountUp(totalProfit,  1200, loaded);
  const animStock   = useCountUp(stockValue,   1200, loaded);

  // ── Chart subtitle — reflects current granularity ────────────────────────────
  const chartSubtitle =
    dateRange === 'today' || dateRange === '7days'
      ? 'Daily performance breakdown'
      : 'Monthly performance breakdown';

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-600 mt-0.5">Business overview &amp; analytics</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* ── Date Range Pill Selector ── */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
            {DATE_RANGES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setDateRange(value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  dateRange === value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Currency badge */}
          {isMounted && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-500">
              <span>Currency</span>
              <span className="font-semibold text-zinc-300">
                {fmt(0).replace(/[\d,.\s]/g, '').trim() || '…'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total revenue"
          value={isMounted ? fmt(animRevenue) : '—'}
          sub={`${orderCount} orders`}
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

      <RevenueProfitChart
        loaded={loaded}
        chartData={chartData}
        fmt={fmt}
        subtitle={chartSubtitle}
      />

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