'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import ProfitChart from '../../components/charts/ProfitChart';

export default function DashboardPage() {
  const [summary, setSummary] = useState({ totalRevenue: 0, totalProfit: 0, inventoryValue: 0 });
  const [chartData, setChartData] = useState([]);
  const [productPnL, setProductPnL] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel for maximum speed
      const [summaryRes, chartRes, inventoryRes, ordersRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/chart'),
        api.get('/inventory'),
        api.get('/orders')
      ]);

      setSummary(summaryRes.data);
      setChartData(chartRes.data);

      // CALCULATE PROFIT & LOSS PER PRODUCT
      const inventory = inventoryRes.data;
      const orders = ordersRes.data;

      const calculatedPnL = inventory.map(item => {
        let unitsSold = 0;
        let revenue = 0;
        let cost = 0;

        // Loop through all orders to find sales of this specific item
        orders.forEach(order => {
          order.items.forEach(orderItem => {
            // Check if the order item matches our current inventory item
            if (orderItem.productId && orderItem.productId._id === item._id) {
              unitsSold += orderItem.qty;
              revenue += (orderItem.qty * orderItem.productId.sellingPrice);
              cost += (orderItem.qty * orderItem.productId.costPrice);
            }
          });
        });

        return {
          id: item._id,
          name: item.name,
          unitsSold,
          revenue,
          profit: revenue - cost
        };
      });

      // Sort by highest revenue
      calculatedPnL.sort((a, b) => b.revenue - a.revenue);
      setProductPnL(calculatedPnL);

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center pt-20">
          <p className="text-slate-500 animate-pulse">Calculating business metrics...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-800">Business Overview</h1>
        <p className="text-slate-500 mt-1">Track your performance and inventory metrics.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
        <Card className="border-l-4 border-l-primary-500">
          <h3 className="text-sm font-medium text-slate-500">Total Revenue</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">${summary.totalRevenue.toLocaleString()}</p>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <h3 className="text-sm font-medium text-slate-500">Net Profit</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            ${summary.totalProfit.toLocaleString()}
          </p>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <h3 className="text-sm font-medium text-slate-500">Inventory Value</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">${summary.inventoryValue.toLocaleString()}</p>
        </Card>
      </div>

      {/* Main Chart Section */}
      <Card className="animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">Profit Trend</h2>
        </div>
        {/* Pass the real data into the chart component */}
        <ProfitChart data={chartData} />
      </Card>

      {/* Profit and Loss per Product Table */}
      <Card className="mt-8 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800">Profit & Loss by Product</h2>
          <p className="text-sm text-slate-500 mt-1">Breakdown of financial performance per inventory item.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="pb-3 font-medium">Product Name</th>
                <th className="pb-3 font-medium text-center">Units Sold</th>
                <th className="pb-3 font-medium text-right">Revenue Generated</th>
                <th className="pb-3 font-medium text-right">Net Profit / Loss</th>
              </tr>
            </thead>
            <tbody>
              {productPnL.length === 0 ? (
                <tr><td colSpan="4" className="py-4 text-center text-slate-500">No sales data yet.</td></tr>
              ) : (
                productPnL.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-medium text-slate-800">{item.name}</td>
                    <td className="py-4 text-center text-slate-600">{item.unitsSold}</td>
                    <td className="py-4 text-right text-slate-600">${item.revenue.toLocaleString()}</td>
                    <td className="py-4 text-right font-bold">
                      <span className={`px-3 py-1 rounded-full text-sm ${item.profit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {item.profit >= 0 ? '+' : '-'}${Math.abs(item.profit).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}