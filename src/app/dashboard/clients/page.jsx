import prisma from '@/lib/prisma';
import CreateClientForm from './create-client-form';
import ClientsList from './clients-list';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { can, getRolePermissions } from '@/lib/permissions';

export const metadata = {
  title: 'Müşteriler | Dashboard',
};

export default async function ClientsPage() {
  const session = await getSession();

  const permissions = await getRolePermissions(session);
  if (!session || !can(permissions, session.role, 'page.clients')) {
    redirect('/dashboard');
  }

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      companyName: true,
      contactName: true,
      email: true,
      phone: true,
      website: true,
      services: true,
      createdAt: true,
    },
  });

  const clientsForClient = clients.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: 0 }}>Müşteri Yönetimi</h1>
      </div>

      <div className="responsive-flex" style={{ gap: '2rem', alignItems: 'start' }}>
        <div className="card" style={{ flex: 1, minWidth: 0 }}>
          <h2 className="heading-2" style={{ fontSize: '1.25rem' }}>Mevcut Müşteriler</h2>
          <ClientsList clients={clientsForClient} />
        </div>

        <div className="card" style={{ width: '100%', maxWidth: '350px', flexShrink: 0 }}>
          <h2 className="heading-2" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Yeni Müşteri Ekle</h2>
          <CreateClientForm />
        </div>
      </div>
    </div>
  );
}
