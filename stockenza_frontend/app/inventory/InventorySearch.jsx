export default function InventorySearch({ search, setSearch }) {
  return (
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
  );
}