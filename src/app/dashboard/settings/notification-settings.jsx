'use client';

import { useState, useTransition } from 'react';
import { BellRing, Play, Save } from 'lucide-react';
import { saveNotificationSettingsAction } from '@/app/actions';
import { playNotificationSound, storeNotificationSound } from '../notification-sound';

const SOUND_OPTIONS = [
  { value: 'soft', label: 'Yumuşak' },
  { value: 'bell', label: 'Zil' },
  { value: 'digital', label: 'Dijital' },
  { value: 'none', label: 'Sessiz' },
];

export default function NotificationSettings({ initialSettings }) {
  const [sound, setSound] = useState(initialSettings?.sound || 'soft');
  const [message, setMessage] = useState(null);
  const [isPending, startTransition] = useTransition();

  const submit = (formData) => {
    setMessage(null);
    startTransition(async () => {
      const result = await saveNotificationSettingsAction(formData);
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
        return;
      }
      const nextSound = result?.settings?.sound || sound;
      setSound(nextSound);
      storeNotificationSound(nextSound);
      setMessage({ type: 'success', text: 'Bildirim ayarları kaydedildi.' });
    });
  };

  const testSound = () => {
    storeNotificationSound(sound);
    const played = playNotificationSound(sound);
    setMessage({
      type: played ? 'success' : 'error',
      text: played ? 'Ses testi çalındı.' : 'Tarayıcı sesi engelledi. Sayfaya tıklayıp tekrar deneyin.',
    });
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BellRing size={20} /> Bildirim Ayarları
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Yeni bildirimlerde çalacak sesi seçin. Tarayıcı ilk ses için kullanıcı etkileşimi isteyebilir.
        </p>
      </div>

      <form action={submit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '220px', fontSize: '0.8rem', fontWeight: 700 }}>
          Bildirim Sesi
          <select
            name="sound"
            value={sound}
            onChange={(event) => setSound(event.target.value)}
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem',
              outline: 'none',
            }}
          >
            {SOUND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} style={{ background: '#111827', color: '#f9fafb' }}>{option.label}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn" onClick={testSound} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Play size={16} /> Sesi Dene
        </button>
        <button className="btn btn-primary" disabled={isPending} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={16} /> {isPending ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '1rem', color: message.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
          {message.text}
        </div>
      )}
    </div>
  );
}
