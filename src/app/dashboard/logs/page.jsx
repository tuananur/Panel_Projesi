import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogClient from './log-client';
import LogsTable from './logs-table';

export const metadata = {
  title: 'Sistem Logları | Dashboard',
};

export default async function LogsPage() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [logs, users] = await Promise.all([
    prisma.activityLog.findMany({
      include: {
        user: true,
        client: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    }),
    prisma.user.findMany({
      orderBy: { username: 'asc' },
      select: { id: true, username: true },
    }),
  ]);

  const logsForClient = logs.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    details: log.details,
    createdAt: log.createdAt instanceof Date ? log.createdAt.toISOString() : log.createdAt,
    userId: log.userId,
    user: log.user ? { id: log.user.id, username: log.user.username } : null,
    client: log.client ? { id: log.client.id, companyName: log.client.companyName } : null,
  }));

  return (
    <div className="animate-fade-in">
      <LogClient latestId={logs[0]?.id} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Sistem Logları</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Panel üzerinde yapılan son 500 aktivite listelenmektedir. Kullanıcı veya tarih bazlı filtreleyebilirsiniz.
          </p>
        </div>
      </div>

      <LogsTable logs={logsForClient} users={users} />
    </div>
  );
}
