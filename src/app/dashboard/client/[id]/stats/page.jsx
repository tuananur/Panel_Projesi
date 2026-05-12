import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StatsContent from './stats-content';
import { can, getRolePermissions } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export default async function StatsPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const permissions = await getRolePermissions();
  if (!can(permissions, session.role, 'client.tab.stats')) {
    redirect(`/dashboard/client/${id}`);
  }
  
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: {
      tasks: true
    }
  });

  if (!client) return null;

  return (
    <StatsContent client={client} />
  );
}
