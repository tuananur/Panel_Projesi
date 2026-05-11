'use client';

import { Menu } from 'lucide-react';
import DailyQuote from './daily-quote';

export default function HeaderClient({ session, onMenuClick }) {
  if (!session) return null;

  const roleDisplayMap = {
    'ADMIN': 'Yönetici',
    'DESIGNER': 'Tasarımcı',
    'ADVERTISER': 'Reklamcı'
  };

  const displayRole = roleDisplayMap[session.role] || session.role;

  return (
    <header className="top-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'nowrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <button 
          onClick={onMenuClick}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '0.5rem',
            marginLeft: '-0.5rem'
          }}
        >
          <Menu size={24} />
        </button>
        
        <div className="user-greeting">
          <span className="text-muted">Hoş geldin, </span>
          <span style={{ fontWeight: 600 }}>{session.username}</span>
        </div>
      </div>

      <DailyQuote />
      
      <div className="role-badge" style={{ flexShrink: 0 }}>
        {displayRole}
      </div>
    </header>
  );
}
