'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { saveElementAsSinglePdfPage } from '@/lib/pdf-export';

/**
 * Açık olan sekme dahil tüm rapor gövdesini tek uzun PDF sayfası olarak indirir.
 * Kaydedilecek alan `targetId` ile verilir; butonun kendisi PDF'e girmez.
 */
export default function ReportPdfButton({ targetId, fileName }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    const el = document.getElementById(targetId);
    if (!el || busy) return;

    setBusy(true);
    setError(null);
    try {
      await saveElementAsSinglePdfPage(el, fileName);
    } catch (err) {
      console.error('Rapor PDF üretimi başarısız:', err);
      setError('PDF oluşturulamadı');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-pdf-hide style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.5rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          background: busy ? 'transparent' : '#4285F4',
          color: busy ? 'var(--text-secondary)' : '#fff',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: busy ? 'progress' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {busy ? <Loader2 size={15} style={{ animation: 'spin 0.9s linear infinite' }} /> : <Download size={15} />}
        {busy ? 'PDF hazırlanıyor…' : 'PDF olarak kaydet'}
      </button>
      {error && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{error}</span>}
    </div>
  );
}
