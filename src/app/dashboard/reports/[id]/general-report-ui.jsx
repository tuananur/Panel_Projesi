// Genel rapor bölümlerinin ortak kabuğu: numaralı başlık, kaynak etiketi, KPI ve tablo.

import { EMPTY_VALUE } from '../report-ui';
import { trLabel } from './report-labels';
import { SECTION_NOTES } from './section-notes';

const nf = new Intl.NumberFormat('tr-TR');

const SOURCE_COLORS = {
  GA4: { bg: 'rgba(66, 133, 244, 0.12)', border: 'rgba(66, 133, 244, 0.35)', text: '#4285F4' },
  'Search Console': { bg: 'rgba(52, 168, 83, 0.12)', border: 'rgba(52, 168, 83, 0.35)', text: '#34A853' },
  Ubersuggest: { bg: 'rgba(161, 66, 244, 0.12)', border: 'rgba(161, 66, 244, 0.35)', text: '#A142F4' },
  Beyin: { bg: 'rgba(251, 188, 5, 0.14)', border: 'rgba(251, 188, 5, 0.4)', text: '#B98900' },
};

const IMPACT_COLORS = {
  high: { bg: 'rgba(234, 67, 53, 0.12)', border: 'rgba(234, 67, 53, 0.4)', text: '#EA4335', label: 'Yüksek' },
  medium: { bg: 'rgba(251, 188, 5, 0.14)', border: 'rgba(251, 188, 5, 0.45)', text: '#B98900', label: 'Orta' },
  low: { bg: 'rgba(66, 133, 244, 0.12)', border: 'rgba(66, 133, 244, 0.35)', text: '#4285F4', label: 'Düşük' },
  Kritik: { bg: 'rgba(234, 67, 53, 0.12)', border: 'rgba(234, 67, 53, 0.4)', text: '#EA4335', label: 'Kritik' },
  Yüksek: { bg: 'rgba(251, 188, 5, 0.14)', border: 'rgba(251, 188, 5, 0.45)', text: '#B98900', label: 'Yüksek' },
  Orta: { bg: 'rgba(66, 133, 244, 0.12)', border: 'rgba(66, 133, 244, 0.35)', text: '#4285F4', label: 'Orta' },
  Düşük: { bg: 'rgba(120, 120, 120, 0.12)', border: 'var(--border-color)', text: 'var(--text-secondary)', label: 'Düşük' },
};

export function SourceTag({ source }) {
  const theme = SOURCE_COLORS[source] || SOURCE_COLORS.Beyin;
  return (
    <span
      title={source}
      aria-label={source}
      style={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: theme.text,
        border: `1px solid ${theme.border}`,
        boxShadow: `0 0 0 3px ${theme.bg}`,
        flexShrink: 0,
      }}
    />
  );
}

/** Etki / öncelik rozeti (yüksek=kırmızı, orta=turuncu, düşük=mavi). */
export function ImpactBadge({ value }) {
  if (!value) return null;
  const key = String(value).toLowerCase();
  const theme = IMPACT_COLORS[value] || IMPACT_COLORS[key] || IMPACT_COLORS.low;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.12rem 0.45rem',
        borderRadius: '999px',
        fontSize: '0.68rem',
        fontWeight: 700,
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.text,
        whiteSpace: 'nowrap',
      }}
    >
      {theme.label || value}
    </span>
  );
}

/**
 * Yeşil/kırmızı trend yazısı.
 * lowerIsBetter: pozisyon gibi metriklerde düşüş iyileşmedir.
 */
export function TrendText({ changePct, lowerIsBetter = false, absolute = null }) {
  if (changePct === null || changePct === undefined) {
    if (absolute === null || absolute === undefined || absolute === 0) return <span style={{ color: 'var(--text-secondary)' }}>—</span>;
    const improvedAbs = absolute > 0;
    return (
      <span style={{ fontWeight: 700, color: improvedAbs ? '#34A853' : '#EA4335' }}>
        {absolute > 0 ? '↑' : '↓'} {absolute > 0 ? '+' : ''}{nf.format(absolute)}
      </span>
    );
  }
  const improved = lowerIsBetter ? changePct < 0 : changePct > 0;
  const color = Math.abs(changePct) < 0.05 ? 'var(--text-secondary)' : improved ? '#34A853' : '#EA4335';
  return (
    <span style={{ fontWeight: 700, color }}>
      {changePct > 0 ? '↑' : changePct < 0 ? '↓' : '→'} {changePct >= 0 ? '+' : ''}{nf.format(Math.round(changePct * 10) / 10)}%
    </span>
  );
}

function NoteBlock({ text }) {
  if (!text) return null;
  const lines = String(text).split('\n');
  return (
    <div
      className="text-muted"
      style={{
        fontSize: '0.8rem',
        marginBottom: '0.95rem',
        lineHeight: 1.6,
        maxWidth: '1100px',
      }}
    >
      {lines.map((line, index) => {
        const trimmed = line.trimEnd();
        if (!trimmed) return <div key={index} style={{ height: '0.45rem' }} />;
        const eq = trimmed.indexOf(' = ');
        if (eq > 0) {
          const term = trimmed.slice(0, eq).trim();
          const desc = trimmed.slice(eq + 3).trim();
          return (
            <div key={index}>
              <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{term}</strong>
              <span style={{ fontWeight: 400 }}>{` = ${desc}`}</span>
            </div>
          );
        }
        return (
          <div key={index} style={{ fontWeight: 400 }}>{trimmed}</div>
        );
      })}
    </div>
  );
}

