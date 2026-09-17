'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCell, ImpactBadge } from './general-report-ui';

const nf = new Intl.NumberFormat('tr-TR');
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 500, 1000];

function cellColor(value, colorize) {
  if (value === null || value === undefined || value === '') return undefined;
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) return 'var(--text-secondary)';
  if (colorize === 'up-good') return number > 0 ? '#34A853' : '#EA4335';
  if (colorize === 'down-good') return number < 0 ? '#34A853' : '#EA4335';
  return undefined;
}

/**
 * Sayfalı tablo. Tüm satırlar client'ta tutulur; pageSize ile dilimlenir.
 * data-report-table: "sadece grafikler" modunda gizlenir.
 */
export function DataTable({
  columns,
  rows,
  emptyNote = null,
  defaultPageSize = 50,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}) {
  const allRows = rows || [];
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [page, setPage] = useState(0);

  const total = allRows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(page, pageCount - 1);

  const items = useMemo(() => {
    const start = safePage * pageSize;
    return allRows.slice(start, start + pageSize);
  }, [allRows, safePage, pageSize]);

  if (total === 0) {
    return emptyNote ? <p className="text-muted" style={{ fontSize: '0.85rem' }}>{emptyNote}</p> : null;
  }

  const from = safePage * pageSize + 1;
  const to = Math.min(total, (safePage + 1) * pageSize);

  return (
    <div data-report-table style={{ marginTop: '0.35rem' }}>
      <div data-pdf-expand className="custom-scrollbar" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    textAlign: column.type && column.type !== 'text' && column.type !== 'date' && !column.badge ? 'right' : 'left',
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
              <tr key={safePage * pageSize + index}>
                {columns.map((column) => {
                  const raw = row[column.key];
                  const isNumeric = column.type && column.type !== 'text' && column.type !== 'date' && !column.badge;
                  const color = column.colorize ? cellColor(raw, column.colorize) : undefined;
                  return (
                    <td
                      key={column.key}
                      style={{
                        textAlign: isNumeric ? 'right' : 'left',
                        padding: '0.45rem 0.5rem',
                        borderBottom: '1px dashed var(--border-color)',
                        whiteSpace: isNumeric ? 'nowrap' : 'normal',
                        maxWidth: column.width || (isNumeric ? undefined : '560px'),
                        overflowWrap: 'anywhere',
                        fontWeight: color ? 700 : undefined,
                        color,
                      }}
                    >
                      {column.badge ? <ImpactBadge value={raw} /> : formatCell(raw, column.type)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        data-pdf-hide
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginTop: '0.65rem',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
        }}
      >
        <span>
          {nf.format(from)}–{nf.format(to)} / {nf.format(total)} kayıt
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            Sayfa boyutu
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(0);
              }}
              style={{
                padding: '0.25rem 0.4rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={safePage <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            style={pagerBtn}
            aria-label="Önceki sayfa"
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', minWidth: '4.5rem', textAlign: 'center' }}>
            {safePage + 1} / {pageCount}
          </span>
          <button
            type="button"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            style={pagerBtn}
            aria-label="Sonraki sayfa"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

const pagerBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '30px',
  height: '30px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
};
