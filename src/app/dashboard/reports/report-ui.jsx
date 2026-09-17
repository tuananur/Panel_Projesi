// Rapor ekranlarının paylaşılan görsel parçaları. Sunucu tarafında render edilir.
import { Check, X } from 'lucide-react';

const nf = new Intl.NumberFormat('tr-TR');

export const EMPTY_VALUE = 'Veri yok';

export function num(value) {
  if (value === null || value === undefined) return EMPTY_VALUE;
  return nf.format(Math.round(Number(value) || 0));
}

export function pct(value) {
  if (value === null || value === undefined) return EMPTY_VALUE;
  return `${nf.format(Math.round((Number(value) || 0) * 100) / 100)}%`;
}

export function duration(seconds) {
  if (seconds === null || seconds === undefined) return EMPTY_VALUE;
  const secs = Math.round(Number(seconds) || 0);
  if (secs < 60) return `0dk ${secs}sn`;
  return `${Math.floor(secs / 60)}dk ${secs % 60}sn`;
}

/** Dolu parçaları birleştirir; hepsi boşsa "Veri yok" döner. */
export function parts(values) {
  const filled = values.filter((value) => value !== null && value !== undefined && value !== '');
  return filled.length > 0 ? filled.join(' · ') : EMPTY_VALUE;
}

export function Row({ label, value }) {
  const empty = value === EMPTY_VALUE || value === null || value === undefined || value === '';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '0.5rem 0',
        borderBottom: '1px dashed var(--border-color)',
        fontSize: '0.9rem',
      }}
    >
      <span className="text-muted" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      <span
        style={{
          fontWeight: empty ? 500 : 700,
          whiteSpace: 'nowrap',
          color: empty ? 'var(--text-secondary)' : undefined,
          opacity: empty ? 0.6 : 1,
        }}
      >
        {empty ? EMPTY_VALUE : value}
      </span>
    </div>
  );
}

export function Section({ title, note, children }) {
  return (
    // data-pdf-break: PDF sayfa kesmeleri bölüm başlarına hizalanır.
    <div className="card" data-pdf-break style={{ marginBottom: '1.5rem' }}>
      <h2 className="heading-2" style={{ fontSize: '1.1rem', marginBottom: note ? '0.25rem' : '1rem' }}>{title}</h2>
      {note && <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>{note}</p>}
      {children}
    </div>
  );
}

/** Veri yoksa sahte satır basmak yerine bölümü açık şekilde boş gösterir. */
export function ListSection({ title, note, items, render }) {
  return (
    <Section title={title} note={note}>
      {items?.length > 0
        ? items.map(render)
        : <p className="text-muted" style={{ fontSize: '0.85rem' }}>{EMPTY_VALUE}</p>}
    </Section>
  );
}

export function StatusBadge({ label, connected }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.3rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        border: `1px solid ${connected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
        background: connected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.1)',
        color: connected ? '#10B981' : '#ef4444',
        whiteSpace: 'nowrap',
      }}
    >
      {connected ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
      {label}
    </span>
  );
}

export function ErrorNote({ children }) {
  return <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}>{children}</p>;
}
