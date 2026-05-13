'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, UserCircle, LogOut, ChevronLeft, ChevronRight, Brain, Settings, ClipboardList, X, StickyNote, Wallet, Lock, Mail, CheckSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLatestLogIdAction, getLatestNoteIdAction, getUnreadMailCountAction, getWorkItemBadgeCountAction } from '@/app/actions';
import { can } from '@/lib/permissions';

export default function Sidebar({ role, permissions, isMobileOpen, onClose, mailEnabled = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', newState.toString());
  };

  const isAdmin = role === 'ADMIN';
  const canCredentials = can(permissions, role, 'page.credentials');
  const canNotes = can(permissions, role, 'page.notes');
  const canWorkItems = can(permissions, role, 'page.work_items');
  const [hasNewLogs, setHasNewLogs] = useState(false);
  const [hasNewNotes, setHasNewNotes] = useState(false);
  const [unreadMailCount, setUnreadMailCount] = useState(0);
  const [workItemCount, setWorkItemCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      const checkLogs = async () => {
        const latestId = await getLatestLogIdAction();
        const lastSeenId = parseInt(localStorage.getItem('last_seen_log_id') || '0');
        
        if (pathname === '/dashboard/logs') {
          localStorage.setItem('last_seen_log_id', latestId.toString());
          setHasNewLogs(false);
        } else if (latestId > lastSeenId) {
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
      
      if (pathname === '/dashboard/notes') {
        localStorage.setItem('last_seen_note_id', latestId.toString());
        setHasNewNotes(false);
      } else if (latestId > lastSeenId) {
        setHasNewNotes(true);
      } else {
        setHasNewNotes(false);
      }
    };
    checkNotes();
    
    const interval = setInterval(checkNotes, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    const checkWorkItems = async () => {
      if (!canWorkItems) return;
      const result = await getWorkItemBadgeCountAction();
      setWorkItemCount(result?.count || 0);
    };
    checkWorkItems();

    const interval = setInterval(checkWorkItems, 30000);
    return () => clearInterval(interval);
  }, [pathname, canWorkItems]);

  useEffect(() => {
    const checkUnreadMail = async () => {
      if (!mailEnabled) {
        setUnreadMailCount(0);
        return;
      }
      const result = await getUnreadMailCountAction();
      setUnreadMailCount(result?.count || 0);
    };
    checkUnreadMail();

    const interval = setInterval(checkUnreadMail, 60000);
    return () => clearInterval(interval);
  }, [pathname, mailEnabled]);

  const navItems = [
    { href: '/dashboard', label: 'Gösterge Paneli', icon: <LayoutDashboard size={20} /> },
    ...(isAdmin ? [
      { href: '/dashboard/clients', label: 'Müşteriler', icon: <Users size={20} /> },
      { href: '/dashboard/users', label: 'Kullanıcılar', icon: <UserCircle size={20} /> },
      { href: '/dashboard/logs', label: 'Sistem Logları', icon: <ClipboardList size={20} /> },
      { href: '/dashboard/accounting', label: 'Muhasebe', icon: <Wallet size={20} /> },
    ] : []),
    ...(canCredentials ? [
      { href: '/dashboard/credentials', label: 'Giriş Bilgileri', icon: <Lock size={20} /> },
    ] : []),
    ...(canNotes ? [
      { href: '/dashboard/notes', label: 'Kişisel Notlar', icon: <StickyNote size={20} /> },
    ] : []),
    ...(canWorkItems ? [
      { href: '/dashboard/work-items', label: 'İş Takip', icon: <CheckSquare size={20} /> },
    ] : []),
    ...(mailEnabled ? [
      { href: '/dashboard/mail', label: 'Mail', icon: <Mail size={20} /> },
    ] : []),
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
              prefetch={true}
              onMouseEnter={() => router.prefetch(item.href)}
              onFocus={() => router.prefetch(item.href)}
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
                {item.label === 'Kişisel Notlar' && hasNewNotes && (
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
                {item.label === 'İş Takip' && workItemCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-9px',
                    right: '-12px',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 5px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '999px',
                    border: '2px solid var(--bg-secondary)',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    lineHeight: 1
                  }}>{workItemCount > 99 ? '99+' : workItemCount}</span>
                )}
                {item.label === 'Mail' && unreadMailCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-9px',
                    right: '-12px',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 5px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '999px',
                    border: '2px solid var(--bg-secondary)',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    lineHeight: 1
                  }}>{unreadMailCount > 99 ? '99+' : unreadMailCount}</span>
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
