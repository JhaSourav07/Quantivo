export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg p-6 relative animate-fade-in">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          ✕
        </button>
        {title && <h2 className="text-xl font-bold text-slate-800 mb-6">{title}</h2>}
        {children}
      </div>
    </div>
  );
}