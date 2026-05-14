'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Stats Error:', error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <h2>Bir Hata Oluştu</h2>
      <p>Sayfa yüklenirken beklenmedik bir hata ile karşılaşıldı.</p>
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: 'rgba(239, 68, 68, 0.1)', 
        borderRadius: '8px',
        textAlign: 'left',
        fontSize: '0.8rem',
        fontFamily: 'monospace',
        overflowX: 'auto',
        maxWidth: '100%'
      }}>
        <p style={{ fontWeight: 'bold', color: '#ef4444', marginBottom: '0.5rem' }}>Hata Mesajı:</p>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message || 'Bilinmeyen hata'}</pre>
        {error.digest && (
          <p style={{ marginTop: '1rem', opacity: 0.7 }}>Digest: {error.digest}</p>
        )}
      </div>
      <button
        onClick={() => reset()}
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          background: 'var(--accent-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        Tekrar Dene
      </button>
    </div>
  );
}
