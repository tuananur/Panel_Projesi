'use client';

import { useState, useTransition } from 'react';
import { BellRing, Play, Save, CheckCircle2, AlertCircle, VolumeX, Volume2, Music, Zap, Sparkles, Bell, AlarmClock, Disc } from 'lucide-react';
import { saveNotificationSettingsAction } from '@/app/actions';
import { playNotificationSound, storeNotificationSound } from '../notification-sound';
import { NOTIFICATION_SOUND_OPTIONS } from '@/lib/appearance';

const SOUND_ICONS = {
  soft: <Volume2 size={20} />,
  bell: <Bell size={20} />,
  digital: <Disc size={20} />,
  chime: <Sparkles size={20} />,
  pop: <Music size={20} />,
  alert: <AlarmClock size={20} />,
  melody: <Music size={20} />,
  subtle: <Volume2 size={20} />,
  urgent: <Zap size={20} />,
  none: <VolumeX size={20} />,
};

export default function NotificationSettings({ initialSettings }) {
  const initialSound = initialSettings?.sound || 'soft';
  const [savedSound, setSavedSound] = useState(initialSound);
  const [sound, setSound] = useState(initialSound);
  const [message, setMessage] = useState(null);
  const [isPending, startTransition] = useTransition();

  const dirty = sound !== savedSound;

  const handleSave = () => {
    setMessage(null);
    const formData = new FormData();
    formData.set('sound', sound);
    startTransition(async () => {
      const result = await saveNotificationSettingsAction(formData);
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
        return;
      }
      const nextSound = result?.settings?.sound || sound;
      setSavedSound(nextSound);
      setSound(nextSound);
      storeNotificationSound(nextSound);
      setMessage({ type: 'success', text: 'Bildirim sesi kaydedildi.' });
    });
  };

  const testSound = (value) => {
    const played = playNotificationSound(value);
    if (value === 'none') {
      setMessage({ type: 'success', text: 'Sessiz seçildi; ses çalınmaz.' });
      return;
    }
    setMessage({
      type: played ? 'success' : 'error',
      text: played ? 'Ses testi çalındı.' : 'Tarayıcı sesi engelledi. Sayfaya tıklayıp tekrar deneyin.',
    });
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <BellRing size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.15rem' }}>Bildirim Ayarları</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Yeni bildirimlerde çalacak sesi seçin. İlk seste tarayıcı kullanıcı etkileşimi isteyebilir.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.85rem' }}>
        {NOTIFICATION_SOUND_OPTIONS.map((option) => {
          const selected = sound === option.value;
          return (
            <div
              key={option.value}
              onClick={() => { setMessage(null); setSound(option.value); }}
              style={{
                position: 'relative',
                padding: '1rem',
                borderRadius: '12px',
                border: `2px solid ${selected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                background: selected ? 'rgba(99, 102, 241, 0.06)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: selected ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                  {SOUND_ICONS[option.value] || <Volume2 size={20} />}
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{option.label}</span>
                {selected && (
                  <span style={{ marginLeft: 'auto', color: 'var(--accent-primary)' }}>
                    <CheckCircle2 size={16} />
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, minHeight: '2.2em' }}>
                {option.description}
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); testSound(option.value); }}
                className="btn"
                style={{
                  marginTop: 'auto',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                  padding: '0.4rem 0.7rem', fontSize: '0.78rem', fontWeight: 700,
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
                disabled={option.value === 'none'}
              >
                <Play size={12} /> Dene
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {message && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: message.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
              {message.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />} {message.text}
            </span>
          )}
          {dirty && !message && (
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>Kaydedilmemiş değişiklik</span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isPending || !dirty}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Save size={16} /> {isPending ? 'Kaydediliyor...' : 'Bildirim Sesini Kaydet'}
        </button>
      </div>
    </div>
  );
}
