'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions';
import { LogOut } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Çıkış yapılıyor...');
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasLoggedOut.current) return;
    hasLoggedOut.current = true;

    async function performLogout() {
      try {
        await logoutAction();
        setStatus('Başarıyla çıkış yapıldı. Giriş sayfasına yönlendiriliyorsunuz...');
        
        setTimeout(() => {
          router.push('/login');
          router.refresh(); // Refresh to clear any cached data
        }, 2000);
      } catch (error) {
        console.error('Logout error:', error);
        setStatus('Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
    
    performLogout();
  }, [router]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at center, var(--bg-secondary) 0%, var(--bg-primary) 100%)' 
    }}>
      <div className="glass-panel" style={{ 
        padding: '3.5rem 2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '1.5rem', 
        maxWidth: '400px', 
        width: '90%',
        textAlign: 'center',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: 'rgba(16, 185, 129, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#10b981',
          marginBottom: '0.5rem',
          border: '2px solid rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ animation: 'pulse 2s infinite' }}>
            <LogOut size={36} />
          </div>
        </div>
        
        <h1 className="heading-2" style={{ fontSize: '1.75rem', margin: 0, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Oturum Kapatıldı
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1rem' }}>
          {status}
        </p>
        
        <div style={{ 
          marginTop: '0.5rem', 
          width: '30px', 
          height: '30px', 
          border: '3px solid rgba(255,255,255,0.05)', 
          borderTopColor: 'var(--accent-primary)', 
          borderRadius: '50%', 
          animation: 'spin 0.8s linear infinite' 
        }} />
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
