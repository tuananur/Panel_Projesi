// Genel rapor grafikleri. Etkileşim gerektirmediği için sunucu tarafında SVG olarak
// üretilir; ekstra JS paketi yüklenmez.

const PALETTE = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#A142F4', '#00ACC1', '#FF7043', '#9E9D24'];

const numberFmt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

function fmt(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return numberFmt.format(value);
}

/**
 * Çok serili çizgi grafik.
 * series: [{ key, label, color? }], data: [{ label, [key]: number }]
 */
export function LineChart({ data, series, height = 190, valueSuffix = '' }) {
  const rows = (data || []).filter(Boolean);
  if (rows.length < 2 || !series?.length) return null;

  const width = 100; // yüzde tabanlı viewBox: kart genişliğine uyum sağlar
  const values = rows.flatMap((row) => series.map((s) => Number(row[s.key]) || 0));
  const max = Math.max(...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;

  const x = (index) => (rows.length === 1 ? 0 : (index / (rows.length - 1)) * width);
  const y = (value) => height - 24 - ((Number(value) || 0) - min) / span * (height - 44);

  const labelStep = Math.ceil(rows.length / 8);

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        {series.map((s, index) => (
          <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color || PALETTE[index % PALETTE.length] }} />
            {s.label}
          </span>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: `${height}px`, overflow: 'visible' }}
      >
        {[0, 0.5, 1].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            x2={width}
            y1={y(min + span * ratio)}
            y2={y(min + span * ratio)}
            stroke="var(--border-color)"
            strokeWidth="0.3"
            strokeDasharray="1 1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {series.map((s, seriesIndex) => {
          const color = s.color || PALETTE[seriesIndex % PALETTE.length];
          const path = rows.map((row, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(row[s.key])}`).join(' ');
          // viewBox yatayda gerildiği için nokta işaretçisi kullanılmaz (oval görünürdü);
          // tam değerler bölümün tablosunda yer alıyor.
          return <path key={s.key} d={path} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
        {rows
          .filter((_, index) => index % labelStep === 0 || index === rows.length - 1)
          .map((row, index) => (
            <span key={`${row.label}-${index}`}>{row.label}</span>
          ))}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
        En yüksek: {fmt(max)}{valueSuffix} · En düşük: {fmt(Math.min(...values))}{valueSuffix}
      </div>
    </div>
  );
}

/** Yatay bar listesi: kategori dağılımları için (kaynak, cihaz, ülke, gün, saat). */
export function BarList({ rows, valueKey = 'value', labelKey = 'label', suffix = '', limit = 12, secondary = null }) {
  const items = (rows || []).slice(0, limit);
  if (items.length === 0) return null;
  const max = Math.max(...items.map((row) => Number(row[valueKey]) || 0)) || 1;

  return (
    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map((row, index) => {
        const value = Number(row[valueKey]) || 0;
        return (
          <div key={`${row[labelKey]}-${index}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem', gap: '1rem' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row[labelKey]}</span>
              <span style={{ fontWeight: 600, flexShrink: 0 }}>
                {fmt(value)}{suffix}
                {secondary && row[secondary] !== null && row[secondary] !== undefined && (
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}> · {fmt(row[secondary])}</span>
                )}
              </span>
            </div>
            <div style={{ height: '7px', borderRadius: '4px', background: 'var(--border-color)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(value / max) * 100}%`,
                  height: '100%',
                  borderRadius: '4px',
                  background: PALETTE[index % PALETTE.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Donut: yalnızca birkaç kategorili dağılımlar için (cihaz, yeni/geri dönen). */
export function DonutChart({ rows, valueKey = 'value', labelKey = 'label', size = 150 }) {
  const items = (rows || []).filter((row) => (Number(row[valueKey]) || 0) > 0);
  if (items.length === 0) return null;

  const total = items.reduce((acc, row) => acc + Number(row[valueKey]), 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  // Dilim başlangıçları önceden hesaplanır: render sırasında dışarıdaki değişken değişmez.
  const slices = [];
  items.reduce((start, row) => {
    const length = (Number(row[valueKey]) / total) * circumference;
    slices.push({ length, start });
    return start + length;
  }, 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
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
                stroke={PALETTE[index % PALETTE.length]}
                strokeWidth="26"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-start}
              />
            );
          })}
        </g>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '160px' }}>
        {items.map((row, index) => (
          <span key={`${row[labelKey]}-legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: PALETTE[index % PALETTE.length], flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{row[labelKey]}</span>
            <strong>{fmt(Number(row[valueKey]))}</strong>
            <span style={{ color: 'var(--text-secondary)' }}>
              %{((Number(row[valueKey]) / total) * 100).toFixed(1)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Değişim kartı: bu dönem / önceki dönem ve yüzde fark. */
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
    <div
      style={{
        marginTop: '0.75rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
        gap: '0.75rem',
      }}
    >
      {items.map((row) => {
        const improved = row.changePct === null ? null : row.lowerIsBetter ? row.changePct < 0 : row.changePct > 0;
        const color = improved === null ? 'var(--text-secondary)' : improved ? '#34A853' : '#EA4335';
        return (
          <div
            key={`${row.source}-${row.label}`}
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '0.75rem 0.85rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {row.source}
            </div>
            <div style={{ fontSize: '0.82rem', marginTop: '0.15rem' }}>{row.label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.35rem' }}>
              {formatValue(row.current, row.unit)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Önceki: {formatValue(row.previous, row.unit)}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color, marginTop: '0.25rem' }}>
              {row.changePct === null
                ? 'Değişim hesaplanamadı'
                : `${row.changePct >= 0 ? '+' : ''}${numberFmt.format(row.changePct)}%`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Gün/saat yoğunluğu: renk tonu ile ısı haritası. */
export function HeatStrip({ rows, labelKey = 'label', valueKey = 'sessions' }) {
  const items = rows || [];
  if (items.length === 0) return null;
  const max = Math.max(...items.map((row) => Number(row[valueKey]) || 0)) || 1;

  return (
    <div
      style={{
        marginTop: '0.75rem',
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(items.length, 12)}, minmax(0, 1fr))`,
        gap: '0.3rem',
      }}
    >
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