export function ReportSection({ no, title, sources = [], note, children, compact = false }) {
  const catalog = SECTION_NOTES[no];
  const resolvedNote = [note, catalog].filter(Boolean).join('\n\n') || null;
  return (
    <div className="card" data-pdf-break data-section-no={no} style={{ marginBottom: compact ? '1rem' : '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: resolvedNote ? '0.35rem' : '0.95rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.12rem 0.45rem',
          }}
        >
          {no}
        </span>
        <h2 className="heading-2" style={{ fontSize: '1.28rem', margin: 0, flex: 1, minWidth: '200px', letterSpacing: '-0.01em' }}>{title}</h2>
        {sources.map((source) => <SourceTag key={source} source={source} />)}
      </div>
      <NoteBlock text={resolvedNote} />
      {children}
    </div>
  );
}

function looksLikeUrl(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  if (/^https?:\/\//i.test(text)) return true;
  if (text.startsWith('/') && text.length > 1) return true;
  return /^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(text);
}

function hrefFor(value) {
  const text = String(value).trim();
  if (/^https?:\/\//i.test(text)) return text;
  if (text.startsWith('/')) return text;
  return `https://${text}`;
}

export function formatCell(value, type) {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE;
  switch (type) {
    case 'int':
      return nf.format(Math.round(Number(value) || 0));
    case 'float':
      return nf.format(Math.round((Number(value) || 0) * 100) / 100);
    case 'pct':
      return `%${nf.format(Math.round((Number(value) || 0) * 100) / 100)}`;
    case 'money':
      return `${nf.format(Math.round((Number(value) || 0) * 100) / 100)} ₺`;
    case 'delta': {
      const number = Number(value) || 0;
      return `${number > 0 ? '+' : ''}${nf.format(number)}`;
    }
    case 'date':
      return value instanceof Date ? value.toLocaleDateString('tr-TR') : String(value);
    case 'code':
      return trLabel(String(value));
    case 'url':
    case 'link': {
      const text = String(value);
      return (
        <a href={hrefFor(text)} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
          {trLabel(text)}
        </a>
      );
    }
    default: {
      const text = String(value);
      if (looksLikeUrl(text)) {
        return (
          <a href={hrefFor(text)} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            {trLabel(text)}
          </a>
        );
      }
      return trLabel(text);
    }
  }
}

/**
 * KPI şeridi — fotoğraftaki üst skor kartları.
 * items: [{ label, value, source, changePct?, lowerIsBetter?, hint?, sparkline? }]
 */
export function MetricGrid({ items, compact = false }) {
  const filled = (items || []).filter(Boolean);
  if (filled.length === 0) return null;
  // 10+ kartta min genişliği büyüt: satırda ~5–6 kart, alt satırda kalanlar da aynı boyutta kalır.
  const minCol = compact ? 160 : filled.length >= 10 ? 220 : 200;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCol}px, 1fr))`,
        gap: compact ? '0.75rem' : '0.85rem',
      }}
    >
      {filled.map((item) => {
        const empty = item.value === null || item.value === undefined || item.value === EMPTY_VALUE;
        return (
          <div
            key={`${item.source}-${item.label}`}
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: compact ? '0.75rem 0.85rem' : '0.95rem 1.05rem',
              background: 'var(--bg-secondary)',
              minHeight: compact ? undefined : '5.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: compact ? '0.72rem' : '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
              {item.source && <SourceTag source={item.source} />}
            </div>
            <div
              style={{
                fontSize: compact ? '1.1rem' : '1.45rem',
                fontWeight: 800,
                marginTop: '0.4rem',
                color: empty ? 'var(--text-secondary)' : undefined,
                opacity: empty ? 0.6 : 1,
                letterSpacing: '-0.02em',
              }}
            >
              {empty ? EMPTY_VALUE : item.value}
            </div>
            {(item.changePct !== null && item.changePct !== undefined) && (
              <div style={{ marginTop: '0.2rem', fontSize: '0.78rem' }}>
                <TrendText changePct={item.changePct} lowerIsBetter={item.lowerIsBetter} />
              </div>
            )}
            {item.hint && <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{item.hint}</div>}
            {item.footer}
          </div>
        );
      })}
    </div>
  );
}

/** Küçük vurgu kutusu — geri dönüş oranı, fırsat rozeti vb. */
export function StatCallout({ label, value, tone = 'neutral' }) {
  const colors = {
    good: { bg: 'rgba(52, 168, 83, 0.1)', border: 'rgba(52, 168, 83, 0.35)', text: '#34A853' },
    bad: { bg: 'rgba(234, 67, 53, 0.1)', border: 'rgba(234, 67, 53, 0.35)', text: '#EA4335' },
    neutral: { bg: 'rgba(66, 133, 244, 0.08)', border: 'rgba(66, 133, 244, 0.3)', text: '#4285F4' },
  };
  const theme = colors[tone] || colors.neutral;
  return (
    <div style={{ marginTop: '0.75rem', padding: '0.7rem 0.85rem', borderRadius: '10px', background: theme.bg, border: `1px solid ${theme.border}` }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: theme.text, marginTop: '0.15rem' }}>{value}</div>
    </div>
  );
}

/** PageSpeed cihaz kartı. */
export function ScoreCard({ title, score, rows }) {
  const number = score === null || score === undefined ? null : Number(score);
  const color = number === null ? 'var(--text-secondary)' : number >= 90 ? '#34A853' : number >= 50 ? '#FBBC05' : '#EA4335';
  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color, margin: '0.25rem 0 0.6rem', letterSpacing: '-0.03em' }}>
        {number === null ? EMPTY_VALUE : Math.round(number)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
        {(rows || []).map((row) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
            <strong>{row.value ?? EMPTY_VALUE}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubHeading({ children }) {
  return <h3 style={{ fontSize: '0.85rem', margin: '1rem 0 0.4rem', fontWeight: 700 }}>{children}</h3>;
}
