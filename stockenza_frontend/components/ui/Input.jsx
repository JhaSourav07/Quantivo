export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  disabled = false,
  hint = '',
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        disabled={disabled}
        className={[
          'w-full px-4 py-2.5 rounded-lg text-sm',
          'bg-zinc-800/60 border border-zinc-700',
          'text-zinc-100 placeholder:text-zinc-500',
          'transition-all duration-200',
          'focus:outline-none focus:border-indigo-500/60 focus:bg-zinc-800',
          'focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]',
          'disabled:opacity-40 disabled:cursor-not-allowed',
        ].join(' ')}
      />
      {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
    </div>
  );
}