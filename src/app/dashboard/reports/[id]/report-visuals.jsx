'use client';

import { cloneElement, useMemo, useState } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import TurkeyMap from 'turkey-map-react';
import WorldMap from 'react-svg-worldmap';
import * as SimpleIcons from 'simple-icons';
import { DonutChart, BarList, PALETTE } from './report-charts';
import { trLabel } from './report-labels';
import { alpha3ToAlpha2 } from '@/lib/country-codes';

const nf = new Intl.NumberFormat('tr-TR');

/** SVG path yaklaşık merkez noktası — şehir adı etiketi için. */
function pathCentroid(path) {
  if (!path) return null;
  const nums = [...String(path).matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  if (nums.length < 4) return null;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = nums[i];
    const y = nums[i + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

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

/** Tarayıcı: sol bar + sağ pie (trafik kaynakları layout'u). */
export function BrowserSplit({ rows = [], limit = 10 }) {
  const items = rows.slice(0, limit).map((row) => ({
    label: row.label || row.name,
    value: Number(row.value ?? row.sessions) || 0,
    users: row.users ?? row.activeUsers,
  }));
  const total = items.reduce((sum, row) => sum + row.value, 0);
  return (
    <SplitBarDonut
      barRows={items}
      donutRows={items}
      barSecondary="users"
      donutCenterLabel="Oturum"
      donutCenterValue={total}
      barLimit={limit}
    />
  );
}

/** Ülke dünya haritası — GA oturum / kullanıcı yoğunluğu. */
export function CountryWorldPanel({ countries = [] }) {
  const mapData = useMemo(() => {
    return (countries || [])
      .map((row) => {
        const raw = row.countryCode || '';
        const alpha2 = raw.length === 3 ? alpha3ToAlpha2(raw) : String(raw).toUpperCase();
        if (!alpha2 || alpha2.length !== 2) return null;
        const value = Number(row.sessions || row.activeUsers || row.clicks || 0) || 0;
        if (value <= 0) return null;
        return { country: alpha2.toLowerCase(), value };
      })
      .filter(Boolean);
  }, [countries]);

  if (mapData.length === 0) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0 1rem', overflow: 'hidden' }}>
      <WorldMap
        color="#4285F4"
        valueSuffix=" oturum"
        size="xl"
        data={mapData}
        backgroundColor="transparent"
        borderColor="#cbd5e1"
        richInteraction
      />
    </div>
  );
}

/** Türkiye haritası — şehir adları harita üzerinde; üstteki top-5 chip yok. */
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
  const [hover, setHover] = useState(null);
  const labeledCities = useMemo(() => {
    // Yoğun şehirlerde etiket; çok kalabalık olmasın diye ilk 18 + değeri olanlar.
    return sorted.slice(0, 18);
  }, [sorted]);
  const labeledSet = useMemo(
    () => new Set(labeledCities.map((row) => normalizeTr(row.city))),
    [labeledCities],
  );

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
            const centroid = pathCentroid(city.path);
            const showLabel = labeledSet.has(normalizeTr(city.name)) && centroid;
            return (
              <g key={city.id}>
                {cloneElement(cityComponent, {
                  style: { ...(cityComponent.props?.style || {}), fill },
                })}
                {showLabel && (
                  <text
                    x={centroid.x}
                    y={centroid.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      fill: '#0f172a',
                      pointerEvents: 'none',
                      paintOrder: 'stroke',
                      stroke: 'rgba(255,255,255,0.85)',
                      strokeWidth: 2.5,
                    }}
                  >
                    {city.name}
                  </text>
                )}
              </g>
            );
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

/** Gün × saat kesişim ısı tablosu (yeşil yoğunluk). */
export function DayHourHeatmap({ days = [], hours = [], cells = null }) {
  const matrix = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    if (Array.isArray(cells) && cells.length > 0) {
      cells.forEach((row) => {
        const day = Number(row.day);
        const hour = Number(row.hour);
        if (day >= 0 && day <= 6 && hour >= 0 && hour <= 23) {
          grid[day][hour] = Number(row.sessions) || 0;
        }
      });
      return grid;
    }
    // Kesişim yoksa gün ve saat toplamlarından yaklaşık matris üret (görsel boş kalmasın).
    const dayVals = Array.from({ length: 7 }, (_, day) => {
      const found = days.find((row) => Number(row.day) === day);
      return Number(found?.sessions) || 0;
    });
    const hourVals = Array.from({ length: 24 }, (_, hour) => {
      const found = hours.find((row) => Number(row.hour) === hour);
      return Number(found?.sessions) || 0;
    });
    const daySum = dayVals.reduce((a, b) => a + b, 0) || 1;
    const hourSum = hourVals.reduce((a, b) => a + b, 0) || 1;
    for (let d = 0; d < 7; d += 1) {
      for (let h = 0; h < 24; h += 1) {
        grid[d][h] = Math.round((dayVals[d] / daySum) * (hourVals[h] / hourSum) * daySum);
      }
    }
    return grid;
  }, [cells, days, hours]);

  const max = Math.max(...matrix.flat(), 1);

  return (
    <div style={{ marginTop: '0.5rem', overflowX: 'auto' }} data-pdf-expand className="custom-scrollbar">
      <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', fontSize: '0.62rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.35rem', color: 'var(--text-secondary)', position: 'sticky', left: 0, background: 'var(--bg-secondary)' }}>Gün \\ Saat</th>
            {Array.from({ length: 24 }, (_, hour) => (
              <th key={hour} style={{ textAlign: 'center', padding: '0.25rem 0.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {String(hour).padStart(2, '0')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAY_LABELS.map((label, day) => (
            <tr key={label}>
              <td style={{ padding: '0.3rem 0.4rem', fontWeight: 700, position: 'sticky', left: 0, background: 'var(--bg-secondary)', whiteSpace: 'nowrap' }}>{label}</td>
              {matrix[day].map((value, hour) => {
                const intensity = value / max;
                return (
                  <td
                    key={`${day}-${hour}`}
                    title={`${label} ${String(hour).padStart(2, '0')}:00 — ${nf.format(value)}`}
                    style={{
                      textAlign: 'center',
                      padding: '0.28rem 0.08rem',
                      background: `rgba(52, 168, 83, ${0.06 + intensity * 0.9})`,
                      color: intensity > 0.55 ? '#fff' : 'var(--text-primary)',
                      fontWeight: value > 0 ? 700 : 400,
                      border: '1px solid rgba(255,255,255,0.35)',
                    }}
                  >
                    {value > 0 ? nf.format(value) : '·'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
