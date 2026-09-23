'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  expandOtoBlogTopicFromKeywordAction,
  fetchOtoBlogLanguagesAction,
  generateOtoBlogContentAction,
  generateOtoBlogImageAction,
  generateOtoBlogImagePromptAction,
  generateOtoBlogOutlineAction,
  finalizeOtoBlogPublishAction,
  prepareOtoBlogPublishAction,
  publishOtoBlogLanguageAction,
  refineOtoBlogSystemPromptAction,
  saveOtoBlogAiSettingsAction,
  saveOtoBlogDraftAction,
} from './oto-blog-actions';
import { IMAGE_MODELS, TEXT_MODELS, emptyOtoBlogDraft, isTurkishLanguage, keywordWasUsed, rememberUsedKeywords } from '@/lib/oto-blog';

const STEPS = [
  { id: 1, label: 'Konu' },
  { id: 2, label: 'Başlık / maddeler' },
  { id: 3, label: 'İçerik' },
  { id: 4, label: 'Fotoğraf' },
  { id: 5, label: 'Diller' },
  { id: 6, label: 'Gönder' },
  { id: 7, label: 'Taslak' },
];

export default function OtoBlogWizard({ client, initialDraft, initialAi, initialImageUrl, keywordSuggestions = [] }) {
  const [step, setStep] = useState(initialDraft.published ? 7 : (initialDraft.step || 1));
  const [draft, setDraft] = useState(() => ({ ...emptyOtoBlogDraft(), ...initialDraft }));
  const [ai, setAi] = useState(initialAi);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [publishQueue, setPublishQueue] = useState([]);
  const [publishGroupId, setPublishGroupId] = useState('');
  const [imageUrl, setImageUrl] = useState(initialImageUrl || (initialDraft.imageToken ? `/api/oto-blog/image/${initialDraft.imageToken}` : ''));

  const itemsText = useMemo(() => (draft.items || []).join('\n'), [draft.items]);
  const suggestions = useMemo(
    () => (keywordSuggestions || []).map((item) => ({
      ...item,
      used: item.used || keywordWasUsed(item.keyword, draft.usedKeywords),
    })),
    [keywordSuggestions, draft.usedKeywords],
  );

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

  function patchQueue(id, patch) {
    setPublishQueue((current) => current.map((item) => (Number(item.id) === Number(id) ? { ...item, ...patch } : item)));
  }

  async function goPublish() {
    setBusy('publish'); setError(null); setInfo(null);
    const prepared = await prepareOtoBlogPublishAction(client.id, draft, publishGroupId);
    if (!prepared.success) {
      setBusy('');
      return setError(prepared.error);
    }

    setPublishGroupId(prepared.groupId);
    const queue = prepared.languages.map((lang) => {
      const previous = publishQueue.find((item) => Number(item.id) === Number(lang.id));
      return {
        ...lang,
        status: previous?.status === 'ok' ? 'ok' : 'wait',
        detail: previous?.status === 'ok' ? previous.detail : 'Bekliyor',
      };
    });
    setPublishQueue(queue);
    await new Promise((resolve) => setTimeout(resolve, 40));

    let failed = false;
    for (const lang of queue) {
      if (lang.status === 'ok') continue;
      patchQueue(lang.id, { status: 'sending', detail: `${lang.name} gönderiliyor` });
      const result = await publishOtoBlogLanguageAction(client.id, draft, ai, lang, prepared.groupId);
      if (result.ok) {
        patchQueue(lang.id, { status: 'ok', detail: `Gönderildi (${result.status})` });
      } else {
        failed = true;
        patchQueue(lang.id, { status: 'error', detail: result.error || `Hata ${result.status || ''}`.trim() });
      }
    }

    if (failed) {
      setBusy('');
      setInfo('Bazı diller hata verdi. Görsel duruyor, tekrar dene.');
      return;
    }

    const finished = await finalizeOtoBlogPublishAction(client.id, draft);
    setBusy('');
    if (!finished.success) return setError(finished.error);
    setDraft(finished.draft);
    setStep(7);
    setInfo(null);
  }

  async function pickKeyword(item) {
    setBusy(`kw:${item.keyword}`);
    setError(null);
    setInfo(item.used ? 'Bu kelimeden daha önce blog yazılmış.' : null);
    const result = await expandOtoBlogTopicFromKeywordAction(client.id, item.keyword, ai);
    setBusy('');
    if (!result.success) return setError(result.error);
    patchDraft({ topic: result.topic, sourceKeyword: item.keyword });
  }

  async function startNewBlog() {
    const next = {
      ...emptyOtoBlogDraft(),
      usedKeywords: rememberUsedKeywords(draft.usedKeywords, draft.sourceKeyword),
    };
    setDraft(next);
    setPublishQueue([]);
    setPublishGroupId('');
    setImageUrl('');
    setError(null);
    setInfo(null);
    setStep(1);
    await persist(next);
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
              onClick={() => {
                if (draft.published && item.id !== 7) return;
                setStep(item.id);
              }}
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
            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label className="input-label" htmlFor="oto-blog-topic">Blog konusu</label>
              <textarea
                id="oto-blog-topic"
                className="input-field"
                rows={5}
                value={draft.topic}
                onChange={(e) => patchDraft({ topic: e.target.value, sourceKeyword: draft.sourceKeyword })}
                placeholder="Örn: Kaygı ile baş etmek için günlük rutinler"
                style={{ minHeight: '8.5rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.15rem' }}>
              <div className="input-label" style={{ marginBottom: '0.55rem' }}>Ubersuggest önerileri</div>
              {suggestions.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {suggestions.map((item) => {
                    const loading = busy === `kw:${item.keyword}`;
                    const selected = draft.sourceKeyword === item.keyword;
                    return (
                      <button
                        key={item.keyword}
                        type="button"
                        disabled={!!busy}
                        onClick={() => pickKeyword(item)}
                        title={item.volume ? `Hacim: ${item.volume}` : item.keyword}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          maxWidth: '100%',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '999px',
                          border: selected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          background: item.used ? 'rgba(16, 185, 129, 0.08)' : selected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.03)',
                          color: 'var(--text-primary)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: busy ? 'wait' : 'pointer',
                          lineHeight: 1.3,
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{loading ? 'Konu yazılıyor…' : item.keyword}</span>
                        {item.used && (
                          <span style={{
                            flexShrink: 0,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            letterSpacing: '0.02em',
                            color: '#10b981',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.28)',
                            borderRadius: '999px',
                            padding: '0.12rem 0.4rem',
                          }}>
                            Blog yazıldı
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted" style={{ fontSize: '0.78rem', margin: 0 }}>Bu müşteri için kayıtlı Ubersuggest kelime önerisi yok.</p>
              )}
            </div>

            <button type="button" className="btn btn-primary" disabled={!draft.topic.trim() || busy} onClick={goGenerateOutline}>
              {busy === 'outline' ? 'Üretiliyor…' : 'Devam et'}
            </button>
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
            <button type="button" className="btn btn-primary" disabled={busy || draft.published} onClick={goPublish}>
              {draft.published ? 'Gönderildi' : busy === 'publish' ? 'Gönderiliyor…' : publishQueue.some((item) => item.status === 'error') ? 'Tekrar dene' : 'Siteye gönder'}
            </button>
            {publishQueue.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {publishQueue.map((item) => {
                  const color = item.status === 'ok' ? '#10b981' : item.status === 'error' ? '#ef4444' : item.status === 'sending' ? 'var(--accent-primary)' : 'var(--text-secondary)';
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        alignItems: 'center',
                        padding: '0.65rem 0.8rem',
                        borderRadius: 8,
                        border: `1px solid ${item.status === 'sending' ? 'rgba(59,130,246,0.35)' : 'var(--border-color)'}`,
                        background: item.status === 'ok' ? 'rgba(16,185,129,0.08)' : item.status === 'error' ? 'rgba(239,68,68,0.08)' : item.status === 'sending' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <strong style={{ fontSize: '0.85rem' }}>{item.name} <span className="text-muted" style={{ fontWeight: 600 }}>({item.code})</span></strong>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color, whiteSpace: 'nowrap' }}>
                        {item.status === 'sending' ? `${item.name} gönderiliyor…` : item.detail}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 7 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h2 className="heading-2" style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Bloglarınız taslak olarak panelinizde</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                Seçilen diller siteye taslak olarak düştü. Panellerinden kontrol edip yayınlayabilirsiniz.
              </p>
            </div>
            {imageUrl && (
              <img src={imageUrl} alt="" style={{ maxWidth: 480, width: '100%', borderRadius: '10px', border: '1px solid var(--border-color)' }} />
            )}
            <div>
              <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Başlık</div>
              <strong style={{ fontSize: '1.15rem' }}>{draft.title}</strong>
            </div>
            {draft.shortDesc && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{draft.shortDesc}</p>}
            <div>
              <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>İçerik</div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.85rem' }} dangerouslySetInnerHTML={{ __html: draft.content }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn" onClick={startNewBlog}>Yeni blog oluştur</button>
              <Link href="/dashboard/oto-blog" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                Oto Blog’a dön
              </Link>
            </div>
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
