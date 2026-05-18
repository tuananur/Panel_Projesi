'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, LogOut, Home } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Advanced logging for developers
    console.group('🔴 DASHBOARD_RUNTIME_CRASH');
    console.error('Error Message:', error?.message);
    console.error('Error Stack:', error?.stack);
    console.log('User Agent:', typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A');
    console.log('Path:', typeof window !== 'undefined' ? window.location.pathname : 'N/A');
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }, [error]);

  const handleHardReset = () => {
    if (typeof window !== 'undefined') {
      // Kullanıcının kişiselleştirme tercihleri (tema, vurgu, bildirim sesi) DB'de
      // saklı olsa da; flash önlemek ve anlık önbelleği bozmamak için bu anahtarları koruyoruz.
      const preserveKeys = ['theme', 'accent', 'custom-accent-color', 'notification-sound', 'sidebar-collapsed'];
      const preserved = {};
      preserveKeys.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value !== null) preserved[key] = value;
      });
      localStorage.clear();
      Object.entries(preserved).forEach(([key, value]) => localStorage.setItem(key, value));
      sessionStorage.clear();
      window.location.href = '/dashboard';
    }
  };

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-primary)',
      padding: '2rem',
      color: 'var(--text-primary)'
    }}>
      <div style={{ 
        maxWidth: '500px', 
        width: '100%', 
        background: 'var(--bg-secondary)', 
        padding: '3rem', 
        borderRadius: '24px', 
        textAlign: 'center',
        border: '1px solid var(--border-color)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 2rem',
          color: '#ef4444'
        }}>
          <AlertTriangle size={40} />
        </div>
        
        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1rem' }}>Sistem Hatası</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
          Dashboard yüklenirken beklenmedik bir sorun oluştu. Bu durum genellikle geçici bir veri uyuşmazlığından veya ağ sorunundan kaynaklanır.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={() => reset()} 
            style={{ 
              width: '100%', 
              padding: '1rem', 
              borderRadius: '12px', 
              fontSize: '1rem', 
              fontWeight: 700,
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)'
            }}
          >
            <RefreshCcw size={18} /> Tekrar Dene
          </button>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button 
              onClick={handleReload} 
              style={{ 
                padding: '0.75rem', 
                borderRadius: '12px', 
                fontSize: '0.85rem', 
                fontWeight: 600,
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              Yenile
            </button>
            <button 
              onClick={handleHardReset} 
              style={{ 
                padding: '0.75rem', 
                borderRadius: '12px', 
                fontSize: '0.85rem', 
                fontWeight: 600,
                background: 'rgba(239, 68, 68, 0.05)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <LogOut size={16} /> Sıfırla
            </button>
          </div>

          <button 
            onClick={() => window.location.href = '/dashboard'} 
            style={{ 
              marginTop: '0.5rem',
              padding: '0.75rem', 
              borderRadius: '12px', 
              fontSize: '0.85rem', 
              fontWeight: 600,
              background: 'none',
              color: 'var(--text-secondary)',
              border: '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Home size={16} /> Panele Dön
          </button>
        </div>
        
        {error && (
          <div style={{ 
            marginTop: '2rem', 
            paddingTop: '2rem', 
            borderTop: '1px solid var(--border-color)', 
            fontSize: '0.7rem', 
            color: 'var(--text-muted)', 
            textAlign: 'left', 
            opacity: 0.6 
          }}>
            <div style={{ marginBottom: '4px' }}><strong>Hata Kodu:</strong> {error.digest || 'RUNTIME_EXCEPTION'}</div>
            <div style={{ wordBreak: 'break-all' }}><strong>Mesaj:</strong> {error.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
