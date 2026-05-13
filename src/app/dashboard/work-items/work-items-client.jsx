'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, Eye, Plus, RefreshCw, Send, XCircle } from 'lucide-react';
import {
  approveWorkItemAction,
  cancelWorkItemAction,
  createWorkItemAction,
  requestWorkItemRevisionAction,
  startWorkItemAction,
  submitWorkItemAction,
} from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';
import { useTheme } from '@/app/components/theme-provider';

const STATUS_LABELS = {
  ASSIGNED: 'Atandı',
  IN_PROGRESS: 'Devam Ediyor',
  SUBMITTED: 'Onay Bekliyor',
  APPROVED: 'Onaylandı',
  REVISION_REQUESTED: 'Revize İstendi',
  CANCELLED: 'İptal Edildi',
};

const STATUS_COLORS = {
  ASSIGNED: '#60a5fa',
  IN_PROGRESS: '#f59e0b',
  SUBMITTED: '#a855f7',
  APPROVED: '#10b981',
  REVISION_REQUESTED: '#ef4444',
  CANCELLED: '#6b7280',
};

const PRIORITY_LABELS = {
  LOW: 'Düşük',
  NORMAL: 'Normal',
  HIGH: 'Yüksek',
  URGENT: 'Acil',
};

const TYPE_LABELS = {
  DESIGN: 'Tasarım',
  ADS: 'Reklam',
  SEO: 'SEO',
  SOCIAL: 'Sosyal Medya',
  SOFTWARE: 'Yazılım',
  OTHER: 'Diğer',
};

const EVENT_LABELS = {
  CREATED: 'Oluşturuldu',
  STARTED: 'Başlandı',
  SUBMITTED: 'Teslim Edildi',
  APPROVED: 'Onaylandı',
  REVISION_REQUESTED: 'Revize İstendi',
  CANCELLED: 'İptal Edildi',
};

function formatDate(value, withTime = false) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(value));
}

