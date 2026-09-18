'use client';

import { cloneElement, useMemo, useState } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import TurkeyMap from 'turkey-map-react';
import * as SimpleIcons from 'simple-icons';
import { DonutChart, BarList, PALETTE } from './report-charts';
import { trLabel } from './report-labels';

const nf = new Intl.NumberFormat('tr-TR');

function normalizeTr(value) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ı/g, 'i')
    .trim();
}

/** Sol: bar listesi, sağ: büyük donut — kart 4 tipi layout. */
export function SplitBarDonut({
  barRows,
  donutRows,
  barSecondary = 'users',
  donutCenterLabel = 'Oturum',
  donutCenterValue = null,
  barLimit = 10,
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)',
        gap: '1.25rem',
        alignItems: 'start',
        marginTop: '0.5rem',
      }}
      className="report-split-layout"
    >
      <div>
        <BarList rows={barRows} secondary={barSecondary} limit={barLimit} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <DonutChart
          rows={donutRows}
          size={240}
          centerLabel={donutCenterLabel}
          centerValue={donutCenterValue}
        />
      </div>
      <style>{`
        @media (max-width: 900px) {
          .report-split-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const DEVICE_META = {
  mobile: { label: 'Mobil', Icon: Smartphone, color: '#4285F4' },
  desktop: { label: 'Masaüstü', Icon: Monitor, color: '#34A853' },
  tablet: { label: 'Tablet', Icon: Tablet, color: '#FBBC05' },
};

function deviceKey(name) {
  const n = normalizeTr(name);
  if (n.includes('mobil') || n.includes('mobile')) return 'mobile';
  if (n.includes('masa') || n.includes('desk')) return 'desktop';
  if (n.includes('tablet')) return 'tablet';
  return null;
}

/** Cihaz dağılımı: üst 3 podium + alt tablo alanı. */
export function DevicePodium({ devices = [] }) {
  const ranked = [...devices]
    .map((row) => ({ ...row, key: deviceKey(row.name || row.label) }))
    .filter((row) => row.key)
    .sort((a, b) => (b.activeUsers || b.sessions || 0) - (a.activeUsers || a.sessions || 0))
    .slice(0, 3);

  if (ranked.length === 0) return null;
  const max = Math.max(...ranked.map((row) => row.activeUsers || row.sessions || 0), 1);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(3, ranked.length)}, minmax(0, 1fr))`,
        gap: '0.85rem',
        margin: '0.75rem 0 1rem',
      }}
    >
      {ranked.map((row, index) => {
        const meta = DEVICE_META[row.key];
        const Icon = meta.Icon;
        const value = row.activeUsers || row.sessions || 0;
        return (
          <div
            key={row.key}
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1rem',
              background: `linear-gradient(180deg, ${meta.color}14 0%, transparent 70%)`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
              #{index + 1}
            </div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '14px',
                margin: '0 auto 0.65rem',
                display: 'grid',
                placeItems: 'center',
                background: `${meta.color}22`,
                color: meta.color,
              }}
            >
              <Icon size={28} />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{meta.label}</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
              {nf.format(value)}
            </div>
            <div style={{ height: 6, borderRadius: 999, background: 'var(--border-color)', marginTop: '0.7rem', overflow: 'hidden' }}>
              <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: meta.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Yeni / geri dönen: iki hero kart + donut. */
export function VisitorSplit({ rows = [], total = 0, returningRate = null }) {
  const items = rows.map((row) => ({
    ...row,
    label: row.label || trLabel(row.type),
  }));
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 0.85fr)',
        gap: '1rem',
        alignItems: 'center',
      }}
      className="report-split-layout"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {items.slice(0, 2).map((row, index) => {
          const value = row.activeUsers || 0;
          const share = total > 0 ? (value / total) * 100 : 0;
          const color = PALETTE[index % PALETTE.length];
          return (
            <div key={row.label} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{row.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.25rem' }}>{nf.format(value)}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color }}>%{share.toFixed(1)}</div>
            </div>
          );
        })}
        {returningRate !== null && (
          <div style={{ gridColumn: '1 / -1', borderRadius: '10px', padding: '0.75rem 0.9rem', background: 'rgba(66,133,244,0.08)', border: '1px solid rgba(66,133,244,0.25)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Tekrar gelme oranı</span>
            <strong style={{ display: 'block', fontSize: '1.1rem' }}>%{nf.format(Math.round(returningRate * 10) / 10)}</strong>
          </div>
        )}
      </div>
      <DonutChart
        rows={items.map((row) => ({ label: row.label, value: row.activeUsers }))}
        size={230}
        centerLabel="Kullanıcı"
        centerValue={total}
      />
    </div>
  );
}

const BROWSER_ICONS = {
  chrome: SimpleIcons.siGooglechrome,
  'google chrome': SimpleIcons.siGooglechrome,
  safari: SimpleIcons.siSafari,
  firefox: SimpleIcons.siFirefoxbrowser || SimpleIcons.siFirefox,
  edge: null,
  'microsoft edge': null,
  opera: SimpleIcons.siOpera,
  samsung: SimpleIcons.siSamsung,
  'samsung internet': SimpleIcons.siSamsung,
  brave: SimpleIcons.siBrave,
};

function browserIcon(name) {
  const key = normalizeTr(name);
  for (const [token, icon] of Object.entries(BROWSER_ICONS)) {
    if (icon && key.includes(token)) return icon;
  }
  return null;
}

/** Tarayıcı bar + resmi Simple Icons logoları. */
export function BrowserBars({ rows = [], limit = 8 }) {
  const items = rows.slice(0, limit);
  const max = Math.max(...items.map((row) => Number(row.value ?? row.sessions) || 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
      {items.map((row, index) => {
        const label = row.label || row.name;
        const value = Number(row.value ?? row.sessions) || 0;
        const icon = browserIcon(label);
        const color = icon ? `#${icon.hex}` : PALETTE[index % PALETTE.length];
        return (
          <div key={`${label}-${index}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}>
                {icon ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
                    <path d={icon.path} fill={color} />
                  </svg>
                ) : (
                  <span style={{ width: 16, height: 16, borderRadius: 4, background: color, display: 'inline-block' }} />
                )}
                {trLabel(label)}
              </span>
              <strong>{nf.format(value)}</strong>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--border-color)', overflow: 'hidden' }}>
              <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Türkiye haritası (turkey-map-react gerçek SVG) + sol liste. */
export function CityTurkeyPanel({ cities = [] }) {
  const sorted = useMemo(
    () => [...cities].sort((a, b) => (b.sessions || b.activeUsers || 0) - (a.sessions || a.activeUsers || 0)),
    [cities],
  );
  const byName = useMemo(() => {
    const map = new Map();
    sorted.forEach((row) => map.set(normalizeTr(row.city), row));
    return map;
  }, [sorted]);
  const max = Math.max(...sorted.map((row) => row.sessions || row.activeUsers || 0), 1);
  const top5 = sorted.slice(0, 5);
  const [hover, setHover] = useState(null);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(240px, 0.85fr) minmax(0, 1.15fr)',
        gap: '1rem',
        alignItems: 'start',
      }}
      className="report-split-layout"
    >
      <div>
        {sorted.slice(0, 12).map((row, index) => (
          <div
            key={`${row.city}-${index}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.45rem 0.35rem',
              borderBottom: '1px solid var(--border-color)',
              background: index % 2 ? 'rgba(15,23,42,0.03)' : 'transparent',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ fontWeight: index < 5 ? 700 : 500 }}>{index + 1}. {row.city}</span>
            <strong>{nf.format(row.sessions || row.activeUsers || 0)}</strong>
          </div>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
          {top5.map((row) => (
            <span
              key={`top-${row.city}`}
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.45rem',
                borderRadius: '999px',
                background: 'rgba(66,133,244,0.12)',
                color: '#1d4ed8',
                border: '1px solid rgba(66,133,244,0.3)',
              }}
            >
              {row.city}: {nf.format(row.sessions || row.activeUsers || 0)}
            </span>
          ))}
        </div>
        <TurkeyMap
          hoverable
          showTooltip
          customStyle={{ idleColor: '#e8eef7', hoverColor: '#60a5fa' }}
          onHover={(city) => {
            const row = byName.get(normalizeTr(city.name));
            setHover({ name: city.name, value: row ? (row.sessions || row.activeUsers || 0) : null });
          }}
          cityWrapper={(cityComponent, city) => {
            const row = byName.get(normalizeTr(city.name));
            const value = row ? (row.sessions || row.activeUsers || 0) : 0;
            const fill = value > 0
              ? `rgba(66, 133, 244, ${0.2 + (value / max) * 0.8})`
              : '#eef2f7';
            return cloneElement(cityComponent, {
              key: city.id,
              style: { ...(cityComponent.props?.style || {}), fill },
            });
          }}
        />
        {hover && (
          <div
            style={{
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            <strong style={{ color: 'var(--text-primary)' }}>{hover.name}</strong>
            {hover.value !== null ? ` · ${nf.format(hover.value)} oturum` : ' · bu dönemde ölçüm yok'}
          </div>
        )}
      </div>
    </div>
  );
}

const DAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

/** Gün × saat ısı haritası (anlaşılır grid). */
export function DayHourHeatmap({ days = [], hours = [] }) {
  const dayMax = Math.max(...days.map((row) => Number(row.sessions) || 0), 1);
  const hourMax = Math.max(...hours.map((row) => Number(row.sessions) || 0), 1);

  return (
    <div style={{ display: 'grid', gap: '1rem', marginTop: '0.5rem' }}>
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.45rem' }}>Haftanın günleri</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '0.35rem' }}>
          {(days.length ? days : DAY_LABELS.map((label, day) => ({ label, day, sessions: 0 }))).map((row, index) => {
            const value = Number(row.sessions) || 0;
            const intensity = value / dayMax;
            const label = row.label || DAY_LABELS[row.day] || DAY_LABELS[index];
            return (
              <div
                key={`d-${index}`}
                style={{
                  borderRadius: '10px',
                  padding: '0.7rem 0.35rem',
                  textAlign: 'center',
                  background: `rgba(66, 133, 244, ${0.1 + intensity * 0.85})`,
                  color: intensity > 0.55 ? '#fff' : 'var(--text-primary)',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '0.2rem' }}>{nf.format(value)}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.45rem' }}>Saat dilimleri</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '0.25rem' }}>
          {hours.map((row, index) => {
            const value = Number(row.sessions) || 0;
            const intensity = value / hourMax;
            const label = row.label ?? `${String(row.hour ?? index).padStart(2, '0')}`;
            return (
              <div
                key={`h-${index}`}
                title={`${label}: ${nf.format(value)}`}
                style={{
                  borderRadius: '6px',
                  padding: '0.4rem 0.15rem',
                  textAlign: 'center',
                  background: `rgba(52, 168, 83, ${0.08 + intensity * 0.85})`,
                  color: intensity > 0.55 ? '#fff' : 'var(--text-primary)',
                  fontSize: '0.62rem',
                }}
              >
                <div style={{ opacity: 0.85 }}>{label}</div>
                <div style={{ fontWeight: 800, fontSize: '0.72rem' }}>{value > 0 ? nf.format(value) : '—'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
