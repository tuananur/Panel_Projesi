'use client';

import { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  TrendingUp, Users, Eye, Clock, BarChart3, 
  Tv, Smartphone, Laptop, Sparkles, RefreshCw, Globe, HelpCircle,
  Search, ArrowUp, ArrowDown, Minus, AlertCircle,
  ChevronLeft, ChevronRight, BookOpen, ArrowUpDown, Calendar
} from 'lucide-react';
import { ANALYTICS_DATE_PRESETS } from '@/lib/analytics-date-range';
import { isCurrentMonthRange } from '@/lib/report-date-range';

const CHART_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4', '#A855F7'];

function truncateLabel(text, max = 26) {
  const s = String(text || '');
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function compareKeywordsPriority(a, b) {
  const clicksDiff = Number(b.clicks || 0) - Number(a.clicks || 0);
  if (clicksDiff !== 0) return clicksDiff;
  const impDiff = Number(b.impressions || 0) - Number(a.impressions || 0);
  if (impDiff !== 0) return impDiff;
  const posDiff = Number(a.position || 999) - Number(b.position || 999);
  if (posDiff !== 0) return posDiff;
  const changeDiff = Number(b.positionChange || 0) - Number(a.positionChange || 0);
  if (changeDiff !== 0) return changeDiff;
  return a.keyword.localeCompare(b.keyword, 'tr');
}

const PDF_BG = '#0f172a';

async function saveElementAsSinglePdfPage(el, fileName, { onClone } = {}) {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const prevWidth = el.style.width;
  const prevMaxWidth = el.style.maxWidth;
  el.style.width = `${el.scrollWidth}px`;
  el.style.maxWidth = `${el.scrollWidth}px`;

  const w = el.scrollWidth;
  const h = el.scrollHeight;
  const scale = Math.min(2, Math.max(1, 8192 / Math.max(w, h)));

  try {
    const canvas = await html2canvas(el, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: PDF_BG,
      logging: false,
      width: w,
      height: h,
      scrollX: 0,
      scrollY: 0,
      windowWidth: w,
      windowHeight: h,
      onclone: (doc, clonedEl) => {
        doc.querySelectorAll('[data-pdf-hide]').forEach((n) => n.remove());
        doc.querySelectorAll('.tooltip-content').forEach((n) => n.remove());
        onClone?.(doc, clonedEl);
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new jsPDF({
      unit: 'px',
      format: [canvas.width, canvas.height],
      hotfixes: ['px_scaling'],
      compress: true,
    });
    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
    pdf.save(fileName);
  } finally {
    el.style.width = prevWidth;
    el.style.maxWidth = prevMaxWidth;
  }
}

function polarToCartesian(cx, cy, r, angle) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function DonutChart({ data, size = 130, strokeWidth = 12, totalLabel = 'Toplam' }) {
  const items = (data || []).filter((d) => Number(d.count || 0) > 0);
  const total = items.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const cx = 50;
  const cy = 50;
  const r = 36;
  const gap = 0.06;
  let angle = -Math.PI / 2;

  const slices = total > 0 ? items.map((item, idx) => {
    const value = Number(item.count);
    const sliceAngle = (value / total) * Math.PI * 2;
    const startAngle = angle + gap / 2;
    const endAngle = angle + sliceAngle - gap / 2;
    angle += sliceAngle;
    return {
      key: `${item.name}-${idx}`,
      path: describeArc(cx, cy, r, startAngle, Math.max(startAngle + 0.01, endAngle)),
      color: item.color || CHART_COLORS[idx % CHART_COLORS.length],
    };
  }) : [];

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        {slices.map((slice) => (
          <path
            key={slice.key}
            d={slice.path}
            fill="none"
            stroke={slice.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        zIndex: 2,
      }}>
        <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{totalLabel}</span>
        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '-0.1rem' }}>
          {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total}
        </span>
      </div>
    </div>
  );
}

function buildAreaPath(values, width = 1000, height = 200, padTop = 16) {
  if (!values.length) return '';
  const max = Math.max(...values, 1);
  const plotH = height - padTop;
  if (values.length === 1) {
    const y = height - (values[0] / max) * plotH;
    return `M 0 ${height} L 0 ${y} L ${width} ${y} L ${width} ${height} Z`;
  }
  const line = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - (v / max) * plotH;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  return `${line} L ${width} ${height} L 0 ${height} Z`;
}

function buildLinePath(values, width = 1000, height = 200, padTop = 16) {
  if (!values.length) return '';
  const max = Math.max(...values, 1);
  const plotH = height - padTop;
  return values.map((v, i) => {
    const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * width;
    const y = height - (v / max) * plotH;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
}

function MiniAreaChart({ values, color, gradientId, height = 90 }) {
  if (!values?.length) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
        Veri yok
      </div>
    );
  }
  return (
    <svg viewBox="0 0 1000 200" width="100%" height={height} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={buildAreaPath(values)} fill={`url(#${gradientId})`} />
      <path d={buildLinePath(values)} fill="none" stroke={color} strokeWidth="3" />
    </svg>
  );
}

function MetricTrendCard({ label, value, icon, color, values, description, gradientId }) {
  return (
    <div className="card" style={{
      padding: '1.25rem',
      background: 'rgba(255, 255, 255, 0.015)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
          {description && (
            <div className="tooltip-container" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}>
              <span className="tooltip-trigger" style={{ color: 'var(--text-secondary)', opacity: 0.7, display: 'flex' }}>
                <HelpCircle size={13} />
              </span>
              <div className="tooltip-content" style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)',
                width: '230px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-primary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem',
                opacity: 0, visibility: 'hidden', zIndex: 100, pointerEvents: 'none',
              }}>
                {description}
              </div>
            </div>
          )}
        </div>
        <div style={{ background: `${color}18`, borderRadius: '8px', padding: '0.4rem' }}>{icon}</div>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      <MiniAreaChart values={values} color={color} gradientId={gradientId} />
    </div>
  );
}

