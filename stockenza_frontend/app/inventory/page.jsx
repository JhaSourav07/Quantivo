'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useCurrency } from '../../context/CurrencyContext';

function Skeleton({ className = '' }) {
  return <div className={`rounded-lg bg-zinc-800 animate-pulse ${className}`} />;
}

const EMPTY_FORM = { name: '', sku: '', costPrice: '', sellingPrice: '', quantity: '', category: '' };

export default function InventoryPage() {
  const { fmt, isMounted } = useCurrency();

  const [items,      setItems]      = useState([]);
  const [loaded,     setLoaded]     = useState(false);
  const [search,     setSearch]     = useState('');
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const { data } = await api.get('/inventory');
      setItems(data);
    } catch (e) { console.error(e); }
    finally    { setLoaded(true); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name:         item.name,
      sku:          item.sku          || '',
      costPrice:    item.costPrice,
      sellingPrice: item.sellingPrice,
      quantity:     item.quantity,
      category:     item.category     || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name:         form.name,
        sku:          form.sku,
        costPrice:    Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        quantity:     Number(form.quantity),
        category:     form.category,
      };
      if (editItem) {
        await api.put(`/inventory/${editItem._id}`, payload);
      } else {
        await api.post('/inventory', payload);
      }
      setModalOpen(false);
      await fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setDeleteId(id);
    try {
      await api.delete(`/inventory/${id}`);
      await fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.sku || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalStockValue  = items.reduce((s, i) => s + i.costPrice  * i.quantity, 0);
  const totalRetailValue = items.reduce((s, i) => s + i.sellingPrice * i.quantity, 0);
  const lowStock         = items.filter((i) => i.quantity > 0 && i.quantity <= 5).length;
  const outOfStock       = items.filter((i) => i.quantity === 0).length;

  const stockStatus = (qty) => {
    if (qty === 0) return { label: 'Out of stock', cls: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (qty <= 5)  return { label: 'Low stock',    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return              { label: 'In stock',       cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Inventory</h1>
          <p className="text-sm text-zinc-600 mt-0.5">Manage your products & stock levels</p>
        </div>
        <Button onClick={openAdd}>
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add product
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total SKUs',     value: items.length,                           color: 'text-zinc-200'   },
          { label: 'Stock value',    value: isMounted ? fmt(totalStockValue)  : '—', color: 'text-indigo-400' },
          { label: 'Retail value',   value: isMounted ? fmt(totalRetailValue) : '—', color: 'text-violet-400' },
          { label: 'Stock alerts',   value: `${lowStock + outOfStock}`,             color: outOfStock > 0 ? 'text-red-400' : 'text-amber-400' },
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

      {/* ── Search ── */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, SKU, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all"
          />
        </div>
      </div>

      {/* ── Table ── */}
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
                {['Product', 'SKU', 'Category', 'Cost', 'Price', 'Margin', 'Stock', 'Status', ''].map((h, i) => (
                  <th
                    key={h + i}
                    className={`px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider whitespace-nowrap ${
                      ['Cost','Price','Margin'].includes(h) ? 'text-right' :
                      h === 'Stock' ? 'text-center' :
                      h === '' ? '' : 'text-left'
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
                  <tr key={i}>{Array(9).fill(0).map((_, j) => (<td key={j} className="px-5 py-4"><Skeleton className="h-4" /></td>))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-zinc-600">
                      <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-sm">{items.length === 0 ? 'No products yet — add your first one' : 'No products match your search'}</p>
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
                        <p className="text-sm font-medium text-zinc-200">{item.name}</p>
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

      {/* ── Add / Edit modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit product' : 'Add product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Blue Widget" required />
            <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. BW-001" />
          </div>
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Electronics" />
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Cost price" type="number" step="0.01" min="0" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} placeholder="0.00" required />
            <Input label="Selling price" type="number" step="0.01" min="0" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} placeholder="0.00" required />
            <Input label="Quantity" type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" required />
          </div>

          {/* Margin preview */}
          {form.costPrice && form.sellingPrice && Number(form.sellingPrice) > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
              <span className="text-xs text-zinc-500">Gross margin</span>
              <span className={`text-sm font-semibold ${
                ((Number(form.sellingPrice) - Number(form.costPrice)) / Number(form.sellingPrice) * 100) >= 20
                  ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {((Number(form.sellingPrice) - Number(form.costPrice)) / Number(form.sellingPrice) * 100).toFixed(1)}%
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : editItem ? 'Save changes' : 'Add product'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}