import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsForm from './settings-form';
import { can, getRolePermissions } from '@/lib/permissions';

export default async function SettingsPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const permissions = await getRolePermissions();
  if (!can(permissions, session.role, 'client.tab.settings')) {
    redirect('/dashboard');
  }
  
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) }
  });

  if (!client) return null;

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="heading-2" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Hizmet Ayarları</h2>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Bu müşteriye özel SEO hedeflerini ve sosyal medya hesaplarını buradan yönetebilirsiniz.
        </p>
      </div>
      
      <SettingsForm client={client} role={session.role} />
    </div>
  );
}
