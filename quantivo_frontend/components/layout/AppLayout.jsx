import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Topbar already has an ml-64 class to push it right of the sidebar */}
      <Topbar />
      {/* Main content area pushed right to avoid overlapping the fixed sidebar */}
      <main className="ml-64 p-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}