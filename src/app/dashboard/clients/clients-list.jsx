'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpDown, Globe, MessageCircle, Mail } from 'lucide-react';
import EditClientModal from './edit-client-modal';
import DeleteClientButton from './delete-client-button';

function parseServices(raw) {
  try {
    return JSON.parse(raw || '[]');
  } catch {
    return raw ? String(raw).split(',').map((s) => s.trim()).filter(Boolean) : [];
  }
}

export default function ClientsList({ clients }) {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');

  const allServices = useMemo(() => {
    const set = new Set();
    clients.forEach((c) => parseServices(c.services).forEach((s) => set.add(s)));
    return [...set].sort();
  }, [clients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = clients.filter((client) => {
      const services = parseServices(client.services);
      if (serviceFilter !== 'all' && !services.includes(serviceFilter)) return false;
      if (!q) return true;
      const haystack = [client.companyName, client.contactName, client.email, client.phone, ...services].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'name-desc') return b.companyName.localeCompare(a.companyName, 'tr');
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return a.companyName.localeCompare(b.companyName, 'tr');
    });
    return list;
  }, [clients, search, serviceFilter, sortBy]);

  return (
  <>
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
      <div style={{ position: 'relative', flex: '1 1 220px' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input
          type="search"
          className="input-field"
          placeholder="Firma, kişi, e-posta ara…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '2rem', width: '100%' }}
        />
      </div>
      <select className="input-field" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} style={{ minWidth: '150px' }}>
        <option value="all">Tüm hizmetler</option>
        {allServices.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select className="input-field" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ minWidth: '160px' }}>
        <option value="name-asc">İsim (A→Z)</option>
        <option value="name-desc">İsim (Z→A)</option>
        <option value="newest">En yeni</option>
        <option value="oldest">En eski</option>
      </select>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <ArrowUpDown size={14} /> {filtered.length} müşteri
      </span>
    </div>

    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
            <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Firma</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>İletişim</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Hizmetler</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((client) => {
            const services = parseServices(client.services);
            const safePhone = client.phone || '';
            return (
              <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.5rem 0.75rem' }}>
                  <Link href={`/dashboard/client/${client.id}/stats`} style={{ fontWeight: 700, color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.85rem' }}>
                    {client.companyName}
                  </Link>
                  {client.website && (
                    <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                      <Globe size={10} /> Site
                    </a>
                  )}
                </td>
                <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 600 }}>{client.contactName}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                    {safePhone && (
                      <a href={`https://wa.me/${safePhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981' }}><MessageCircle size={12} /></a>
                    )}
                    {client.email && (
                      <a href={`mailto:${client.email}`} style={{ color: 'var(--accent-primary)' }} title={client.email}><Mail size={12} /></a>
                    )}
                  </div>
                </td>
                <td style={{ padding: '0.5rem 0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {services.map((s) => (
                      <span key={s} style={{ padding: '2px 6px', background: 'rgba(59,130,246,0.12)', color: 'var(--accent-primary)', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800 }}>{s}</span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '0.5rem 0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <EditClientModal client={client} />
                    <DeleteClientButton clientId={client.id} />
                  </div>
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Filtreye uyan müşteri yok.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </>
  );
}
