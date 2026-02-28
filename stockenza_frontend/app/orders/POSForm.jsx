import Button from '../../components/ui/Button';
import { useCurrency } from '../../context/CurrencyContext';

export default function POSForm({ 
  inventory, selectedId, setSelectedId, quantity, setQuantity, 
  selectedProduct, totalAmount, profit, submitting, successId, handleSale 
}) {
  const { fmt } = useCurrency();
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold text-zinc-200">New Sale</h2>
      </div>

      {successId && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Sale recorded successfully!
        </div>
      )}

      <form onSubmit={handleSale} className="space-y-4">
        {/* Product selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Product</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all cursor-pointer"
          >
            <option value="">Select a product…</option>
            {inventory.map((item) => (
              <option key={item._id} value={item._id} disabled={item.quantity === 0}>
                {item.name} — {fmt(item.sellingPrice)} {item.quantity === 0 ? '(out of stock)' : `(${item.quantity} left)`}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Quantity</label>
          <input
            type="number"
            placeholder="1"
            min="1"
            max={selectedProduct?.quantity || ''}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all"
          />
          {selectedProduct && (
            <p className="text-xs text-zinc-600">{selectedProduct.quantity} units available</p>
          )}
        </div>

        {/* Selected product info */}
        {selectedProduct && (
          <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Unit price</span>
              <span className="text-zinc-300">{fmt(selectedProduct.sellingPrice)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Unit cost</span>
              <span className="text-zinc-400">{fmt(selectedProduct.costPrice)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Unit margin</span>
              <span className="text-emerald-400 font-semibold">
                {fmt(selectedProduct.sellingPrice - selectedProduct.costPrice)}
              </span>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="pt-3 border-t border-zinc-800">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-zinc-500">Total amount</span>
            <span className="text-xl font-bold text-indigo-400 tabular-nums">
              {fmt(totalAmount)}
            </span>
          </div>
          {profit > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-600">Est. profit</span>
              <span className="text-sm font-semibold text-emerald-400 tabular-nums">
                +{fmt(profit)}
              </span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting || !selectedId || !quantity}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing…
            </span>
          ) : 'Complete Sale'}
        </Button>
      </form>
    </div>
  );
}