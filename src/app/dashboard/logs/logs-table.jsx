'use client';

import { useMemo, useState } from 'react';
import { Activity, User as UserIcon, Filter, X } from 'lucide-react';

const ACTION_BADGE = {
  CREATE: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
  UPDATE: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
  DELETE: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
  TOGGLE: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
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

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (selectedUserId !== 'all' && String(log.userId) !== selectedUserId) return false;
      if (selectedDate && toLocalDateKey(log.createdAt) !== selectedDate) return false;
      return true;
    });
  }, [logs, selectedUserId, selectedDate]);

  const hasFilter = selectedUserId !== 'all' || !!selectedDate;

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

        <select
          className="input-field"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          style={{ minWidth: '180px' }}
        >
          <option value="all">Tüm Kullanıcılar</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.username}</option>
          ))}
        </select>

        <input
          type="date"
          className="input-field"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ minWidth: '160px' }}
        />

        {hasFilter && (
          <button
            type="button"
            onClick={() => { setSelectedUserId('all'); setSelectedDate(''); }}
            className="btn"
            style={{ background: 'rgba(255,255,255,0.05)', gap: '0.3rem', fontSize: '0.8rem' }}
          >
            <X size={14} /> Temizle
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {filtered.length} kayıt {hasFilter ? '(filtrelenmiş)' : ''}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', width: '40%' }}>Kullanıcı / İşlem / Tarih</th>
                <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>Müşteri / Detay</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const badge = ACTION_BADGE[log.action] || DEFAULT_BADGE;
                const created = new Date(log.createdAt);
                const validDate = !isNaN(created.getTime());
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '0.4rem 0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                            <UserIcon size={8} style={{ opacity: 0.7 }} />
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>{log.user?.username || '—'}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '1px 4px',
                            borderRadius: '3px',
                            fontSize: '0.55rem',
                            fontWeight: 800,
                            background: badge.bg,
                            color: badge.color,
                          }}>
                            {log.action}
                          </span>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {validDate
                              ? `${created.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Istanbul' })} · ${created.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })}`
                              : '—'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.4rem 0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        {log.client && (
                          <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {log.client.companyName}
                          </div>
                        )}
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                          {log.details}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={2} style={{ padding: '4rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                      <Activity size={48} style={{ opacity: 0.1 }} />
                      <p>{hasFilter ? 'Filtreye uyan kayıt bulunamadı.' : 'Henüz herhangi bir aktivite kaydedilmedi.'}</p>
                    </div>
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
