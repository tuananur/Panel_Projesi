'use client';

import { useState } from 'react';
import { createClientAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import CustomDialog from '@/app/components/custom-dialog';

export default function CreateClientForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [websiteType, setWebsiteType] = useState('OTHER');
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
          <label htmlFor="logoUrl" className="input-label">Logo Linki (URL) – Instagram hesabı @kullanıcıadi ya da https://instagram.com/kullanıcıadi</label>
          <input 
            type="url" 
            id="logoUrl" 
            name="logoUrl" 
            className="input-field" 
            placeholder="https://.../logo.png veya @kullanıcıadi"
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
        <label htmlFor="email" className="input-label">E-posta Adresi</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          className="input-field" 
          placeholder="ornek@mail.com"
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

      <div className="input-group">
        <label htmlFor="websiteType" className="input-label">Websitesi Altyapısı</label>
        <select 
          id="websiteType" 
          name="websiteType" 
          className="input-field"
          value={websiteType}
          onChange={(e) => setWebsiteType(e.target.value)}
        >
          <option value="OTHER">Diğer</option>
          <option value="BEYIN_ATOLYESI">Beyin Atölyesi</option>
          <option value="IDEASOFT">Ideasoft</option>
        </select>
      </div>

      {websiteType === 'BEYIN_ATOLYESI' && (
        <div className="input-group animate-fade-in">
          <label htmlFor="blogApiUrl" className="input-label">Blog API URL</label>
          <input 
            type="url" 
            id="blogApiUrl" 
            name="blogApiUrl" 
            className="input-field" 
            placeholder="https://..."
            required={websiteType === 'BEYIN_ATOLYESI'}
          />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            * Bu adresten bloglar otomatik olarak çekilecektir.
          </p>
        </div>
      )}

      <button 
        type="submit" 
        className="btn btn-primary" 
        style={{ width: '100%', marginTop: '1rem' }}
        disabled={loading}
      >
        {loading ? 'Oluşturuluyor...' : 'Müşteri Oluştur'}
      </button>

      <CustomDialog
        isOpen={!!error}
        title="Hata"
        onClose={() => setError('')}
        onConfirm={() => setError('')}
        confirmText="Tamam"
        showCancel={false}
      >
        <div style={{ color: 'var(--text-secondary)' }}>
          {error}
        </div>
      </CustomDialog>
    </form>
  );
}
