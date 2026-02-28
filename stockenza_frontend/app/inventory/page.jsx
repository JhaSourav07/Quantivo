'use client';
import { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const EMPTY_FORM = { name: '', quantity: '', costPrice: '', sellingPrice: '', imageUrl: '' };

function Skeleton({ className = '' }) {
  return <div className={`rounded-lg bg-zinc-800 animate-pulse ${className}`} />;
}

export default function InventoryPage() {
  const [items,      setItems]      = useState([]);
  const [loaded,     setLoaded]     = useState(false);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [formData,   setFormData]   = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('all'); // all | low | ok
  const [sortBy,     setSortBy]     = useState('newest');
  const [error,      setError]      = useState('');

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/inventory');
      setItems(data);
    } catch { setError('Failed to load inventory.'); }
    finally  { setLoaded(true); }
  };

  /* ── Derived list (search + filter + sort) ── */
  const displayed = useMemo(() => {
    let list = [...items];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (filter === 'low') list = list.filter((i) => i.quantity < 20);
    if (filter === 'ok')  list = list.filter((i) => i.quantity >= 20);
    if (sortBy === 'newest')   list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === 'name')     list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'stock')    list.sort((a, b) => a.quantity - b.quantity);
    if (sortBy === 'price')    list.sort((a, b) => b.sellingPrice - a.sellingPrice);
    return list;
  }, [items, search, filter, sortBy]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError('');
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name, quantity: item.quantity,
      costPrice: item.costPrice, sellingPrice: item.sellingPrice,
      imageUrl: item.imageUrl || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        const { data } = await api.put(`/inventory/${editingId}`, formData);
        setItems(items.map((i) => (i._id === editingId ? data : i)));
      } else {
        const { data } = await api.post('/inventory', formData);
        setItems([data, ...items]);
      }
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    try {
      await api.delete(`/inventory/${id}`);
      setItems(items.filter((i) => i._id !== id));
    } catch { alert('Failed to delete item.'); }
  };

  const margin = (item) =>
    item.costPrice > 0
      ? Math.round(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100)
      : 0;

  /* Stats */
  const totalValue    = items.reduce((s, i) => s + i.costPrice * i.quantity, 0);
  const lowStockCount = items.filter((i) => i.quantity < 20).length;

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Inventory</h1>
          <p className="text-sm text-zinc-600 mt-0.5">{items.length} products tracked</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add product
        </Button>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total products',   value: items.length,                    prefix: '',  color: 'text-zinc-200'  },
          { label: 'Inventory value',  value: `$${totalValue.toLocaleString()}`, prefix: '', color: 'text-indigo-400' },
          { label: 'Low stock',        value: lowStockCount,                   prefix: '',  color: lowStockCount > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'Avg selling price',value: items.length ? `$${Math.round(items.reduce((s,i)=>s+i.sellingPrice,0)/items.length)}` : '$0', prefix: '', color: 'text-violet-400' },
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

      {/* ── Filters bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-1">
          {[['all','All'],['ok','In Stock'],['low','Low Stock']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === v
                  ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm text-zinc-400 focus:outline-none focus:border-indigo-500/60 transition-all cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="stock">Lowest stock</option>
          <option value="price">Highest price</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Product', 'Stock', 'Cost Price', 'Sell Price', 'Margin', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-3.5 text-xs font-medium text-zinc-600 uppercase tracking-wider ${
                      i === 0 ? 'text-left' : i === 5 ? 'text-right' : 'text-center'
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
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-6 py-4"><Skeleton className="h-4" /></td>
                    ))}
                  </tr>
                ))
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-zinc-600">
                      <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-sm">
                        {search ? `No products matching "${search}"` : 'No products yet — add your first item'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayed.map((item, i) => (
                  <tr
                    key={item._id}
                    className="hover:bg-zinc-800/30 transition-colors group"
                    style={{ animation: `fadeIn 0.3s ${i * 40}ms both` }}
                  >
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:bg-zinc-700 shrink-0 transition-colors">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{item.name}</p>
                          <p className="text-xs text-zinc-600">
                            Added {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4 text-center">
                      <Badge variant={item.quantity < 10 ? 'danger' : item.quantity < 20 ? 'warning' : 'success'}>
                        {item.quantity < 10 ? '⚠ ' : ''}{item.quantity} units
                      </Badge>
                    </td>

                    {/* Cost */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-zinc-400 tabular-nums">${item.costPrice}</span>
                    </td>

                    {/* Sell price */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-zinc-200 font-medium tabular-nums">${item.sellingPrice}</span>
                    </td>

                    {/* Margin */}
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-semibold tabular-nums ${margin(item) >= 40 ? 'text-emerald-400' : margin(item) >= 20 ? 'text-amber-400' : 'text-red-400'}`}>
                        {margin(item)}%
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {loaded && displayed.length > 0 && (
          <div className="px-6 py-3 border-t border-zinc-800/60 bg-zinc-900/50">
            <p className="text-xs text-zinc-600">
              Showing {displayed.length} of {items.length} products
            </p>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Product' : 'Add New Product'}
      >
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product name"
            placeholder="e.g. Wireless Headphones"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity"
              type="number"
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
            <Input
              label="Image URL"
              placeholder="https://…"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cost price ($)"
              type="number"
              placeholder="0.00"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              required
            />
            <Input
              label="Selling price ($)"
              type="number"
              placeholder="0.00"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              required
            />
          </div>

          {/* Live margin preview */}
          {formData.costPrice && formData.sellingPrice && (
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-800/60 border border-zinc-700/60">
              <span className="text-xs text-zinc-500">Gross margin</span>
              <span className={`text-sm font-bold ${
                ((formData.sellingPrice - formData.costPrice) / formData.sellingPrice * 100) >= 30
                  ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {Math.round((formData.sellingPrice - formData.costPrice) / formData.sellingPrice * 100)}%
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeModal} type="button">Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : editingId ? 'Update product' : 'Add product'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}