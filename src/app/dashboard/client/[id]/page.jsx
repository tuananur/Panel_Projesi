import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { can, getRolePermissions } from '@/lib/permissions';

function parseJSONSafe(value, fallback) {
  try {
    return JSON.parse(value || fallback);
  } catch {
    return JSON.parse(fallback);
  }
}

export default async function ClientDetailPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) }
  });

  if (!client) redirect('/dashboard');

  const services = parseJSONSafe(client.services, '[]');
  const permissions = await getRolePermissions();

  if (can(permissions, session.role, 'client.tab.stats')) {
    redirect(`/dashboard/client/${id}/stats`);
  }

  if (services.includes('SEO') && can(permissions, session.role, 'client.tab.seo')) {
    redirect(`/dashboard/client/${id}/seo`);
  }

  if (services.includes('Sosyal Medya') && can(permissions, session.role, 'client.tab.social')) {
    redirect(`/dashboard/client/${id}/social`);
  }

  if (can(permissions, session.role, 'client.tab.meta')) {
    redirect(`/dashboard/client/${id}/meta`);
  }

  if (can(permissions, session.role, 'client.tab.notes')) {
    redirect(`/dashboard/client/${id}/notes`);
  }

  if (can(permissions, session.role, 'client.tab.dev')) {
    redirect(`/dashboard/client/${id}/dev`);
  }

  if (can(permissions, session.role, 'client.tab.settings')) {
    redirect(`/dashboard/client/${id}/settings`);
  }

  redirect('/dashboard');
}
