import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ASSIGNABLE_ROLE_OPTIONS, can, getRoleAssignableRoles, getRolePermissions } from '@/lib/permissions';
import WorkItemsClient from './work-items-client';

export const metadata = {
  title: 'İş Takip | Dashboard',
};

function isWorkManagerRole(role) {
  return role === 'ADMIN' || role === 'DESIGNER_MANAGER' || role === 'ADVERTISER_MANAGER';
}


function visibleWhere(session) {
  if (session.role === 'ADMIN') return {};
  const ownVisibility = [
    { assigneeId: session.userId },
    { createdById: session.userId },
  ];
  if (isWorkManagerRole(session.role)) {
    ownVisibility.push({ assignee: { managerId: session.userId } });
  }
  return { OR: ownVisibility };
}

function serialize(value) {
  return JSON.parse(JSON.stringify(value));
}

export default async function WorkItemsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const permissions = await getRolePermissions(session);
  if (!can(permissions, session.role, 'page.work_items')) redirect('/dashboard');

  const assignmentMatrix = await getRoleAssignableRoles();
  const assignableRoleKeys = session.role === 'ADMIN'
    ? ASSIGNABLE_ROLE_OPTIONS.map((role) => role.key)
    : assignmentMatrix?.[session.role] || [];

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
    assignableRoleKeys.length > 0
      ? prisma.user.findMany({
          where: { id: { not: session.userId }, role: { in: assignableRoleKeys } },
          select: { id: true, username: true, role: true, managerId: true },
          orderBy: [{ role: 'asc' }, { username: 'asc' }],
        })
      : [],
  ]);

  return (
    <WorkItemsClient
      initialItems={serialize(items)}
      clients={serialize(clients)}
      assignableUsers={serialize(assignableUsers)}
      session={{ userId: session.userId, username: session.username, role: session.role }}
      canAssign={assignableRoleKeys.length > 0}
    />
  );
}
