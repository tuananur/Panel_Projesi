'use client';

import { useState, useTransition } from 'react';
import { sendBulkNotificationAction } from '@/app/actions';
import { 
  Bell, Users, UserCheck, Zap, AlertCircle, CheckCircle2, 
  Search, Link2, Sparkles, Clock, Brain, Send, HelpCircle
} from 'lucide-react';
import { ROLE_LABELS } from '@/lib/permissions';

const NOTIFICATION_TYPES = [
  { value: 'GENERAL', label: 'Genel', icon: <Bell size={18} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', desc: 'Standart bilgi ve güncellemeler' },
  { value: 'REMINDER', label: 'Hatırlatma', icon: <Clock size={18} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', desc: 'İş takip, teslim günleri vb.' },
  { value: 'ALERT', label: 'Acil Durum', icon: <Zap size={18} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', desc: 'Kritik uyarılar, acil dönüşler' },
  { value: 'SYSTEM', label: 'Sistem', icon: <Brain size={18} />, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.2)', desc: 'Bakım, sürüm güncellemesi vb.' },
];

export default function SendNotificationForm({ users = [] }) {
  const [targetType, setTargetType] = useState('EVERYONE'); // 'EVERYONE' or 'SPECIFIC'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('GENERAL');
  const [feedback, setFeedback] = useState(null);
  const [isPending, startTransition] = useTransition();

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ROLE_LABELS[u.role] || u.role).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserToggle = (id) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(filteredUsers.map(u => u.id));
  };

  const handleDeselectAll = () => {
    setSelectedUsers([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim() || !message.trim()) {
      setFeedback({ type: 'error', text: 'Başlık ve mesaj alanları boş bırakılamaz.' });
      return;
    }

    if (targetType === 'SPECIFIC' && selectedUsers.length === 0) {
      setFeedback({ type: 'error', text: 'Lütfen bildirim göndermek için en az bir kullanıcı seçin.' });
      return;
    }

    const formData = new FormData();
    formData.set('title', title.trim());
    formData.set('message', message.trim());
    formData.set('url', url.trim());
    formData.set('type', type);
    formData.set('targetType', targetType);
    if (targetType === 'SPECIFIC') {
      formData.set('selectedUsers', selectedUsers.join(','));
    }

    startTransition(async () => {
      const result = await sendBulkNotificationAction(formData);
      if (result?.error) {
        setFeedback({ type: 'error', text: result.error });
      } else {
        setFeedback({ 
          type: 'success', 
          text: `Bildirim ${result.count} kullanıcıya başarıyla anlık olarak gönderildi!` 
        });
        // Clear fields on success
        setTitle('');
        setMessage('');
        setUrl('');
        setSelectedUsers([]);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="responsive-flex" style={{ gap: '2rem', alignItems: 'stretch' }}>
      {/* Left Form: Details */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
        <h2 className="heading-2" style={{ fontSize: '1.25rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="var(--accent-primary)" /> Bildirim Detayları
        </h2>
        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '-0.75rem', marginBottom: '0.5rem' }}>
          Mesajınızın konusunu, içeriğini ve görünüm biçimini belirleyin.
        </p>

        {/* Target Audience selection buttons */}
        <div className="input-group">
          <label className="input-label">Alıcı Kitlesi</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
            <div 
              onClick={() => setTargetType('EVERYONE')}
              style={{
                padding: '1rem',
                borderRadius: '12px',
                border: `2px solid ${targetType === 'EVERYONE' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                background: targetType === 'EVERYONE' ? 'rgba(59, 130, 246, 0.06)' : 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '8px', 
                background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Users size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Herkese Gönder</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Tüm panel üyelerine</span>
              </div>
            </div>

            <div 
              onClick={() => setTargetType('SPECIFIC')}
              style={{
                padding: '1rem',
                borderRadius: '12px',
                border: `2px solid ${targetType === 'SPECIFIC' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                background: targetType === 'SPECIFIC' ? 'rgba(59, 130, 246, 0.06)' : 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '8px', 
                background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <UserCheck size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Kişi Seç</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Belirli kullanıcılara</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Types cards */}
        <div className="input-group">
          <label className="input-label">Bildirim Türü</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', marginTop: '0.25rem' }}>
            {NOTIFICATION_TYPES.map((nt) => {
              const selected = type === nt.value;
              return (
                <div
                  key={nt.value}
                  onClick={() => setType(nt.value)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: `2px solid ${selected ? nt.color : 'var(--border-color)'}`,
                    background: selected ? nt.bg : 'rgba(255,255,255,0.01)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: nt.color }}>
                    {nt.icon}
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{nt.label}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.2 }}>{nt.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Title Input */}
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label" htmlFor="notification-title">Bildirim Başlığı</label>
            <span style={{ fontSize: '0.7rem', color: title.length > 50 ? '#ef4444' : 'var(--text-secondary)' }}>
              {title.length}/60 karakter
            </span>
          </div>
          <input
            id="notification-title"
            type="text"
            className="input-field"
            placeholder="Örn: Günlük Rapor Teslimi"
            maxLength={60}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isPending}
          />
        </div>

        {/* Message Input */}
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label" htmlFor="notification-message">Bildirim Mesajı</label>
            <span style={{ fontSize: '0.7rem', color: message.length > 250 ? '#ef4444' : 'var(--text-secondary)' }}>
              {message.length}/300 karakter
            </span>
          </div>
          <textarea
            id="notification-message"
            className="input-field"
            placeholder="Kullanıcılara iletmek istediğiniz mesaj..."
            maxLength={300}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={isPending}
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
        </div>

        {/* URL Destination Link */}
        <div className="input-group">
          <label className="input-label" htmlFor="notification-url" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Yönlendirme Linki (Opsiyonel) <HelpCircle size={13} title="Bildirime tıklandığında gidilecek sayfa adresi" />
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
              <Link2 size={16} />
            </span>
            <input
              id="notification-url"
              type="text"
              className="input-field"
              placeholder="Örn: /dashboard/work-items"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isPending}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {feedback && (
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${feedback.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
            color: feedback.type === 'error' ? '#ef4444' : '#10b981',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            fontSize: '0.85rem',
            lineHeight: 1.4,
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <span style={{ marginTop: '0.1rem', flexShrink: 0 }}>
              {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            </span>
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
          style={{
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.85rem',
            fontSize: '1rem',
            fontWeight: 700
          }}
        >
          <Send size={18} />
          {isPending ? 'Gönderiliyor...' : 'Bildirimi Anlık Gönder'}
        </button>
      </div>

      {/* Right Sidebar: Recipient Selection */}
      <div 
        className="card" 
        style={{ 
          width: '100%', 
          maxWidth: '350px', 
          flexShrink: 0, 
          display: targetType === 'SPECIFIC' ? 'flex' : 'none', 
          flexDirection: 'column', 
          gap: '1rem',
          minHeight: '400px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Kullanıcı Seçimi</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {selectedUsers.length} seçildi
          </span>
        </div>

        {/* User Search Input */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            <Search size={14} />
          </span>
          <input
            type="text"
            className="input-field"
            placeholder="Kullanıcı veya rol ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isPending}
            style={{ paddingLeft: '2.25rem', paddingRight: '0.5rem', fontSize: '0.8rem', height: '36px', width: '100%' }}
          />
        </div>

        {/* Select All / Deselect buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button" 
            onClick={handleSelectAll} 
            className="btn" 
            disabled={isPending || filteredUsers.length === 0}
            style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.72rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}
          >
            Tümünü Seç ({filteredUsers.length})
          </button>
          <button 
            type="button" 
            onClick={handleDeselectAll} 
            className="btn" 
            disabled={isPending || selectedUsers.length === 0}
            style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.72rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}
          >
            Seçimi Temizle
          </button>
        </div>

        {/* Scrollable list of users */}
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            border: '1px solid var(--border-color)', 
            borderRadius: '10px', 
            background: 'rgba(0,0,0,0.1)',
            maxHeight: '400px'
          }}
        >
          {filteredUsers.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textShadow: 'none', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.8rem' }}>
              Aramayla eşleşen kullanıcı bulunamadı.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isChecked = selectedUsers.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => !isPending && handleUserToggle(user.id)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: isChecked ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                    transition: 'all 0.15s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by outer click div
                    disabled={isPending}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.username}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      Rol: {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </div>
                  <span className="role-badge" style={{ fontSize: '0.55rem', padding: '1px 5px', flexShrink: 0 }}>
                    {user.role}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </form>
  );
}
