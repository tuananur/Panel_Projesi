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

  const gaOk = Boolean(result?.success);
  const gsc = result?.searchConsole || null;
  const gscOk = Boolean(gsc && !gsc.error);

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
        Dönem: {periodLabel} ({since} → {until}, {dayCount} gün)
      </p>

      {!gaOk && (
        <Section title="Google Analytics">
          <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}>
            {!analyticsConfigured
              ? 'Analytics bağlantısı yapılandırılmamış (GA4 mülk kimliği eksik).'
              : result?.details || 'Analytics verileri alınamadı.'}
          </p>
        </Section>
      )}

      {gaOk && (
        <>
          <Section title="Google Analytics — Özet">
            <Row label="Tekil ziyaretçi (aktif kullanıcı)" value={num(result.summary.activeUsers)} />
            <Row label="Sayfa görüntüleme" value={num(result.summary.pageViews)} />
            <Row label="Oturum" value={num(result.summary.sessions)} />
            <Row label="Hemen çıkma oranı" value={`${result.summary.bounceRate}%`} />
            <Row label="Ort. etkileşim süresi" value={result.summary.avgEngagementTime} />
            <Row label="Etkinlik sayısı" value={num(result.summary.eventCount)} />
          </Section>

          {result.deviceBreakdown?.length > 0 && (
            <Section title="Cihaz Dağılımı">
              {result.deviceBreakdown.map((item) => (
                <Row key={item.name} label={item.name} value={`${num(item.count)} kullanıcı (%${item.percentage})`} />
              ))}
            </Section>
          )}

          {result.trafficSources?.length > 0 && (
            <Section title="Erişim Kanalları">
              {result.trafficSources.map((item) => (
                <Row key={item.name} label={item.name} value={`${num(item.count)} kullanıcı (%${item.percentage})`} />
              ))}
            </Section>
          )}

          {result.countryBreakdown?.length > 0 && (
            <Section title="Ülke Dağılımı">
              {result.countryBreakdown.map((item) => (
                <Row key={item.name} label={item.name} value={`${num(item.count)} kullanıcı (%${item.percentage})`} />
              ))}
            </Section>
          )}

          {result.browserBreakdown?.length > 0 && (
            <Section title="Tarayıcı Dağılımı">
              {result.browserBreakdown.map((item) => (
                <Row key={item.name} label={item.name} value={`${num(item.count)} oturum (%${item.percentage})`} />
              ))}
            </Section>
          )}

          {result.topPages?.length > 0 && (
            <Section title="En Çok Ziyaret Edilen Sayfalar">
              {result.topPages.map((page) => (
                <Row
                  key={page.path}
                  label={`${page.title} — ${page.path}`}
                  value={`${num(page.views)} görüntüleme · ${num(page.users)} kullanıcı · ${page.time}`}
                />
              ))}
            </Section>
          )}

          {result.dailyActiveUsers?.length > 0 && (
            <Section title="Günlük Döküm">
              {result.dailyActiveUsers.map((day) => (
                <Row
                  key={day.rawDate}
                  label={day.date}
                  value={`${num(day.users)} kullanıcı · ${num(day.pageViews)} görüntüleme · ${num(day.sessions)} oturum`}
                />
              ))}
            </Section>
          )}
        </>
      )}

      {!gscOk && (
        <Section title="Google Search Console">
          <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}>
            {gsc?.details || 'Search Console bağlantısı yapılandırılmamış.'}
          </p>
        </Section>
      )}

      {gscOk && (
        <>
          <Section title="Google Search Console — Özet" note={`${gsc.siteUrl} · ${gsc.periodLabel}`}>
            <Row label="Toplam tıklama" value={num(gsc.summary.clicks)} />
            <Row label="Toplam gösterim" value={num(gsc.summary.impressions)} />
            <Row label="Ortalama CTR" value={`${gsc.summary.ctr}%`} />
            <Row label="Ortalama pozisyon" value={gsc.summary.position} />
            <Row label="Anahtar kelime sayısı" value={num(gsc.totalKeywords)} />
          </Section>

          {gsc.keywords?.length > 0 && (
            <Section title="Anahtar Kelimeler">
              {gsc.keywords.map((kw) => (
                <Row
                  key={kw.keyword}
                  label={kw.keyword}
                  value={`${num(kw.clicks)} tıklama · ${num(kw.impressions)} gösterim · ${kw.ctr}% CTR · ${kw.position}. sıra`}
                />
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  );
}
