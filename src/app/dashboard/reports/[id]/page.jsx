import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Check, X } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can, getRolePermissions } from '@/lib/permissions';
import { getGoogleAnalyticsAction } from '@/app/actions';
import { ANALYTICS_DATE_PRESETS, resolveAnalyticsDateRange } from '@/lib/analytics-date-range';

export const dynamic = 'force-dynamic';

const nf = new Intl.NumberFormat('tr-TR');

function num(value) {
  return nf.format(Math.round(Number(value) || 0));
}

function pct(value) {
  return `${nf.format(Math.round((Number(value) || 0) * 100) / 100)}%`;
}

function duration(seconds) {
  const secs = Math.round(Number(seconds) || 0);
  if (secs < 60) return `0dk ${secs}sn`;
  return `${Math.floor(secs / 60)}dk ${secs % 60}sn`;
}

const DEVICE_LABELS = { DESKTOP: 'Masaüstü', MOBILE: 'Mobil', TABLET: 'Tablet' };

function Row({ label, value }) {
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
      <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

function Section({ title, note, children }) {
  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h2 className="heading-2" style={{ fontSize: '1.1rem', marginBottom: note ? '0.25rem' : '1rem' }}>{title}</h2>
      {note && <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>{note}</p>}
      {children}
    </div>
  );
}

/** Veri yoksa sahte satır basmak yerine bölümü açık şekilde boş gösterir. */
function ListSection({ title, note, items, render }) {
  return (
    <Section title={title} note={note}>
      {items?.length > 0
        ? items.map(render)
        : <p className="text-muted" style={{ fontSize: '0.85rem' }}>Bu dönem için veri bulunamadı.</p>}
    </Section>
  );
}

function StatusBadge({ label, connected }) {
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
      }}
    >
      {connected ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
      {label}
    </span>
  );
}

