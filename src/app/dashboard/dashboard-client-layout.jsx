'use client';

import { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import Header from './header-client';
import { usePathname } from 'next/navigation';

export default function DashboardClientLayout({ children, session, permissions, notificationSettings, mailEnabled }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsSidebarOpen(false));
    if (pathname.startsWith('/dashboard/client/')) {
      window.scrollTo(0, 0);
    }
    return () => window.cancelAnimationFrame(frame);
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
        permissions={permissions}
        isMobileOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        mailEnabled={mailEnabled}
      />
      <main className="main-content">
        <Header 
          session={session} 
          onMenuClick={toggleSidebar} 
          notificationSettings={notificationSettings}
        />
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}
