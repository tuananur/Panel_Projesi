import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StatsContent from './stats-content';
import { can, getRolePermissions } from '@/lib/permissions';
import { getMetaAdsAction, getGoogleAdsAction } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function StatsPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const permissions = await getRolePermissions();
  if (!can(permissions, session.role, 'client.tab.stats')) {
    redirect(`/dashboard/client/${id}`);
  }
  
  const [client, metaResult, googleResult] = await Promise.all([
    prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: { tasks: true }
    }),
    getMetaAdsAction(id, 'last_30d', null, null),
    getGoogleAdsAction(id)
  ]);

  if (!client) return null;

  return (
    <StatsContent client={client} metaResult={metaResult} googleResult={googleResult} />
  );
}
