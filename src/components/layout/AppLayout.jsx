import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Header onMenuClick={() => setSidebarOpen(o => !o)} />
        <main style={{ flex: 1, padding: '1.5rem', maxWidth: 1400 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
