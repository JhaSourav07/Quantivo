'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // NEW: State to track if we are editing an existing item
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    costPrice: '',
    sellingPrice: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Helper to safely close modal and reset all states
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', quantity: '', costPrice: '', sellingPrice: '', imageUrl: '' });
  };

  // NEW: Populates the form with existing data when Edit is clicked
  const handleEditClick = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      imageUrl: item.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  // UPDATED: Now handles BOTH creating and updating based on editingId
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // UPDATE existing item
        const response = await api.put(`/inventory/${editingId}`, formData);
        // Replace the old item in our state with the updated one
        setItems(items.map(item => item._id === editingId ? response.data : item));
      } else {
        // CREATE new item
        const response = await api.post('/inventory', formData);
        setItems([response.data, ...items]);
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save item", error);
      alert("Error saving item. Check console.");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      await api.delete(`/inventory/${id}`);
      setItems(items.filter(item => item._id !== id));
    } catch (error) {
      console.error("Failed to delete item", error);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Add, update, or remove your products.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add New Item</Button>
      </div>

      <Card className="overflow-x-auto animate-fade-in">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading inventory...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No items found. Add your first product!</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="pb-3 font-medium">Product Name</th>
                <th className="pb-3 font-medium">Stock Level</th>
                <th className="pb-3 font-medium">Cost Price</th>
                <th className="pb-3 font-medium">Selling Price</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-medium text-slate-800">{item.name}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.quantity < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.quantity} in stock
                    </span>
                  </td>
                  <td className="py-4 text-slate-600">${item.costPrice}</td>
                  <td className="py-4 text-slate-600">${item.sellingPrice}</td>
                  <td className="py-4 text-right space-x-3">
                    {/* NEW: Edit button wired up */}
                    <button 
                      onClick={() => handleEditClick(item)}
                      className="text-primary-600 hover:text-primary-800 font-medium text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item._id)}
                      className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Add/Edit Item Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingId ? "Edit Product" : "Add New Product"} // Dynamic Title
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Product Name" 
            placeholder="e.g. Gaming Headset" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Quantity" 
              type="number" 
              placeholder="0" 
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              required 
            />
            <Input 
              label="Image URL (Optional)" 
              placeholder="https://..." 
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Cost Price ($)" 
              type="number" 
              placeholder="0.00" 
              value={formData.costPrice}
              onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
              required 
            />
            <Input 
              label="Selling Price ($)" 
              type="number" 
              placeholder="0.00" 
              value={formData.sellingPrice}
              onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
              required 
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            {/* Dynamic Button Text */}
            <Button type="submit">{editingId ? "Update Product" : "Save Product"}</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}