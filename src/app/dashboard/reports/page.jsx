import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can, getRolePermissions } from '@/lib/permissions';
import { StatusBadge } from './report-ui';
import ReportRowLink from './report-row-link';

export const metadata = {
  title: 'Raporlar | Dashboard',
};

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const session = await getSession();
  const permissions = await getRolePermissions(session);
  if (!session || !can(permissions, session.role, 'page.reports')) {
    redirect('/dashboard');
  }

  const [globalSetting, clients, ubersuggestGroups] = await Promise.all([
    prisma.setting.findUnique({ where: { key: 'google_analytics_global_config' } }),
    prisma.client.findMany({
      orderBy: { companyName: 'asc' },
      select: {
        id: true,
        companyName: true,
        website: true,
        analyticsEnabled: true,
        analyticsPropertyId: true,
        analyticsRefreshToken: true,
        searchConsoleSiteUrl: true,
      },
    }),
    prisma.seoUbersuggestSnapshot.groupBy({
      by: ['clientId'],
      _count: { _all: true },
      _max: { snapshotDate: true },
    }),
  ]);

  let globalConfig = {};
  try {
    globalConfig = globalSetting ? JSON.parse(globalSetting.value || '{}') : {};
  } catch {
    globalConfig = {};
  }
  const hasOAuthApp = Boolean(globalConfig.clientId && globalConfig.clientSecret);

  const ubersuggestByClient = new Map(ubersuggestGroups.map((group) => [group.clientId, group]));
  const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const rows = clients.map((client) => {
    const hasToken = hasOAuthApp && Boolean(client.analyticsRefreshToken || globalConfig.refreshToken);
    const ubersuggest = ubersuggestByClient.get(client.id);
    return {
      id: client.id,
      companyName: client.companyName,
      analyticsConnected: hasToken && client.analyticsEnabled && Boolean(client.analyticsPropertyId),
      searchConsoleConnected: hasToken && Boolean(client.searchConsoleSiteUrl || client.website),
      ubersuggestConnected: Boolean(ubersuggest),
      ubersuggestNote: ubersuggest
        ? `${ubersuggest._count._all} snapshot · son ${dateFmt.format(new Date(ubersuggest._max.snapshotDate))}`
        : null,
    };
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Raporlar</h1>
        <p className="text-muted">
          Müşterilerin Google Analytics, Search Console ve Ubersuggest bağlantı durumu. Detay için bir müşteriye
          tıklayın.
        </p>
      </div>

      {!hasOAuthApp && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            borderColor: 'rgba(239, 68, 68, 0.35)',
            background: 'rgba(239, 68, 68, 0.08)',
          }}
        >
          <strong style={{ color: '#ef4444' }}>Google OAuth ayarları eksik.</strong>{' '}
          <span className="text-muted">
            Ayarlar → Google Analytics bölümünden Client ID, Client Secret ve Refresh Token girilmeli.
          </span>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {rows.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center' }} className="text-muted">
            Kayıtlı müşteri yok.
          </div>
        )}

        {rows.map((row, index) => (
          <ReportRowLink key={row.id} href={`/dashboard/reports/${row.id}`} isFirst={index === 0}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: 'block',
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.companyName}
              </span>
              {row.ubersuggestNote && (
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{row.ubersuggestNote}</span>
              )}
            </span>
            <StatusBadge label="Analytics" connected={row.analyticsConnected} />
            <StatusBadge label="Search Console" connected={row.searchConsoleConnected} />
            <StatusBadge label="Ubersuggest" connected={row.ubersuggestConnected} />
          </ReportRowLink>
        ))}
      </div>
    </div>
  );
}
