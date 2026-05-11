'use client';

import { useEffect, useState } from 'react';

export default function ClientNotesError({ error, reset }) {
  const [verboseDebug, setVerboseDebug] = useState(false);

  useEffect(() => {
    const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    setVerboseDebug(q?.get('debug') === '1');
  }, []);

  useEffect(() => {
    console.error('[ClientNotes route error]', {
      digest: error?.digest,
      message: error?.message,
      name: error?.name,
      cause: error?.cause,
      stack: error?.stack,
    });
    if (verboseDebug) {
      console.error('[ClientNotes route error VERBOSE]', error);
    }
  }, [error, verboseDebug]);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '720px' }}>
      <h1 className="heading-1" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
        İş takip listesi yüklenemedi
      </h1>
      <p className="text-muted" style={{ marginBottom: '1rem', lineHeight: 1.5 }}>
        Her zaman: tarayıcıda <strong>Geliştirici Araçları → Konsol</strong> →{' '}
        <code>[ClientNotes route error]</code>.
      </p>
      <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>Ayrıntılı ekran debug:</strong> adres çubuğuna <code>?debug=1</code> ekleyip sayfayı yenile; aşağıda
        mümkünse <code>message</code> ve <code>stack</code> görünür (production’da Next bazen mesajı kısar).
      </p>
      {error?.digest && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Digest: <code>{error.digest}</code>
        </p>
      )}
      {verboseDebug && (
        <pre
          style={{
            fontSize: '0.7rem',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px dashed #f59e0b',
            background: 'rgba(0,0,0,0.35)',
            overflow: 'auto',
            maxHeight: '280px',
            marginBottom: '1rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {error?.message ? `message:\n${error.message}\n\n` : ''}
          {error?.stack ? `stack:\n${error.stack}` : '(stack yok veya gizli)'}
        </pre>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={() => reset()}>
          Tekrar dene
        </button>
      </div>
    </div>
  );
}
