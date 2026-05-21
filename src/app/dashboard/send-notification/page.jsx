import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { can, getRolePermissions } from '@/lib/permissions';
import SendNotificationForm from './send-notification-form';

export const metadata = {
  title: 'Bildirim Gönder | Beyin Atölyesi',
};

export default async function SendNotificationPage() {
  const session = await getSession();
  
  const permissions = await getRolePermissions(session);
  if (!session || !can(permissions, session.role, 'page.send_notifications')) {
    redirect('/dashboard');
  }

  // Fetch all users to display in the recipient selection list
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      role: true,
    },
    orderBy: {
      username: 'asc',
    },
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Bildirim Gönderme Merkezi
        </h1>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Tüm kullanıcılara veya seçtiğiniz kişilere özel başlık, içerik ve yönlendirme linkiyle anlık bildirim gönderin.
        </p>
      </div>

      <SendNotificationForm users={users} />
    </div>
  );
}
