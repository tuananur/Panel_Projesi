import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function ClientDetailPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) }
  });

  if (!client) redirect('/dashboard');

  const services = JSON.parse(client.services || '[]');
  
  // Logic to find first available tab based on role and services
  if (services.includes('SEO') && (session.role === 'ADMIN' || session.role === 'ADVERTISER')) {
    redirect(`/dashboard/client/${id}/seo`);
  }
  
  if (services.includes('Sosyal Medya') && (session.role === 'ADMIN' || session.role === 'ADVERTISER' || session.role === 'DESIGNER')) {
    redirect(`/dashboard/client/${id}/social`);
  }

  if (session.role === 'ADMIN') {
    redirect(`/dashboard/client/${id}/settings`);
  }

  redirect('/dashboard');
}
