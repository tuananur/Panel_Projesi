'use client';

import { useState } from 'react';
import { saveGeminiSettingsAction } from '@/app/actions';
import { ShieldCheck, Save, Sparkles } from 'lucide-react';

export default function AiSettings({ initialConfig }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const hasKey = Boolean(initialConfig?.apiKey);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.target);
    const result = await saveGeminiSettingsAction(formData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Gemini API anahtarı kaydedildi.' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setLoading(false);
  }

  return (
    <div className="card animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.12)', padding: '0.5rem', borderRadius: '8px' }}>
          <Sparkles size={20} style={{ color: '#8b5cf6' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>AI Ayarları</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Oto Blog üretimi için Gemini API anahtarı. Tek key, tüm müşteriler.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="input-group">
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Gemini API Anahtarı
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.65rem', color: '#8b5cf6', textDecoration: 'underline' }}>AI Studio</a>
          </label>
          <input
            type="password"
            name="apiKey"
            className="input-field"
            defaultValue={initialConfig?.apiKey || ''}
            placeholder="AIza..."
            autoComplete="off"
            style={{ fontFamily: 'monospace' }}
          />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            {hasKey ? 'Kayıtlı bir anahtar var. Değiştirmek için yenisini yazıp kaydet.' : 'Google AI Studio’dan ürettiğin Gemini API key.'}
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            Anahtar sunucuda saklanır, tarayıcıya gömülmez. Sadece üretim çağrılarında kullanılır.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
          {message && (
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: message.type === 'success' ? '#10b981' : '#ef4444' }}>
              {message.text}
            </span>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#8b5cf6' }}>
            <Save size={16} />
            {loading ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
