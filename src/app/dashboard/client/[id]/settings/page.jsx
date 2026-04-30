import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsForm from './settings-form';

export default async function SettingsPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) }
  });

  if (!client) return null;

  return (
    <div className="animate-fade-in card" style={{ maxWidth: '800px' }}>
      <h2 className="heading-2" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Hizmet Ayarları</h2>
      <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
        Bu müşteriye özel SEO hedeflerini ve sosyal medya hesaplarını buradan yönetebilirsiniz.
      </p>
      
      <SettingsForm client={client} role={session.role} />
    </div>
  );
}
