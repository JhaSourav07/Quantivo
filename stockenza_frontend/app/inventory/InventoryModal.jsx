import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function InventoryModal({ isOpen, onClose, editItem, form, setForm, onSubmit, saving }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Edit product' : 'Add product'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
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
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
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
  );
}