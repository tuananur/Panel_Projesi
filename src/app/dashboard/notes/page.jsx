import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NotesPageClient from './notes-page-client';
import { can, getRolePermissions } from '@/lib/permissions';

export const metadata = {
  title: 'Kişisel Notlar | Dashboard',
};

export default async function NotesPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const permissions = await getRolePermissions();
  if (!can(permissions, session.role, 'page.notes')) {
    redirect('/dashboard');
  }

  // Genel notlar (clientId yok): herkes yalnızca kendi notlarını görür (admin dahil).
  // Müşteriye özel notlar: admin tüm kullanıcıları, diğer roller yalnızca kendini görür.
  const notes = await prisma.note.findMany({
    where:
      session.role === 'ADMIN'
        ? {
            OR: [
              { clientId: null, userId: session.userId },
              { clientId: { not: null } },
            ],
          }
        : { userId: session.userId },
    include: {
      client: {
        select: { id: true, companyName: true }
      },
      user: {
        select: { id: true, username: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch all clients for the selection dropdown
  const clients = await prisma.client.findMany({
    select: { id: true, companyName: true },
    orderBy: { companyName: 'asc' }
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Kişisel Notlar</h1>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Genel notlar yalnızca size özeldir. Müşteriye özel notlarda yöneticiler ekibin tümünü görebilir; diğer roller yalnızca kendi notlarını görür.
        </p>
      </div>

      <NotesPageClient 
        initialNotes={notes} 
        clients={clients} 
        currentUserId={session.userId} 
        userRole={session.role}
      />
    </div>
  );
}
