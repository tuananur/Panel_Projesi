function workItemVisibilityWhere(session) {
  if (session.role === 'ADMIN') return {};
  const or = [
    { assigneeId: session.userId },
    { createdById: session.userId },
  ];
  if (['DESIGNER_MANAGER', 'ADVERTISER_MANAGER'].includes(session.role)) {
    or.push({ assignee: { managerId: session.userId } });
  }
  return { OR: or };
}

const OPEN_WORK_STATUSES = ['ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED'];

export async function getDashboardTodaySummary(prisma, session) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setHours(23, 59, 59, 999);

  const workWhere = {
    ...workItemVisibilityWhere(session),
    status: { in: OPEN_WORK_STATUSES },
  };

  const [
    overdueWorkItems,
    dueTodayWorkItems,
    overdueCount,
    dueTodayCount,
    pendingApprovalCount,
    unreadNotifications,
    pendingTasks,
    clientsCount,
  ] = await Promise.all([
    prisma.workItem.findMany({
      where: {
        ...workWhere,
        dueDate: { lt: startOfToday },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
        client: { select: { id: true, companyName: true } },
        assignee: { select: { username: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 8,
    }),
    prisma.workItem.findMany({
      where: {
        ...workWhere,
        dueDate: { gte: startOfToday, lte: endOfToday },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
        client: { select: { id: true, companyName: true } },
        assignee: { select: { username: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 8,
    }),
    prisma.workItem.count({
      where: {
        ...workWhere,
        dueDate: { lt: startOfToday },
      },
    }),
    prisma.workItem.count({
      where: {
        ...workWhere,
        dueDate: { gte: startOfToday, lte: endOfToday },
      },
    }),
    prisma.workItem.count({
      where: {
        ...workItemVisibilityWhere(session),
        status: 'SUBMITTED',
      },
    }),
    prisma.notification.count({
      where: { userId: session.userId, readAt: null },
    }),
    prisma.task.count({
      where: { status: false, date: { lte: endOfToday } },
    }),
    prisma.client.count(),
  ]);

  return {
    overdueWorkItems: overdueWorkItems.map(serializeWorkItem),
    dueTodayWorkItems: dueTodayWorkItems.map(serializeWorkItem),
    overdueCount,
    dueTodayCount,
    pendingApprovalCount: pendingApprovalWorkItems,
    unreadNotifications,
    pendingTasks,
    clientsCount,
  };
}

function serializeWorkItem(item) {
  return {
    id: item.id,
    title: item.title,
    status: item.status,
    dueDate: item.dueDate ? item.dueDate.toISOString() : null,
    client: item.client,
    assigneeUsername: item.assignee?.username || null,
  };
}
