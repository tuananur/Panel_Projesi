'use client';

import { useEffect, useState } from 'react';
import { cancelOtoBlogAutoJobAction, getOtoBlogAutoJobsAction, resumeOtoBlogAutoJobAction } from './oto-blog-actions';

const STUCK_MS = 2 * 60 * 1000;

function statusColor(status) {
  if (status === 'done') return '#10b981';
  if (status === 'error') return '#ef4444';
  if (status === 'cancelled') return '#94a3b8';
  return '#3b82f6';
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
          const color = statusColor(job.status);
          const open = openId === job.id;
          const stuck = job.status === 'running' && Date.now() - new Date(job.updatedAt).getTime() > STUCK_MS;
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
                <div style={{ marginTop: '0.45rem', fontSize: '0.78rem', fontWeight: 800, color }}>
                  {job.statusText}{job.title ? ` · ${job.title}` : ''}
                  {stuck ? ' · kilitlendi' : ''}
                </div>
              </button>
              {open && (
                <div style={{ padding: '0 1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      adım: {job.phase || '—'} · son güncelleme: {formatWhen(job.updatedAt)}
                    </span>
                    {job.status !== 'done' && job.status !== 'cancelled' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
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
