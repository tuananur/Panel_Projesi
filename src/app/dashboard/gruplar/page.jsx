import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { can, getRolePermissions } from '@/lib/permissions';
import GroupsClient from './groups-client';

export const metadata = {
  title: 'Gruplar | Beyin Atölyesi',
};

export default async function GroupsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const permissions = await getRolePermissions(session);
  if (!can(permissions, session.role, 'page.groups')) redirect('/dashboard');

  const [groups, clients] = await Promise.all([
    prisma.clientGroup.findMany({
      where: session.role === 'ADMIN' ? {} : { userId: session.userId },
      include: {
        client: { select: { id: true, companyName: true } },
        user: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.client.findMany({
      select: { id: true, companyName: true },
      orderBy: { companyName: 'asc' },
    }),
  ]);

  return (
    <GroupsClient
      initialGroups={groups}
      clients={clients}
      userRole={session.role}
      currentUserId={session.userId}
    />
  );
}
