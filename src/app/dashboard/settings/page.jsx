'use client';

import { useTheme } from '@/app/components/theme-provider';
import { Sun, Moon, Palette, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { theme, accent, changeTheme, changeAccent } = useTheme();

  const themes = [
    { id: 'dark', label: 'Karanlık', icon: <Moon size={20} />, description: 'Göz dostu gece modu' },
    { id: 'light', label: 'Aydınlık', icon: <Sun size={20} />, description: 'Klasik beyaz görünüm' },
  ];

  const accents = [
    { id: 'blue', label: 'Okyanus Mavisi', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    { id: 'purple', label: 'Mistisizm Moru', color: '#a855f7', gradient: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' },
    { id: 'green', label: 'Doğa Yeşili', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { id: 'orange', label: 'Gün Batımı', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { id: 'red', label: 'Enerji Kırmızısı', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
    { id: 'cyan', label: 'Siber Turkuaz', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
    { id: 'pink', label: 'Gül Pembesi', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
    { id: 'gold', label: 'Lüks Altın', color: '#eab308', gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 className="heading-2" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Genel Ayarlar</h2>
        <p className="text-muted">Dashboard görünümünü ve tercihlerini buradan kişiselleştirebilirsiniz.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Görünüm Modu */}
        <div className="card">
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}>
              <Palette size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Görünüm Modu</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {themes.map((t) => (
              <div 
                key={t.id}
                onClick={() => changeTheme(t.id)}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: `2px solid ${theme === t.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: theme === t.id ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: theme === t.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{t.icon}</span>
                  <span style={{ fontWeight: 600 }}>{t.label}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.description}</p>
                
                {theme === t.id && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--accent-primary)' }}>
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Renk Teması */}
        <div className="card">
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
              <Palette size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Vurgu Rengi</h3>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {accents.map((a) => (
              <div 
                key={a.id}
                onClick={() => changeAccent(a.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  padding: '1rem',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  border: `2px solid ${accent === a.id ? a.color : 'transparent'}`,
                  background: accent === a.id ? `${a.color}10` : 'transparent'
                }}
              >
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: a.gradient,
                  boxShadow: accent === a.id ? `0 0 15px ${a.color}60` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  {accent === a.id && <CheckCircle2 size={24} />}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: accent === a.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
