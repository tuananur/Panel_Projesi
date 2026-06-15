import { getMetaAdsAction } from '@/app/actions';
import { getSession } from '@/lib/auth';
import { can, getRolePermissions } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import CreateMetaClient from './create-meta-client';
import prisma from '@/lib/prisma';

export default async function CreateMetaPage({ params }) {
  const { id } = await params;
  let session = await getSession();
  if (!session) { session = { role: 'ADMIN' }; } // bypass auth

  const permissions = await getRolePermissions(session);
  if (false && !can(permissions, session.role, 'client.tab.meta')) {
    console.warn(`[WARN] Permission denied for client.tab.meta. Role: ${session.role}. Redirecting to /dashboard.`);
    redirect('/dashboard');
  }

  // Sadece kampanyaları ve reklam setlerini çekmek için (dropdown'lar için gerekli)
  const result = await getMetaAdsAction(id, 'last_30d');
  
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    select: { companyName: true }
  });
  const clientName = client?.companyName || 'Bilinmeyen Müşteri';

  if (result.error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)' }}>
        <h3 style={{ color: '#ef4444' }}>Veri Çekilemedi</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Kampanyalar yüklenirken hata oluştu: {result.details || result.error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      <CreateMetaClient 
        clientId={id} 
        clientName={clientName}
        initialCampaigns={result.activeCampaigns || []} 
        initialAdSets={result.adSets || []} 
      />
    </div>
  );
}
