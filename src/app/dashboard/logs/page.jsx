import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Clock, User as UserIcon, Building2, Activity } from 'lucide-react';
import LogClient from './log-client';

export const metadata = {
  title: 'Sistem Logları | Dashboard',
};

export default async function LogsPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const logs = await prisma.activityLog.findMany({
    include: {
      user: true,
      client: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'CREATE': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'UPDATE': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'DELETE': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'TOGGLE': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="animate-fade-in">
      <LogClient latestId={logs[0]?.id} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Sistem Logları</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Panel üzerinde yapılan son 100 aktivite listelenmektedir.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', width: '35%' }}>Kullanıcı / İşlem</th>
                <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>Müşteri / Detay</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const badge = getActionBadgeColor(log.action);
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '0.4rem 0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                            <UserIcon size={8} style={{ opacity: 0.7 }} />
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>{log.user.username}</div>
                        </div>
                        <span style={{ 
                          padding: '1px 4px', 
                          borderRadius: '3px', 
                          fontSize: '0.55rem', 
                          fontWeight: 800, 
                          background: badge.bg, 
                          color: badge.color,
                          width: 'fit-content'
                        }}>
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.4rem 0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        {log.client && (
                          <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {log.client.companyName}
                          </div>
                        )}
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                          {log.details}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '4rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                      <Activity size={48} style={{ opacity: 0.1 }} />
                      <p>Henüz herhangi bir aktivite kaydedilmedi.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
