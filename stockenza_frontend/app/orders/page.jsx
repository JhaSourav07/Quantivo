'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';

// Modular Components (Make sure these are saved in your components/orders/ folder!)
import OrderStats from '../../app/orders/OrderStats';
import POSForm from '../../app/orders/POSForm';
import OrderHistoryTable from '../../app/orders/OrderHistoryTable';

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

      {/* ── Extracted Order Stats ── */}
      <OrderStats 
        orders={orders} 
        totalRevenue={totalRevenue} 
        todayOrders={todayOrders} 
        inventory={inventory} 
        loaded={loaded} 
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left: POS form ── */}
        <div className="lg:col-span-1">
          <POSForm 
            inventory={inventory} 
            selectedId={selectedId} 
            setSelectedId={setSelectedId} 
            quantity={quantity} 
            setQuantity={setQuantity} 
            selectedProduct={selectedProduct} 
            totalAmount={totalAmount} 
            profit={profit} 
            submitting={submitting} 
            successId={successId} 
            handleSale={handleSale} 
          />
        </div>

        {/* ── Right: Order history ── */}
        <div className="lg:col-span-2">
          <OrderHistoryTable 
            orders={orders} 
            loaded={loaded} 
            totalRevenue={totalRevenue} 
            successId={successId} 
            fmtDate={fmtDate} 
          />
        </div>
      </div>
    </AppLayout>
  );
}