export default function Textarea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={[
          'w-full px-4 py-3 rounded-lg text-sm resize-none',
          'bg-zinc-800/60 border border-zinc-700',
          'text-zinc-100 placeholder:text-zinc-500',
          'transition-all duration-200',
          'focus:outline-none focus:border-indigo-500/60 focus:bg-zinc-800',
          'focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]',
        ].join(' ')}
      />
    </div>
  );
}