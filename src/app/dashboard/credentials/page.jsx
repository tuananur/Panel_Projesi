import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CredentialsTable from './credentials-table';
import { can, getRolePermissions } from '@/lib/permissions';

export const metadata = {
  title: 'Giriş Bilgileri | Dashboard',
};

export default async function CredentialsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const permissions = await getRolePermissions();
  if (!can(permissions, session.role, 'page.credentials')) {
    redirect('/dashboard');
  }

  const clients = await prisma.client.findMany({
    orderBy: { companyName: 'asc' },
    select: {
      id: true,
      companyName: true,
      logoUrl: true,
      website: true,
      socialAccounts: true,
    }
  });

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="heading-1">Giriş Bilgileri</h1>
        <p className="text-muted">Müşterilerinizin sosyal medya hesap bilgilerini buradan yönetebilir ve kopyalayabilirsiniz.</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '0.5rem', fontWeight: 500 }}>
          💡 Düzenlemek için kutucuklara <b>çift tıklayın</b>, kaydetmek için <b>Enter</b>'a basın.
        </p>
      </header>

      <CredentialsTable initialClients={clients} />
    </div>
  );
}