function statusBadge(status) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      padding: '0.25rem 0.55rem',
      borderRadius: '999px',
      background: `${STATUS_COLORS[status] || '#6b7280'}20`,
      color: STATUS_COLORS[status] || '#6b7280',
      fontSize: '0.72rem',
      fontWeight: 800,
      whiteSpace: 'nowrap',
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function WorkItemsClient({ initialItems, clients, assignableUsers, session, canAssign }) {
  const router = useRouter();
  const { setGlobalLoading } = useTheme();
  const items = initialItems;
  const [activeTab, setActiveTab] = useState('mine');
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const tabs = useMemo(() => {
    const mine = items.filter((item) => item.assigneeId === session.userId && item.status !== 'APPROVED' && item.status !== 'CANCELLED');
    const assigned = items.filter((item) => item.createdById === session.userId || item.assignee?.managerId === session.userId);
    const approvals = items.filter((item) => item.status === 'SUBMITTED' && (session.role === 'ADMIN' || item.createdById === session.userId || item.assignee?.managerId === session.userId));
    const allOpen = items.filter((item) => !['APPROVED', 'CANCELLED'].includes(item.status));
    return { mine, assigned, approvals, allOpen, all: items };
  }, [items, session]);

  const displayedItems = tabs[activeTab] || tabs.mine;

  async function runAction(action) {
    if (loading) return;
    setLoading(true);
    setGlobalLoading(true);
    setError('');
    const result = await action();
    if (result?.error) {
      setError(result.error);
    } else {
      setSelectedItem(null);
      router.refresh();
    }
    setLoading(false);
    setGlobalLoading(false);
  }

  async function handleCreate(formData) {
    await runAction(() => createWorkItemAction(formData));
  }

  async function handleSubmit(formData) {
    await runAction(() => submitWorkItemAction(formData));
  }

  async function handleRevision(formData) {
    await runAction(() => requestWorkItemRevisionAction(formData));
  }

  const canCurrentUserManage = (item) => session.role === 'ADMIN' || item.createdById === session.userId || item.assignee?.managerId === session.userId;
  const canCurrentUserWork = (item) => item.assigneeId === session.userId;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>İş Takip</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Atanan işler, teslimler, onaylar ve revize akışı.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="card" style={{ padding: '0.8rem 1rem', minWidth: '120px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{tabs.mine.length}</div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>Bana Atanan</div>
          </div>
          <div className="card" style={{ padding: '0.8rem 1rem', minWidth: '120px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{tabs.approvals.length}</div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>Onay Bekleyen</div>
          </div>
        </div>
      </div>

      {canAssign && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 className="heading-2" style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={18} /> İş Ata</h2>
          <form action={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <div className="input-group">
              <label className="input-label">Başlık *</label>
              <input name="title" className="input-field" required placeholder="Örn: Mayıs reklam kreatifleri" />
            </div>
            <div className="input-group">
              <label className="input-label">Atanacak Kişi *</label>
              <select name="assigneeId" className="input-field" required defaultValue="">
                <option value="" disabled>Kişi seç</option>
                {assignableUsers.map((user) => <option key={user.id} value={user.id}>{user.username} ({user.role})</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Müşteri</label>
              <select name="clientId" className="input-field" defaultValue="">
                <option value="">Genel iş</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.companyName}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Son Teslim</label>
              <input name="dueDate" type="date" className="input-field" />
            </div>
            <div className="input-group">
              <label className="input-label">Öncelik</label>
              <select name="priority" className="input-field" defaultValue="NORMAL">
                {Object.entries(PRIORITY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">İş Tipi</label>
              <select name="type" className="input-field" defaultValue="OTHER">
                {Object.entries(TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Açıklama</label>
              <textarea name="description" className="input-field" rows={3} placeholder="İş detayı, linkler, brief..." />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minHeight: '42px' }}>
              {loading ? 'Atanıyor...' : 'İşi Ata'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {[
            ['mine', 'Bana Atananlar', tabs.mine.length],
            ['approvals', 'Onay Bekleyenler', tabs.approvals.length],
            ...(canAssign ? [['assigned', 'Atadıklarım', tabs.assigned.length]] : []),
            ...(session.role === 'ADMIN' ? [['allOpen', 'Tüm Açık İşler', tabs.allOpen.length], ['all', 'Tüm İşler', tabs.all.length]] : []),
          ].map(([key, label, count]) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)} className="btn" style={{
              background: activeTab === key ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              color: activeTab === key ? 'white' : 'var(--text-primary)',
              padding: '0.55rem 0.8rem',
              fontSize: '0.8rem',
            }}>{label} ({count})</button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>İş</th>
                <th style={{ padding: '0.75rem' }}>Durum</th>
                <th style={{ padding: '0.75rem' }}>Atanan</th>
                <th style={{ padding: '0.75rem' }}>Atayan</th>
                <th style={{ padding: '0.75rem' }}>Müşteri</th>
                <th style={{ padding: '0.75rem' }}>Deadline</th>
                <th style={{ padding: '0.75rem' }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 800 }}>{item.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '0.15rem' }}>{TYPE_LABELS[item.type] || item.type} · {PRIORITY_LABELS[item.priority] || item.priority}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{statusBadge(item.status)}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{item.assignee?.username}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{item.createdBy?.username}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{item.client?.companyName || 'Genel'}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{formatDate(item.dueDate)}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button type="button" className="btn" onClick={() => setSelectedItem(item)} style={{ padding: '0.45rem 0.7rem', fontSize: '0.75rem' }}>
                      <Eye size={14} /> Detay
                    </button>
                  </td>
                </tr>
              ))}
              {displayedItems.length === 0 && (
                <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Bu listede iş yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '820px', maxHeight: '92vh', overflowY: 'auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h2 className="heading-2" style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>{selectedItem.title}</h2>
                {statusBadge(selectedItem.status)}
              </div>
              <button type="button" onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><XCircle size={24} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <Info label="Atanan" value={selectedItem.assignee?.username} />
              <Info label="Atayan" value={selectedItem.createdBy?.username} />
              <Info label="Müşteri" value={selectedItem.client?.companyName || 'Genel'} />
              <Info label="Deadline" value={formatDate(selectedItem.dueDate)} />
              <Info label="Teslim" value={formatDate(selectedItem.submittedAt, true)} />
              <Info label="Onay" value={formatDate(selectedItem.approvedAt, true)} />
            </div>

            {selectedItem.description && (
              <div className="card" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                <div className="input-label">Açıklama</div>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{selectedItem.description}</div>
              </div>
            )}

            {selectedItem.lastSubmissionNote && <NoteBox title="Son Teslim Notu" note={selectedItem.lastSubmissionNote} color="#a855f7" />}
            {selectedItem.lastRevisionNote && <NoteBox title="Son Revize Notu" note={selectedItem.lastRevisionNote} color="#ef4444" />}

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {canCurrentUserWork(selectedItem) && ['ASSIGNED', 'REVISION_REQUESTED'].includes(selectedItem.status) && (
                <button type="button" className="btn" disabled={loading} onClick={() => runAction(() => startWorkItemAction(selectedItem.id))}><Clock size={16} /> Başladım</button>
              )}
              {canCurrentUserWork(selectedItem) && ['ASSIGNED', 'IN_PROGRESS', 'REVISION_REQUESTED'].includes(selectedItem.status) && (
                <form action={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input type="hidden" name="workItemId" value={selectedItem.id} />
                  <input name="note" className="input-field" placeholder="Teslim notu (opsiyonel)" style={{ minWidth: '240px' }} />
                  <button className="btn btn-primary" disabled={loading} type="submit"><Send size={16} /> Teslim Et</button>
                </form>
              )}
              {canCurrentUserManage(selectedItem) && selectedItem.status === 'SUBMITTED' && (
                <button type="button" className="btn btn-primary" disabled={loading} onClick={() => runAction(() => approveWorkItemAction(selectedItem.id))}><CheckCircle2 size={16} /> Onayla</button>
              )}
              {canCurrentUserManage(selectedItem) && selectedItem.status === 'SUBMITTED' && (
                <form action={handleRevision} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input type="hidden" name="workItemId" value={selectedItem.id} />
                  <input name="note" className="input-field" required placeholder="Revize açıklaması zorunlu" style={{ minWidth: '260px' }} />
                  <button className="btn" disabled={loading} type="submit"><RefreshCw size={16} /> Revize İste</button>
                </form>
              )}
              {canCurrentUserManage(selectedItem) && !['APPROVED', 'CANCELLED'].includes(selectedItem.status) && (
                <button type="button" className="btn" disabled={loading} onClick={() => runAction(() => cancelWorkItemAction(selectedItem.id))} style={{ color: '#ef4444' }}>İptal Et</button>
              )}
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Geçmiş</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {selectedItem.events.map((event) => (
                  <div key={event.id} style={{ borderLeft: `3px solid ${STATUS_COLORS[event.type === 'REVISION_REQUESTED' ? 'REVISION_REQUESTED' : event.type === 'APPROVED' ? 'APPROVED' : event.type === 'SUBMITTED' ? 'SUBMITTED' : 'ASSIGNED'] || 'var(--accent-primary)'}`, paddingLeft: '0.75rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>{EVENT_LABELS[event.type] || event.type} · {event.user?.username}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>{formatDate(event.createdAt, true)}</div>
                    {event.note && <div style={{ fontSize: '0.82rem', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{event.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomDialog
        isOpen={!!error}
        title="Hata"
        onClose={() => setError('')}
        onConfirm={() => setError('')}
        confirmText="Tamam"
        showCancel={false}
      >
        <div style={{ color: 'var(--text-secondary)' }}>{error}</div>
      </CustomDialog>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
      <div className="input-label" style={{ marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{value || '-'}</div>
    </div>
  );
}

function NoteBox({ title, note, color }) {
  return (
    <div style={{ marginBottom: '1rem', padding: '0.85rem', borderRadius: '10px', background: `${color}16`, border: `1px solid ${color}33` }}>
      <div style={{ color, fontWeight: 900, fontSize: '0.8rem', marginBottom: '0.35rem' }}>{title}</div>
      <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem' }}>{note}</div>
    </div>
  );
}
