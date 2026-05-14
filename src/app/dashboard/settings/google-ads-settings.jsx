'use client';

import { useState } from 'react';
import { saveGoogleAdsGlobalSettingsAction } from '@/app/actions';
import { ShieldCheck, Save, Key } from 'lucide-react';

export default function GoogleAdsGlobalSettings({ initialConfig }) {
  const [config, setConfig] = useState(initialConfig || {});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.target);
    const result = await saveGoogleAdsGlobalSettingsAction(formData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Google Ads global ayarları başarıyla kaydedildi.' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setLoading(false);
  }

  return (
    <div className="card animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(66, 133, 244, 0.03)', border: '1px solid rgba(66, 133, 244, 0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
        <div style={{ background: 'rgba(66, 133, 244, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
          <Key size={20} style={{ color: '#4285F4' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Google Ads Global API Ayarları</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Uygulama genelindeki Developer Token ve OAuth bilgilerini yönetin.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="input-group">
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Developer Token
            <a href="https://developers.google.com/google-ads/api/docs/first-call/dev-token" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#4285F4', textDecoration: 'underline' }}>Nasıl Alınır?</a>
          </label>
          <input 
            type="password" 
            name="developerToken" 
            className="input-field" 
            defaultValue={config.developerToken || ''}
            placeholder="Google Ads API Developer Token"
            style={{ fontFamily: 'monospace' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Client ID
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#4285F4', textDecoration: 'underline' }}>Console Git</a>
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
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#4285F4', textDecoration: 'underline' }}>Console Git</a>
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
            <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#4285F4', textDecoration: 'underline' }}>Token Üret (Playground)</a>
          </label>
          <textarea 
            name="refreshToken" 
            className="input-field" 
            rows={3}
            defaultValue={config.refreshToken || ''}
            placeholder="1//..."
            style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
          />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>beyinatölyesi@gmail.com ile üretilen ana yenileme jetonu.</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} /> 
            Bu bilgiler güvenli bir şekilde saklanır ve sadece sistem tarafından Google Ads API çağrıları için kullanılır.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
          {message && (
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: message.type === 'success' ? '#10b981' : '#ef4444' }}>
              {message.text}
            </span>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#4285F4' }}>
            <Save size={16} />
            {loading ? 'Kaydediliyor...' : 'Global Ayarları Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
