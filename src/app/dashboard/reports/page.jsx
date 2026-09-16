import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Check, X, ChevronRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can, getRolePermissions } from '@/lib/permissions';

export const metadata = {
  title: 'Raporlar | Dashboard',
};

export const dynamic = 'force-dynamic';

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
        whiteSpace: 'nowrap',
      }}
    >
      {connected ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
      {label}
    </span>
  );
}

export default async function ReportsPage() {
  const session = await getSession();
  const permissions = await getRolePermissions(session);
  if (!session || !can(permissions, session.role, 'page.reports')) {
    redirect('/dashboard');
  }

  const [globalSetting, clients] = await Promise.all([
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
  ]);

  let globalConfig = {};
  try {
    globalConfig = globalSetting ? JSON.parse(globalSetting.value || '{}') : {};
  } catch {
    globalConfig = {};
  }
  const hasOAuthApp = Boolean(globalConfig.clientId && globalConfig.clientSecret);

  const rows = clients.map((client) => {
    const hasToken = hasOAuthApp && Boolean(client.analyticsRefreshToken || globalConfig.refreshToken);
    return {
      id: client.id,
      companyName: client.companyName,
      analyticsConnected: hasToken && client.analyticsEnabled && Boolean(client.analyticsPropertyId),
      searchConsoleConnected: hasToken && Boolean(client.searchConsoleSiteUrl || client.website),
    };
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Raporlar</h1>
        <p className="text-muted">
          Müşterilerin Google Analytics ve Search Console bağlantı durumu. Detay için bir müşteriye tıklayın.
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
          <Link
            key={row.id}
            href={`/dashboard/reports/${row.id}`}
            className="report-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 1.25rem',
              borderTop: index === 0 ? 'none' : '1px solid var(--border-color)',
              textDecoration: 'none',
              color: 'var(--text-primary)',
            }}
          >
            <span style={{ flex: 1, minWidth: 0, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.companyName}
            </span>
            <StatusBadge label="Analytics" connected={row.analyticsConnected} />
            <StatusBadge label="Search Console" connected={row.searchConsoleConnected} />
            <ChevronRight size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
