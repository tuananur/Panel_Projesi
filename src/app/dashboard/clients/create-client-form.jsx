'use client';

import { useState } from 'react';
import { createClientAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function CreateClientForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData) {
    setLoading(true);
    setError('');
    
    const result = await createClientAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
      setLoading(false);
      document.getElementById('create-client-form').reset();
    }
  }

  return (
    <form id="create-client-form" action={handleSubmit}>
      {error && (
        <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
      
      <div className="input-group">
        <label htmlFor="companyName" className="input-label">Firma Adı</label>
        <input 
          type="text" 
          id="companyName" 
          name="companyName" 
          className="input-field" 
          required 
        />
      </div>

      <div className="input-group">
        <label htmlFor="website" className="input-label">Web Sitesi</label>
        <input 
          type="url" 
          id="website" 
          name="website" 
          className="input-field" 
          placeholder="https://"
        />
      </div>

      <div className="input-group">
        <label htmlFor="contactName" className="input-label">İletişim Kişisi (Ad Soyad)</label>
        <input 
          type="text" 
          id="contactName" 
          name="contactName" 
          className="input-field" 
          required 
        />
      </div>

      <div className="input-group">
        <label htmlFor="phone" className="input-label">Telefon Numarası</label>
        <input 
          type="tel" 
          id="phone" 
          name="phone" 
          className="input-field" 
          required 
        />
      </div>

      <div className="input-group">
        <label className="input-label" style={{ marginBottom: '0.5rem' }}>Alınan Hizmetler</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="services" value="SEO" />
            <span>SEO</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="services" value="Sosyal Medya" />
            <span>Sosyal Medya</span>
          </label>
        </div>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        style={{ width: '100%', marginTop: '1rem' }}
        disabled={loading}
      >
        {loading ? 'Oluşturuluyor...' : 'Müşteri Oluştur'}
      </button>
    </form>
  );
}