function TrendAreaChart({ data, valueKey, color, gradientId, height = 220, labelKey = 'date' }) {
  const values = data.map((d) => Number(d[valueKey] || 0));
  const max = Math.max(...values, 1);
  const labels = data.map((d) => d[labelKey]);
  const showEvery = labels.length > 14 ? Math.ceil(labels.length / 12) : 1;

  return (
    <>
      <div style={{ width: '100%', height, position: 'relative', marginTop: '1rem' }}>
        <svg viewBox="0 0 1000 200" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="200" x2="1000" y2="200" stroke="rgba(255,255,255,0.1)" />
          <path d={buildAreaPath(values)} fill={`url(#${gradientId})`} />
          <path d={buildLinePath(values)} fill="none" stroke={color} strokeWidth="3" />
          {values.map((v, index) => {
            const x = values.length === 1 ? 500 : (index / (values.length - 1)) * 1000;
            const y = 200 - (v / max) * 184;
            return (
              <g key={index} className="chart-dot">
                <circle cx={x} cy={y} r="4" fill={color} stroke="var(--bg-primary)" strokeWidth="2" />
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', padding: '0 0.5rem', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, gap: '0.25rem' }}>
        {labels.map((label, index) => (
          showEvery === 1 || index % showEvery === 0 || index === labels.length - 1 ? (
            <span key={index} style={{ flex: 1, textAlign: index === 0 ? 'left' : index === labels.length - 1 ? 'right' : 'center', whiteSpace: 'nowrap' }}>{label}</span>
          ) : null
        ))}
      </div>
    </>
  );
}

export default function AnalyticsContent({ result, id, datePreset = 'last_30d', since: initSince = '', until: initUntil = '', periodLabel = '' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfCaptureMode, setPdfCaptureMode] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [sinceInput, setSinceInput] = useState(initSince);
  const [untilInput, setUntilInput] = useState(initUntil);
  const reportRef = useRef(null);
  const keywordsRef = useRef(null);
  const { summary, dailyActiveUsers, deviceBreakdown, trafficSources, topPages, countryBreakdown, searchConsole, reportPeriod } = result;

  useEffect(() => {
    setSinceInput(initSince);
    setUntilInput(initUntil);
  }, [initSince, initUntil]);

  const isCustom = datePreset === 'custom';
  const showRealtime = reportPeriod ? isCurrentMonthRange(reportPeriod.since, reportPeriod.until) : false;

  const deviceItems = useMemo(
    () => (deviceBreakdown || []).slice(0, 10).map((d, i) => ({ ...d, color: d.color || CHART_COLORS[i % CHART_COLORS.length] })),
    [deviceBreakdown]
  );
  const trafficItems = useMemo(
    () => (trafficSources || []).slice(0, 10).map((s, i) => ({ ...s, color: s.color || CHART_COLORS[(i + 2) % CHART_COLORS.length] })),
    [trafficSources]
  );
  const sortedTopPages = useMemo(
    () => [...(topPages || [])].sort((a, b) => b.views - a.views).slice(0, 20),
    [topPages]
  );

  const countryColors = CHART_COLORS;
  const enrichedCountryData = (countryBreakdown || [
    { name: 'Türkiye', percentage: 0, count: 0 },
    { name: 'Diğer', percentage: 0, count: 0 }
  ]).map((country, idx) => ({
    ...country,
    color: country.color || countryColors[idx % countryColors.length]
  }));

  const dailyTrend = dailyActiveUsers || [];
  const trendDayCount = dailyTrend.length;
  const trendLabel = periodLabel
    ? `${periodLabel} · ${trendDayCount} günlük trend`
    : `${trendDayCount} günlük trend`;

  const dailyPageViews = useMemo(() => dailyTrend.map((d) => d.pageViews || 0), [dailyTrend]);
  const dailySessions = useMemo(() => dailyTrend.map((d) => d.sessions || 0), [dailyTrend]);
  const dailyUsers = useMemo(() => dailyTrend.map((d) => d.users || 0), [dailyTrend]);
  const dailyBounce = useMemo(() => dailyTrend.map((d) => d.bounceRate || 0), [dailyTrend]);
  const dailyDuration = useMemo(() => dailyTrend.map((d) => (d.avgDuration || 0) / 60), [dailyTrend]);

  const handleDatePreset = (preset) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('datePreset', preset);
      params.delete('since');
      params.delete('until');
      router.push(`?${params.toString()}`);
    });
  };

  const handleCustomDateApply = () => {
    if (!sinceInput || !untilInput || sinceInput > untilInput) return;
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('datePreset');
      params.set('since', sinceInput);
      params.set('until', untilInput);
      router.push(`?${params.toString()}`);
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    startTransition(() => {
      router.refresh();
      setTimeout(() => setLoading(false), 600);
    });
  };

  const filteredKeywords = (searchConsole?.keywords || []).filter((row) => {
    if (!keywordFilter.trim()) return true;
    return row.keyword.toLowerCase().includes(keywordFilter.toLowerCase());
  });

  const handleDownloadPDF = async () => {
    const root = reportRef.current;
    if (!root) return;
    const snap = keywordsRef.current?.getExportSnapshot?.();
    setIsGeneratingPDF(true);
    setPdfCaptureMode(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 200));

      await saveElementAsSinglePdfPage(root, `analytics-rapor-${id}.pdf`, {
        onClone: (doc) => {
          if (snap?.rows) {
            doc.querySelectorAll('[data-keyword-row]').forEach((tr, i) => {
              if (i >= snap.rows.length) tr.remove();
            });
          }
          const topLimit = sortedTopPages.length;
          doc.querySelectorAll('[data-top-page-row]').forEach((tr, i) => {
            if (i >= topLimit) tr.remove();
          });
        },
      });
    } catch (err) {
      console.error('Analytics PDF error:', err);
      alert('PDF oluşturulurken bir hata oluştu.');
    } finally {
      setPdfCaptureMode(false);
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      {isPending && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10, 10, 10, 0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Veriler güncelleniyor...</div>
        </div>
      )}

      <div data-pdf-hide style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            style={{
              background: 'linear-gradient(135deg, #0085FF 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '0.55rem 1rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              opacity: isGeneratingPDF ? 0.7 : 1,
            }}
          >
            <BookOpen size={14} />
            {isGeneratingPDF ? 'PDF Hazırlanıyor...' : 'Sayfayı PDF Kaydet'}
          </button>
          {showRealtime && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              Canlı İzleme Aktif
            </div>
          )}
        </div>
      </div>

      <div data-pdf-hide className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', padding: '0.85rem 1.25rem', background: 'rgba(255,255,255,0.02)' }}>
        <Calendar size={16} color="var(--text-secondary)" />
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px', flexWrap: 'wrap' }}>
          {ANALYTICS_DATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleDatePreset(preset.id)}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: !isCustom && datePreset === preset.id ? '#4285F4' : 'transparent',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: !isCustom && datePreset === preset.id ? 800 : 500,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input type="date" value={sinceInput} onChange={(e) => setSinceInput(e.target.value)} className="input-field" style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem', width: 'auto' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>
          <input type="date" value={untilInput} onChange={(e) => setUntilInput(e.target.value)} className="input-field" style={{ padding: '0.35rem 0.5rem', fontSize: '0.78rem', width: 'auto' }} />
          <button type="button" onClick={handleCustomDateApply} className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', background: isCustom ? '#4285F4' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
            Uygula
          </button>
        </div>
        {periodLabel && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
            Seçili dönem: <strong style={{ color: 'var(--text-primary)' }}>{periodLabel}</strong>
          </span>
        )}
      </div>

      <div ref={reportRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="heading-1" style={{ marginBottom: '0.5rem' }}>Google Analytics & Search Console</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Organik anahtar kelime sıralamaları (GSC) ve site trafik performansı (GA4).
          {periodLabel ? ` · ${periodLabel}` : ''}
        </p>
      </div>

      <SearchConsoleKeywordsSection
        ref={keywordsRef}
        searchConsole={searchConsole}
        clientId={id}
        keywordFilter={keywordFilter}
        onKeywordFilterChange={setKeywordFilter}
        filteredKeywords={filteredKeywords}
        pdfCaptureMode={pdfCaptureMode}
      />
      
      {/* Realtime & Refresh Header */}
      {showRealtime && (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: 'rgba(255, 255, 255, 0.02)', 
        padding: '1rem 1.5rem', 
        borderRadius: '12px', 
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            background: '#10b981', 
            borderRadius: '50%', 
            boxShadow: '0 0 12px #10b981',
            animation: 'pulse 1.5s infinite alternate' 
          }}></div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Şu Anda Sitede: <strong style={{ fontSize: '1.1rem', color: '#10b981', marginLeft: '0.2rem' }}>{summary.activeUsers}</strong> Aktif Kullanıcı
          </span>
        </div>
        <button 
          data-pdf-hide
          onClick={handleRefresh}
          disabled={loading}
          className="btn" 
          style={{ 
            background: 'transparent', 
            border: '1px solid var(--border-color)', 
            color: 'var(--text-secondary)',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.8rem'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Güncelleniyor...' : 'Verileri Yenile'}
        </button>
      </div>
      )}

      {/* Core Metrics with Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        <MetricTrendCard
          label="Sayfa Görüntüleme"
          value={Number(summary.pageViews).toLocaleString()}
          icon={<Eye size={18} style={{ color: '#F59E0B' }} />}
          color="#F59E0B"
          values={dailyPageViews}
          gradientId="metricPvGrad"
          description="Web sitenizdeki sayfaların toplam görüntülenme sayısıdır."
        />
        <MetricTrendCard
          label="Oturumlar (Sessions)"
          value={Number(summary.sessions).toLocaleString()}
          icon={<Users size={18} style={{ color: '#3B82F6' }} />}
          color="#3B82F6"
          values={dailySessions}
          gradientId="metricSessGrad"
          description="Ziyaretçilerin web sitenizde başlattığı aktif oturum sayısıdır."
        />
        <MetricTrendCard
          label="Hemen Çıkma Oranı"
          value={`%${summary.bounceRate}`}
          icon={<TrendingUp size={18} style={{ color: '#10B981' }} />}
          color="#10B981"
          values={dailyBounce}
          gradientId="metricBounceGrad"
          description="Tek sayfa görüntüleyip ayrılan kullanıcı yüzdesidir."
        />
        <MetricTrendCard
          label="Ort. Etkileşim Süresi"
          value={summary.avgEngagementTime}
          icon={<Clock size={18} style={{ color: '#8B5CF6' }} />}
          color="#8B5CF6"
          values={dailyDuration}
          gradientId="metricDurGrad"
          description="Kullanıcıların sitede aktif kaldığı ortalama süredir (grafik: dakika)."
        />
      </div>

      {/* Main Chart Section */}
      <div className="card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Günlük Aktif Kullanıcı Eğilimi</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>{trendLabel}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '12px', height: '12px', background: '#F59E0B', borderRadius: '3px' }}></span>
            Kullanıcı Sayısı
          </div>
        </div>
        <TrendAreaChart data={dailyTrend} valueKey="users" color="#F59E0B" gradientId="mainUsersGrad" />
      </div>

      {/* Breakdowns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Device Breakdown */}
        <div className="card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Cihaz Dağılımı
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, flexWrap: 'wrap' }}>
            <DonutChart data={deviceItems} totalLabel="Cihaz" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, minWidth: '180px' }}>
              {deviceItems.map((dev, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {dev.name === 'Mobil' ? <Smartphone size={14} style={{ color: dev.color }} /> : dev.name === 'Masaüstü' ? <Laptop size={14} style={{ color: dev.color }} /> : <Tv size={14} style={{ color: dev.color }} />}
                      {dev.name}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{dev.percentage}%</strong> ({Number(dev.count).toLocaleString()})
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${dev.percentage}%`, height: '100%', background: dev.color, borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Sources Breakdown */}
        <div className="card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Erişim Kanalları</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, flexWrap: 'wrap' }}>
            <DonutChart data={trafficItems} totalLabel="Oturum" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem', flex: 1, minWidth: '180px' }}>
              {trafficItems.map((source, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
                    <span style={{ width: '8px', height: '8px', background: source.color, borderRadius: '50%', flexShrink: 0 }}></span>
                    <span
                      title={source.name}
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                      }}
                    >
                      {truncateLabel(source.name, 28)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', flexShrink: 0 }}>
                    <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{Number(source.count).toLocaleString()} Oturum</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, width: '40px', textAlign: 'right' }}>%{source.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coğrafi Dağılım (Ülkeler) */}
        <div className="card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={16} style={{ color: '#8B5CF6' }} />
            Coğrafi Dağılım (Ülkeler)
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, flexWrap: 'wrap' }}>
            <DonutChart data={enrichedCountryData} totalLabel="Ziyaret" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem', flex: 1, minWidth: '180px' }}>
              {enrichedCountryData.map((country, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {country.name}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{country.percentage}%</strong> ({Number(country.count).toLocaleString()})
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${country.percentage}%`, height: '100%', background: country.color, borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>En Çok Ziyaret Edilen Sayfalar</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>En popüler sayfaların etkileşim ve gösterim detayları.</p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700 }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>SAYFA YOLU (PATH)</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>SAYFA BAŞLIĞI</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>GÖRÜNTÜLENME</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>TEKİL KULLANICI</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>ORT. SÜRE</th>
            </tr>
          </thead>
          <tbody>
            {sortedTopPages.map((page, idx, arr) => (
              <tr key={idx} data-top-page-row style={{ 
                borderBottom: idx === arr.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.03)', 
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                transition: 'background 0.2s ease'
              }} className="table-row-hover">
                <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'monospace', color: '#F59E0B' }}>{page.path}</td>
                <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{page.title}</td>
                <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>{Number(page.views).toLocaleString()}</td>
                <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{Number(page.users).toLocaleString()}</td>
                <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>{page.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Styled animation overrides */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.05); }
        }
        .chart-dot circle {
          transition: r 0.15s ease, fill-opacity 0.15s ease;
        }
        .chart-dot:hover circle {
          r: 7;
        }
        .chart-dot text {
          opacity: 0;
          transition: opacity 0.15s ease, transform 0.15s ease;
          transform: translateY(2px);
        }
        .chart-dot:hover text {
          opacity: 1;
          transform: translateY(0);
        }
        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.015);
        }
        .tooltip-container {
          position: relative;
        }
        .tooltip-container:hover .tooltip-content {
          opacity: 1 !important;
          visibility: visible !important;
          transform: translateX(-50%) translateY(-4px) !important;
        }
        .tooltip-container:hover .tooltip-trigger {
          color: var(--accent-primary) !important;
          opacity: 1 !important;
        }
      `}</style>
      </div>
    </div>
  );
}

const SearchConsoleKeywordsSection = forwardRef(function SearchConsoleKeywordsSection({ searchConsole, clientId, keywordFilter, onKeywordFilterChange, filteredKeywords, pdfCaptureMode = false }, ref) {
  const sc = searchConsole;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState('priority');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    setCurrentPage(1);
  }, [keywordFilter, pageSize, sortKey, sortDir]);

  const sortedKeywords = useMemo(() => {
    const list = [...filteredKeywords];
    if (sortKey === 'priority') {
      list.sort(compareKeywordsPriority);
      return list;
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      let av = 0;
      let bv = 0;
      if (sortKey === 'clicks') {
        av = Number(a.clicks || 0);
        bv = Number(b.clicks || 0);
      } else if (sortKey === 'impressions') {
        av = Number(a.impressions || 0);
        bv = Number(b.impressions || 0);
      } else if (sortKey === 'ctr') {
        av = parseFloat(a.ctr || 0);
        bv = parseFloat(b.ctr || 0);
      } else if (sortKey === 'position') {
        av = Number(a.position || 0);
        bv = Number(b.position || 0);
      } else if (sortKey === 'change') {
        av = Number(a.positionChange || 0);
        bv = Number(b.positionChange || 0);
      }
      if (av === bv) return compareKeywordsPriority(a, b);
      return av > bv ? dir : -dir;
    });
    return list;
  }, [filteredKeywords, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedKeywords.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const paginatedKeywords = sortedKeywords.slice(pageStart, pageStart + pageSize);

  useImperativeHandle(ref, () => ({
    getExportSnapshot: () => ({
      rows: paginatedKeywords,
      pageStart,
      pageSize,
    }),
  }), [paginatedKeywords, pageStart, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'position' ? 'asc' : 'desc');
    }
  };

  const sortThStyle = {
    padding: '0.75rem 0.5rem',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  const SortLabel = ({ label, colKey, align = 'right' }) => {
    const active = sortKey === colKey;
    return (
      <th
        style={{ ...sortThStyle, textAlign: align, color: active ? '#4285F4' : 'var(--text-secondary)' }}
        onClick={() => handleSort(colKey)}
        title="Sıralamak için tıkla"
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', justifyContent: align === 'center' ? 'center' : 'flex-end' }}>
          {label}
          {active ? (sortDir === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />) : <ArrowUpDown size={11} style={{ opacity: 0.35 }} />}
        </span>
      </th>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #4285F4' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="heading-2" style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={22} style={{ color: '#4285F4' }} />
            Takip Edilen Anahtar Kelimeler
          </h2>
          <p className="text-muted" style={{ fontSize: '0.85rem', maxWidth: '640px' }}>
            Google Search Console verisi — {sc?.device || 'Masaüstü'} · {sc?.country || 'Türkiye'}
            {sc?.periodLabel ? ` · ${sc.periodLabel}` : ''}
          </p>
        </div>
        {sc?.totalKeywords > 0 && (
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', background: 'rgba(66,133,244,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(66,133,244,0.25)' }}>
            {sc.totalKeywords} sorgu
          </div>
        )}
      </div>

      {sc?.error ? (
        <div style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px dashed rgba(245,158,11,0.35)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertCircle size={20} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#F59E0B' }}>Search Console verisi alınamadı</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{sc.details}</p>
            <a href={`/dashboard/client/${clientId}/settings`} style={{ fontSize: '0.8rem', color: '#4285F4', fontWeight: 600, marginTop: '0.5rem', display: 'inline-block' }}>
              Hizmet Ayarlarına git →
            </a>
          </div>
        </div>
      ) : (
        <>
          {!pdfCaptureMode && (
          <div data-pdf-hide style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Anahtar kelime ara..."
              value={keywordFilter}
              onChange={(e) => onKeywordFilterChange(e.target.value)}
              style={{ maxWidth: '320px' }}
            />
            <button
              type="button"
              onClick={() => { setSortKey('priority'); setSortDir('desc'); }}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid',
                cursor: 'pointer',
                borderColor: sortKey === 'priority' ? '#4285F4' : 'var(--border-color)',
                background: sortKey === 'priority' ? 'rgba(66,133,244,0.12)' : 'rgba(255,255,255,0.02)',
                color: sortKey === 'priority' ? '#4285F4' : 'var(--text-secondary)',
              }}
            >
              Öncelikli Sıralama
            </button>
            {sortKey === 'priority' && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Tıklama → Gösterim → Pozisyon → Değişim
              </span>
            )}
          </div>
          )}

          {filteredKeywords.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
              Bu dönem için organik sorgu verisi yok veya filtre eşleşmedi.
            </p>
          ) : (
            <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.75rem 0.5rem', width: 56 }}>#</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Anahtar Kelime</th>
                    <SortLabel label="Tıklama" colKey="clicks" />
                    <SortLabel label="Gösterim" colKey="impressions" />
                    <SortLabel label="CTR" colKey="ctr" />
                    <SortLabel label="Poz." colKey="position" align="center" />
                    <SortLabel label="Değişim" colKey="change" align="left" />
                    <th style={{ padding: '0.75rem 0.5rem' }}>URL</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedKeywords.map((row, idx) => (
                    <KeywordRankRow key={`${row.keyword}-${row.url}`} row={row} rank={pageStart + idx + 1} />
                  ))}
                </tbody>
              </table>
            </div>

            {sortedKeywords.length > 0 && !pdfCaptureMode && (
              <div data-pdf-hide style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {pageStart + 1}–{Math.min(pageStart + pageSize, sortedKeywords.length)} / {sortedKeywords.length} sorgu
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Sayfa başına
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="input-field"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', width: 'auto' }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                    </select>
                  </label>
                </div>
                {sortedKeywords.length > pageSize && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      padding: '0.4rem 0.65rem',
                      opacity: safePage <= 1 ? 0.4 : 1,
                      cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '80px', textAlign: 'center' }}>
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      padding: '0.4rem 0.65rem',
                      opacity: safePage >= totalPages ? 0.4 : 1,
                      cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                )}
              </div>
            )}
            </>
          )}

          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.45 }}>
            {sc?.compareLabel || 'Önceki döneme göre'} · Ortalama pozisyon (Google). Hacim ve SEO zorluğu Search Console&apos;da yoktur.
            {sc?.siteUrl ? ` · Mülk: ${sc.siteUrl}` : ''}
          </p>
        </>
      )}
    </div>
  );
});

function KeywordRankRow({ row, rank }) {
  const changeColor = row.improved ? '#10b981' : row.positionChange < 0 ? '#ef4444' : 'var(--text-secondary)';
  const ChangeIcon = row.positionChange > 0 ? ArrowUp : row.positionChange < 0 ? ArrowDown : Minus;
  const changeLabel = row.positionChange > 0 ? `+${row.positionChange}` : String(row.positionChange);

  let urlDisplay = row.url || '—';
  try {
    if (row.url) {
      const u = new URL(row.url.startsWith('http') ? row.url : `https://${row.url}`);
      urlDisplay = u.pathname.length > 1 ? u.pathname : u.hostname;
    }
  } catch {
    urlDisplay = row.url;
  }

  return (
    <tr data-keyword-row className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <td style={{ padding: '0.9rem 0.5rem', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
        {rank}
      </td>
      <td style={{ padding: '0.9rem 0.5rem', verticalAlign: 'middle' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.35 }}>{row.keyword}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          Türkçe / Türkiye
        </div>
      </td>
      <td style={{ padding: '0.9rem 0.5rem', verticalAlign: 'middle', textAlign: 'right', fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
        {Number(row.clicks || 0).toLocaleString('tr-TR')}
      </td>
      <td style={{ padding: '0.9rem 0.5rem', verticalAlign: 'middle', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
        {Number(row.impressions || 0).toLocaleString('tr-TR')}
      </td>
      <td style={{ padding: '0.9rem 0.5rem', verticalAlign: 'middle', textAlign: 'right', color: '#4285F4', fontWeight: 700 }}>
        %{row.ctr || '0.00'}
      </td>
      <td style={{ padding: '0.9rem 0.5rem', verticalAlign: 'middle', textAlign: 'center', fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
        {row.position}
      </td>
      <td style={{ padding: '0.9rem 0.5rem', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{row.previousPosition}</span>
          <span style={{ color: 'var(--text-secondary)' }}>→</span>
          <span style={{ color: 'var(--text-primary)' }}>{row.position}</span>
          <ChangeIcon size={14} style={{ color: changeColor }} />
          <span style={{ color: changeColor }}>{changeLabel}</span>
        </div>
      </td>
      <td style={{ padding: '0.9rem 0.5rem', verticalAlign: 'middle', maxWidth: 220 }}>
        {row.url ? (
          <a
            href={row.url.startsWith('http') ? row.url : `https://${row.url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.78rem', color: '#4285F4', wordBreak: 'break-all', lineHeight: 1.35 }}
          >
            {urlDisplay}
          </a>
        ) : (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>—</span>
        )}
      </td>
    </tr>
  );
}

