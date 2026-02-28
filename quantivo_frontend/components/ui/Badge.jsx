export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default:  'bg-zinc-800 text-zinc-400 border-zinc-700',
    success:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    danger:   'bg-red-500/10 text-red-400 border-red-500/20',
    warning:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    primary:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    violet:   'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };

  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}