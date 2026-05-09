'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCircle, LogOut, ChevronLeft, ChevronRight, Brain, Settings, ClipboardList, X, StickyNote, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLatestLogIdAction, getLatestNoteIdAction } from '@/app/actions';

export default function Sidebar({ role, isMobileOpen, onClose }) {
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

  const isAdmin = role === 'ADMIN';
  const [hasNewLogs, setHasNewLogs] = useState(false);
  const [hasNewNotes, setHasNewNotes] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      const checkLogs = async () => {
        const latestId = await getLatestLogIdAction();
        const lastSeenId = parseInt(localStorage.getItem('last_seen_log_id') || '0');
        if (latestId > lastSeenId) {
          setHasNewLogs(true);
        }
      };
      checkLogs();
      
      const handleStorage = () => checkLogs();
      window.addEventListener('storage', handleStorage);

      // Check every 30 seconds
      const interval = setInterval(checkLogs, 30000);
      return () => {
        clearInterval(interval);
        window.removeEventListener('storage', handleStorage);
      };
    }
  }, [isAdmin, pathname]);

  useEffect(() => {
    const checkNotes = async () => {
      const latestId = await getLatestNoteIdAction();
      const lastSeenId = parseInt(localStorage.getItem('last_seen_note_id') || '0');
      if (latestId > lastSeenId) {
        setHasNewNotes(true);
      } else {
        setHasNewNotes(false);
      }
    };
    checkNotes();
    
    const interval = setInterval(checkNotes, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  const navItems = [
    { href: '/dashboard', label: 'Gösterge Paneli', icon: <LayoutDashboard size={20} /> },
    ...(isAdmin ? [
      { href: '/dashboard/clients', label: 'Müşteriler', icon: <Users size={20} /> },
      { href: '/dashboard/users', label: 'Kullanıcılar', icon: <UserCircle size={20} /> },
      { href: '/dashboard/logs', label: 'Sistem Logları', icon: <ClipboardList size={20} /> },
    ] : []),
    { href: '/dashboard/notes', label: 'İş Takibi', icon: <StickyNote size={20} /> },
    { href: '/dashboard/accounting', label: 'Muhasebe', icon: <Wallet size={20} /> },
    { href: '/dashboard/settings', label: 'Ayarlar', icon: <Settings size={20} /> },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`} style={{ overflow: 'visible' }}>
      <div className="sidebar-header" style={{ position: 'relative', height: '80px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', padding: isCollapsed ? '0' : '0 1.5rem', overflow: 'visible' }}>
        {(!isCollapsed || isMobileOpen) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'var(--accent-gradient)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Brain size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                fontSize: '1rem', 
                fontWeight: 800, 
                letterSpacing: '-0.02em',
                background: 'var(--accent-gradient)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1
              }}>
                BEYİN ATÖLYESİ
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>YÖNETİM PANELİ</span>
            </div>
          </div>
        )}
        
        {isCollapsed && !isMobileOpen && (
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'var(--accent-gradient)', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Brain size={24} />
          </div>
        )}
        
        {!isMobileOpen ? (
          <button 
            onClick={toggleSidebar}
            className="sidebar-toggle-btn"
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
        ) : (
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav" style={{ marginTop: '1rem' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed && !isMobileOpen ? item.label : ''}
              style={{ justifyContent: (isCollapsed && !isMobileOpen) ? 'center' : 'flex-start', padding: (isCollapsed && !isMobileOpen) ? '0.75rem 0' : '0.75rem 1rem', position: 'relative' }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
                {item.label === 'Sistem Logları' && hasNewLogs && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-secondary)',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                    animation: 'pulse-red 2s infinite'
                  }}></span>
                )}
                {item.label === 'İş Takibi' && hasNewNotes && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-secondary)',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                    animation: 'pulse-red 2s infinite'
                  }}></span>
                )}
              </div>
              {(!isCollapsed || isMobileOpen) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '0 1rem 1.5rem 1rem', marginTop: 'auto' }}>
        <Link 
          href="/logout" 
          className="nav-item" 
          style={{ color: '#ef4444', justifyContent: (isCollapsed && !isMobileOpen) ? 'center' : 'flex-start', padding: (isCollapsed && !isMobileOpen) ? '0.75rem 0' : '0.75rem 1rem' }}
          title={isCollapsed && !isMobileOpen ? 'Çıkış Yap' : ''}
        >
          <LogOut size={20} />
          {(!isCollapsed || isMobileOpen) && <span>Çıkış Yap</span>}
        </Link>
      </div>

    </aside>
  );
}
