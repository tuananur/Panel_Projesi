'use client';

import { useState, useTransition } from 'react';
import { getInboxMessagesAction, sendMailAction } from '@/app/actions';
import { Inbox, RefreshCw, Send, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function MailClient({ initialResult }) {
  const [messages, setMessages] = useState(initialResult?.messages || []);
  const [status, setStatus] = useState(initialResult?.error ? { type: 'error', text: initialResult.error } : null);
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    setStatus(null);
    startTransition(async () => {
      const result = await getInboxMessagesAction(25);
      if (result?.error) {
        setStatus({ type: 'error', text: result.error });
        return;
      }
      setMessages(result.messages || []);
      setStatus({ type: 'success', text: 'Mailler güncellendi.' });
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
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)', gap: '1.5rem', alignItems: 'start' }}>
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Inbox size={19} /> Gelen Kutusu
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Son 25 mail listelenir.</p>
          </div>
          <button onClick={refresh} disabled={isPending} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={15} /> Yenile
          </button>
        </div>

        {messages.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Mail size={36} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Mail bulunamadı veya bağlantı ayarı eksik.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {messages.map((message) => (
              <div key={message.uid} style={{ padding: '0.9rem 0', borderTop: '1px solid var(--border-color)', display: 'grid', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{message.subject}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                    {message.date ? new Date(message.date).toLocaleString('tr-TR') : '-'}
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{message.from}</div>
                {!message.seen && <span style={{ width: 'fit-content', color: '#10b981', fontSize: '0.68rem', fontWeight: 800 }}>OKUNMAMIŞ</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '1.25rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Send size={18} /> Mail Gönder
        </h2>
        <form action={send} style={{ display: 'grid', gap: '0.85rem' }}>
          <Field name="to" label="Alıcı" placeholder="ornek@domain.com" />
          <Field name="subject" label="Konu" placeholder="Mail konusu" />
          <label style={labelStyle}>
            Mesaj
            <textarea name="text" rows={8} placeholder="Mesajınızı yazın..." style={{ ...inputStyle, resize: 'vertical' }} />
          </label>
          <button disabled={isPending} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Send size={15} /> {isPending ? 'İşleniyor...' : 'Gönder'}
          </button>
        </form>

        {status && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: status.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
            {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {status.text}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, name, placeholder }) {
  return (
    <label style={labelStyle}>
      {label}
      <input name={name} placeholder={placeholder} style={inputStyle} />
    </label>
  );
}

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  fontSize: '0.82rem',
  fontWeight: 700
};

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '0.75rem',
  outline: 'none'
};
