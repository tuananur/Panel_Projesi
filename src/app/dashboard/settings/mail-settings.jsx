'use client';

import { useState, useTransition } from 'react';
import { Mail, Save, ShieldCheck } from 'lucide-react';
import { saveMailSettingsAction } from '@/app/actions';

export default function MailSettings({ initialConfig }) {
  const [message, setMessage] = useState(null);
  const [isPending, startTransition] = useTransition();

  const submit = (formData) => {
    setMessage(null);
    startTransition(async () => {
      const result = await saveMailSettingsAction(formData);
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
        return;
      }
      setMessage({ type: 'success', text: 'Mail ayarları kaydedildi.' });
    });
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={20} /> Mail Bağlantı Ayarları
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Mail görüntüleme için IMAP, mail gönderme için SMTP bilgilerini girin. Bu ayarlar kullanıcıya özeldir; mail pasifse sidebar’da görünmez.
          </p>
        </div>
        <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={16} /> Kullanıcıya özel
        </div>
      </div>

      <form action={submit} style={{ display: 'grid', gap: '1rem' }}>
        <CheckField label="Mail modülünü aktif et" name="enabled" defaultChecked={initialConfig?.enabled === true} />

        <div style={gridStyle}>
          <Field label="IMAP Host" name="imapHost" defaultValue={initialConfig?.imapHost} placeholder="imap.gmail.com" />
          <Field label="IMAP Port" name="imapPort" type="number" defaultValue={initialConfig?.imapPort || 993} />
          <CheckField label="IMAP SSL/TLS" name="imapSecure" defaultChecked={initialConfig?.imapSecure !== false} />
        </div>

        <div style={gridStyle}>
          <Field label="SMTP Host" name="smtpHost" defaultValue={initialConfig?.smtpHost} placeholder="smtp.gmail.com" />
          <Field label="SMTP Port" name="smtpPort" type="number" defaultValue={initialConfig?.smtpPort || 465} />
          <CheckField label="SMTP SSL/TLS" name="smtpSecure" defaultChecked={initialConfig?.smtpSecure !== false} />
        </div>

        <div style={gridStyle}>
          <Field label="Kullanıcı / Mail" name="username" defaultValue={initialConfig?.username} placeholder="mail@domain.com" />
          <Field label="Şifre / App Password" name="password" type="password" placeholder={initialConfig?.hasPassword ? 'Kayıtlı şifre korunur; değiştirmek için yazın' : 'App password girin'} />
          <Field label="Gönderen Adı" name="fromName" defaultValue={initialConfig?.fromName} placeholder="Beyin Atölyesi" />
        </div>

        <Field label="Gönderen Mail" name="fromEmail" defaultValue={initialConfig?.fromEmail} placeholder="mail@domain.com" />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            Gmail/Outlook için normal şifre yerine app password kullanmanız önerilir.
          </p>
          <button className="btn btn-primary" disabled={isPending} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> {isPending ? 'Kaydediliyor...' : 'Mail Ayarlarını Kaydet'}
          </button>
        </div>
      </form>

      {message && (
        <div style={{ marginTop: '1rem', color: message.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
          {message.text}
        </div>
      )}
    </div>
  );
}

function Field({ label, name, type = 'text', defaultValue = '', placeholder = '' }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>
      {label}
      <input name={name} type={type} defaultValue={defaultValue || ''} placeholder={placeholder} style={inputStyle} />
    </label>
  );
}

function CheckField({ label, name, defaultChecked }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, paddingTop: '1.6rem' }}>
      <input name={name} type="checkbox" defaultChecked={defaultChecked} /> {label}
    </label>
  );
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem'
};

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '0.75rem',
  outline: 'none'
};
