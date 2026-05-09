'use client';

import { useState } from 'react';
import { Copy, Check, Save, Instagram, Facebook, Linkedin, Youtube, Twitter, Globe, Lock, User } from 'lucide-react';
import { updateSocialCredentialsAction } from '@/app/actions';

const PLATFORMS = ['Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'X', 'Pinterest'];

const PLATFORM_ICONS = {
  Instagram: <Instagram size={14} />,
  Facebook: <Facebook size={14} />,
  LinkedIn: <Linkedin size={14} />,
  YouTube: <Youtube size={14} />,
  X: <Twitter size={14} />,
  Pinterest: <Globe size={14} />,
};

export default function CredentialsTable({ initialClients }) {
  const [clients, setClients] = useState(initialClients);
  const [editingCell, setEditingCell] = useState(null); // { clientId, platform, field }
  const [tempValue, setTempValue] = useState('');
  const [copiedId, setCopiedId] = useState(null);

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
    if (!editingCell) return;
    const { clientId, platform, field } = editingCell;
    
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
