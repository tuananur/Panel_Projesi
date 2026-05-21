'use client';

import { useState } from 'react';
import { saveGoogleAnalyticsGlobalSettingsAction } from '@/app/actions';
import { ShieldCheck, Save, BarChart3 } from 'lucide-react';

export default function GoogleAnalyticsGlobalSettings({ initialConfig }) {
  const [config, setConfig] = useState(initialConfig || {});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.target);
    const result = await saveGoogleAnalyticsGlobalSettingsAction(formData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Google Analytics global ayarları başarıyla kaydedildi.' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setLoading(false);
  }

  return (
    <div className="card animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
          <BarChart3 size={20} style={{ color: '#F59E0B' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Google Analytics (GA4) Global API Ayarları</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Uygulama genelindeki Google Analytics OAuth bilgilerini ve API yenileme anahtarlarını yönetin.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Client ID
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#F59E0B', textDecoration: 'underline' }}>Console Git</a>
            </label>
            <input 
              type="text" 
              name="clientId" 
              className="input-field" 
              defaultValue={config.clientId || ''}
              placeholder="OAuth 2.0 Client ID"
            />
          </div>
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Client Secret
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#F59E0B', textDecoration: 'underline' }}>Console Git</a>
            </label>
            <input 
              type="password" 
              name="clientSecret" 
              className="input-field" 
              defaultValue={config.clientSecret || ''}
              placeholder="OAuth 2.0 Client Secret"
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Refresh Token (Ana Erişim Jetonu)
            <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#F59E0B', textDecoration: 'underline' }}>Token Üret (Playground)</a>
          </label>
          <textarea 
            name="refreshToken" 
            className="input-field" 
            rows={3}
            defaultValue={config.refreshToken || ''}
            placeholder="1//..."
            style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
          />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Google API Console üzerinden Google Analytics API yetkileri verilmiş ana yenileme jetonu.</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} /> 
            Bu bilgiler güvenli bir şekilde saklanır ve sadece sistem tarafından Google Analytics 4 API çağrıları için kullanılır.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
          {message && (
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: message.type === 'success' ? '#10b981' : '#ef4444' }}>
              {message.text}
            </span>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F59E0B' }}>
            <Save size={16} />
            {loading ? 'Kaydediliyor...' : 'Global Ayarları Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
