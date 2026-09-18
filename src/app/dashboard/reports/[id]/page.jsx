import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can, getRolePermissions } from '@/lib/permissions';
import { getGoogleAnalyticsAction } from '@/app/actions';
import { ANALYTICS_DATE_PRESETS, getPreviousPeriod, resolveAnalyticsDateRange } from '@/lib/analytics-date-range';
import { getUbersuggestReport } from '@/lib/ubersuggest/report-view';
import { fetchGeneralReportGa4 } from '@/lib/general-report/ga4-report';
import { buildGeneralReport } from '@/lib/general-report/build';
import { ErrorNote, ListSection, Row, Section, StatusBadge, duration, num, pct } from '../report-ui';
import ReportTabs from './report-tabs';
import UbersuggestPanel from './ubersuggest-panel';
import GeneralReportPanel from './general-report-panel';
import GeneralReportControls from './general-report-controls';
import ReportPdfButton from './report-pdf-button';

export const dynamic = 'force-dynamic';

const DEVICE_LABELS = { DESKTOP: 'Masaüstü', MOBILE: 'Mobil', TABLET: 'Tablet' };

function AnalyticsTab({ ga, gaOk, analyticsConfigured, result }) {
  if (!gaOk) {
    return (
      <Section title="Google Analytics">
        <ErrorNote>
          {!analyticsConfigured
            ? 'Analytics bağlantısı yapılandırılmamış (GA4 mülk kimliği eksik).'
            : result?.details || (result?.success ? 'Bu dönem için veri bulunamadı.' : 'Analytics verileri alınamadı.')}
        </ErrorNote>
      </Section>
    );
  }

  return (
    <>
      <Section title="Özet" note="Dönemin tamamı, ülke veya cihaz filtresi yok.">
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
          <Row
            key={item.rawName || item.name}
            label={item.name}
            value={`${num(item.activeUsers)} kullanıcı · ${num(item.sessions)} oturum · ${pct(item.percentage)}`}
          />
        )}
      />

      <ListSection
        title="Erişim Kanalları"
        items={ga.channels}
        render={(item) => (
          <Row
            key={item.rawName || item.name}
            label={item.name}
            value={`${num(item.activeUsers)} kullanıcı · ${num(item.sessions)} oturum · ${pct(item.percentage)}`}
          />
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
          <Row
            key={item.rawName || item.name}
            label={item.name}
            value={`${num(item.sessions)} oturum · ${num(item.activeUsers)} kullanıcı · ${pct(item.percentage)}`}
          />
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
  );
}

function SearchConsoleTab({ gsc, gscOk }) {
  if (!gscOk) {
    return (
      <Section title="Google Search Console">
        <ErrorNote>
          {gsc?.details || (gsc && !gsc.error ? 'Bu dönem için veri bulunamadı.' : 'Search Console bağlantısı yapılandırılmamış.')}
        </ErrorNote>
      </Section>
    );
  }

  return (
    <>
      <Section title="Özet" note={`${gsc.siteUrl} · ${gsc.periodLabel} · tüm ülkeler ve tüm cihazlar`}>
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
        title="Günlük Döküm"
        items={gsc.daily}
        render={(day) => (
          <Row
            key={day.date}
            label={day.date}
            value={`${num(day.clicks)} tıklama · ${num(day.impressions)} gösterim · ${pct(day.ctr)} CTR · ${day.position}. sıra`}
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
    select: {
      id: true,
      companyName: true,
      website: true,
      analyticsEnabled: true,
      analyticsPropertyId: true,
      analyticsRefreshToken: true,
      searchConsoleSiteUrl: true,
    },
  });
  if (!client) notFound();

  const datePreset = sParams.datePreset || 'last_30d';
  const { since, until, preset, label: periodLabel, dayCount } = resolveAnalyticsDateRange(datePreset);
  const { prevSince, prevUntil } = getPreviousPeriod(since, until);

  const analyticsConfigured = client.analyticsEnabled && Boolean(client.analyticsPropertyId);

  // Google sorguları, genel rapora özel GA4 boyutları ve Ubersuggest DB okuması paralel yürür.
  const [result, ubersuggest, extrasResult] = await Promise.all([
    getGoogleAnalyticsAction(id, since, until, { includeSearchConsolePages: true }),
    getUbersuggestReport(client.id),
    analyticsConfigured
      ? fetchGeneralReportGa4(client, { since, until, prevSince, prevUntil }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const ga = result?.success ? result.analytics : null;
  const gaOk = Boolean(ga?.summary);
  const gsc = result?.searchConsole || null;
  const gscOk = Boolean(gsc && !gsc.error && gsc.summary);
  const ubersuggestOk = Boolean(ubersuggest.snapshot);
  const extras = extrasResult && !extrasResult.error ? extrasResult : null;

  const generalReport = buildGeneralReport({
    ga,
    gsc: gscOk ? gsc : null,
    extras,
    ubersuggest,
    period: { since, until, prevSince, prevUntil, label: periodLabel },
  });

  const tabs = [
    {
      id: 'general',
      label: 'Genel Rapor',
      hasData: gaOk || gscOk || ubersuggestOk,
      content: (
        <GeneralReportControls>
          <GeneralReportPanel
            ga={ga}
            gsc={gscOk ? gsc : null}
            extras={extras}
            ubersuggest={ubersuggest}
            report={generalReport}
            periodLabel={`${periodLabel} (${since} → ${until})`}
          />
        </GeneralReportControls>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      hasData: gaOk,
      content: <AnalyticsTab ga={ga} gaOk={gaOk} analyticsConfigured={analyticsConfigured} result={result} />,
    },
    {
      id: 'search-console',
      label: 'Search Console',
      hasData: gscOk,
      content: <SearchConsoleTab gsc={gsc} gscOk={gscOk} />,
    },
    {
      id: 'ubersuggest',
      label: 'Ubersuggest',
      hasData: ubersuggestOk,
      content: <UbersuggestPanel report={ubersuggest} />,
    },
  ];

  return (
    <div className="animate-fade-in report-detail-page" style={{ maxWidth: '100%', width: '100%' }}>
      {/* Bu satır PDF kökünün dışında: kökten eleman silinmesi sayfa kesme hesabını kaydırır. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
        <Link
          href="/dashboard/reports"
          className="text-muted"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Raporlar
        </Link>
        <ReportPdfButton
          targetId="report-pdf-root"
          fileName={`${client.companyName.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()}-rapor-${since}_${until}.pdf`}
        />
      </div>

      <div id="report-pdf-root">
        <h1 className="heading-1" style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{client.companyName}</h1>

        <div data-pdf-hide style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <StatusBadge label="Analytics" connected={gaOk} />
          <StatusBadge label="Search Console" connected={gscOk} />
          <StatusBadge label="Ubersuggest" connected={ubersuggestOk} />
        </div>

        <div data-pdf-hide style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
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
          Dönem: {periodLabel} ({since} → {until}, {dayCount} gün) · Tüm ülkeler ve tüm cihazlar ·
          Tarih aralığı site trafiği ve Google arama verileri için geçerlidir; SEO aracı verisi anlık görüntü (snapshot) bazlıdır.
        </p>

        <ReportTabs tabs={tabs} />
      </div>
    </div>
  );
}
