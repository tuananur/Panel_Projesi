'use client';

import { useState } from 'react';
import { updateClientAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';
import CustomDialog from '@/app/components/custom-dialog';

export default function EditClientModal({ client }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [websiteType, setWebsiteType] = useState(client.websiteType || 'OTHER');
  const router = useRouter();

  const currentServices = JSON.parse(client.services || '[]');

  async function handleSubmit(formData) {
    setLoading(true);
    setError('');
    
    const result = await updateClientAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setIsOpen(false);
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
        title="Düzenle"
      >
        <Edit size={14} /> <span className="hide-mobile">Düzenle</span>
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="heading-2" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Müşteriyi Düzenle</h2>
            
            <form action={handleSubmit}>
              <input type="hidden" name="id" value={client.id} />

              <div className="input-group">
                <label className="input-label">Firma Adı</label>
                <input type="text" name="companyName" className="input-field" defaultValue={client.companyName} required />
              </div>

              <div className="input-group">
                <label className="input-label">Web Sitesi</label>
                <input type="url" name="website" className="input-field" defaultValue={client.website || ''} placeholder="https://..." />
              </div>

              <div className="input-group">
                <label className="input-label">Logo Linki (URL) – Instagram hesabı @kullanıcıadi ya da https://instagram.com/kullanıcıadi</label>
                <input type="text" name="logoUrl" className="input-field" defaultValue={client.logoUrl || ''} placeholder="https://.../logo.png veya @kullanıcıadi" />
              </div>

              <div className="input-group">
                <label className="input-label">İletişim Kişisi</label>
                <input type="text" name="contactName" className="input-field" defaultValue={client.contactName} required />
              </div>

              <div className="input-group">
                <label className="input-label">E-posta Adresi</label>
                <input type="email" name="email" className="input-field" defaultValue={client.email || ''} placeholder="ornek@mail.com" />
              </div>

              <div className="input-group">
                <label className="input-label">Telefon Numarası</label>
                <input type="tel" name="phone" className="input-field" defaultValue={client.phone} required />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ marginBottom: '1rem' }}>Alınan Hizmetler</label>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="services" value="SEO" defaultChecked={currentServices.includes('SEO')} /> SEO
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="services" value="Sosyal Medya" defaultChecked={currentServices.includes('Sosyal Medya')} /> Sosyal Medya
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
                    defaultValue={client.blogApiUrl || ''}
                    placeholder="https://..."
                    required={websiteType === 'BEYIN_ATOLYESI'}
                  />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    * Bu adresten bloglar otomatik olarak çekilecektir.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  onClick={() => setIsOpen(false)}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </>
  );
}
