'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { saveOtoBlogConfigAction, testOtoBlogLanguagesAction, testOtoBlogPostAction } from '@/app/actions';
import { defaultOtoBlogConfig } from '@/lib/oto-blog';

function ResultBox({ result }) {
  if (!result) return null;
  const color = result.error || result.ok === false ? '#ef4444' : '#10b981';
  return (
    <pre
      style={{
        margin: 0,
        padding: '0.75rem',
        borderRadius: '8px',
        border: `1px solid ${color}33`,
        background: `${color}10`,
        color,
        fontSize: '0.72rem',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        maxHeight: '220px',
        overflow: 'auto',
      }}
    >
      {result.error
        ? result.error
        : `HTTP ${result.status}\n${typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}`}
    </pre>
  );
}

export default function OtoBlogSettingsModal({ client, onClose, onSaved }) {
  const [config, setConfig] = useState(client.config);
  const [saving, setSaving] = useState(false);
  const [testingPost, setTestingPost] = useState(false);
  const [testingGet, setTestingGet] = useState(false);
  const [message, setMessage] = useState(null);
  const [postResult, setPostResult] = useState(null);
  const [getResult, setGetResult] = useState(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  function patch(partial) {
    setConfig((current) => ({ ...current, ...partial }));
  }

  function fillFromOrigin() {
    const next = defaultOtoBlogConfig(config.siteOrigin || client.website);
    patch({
      siteOrigin: next.siteOrigin,
      postUrl: next.postUrl,
      languagesUrl: next.languagesUrl,
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const result = await saveOtoBlogConfigAction(client.id, config);
    if (result.success) {
      setConfig(result.config);
      onSaved(result.config);
      setMessage({ type: 'success', text: 'Kaydedildi.' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setSaving(false);
  }

  async function handlePostTest() {
    setTestingPost(true);
    setPostResult(null);
    const result = await testOtoBlogPostAction(client.id, config);
    setPostResult(result.success ? result : { error: result.error, ok: false });
    setTestingPost(false);
  }

  async function handleGetTest() {
    setTestingGet(true);
    setGetResult(null);
    const result = await testOtoBlogLanguagesAction(client.id, config);
    setGetResult(result.success ? result : { error: result.error, ok: false });
    setTestingGet(false);
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '760px', width: 'min(760px, calc(100vw - 2rem))' }}
      >
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          {client.companyName} · Beyin Atölyesi
        </h3>
        <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1.25rem' }}>
          Endpoint, header ve body’yi düzenle. Test gerçek istek atar; POST sitede yazı oluşturabilir.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Site kökü</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="input-field" value={config.siteOrigin} onChange={(e) => patch({ siteOrigin: e.target.value })} placeholder="https://terapiyle.com" />
              <button type="button" className="btn" onClick={fillFromOrigin} style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>URL doldur</button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">POST · blog oluştur</label>
            <input className="input-field" value={config.postUrl} onChange={(e) => patch({ postUrl: e.target.value })} placeholder="https://terapiyle.com/api/post-create" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="input-group">
              <label className="input-label">Header adı</label>
              <input className="input-field" value={config.headerName} onChange={(e) => patch({ headerName: e.target.value })} placeholder="X-POST-KEY" />
            </div>
            <div className="input-group">
              <label className="input-label">Header değeri</label>
              <input className="input-field" type="password" value={config.headerValue} onChange={(e) => patch({ headerValue: e.target.value })} placeholder="Site API key" autoComplete="off" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Body (JSON)</label>
            <textarea
              className="input-field"
              rows={10}
              value={config.bodyJson}
              onChange={(e) => patch({ bodyJson: e.target.value })}
              style={{ fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: 1.45 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={handlePostTest} disabled={testingPost}>
              {testingPost ? 'POST gidiyor…' : 'POST test'}
            </button>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>Kaydetmeden de dener.</span>
          </div>
          <ResultBox result={postResult} />

          <div className="input-group">
            <label className="input-label">GET · diller</label>
            <input className="input-field" value={config.languagesUrl} onChange={(e) => patch({ languagesUrl: e.target.value })} placeholder="https://terapiyle.com/api/languages" />
          </div>

          <div>
            <button type="button" className="btn btn-primary" onClick={handleGetTest} disabled={testingGet}>
              {testingGet ? 'GET gidiyor…' : 'GET test'}
            </button>
          </div>
          <ResultBox result={getResult} />

          <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div className="input-label" style={{ marginBottom: '0.55rem' }}>Site → Dashboard (tam oto)</div>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>
              Sitedeki kutu bu endpoint’e POST atar. Header adı sabit: X-OTO-BLOG-KEY
            </p>
            <div className="input-group">
              <label className="input-label">Endpoint</label>
              <input className="input-field" readOnly value={typeof window !== 'undefined' ? `${window.location.origin}/api/oto-blog/auto` : '/api/oto-blog/auto'} />
            </div>
            <div className="input-group">
              <label className="input-label">X-OTO-BLOG-KEY</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="input-field" value={config.inboundKey || ''} onChange={(e) => patch({ inboundKey: e.target.value })} autoComplete="off" />
                <button
                  type="button"
                  className="btn"
                  style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}
                  onClick={() => {
                    const bytes = new Uint8Array(24);
                    crypto.getRandomValues(bytes);
                    patch({ inboundKey: Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('') });
                  }}
                >
                  Üret
                </button>
              </div>
            </div>
            <pre style={{ margin: 0, padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', fontSize: '0.72rem', whiteSpace: 'pre-wrap' }}>
{`POST /api/oto-blog/auto
${'X-OTO-BLOG-KEY'}: ${config.inboundKey || '<key>'}
Content-Type: application/json

{ "topic": "Kaygı ile baş etmek için günlük rutinler" }`}
            </pre>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
          {message && (
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: message.type === 'success' ? '#10b981' : '#ef4444' }}>
              {message.text}
            </span>
          )}
          <button type="button" className="btn" onClick={onClose} style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>Kapat</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
