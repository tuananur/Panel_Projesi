'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  fetchOtoBlogLanguagesAction,
  generateOtoBlogContentAction,
  generateOtoBlogImageAction,
  generateOtoBlogImagePromptAction,
  generateOtoBlogOutlineAction,
  publishOtoBlogAction,
  refineOtoBlogSystemPromptAction,
  saveOtoBlogAiSettingsAction,
  saveOtoBlogDraftAction,
} from './oto-blog-actions';
import { IMAGE_MODELS, TEXT_MODELS, emptyOtoBlogDraft, isTurkishLanguage } from '@/lib/oto-blog';

const STEPS = [
  { id: 1, label: 'Konu' },
  { id: 2, label: 'Başlık / maddeler' },
  { id: 3, label: 'İçerik' },
  { id: 4, label: 'Fotoğraf' },
  { id: 5, label: 'Diller' },
  { id: 6, label: 'Gönder' },
];

export default function OtoBlogWizard({ client, initialDraft, initialAi, initialImageUrl }) {
  const [step, setStep] = useState(initialDraft.step || 1);
  const [draft, setDraft] = useState(() => ({ ...emptyOtoBlogDraft(), ...initialDraft }));
  const [ai, setAi] = useState(initialAi);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [publishResults, setPublishResults] = useState(null);
  const [imageUrl, setImageUrl] = useState(initialImageUrl || (initialDraft.imageToken ? `/api/oto-blog/image/${initialDraft.imageToken}` : ''));

  const itemsText = useMemo(() => (draft.items || []).join('\n'), [draft.items]);

  function patchDraft(partial) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  useEffect(() => {
    if (step !== 5 && step !== 6) return;
    let cancelled = false;
    fetchOtoBlogLanguagesAction(client.id).then((result) => {
      if (cancelled) return;
      if (result.languages) setLanguages(result.languages);
      if (result.error && !result.languages?.length) setError(result.error);
    });
    return () => { cancelled = true; };
  }, [step, client.id]);

  async function persist(nextDraft) {
    await saveOtoBlogDraftAction(client.id, nextDraft);
  }

  async function goGenerateOutline() {
    setBusy('outline'); setError(null); setInfo(null);
    const result = await generateOtoBlogOutlineAction(client.id, draft.topic, ai);
    setBusy('');
    if (!result.success) return setError(result.error);
    setDraft(result.draft);
    setStep(2);
  }

  async function goGenerateContent() {
    setBusy('content'); setError(null); setInfo(null);
    const result = await generateOtoBlogContentAction(client.id, draft, ai);
    setBusy('');
    if (!result.success) return setError(result.error);
    setDraft(result.draft);
    setStep(3);
  }

  async function goGeneratePrompt() {
    setBusy('prompt'); setError(null); setInfo(null);
    const result = await generateOtoBlogImagePromptAction(client.id, draft, ai);
    setBusy('');
    if (!result.success) return setError(result.error);
    setDraft(result.draft);
    setStep(4);
  }

  async function goGenerateImage() {
    setBusy('image'); setError(null); setInfo(null);
    const result = await generateOtoBlogImageAction(client.id, draft.imagePrompt, ai);
    setBusy('');
    if (!result.success) return setError(result.error);
    setDraft(result.draft);
    setImageUrl(result.imageUrl || `/api/oto-blog/image/${result.draft.imageToken}`);
    setStep(4);
  }

  async function goPublish() {
    setBusy('publish'); setError(null); setInfo(null); setPublishResults(null);
    const result = await publishOtoBlogAction(client.id, draft, ai);
    setBusy('');
    if (result.error) return setError(result.error);
    setPublishResults(result.results || []);
    setInfo(result.allOk ? 'Tüm dillere gönderildi. Geçici görsel silindi.' : 'Bazı diller hata verdi. Görsel duruyor, tekrar dene.');
  }

  async function saveAi() {
    setBusy('ai'); setError(null); setInfo(null);
    const result = await saveOtoBlogAiSettingsAction(client.id, ai);
    setBusy('');
    if (!result.success) return setError(result.error);
    setAi(result.settings);
    setInfo('Müşteri AI ayarları kaydedildi.');
  }

  async function refinePrompt(kind) {
    const current = kind === 'image' ? ai.imageSystemPrompt : ai.textSystemPrompt;
    setBusy(`refine-${kind}`); setError(null); setInfo(null);
    const result = await refineOtoBlogSystemPromptAction(client.id, kind, current, ai);
    setBusy('');
    if (!result.success) return setError(result.error);
    setAi((c) => (kind === 'image' ? { ...c, imageSystemPrompt: result.prompt } : { ...c, textSystemPrompt: result.prompt }));
    setInfo('System prompt düzeltildi. Kaydetmeyi unutma.');
  }

  function toggleLang(id, locked) {
    if (locked) return;
    const current = new Set(draft.selectedLangIds);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    current.add(1);
    patchDraft({ selectedLangIds: [...current] });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div>
          <Link href="/dashboard/oto-blog" className="text-muted" style={{ fontSize: '0.8rem', textDecoration: 'none' }}>← Oto Blog</Link>
          <h1 className="heading-1" style={{ fontSize: '1.7rem', margin: '0.35rem 0 0' }}>{client.companyName}</h1>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {STEPS.map((item) => {
          const active = step === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className="btn"
              onClick={() => setStep(item.id)}
              style={{
                fontSize: '0.75rem',
                fontWeight: active ? 800 : 600,
                background: active ? 'var(--accent-primary)' : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {item.id}. {item.label}
            </button>
          );
        })}
      </div>

      {error && <p style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</p>}
      {info && <p style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>{info}</p>}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {step === 1 && (
          <div>
            <label className="input-label">Blog konusu</label>
            <textarea className="input-field" rows={4} value={draft.topic} onChange={(e) => patchDraft({ topic: e.target.value })} placeholder="Örn: Kaygı ile baş etmek için günlük rutinler" />
            <div style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn-primary" disabled={!draft.topic.trim() || busy} onClick={goGenerateOutline}>
                {busy === 'outline' ? 'Üretiliyor…' : 'Devam et'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="input-group">
              <label className="input-label">Blog başlığı</label>
              <input className="input-field" value={draft.title} onChange={(e) => patchDraft({ title: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="input-label">İçerik maddeleri (her satır bir madde)</label>
              <textarea className="input-field" rows={8} value={itemsText} onChange={(e) => patchDraft({ items: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean) })} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn" disabled={busy} onClick={goGenerateOutline}>Yeniden üret</button>
              <button type="button" className="btn btn-primary" disabled={!draft.title || !draft.items.length || busy} onClick={goGenerateContent}>
                {busy === 'content' ? 'Yazılıyor…' : 'Devam et'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="input-group">
              <label className="input-label">İçerik (HTML)</label>
              <textarea className="input-field" rows={14} value={draft.content} onChange={(e) => patchDraft({ content: e.target.value })} style={{ fontFamily: 'monospace', fontSize: '0.8rem' }} />
            </div>
            <div className="input-group">
              <label className="input-label">Meta title</label>
              <input className="input-field" value={draft.metaTitle} onChange={(e) => patchDraft({ metaTitle: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="input-label">Meta description</label>
              <textarea className="input-field" rows={3} value={draft.metaDescription} onChange={(e) => patchDraft({ metaDescription: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="input-label">Kısa açıklama</label>
              <textarea className="input-field" rows={3} value={draft.shortDesc} onChange={(e) => patchDraft({ shortDesc: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn" disabled={busy} onClick={goGenerateContent}>Yeniden üret</button>
              <button type="button" className="btn btn-primary" disabled={!draft.content || busy} onClick={goGeneratePrompt}>
                {busy === 'prompt' ? 'Prompt yazılıyor…' : 'Devam et'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="input-group">
              <label className="input-label">Fotoğraf promptu</label>
              <textarea className="input-field" rows={5} value={draft.imagePrompt} onChange={(e) => patchDraft({ imagePrompt: e.target.value })} />
            </div>
            <div>
              <button type="button" className="btn btn-primary" disabled={!draft.imagePrompt || busy} onClick={goGenerateImage}>
                {busy === 'image' ? 'Görsel üretiliyor…' : 'Oluştur'}
              </button>
              <button type="button" className="btn" style={{ marginLeft: '0.5rem' }} disabled={busy} onClick={goGeneratePrompt}>Promptu yenile</button>
            </div>
            {imageUrl && (
              <div>
                <p className="input-label">Önizleme</p>
                <img src={imageUrl} alt="Kapak önizleme" style={{ maxWidth: '100%', borderRadius: '10px', border: '1px solid var(--border-color)' }} />
              </div>
            )}
            <button type="button" className="btn btn-primary" disabled={!draft.imageToken || busy} onClick={() => setStep(5)}>Devam et</button>
          </div>
        )}

        {step === 5 && (
          <div>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.85rem' }}>Türkçe kilitli. Diğer diller çevirilerek basılır.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {languages.map((lang) => {
                const locked = isTurkishLanguage(lang);
                const checked = locked || draft.selectedLangIds.includes(Number(lang.id));
                return (
                  <label key={lang.id} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', opacity: locked ? 0.9 : 1 }}>
                    <input type="checkbox" checked={checked} disabled={locked} onChange={() => toggleLang(Number(lang.id), locked)} />
                    <span>{lang.name} <span className="text-muted">({lang.code} · {lang.id})</span>{locked ? ' · zorunlu' : ''}</span>
                  </label>
                );
              })}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn-primary" onClick={() => { persist(draft); setStep(6); }}>Devam et</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {imageUrl && <img src={imageUrl} alt="" style={{ maxWidth: 420, borderRadius: '10px', border: '1px solid var(--border-color)' }} />}
            <div>
              <strong>{draft.title}</strong>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>{draft.shortDesc}</p>
            </div>
            <div style={{ maxHeight: 260, overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.75rem' }} dangerouslySetInnerHTML={{ __html: draft.content }} />
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              Diller: {languages.filter((lang) => isTurkishLanguage(lang) || draft.selectedLangIds.includes(Number(lang.id))).map((lang) => lang.name).join(', ')}
            </p>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={goPublish}>
              {busy === 'publish' ? 'Gönderiliyor…' : 'Siteye gönder'}
            </button>
            {publishResults && (
              <div style={{ fontSize: '0.8rem' }}>
                {publishResults.map((item) => (
                  <p key={item.language.id} style={{ color: item.ok ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                    {item.language.name}: {item.ok ? `OK (${item.status})` : `Hata ${item.status}`}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card" style={{ background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
        <h2 className="heading-2" style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>AI ayarları</h2>
        <p className="text-muted" style={{ fontSize: '0.78rem', marginBottom: '1rem' }}>Bu müşteriye özel. API key Genel Ayarlar’da.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div className="input-group">
            <label className="input-label">Yazı modeli</label>
            <select className="input-field" value={ai.textModel} onChange={(e) => setAi((c) => ({ ...c, textModel: e.target.value }))}>
              {TEXT_MODELS.map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Görsel modeli</label>
            <select className="input-field" value={ai.imageModel} onChange={(e) => setAi((c) => ({ ...c, imageModel: e.target.value }))}>
              {IMAGE_MODELS.map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
            </select>
          </div>
        </div>
        <div className="input-group" style={{ marginBottom: '0.85rem' }}>
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Yazı system prompt
            <button type="button" className="btn" disabled={!ai.textSystemPrompt.trim() || busy} onClick={() => refinePrompt('text')} style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
              {busy === 'refine-text' ? 'Düzeltiliyor…' : 'Düzelt'}
            </button>
          </label>
          <textarea className="input-field" rows={5} value={ai.textSystemPrompt} onChange={(e) => setAi((c) => ({ ...c, textSystemPrompt: e.target.value }))} placeholder="Marka sesi, yasaklar, HTML kuralları…" />
        </div>
        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Görsel system prompt
            <button type="button" className="btn" disabled={!ai.imageSystemPrompt.trim() || busy} onClick={() => refinePrompt('image')} style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
              {busy === 'refine-image' ? 'Düzeltiliyor…' : 'Düzelt'}
            </button>
          </label>
          <textarea className="input-field" rows={4} value={ai.imageSystemPrompt} onChange={(e) => setAi((c) => ({ ...c, imageSystemPrompt: e.target.value }))} placeholder="Stil, yazısız görsel, renk paleti…" />
        </div>
        <button type="button" className="btn btn-primary" disabled={busy === 'ai'} onClick={saveAi} style={{ background: '#8b5cf6' }}>
          {busy === 'ai' ? 'Kaydediliyor…' : 'AI ayarlarını kaydet'}
        </button>
      </div>
    </div>
  );
}
