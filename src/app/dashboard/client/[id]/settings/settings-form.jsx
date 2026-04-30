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
    TikTok: currentSocial.TikTok || ''
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
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', gap: '1.5rem' }}>
        <button 
          type="button" 
          onClick={() => setActiveTab('seo')}
          style={{ 
            padding: '0.75rem 0', 
            fontSize: '0.9rem', 
            fontWeight: 600, 
            color: activeTab === 'seo' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'seo' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          SEO Ayarları
        </button>
        <button 
          type="button" 
          onClick={() => setActiveTab('social')}
          style={{ 
            padding: '0.75rem 0', 
            fontSize: '0.9rem', 
            fontWeight: 600, 
            color: activeTab === 'social' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'social' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Sosyal Medya Ayarları
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {activeTab === 'seo' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
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
                disabled={!isAdmin} // Only admin can edit email? User didn't specify but usually yes.
                style={{ opacity: isAdmin ? 1 : 0.6 }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Özel Talimatlar / Notlar</label>
              <textarea 
                name="specialInstructions" 
                className="input-field" 
                rows={2}
                defaultValue={client.specialInstructions || ''}
                placeholder="Müşteriye özel stratejiler..."
                style={{ resize: 'vertical', opacity: isAdmin ? 1 : 0.6 }}
                disabled={!isAdmin}
              />
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Sosyal Medya ve Planlama</h3>
            {!canEditSocial && (
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '0.5rem', background: 'rgba(245,158,11,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                Bu bölümü düzenleme yetkiniz bulunmamaktadır.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
              {Object.keys(social).map(platform => (
                <div key={platform} className="card" style={{ padding: '0.75rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', opacity: canEditSocial ? 1 : 0.7 }}>
                  <div className="input-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="input-label" style={{ fontSize: '0.7rem' }}>{platform} Linki</label>
                    <input 
                      type="url" 
                      className="input-field" 
                      placeholder="https://..."
                      value={social[platform]}
                      onChange={(e) => handleSocialChange(platform, e.target.value)}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                      disabled={!canEditSocial}
                    />
                  </div>
                  
                  {social[platform] && (
                    <div>
                      <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                        {DAYS.map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => canEditSocial && handleScheduleToggle(platform, day)}
                            disabled={!canEditSocial}
                            style={{
                              padding: '0.2rem 0.4rem',
                              fontSize: '0.6rem',
                              borderRadius: '3px',
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
          </div>
        )}
      </div>

      {(isAdmin || (activeTab === 'seo' && isAdvertiser) || (activeTab === 'social' && isDesigner)) && (
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '1.5rem', padding: '0.6rem' }}
          disabled={loading}
        >
          {loading ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}
        </button>
      )}

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
