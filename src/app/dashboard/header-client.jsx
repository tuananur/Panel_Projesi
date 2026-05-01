'use client';

import { Menu } from 'lucide-react';

export default function HeaderClient({ session, onMenuClick }) {
  if (!session) return null;

  // Translate roles for display
  const roleDisplayMap = {
    'ADMIN': 'Yönetici',
    'DESIGNER': 'Tasarımcı',
    'ADVERTISER': 'Reklamcı'
  };

  const displayRole = roleDisplayMap[session.role] || session.role;

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onMenuClick}
          className="mobile-menu-btn"
          style={{
            display: 'none', // Hidden by default, shown via CSS or media query in JS
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
      
      <div className="role-badge">
        {displayRole}
      </div>

    </header>
  );
}
