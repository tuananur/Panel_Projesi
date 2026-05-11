'use client';

import { useEffect } from 'react';

export default function ClientNotesError({ error, reset }) {
  useEffect(() => {
    // Production’da ekranda mesaj gizlenir; konsolda digest + Error nesnesi görünür.
    console.error('[ClientNotes route error]', {
      digest: error?.digest,
      message: error?.message,
      name: error?.name,
      cause: error?.cause,
      stack: error?.stack,
    });
  }, [error]);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '640px' }}>
      <h1 className="heading-1" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
        İş takip listesi yüklenemedi
      </h1>
      <p className="text-muted" style={{ marginBottom: '1rem', lineHeight: 1.5 }}>
        Sunucu tarafında bir hata oluştu. Tarayıcıda <strong>Geliştirici Araçları → Konsol</strong> açıp
        <code style={{ margin: '0 0.25rem' }}>[ClientNotes route error]</code> satırına bakın; orada digest ve
        mümkünse ayrıntılar yazar.
      </p>
      {error?.digest && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Digest: <code>{error.digest}</code>
        </p>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={() => reset()}>
          Tekrar dene
        </button>
      </div>
    </div>
  );
}
