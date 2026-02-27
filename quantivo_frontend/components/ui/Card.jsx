export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface rounded-xl shadow-soft border border-slate-100 p-6 ${className}`}>
      {children}
    </div>
  );
}