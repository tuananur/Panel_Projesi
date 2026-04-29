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
      background: 'var(--bg-primary)' 
    }}>
      <div className="glass-panel" style={{ 
        padding: '3rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '1.5rem', 
        maxWidth: '450px', 
        width: '90%',
        textAlign: 'center' 
      }}>
        <div style={{ 
          width: '70px', 
          height: '70px', 
          borderRadius: '50%', 
          background: 'rgba(16, 185, 129, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#10b981',
          marginBottom: '0.5rem'
        }}>
          <LogOut size={32} />
        </div>
        
        <h1 className="heading-2" style={{ fontSize: '1.5rem', margin: 0 }}>Oturum Kapatılıyor</h1>
        
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {status}
        </p>
        
        <div style={{ 
          marginTop: '1rem', 
          width: '24px', 
          height: '24px', 
          border: '3px solid rgba(255,255,255,0.1)', 
          borderTopColor: 'var(--accent-primary)', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
