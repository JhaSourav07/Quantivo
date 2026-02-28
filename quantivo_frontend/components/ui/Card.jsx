export default function Card({ children, className = '', hover = false, glow = false }) {
  return (
    <div
      className={[
        'bg-zinc-900 border border-zinc-800 rounded-xl p-6',
        'shadow-[0_1px_3px_rgba(0,0,0,0.4),0_8px_32px_-8px_rgba(0,0,0,0.5)]',
        hover &&
          'transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:border-zinc-700 hover:shadow-[0_8px_40px_-8px_rgba(99,102,241,0.2)]',
        glow && 'border-indigo-500/20 shadow-[0_0_24px_rgba(99,102,241,0.08)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}