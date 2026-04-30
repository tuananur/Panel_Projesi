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
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Kullanıcı</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>İşlem</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Müşteri</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Detay</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const badge = getActionBadgeColor(log.action);
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                          <UserIcon size={14} style={{ opacity: 0.7 }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{log.user.username}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{log.user.role}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.6rem', 
                        borderRadius: '6px', 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        background: badge.bg, 
                        color: badge.color,
                        border: `1px solid ${badge.color}20`
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {log.client ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                          <Building2 size={14} style={{ color: 'var(--text-secondary)' }} />
                          {log.client.companyName}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                      {log.details}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Clock size={12} />
                        {new Date(log.createdAt).toLocaleString('tr-TR')}
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
