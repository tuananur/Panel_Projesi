'use client';

import { useState } from 'react';
import { updateClientSettingsAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import CustomDialog from '@/app/components/custom-dialog';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_LABELS = {
  'Monday': 'Pzt',
  'Tuesday': 'Sal',
  'Wednesday': 'Çar',
  'Thursday': 'Per',
  'Friday': 'Cum',
  'Saturday': 'Cmt',
  'Sunday': 'Paz'
};

export default function SettingsForm({ client, role }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('seo');

  const isDesigner = role === 'DESIGNER';
  const isAdvertiser = role === 'ADVERTISER';
  const isAdmin = role === 'ADMIN';

  const canEditSEO = isAdmin || isAdvertiser;
  const canEditSocial = isAdmin || isDesigner;
  
  const currentSocial = JSON.parse(client.socialAccounts || '{}');
  const currentSchedule = JSON.parse(client.socialSchedule || '{}');
  
  const [social, setSocial] = useState({
    Instagram: currentSocial.Instagram || '',
    YouTube: currentSocial.YouTube || '',
    Facebook: currentSocial.Facebook || '',
    LinkedIn: currentSocial.LinkedIn || '',
    X: currentSocial.X || '',
    Pinterest: currentSocial.Pinterest || ''
  });

  const [schedule, setSchedule] = useState(currentSchedule);

  const handleSocialChange = (platform, value) => {
    setSocial(prev => ({ ...prev, [platform]: value }));
  };

  const handleScheduleToggle = (platform, day) => {
    setSchedule(prev => {
      const platformDays = prev[platform] || [];
      const newDays = platformDays.includes(day) 
        ? platformDays.filter(d => d !== day)
        : [...platformDays, day];
      return { ...prev, [platform]: newDays };
    });
  };

  async function handleSubmit(formData) {
    setLoading(true);
    setError('');
    
    formData.append('socialAccounts', JSON.stringify(social));
    formData.append('socialSchedule', JSON.stringify(schedule));
    
    const result = await updateClientSettingsAction(client.id, formData);
    
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
      setIsSuccessDialogOpen(true);
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* SOL PANEL: SEO Ayarları */}
        <div className="card animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
            SEO Ayarları
          </h3>
          
          {!canEditSEO && (
            <div style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
              Bu bölümü düzenleme yetkiniz bulunmamaktadır.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label">Haftalık Blog Hedefi (SEO)</label>
              <input 
                type="number" 
                name="weeklyBlogTarget" 
                className="input-field" 
                defaultValue={client.weeklyBlogTarget || 0}
                min="0"
                disabled={!canEditSEO}
                style={{ opacity: canEditSEO ? 1 : 0.6 }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Müşteri E-posta Adresi</label>
              <input 
                type="email" 
                name="email" 
                className="input-field" 
                defaultValue={client.email || ''}
                placeholder="ornek@mail.com"
                disabled={!isAdmin}
                style={{ opacity: isAdmin ? 1 : 0.6 }}
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Müşteri Logosu (URL)</label>
              <input 
                type="text" 
                name="logoUrl" 
                className="input-field" 
                defaultValue={client.logoUrl || ''}
                placeholder="https://.../logo.png veya @kullanıcıadi"
                disabled={!isAdmin}
                style={{ opacity: isAdmin ? 1 : 0.6 }}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Logonun görünmesi için doğrudan resim bağlantısını yapıştırın.</p>
            </div>

            <div className="input-group">
              <label className="input-label">Özel Talimatlar / Notlar</label>
              <textarea 
                name="specialInstructions" 
                className="input-field" 
                rows={8}
                defaultValue={client.specialInstructions || ''}
                placeholder="Müşteriye özel stratejiler..."
                style={{ resize: 'vertical', opacity: isAdmin ? 1 : 0.6 }}
                disabled={!isAdmin}
              />
            </div>

            {(isAdmin || canEditSEO) && (
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: 'auto', padding: '0.8rem', fontSize: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Kaydediliyor...' : 'SEO Ayarlarını Kaydet'}
              </button>
            )}
          </div>
        </div>

        {/* SAĞ PANEL: Sosyal Medya Ayarları */}
        <div className="card animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
            Sosyal Medya ve Planlama
          </h3>

          {!canEditSocial && (
            <div style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
              Bu bölümü düzenleme yetkiniz bulunmamaktadır.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {Object.keys(social).map(platform => (
              <div key={platform} style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', opacity: canEditSocial ? 1 : 0.7 }}>
                <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>{platform} Linki</label>
                  <input 
                    type="url" 
                    className="input-field" 
                    placeholder="https://..."
                    value={social[platform]}
                    onChange={(e) => handleSocialChange(platform, e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                    disabled={!canEditSocial}
                  />
                </div>
                
                {social[platform] && (
                  <div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => canEditSocial && handleScheduleToggle(platform, day)}
                          disabled={!canEditSocial}
                          style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.65rem',
                            borderRadius: '5px',
                            border: '1px solid var(--border-color)',
                            cursor: canEditSocial ? 'pointer' : 'default',
                            backgroundColor: (schedule[platform] || []).includes(day) ? 'var(--accent-primary)' : 'transparent',
                            color: (schedule[platform] || []).includes(day) ? 'white' : 'var(--text-secondary)',
                            opacity: (schedule[platform] || []).includes(day) ? 1 : (canEditSocial ? 1 : 0.3),
                            fontWeight: 600,
                            transition: 'all 0.2s'
                          }}
                        >
                          {DAY_LABELS[day]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {(canEditSocial || isAdmin) && (
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 'auto', padding: '0.8rem', fontSize: '1rem', background: 'var(--accent-gradient)' }}
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Sosyal Medya Ayarlarını Kaydet'}
            </button>
          )}
        </div>

        {/* YENİ PANEL: Meta Ads Ayarları */}
        <div className="card animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
            Meta Ads API Ayarları
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input type="hidden" name="metaEnabled" value="on" />

            <div className="input-group">
              <label className="input-label">Ad Account ID (act_xxxxxxxx)</label>
              <input 
                type="text" 
                name="metaAdAccountId" 
                className="input-field" 
                defaultValue={client.metaAdAccountId || ''}
                placeholder="Örn: act_123456789"
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Reklam hesabınızın benzersiz kimlik numarası.</p>
            </div>

            <div className="input-group">
              <label className="input-label">Meta Access Token</label>
              <textarea 
                name="metaAccessToken" 
                className="input-field" 
                rows={4}
                defaultValue={client.metaAccessToken || ''}
                placeholder="EAA..."
                style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Meta Marketing API erişim jetonu.</p>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <p style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>İpucu:</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Access Token almak için Meta Developers panelinden 'Ads Management' izinlerine sahip bir token oluşturmalısınız.
              </p>
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ width: '100%', marginTop: 'auto', padding: '0.8rem', fontSize: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Meta Ayarlarını Kaydet'}
            </button>
          </div>
        </div>
      </div>

      <CustomDialog
        isOpen={isSuccessDialogOpen}
        title="Başarılı"
        onClose={() => setIsSuccessDialogOpen(false)}
        onConfirm={() => setIsSuccessDialogOpen(false)}
        confirmText="Tamam"
        showCancel={false}
      >
        <div style={{ color: 'var(--text-secondary)' }}>
          Ayarlar başarıyla kaydedildi.
        </div>
      </CustomDialog>

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
