'use client';

import { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import Header from './header-client';
import { usePathname } from 'next/navigation';

export default function DashboardClientLayout({ children, session }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      />
      <Sidebar 
        role={session.role} 
        isMobileOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <main className="main-content">
        <Header 
          session={session} 
          onMenuClick={toggleSidebar} 
        />
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}
