'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ChevronDown, ChevronRight, Clock, Plus, RefreshCw, Send } from 'lucide-react';
import {
  approveWorkItemAction,
  cancelWorkItemAction,
  createWorkItemAction,
  markWorkItemReadAction,
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

const PRIORITY_LABELS = { LOW: 'Düşük', NORMAL: 'Normal', HIGH: 'Yüksek', URGENT: 'Acil' };
const TYPE_LABELS = { DESIGN: 'Tasarım', ADS: 'Reklam', SEO: 'SEO', SOCIAL: 'Sosyal Medya', SOFTWARE: 'Yazılım', OTHER: 'Diğer' };
const EVENT_LABELS = { CREATED: 'Oluşturuldu', STARTED: 'Başlandı', SUBMITTED: 'Teslim Edildi', APPROVED: 'Onaylandı', REVISION_REQUESTED: 'Revize İstendi', CANCELLED: 'İptal Edildi' };

function formatDate(value, withTime = false) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(value));
}

function statusBadge(status) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.55rem', borderRadius: '999px', background: `${STATUS_COLORS[status] || '#6b7280'}20`, color: STATUS_COLORS[status] || '#6b7280', fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function isUnreadFor(item, userId) {
  try {
    return JSON.parse(item.unreadForUserIds || '[]').map(String).includes(String(userId));
  } catch {
    return false;
  }
}

