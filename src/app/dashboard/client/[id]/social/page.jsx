import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import SocialCalendar from './social-calendar';

export default async function SocialPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  
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

  const socialAccounts = JSON.parse(client.socialAccounts || '{}');
  const socialSchedule = JSON.parse(client.socialSchedule || '{}');
  const activePlatforms = Object.keys(socialAccounts).filter(p => socialAccounts[p]);

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
