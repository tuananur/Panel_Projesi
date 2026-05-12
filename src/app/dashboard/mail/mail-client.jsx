'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { deleteMailMessagesAction, getMailAddressSuggestionsAction, getMailMessageAction, getMailMessagesAction, markMailMessagesReadAction, sendMailAction } from '@/app/actions';
import { AlertCircle, Calendar, CheckCircle, Download, FileText, Inbox, Mail, Paperclip, Plus, RefreshCw, Reply, ReplyAll, Search, Send, Trash2, X } from 'lucide-react';

const FOLDERS = [
  { key: 'inbox', label: 'Gelen Kutusu' },
  { key: 'sent', label: 'Gönderilen' },
  { key: 'trash', label: 'Silinen' },
];

function messageKey(folder, uid) {
  return `${folder}:${uid}`;
}

function parseEmail(value = '') {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] || value).trim();
}

function uniqueCsv(values) {
  return [...new Set(values.flatMap((value) => String(value || '').split(',')).map((value) => value.trim()).filter(Boolean))].join(', ');
}

export default function MailClient({ initialResult }) {
  const [folder, setFolder] = useState('inbox');
  const [messagesByFolder, setMessagesByFolder] = useState({ inbox: initialResult?.messages || [] });
  const [fullyLoadedFolders, setFullyLoadedFolders] = useState({});
  const [loadingFolder, setLoadingFolder] = useState('inbox');
  const [loadingMessageKey, setLoadingMessageKey] = useState(null);
  const messages = messagesByFolder[folder] || [];
  const [selectedKey, setSelectedKey] = useState(messages[0] ? messageKey('inbox', messages[0].uid) : null);
  const [selectedUids, setSelectedUids] = useState([]);
  const [messageCache, setMessageCache] = useState({});
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeDraft, setComposeDraft] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState(initialResult?.error ? { type: 'error', text: initialResult.error } : null);
  const [isPending, startTransition] = useTransition();

  const selectedUid = selectedKey?.split(':')[1] ? Number(selectedKey.split(':')[1]) : null;
  const selectedFolder = selectedKey?.split(':')[0] || folder;

  useEffect(() => {
    startTransition(async () => {
      const [messagesResult, suggestionsResult] = await Promise.all([
        getMailMessagesAction('inbox', 100),
        getMailAddressSuggestionsAction()
      ]);
      if (messagesResult?.success) {
        const nextMessages = messagesResult.messages || [];
        setMessagesByFolder((current) => ({ ...current, inbox: nextMessages }));
        setSelectedKey(nextMessages[0] ? messageKey('inbox', nextMessages[0].uid) : null);
      } else if (messagesResult?.error) {
        setStatus({ type: 'error', text: messagesResult.error });
      }
      if (suggestionsResult?.success) setSuggestions(suggestionsResult.suggestions || []);
      setLoadingFolder(null);
    });
  }, []);

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR');
    const startTime = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const endTime = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;

    return messages.filter((message) => {
      const searchable = `${message.from || ''} ${message.to || ''} ${message.subject || ''}`.toLocaleLowerCase('tr-TR');
      const messageTime = message.date ? new Date(message.date).getTime() : null;
      if (normalizedQuery && !searchable.includes(normalizedQuery)) return false;
      if (startTime && (!messageTime || messageTime < startTime)) return false;
      if (endTime && (!messageTime || messageTime > endTime)) return false;
      return true;
    });
  }, [messages, query, startDate, endDate]);

  const allFilteredSelected = filteredMessages.length > 0 && filteredMessages.every((message) => selectedUids.includes(message.uid));

  const loadFolder = (nextFolder) => {
    setFolder(nextFolder);
    setSelectedUids([]);
    setStatus(null);
    const existing = messagesByFolder[nextFolder] || [];
    if (existing.length > 0) {
      setSelectedKey(messageKey(nextFolder, existing[0].uid));
      return;
    }
    setLoadingFolder(nextFolder);
    startTransition(async () => {
      const result = await getMailMessagesAction(nextFolder, 100);
      if (result?.error) {
        setStatus({ type: 'error', text: result.error });
        setLoadingFolder(null);
        return;
      }
      const nextMessages = result.messages || [];
      setMessagesByFolder((current) => ({ ...current, [nextFolder]: nextMessages }));
      setSelectedKey(nextMessages[0] ? messageKey(nextFolder, nextMessages[0].uid) : null);
      setLoadingFolder(null);
    });
  };

  const refresh = () => {
    setStatus(null);
    setLoadingFolder(folder);
    startTransition(async () => {
      const result = await getMailMessagesAction(folder, fullyLoadedFolders[folder] ? 'all' : 100);
      if (result?.error) {
        setStatus({ type: 'error', text: result.error });
        setLoadingFolder(null);
        return;
      }
      setMessagesByFolder((current) => ({ ...current, [folder]: result.messages || [] }));
      setSelectedUids([]);
      setStatus({ type: 'success', text: 'Mailler güncellendi.' });
      setLoadingFolder(null);
    });
  };

  const loadAllMessages = () => {
    setStatus(null);
    setLoadingFolder(folder);
    startTransition(async () => {
      const result = await getMailMessagesAction(folder, 'all');
      if (result?.error) {
        setStatus({ type: 'error', text: result.error });
        setLoadingFolder(null);
        return;
      }
      setMessagesByFolder((current) => ({ ...current, [folder]: result.messages || [] }));
      setFullyLoadedFolders((current) => ({ ...current, [folder]: true }));
      setStatus({ type: 'success', text: 'Tüm mailler yüklendi.' });
      setLoadingFolder(null);
    });
  };

  const openMessage = (uid) => {
    const key = messageKey(folder, uid);
    setSelectedKey(key);
    setStatus(null);
    if (messageCache[key]) return;
    setLoadingMessageKey(key);

    startTransition(async () => {
      const result = await getMailMessageAction(uid, folder);
      if (result?.error) {
        setStatus({ type: 'error', text: result.error });
        setLoadingMessageKey(null);
        return;
      }
      setMessageCache((current) => ({ ...current, [key]: result.message }));
      setLoadingMessageKey(null);
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
      const result = await markMailMessagesReadAction(selectedUids, folder);
      if (result?.error) {
        setStatus({ type: 'error', text: result.error });
        return;
      }
      setMessagesByFolder((current) => ({
        ...current,
        [folder]: (current[folder] || []).map((message) => selectedUids.includes(message.uid) ? { ...message, seen: true } : message)
      }));
      setMessageCache((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, selectedUids.includes(value.uid) && value.folder === folder ? { ...value, seen: true } : value])));
      setStatus({ type: 'success', text: `${selectedUids.length} mail okundu olarak işaretlendi.` });
    });
  };

  const deleteSelected = () => {
    if (selectedUids.length === 0) return;
    const deleting = [...selectedUids];
    setStatus(null);
    startTransition(async () => {
      const result = await deleteMailMessagesAction(deleting, folder);
      if (result?.error) {
        setStatus({ type: 'error', text: result.error });
        return;
      }
      setMessagesByFolder((current) => ({ ...current, [folder]: (current[folder] || []).filter((message) => !deleting.includes(message.uid)) }));
      setSelectedUids([]);
      if (selectedUid && deleting.includes(selectedUid)) setSelectedKey(null);
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
      setComposeDraft(null);
      setMessagesByFolder((current) => ({ ...current, sent: [] }));
      const suggestionsResult = await getMailAddressSuggestionsAction();
      if (suggestionsResult?.success) setSuggestions(suggestionsResult.suggestions || []);
    });
  };

  const activePreview = messages.find((message) => message.uid === selectedUid);
  const detail = selectedKey ? (messageCache[selectedKey] || activePreview) : null;
  const isDetailLoading = !!selectedKey && !messageCache[selectedKey] && loadingMessageKey === selectedKey;

  const openCompose = (draft = null) => {
    setComposeDraft(draft);
    setComposeOpen(true);
  };

  const replyToMessage = (replyAll = false) => {
    if (!detail) return;
    const subject = detail.subject?.toLocaleLowerCase('tr-TR').startsWith('re:') ? detail.subject : `Re: ${detail.subject || ''}`;
    const to = detail.folder === 'sent' ? detail.to : detail.from;
    const cc = replyAll ? uniqueCsv([detail.cc, detail.folder === 'sent' ? '' : detail.to]) : '';
    const quoted = `\n\n--- Önceki mesaj ---\nKimden: ${detail.from || '-'}\nTarih: ${detail.date ? new Date(detail.date).toLocaleString('tr-TR') : '-'}\nKonu: ${detail.subject || '-'}\n\n${detail.text || ''}`;
    openCompose({ title: replyAll ? 'Tümünü Cevapla' : 'Cevapla', to: parseEmail(to), cc, subject, text: quoted });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card" style={{ padding: '0.9rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => openCompose()} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Yeni Mail Gönder
          </button>
          <button onClick={refresh} disabled={isPending} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={15} /> Yenile
          </button>
          <button onClick={loadAllMessages} disabled={isPending || fullyLoadedFolders[folder]} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Tümünü yükle
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 450px) minmax(0, 1fr)', gap: '1rem', alignItems: 'stretch' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: '650px' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'grid', gap: '0.8rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {FOLDERS.map((item) => (
                <button key={item.key} onClick={() => loadFolder(item.key)} className={folder === item.key ? 'btn btn-primary' : 'btn btn-secondary'} style={smallButtonStyle}>
                  {item.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '0.6rem' }}>
              <label style={{ position: 'relative', display: 'block' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Mail ara: gönderen, alıcı veya konu" style={{ ...inputStyle, width: '100%', paddingLeft: '2rem' }} />
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

          {loadingFolder === folder ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <RefreshCw size={36} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Mailler yükleniyor...</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Inbox size={36} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Bu klasörde mail yok veya bağlantı ayarı eksik.</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Filtreye uyan mail yok.</div>
          ) : (
            <div style={{ maxHeight: '720px', overflowY: 'auto' }}>
              {filteredMessages.map((message) => (
                <div key={message.uid} role="button" tabIndex={0} onClick={() => openMessage(message.uid)} onKeyDown={(event) => event.key === 'Enter' && openMessage(message.uid)} style={{ width: '100%', textAlign: 'left', background: selectedKey === messageKey(folder, message.uid) ? 'rgba(59,130,246,0.14)' : 'transparent', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', padding: '0.95rem', cursor: 'pointer', display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: '0.7rem', alignItems: 'start' }}>
                  <input type="checkbox" checked={selectedUids.includes(message.uid)} onClick={(event) => event.stopPropagation()} onChange={() => toggleSelected(message.uid)} style={{ marginTop: '0.15rem' }} aria-label={`${message.subject} seç`} />
                  <div style={{ display: 'grid', gap: '0.35rem', minWidth: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '0.75rem', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{folder === 'sent' ? `Kime: ${message.to || '-'}` : message.from}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', whiteSpace: 'nowrap', justifySelf: 'end' }}>{message.date ? new Date(message.date).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                    </div>
                    <div style={{ fontWeight: message.seen ? 600 : 900, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{message.subject}</div>
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
              <div><Mail size={44} style={{ opacity: 0.5, marginBottom: '1rem' }} /><p>Detayını görmek için bir mail seçin.</p></div>
            </div>
          ) : (
            <MailDetail message={detail} loading={isDetailLoading} onReply={() => replyToMessage(false)} onReplyAll={() => replyToMessage(true)} />
          )}
        </div>
      </div>

      {composeOpen && <ComposeModal draft={composeDraft} suggestions={suggestions} onClose={() => { setComposeOpen(false); setComposeDraft(null); }} onSubmit={send} isPending={isPending} />}
    </div>
  );
}

function MailDetail({ message, loading, onReply, onReplyAll }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
          <h2 style={{ fontSize: '1.45rem', lineHeight: 1.25, marginBottom: '0.75rem' }}>{message.subject}</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button onClick={onReply} className="btn btn-secondary" style={smallButtonStyle}><Reply size={14} /> Cevapla</button>
            <button onClick={onReplyAll} className="btn btn-secondary" style={smallButtonStyle}><ReplyAll size={14} /> Tümünü</button>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
          <div><strong style={{ color: 'var(--text-primary)' }}>Kimden:</strong> {message.from}</div>
          {message.to && <div><strong style={{ color: 'var(--text-primary)' }}>Kime:</strong> {message.to}</div>}
          {message.cc && <div><strong style={{ color: 'var(--text-primary)' }}>CC:</strong> {message.cc}</div>}
          <div><strong style={{ color: 'var(--text-primary)' }}>Tarih:</strong> {message.date ? new Date(message.date).toLocaleString('tr-TR') : '-'}</div>
        </div>
      </div>

      {loading ? <div style={{ color: 'var(--text-secondary)' }}>Mail içeriği yükleniyor...</div> : (
        <>
          {message.attachments?.length > 0 && <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{message.attachments.map((attachment) => <div key={`${attachment.id}-${attachment.filename}`} style={{ border: '1px solid var(--border-color)', borderRadius: '9px', padding: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)' }}><FileText size={16} /><div><div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{attachment.filename}</div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{Math.ceil((attachment.size || 0) / 1024)} KB · indirme yakında</div></div><Download size={14} style={{ opacity: 0.45 }} /></div>)}</div>}
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', minHeight: '360px', overflow: 'auto' }}>
            {message.html ? <iframe title="mail-body" sandbox="allow-popups allow-popups-to-escape-sandbox" srcDoc={message.html} style={{ width: '100%', minHeight: '520px', border: 'none', background: 'white', borderRadius: '8px' }} /> : <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--text-primary)', lineHeight: 1.6 }}>{message.text || 'Bu mailde görüntülenecek metin bulunamadı.'}</pre>}
          </div>
        </>
      )}
    </div>
  );
}

function ComposeModal({ draft, suggestions, onClose, onSubmit, isPending }) {
  const [fileNames, setFileNames] = useState([]);

  return (
    <div style={modalBackdropStyle}>
      <div className="card" style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
          <strong>{draft?.title || 'Yeni Mail'}</strong>
          <button onClick={onClose} type="button" style={iconButtonStyle}><X size={18} /></button>
        </div>
        <form action={onSubmit} style={{ display: 'grid', gap: '0.75rem', padding: '1rem' }}>
          <AddressInput name="to" placeholder="Alıcı" defaultValue={draft?.to} suggestions={suggestions} />
          <AddressInput name="cc" placeholder="CC" defaultValue={draft?.cc} suggestions={suggestions} />
          <AddressInput name="bcc" placeholder="BCC" defaultValue={draft?.bcc} suggestions={suggestions} />
          <input name="subject" placeholder="Konu" defaultValue={draft?.subject || ''} style={inputStyle} />
          <textarea name="text" rows={12} placeholder="Mesajınızı yazın..." defaultValue={draft?.text || ''} style={{ ...inputStyle, resize: 'vertical' }} />
          <label style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><Paperclip size={16} /> Ek dosya ekle<input name="attachments" type="file" multiple style={{ display: 'none' }} onChange={(event) => setFileNames(Array.from(event.target.files || []).map((file) => file.name))} /></label>
          {fileNames.length > 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{fileNames.length} ek: {fileNames.join(', ')}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Toplam ek sınırı: 15 MB</span>
            <button disabled={isPending} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><Send size={15} /> {isPending ? 'Gönderiliyor...' : 'Gönder'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddressInput({ name, placeholder, defaultValue = '', suggestions }) {
  const initialTokens = String(defaultValue || '').split(',').map((item) => item.trim()).filter(Boolean);
  const [tokens, setTokens] = useState(initialTokens);
  const [draft, setDraft] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const normalizedDraft = draft.trim().toLocaleLowerCase('tr-TR');
  const matches = normalizedDraft.length > 0 && isOpen
    ? suggestions
      .filter((item) => !tokens.includes(item.email))
      .filter((item) => item.email.toLocaleLowerCase('tr-TR').includes(normalizedDraft) || item.name.toLocaleLowerCase('tr-TR').includes(normalizedDraft))
      .slice(0, 6)
    : [];

  const addToken = (rawValue) => {
    const email = String(rawValue || '').trim().replace(/^<|>$/g, '');
    if (!email) return;
    setTokens((current) => current.includes(email) ? current : [...current, email]);
    setDraft('');
    setIsOpen(false);
  };

  const removeToken = (email) => {
    setTokens((current) => current.filter((item) => item !== email));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (matches[0] && event.key === 'Enter') addToken(matches[0].email);
      else addToken(draft);
    }
    if (event.key === 'Backspace' && !draft && tokens.length > 0) {
      setTokens((current) => current.slice(0, -1));
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <input type="hidden" name={name} value={tokens.join(', ')} />
      <div style={{ ...inputStyle, minHeight: '44px', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', padding: '0.45rem 0.6rem' }}>
        {tokens.map((email) => (
          <span key={email} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', maxWidth: '100%', background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(59,130,246,0.28)', borderRadius: '999px', padding: '0.25rem 0.45rem', fontSize: '0.78rem', fontWeight: 800 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>{email}</span>
            <button type="button" onClick={() => removeToken(email)} style={{ ...iconButtonStyle, color: 'var(--text-primary)' }} aria-label={`${email} kaldır`}><X size={13} /></button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => { setDraft(event.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder={tokens.length === 0 ? placeholder : 'Başka adres yaz...'}
          style={{ flex: '1 1 180px', minWidth: '130px', background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', padding: '0.3rem' }}
          autoComplete="off"
        />
      </div>
      {matches.length > 0 && (
        <div style={{ position: 'absolute', zIndex: 10020, left: 0, right: 0, top: 'calc(100% + 4px)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
          {matches.map((suggestion) => (
            <button key={suggestion.email} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => addToken(suggestion.email)} style={{ width: '100%', textAlign: 'left', padding: '0.65rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <strong>{suggestion.email}</strong>{suggestion.name && <span style={{ color: 'var(--text-secondary)' }}> · {suggestion.name}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const badgeStyle = { width: 'fit-content', color: '#10b981', fontSize: '0.65rem', fontWeight: 900, background: 'rgba(16,185,129,0.12)', padding: '0.15rem 0.35rem', borderRadius: '4px' };
const smallButtonStyle = { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.65rem', fontSize: '0.75rem' };
const dateLabelStyle = { display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.55rem 0.6rem' };
const dateInputStyle = { width: '100%', background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', fontSize: '0.75rem' };
const modalBackdropStyle = { position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', padding: '1rem' };
const modalStyle = { width: 'min(720px, 100%)', maxHeight: '92vh', overflow: 'auto', padding: 0, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' };
const iconButtonStyle = { background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' };
const inputStyle = { background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', outline: 'none' };