export default function WorkItemsClient({ initialItems, clients, assignableUsers, session, canAssign }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setGlobalLoading } = useTheme();
  const items = initialItems;
  const notificationWorkItemId = Number(searchParams.get('notificationWorkItem') || 0);
  const notificationItem = items.find((item) => item.id === notificationWorkItemId);
  const itemRefs = useRef({});
  const [activeTab, setActiveTab] = useState(() => (notificationItem && ['APPROVED', 'CANCELLED'].includes(notificationItem.status) ? 'all' : 'allOpen'));
  const [openIds, setOpenIds] = useState(() => (notificationWorkItemId ? new Set([notificationWorkItemId]) : new Set()));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const tabs = useMemo(() => {
    const mine = items.filter((item) => item.assigneeId === session.userId && item.status !== 'APPROVED' && item.status !== 'CANCELLED');
    const assigned = items.filter((item) => item.createdById === session.userId || item.assignee?.managerId === session.userId);
    const approvals = items.filter((item) => item.status === 'SUBMITTED' && (session.role === 'ADMIN' || item.createdById === session.userId || item.assignee?.managerId === session.userId));
    const allOpen = items.filter((item) => !['APPROVED', 'CANCELLED'].includes(item.status));
    return { allOpen, mine, approvals, assigned, all: items };
  }, [items, session]);

  const displayedItems = tabs[activeTab] || tabs.allOpen;

  useEffect(() => {
    if (!notificationWorkItemId || !notificationItem) return;
    const frame = window.requestAnimationFrame(() => {
      setOpenIds((prev) => new Set([...prev, notificationWorkItemId]));
      if (['APPROVED', 'CANCELLED'].includes(notificationItem.status)) setActiveTab('all');
      window.setTimeout(() => {
        itemRefs.current[notificationWorkItemId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    });
    if (isUnreadFor(notificationItem, session.userId)) {
      markWorkItemReadAction(notificationWorkItemId).then(() => router.refresh());
    }
    return () => window.cancelAnimationFrame(frame);
  }, [notificationWorkItemId, notificationItem, router, session.userId]);

  async function runAction(action) {
    if (loading) return;
    setLoading(true);
    setGlobalLoading(true);
    setError('');
    const result = await action();
    if (result?.error) setError(result.error);
    else router.refresh();
    setLoading(false);
    setGlobalLoading(false);
  }

  const toggleDetails = async (item) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
    if (!openIds.has(item.id) && isUnreadFor(item, session.userId)) {
      await markWorkItemReadAction(item.id);
      router.refresh();
    }
  };

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
          <SummaryCard value={tabs.allOpen.length} label="Tüm Açık İşler" />
          <SummaryCard value={tabs.approvals.length} label="Onay Bekleyen" />
        </div>
      </div>

      {canAssign && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 className="heading-2" style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={18} /> İş Ata</h2>
          <form action={(formData) => runAction(() => createWorkItemAction(formData))} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            <Field label="Başlık *"><input name="title" className="input-field" required placeholder="Örn: Mayıs reklam kreatifleri" /></Field>
            <Field label="Atanacak Kişi *"><select name="assigneeId" className="input-field" required defaultValue=""><option value="" disabled>Kişi seç</option>{assignableUsers.map((user) => <option key={user.id} value={user.id}>{user.username} ({user.role})</option>)}</select></Field>
            <Field label="Müşteri"><select name="clientId" className="input-field" defaultValue=""><option value="">Genel iş</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.companyName}</option>)}</select></Field>
            <Field label="Son Teslim"><input name="dueDate" type="date" className="input-field" /></Field>
            <Field label="Öncelik"><select name="priority" className="input-field" defaultValue="NORMAL">{Object.entries(PRIORITY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
            <Field label="İş Tipi"><select name="type" className="input-field" defaultValue="OTHER">{Object.entries(TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}><label className="input-label">Açıklama</label><textarea name="description" className="input-field" rows={3} placeholder="İş detayı, linkler, brief..." /></div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minHeight: '42px' }}>{loading ? 'Atanıyor...' : 'İşi Ata'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {[
            ['allOpen', 'Tüm İşler', tabs.allOpen.length],
            ['mine', 'Bana Atananlar', tabs.mine.length],
            ['approvals', 'Onay Bekleyenler', tabs.approvals.length],
            ...(canAssign ? [['assigned', 'Atadıklarım', tabs.assigned.length]] : []),
            ['all', 'Arşiv / Tüm Kayıtlar', tabs.all.length],
          ].map(([key, label, count]) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)} className="btn" style={{ background: activeTab === key ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: activeTab === key ? 'white' : 'var(--text-primary)', padding: '0.55rem 0.8rem', fontSize: '0.8rem' }}>{label} ({count})</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {displayedItems.map((item) => {
            const isOpen = openIds.has(item.id);
            const unread = isUnreadFor(item, session.userId);
            return (
              <div
                key={item.id}
                ref={(node) => { if (node) itemRefs.current[item.id] = node; }}
                style={{ border: item.id === notificationWorkItemId ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', background: item.id === notificationWorkItemId ? 'rgba(245,158,11,0.10)' : unread ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.025)', overflow: 'hidden', scrollMarginTop: '120px' }}
              >
                <button type="button" onClick={() => toggleDetails(item)} style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.9rem 1rem', display: 'grid', gridTemplateColumns: 'minmax(220px, 1.6fr) minmax(120px, .7fr) minmax(120px, .7fr) minmax(120px, .7fr) 34px', gap: '1rem', alignItems: 'center', textAlign: 'left' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {unread && <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px rgba(239,68,68,.8)', flexShrink: 0 }} />}
                      <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</strong>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>{TYPE_LABELS[item.type] || item.type} · {PRIORITY_LABELS[item.priority] || item.priority} · {item.client?.companyName || 'Genel'}</div>
                  </div>
                  <div>{statusBadge(item.status)}</div>
                  <Meta label="Atanan" value={item.assignee?.username} />
                  <Meta label="Deadline" value={formatDate(item.dueDate)} />
                  <div style={{ justifySelf: 'end', color: 'var(--text-secondary)' }}>{isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</div>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 1rem 1rem 1rem' }}>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(260px, .8fr)', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                          <Info label="Atayan" value={item.createdBy?.username} />
                          <Info label="Teslim" value={formatDate(item.submittedAt, true)} />
                          <Info label="Onay" value={formatDate(item.approvedAt, true)} />
                        </div>
                        {item.description && <NoteBox title="Açıklama" note={item.description} color="#60a5fa" />}
                        {item.lastSubmissionNote && <NoteBox title="Son Teslim Notu" note={item.lastSubmissionNote} color="#a855f7" />}
                        {item.lastRevisionNote && <NoteBox title="Son Revize Notu" note={item.lastRevisionNote} color="#ef4444" />}

                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {canCurrentUserWork(item) && ['ASSIGNED', 'REVISION_REQUESTED'].includes(item.status) && <button type="button" className="btn" disabled={loading} onClick={() => runAction(() => startWorkItemAction(item.id))}><Clock size={16} /> Başladım</button>}
                          {canCurrentUserWork(item) && ['ASSIGNED', 'IN_PROGRESS', 'REVISION_REQUESTED'].includes(item.status) && (
                            <form action={(formData) => runAction(() => submitWorkItemAction(formData))} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <input type="hidden" name="workItemId" value={item.id} />
                              <input name="note" className="input-field" placeholder="Teslim notu (opsiyonel)" style={{ minWidth: '240px' }} />
                              <button className="btn btn-primary" disabled={loading} type="submit"><Send size={16} /> Teslim Et</button>
                            </form>
                          )}
                          {canCurrentUserManage(item) && item.status === 'SUBMITTED' && <button type="button" className="btn btn-primary" disabled={loading} onClick={() => runAction(() => approveWorkItemAction(item.id))}><CheckCircle2 size={16} /> Onayla</button>}
                          {canCurrentUserManage(item) && item.status === 'SUBMITTED' && (
                            <form action={(formData) => runAction(() => requestWorkItemRevisionAction(formData))} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <input type="hidden" name="workItemId" value={item.id} />
                              <input name="note" className="input-field" required placeholder="Revize açıklaması zorunlu" style={{ minWidth: '260px' }} />
                              <button className="btn" disabled={loading} type="submit"><RefreshCw size={16} /> Revize İste</button>
                            </form>
                          )}
                          {canCurrentUserManage(item) && !['APPROVED', 'CANCELLED'].includes(item.status) && <button type="button" className="btn" disabled={loading} onClick={() => runAction(() => cancelWorkItemAction(item.id))} style={{ color: '#ef4444' }}>İptal Et</button>}
                        </div>
                      </div>

                      <div className="card" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem' }}>
                        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Geçmiş</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '360px', overflow: 'auto', paddingRight: '0.25rem' }}>
                          {item.events.map((event) => <EventRow key={event.id} event={event} />)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {displayedItems.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Bu listede iş yok.</div>}
        </div>
      </div>

      <CustomDialog isOpen={!!error} title="Hata" onClose={() => setError('')} onConfirm={() => setError('')} confirmText="Tamam" showCancel={false}>
        <div style={{ color: 'var(--text-secondary)' }}>{error}</div>
      </CustomDialog>
    </div>
  );
}

function SummaryCard({ value, label }) {
  return <div className="card" style={{ padding: '0.8rem 1rem', minWidth: '120px' }}><div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{value}</div><div className="text-muted" style={{ fontSize: '0.72rem' }}>{label}</div></div>;
}

function Field({ label, children }) {
  return <div className="input-group"><label className="input-label">{label}</label>{children}</div>;
}

function Meta({ label, value }) {
  return <div style={{ minWidth: 0 }}><div className="text-muted" style={{ fontSize: '0.68rem', marginBottom: '0.15rem' }}>{label}</div><div style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '-'}</div></div>;
}

function Info({ label, value }) {
  return <div style={{ padding: '0.7rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}><div className="input-label" style={{ marginBottom: '0.2rem' }}>{label}</div><div style={{ fontWeight: 800, fontSize: '0.86rem' }}>{value || '-'}</div></div>;
}

function NoteBox({ title, note, color }) {
  return <div style={{ padding: '0.85rem', borderRadius: '10px', background: `${color}16`, border: `1px solid ${color}33` }}><div style={{ color, fontWeight: 900, fontSize: '0.8rem', marginBottom: '0.35rem' }}>{title}</div><div style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem' }}>{note}</div></div>;
}

function EventRow({ event }) {
  const color = event.type === 'REVISION_REQUESTED' ? '#ef4444' : event.type === 'APPROVED' ? '#10b981' : event.type === 'SUBMITTED' ? '#a855f7' : '#60a5fa';
  return <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: '0.75rem' }}><div style={{ fontSize: '0.82rem', fontWeight: 800 }}>{EVENT_LABELS[event.type] || event.type} · {event.user?.username}</div><div className="text-muted" style={{ fontSize: '0.72rem' }}>{formatDate(event.createdAt, true)}</div>{event.note && <div style={{ fontSize: '0.82rem', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{event.note}</div>}</div>;
}
