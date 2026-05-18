'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, Building2, Target, StickyNote, Briefcase, ChevronRight } from 'lucide-react';
import { globalSearchAction } from '@/app/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TYPE_META = {
  client: { label: 'Müşteri', icon: Building2, color: '#3b82f6' },
  work_item: { label: 'İş', icon: Briefcase, color: '#8b5cf6' },
  note: { label: 'Not', icon: StickyNote, color: '#f59e0b' },
  task: { label: 'Görev', icon: Target, color: '#10b981' },
};

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    setQuery('');
    setResults([]);
  }, [open]);

  const runSearch = useCallback(async (value) => {
    if (value.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const result = await globalSearchAction(value);
    setResults(result?.results || []);
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query.trim()), 280);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '1.25rem',
          right: '1.25rem',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.65rem 1rem',
          borderRadius: '999px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)',
        }}
        title="Ara (Ctrl+K)"
      >
        <Search size={16} />
        <span className="global-search-hint">Ara…</span>
        <kbd style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)' }}>Ctrl+K</kbd>
        <style jsx>{`
          @media (max-width: 640px) {
            .global-search-hint { display: none; }
          }
        `}</style>
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '10vh 1rem 1rem',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(640px, 100%)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.45)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          {isSearching ? <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent-primary)' }} /> : <Search size={20} style={{ color: 'var(--text-secondary)' }} />}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Müşteri, iş, not veya görev ara…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem',
            }}
          />
          <button type="button" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ maxHeight: '50vh', overflowY: 'auto', padding: '0.5rem' }}>
          {query.length < 2 && (
            <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              En az 2 karakter yazın. Müşteri, iş takibi, not ve görevlerde arar.
            </p>
          )}
          {query.length >= 2 && !isSearching && results.length === 0 && (
            <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Sonuç bulunamadı.</p>
          )}
          {results.map((item, idx) => {
            const meta = TYPE_META[item.type] || TYPE_META.task;
            const Icon = meta.icon;
            return (
              <button
                key={`${item.type}-${item.id}-${idx}`}
                type="button"
                onClick={() => { setOpen(false); router.push(item.href); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  border: 'none',
                  borderRadius: '10px',
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                className="global-search-result"
              >
                <span style={{ width: 36, height: 36, borderRadius: '10px', background: `${meta.color}18`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{meta.label} · {item.subtitle}</span>
                </span>
                <ChevronRight size={16} style={{ opacity: 0.4, flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .global-search-result:hover { background: rgba(255,255,255,0.04); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
