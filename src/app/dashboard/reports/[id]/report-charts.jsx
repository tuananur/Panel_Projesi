'use client';

// Genel rapor grafikleri — client: hover ile değer gösterimi için.

import { useState } from 'react';
import { trLabel } from './report-labels';
import { SourceTag } from './general-report-ui';

export const PALETTE = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#A142F4', '#00ACC1', '#FF7043', '#9E9D24'];

const numberFmt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

function fmt(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return numberFmt.format(value);
}

function seriesPath(rows, seriesKey, x, y) {
  return rows.map((row, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(row[seriesKey])}`).join(' ');
}

function ChartTooltip({ hover, series, valueSuffix = '' }) {
  if (!hover) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: `clamp(8px, ${hover.ratio * 100}%, calc(100% - 180px))`,
        top: 8,
        zIndex: 5,
        pointerEvents: 'none',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.45rem 0.6rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        fontSize: '0.75rem',
        minWidth: '140px',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{hover.label}</div>
      {series.map((s, index) => (
        <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color || PALETTE[index % PALETTE.length] }} />
            {s.label}
          </span>
          <strong style={{ color: 'var(--text-primary)' }}>{fmt(hover.values[s.key])}{valueSuffix}</strong>
        </div>
      ))}
    </div>
  );
}

/** Çok serili çizgi grafik — hover'da nokta değerleri. */
export function LineChart({ data, series, height = 240, valueSuffix = '', showRange = true }) {
  const rows = (data || []).filter(Boolean);
  const [hover, setHover] = useState(null);
  if (rows.length < 2 || !series?.length) return null;

  const width = 100;
  const values = rows.flatMap((row) => series.map((s) => Number(row[s.key]) || 0));
  const max = Math.max(...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const x = (index) => (rows.length === 1 ? 0 : (index / (rows.length - 1)) * width);
  const y = (value) => height - 24 - ((Number(value) || 0) - min) / span * (height - 44);
  const labelStep = Math.ceil(rows.length / 8);

  const onMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const index = Math.round(ratio * (rows.length - 1));
    const row = rows[index];
    const pointValues = {};
    series.forEach((s) => { pointValues[s.key] = Number(row[s.key]) || 0; });
    setHover({ index, ratio, label: row.label || row.date || `#${index + 1}`, values: pointValues });
  };

  return (
    <div style={{ marginTop: '0.75rem' }} data-report-chart>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        {series.map((s, index) => (
          <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color || PALETTE[index % PALETTE.length] }} />
            {s.label}
          </span>
        ))}
      </div>
      <div style={{ position: 'relative' }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <ChartTooltip hover={hover} series={series} valueSuffix={valueSuffix} />
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: `${height}px`, overflow: 'visible', display: 'block' }}>
          {[0, 0.5, 1].map((ratio) => (
            <line key={ratio} x1="0" x2={width} y1={y(min + span * ratio)} y2={y(min + span * ratio)} stroke="var(--border-color)" strokeWidth="0.3" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
          ))}
          {series.map((s, seriesIndex) => (
            <path key={s.key} d={seriesPath(rows, s.key, x, y)} fill="none" stroke={s.color || PALETTE[seriesIndex % PALETTE.length]} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
          ))}
          {series.map((s, seriesIndex) => rows.map((row, index) => (
            <circle
              key={`pt-${s.key}-${index}`}
              cx={x(index)}
              cy={y(row[s.key])}
              r="1.1"
              fill={s.color || PALETTE[seriesIndex % PALETTE.length]}
            />
          )))}
          {hover && (
            <line x1={x(hover.index)} x2={x(hover.index)} y1={12} y2={height - 20} stroke="var(--text-secondary)" strokeWidth="0.4" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        {/* Günlük değer etiketleri — PDF'de de okunur (hover'a bağlı değil). */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {rows.map((row, index) => {
            const primary = series[0];
            const value = Number(row[primary.key]) || 0;
            const topPct = (y(value) / height) * 100;
            const leftPct = (x(index) / width) * 100;
            const step = rows.length > 45 ? 2 : 1;
            if (index % step !== 0 && index !== rows.length - 1) return null;
            return (
              <span
                key={`lbl-${index}`}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  top: `${Math.max(0, topPct - 4)}%`,
                  transform: 'translate(-50%, -100%)',
                  fontSize: rows.length > 31 ? '0.55rem' : '0.62rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  textShadow: '0 0 3px var(--bg-secondary)',
                }}
              >
                {fmt(value)}{valueSuffix}
              </span>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
        {rows.filter((_, index) => index % labelStep === 0 || index === rows.length - 1).map((row, index) => (
          <span key={`${row.label}-${index}`}>{row.label}</span>
        ))}
      </div>
      {showRange && (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          En yüksek: {fmt(max)}{valueSuffix} · En düşük: {fmt(Math.min(...values))}{valueSuffix}
        </div>
      )}
    </div>
  );
}

/** Tek serili alan (area) grafik — hover destekli. */
export function AreaChart({ data, valueKey = 'value', labelKey = 'label', color = '#34A853', height = 160 }) {
  const rows = (data || []).filter(Boolean);
  const [hover, setHover] = useState(null);
  if (rows.length < 2) return null;

  const width = 100;
  const values = rows.map((row) => Number(row[valueKey]) || 0);
  const max = Math.max(...values) || 1;
  const x = (index) => (index / (rows.length - 1)) * width;
  const y = (value) => height - 20 - (value / max) * (height - 36);
  const line = rows.map((row, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(Number(row[valueKey]) || 0)}`).join(' ');
  const area = `${line} L ${width} ${height - 20} L 0 ${height - 20} Z`;
  const labelStep = Math.ceil(rows.length / 6);
  const series = [{ key: valueKey, label: 'Değer', color }];

  const onMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const index = Math.round(ratio * (rows.length - 1));
    const row = rows[index];
    setHover({ index, ratio, label: row[labelKey], values: { [valueKey]: Number(row[valueKey]) || 0 } });
  };

  return (
    <div style={{ marginTop: '0.75rem' }} data-report-chart>
      <div style={{ position: 'relative' }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <ChartTooltip hover={hover} series={series} />
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: `${height}px`, display: 'block' }}>
          <path d={area} fill={color} opacity="0.18" />
          <path d={line} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
          {hover && (
            <>
              <line x1={x(hover.index)} x2={x(hover.index)} y1={8} y2={height - 20} stroke="var(--text-secondary)" strokeWidth="0.4" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
              <circle cx={x(hover.index)} cy={y(hover.values[valueKey])} r="1.5" fill={color} />
            </>
          )}
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
        {rows.filter((_, index) => index % labelStep === 0 || index === rows.length - 1).map((row, index) => (
          <span key={`${row[labelKey]}-${index}`}>{row[labelKey]}</span>
        ))}
      </div>
    </div>
  );
}

/** Mini sparkline — KPI kartı içi. */
export function Sparkline({ values = [], color = '#4285F4', width = 80, height = 28 }) {
  const nums = values.map(Number).filter((v) => Number.isFinite(v));
  if (nums.length < 2) return null;
  const max = Math.max(...nums);
  const min = Math.min(...nums);
  const span = max - min || 1;
  const x = (index) => (index / (nums.length - 1)) * width;
  const y = (value) => height - 2 - ((value - min) / span) * (height - 4);
  const d = nums.map((value, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(value)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

/** Yatay bar listesi. */
export function BarList({ rows, valueKey = 'value', labelKey = 'label', suffix = '', limit = 12, secondary = null, color = null }) {
  const items = (rows || []).slice(0, limit);
  if (items.length === 0) return null;
  const max = Math.max(...items.map((row) => Number(row[valueKey]) || 0)) || 1;

  return (
    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
      {items.map((row, index) => {
        const value = Number(row[valueKey]) || 0;
        const barColor = color || row.color || PALETTE[index % PALETTE.length];
        return (
          <div key={`${row[labelKey]}-${index}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem', gap: '1rem' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trLabel(row[labelKey])}</span>
              <span style={{ fontWeight: 600, flexShrink: 0 }}>
                {fmt(value)}{suffix}
                {secondary && row[secondary] !== null && row[secondary] !== undefined && (
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}> · {fmt(row[secondary])}</span>
                )}
              </span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: 'var(--border-color)', overflow: 'hidden' }}>
              <div style={{ width: `${(value / max) * 100}%`, height: '100%', borderRadius: '4px', background: barColor }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Rank tracking tarzı sabit hedefli progress barlar.
 * items: [{ label, value, max?, changePct?, color? }]
 */
export function RankProgressBars({ items }) {
  const rows = (items || []).filter((row) => row.value !== null && row.value !== undefined);
  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((row) => Number(row.max ?? row.value) || 0), 1);

  return (
    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {rows.map((row) => {
        const value = Number(row.value) || 0;
        const barMax = Number(row.max) || max;
        const pct = Math.min(100, (value / barMax) * 100);
        const improved = row.changePct === null || row.changePct === undefined ? null : row.changePct >= 0;
        return (
          <div key={row.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 600 }}>{row.label}</span>
              <span style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <strong>{fmt(value)}</strong>
                {row.changePct !== null && row.changePct !== undefined && (
                  <span style={{ fontWeight: 700, color: improved ? '#34A853' : '#EA4335', fontSize: '0.75rem' }}>
                    {row.changePct >= 0 ? '↑' : '↓'} {Math.abs(row.changePct).toFixed(0)}%
                  </span>
                )}
              </span>
            </div>
            <div style={{ height: '10px', borderRadius: '999px', background: 'var(--border-color)', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: '999px', background: row.color || '#4285F4' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Donut; centerLabel/centerValue ile ortada toplam gösterilebilir. */
export function DonutChart({ rows, valueKey = 'value', labelKey = 'label', size = 220, centerLabel = null, centerValue = null }) {
  const items = (rows || []).filter((row) => (Number(row[valueKey]) || 0) > 0);
  if (items.length === 0) return null;

  const total = items.reduce((acc, row) => acc + Number(row[valueKey]), 0);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const slices = [];
  items.reduce((start, row) => {
    const length = (Number(row[valueKey]) / total) * circumference;
    slices.push({ length, start });
    return start + length;
  }, 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 160 160">
          <g transform="rotate(-90 80 80)">
            {items.map((row, index) => {
              const { length, start } = slices[index];
              return (
                <circle
                  key={`${row[labelKey]}-${index}`}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={row.color || PALETTE[index % PALETTE.length]}
                  strokeWidth="24"
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-start}
                />
              );
            })}
          </g>
        </svg>
        {(centerLabel || centerValue !== null) && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            {centerValue !== null && <strong style={{ fontSize: '1.05rem' }}>{typeof centerValue === 'number' ? fmt(centerValue) : centerValue}</strong>}
            {centerLabel && <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{centerLabel}</span>}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '160px' }}>
        {items.map((row, index) => (
          <span key={`${row[labelKey]}-legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: row.color || PALETTE[index % PALETTE.length], flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{trLabel(row[labelKey])}</span>
            <strong>{fmt(Number(row[valueKey]))}</strong>
            <span style={{ color: 'var(--text-secondary)' }}>%{((Number(row[valueKey]) / total) * 100).toFixed(1)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Site health tarzı radial gauge (0-100). */
export function GaugeChart({ value, max = 100, label = 'Skor', size = 150, legend = null }) {
  if (value === null || value === undefined) return null;
  const score = Math.max(0, Math.min(max, Number(value)));
  const ratio = score / max;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const length = ratio * circumference * 0.75; // 270° yay
  const color = ratio >= 0.8 ? '#34A853' : ratio >= 0.6 ? '#FBBC05' : '#EA4335';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 160 160">
          <g transform="rotate(135 80 80)">
            <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="12" strokeDasharray={`${circumference * 0.75} ${circumference}`} strokeLinecap="round" />
            <circle cx="80" cy="80" r={radius} fill="none" stroke={color} strokeWidth="12" strokeDasharray={`${length} ${circumference}`} strokeLinecap="round" />
          </g>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <strong style={{ fontSize: '1.6rem', lineHeight: 1 }}>{Math.round(score)}</strong>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{label}</span>
        </div>
      </div>
      {legend && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
          {legend.map((item) => (
            <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
              <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{item.label}</span>
              <strong>{fmt(item.value)}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Değişim kartları — dönem karşılaştırması. */
export function ChangeCards({ rows }) {
  const items = (rows || []).filter((row) => row.current !== null && row.current !== undefined);
  if (items.length === 0) return null;

  const formatValue = (value, unit) => {
    if (value === null || value === undefined) return '—';
    if (unit === 'pct') return `%${numberFmt.format(value)}`;
    if (unit === 'position') return numberFmt.format(value);
    return numberFmt.format(Math.round(value));
  };

  return (
    <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem' }}>
      {items.map((row) => {
        const improved = row.changePct === null ? null : row.lowerIsBetter ? row.changePct < 0 : row.changePct > 0;
        const color = improved === null ? 'var(--text-secondary)' : improved ? '#34A853' : '#EA4335';
        return (
          <div key={`${row.source}-${row.label}`} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.75rem 0.85rem' }}>
            <div style={{ marginTop: '0.1rem' }}><SourceTag source={row.source} /></div>
            <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>{row.label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.35rem' }}>{formatValue(row.current, row.unit)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Önceki: {formatValue(row.previous, row.unit)}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color, marginTop: '0.25rem' }}>
              {row.changePct === null ? '—' : `${improved ? '↑' : '↓'} ${row.changePct >= 0 ? '+' : ''}${numberFmt.format(row.changePct)}%`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Gün/saat heat strip. */
export function HeatStrip({ rows, labelKey = 'label', valueKey = 'sessions' }) {
  const items = rows || [];
  if (items.length === 0) return null;
  const max = Math.max(...items.map((row) => Number(row[valueKey]) || 0)) || 1;

  return (
    <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 12)}, minmax(0, 1fr))`, gap: '0.3rem' }}>
      {items.map((row, index) => {
        const value = Number(row[valueKey]) || 0;
        const intensity = value / max;
        return (
          <div
            key={`${row[labelKey]}-${index}`}
            style={{
              borderRadius: '6px',
              padding: '0.5rem 0.25rem',
              textAlign: 'center',
              background: `rgba(66, 133, 244, ${0.12 + intensity * 0.78})`,
              color: intensity > 0.55 ? '#fff' : 'var(--text-primary)',
            }}
          >
            <div style={{ fontSize: '0.66rem', opacity: 0.85 }}>{row[labelKey]}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{fmt(value)}</div>
          </div>
        );
      })}
    </div>
  );
}

/** Yan yana iki kolon — kazanan/kaybeden için. */
export function TwoCol({ left, right }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}
