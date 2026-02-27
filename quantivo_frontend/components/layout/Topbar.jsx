'use client';
import Button from '../ui/Button';

export default function Topbar() {
  const handleLogout = () => {
    // We will add the actual logout logic in Step 9
    console.log("Logging out...");
  };

  return (
    <header className="h-16 bg-surface border-b border-slate-200 flex items-center justify-between px-8 ml-64">
      <h2 className="text-lg font-semibold text-slate-800">Welcome back 👋</h2>
      
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
          U
        </div>
        <Button variant="secondary" onClick={handleLogout} className="text-sm py-1.5 px-3">
          Logout
        </Button>
      </div>
    </header>
  );
}