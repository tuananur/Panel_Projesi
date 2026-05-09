'use client';

import { useState } from 'react';
import { Copy, Check, Save, Lock, User, Globe } from 'lucide-react';
import { updateSocialCredentialsAction } from '@/app/actions';
import { useTheme } from '@/app/components/theme-provider';

const PLATFORMS = ['Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'X', 'Pinterest'];

const PLATFORM_ICONS = {
  Instagram: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  Facebook: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  LinkedIn: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
  YouTube: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.4 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
    </svg>
  ),
  X: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z" />
    </svg>
  ),
  Pinterest: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C1.124 21.627 0 16.958 0 11.987 0 5.367 5.367 0 11.987 0h.03z"/>
    </svg>
  )
};

export default function CredentialsTable({ initialClients }) {
  const [clients, setClients] = useState(initialClients);
  const [editingCell, setEditingCell] = useState(null); // { clientId, platform, field }
  const [tempValue, setTempValue] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setGlobalLoading } = useTheme();

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditing = (clientId, platform, field, value) => {
    setEditingCell({ clientId, platform, field });
    setTempValue(value || '');
  };

  const saveEdit = async () => {
    if (!editingCell || loading) return;
    const { clientId, platform, field } = editingCell;
    
    setLoading(true);
    setGlobalLoading(true);

    // Update local state immediately
    const updatedClients = clients.map(c => {
      if (c.id === clientId) {
        let social = {};
        try {
          social = JSON.parse(c.socialAccounts || '{}');
        } catch (e) { social = {}; }

        if (!social[platform] || typeof social[platform] === 'string') {
          social[platform] = { url: social[platform] || '', username: '', password: '' };
        }
        social[platform][field] = tempValue;
        return { ...c, socialAccounts: JSON.stringify(social) };
      }
      return c;
    });
    setClients(updatedClients);

    // Persist to DB
    await updateSocialCredentialsAction(clientId, platform, field, tempValue);
    setEditingCell(null);
    setLoading(false);
    setGlobalLoading(false);
  };

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, width: '200px' }}>MÜŞTERİ</th>
              {PLATFORMS.map(p => (
                <th key={p} style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {PLATFORM_ICONS[p]} {p.toUpperCase()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map(client => {
              let social = {};
              try {
                social = JSON.parse(client.socialAccounts || '{}');
              } catch (e) { social = {}; }

              return (
                <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {client.companyName}
                  </td>
                  {PLATFORMS.map(p => {
                    const data = typeof social[p] === 'object' ? social[p] : { url: social[p] || '', username: '', password: '' };
                    return (
                      <td key={p} style={{ padding: '0.75rem', borderLeft: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {/* Username Field */}
                          <div 
                            className="credential-box"
                            onDoubleClick={() => startEditing(client.id, p, 'username', data.username)}
                          >
                            {editingCell?.clientId === client.id && editingCell?.platform === p && editingCell?.field === 'username' ? (
                              <div style={{ display: 'flex', gap: '2px', width: '100%' }}>
                                <input 
                                  autoFocus
                                  className="input-field" 
                                  style={{ padding: '2px 6px', fontSize: '0.75rem', height: '24px' }}
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  onBlur={saveEdit}
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                />
                              </div>
                            ) : (
                              <>
                                <span className="credential-label"><User size={10} /></span>
                                <span className={data.username ? 'credential-text' : 'credential-placeholder'}>
                                  {data.username || 'Kullanıcı Adı'}
                                </span>
                                {data.username && (
                                  <button onClick={() => handleCopy(data.username, `${client.id}-${p}-u`)} className="copy-btn">
                                    {copiedId === `${client.id}-${p}-u` ? <Check size={12} /> : <Copy size={12} />}
                                  </button>
                                )}
                              </>
                            )}
                          </div>

                          {/* Password Field */}
                          <div 
                            className="credential-box"
                            onDoubleClick={() => startEditing(client.id, p, 'password', data.password)}
                          >
                            {editingCell?.clientId === client.id && editingCell?.platform === p && editingCell?.field === 'password' ? (
                              <div style={{ display: 'flex', gap: '2px', width: '100%' }}>
                                <input 
                                  autoFocus
                                  className="input-field" 
                                  style={{ padding: '2px 6px', fontSize: '0.75rem', height: '24px' }}
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  onBlur={saveEdit}
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                />
                              </div>
                            ) : (
                              <>
                                <span className="credential-label"><Lock size={10} /></span>
                                <span className={data.password ? 'credential-text' : 'credential-placeholder'}>
                                  {data.password ? '••••••••' : 'Şifre'}
                                </span>
                                {data.password && (
                                  <button onClick={() => handleCopy(data.password, `${client.id}-${p}-p`)} className="copy-btn">
                                    {copiedId === `${client.id}-${p}-p` ? <Check size={12} /> : <Copy size={12} />}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style jsx global>{`
        .credential-box {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 6px;
          min-height: 30px;
          transition: all 0.2s;
          cursor: text;
          user-select: none;
        }
        .credential-box:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.1);
        }
        .credential-label {
          color: var(--text-secondary);
          opacity: 0.6;
          display: flex;
          align-items: center;
        }
        .credential-text {
          font-size: 0.75rem;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
        .credential-placeholder {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-style: italic;
          opacity: 0.4;
          flex: 1;
        }
        .copy-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .copy-btn:hover {
          color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
