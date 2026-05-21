'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  BellOff, 
  Search, 
  Trash2, 
  Mail, 
  MailOpen, 
  ExternalLink, 
  ClipboardCheck, 
  Clock, 
  AlertTriangle, 
  Cpu, 
  CheckCircle,
  Inbox,
  ArrowRight
} from 'lucide-react';
import { 
  deleteNotificationAction, 
  toggleNotificationReadAction, 
  deleteAllNotificationsAction, 
  markAllNotificationsReadAction,
  getNotificationsAction
} from '@/app/actions';

export default function NotificationsInbox({ initialNotifications = [], session }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isPending, startTransition] = useTransition();

  // Keep state in sync with real-time polling (polls every 4 seconds)
  useEffect(() => {
    const poll = async () => {
      const result = await getNotificationsAction(200);
      if (result?.success && result?.notifications) {
        // Only update if there's actually a change (e.g. length, or status changes)
        const currentIdsAndReads = notifications.map(n => `${n.id}-${n.readAt}`).join(',');
        const newIdsAndReads = result.notifications.map(n => `${n.id}-${n.readAt}`).join(',');
        if (currentIdsAndReads !== newIdsAndReads) {
          setNotifications(result.notifications);
        }
      }
    };

    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [notifications]);

  // Handle single notification click / redirection
  const handleNotificationClick = (notification) => {
    startTransition(async () => {
      if (!notification.readAt) {
        // Optimistically update
        setNotifications(prev => 
          prev.map(item => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item)
        );
        await toggleNotificationReadAction(notification.id);
      }
      
      if (notification.url) {
        router.push(notification.url);
      }
    });
  };

  // Toggle single read status
  const handleToggleRead = (id) => {
    startTransition(async () => {
      // Optimistic update
      setNotifications(prev =>
        prev.map(item => {
          if (item.id === id) {
            return { ...item, readAt: item.readAt ? null : new Date().toISOString() };
          }
          return item;
        })
      );
      await toggleNotificationReadAction(id);
    });
  };

  // Delete single notification
  const handleDelete = (id) => {
    startTransition(async () => {
      // Optimistic update
      setNotifications(prev => prev.filter(item => item.id !== id));
      await deleteNotificationAction(id);
    });
  };

  // Mark all as read bulk action
  const handleMarkAllRead = () => {
    if (unreadCount === 0) return;
    startTransition(async () => {
      // Optimistic update
      const nowStr = new Date().toISOString();
      setNotifications(prev => prev.map(item => ({ ...item, readAt: item.readAt || nowStr })));
      await markAllNotificationsReadAction();
    });
  };

  // Clear all notifications bulk action
  const handleClearAll = () => {
    if (notifications.length === 0) return;
    if (!confirm('Tüm bildirimlerinizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
    startTransition(async () => {
      setNotifications([]);
      await deleteAllNotificationsAction();
    });
  };

  // Count items
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.readAt).length;

  // Filter & Search computation
  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      // Search text filter
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        item.title.toLowerCase().includes(searchLower) || 
        item.message.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;

      // Category tab filter
      if (filter === 'unread') return !item.readAt;
      if (filter === 'read') return !!item.readAt;
      if (filter === 'WORK_ASSIGNED') return item.type === 'WORK_ASSIGNED';
      if (filter === 'REMINDER') return item.type === 'REMINDER';
      if (filter === 'system_alert') return ['SYSTEM', 'ALERT'].includes(item.type);
      if (filter === 'general') return !['WORK_ASSIGNED', 'REMINDER', 'SYSTEM', 'ALERT'].includes(item.type);
      
      return true;
    });
  }, [notifications, search, filter]);

  // Determine icon & color schemes per notification type
  const getTypeMeta = (type) => {
    switch (type) {
      case 'WORK_ASSIGNED':
        return {
          icon: <ClipboardCheck size={18} />,
          color: '#60a5fa', // Blue
          bg: 'rgba(96, 165, 250, 0.08)',
          label: 'İş Takip'
        };
      case 'REMINDER':
        return {
          icon: <Clock size={18} />,
          color: '#f59e0b', // Amber/Yellow
          bg: 'rgba(245, 158, 11, 0.08)',
          label: 'Hatırlatma'
        };
      case 'ALERT':
        return {
          icon: <AlertTriangle size={18} />,
          color: '#ef4444', // Red
          bg: 'rgba(239, 68, 68, 0.08)',
          label: 'Acil Durum'
        };
      case 'SYSTEM':
        return {
          icon: <Cpu size={18} />,
          color: '#10b981', // Green
          bg: 'rgba(16, 185, 129, 0.08)',
          label: 'Sistem'
        };
      default:
        return {
          icon: <Bell size={18} />,
          color: '#a855f7', // Violet
          bg: 'rgba(168, 85, 247, 0.08)',
          label: 'Genel'
        };
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingRight: '0.25rem' }}>
      {/* Upper Navigation Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        gap: '1.5rem', 
        alignItems: 'flex-start', 
        marginBottom: '2rem', 
        flexWrap: 'wrap' 
      }}>
        <div>
          <h1 className="heading-1" style={{ fontSize: '2.2rem', marginBottom: '0.4rem', fontWeight: 900 }}>Bildirimlerim</h1>
          <p className="text-muted" style={{ fontSize: '0.92rem' }}>Sistem duyuruları, iş atamaları ve kişisel hatırlatmalarınız.</p>
        </div>

        {/* Dynamic Summary Cards */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="card" style={{ 
            padding: '0.9rem 1.4rem', 
            minWidth: '150px', 
            background: 'rgba(255, 255, 255, 0.02)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem'
          }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>{totalCount}</span>
            <span className="text-muted" style={{ fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.02em' }}>TOPLAM BİLDİRİM</span>
          </div>

          <div className="card" style={{ 
            padding: '0.9rem 1.4rem', 
            minWidth: '150px', 
            background: unreadCount > 0 ? 'rgba(239, 68, 68, 0.04)' : 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(10px)',
            border: unreadCount > 0 ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem'
          }}>
            <span style={{ 
              fontSize: '1.8rem', 
              fontWeight: 900, 
              color: unreadCount > 0 ? '#ef4444' : 'var(--text-secondary)',
              textShadow: unreadCount > 0 ? '0 0 15px rgba(239, 68, 68, 0.25)' : 'none'
            }}>{unreadCount}</span>
            <span className="text-muted" style={{ fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.02em' }}>OKUNMAMIŞ BİLDİRİM</span>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="card" style={{ 
        padding: '1.5rem', 
        background: 'rgba(255,255,255,0.015)', 
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '20px'
      }}>
        {/* Search, Filter Bar and Bulk Actions */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '1.25rem', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {/* Dynamic Search Box */}
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '450px' }}>
            <Search size={18} style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-secondary)' 
            }} />
            <input 
              type="text" 
              placeholder="Bildirimlerde arayın..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="input-field"
              style={{ 
                paddingLeft: '2.6rem', 
                width: '100%', 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '0.9rem',
                height: '42px'
              }}
            />
          </div>

          {/* Bulk Action Buttons */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {unreadCount > 0 && (
              <button 
                type="button" 
                onClick={handleMarkAllRead} 
                disabled={isPending}
                className="btn btn-secondary"
                style={{ 
                  fontSize: '0.8rem', 
                  padding: '0.55rem 0.9rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  borderRadius: '10px'
                }}
              >
                <CheckCircle size={15} />
                Tümünü Okundu Yap
              </button>
            )}

            {totalCount > 0 && (
              <button 
                type="button" 
                onClick={handleClearAll} 
                disabled={isPending}
                className="btn"
                style={{ 
                  fontSize: '0.8rem', 
                  padding: '0.55rem 0.9rem', 
                  color: '#ef4444', 
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.12)',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  borderRadius: '10px'
                }}
              >
                <Trash2 size={15} />
                Kutuyu Temizle
              </button>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '0.4rem', 
          overflowX: 'auto', 
          paddingBottom: '0.8rem', 
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {[
            { key: 'all', label: 'Tümü', badge: totalCount },
            { key: 'unread', label: 'Okunmamış', badge: unreadCount },
            { key: 'read', label: 'Okunmuş', badge: totalCount - unreadCount },
            { key: 'WORK_ASSIGNED', label: 'İş Takip', badge: notifications.filter(n => n.type === 'WORK_ASSIGNED').length },
            { key: 'REMINDER', label: 'Hatırlatma', badge: notifications.filter(n => n.type === 'REMINDER').length },
            { key: 'system_alert', label: 'Sistem & Acil', badge: notifications.filter(n => ['SYSTEM', 'ALERT'].includes(n.type)).length },
            { key: 'general', label: 'Genel', badge: notifications.filter(n => !['WORK_ASSIGNED', 'REMINDER', 'SYSTEM', 'ALERT'].includes(n.type)).length },
          ].map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className="btn"
                style={{
                  background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  padding: '0.5rem 0.9rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span style={{ 
                    padding: '0.1rem 0.4rem', 
                    borderRadius: '99px', 
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)', 
                    color: isActive ? 'white' : 'var(--text-primary)',
                    fontSize: '0.68rem',
                    fontWeight: 800
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* List of Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredNotifications.length === 0 ? (
            /* Elegant Empty State */
            <div style={{ 
              padding: '4rem 2rem', 
              textAlign: 'center', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '1rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '50%',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem'
              }}>
                <Inbox size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Gösterilecek bildirim yok</h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '360px', margin: '0 auto', lineHeight: '1.45' }}>
                {search ? 'Arama kriterlerinize uyan bildirim bulunamadı. Lütfen aramayı değiştirmeyi deneyin.' : 'Bu filtre altında henüz bir bildirim kaydınız bulunmuyor.'}
              </p>
              <button 
                type="button" 
                onClick={() => router.push('/dashboard')}
                className="btn btn-secondary" 
                style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                Ana Sayfaya Dön
              </button>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const meta = getTypeMeta(item.type);
              const isUnread = !item.readAt;
              
              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '14px',
                    background: isUnread ? 'rgba(255, 255, 255, 0.025)' : 'rgba(255,255,255,0.005)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s ease',
                    boxShadow: isUnread ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                  className="notification-item-card"
                >
                  {/* Left Colored Ribbon */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: meta.color,
                    boxShadow: isUnread ? `0 0 10px ${meta.color}` : 'none'
                  }} />

                  {/* Inner Card Content Wrapper */}
                  <div style={{ 
                    padding: '1.1rem 1.25rem 1.1rem 1.5rem', 
                    display: 'flex', 
                    gap: '1rem', 
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                  }}>
                    {/* Left Icon Panel */}
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: meta.bg,
                      color: meta.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {meta.icon}
                    </div>

                    {/* Middle Info Panel */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {isUnread && (
                          <span style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            background: '#ef4444', 
                            boxShadow: '0 0 8px rgba(239,68,68,0.7)',
                            flexShrink: 0 
                          }} />
                        )}
                        <span style={{ 
                          fontSize: '0.68rem', 
                          fontWeight: 800, 
                          color: meta.color,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase'
                        }}>
                          {meta.label}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>·</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                          {new Date(item.createdAt).toLocaleString('tr-TR')}
                        </span>
                      </div>

                      <h4 style={{ 
                        fontSize: '0.94rem', 
                        fontWeight: isUnread ? 900 : 700, 
                        color: isUnread ? 'var(--text-primary)' : 'var(--text-secondary)',
                        marginTop: '0.35rem',
                        marginBottom: '0.2rem'
                      }}>
                        {item.title}
                      </h4>

                      <p style={{ 
                        fontSize: '0.84rem', 
                        color: 'var(--text-secondary)', 
                        lineHeight: '1.45',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {item.message}
                      </p>
                    </div>

                    {/* Right Action Panel */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.45rem', 
                      flexShrink: 0,
                      alignSelf: 'center'
                    }}>
                      {/* Redirect Button */}
                      {item.url && (
                        <button
                          type="button"
                          onClick={() => handleNotificationClick(item)}
                          disabled={isPending}
                          className="btn btn-secondary"
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Git / Ayrıntıları Gör"
                        >
                          <ExternalLink size={15} />
                        </button>
                      )}

                      {/* Read Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleRead(item.id)}
                        disabled={isPending}
                        className="btn btn-secondary"
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isUnread ? 'var(--text-primary)' : 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                        title={isUnread ? "Okundu Olarak İşaretle" : "Okunmamış Olarak İşaretle"}
                      >
                        {isUnread ? <Mail size={15} /> : <MailOpen size={15} />}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        className="btn btn-secondary"
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                        title="Bildirimi Sil"
                      >
                        <Trash2 size={15} style={{ opacity: 0.8 }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Vanilla CSS Hover Styles injection */}
      <style jsx global>{`
        .notification-item-card:hover {
          background: rgba(255, 255, 255, 0.04) !important;
          border-color: rgba(255, 255, 255, 0.09) !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
}
