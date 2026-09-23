'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { updateClientWebsiteTypeAction } from '@/app/actions';
import { parseOtoBlogConfig } from '@/lib/oto-blog';
import OtoBlogSettingsModal from './oto-blog-settings-modal';

const WEBSITE_TYPES = [
  { value: 'BEYIN_ATOLYESI', label: 'Beyin Atölyesi' },
  { value: 'IDEASOFT', label: 'Ideasoft' },
  { value: 'OTHER', label: 'Diğer' },
];

export default function OtoBlogClients({ clients }) {
  const [rows, setRows] = useState(clients);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);
  const [settingsClient, setSettingsClient] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((client) => {
      const haystack = [client.companyName, client.website, client.websiteType].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, search]);

  async function handleTypeChange(clientId, websiteType) {
    setError(null);
    setSavingId(clientId);
    const previous = rows.find((row) => row.id === clientId)?.websiteType;
    setRows((current) => current.map((row) => (row.id === clientId ? { ...row, websiteType } : row)));

    const result = await updateClientWebsiteTypeAction(clientId, websiteType);
    if (!result?.success) {
      setRows((current) => current.map((row) => (row.id === clientId ? { ...row, websiteType: previous } : row)));
      setError(result?.error || 'Kayıt başarısız.');
    }
    setSavingId(null);
  }

  function openSettings(client) {
    setSettingsClient({
      ...client,
      config: parseOtoBlogConfig(client.otoBlogConfig, client.website),
    });
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <h2 className="heading-2" style={{ fontSize: '1.15rem', margin: 0 }}>Müşteriler</h2>
        <input
          type="search"
          className="input-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Müşteri veya site ara"
          style={{ maxWidth: '280px' }}
        />
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>{error}</p>}

      <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '0.7rem 0.6rem', borderBottom: '1px solid var(--border-color)' }}>Müşteri</th>
              <th style={{ padding: '0.7rem 0.6rem', borderBottom: '1px solid var(--border-color)' }}>Site</th>
              <th style={{ padding: '0.7rem 0.6rem', borderBottom: '1px solid var(--border-color)', width: '420px' }}>Site altyapısı</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => {
              const isBa = (client.websiteType || 'OTHER') === 'BEYIN_ATOLYESI';
              return (
                <tr key={client.id}>
                  <td style={{ padding: '0.75rem 0.6rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700 }}>
                    {client.companyName}
                  </td>
                  <td style={{ padding: '0.75rem 0.6rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    {client.website || '—'}
                  </td>
                  <td style={{ padding: '0.75rem 0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        className="input-field"
                        value={client.websiteType || 'OTHER'}
                        disabled={savingId === client.id}
                        onChange={(e) => handleTypeChange(client.id, e.target.value)}
                        style={{ fontSize: '0.82rem', flex: 1 }}
                      >
                        {WEBSITE_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn"
                        disabled={!isBa}
                        onClick={() => openSettings(client)}
                        title={isBa ? 'API ayarları' : 'Önce Beyin Atölyesi seç'}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          opacity: isBa ? 1 : 0.45,
                          cursor: isBa ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Ayarlar
                      </button>
                      {isBa ? (
                        <Link href={`/dashboard/oto-blog/${client.id}`} className="btn btn-primary" style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', textDecoration: 'none' }}>
                          Blog oluştur
                        </Link>
                      ) : (
                        <button type="button" className="btn btn-primary" disabled style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', opacity: 0.45 }}>
                          Blog oluştur
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '1.5rem 0.6rem', color: 'var(--text-secondary)' }}>
                  Müşteri bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {settingsClient && (
        <OtoBlogSettingsModal
          client={settingsClient}
          onClose={() => setSettingsClient(null)}
          onSaved={(config) => {
            setRows((current) => current.map((row) => (
              row.id === settingsClient.id ? { ...row, otoBlogConfig: JSON.stringify(config) } : row
            )));
          }}
        />
      )}
    </div>
  );
}
