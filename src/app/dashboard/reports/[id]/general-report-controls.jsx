'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { Settings, X, Check, CheckCheck } from 'lucide-react';
import {
  GENERAL_REPORT_SECTIONS,
  ALL_SECTION_NOS,
  defaultVisibleSet,
  loadVisibleSections,
  saveVisibleSections,
} from './general-report-sections';

// Aynı sekmede localStorage değişimini dinlemek için (storage eventi yalnızca diğer sekmelerde ateşlenir).
const listeners = new Set();
function emit() {
  listeners.forEach((listener) => listener());
}
function subscribe(listener) {
  listeners.add(listener);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', listener);
    }
  };
}

function snapshotFromSet(set) {
  return [...set].sort((a, b) => a - b).join(',');
}

function getSnapshot() {
  return snapshotFromSet(loadVisibleSections());
}

function getServerSnapshot() {
  return snapshotFromSet(defaultVisibleSet());
}

function persist(next) {
  saveVisibleSections(next);
  emit();
}

/**
 * Genel Rapor üzerinde bölüm görünürlüğü.
 * Kapalı bölümler CSS ile gizlenir (PDF'e de girmez); tercih localStorage'da saklanır.
 */
export default function GeneralReportControls({ children }) {
  const [open, setOpen] = useState(false);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const visible = useMemo(
    () => new Set(snapshot.split(',').map(Number).filter(Boolean)),
    [snapshot],
  );

  const update = (next) => {
    const set = next instanceof Set ? next : new Set(next);
    if (set.size === 0) return;
    persist(set);
  };

  const toggle = (no) => {
    const next = new Set(visible);
    if (next.has(no)) next.delete(no);
    else next.add(no);
    update(next);
  };

  const selectAll = () => update(defaultVisibleSet());
  const selectNone = () => update(new Set([1]));

  const hideCss = ALL_SECTION_NOS
    .filter((no) => !visible.has(no))
    .map((no) => `.general-report-root [data-section-no="${no}"]{display:none!important}`)
    .join('');

  const selectedCount = visible.size;

  return (
    <div className="general-report-root">
      {hideCss && <style>{hideCss}</style>}

      <div
        data-pdf-hide
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
          {selectedCount}/{ALL_SECTION_NOS.length} bölüm seçili
        </p>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.8rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: open ? 'rgba(66, 133, 244, 0.12)' : 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Settings size={15} />
          Bölüm ayarları
        </button>
      </div>

      {open && (
        <div data-pdf-hide className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '0.95rem' }}>Raporda gösterilecek bölümler</strong>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={selectAll} style={chipBtn}>
                <CheckCheck size={14} /> Tümü
              </button>
              <button type="button" onClick={selectNone} style={chipBtn}>
                Sadece özet
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" style={{ ...chipBtn, padding: '0.35rem' }}>
                <X size={14} />
              </button>
            </div>
          </div>

          <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>
            İşaretlediğin bölümler raporda ve PDF&apos;te görünür. Tercih bu tarayıcıda saklanır.
          </p>

          <div
            className="custom-scrollbar"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '0.35rem',
              maxHeight: '420px',
              overflowY: 'auto',
            }}
          >
            {GENERAL_REPORT_SECTIONS.map((section) => {
              const checked = visible.has(section.no);
              return (
                <label
                  key={section.no}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.45rem 0.55rem',
                    borderRadius: '8px',
                    border: `1px solid ${checked ? 'rgba(66, 133, 244, 0.35)' : 'var(--border-color)'}`,
                    background: checked ? 'rgba(66, 133, 244, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: `1.5px solid ${checked ? '#4285F4' : 'var(--border-color)'}`,
                      background: checked ? '#4285F4' : 'transparent',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#fff',
                    }}
                  >
                    {checked && <Check size={12} strokeWidth={3} />}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(section.no)}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 700, minWidth: '1.5rem' }}>{section.no}</span>
                  <span style={{ fontWeight: 600 }}>{section.title}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}

const chipBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  padding: '0.35rem 0.65rem',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  background: 'transparent',
  color: 'var(--text-secondary)',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
};
