import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function InventoryModal({
  isOpen, onClose, editItem,
  form, setForm,
  onSubmit, saving,
  imagePreview, onImageChange,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Edit product' : 'Add product'}>
      <form onSubmit={onSubmit} className="space-y-4">

        {/* Row 1: Name + SKU */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Product name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Blue Widget"
            required
          />
          <Input
            label="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="e.g. BW-001"
          />
        </div>

        {/* Category */}
        <Input
          label="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="e.g. Electronics"
        />

        {/* Image upload */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Product Image <span className="text-zinc-700 normal-case">(optional)</span>
          </label>

          {/* Preview */}
          {imagePreview && (
            <div className="mb-3 flex items-center gap-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-16 h-16 rounded-lg object-cover border border-zinc-700 bg-zinc-800"
              />
              <span className="text-xs text-zinc-500">Current image</span>
            </div>
          )}

          <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-zinc-700 bg-zinc-800/40 hover:border-indigo-500/60 hover:bg-zinc-800/70 cursor-pointer transition-all group">
            <svg className="w-5 h-5 text-zinc-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
              {imagePreview ? 'Replace image' : 'Upload image'} — JPG, PNG, WebP
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageChange}
            />
          </label>
        </div>

        {/* Row 3: Prices + Quantity */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Input
            label="Cost price"
            type="number" step="0.01" min="0"
            value={form.costPrice}
            onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
            placeholder="0.00"
            required
          />
          <Input
            label="Selling price"
            type="number" step="0.01" min="0"
            value={form.sellingPrice}
            onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
            placeholder="0.00"
            required
          />
          <Input
            label="Quantity"
            type="number" min="0"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="0"
            required
          />
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

        {/* Actions */}
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