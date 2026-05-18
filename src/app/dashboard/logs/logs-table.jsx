'use client';

import { useMemo, useState } from 'react';
import { Activity, User as UserIcon, Filter, X, Search } from 'lucide-react';
import { LOG_ACTION_OPTIONS, LOG_ENTITY_OPTIONS } from '@/lib/log-constants';

const ACTION_BADGE = {
  CREATE: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
  UPDATE: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
  DELETE: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
  TOGGLE: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
  LOGIN: { bg: 'rgba(16, 185, 129, 0.15)', color: '#059669' },
  LOGOUT: { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' },
};

const DEFAULT_BADGE = { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' };

const toLocalDateKey = (value) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function LogsTable({ logs, users }) {
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [searchText, setSearchText] = useState('');

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return logs.filter((log) => {
      if (selectedUserId !== 'all' && String(log.userId) !== selectedUserId) return false;
      if (selectedDate && toLocalDateKey(log.createdAt) !== selectedDate) return false;
      if (selectedAction !== 'all' && log.action !== selectedAction) return false;
      if (selectedEntity !== 'all' && log.entityType !== selectedEntity) return false;
      if (q) {
        const haystack = [
          log.details,
          log.user?.username,
          log.client?.companyName,
          log.action,
          log.entityType,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [logs, selectedUserId, selectedDate, selectedAction, selectedEntity, searchText]);

  const hasFilter = selectedUserId !== 'all' || !!selectedDate || selectedAction !== 'all' || selectedEntity !== 'all' || !!searchText.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
          <Filter size={14} /> Filtre
        </div>

        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="search"
            className="input-field"
            placeholder="Detay, kullanıcı, müşteri ara…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ paddingLeft: '2rem', width: '100%' }}
          />
        </div>

        <select className="input-field" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} style={{ minWidth: '160px' }}>
          <option value="all">Tüm kullanıcılar</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.username}</option>
          ))}
        </select>

        <select className="input-field" value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)} style={{ minWidth: '140px' }}>
          {LOG_ACTION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select className="input-field" value={selectedEntity} onChange={(e) => setSelectedEntity(e.target.value)} style={{ minWidth: '150px' }}>
          {LOG_ENTITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <input type="date" className="input-field" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ minWidth: '150px' }} />

        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setSelectedUserId('all');
              setSelectedDate('');
              setSelectedAction('all');
              setSelectedEntity('all');
              setSearchText('');
            }}
            className="btn"
            style={{ background: 'rgba(255,255,255,0.05)', gap: '0.3rem', fontSize: '0.8rem' }}
          >
            <X size={14} /> Temizle
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {filtered.length} / {logs.length} kayıt
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', width: '38%' }}>Kullanıcı / İşlem</th>
                <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', width: '12%' }}>Tür</th>
                <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>Müşteri / Detay</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const badge = ACTION_BADGE[log.action] || DEFAULT_BADGE;
                const created = new Date(log.createdAt);
                const validDate = !isNaN(created.getTime());
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <UserIcon size={12} style={{ opacity: 0.6 }} />
                          <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{log.user?.username || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ padding: '1px 5px', borderRadius: '3px', fontSize: '0.55rem', fontWeight: 800, background: badge.bg, color: badge.color }}>{log.action}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                            {validDate
                              ? `${created.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Istanbul' })} · ${created.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })}`
                              : '—'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{log.entityType}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      {log.client && <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.15rem' }}>{log.client.companyName}</div>}
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>{log.details}</div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Activity size={40} style={{ opacity: 0.15, marginBottom: '0.75rem' }} />
                    <p style={{ margin: 0 }}>{hasFilter ? 'Filtreye uyan kayıt yok.' : 'Henüz aktivite kaydı yok.'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
