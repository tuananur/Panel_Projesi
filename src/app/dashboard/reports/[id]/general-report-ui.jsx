// Genel rapor bölümlerinin ortak kabuğu: numaralı başlık, kaynak etiketi ve tablo.
import { EMPTY_VALUE } from '../report-ui';

const nf = new Intl.NumberFormat('tr-TR');

const SOURCE_COLORS = {
  GA4: { bg: 'rgba(66, 133, 244, 0.12)', border: 'rgba(66, 133, 244, 0.35)', text: '#4285F4' },
  'Search Console': { bg: 'rgba(52, 168, 83, 0.12)', border: 'rgba(52, 168, 83, 0.35)', text: '#34A853' },
  Ubersuggest: { bg: 'rgba(161, 66, 244, 0.12)', border: 'rgba(161, 66, 244, 0.35)', text: '#A142F4' },
  Beyin: { bg: 'rgba(251, 188, 5, 0.14)', border: 'rgba(251, 188, 5, 0.4)', text: '#B98900' },
};

export function SourceTag({ source }) {
  const theme = SOURCE_COLORS[source] || SOURCE_COLORS.Beyin;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.15rem 0.5rem',
        borderRadius: '999px',
        fontSize: '0.68rem',
        fontWeight: 700,
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.text,
        whiteSpace: 'nowrap',
      }}
    >
      {source}
    </span>
  );
}

/**
 * Numaralı rapor bölümü. `sources` metriğin nereden geldiğini gösterir;
 * aynı isimli metriklerin karışmaması için her bölümde zorunlu.
 */
export function ReportSection({ no, title, sources = [], note, children }) {
  return (
    // data-pdf-break: PDF sayfa kesmeleri bölüm başlarına hizalanır, kart ortadan kesilmez.
    <div className="card" data-pdf-break style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: note ? '0.3rem' : '0.85rem' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.1rem 0.4rem',
          }}
        >
          {no}
        </span>
        <h2 className="heading-2" style={{ fontSize: '1.05rem', margin: 0, flex: 1, minWidth: '200px' }}>{title}</h2>
        {sources.map((source) => <SourceTag key={source} source={source} />)}
      </div>
      {note && <p className="text-muted" style={{ fontSize: '0.78rem', marginBottom: '0.85rem' }}>{note}</p>}
      {children}
    </div>
  );
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
    default:
      return String(value);
  }
}

/**
 * Tablo. columns: [{ key, label, type, width }]
 * Satır yoksa hiç render edilmez; çağıran taraf bölümü gizler.
 */
export function DataTable({ columns, rows, limit = 25, totalCount = null, emptyNote = null }) {
  const items = (rows || []).slice(0, limit);
  if (items.length === 0) {
    return emptyNote ? <p className="text-muted" style={{ fontSize: '0.85rem' }}>{emptyNote}</p> : null;
  }

  const total = totalCount ?? (rows || []).length;

  return (
    <>
      {/* data-pdf-expand: PDF'e alınırken yatay kaydırma açılır, geniş tablolar kırpılmaz. */}
      <div data-pdf-expand className="custom-scrollbar" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    textAlign: column.type && column.type !== 'text' && column.type !== 'date' ? 'right' : 'left',
                    padding: '0.45rem 0.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.74rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => {
                  const isNumeric = column.type && column.type !== 'text' && column.type !== 'date';
                  return (
                    <td
                      key={column.key}
                      style={{
                        textAlign: isNumeric ? 'right' : 'left',
                        padding: '0.45rem 0.5rem',
                        borderBottom: '1px dashed var(--border-color)',
                        whiteSpace: isNumeric ? 'nowrap' : 'normal',
                        maxWidth: column.width || (isNumeric ? undefined : '320px'),
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {formatCell(row[column.key], column.type)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > items.length && (
        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
          Toplam {nf.format(total)} kayıttan ilk {nf.format(items.length)} tanesi gösteriliyor.
        </p>
      )}
    </>
  );
}

/** Etiket/değer ızgarası: özet metrikler için. Her metrik kaynağıyla birlikte gösterilir. */
export function MetricGrid({ items }) {
  const filled = (items || []).filter(Boolean);
  if (filled.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
      {filled.map((item) => {
        const empty = item.value === null || item.value === undefined || item.value === EMPTY_VALUE;
        return (
          <div
            key={`${item.source}-${item.label}`}
            style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.7rem 0.8rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{item.label}</span>
              <SourceTag source={item.source} />
            </div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                marginTop: '0.3rem',
                color: empty ? 'var(--text-secondary)' : undefined,
                opacity: empty ? 0.6 : 1,
              }}
            >
              {empty ? EMPTY_VALUE : item.value}
            </div>
            {item.hint && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{item.hint}</div>}
          </div>
        );
      })}
    </div>
  );
}
