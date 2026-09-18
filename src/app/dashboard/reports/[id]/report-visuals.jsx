'use client';

import { cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import TurkeyMap from 'turkey-map-react';
import WorldMap, { regions as WORLD_REGIONS } from 'react-svg-worldmap';
import * as SimpleIcons from 'simple-icons';
import { DonutChart, BarList, PALETTE } from './report-charts';
import { trLabel } from './report-labels';
import { alpha3ToAlpha2 } from '@/lib/country-codes';

const nf = new Intl.NumberFormat('tr-TR');

const WORLD_NAME_BY_CODE = Object.fromEntries(
  (WORLD_REGIONS || []).map((row) => [String(row.code).toLowerCase(), row.name]),
);

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

/** Ülke dünya haritası — container genişliğinde; etiketler path bbox merkezinde. */
export function CountryWorldPanel({ countries = [] }) {
  const wrapRef = useRef(null);
  const [mapWidth, setMapWidth] = useState(960);
  const [labels, setLabels] = useState([]);

  const sorted = useMemo(() => {
    return (countries || [])
      .map((row) => {
        const raw = row.countryCode || '';
        const alpha2 = raw.length === 3 ? alpha3ToAlpha2(raw) : String(raw).toUpperCase();
        if (!alpha2 || alpha2.length !== 2) return null;
        const value = Number(row.sessions || row.activeUsers || row.clicks || 0) || 0;
        if (value <= 0) return null;
        const code = alpha2.toLowerCase();
        return {
          country: code,
          value,
          name: row.country || row.countryName || alpha2,
          enName: WORLD_NAME_BY_CODE[code] || alpha2.toUpperCase(),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.value - a.value);
  }, [countries]);

  const mapData = useMemo(
    () => sorted.map(({ country, value }) => ({ country, value })),
    [sorted],
  );

  const top10 = useMemo(() => sorted.slice(0, 10), [sorted]);
  const max = Math.max(...sorted.map((row) => row.value), 1);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;
    const apply = () => {
      const width = Math.floor(node.getBoundingClientRect().width);
      if (width > 0) setMapWidth(Math.max(640, width));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node || top10.length === 0) {
      setLabels([]);
      return undefined;
    }

    const place = () => {
      const svg = node.querySelector('svg');
      if (!svg) return;
      const wrapRect = node.getBoundingClientRect();
      const paths = [...svg.querySelectorAll('path')];
      const next = [];

      top10.forEach((row) => {
        const path = paths.find((el) => {
          const title = el.querySelector('title')?.textContent || '';
          const hay = title.toLowerCase();
          const en = row.enName.toLowerCase();
          return hay === en || hay.startsWith(`${en}:`) || hay.startsWith(`${en} `) || hay.includes(en);
        });
        if (!path) return;
        const box = path.getBoundingClientRect();
        if (box.width < 2 && box.height < 2) return;
        next.push({
          key: row.country,
          name: row.name,
          value: row.value,
          left: box.left - wrapRect.left + box.width / 2,
          top: box.top - wrapRect.top + box.height / 2,
        });
      });
      setLabels(next);
    };

    const timer = window.setTimeout(place, 80);
    window.addEventListener('resize', place);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', place);
    };
  }, [top10, mapWidth, mapData]);

  if (mapData.length === 0) return null;

  return (
    <div style={{ width: '100%', margin: '0.35rem 0 1rem' }}>
      <style>{`
        .report-worldmap-wrap .worldmap__wrapper { width: 100% !important; max-width: 100% !important; }
        .report-worldmap-wrap .worldmap__figure-container {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          display: flex !important;
          justify-content: center !important;
        }
        .report-worldmap-wrap svg {
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
        }
        .report-worldmap-wrap path.worldmap__region--hover {
          fill: #3b82f6 !important;
          stroke: #1d4ed8 !important;
          stroke-width: 1.5px;
          stroke-opacity: 1 !important;
        }
      `}</style>
      <div ref={wrapRef} className="report-worldmap-wrap" style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
        <WorldMap
          color="#4285F4"
          valueSuffix=" oturum"
          size={mapWidth}
          data={mapData}
          backgroundColor="transparent"
          borderColor="#cbd5e1"
          richInteraction
          tooltipBgColor="#0f172a"
          tooltipTextColor="#fff"
          styleFunction={({ countryValue, minValue, maxValue }) => {
            if (countryValue === undefined) {
              return { fill: '#eef2f7', stroke: '#cbd5e1', strokeWidth: 0.5, cursor: 'pointer' };
            }
            const span = (maxValue - minValue) || 1;
            const intensity = 0.22 + ((Number(countryValue) - minValue) / span) * 0.78;
            return {
              fill: `rgba(66, 133, 244, ${intensity})`,
              stroke: '#94a3b8',
              strokeWidth: 0.6,
              cursor: 'pointer',
            };
          }}
          tooltipTextFunction={({ countryName, countryValue }) => (
            countryValue === undefined
              ? countryName
              : `${countryName}: ${nf.format(Number(countryValue) || 0)} oturum`
          )}
        />
        {labels.map((item) => (
          <div
            key={item.key}
            style={{
              position: 'absolute',
              left: item.left,
              top: item.top,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              textAlign: 'center',
              lineHeight: 1.15,
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: mapWidth > 900 ? '0.72rem' : '0.62rem',
                fontWeight: 800,
                color: '#0f172a',
                textShadow: '0 0 4px #fff, 0 0 4px #fff, 0 0 6px #fff',
                whiteSpace: 'nowrap',
              }}
            >
              {item.name}
            </div>
            <div
              style={{
                fontSize: mapWidth > 900 ? '0.68rem' : '0.58rem',
                fontWeight: 700,
                color: '#1d4ed8',
                textShadow: '0 0 4px #fff, 0 0 4px #fff',
                whiteSpace: 'nowrap',
              }}
            >
              {nf.format(item.value)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
        İlk 10 ülke haritada etiketli · diğerleri üzerine gelince görünür · en yüksek {nf.format(max)} oturum
      </div>
    </div>
  );
}

/** Türkiye haritası — şehir adları harita üzerinde; tooltip mouse yanında. */
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
  const [tip, setTip] = useState(null);
  const labeledCities = useMemo(() => sorted.slice(0, 18), [sorted]);
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
      <div
        style={{ position: 'relative', overflow: 'hidden' }}
        onMouseMove={(event) => {
          if (!tip) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const localX = event.clientX - rect.left + 12;
          const localY = event.clientY - rect.top + 12;
          setTip((prev) => prev ? {
            ...prev,
            x: Math.min(localX, Math.max(8, rect.width - 160)),
            y: Math.min(localY, Math.max(8, rect.height - 40)),
          } : prev);
        }}
        onMouseLeave={() => setTip(null)}
      >
        <TurkeyMap
          hoverable
          showTooltip={false}
          customStyle={{ idleColor: '#e8eef7', hoverColor: '#60a5fa' }}
          onHover={(city) => {
            const row = byName.get(normalizeTr(city.name));
            setTip((prev) => ({
              x: prev?.x ?? 0,
              y: prev?.y ?? 0,
              name: city.name,
              value: row ? (row.sessions || row.activeUsers || 0) : null,
            }));
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
        {tip?.name && (
          <div
            style={{
              position: 'absolute',
              left: tip.x,
              top: tip.y,
              zIndex: 20,
              pointerEvents: 'none',
              background: '#0f172a',
              color: '#fff',
              padding: '0.35rem 0.55rem',
              borderRadius: 6,
              fontSize: '0.75rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
              maxWidth: '90%',
            }}
          >
            {tip.name}
            {tip.value !== null ? ` · ${nf.format(tip.value)} oturum` : ''}
          </div>
        )}
      </div>
    </div>
  );
}

const DAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

/** Gün × saat kesişim ısı tablosu — daha yüksek hücreler, metin hep siyah. */
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
      <table style={{ width: '100%', minWidth: 860, borderCollapse: 'collapse', fontSize: '0.78rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.55rem 0.45rem', color: '#0f172a', position: 'sticky', left: 0, background: '#f8fafc', fontWeight: 700 }}>Gün \\ Saat</th>
            {Array.from({ length: 24 }, (_, hour) => (
              <th key={hour} style={{ textAlign: 'center', padding: '0.45rem 0.15rem', color: '#0f172a', fontWeight: 700 }}>
                {String(hour).padStart(2, '0')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAY_LABELS.map((label, day) => (
            <tr key={label}>
              <td style={{ padding: '0.55rem 0.5rem', fontWeight: 800, color: '#0f172a', position: 'sticky', left: 0, background: '#f8fafc', whiteSpace: 'nowrap' }}>{label}</td>
              {matrix[day].map((value, hour) => {
                const intensity = value / max;
                // Yoğunluk yeşilde kalsın ama metin her zaman siyah okunabilsin.
                const bg = `rgba(52, 168, 83, ${0.08 + intensity * 0.42})`;
                return (
                  <td
                    key={`${day}-${hour}`}
                    title={`${label} ${String(hour).padStart(2, '0')}:00 — ${nf.format(value)}`}
                    style={{
                      textAlign: 'center',
                      padding: '0.55rem 0.12rem',
                      minHeight: '2.4rem',
                      background: bg,
                      color: '#0f172a',
                      fontWeight: value > 0 ? 700 : 500,
                      border: '1px solid rgba(255,255,255,0.55)',
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

/** Yaş + cinsiyet: sol barlar / sağ pie’lar aynı satırda hizalı. */
export function AgeGenderPanel({ ageRows = [], genderRows = [] }) {
  const hasAge = ageRows.length > 0;
  const hasGender = genderRows.length > 0;
  if (!hasAge && !hasGender) return null;

  const ageTotal = ageRows.reduce((sum, row) => sum + (Number(row.value) || 0), 0);
  const genderTotal = genderRows.reduce((sum, row) => sum + (Number(row.value) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.35rem' }}>
      {hasAge && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(260px, 0.9fr)',
            gap: '1.25rem',
            alignItems: 'center',
          }}
          className="report-split-layout"
        >
          <div>
            <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}>Yaş aralığı</h3>
            <BarList rows={ageRows} secondary={null} limit={10} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DonutChart rows={ageRows} size={240} centerLabel="Kullanıcı" centerValue={ageTotal} />
          </div>
        </div>
      )}
      {hasGender && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(260px, 0.9fr)',
            gap: '1.25rem',
            alignItems: 'center',
          }}
          className="report-split-layout"
        >
          <div>
            <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}>Cinsiyet</h3>
            <BarList rows={genderRows} secondary={null} limit={6} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DonutChart rows={genderRows} size={240} centerLabel="Kullanıcı" centerValue={genderTotal} />
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 900px) {
          .report-split-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
