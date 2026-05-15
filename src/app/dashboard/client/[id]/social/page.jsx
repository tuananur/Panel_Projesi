import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SocialCalendar from './social-calendar';
import { can, getRolePermissions } from '@/lib/permissions';

export const revalidate = 0; // Disable cache to see new tasks immediately

function parseJSONSafe(value, fallback) {
  try {
    return JSON.parse(value || fallback);
  } catch {
    return JSON.parse(fallback);
  }
}

function accountUrl(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value === '[object Object]' ? '' : value;
  if (typeof value === 'object' && value !== null) {
    const url = value.url === '[object Object]' ? '' : (value.url || '');
    return String(url);
  }
  return String(value || '');
}

export default async function SocialPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const permissions = await getRolePermissions(session);
  if (!can(permissions, session.role, 'client.tab.social')) {
    redirect('/dashboard');
  }
  
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: {
      tasks: {
        where: { type: 'SOCIAL' },
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!client) return null;

  const socialAccounts = parseJSONSafe(client.socialAccounts, '{}');
  const socialSchedule = parseJSONSafe(client.socialSchedule, '{}');
  const activePlatforms = Object.keys(socialAccounts).filter(p => {
    const hasAccount = accountUrl(socialAccounts[p]).trim() !== '';
    const hasSchedule = socialSchedule[p] && socialSchedule[p].length > 0;
    return hasAccount || hasSchedule;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h2 className="heading-2" style={{ fontSize: '1rem', marginBottom: '0' }}>Sosyal Medya Takvimi</h2>
        <p className="text-muted" style={{ fontSize: '0.75rem' }}>Planlanan paylaşımlar ve özel notlar</p>
      </div>

      <div className="card" style={{ padding: '0.75rem' }}>
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <SocialCalendar 
            clientId={client.id} 
            initialTasks={client.tasks} 
            platforms={activePlatforms}
            schedule={socialSchedule}
            socialAccounts={socialAccounts}
            isAdmin={session.role === 'ADMIN' || session.role === 'ADVERTISER' || session.role === 'DESIGNER'} 
          />
        </Suspense>
      </div>
    </div>
  );
}
