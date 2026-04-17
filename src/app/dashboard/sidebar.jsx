'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCircle, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sidebar({ username }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState === 'true') setIsCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', newState.toString());
  };

  const navItems = [
    { href: '/dashboard', label: 'Gösterge Paneli', icon: <LayoutDashboard size={20} /> },
    { href: '/dashboard/clients', label: 'Müşteriler', icon: <Users size={20} /> },
    { href: '/dashboard/users', label: 'Kullanıcılar', icon: <UserCircle size={20} /> },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ overflow: 'visible' }}>
      <div className="sidebar-header" style={{ position: 'relative', height: '80px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', padding: isCollapsed ? '0' : '0 1.5rem', overflow: 'visible' }}>
        {!isCollapsed && (
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
             AGENCY
          </h2>
        )}
        
        <button 
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 100,
            transition: 'all 0.3s',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="sidebar-nav" style={{ marginTop: '1rem' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : ''}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem' }}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '0 1rem 1.5rem 1rem', marginTop: 'auto' }}>
        <Link 
          href="/logout" 
          className="nav-item" 
          style={{ color: '#ef4444', justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem' }}
          title={isCollapsed ? 'Çıkış Yap' : ''}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Çıkış Yap</span>}
        </Link>
      </div>
    </aside>
  );
}
