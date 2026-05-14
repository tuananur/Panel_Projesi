'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';

export default function ResetPage() {
  const [status, setStatus] = useState('Clearing cache and session data...');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const performReset = async () => {
      try {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear cookies if possible (client-side cookies only)
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }

        setStatus('Storage cleared. Redirecting to dashboard...');
        setDone(true);
        
        // Short delay to show the success state
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } catch (e) {
        setStatus('Reset failed: ' + e.message);
      }
    };

    performReset();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#0f172a',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          {done ? (
            <CheckCircle size={64} color="#10b981" className="animate-bounce" />
          ) : (
            <RefreshCw size={64} color="#3b82f6" className="animate-spin" />
          )}
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>
          {done ? 'Sıfırlama Tamamlandı' : 'Sistem Sıfırlanıyor'}
        </h1>
        <p style={{ color: '#94a3b8' }}>{status}</p>
      </div>
    </div>
  );
}
