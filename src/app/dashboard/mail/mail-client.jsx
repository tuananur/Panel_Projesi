'use client';

import { useMemo, useState, useTransition } from 'react';
import { deleteInboxMessagesAction, getInboxMessageAction, getInboxMessagesAction, markInboxMessagesReadAction, sendMailAction } from '@/app/actions';
import { AlertCircle, Calendar, CheckCircle, Download, FileText, Inbox, Mail, Paperclip, Plus, RefreshCw, Search, Send, Trash2, X } from 'lucide-react';

export default function MailClient({ initialResult }) {
  const [messages, setMessages] = useState(initialResult?.messages || []);
  const [selectedUid, setSelectedUid] = useState(messages[0]?.uid || null);
  const [selectedUids, setSelectedUids] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState(initialResult?.error ? { type: 'error', text: initialResult.error } : null);
  const [isPending, startTransition] = useTransition();

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR');
    const startTime = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const endTime = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;

    return messages.filter((message) => {
      const searchable = `${message.from || ''} ${message.subject || ''}`.toLocaleLowerCase('tr-TR');
      const messageTime = message.date ? new Date(message.date).getTime() : null;
      if (normalizedQuery && !searchable.includes(normalizedQuery)) return false;
      if (startTime && (!messageTime || messageTime < startTime)) return false;
      if (endTime && (!messageTime || messageTime > endTime)) return false;
      return true;
    });
  }, [messages, query, startDate, endDate]);

  const allFilteredSelected = filteredMessages.length > 0 && filteredMessages.every((message) => selectedUids.includes(message.uid));

  const refresh = () => {
    setStatus(null);
    startTransition(async () => {
      const result = await getInboxMessagesAction(50);
      if (result?.error) {
        setStatus({ type: 'error', text: result.error });
        return;
      }
      setMessages(result.messages || []);
      setSelectedUids([]);
      setStatus({ type: 'success', text: 'Mailler güncellendi.' });
    });
  };

  const openMessage = (uid) => {
    setSelectedUid(uid);
    setSelectedMessage(null);
    setStatus(null);
    startTransition(async () => {
      const result = await getInboxMessageAction(uid);
      if (result?.error) {
        setStatus({ type: 'error', text: result.error });
        return;
      }
      setSelectedMessage(result.message);
    });
  };

  const toggleSelected = (uid) => {
    setSelectedUids((current) => current.includes(uid) ? current.filter((item) => item !== uid) : [...current, uid]);
  };

  const toggleSelectAll = () => {
    setSelectedUids(allFilteredSelected ? [] : filteredMessages.map((message) => message.uid));
  };

  const markSelectedRead = () => {
    if (selectedUids.length === 0) return;
    setStatus(null);
    startTransition(async () => {
      const result = await markInboxMessagesReadAction(selectedUids);
      if (result?.error) {
        setStatus({ type: 'error', text: result.error });
        return;
      }
      setMessages((current) => current.map((message) => selectedUids.includes(message.uid) ? { ...message, seen: true } : message));
      if (selectedMessage && selectedUids.includes(selectedMessage.uid)) setSelectedMessage({ ...selectedMessage, seen: true });
      setStatus({ type: 'success', text: `${selectedUids.length} mail okundu olarak işaretlendi.` });
    });
  };

  const deleteSelected = () => {
    if (selectedUids.length === 0) return;
    const deleting = [...selectedUids];
    setStatus(null);
    startTransition(async () => {
      const result = await deleteInboxMessagesAction(deleting);
      if (result?.error) {
        setStatus({ type: 'error', text: result.error });
        return;
      }
      setMessages((current) => current.filter((message) => !deleting.includes(message.uid)));
      setSelectedUids([]);
      if (selectedUid && deleting.includes(selectedUid)) {
        setSelectedUid(null);
        setSelectedMessage(null);
      }
      setStatus({ type: 'success', text: `${deleting.length} mail silindi.` });
    });
  };

  const send = (formData) => {
    setStatus(null);
    startTransition(async () => {
      const result = await sendMailAction(formData);
      if (result?.error) {
        setStatus({ type: 'error', text: result.error });
        return;
      }
      setStatus({ type: 'success', text: 'Mail gönderildi.' });
      setComposeOpen(false);
    });
  };

  const activePreview = messages.find((message) => message.uid === selectedUid);
  const detail = selectedMessage || activePreview;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card" style={{ padding: '0.9rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setComposeOpen(true)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Yeni Mail Gönder
          </button>
          <button onClick={refresh} disabled={isPending} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={15} /> Yenile
          </button>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
          {filteredMessages.length}/{messages.length} mail · {selectedUids.length} seçili
        </div>
      </div>

      {status && (
        <div className="card" style={{ padding: '0.9rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: status.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
          {status.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle size={17} />}
          {status.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 430px) minmax(0, 1fr)', gap: '1rem', alignItems: 'stretch' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: '650px' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'grid', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Inbox size={18} /> <strong>Gelen Kutusu</strong>
            </div>

            <div style={{ display: 'grid', gap: '0.6rem' }}>
              <label style={{ position: 'relative', display: 'block' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Mail ara: gönderen veya konu" style={{ ...inputStyle, width: '100%', paddingLeft: '2rem' }} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <label style={dateLabelStyle}><Calendar size={13} /> <input value={startDate} onChange={(event) => setStartDate(event.target.value)} type="date" style={dateInputStyle} /></label>
                <label style={dateLabelStyle}><Calendar size={13} /> <input value={endDate} onChange={(event) => setEndDate(event.target.value)} type="date" style={dateInputStyle} /></label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 800 }}>
                <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} /> Tümünü seç
              </label>
              <button onClick={markSelectedRead} disabled={isPending || selectedUids.length === 0} className="btn btn-secondary" style={smallButtonStyle}>
                <CheckCircle size={14} /> Okundu
              </button>
              <button onClick={deleteSelected} disabled={isPending || selectedUids.length === 0} className="btn btn-secondary" style={{ ...smallButtonStyle, color: '#ef4444' }}>
                <Trash2 size={14} /> Sil
              </button>
            </div>
          </div>

          {messages.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Mail size={36} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Mail bulunamadı veya bağlantı ayarı eksik.</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Filtreye uyan mail yok.</div>
          ) : (
            <div style={{ maxHeight: '720px', overflowY: 'auto' }}>
              {filteredMessages.map((message) => (
                <div
                  key={message.uid}
                  role="button"
                  tabIndex={0}
                  onClick={() => openMessage(message.uid)}
                  onKeyDown={(event) => event.key === 'Enter' && openMessage(message.uid)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: selectedUid === message.uid ? 'rgba(59,130,246,0.14)' : 'transparent',
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '0.95rem',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: 'auto minmax(0, 1fr)',
                    gap: '0.7rem',
                    alignItems: 'start'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedUids.includes(message.uid)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => toggleSelected(message.uid)}
                    style={{ marginTop: '0.15rem' }}
                    aria-label={`${message.subject} seç`}
                  />
                  <div style={{ display: 'grid', gap: '0.35rem', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{message.from}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>{message.date ? new Date(message.date).toLocaleDateString('tr-TR') : '-'}</span>
                    </div>
                    <div style={{ fontWeight: message.seen ? 600 : 900, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {message.subject}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {!message.seen ? <span style={badgeStyle}>OKUNMAMIŞ</span> : <span />}
                      {message.hasAttachments && <Paperclip size={14} style={{ color: 'var(--text-secondary)' }} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '1.5rem', minHeight: '650px' }}>
          {!detail ? (
            <div style={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div>
                <Mail size={44} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <p>Detayını görmek için bir mail seçin.</p>
              </div>
            </div>
          ) : (
            <MailDetail message={detail} loading={isPending && selectedUid === detail.uid && !selectedMessage} />
          )}
        </div>
      </div>

      {composeOpen && <ComposeModal onClose={() => setComposeOpen(false)} onSubmit={send} isPending={isPending} />}
    </div>
  );
}

function MailDetail({ message, loading }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.45rem', lineHeight: 1.25, marginBottom: '0.75rem' }}>{message.subject}</h2>
        <div style={{ display: 'grid', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
          <div><strong style={{ color: 'var(--text-primary)' }}>Kimden:</strong> {message.from}</div>
          {message.to && <div><strong style={{ color: 'var(--text-primary)' }}>Kime:</strong> {message.to}</div>}
          {message.cc && <div><strong style={{ color: 'var(--text-primary)' }}>CC:</strong> {message.cc}</div>}
          <div><strong style={{ color: 'var(--text-primary)' }}>Tarih:</strong> {message.date ? new Date(message.date).toLocaleString('tr-TR') : '-'}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Mail içeriği yükleniyor...</div>
      ) : (
        <>
          {message.attachments?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {message.attachments.map((attachment) => (
                <div key={`${attachment.id}-${attachment.filename}`} style={{ border: '1px solid var(--border-color)', borderRadius: '9px', padding: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)' }}>
                  <FileText size={16} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{attachment.filename}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{Math.ceil((attachment.size || 0) / 1024)} KB · indirme yakında</div>
                  </div>
                  <Download size={14} style={{ opacity: 0.45 }} />
                </div>
              ))}
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', minHeight: '360px', overflow: 'auto' }}>
            {message.html ? (
              <iframe
                title="mail-body"
                sandbox="allow-popups allow-popups-to-escape-sandbox"
                srcDoc={message.html}
                style={{ width: '100%', minHeight: '520px', border: 'none', background: 'white', borderRadius: '8px' }}
              />
            ) : (
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text-primary)', lineHeight: 1.6 }}>{message.text || 'Bu mailde görüntülenecek metin bulunamadı.'}</pre>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ComposeModal({ onClose, onSubmit, isPending }) {
  const [fileNames, setFileNames] = useState([]);

  return (
    <div style={modalBackdropStyle}>
      <div className="card" style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
          <strong>Yeni Mail</strong>
          <button onClick={onClose} type="button" style={iconButtonStyle}><X size={18} /></button>
        </div>
        <form action={onSubmit} style={{ display: 'grid', gap: '0.75rem', padding: '1rem' }}>
          <input name="to" placeholder="Alıcı" style={inputStyle} />
          <input name="cc" placeholder="CC" style={inputStyle} />
          <input name="bcc" placeholder="BCC" style={inputStyle} />
          <input name="subject" placeholder="Konu" style={inputStyle} />
          <textarea name="text" rows={12} placeholder="Mesajınızı yazın..." style={{ ...inputStyle, resize: 'vertical' }} />
          <label style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <Paperclip size={16} /> Ek dosya ekle
            <input
              name="attachments"
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(event) => setFileNames(Array.from(event.target.files || []).map((file) => file.name))}
            />
          </label>
          {fileNames.length > 0 && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
              {fileNames.length} ek: {fileNames.join(', ')}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Toplam ek sınırı: 15 MB</span>
            <button disabled={isPending} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={15} /> {isPending ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const badgeStyle = {
  width: 'fit-content',
  color: '#10b981',
  fontSize: '0.65rem',
  fontWeight: 900,
  background: 'rgba(16,185,129,0.12)',
  padding: '0.15rem 0.35rem',
  borderRadius: '4px'
};

const smallButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.45rem 0.65rem',
  fontSize: '0.75rem'
};

const dateLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '0.55rem 0.6rem'
};

const dateInputStyle = {
  width: '100%',
  background: 'transparent',
  color: 'var(--text-primary)',
  border: 'none',
  outline: 'none',
  fontSize: '0.75rem'
};

const modalBackdropStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 10000,
  background: 'rgba(0,0,0,0.55)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  padding: '1rem'
};

const modalStyle = {
  width: 'min(720px, 100%)',
  maxHeight: '92vh',
  overflow: 'auto',
  padding: 0,
  boxShadow: '0 24px 80px rgba(0,0,0,0.4)'
};

const iconButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex'
};

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '0.75rem',
  outline: 'none'
};
