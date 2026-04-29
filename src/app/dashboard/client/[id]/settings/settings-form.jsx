'use client';

import { useState } from 'react';
import { updateClientSettingsAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

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

export default function SettingsForm({ client }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
    setSuccess('');
    
    formData.append('socialAccounts', JSON.stringify(social));
    formData.append('socialSchedule', JSON.stringify(schedule));
    
    const result = await updateClientSettingsAction(client.id, formData);
    
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
      setSuccess('Ayarlar başarıyla kaydedildi.');
      setTimeout(() => setSuccess(''), 3000);
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit}>
      {error && (
        <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {success}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Top Section: Targets & Instructions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Haftalık Blog Hedefi (SEO)</label>
            <input 
              type="number" 
              name="weeklyBlogTarget" 
              className="input-field" 
              defaultValue={client.weeklyBlogTarget || 0}
              min="0"
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
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Bottom Section: Social Accounts Grid */}
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Sosyal Medya ve Planlama</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
            {Object.keys(social).map(platform => (
              <div key={platform} className="card" style={{ padding: '0.75rem', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <div className="input-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="input-label" style={{ fontSize: '0.7rem' }}>{platform} Linki</label>
                  <input 
                    type="url" 
                    className="input-field" 
                    placeholder="https://..."
                    value={social[platform]}
                    onChange={(e) => handleSocialChange(platform, e.target.value)}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                  />
                </div>
                
                {social[platform] && (
                  <div>
                    <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleScheduleToggle(platform, day)}
                          style={{
                            padding: '0.2rem 0.4rem',
                            fontSize: '0.6rem',
                            borderRadius: '3px',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            backgroundColor: (schedule[platform] || []).includes(day) ? 'var(--accent-primary)' : 'transparent',
                            color: (schedule[platform] || []).includes(day) ? 'white' : 'var(--text-secondary)',
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
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        style={{ width: '100%', marginTop: '1.5rem', padding: '0.6rem' }}
        disabled={loading}
      >
        {loading ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}
      </button>
    </form>
  );
}