export default async function ClientReportPage({ params, searchParams }) {
  const { id } = await params;
  const sParams = (await searchParams) || {};

  const session = await getSession();
  const permissions = await getRolePermissions(session);
  if (!session || !can(permissions, session.role, 'page.reports')) {
    redirect('/dashboard');
  }

  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    select: { id: true, companyName: true, website: true, analyticsEnabled: true, analyticsPropertyId: true, searchConsoleSiteUrl: true },
  });
  if (!client) notFound();

  const datePreset = sParams.datePreset || 'last_30d';
  const { since, until, preset, label: periodLabel, dayCount } = resolveAnalyticsDateRange(datePreset);

  const analyticsConfigured = client.analyticsEnabled && Boolean(client.analyticsPropertyId);
  const result = await getGoogleAnalyticsAction(id, since, until);

  const ga = result?.success ? result.analytics : null;
  const gaOk = Boolean(ga?.summary);
  const gsc = result?.searchConsole || null;
  const gscOk = Boolean(gsc && !gsc.error && gsc.summary);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '820px' }}>
      <Link
        href="/dashboard/reports"
        className="text-muted"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', marginBottom: '1rem', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Raporlar
      </Link>

      <h1 className="heading-1" style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{client.companyName}</h1>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <StatusBadge label="Analytics" connected={gaOk} />
        <StatusBadge label="Search Console" connected={gscOk} />
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {ANALYTICS_DATE_PRESETS.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/reports/${client.id}?datePreset=${item.id}`}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: preset === item.id ? '#4285F4' : 'transparent',
              color: preset === item.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: preset === item.id ? 800 : 500,
              textDecoration: 'none',
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Dönem: {periodLabel} ({since} → {until}, {dayCount} gün) · Tüm ülkeler ve tüm cihazlar
      </p>

      {!gaOk && (
        <Section title="Google Analytics">
          <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}>
            {!analyticsConfigured
              ? 'Analytics bağlantısı yapılandırılmamış (GA4 mülk kimliği eksik).'
              : result?.details || (result?.success ? 'Bu dönem için veri bulunamadı.' : 'Analytics verileri alınamadı.')}
          </p>
        </Section>
      )}

      {gaOk && (
        <>
          <Section title="Google Analytics — Özet" note="Dönemin tamamı, ülke veya cihaz filtresi yok.">
            <Row label="Tekil ziyaretçi (aktif kullanıcı)" value={num(ga.summary.activeUsers)} />
            <Row label="Sayfa görüntüleme" value={num(ga.summary.pageViews)} />
            <Row label="Oturum" value={num(ga.summary.sessions)} />
            <Row label="Hemen çıkma oranı" value={pct(ga.summary.bounceRate)} />
            <Row label="Ort. oturum süresi" value={ga.summary.avgEngagementTime} />
            <Row label="Etkinlik sayısı" value={num(ga.summary.eventCount)} />
            {ga.realtime && <Row label="Şu anda sitede (canlı)" value={num(ga.realtime.activeUsers)} />}
          </Section>

          <ListSection
            title="Cihaz Dağılımı"
            items={ga.devices}
            render={(item) => (
              <Row key={item.rawName || item.name} label={item.name} value={`${num(item.activeUsers)} kullanıcı · ${num(item.sessions)} oturum · ${pct(item.percentage)}`} />
            )}
          />

          <ListSection
            title="Erişim Kanalları"
            items={ga.channels}
            render={(item) => (
              <Row key={item.rawName || item.name} label={item.name} value={`${num(item.activeUsers)} kullanıcı · ${num(item.sessions)} oturum · ${pct(item.percentage)}`} />
            )}
          />

          <ListSection
            title="Ülke Dağılımı (site trafiği)"
            note={`${ga.countries?.length || 0} ülke · pay dönemin toplam aktif kullanıcısına göre`}
            items={ga.countries}
            render={(item) => (
              <Row
                key={item.countryCode || item.country}
                label={`${item.country}${item.countryCode ? ` (${item.countryCode})` : ''}`}
                value={`${num(item.activeUsers)} kullanıcı · ${num(item.sessions)} oturum · ${num(item.views)} görüntüleme · etkileşim ${pct(item.engagementRate)} · pay ${pct(item.percentage)}`}
              />
            )}
          />

          <ListSection
            title="Tarayıcı Dağılımı"
            items={ga.browsers}
            render={(item) => (
              <Row key={item.rawName || item.name} label={item.name} value={`${num(item.sessions)} oturum · ${num(item.activeUsers)} kullanıcı · ${pct(item.percentage)}`} />
            )}
          />

          <ListSection
            title="En Çok Ziyaret Edilen Sayfalar"
            items={ga.pages}
            render={(page) => (
              <Row
                key={page.path}
                label={`${page.title || 'Başlıksız'} — ${page.path || '/'}`}
                value={`${num(page.views)} görüntüleme · ${num(page.activeUsers)} kullanıcı · ${duration(page.avgSessionDuration)}`}
              />
            )}
          />

          <ListSection
            title="Günlük Döküm"
            items={ga.daily}
            render={(day) => (
              <Row
                key={day.date}
                label={day.label || day.date}
                value={`${num(day.activeUsers)} kullanıcı · ${num(day.pageViews)} görüntüleme · ${num(day.sessions)} oturum`}
              />
            )}
          />
        </>
      )}

      {!gscOk && (
        <Section title="Google Search Console">
          <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}>
            {gsc?.details || (gsc && !gsc.error ? 'Bu dönem için veri bulunamadı.' : 'Search Console bağlantısı yapılandırılmamış.')}
          </p>
        </Section>
      )}

      {gscOk && (
        <>
          <Section title="Google Search Console — Özet" note={`${gsc.siteUrl} · ${gsc.periodLabel} · tüm ülkeler ve tüm cihazlar`}>
            <Row label="Toplam tıklama" value={num(gsc.summary.clicks)} />
            <Row label="Toplam gösterim" value={num(gsc.summary.impressions)} />
            <Row label="Ortalama CTR" value={pct(gsc.summary.ctr)} />
            <Row label="Ortalama pozisyon" value={gsc.summary.position} />
            <Row label="Anahtar kelime sayısı" value={num(gsc.totalQueries)} />
            {gsc.truncated && <Row label="Uyarı" value="Sonuç sayısı sayfalama sınırına ulaştı" />}
          </Section>

          <ListSection
            title="Ülke Dağılımı (arama)"
            note={`${gsc.countries?.length || 0} ülke`}
            items={gsc.countries}
            render={(item) => (
              <Row
                key={item.countryCode || item.countryName}
                label={`${item.countryName}${item.countryCode ? ` (${item.countryCode})` : ''}`}
                value={`${num(item.clicks)} tıklama · ${num(item.impressions)} gösterim · ${pct(item.ctr)} CTR · ${item.position}. sıra`}
              />
            )}
          />

          <ListSection
            title="Cihaz Dağılımı (arama)"
            items={gsc.devices}
            render={(item) => (
              <Row
                key={item.device}
                label={DEVICE_LABELS[item.device] || item.device}
                value={`${num(item.clicks)} tıklama · ${num(item.impressions)} gösterim · ${pct(item.ctr)} CTR · ${item.position}. sıra`}
              />
            )}
          />

          <ListSection
            title="Anahtar Kelimeler"
            note="Filtresiz ham liste"
            items={gsc.queries}
            render={(kw) => (
              <Row
                key={kw.keyword}
                label={kw.keyword}
                value={`${num(kw.clicks)} tıklama · ${num(kw.impressions)} gösterim · ${pct(kw.ctr)} CTR · ${kw.position}. sıra`}
              />
            )}
          />
        </>
      )}
    </div>
  );
}
