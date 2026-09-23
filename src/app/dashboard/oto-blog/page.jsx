import Link from 'next/link';
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
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Oto Blog</h1>
          <p className="text-muted">Manuel üretim veya siteden gelen tam oto işleri.</p>
        </div>
        <Link href="/dashboard/oto-blog/logs" className="btn btn-primary" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Tam Oto Logs
        </Link>
      </div>
      <OtoBlogClients clients={clients} />
    </div>
  );
}
