import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { can, getRolePermissions } from '@/lib/permissions';
import WorkItemsClient from './work-items-client';

export const metadata = {
  title: 'İş Takip | Dashboard',
};

function isWorkManagerRole(role) {
  return role === 'ADMIN' || role === 'DESIGNER_MANAGER' || role === 'ADVERTISER_MANAGER';
}

function managedWorkerRoles(role) {
  if (role === 'ADMIN') return ['DESIGNER', 'DESIGNER_MANAGER', 'ADVERTISER', 'ADVERTISER_MANAGER', 'DEVELOPER'];
  if (role === 'DESIGNER_MANAGER') return ['DESIGNER'];
  if (role === 'ADVERTISER_MANAGER') return ['ADVERTISER'];
  return [];
}

function visibleWhere(session) {
  if (session.role === 'ADMIN') return {};
  if (isWorkManagerRole(session.role)) {
    return {
      OR: [
        { assigneeId: session.userId },
        { createdById: session.userId },
        { assignee: { managerId: session.userId } },
      ],
    };
  }
  return { assigneeId: session.userId };
}

function serialize(value) {
  return JSON.parse(JSON.stringify(value));
}

export default async function WorkItemsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const permissions = await getRolePermissions();
  if (!can(permissions, session.role, 'page.work_items')) redirect('/dashboard');

  const [items, clients, assignableUsers] = await Promise.all([
    prisma.workItem.findMany({
      where: visibleWhere(session),
      include: {
        assignee: { select: { id: true, username: true, role: true, managerId: true } },
        createdBy: { select: { id: true, username: true, role: true } },
        approvedBy: { select: { id: true, username: true, role: true } },
        client: { select: { id: true, companyName: true } },
        events: {
          include: { user: { select: { id: true, username: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.client.findMany({ select: { id: true, companyName: true }, orderBy: { companyName: 'asc' } }),
    session.role === 'ADMIN'
      ? prisma.user.findMany({
          where: { id: { not: session.userId } },
          select: { id: true, username: true, role: true, managerId: true },
          orderBy: [{ role: 'asc' }, { username: 'asc' }],
        })
      : isWorkManagerRole(session.role)
        ? prisma.user.findMany({
            where: { managerId: session.userId, role: { in: managedWorkerRoles(session.role) } },
            select: { id: true, username: true, role: true, managerId: true },
            orderBy: { username: 'asc' },
          })
        : [],
  ]);

  return (
    <WorkItemsClient
      initialItems={serialize(items)}
      clients={serialize(clients)}
      assignableUsers={serialize(assignableUsers)}
      session={{ userId: session.userId, username: session.username, role: session.role }}
      canAssign={isWorkManagerRole(session.role)}
    />
  );
}
