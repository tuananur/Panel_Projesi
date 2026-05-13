'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle2 } from 'lucide-react';
import { getNotificationsAction, markNotificationReadAction } from '@/app/actions';
import { getStoredNotificationSound, playNotificationSound, storeNotificationSound } from './notification-sound';

export default function NotificationBell({ initialSound = 'soft' }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);
  const [sound, setSound] = useState(() => initialSound || 'soft');
  const [isPending, startTransition] = useTransition();
  const previousCount = useRef(null);
  const originalTitle = useRef('');
  const blinkTimer = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      storeNotificationSound(initialSound || 'soft');
    }
  }, [initialSound]);

  useEffect(() => {
    if (typeof document !== 'undefined') originalTitle.current = document.title;

    const load = async () => {
      const result = await getNotificationsAction(20);
      if (!result?.success) return;
      setNotifications(result.notifications || []);
      setCount(result.count || 0);
      const currentSound = getStoredNotificationSound(sound);
      if (previousCount.current !== null && result.count > previousCount.current) {
        playNotificationSound(currentSound);
      }
      previousCount.current = result.count || 0;
    };

    load();
    const interval = setInterval(load, 3000);
    const onStorage = (event) => {
      if (event.key === 'notification-sound') setSound(event.newValue || 'soft');
    };
    const onSoundChange = (event) => setSound(event.detail?.sound || getStoredNotificationSound('soft'));
    const onFocus = () => load();
    window.addEventListener('storage', onStorage);
    window.addEventListener('notification-sound-change', onSoundChange);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('notification-sound-change', onSoundChange);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [sound]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (blinkTimer.current) {
      clearInterval(blinkTimer.current);
      blinkTimer.current = null;
      document.title = originalTitle.current || document.title;
    }
    if (count > 0) {
      let visible = false;
      blinkTimer.current = setInterval(() => {
        visible = !visible;
        document.title = visible ? `(${count}) Yeni bildirim` : (originalTitle.current || 'Dashboard');
      }, 1200);
    }
    return () => {
      if (blinkTimer.current) clearInterval(blinkTimer.current);
      if (originalTitle.current) document.title = originalTitle.current;
    };
  }, [count]);

  const handleClick = (notification) => {
    startTransition(async () => {
      const result = await markNotificationReadAction(notification.id);
      if (result?.success) {
        setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item));
        setCount((value) => Math.max(0, value - (notification.readAt ? 0 : 1)));
        setOpen(false);
        router.push(result.url || '/dashboard');
      }
    });
  };

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          background: 'rgba(255,255,255,0.04)',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
        title="Bildirimler"
      >
        <Bell size={20} />
        {count > 0 && (
          <span style={{
            position: 'absolute',
            top: '-7px',
            right: '-7px',
            minWidth: '20px',
            height: '20px',
            padding: '0 5px',
            borderRadius: '999px',
            background: '#ef4444',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--bg-secondary)',
          }}>{count > 99 ? '99+' : count}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.75rem)',
          right: 0,
          width: 'min(360px, calc(100vw - 2rem))',
          maxHeight: '430px',
          overflow: 'auto',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          padding: '0.5rem',
        }}>
          <div style={{ padding: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Bildirimler</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{count} okunmamış</span>
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '1.25rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Bildirim yok.</div>
          ) : notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={isPending}
              onClick={() => handleClick(item)}
              style={{
                width: '100%',
                textAlign: 'left',
                border: 'none',
                borderRadius: '10px',
                background: item.readAt ? 'transparent' : 'rgba(239,68,68,0.10)',
                color: 'var(--text-primary)',
                padding: '0.85rem',
                cursor: 'pointer',
                display: 'grid',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '0.88rem' }}>{item.title}</strong>
                {item.readAt && <CheckCircle2 size={14} color="#10b981" />}
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.35 }}>{item.message}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>{new Date(item.createdAt).toLocaleString('tr-TR')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
