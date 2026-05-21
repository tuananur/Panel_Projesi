import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { can, getRolePermissions } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

function parseJSONSafe(value, fallback) {
  try {
    return JSON.parse(value || fallback);
  } catch {
    return JSON.parse(fallback);
  }
}

export default async function ClientDetailPage({ params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    
    if (!session) redirect('/login');
    
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) || 0 }
    });

    if (!client) {
      console.warn(`Client with ID ${id} not found. Redirecting to dashboard.`);
      redirect('/dashboard');
    }

    const services = parseJSONSafe(client.services, '[]');
    const permissions = await getRolePermissions(session);
    const role = session.role;
    const hasStatsPermission = can(permissions, role, 'client.tab.stats');

    console.log(`[AUTH_DEBUG] ClientDetailPage: User=${session.username}, Role=${role}, ID=${id}, hasStatsPermission=${hasStatsPermission}`);

    // If we have stats permission, always go there first as it's the primary dashboard
    if (hasStatsPermission) {
      console.log(`[DEBUG] Redirecting to stats for client ${id}`);
      redirect(`/dashboard/client/${id}/stats`);
    }

    if (can(permissions, role, 'client.tab.seo')) {
      redirect(`/dashboard/client/${id}/seo`);
    }

    if (can(permissions, role, 'client.tab.social')) {
      redirect(`/dashboard/client/${id}/social`);
    }

    if (can(permissions, role, 'client.tab.meta')) {
      redirect(`/dashboard/client/${id}/meta`);
    }

    if (can(permissions, role, 'client.tab.google')) {
      redirect(`/dashboard/client/${id}/google`);
    }

    if (can(permissions, role, 'client.tab.analytics')) {
      redirect(`/dashboard/client/${id}/analytics`);
    }

    if (can(permissions, role, 'client.tab.notes')) {
      redirect(`/dashboard/client/${id}/notes`);
    }

    if (can(permissions, role, 'client.tab.dev')) {
      redirect(`/dashboard/client/${id}/dev`);
    }

    console.warn(`[WARN] No tab permissions for role ${role} on client ${id}. Falling back to dashboard.`);
    redirect('/dashboard');
  } catch (error) {
    if (error.digest?.startsWith('NEXT_REDIRECT') || error.message === 'NEXT_REDIRECT') throw error;
    console.error('Client Detail Page Error:', error);
    redirect('/dashboard');
  }
}
