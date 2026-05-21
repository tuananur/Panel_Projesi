'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle2 } from 'lucide-react';
import { getNotificationsAction, markNotificationReadAction, markAllNotificationsReadAction } from '@/app/actions';
import { getStoredNotificationSound, playNotificationSound, storeNotificationSound } from './notification-sound';

export default function NotificationBell({ initialSound = 'soft' }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);
  const [sound, setSound] = useState(() => initialSound || 'soft');
  const [filter, setFilter] = useState('all');
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
      const result = await getNotificationsAction(50);
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

  const visibleNotifications = notifications.filter((item) => {
    if (filter === 'unread') return !item.readAt;
    if (filter !== 'all' && item.type !== filter) return false;
    return true;
  });

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (result?.success) {
        setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
        setCount(0);
      }
    });
  };

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
          <div style={{ padding: '0.75rem 0.75rem 0.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>Bildirimler</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{count} okunmamış</span>
          </div>
          <div style={{ padding: '0 0.75rem 0.5rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'unread', label: 'Okunmamış' },
              { id: 'WORK_ASSIGNED', label: 'İş' },
              { id: 'REMINDER', label: 'Hatırlatma' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: '999px',
                  border: '1px solid var(--border-color)',
                  background: filter === tab.id ? 'var(--accent-primary)' : 'transparent',
                  color: filter === tab.id ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
            {count > 0 && (
              <button type="button" onClick={handleMarkAllRead} disabled={isPending} className="btn" style={{ marginLeft: 'auto', fontSize: '0.68rem', padding: '0.25rem 0.5rem' }}>
                Tümünü okundu işaretle
              </button>
            )}
          </div>
          {visibleNotifications.length === 0 ? (
            <div style={{ padding: '1.25rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Bildirim yok.</div>
          ) : visibleNotifications.map((item) => (
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

          <div style={{ 
            borderTop: '1px solid var(--border-color)', 
            marginTop: '0.6rem', 
            paddingTop: '0.6rem', 
            paddingLeft: '0.2rem',
            paddingRight: '0.2rem',
            display: 'flex', 
            justifyContent: 'center' 
          }}>
            <button 
              type="button" 
              onClick={() => { setOpen(false); router.push('/dashboard/notifications'); }}
              className="btn btn-secondary" 
              style={{ 
                width: '100%', 
                fontSize: '0.78rem', 
                padding: '0.45rem', 
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 700
              }}
            >
              Tüm Bildirimleri Gör
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
