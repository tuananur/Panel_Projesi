'use client';

import { useEffect, useState } from 'react';
import { cancelOtoBlogAutoJobAction, getOtoBlogAutoJobsAction, resumeOtoBlogAutoJobAction } from './oto-blog-actions';

const LEASE_MS = 90 * 1000;

function jobBadge(job, orphan) {
  if (job.status === 'done') return { text: 'Tamamlandı', color: '#10b981' };
  if (orphan) return { text: 'Devam ettirilecek', color: '#f59e0b' };
  if (job.status === 'error') return { text: 'Hata', color: '#ef4444' };
  if (job.status === 'cancelled') return { text: 'İptal', color: '#94a3b8' };
  if (job.status === 'queued') return { text: 'Sırada bekliyor', color: '#64748b' };
  if (job.status === 'running') return { text: 'Şu an yapılıyor', color: '#3b82f6' };
  return { text: job.status, color: '#3b82f6' };
}

function formatWhen(value) {
  try {
    return new Date(value).toLocaleString('tr-TR');
  } catch {
    return value;
  }
}

export default function OtoBlogAutoLogs({ initialJobs, initialError }) {
  const [jobs, setJobs] = useState(initialJobs || []);
  const [error, setError] = useState(initialError);
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      const result = await getOtoBlogAutoJobsAction();
      if (cancelled) return;
      if (result.success) {
        setJobs(result.jobs);
        setError(null);
      } else {
        setError(result.error);
      }
    }
    tick();
    const id = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="card">
      {error && <p style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>{error}</p>}
      {!jobs.length && !error && <p className="text-muted">Henüz tam oto işi yok.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {jobs.map((job) => {
          const open = openId === job.id;
          const orphan = job.status === 'running' && Date.now() - new Date(job.updatedAt).getTime() > LEASE_MS;
          const badge = jobBadge(job, orphan);
          const canResume = orphan || job.status === 'error';
          const canCancel = job.status !== 'done' && job.status !== 'cancelled';
          return (
            <div key={job.id} style={{ border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : job.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.85rem 1rem',
                  background: 'transparent',
                  color: 'inherit',
                  border: 0,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'baseline' }}>
                  <strong>{job.client.companyName}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatWhen(job.createdAt)}</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>{job.client.website || '—'}</div>
                <div style={{ marginTop: '0.45rem', fontSize: '0.88rem', fontWeight: 700 }}>{job.topic}</div>
                {job.refinedTopic && job.refinedTopic !== job.topic && (
                  <div className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>AI konu: {job.refinedTopic}</div>
                )}
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    color: badge.color,
                    background: `${badge.color}1a`,
                    border: `1px solid ${badge.color}55`,
                    borderRadius: 999,
                    padding: '0.18rem 0.55rem',
                  }}>
                    {badge.text}
                  </span>
                </div>
                {job.statusText && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.82rem', fontWeight: 700 }}>
                    {job.statusText}{job.title ? ` · ${job.title}` : ''}
                  </div>
                )}
              </button>
              {open && (
                <div style={{ padding: '0 1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      son güncelleme: {formatWhen(job.updatedAt)}
                    </span>
                    {canCancel && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {canResume && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={busyId === job.id}
                            onClick={async (event) => {
                              event.stopPropagation();
                              setBusyId(job.id);
                              const result = await resumeOtoBlogAutoJobAction(job.id);
                              if (result.error) setError(result.error);
                              setBusyId(null);
                            }}
                            style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem' }}
                          >
                            {busyId === job.id ? '…' : 'Devam ettir'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn"
                          disabled={busyId === job.id}
                          onClick={async (event) => {
                            event.stopPropagation();
                            setBusyId(job.id);
                            const result = await cancelOtoBlogAutoJobAction(job.id);
                            if (result.error) setError(result.error);
                            setBusyId(null);
                          }}
                          style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.35)' }}
                        >
                          İptal
                        </button>
                      </div>
                    )}
                  </div>
                  {job.error && <p style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>{job.error}</p>}
                  {(job.logs || []).map((line, index) => (
                    <div key={`${job.id}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.75rem' }}>
                      <span>{line.text}</span>
                      <span className="text-muted" style={{ whiteSpace: 'nowrap' }}>{formatWhen(line.at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
