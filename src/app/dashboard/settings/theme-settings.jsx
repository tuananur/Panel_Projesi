'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useTheme } from '@/app/components/theme-provider';
import { Sun, Moon, Palette, CheckCircle2, Save, AlertCircle, Sparkles, RotateCcw } from 'lucide-react';
import { saveAppearanceSettingsAction, resetAppearanceSettingsAction } from '@/app/actions';
import {
  ACCENT_CATEGORIES,
  ACCENT_PRESETS,
  DEFAULT_APPEARANCE,
  isValidHexColor,
  THEME_OPTIONS,
} from '@/lib/appearance';

const THEME_ICONS = { dark: <Moon size={20} />, light: <Sun size={20} /> };

function StatusMessage({ message }) {
  if (!message) return null;
  const color = message.type === 'error' ? '#ef4444' : '#10b981';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color, fontWeight: 700, fontSize: '0.85rem' }}>
      {message.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />} {message.text}
    </div>
  );
}

export default function ThemeSettings({ initialAppearance }) {
  const {
    theme,
    accent,
    customColor,
    savedTheme,
    savedAccent,
    savedCustomColor,
    previewTheme,
    previewAccent,
    commitTheme,
    commitAccent,
    hydrateAppearance,
  } = useTheme();

  const [themeMessage, setThemeMessage] = useState(null);
  const [accentMessage, setAccentMessage] = useState(null);
  const [themePending, startThemeTransition] = useTransition();
  const [accentPending, startAccentTransition] = useTransition();
  const [customDraft, setCustomDraft] = useState(savedCustomColor || '#6366f1');

  useEffect(() => {
    if (initialAppearance && hydrateAppearance) {
      hydrateAppearance({ ...DEFAULT_APPEARANCE, ...initialAppearance });
      if (initialAppearance.customColor) setCustomDraft(initialAppearance.customColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const themeDirty = theme !== savedTheme;
  const accentDirty = accent !== savedAccent || (accent === 'custom' && customColor !== savedCustomColor);

  const presetsByCategory = useMemo(() => {
    const grouped = {};
    for (const cat of ACCENT_CATEGORIES) grouped[cat.id] = [];
    for (const preset of ACCENT_PRESETS) {
      (grouped[preset.category] ||= []).push(preset);
    }
    return grouped;
  }, []);

  const activePreset = ACCENT_PRESETS.find((p) => p.id === accent);
  const previewColor = accent === 'custom' ? (customColor || '#6366f1') : (activePreset?.color || '#3b82f6');
  const previewGradient = accent === 'custom'
    ? `linear-gradient(135deg, ${previewColor} 0%, ${previewColor} 100%)`
    : (activePreset?.gradient || 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)');

  const handleResetAll = () => {
    setThemeMessage(null);
    setAccentMessage(null);
    startThemeTransition(async () => {
      const result = await resetAppearanceSettingsAction();
      if (result?.error) {
        setThemeMessage({ type: 'error', text: result.error });
        return;
      }
      if (result?.settings) {
        hydrateAppearance(result.settings);
        commitTheme(result.settings.theme);
        commitAccent(result.settings.accent, result.settings.customColor);
        if (result.settings.customColor) setCustomDraft(result.settings.customColor);
      }
      setThemeMessage({ type: 'success', text: 'Görünüm ayarları varsayılana döndürüldü.' });
    });
  };

  const handleSaveTheme = () => {
    setThemeMessage(null);
    const formData = new FormData();
    formData.set('theme', theme);
    formData.set('accent', savedAccent);
    if (savedCustomColor) formData.set('customColor', savedCustomColor);
    startThemeTransition(async () => {
      const result = await saveAppearanceSettingsAction(formData);
      if (result?.error) {
        setThemeMessage({ type: 'error', text: result.error });
        return;
      }
      if (result?.settings) commitTheme(result.settings.theme);
      setThemeMessage({ type: 'success', text: 'Görünüm modu kaydedildi.' });
    });
  };

  const handleSaveAccent = () => {
    setAccentMessage(null);
    if (accent === 'custom' && !isValidHexColor(customColor || '')) {
      setAccentMessage({ type: 'error', text: 'Geçerli bir hex renk girin (örn. #6366f1).' });
      return;
    }
    const formData = new FormData();
    formData.set('theme', savedTheme);
    formData.set('accent', accent);
    if (accent === 'custom' && customColor) formData.set('customColor', customColor);
    startAccentTransition(async () => {
      const result = await saveAppearanceSettingsAction(formData);
      if (result?.error) {
        setAccentMessage({ type: 'error', text: result.error });
        return;
      }
      if (result?.settings) {
        commitAccent(result.settings.accent, result.settings.customColor);
      }
      setAccentMessage({ type: 'success', text: 'Vurgu rengi kaydedildi.' });
    });
  };

  const onPickPreset = (id) => {
    setAccentMessage(null);
    previewAccent(id, null);
  };

  const onPickCustom = (hex) => {
    setAccentMessage(null);
    setCustomDraft(hex);
    if (isValidHexColor(hex)) {
      previewAccent('custom', hex);
    } else {
      previewAccent('custom', null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Görünüm Modu */}
      <div className="card">
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}>
              <Palette size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Görünüm Modu</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Karanlık veya aydınlık tema seçin.</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {THEME_OPTIONS.map((t) => {
            const selected = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => { setThemeMessage(null); previewTheme(t.id); }}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: `2px solid ${selected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: selected ? 'rgba(99, 102, 241, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: selected ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{THEME_ICONS[t.id]}</span>
                  <span style={{ fontWeight: 600 }}>{t.label}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.description}</p>
                {selected && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--accent-primary)' }}>
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <StatusMessage message={themeMessage} />
            {themeDirty && !themeMessage && (
              <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>Kaydedilmemiş değişiklik</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={handleResetAll} disabled={themePending} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <RotateCcw size={16} /> Varsayılana Dön
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveTheme}
              disabled={themePending || !themeDirty}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Save size={16} /> {themePending ? 'Kaydediliyor...' : 'Görünüm Modunu Kaydet'}
            </button>
          </div>
        </div>
      </div>

      {/* Vurgu Rengi */}
      <div className="card">
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: `${previewColor}1a`, color: previewColor }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Vurgu Rengi</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Panelin vurgu rengini ve gradient’ini seçin.</p>
            </div>
          </div>
        </div>

        {/* Canlı önizleme */}
        <div style={{
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          border: '1px solid var(--border-color)',
          background: 'rgba(255,255,255,0.02)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.4rem 0.85rem', borderRadius: '999px',
            background: previewGradient, color: 'white', fontSize: '0.75rem', fontWeight: 700,
          }}>
            <Sparkles size={12} /> Önizleme
          </span>
          <button type="button" style={{
            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'default',
            background: previewGradient, color: 'white', fontWeight: 700, fontSize: '0.85rem',
            boxShadow: `0 6px 18px ${previewColor}40`,
          }}>Örnek Buton</button>
          <span style={{ color: previewColor, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'underline' }}>Örnek bağlantı</span>
          <span style={{
            padding: '0.25rem 0.7rem', borderRadius: '6px',
            background: `${previewColor}22`, color: previewColor, fontSize: '0.75rem', fontWeight: 700,
          }}>Etiket</span>
        </div>

        {/* Kategoriye göre renkler */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {ACCENT_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                {cat.label}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                {presetsByCategory[cat.id]?.map((a) => {
                  const selected = accent === a.id;
                  return (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => onPickPreset(a.id)}
                      title={a.label}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                        padding: '0.7rem 0.5rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: `2px solid ${selected ? a.color : 'var(--border-color)'}`,
                        background: selected ? `${a.color}12` : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: a.gradient,
                        boxShadow: selected ? `0 0 0 3px ${a.color}33, 0 6px 16px ${a.color}55` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                      }}>
                        {selected && <CheckCircle2 size={18} />}
                      </span>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700,
                        color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        textAlign: 'center', lineHeight: 1.2,
                      }}>{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Özel renk */}
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Özel Renk
            </div>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                padding: '1rem',
                borderRadius: '12px',
                border: `2px solid ${accent === 'custom' ? (customColor || '#6366f1') : 'var(--border-color)'}`,
                background: accent === 'custom' ? `${(customColor || '#6366f1')}10` : 'rgba(255,255,255,0.02)',
              }}
            >
              <input
                type="color"
                value={isValidHexColor(customDraft) ? customDraft : '#6366f1'}
                onChange={(e) => onPickCustom(e.target.value)}
                style={{
                  width: '52px', height: '52px', border: 'none', borderRadius: '12px',
                  background: 'transparent', cursor: 'pointer', padding: 0,
                }}
                aria-label="Renk seçici"
              />
              <input
                type="text"
                value={customDraft}
                onChange={(e) => onPickCustom(e.target.value)}
                placeholder="#6366f1"
                spellCheck={false}
                style={{
                  flex: '1 1 160px', maxWidth: '220px',
                  padding: '0.6rem 0.85rem', borderRadius: '8px',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  border: `1px solid ${isValidHexColor(customDraft) ? 'var(--border-color)' : '#ef4444'}`,
                  fontFamily: 'monospace', fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                İstediğiniz hex değerini girin veya seçiciden renk alın.
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <StatusMessage message={accentMessage} />
            {accentDirty && !accentMessage && (
              <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>Kaydedilmemiş değişiklik</span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveAccent}
            disabled={accentPending || !accentDirty}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Save size={16} /> {accentPending ? 'Kaydediliyor...' : 'Vurgu Rengini Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
