'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import Button from '../../components/ui/Button';
import { useCurrency } from '../../context/CurrencyContext';

// Extracted Inventory Components
import InventoryStats from '../../app/inventory/InventoryStats';
import InventorySearch from '../../app/inventory/InventorySearch';
import InventoryTable from '../../app/inventory/InventoryTable';
import InventoryModal from '../../app/inventory/InventoryModal';

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

      <InventoryStats items={items} loaded={loaded} isMounted={isMounted} fmt={fmt} />
      
      <InventorySearch search={search} setSearch={setSearch} />
      
      <InventoryTable 
        items={items} 
        filtered={filtered} 
        loaded={loaded} 
        isMounted={isMounted} 
        fmt={fmt} 
        openEdit={openEdit} 
        handleDelete={handleDelete} 
        deleteId={deleteId} 
      />

      <InventoryModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        editItem={editItem} 
        form={form} 
        setForm={setForm} 
        onSubmit={handleSubmit} 
        saving={saving} 
      />
    </AppLayout>
  );
}