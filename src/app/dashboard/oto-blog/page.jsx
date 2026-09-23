import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can, getRolePermissions } from '@/lib/permissions';
import OtoBlogClients from './oto-blog-clients';

export const metadata = {
  title: 'Oto Blog | Dashboard',
};

export const dynamic = 'force-dynamic';

export default async function OtoBlogPage() {
  const session = await getSession();
  const permissions = await getRolePermissions(session);
  if (!session || !can(permissions, session.role, 'page.oto_blog')) {
    redirect('/dashboard');
  }

  const clients = await prisma.client.findMany({
    orderBy: { companyName: 'asc' },
    select: {
      id: true,
      companyName: true,
      website: true,
      websiteType: true,
      otoBlogConfig: true,
    },
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Oto Blog</h1>
        <p className="text-muted">Müşteri sitelerinin altyapısını buradan seç. Üretim ekranı sonra gelecek.</p>
      </div>
      <OtoBlogClients clients={clients} />
    </div>
  );
}
