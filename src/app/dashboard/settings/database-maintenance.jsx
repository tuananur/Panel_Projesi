'use client';

import { useState, useTransition } from 'react';
import { Database, ShieldAlert } from 'lucide-react';
import { runDatabaseMaintenanceAction } from '@/app/actions';

export default function DatabaseMaintenance() {
  const [message, setMessage] = useState(null);
  const [isPending, startTransition] = useTransition();

  const runMaintenance = () => {
    if (!confirm('Veritabanı güncellemesi çalıştırılsın mı? Bu işlem WorkItem tablolarını ve kullanıcı-yetkili alanını oluşturur.')) return;

    setMessage(null);
    startTransition(async () => {
      const result = await runDatabaseMaintenanceAction();
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
        return;
      }
      setMessage({ type: 'success', text: result?.message || 'Veritabanı güncellemesi tamamlandı.' });
    });
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} /> Veritabanı Güncelleme
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '620px' }}>
            Vercel/production ortamında terminal erişimi olmadığında yeni tabloları buradan tek tuşla oluşturabilirsiniz. İşlem tekrar çalıştırılabilir; mevcut tabloları silmez.
          </p>
        </div>
        <div style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldAlert size={16} /> Sadece admin
        </div>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          Eklenenler: kullanıcı yetkili bağlantısı, WorkItem / WorkItemEvent tabloları, ilişkiler ve indeksler.
        </p>
        <button type="button" className="btn btn-primary" onClick={runMaintenance} disabled={isPending}>
          {isPending ? 'Çalışıyor...' : 'DB Güncellemesini Çalıştır'}
        </button>
      </div>

      {message && (
        <div style={{ marginTop: '1rem', color: message.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
          {message.text}
        </div>
      )}
    </div>
  );
}
