import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NotesPageClient from './notes-page-client';

export const metadata = {
  title: 'Kişisel Notlar | Dashboard',
};

export default async function NotesPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Fetch notes: All for Admin, only own for others
  const notes = await prisma.note.findMany({
    where: session.role === 'ADMIN' ? {} : { userId: session.userId },
    include: {
      client: {
        select: { id: true, companyName: true }
      },
      user: {
        select: { username: true }
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
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>Genel ve müşteriye özel notlarınızı buradan yönetebilirsiniz.</p>
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
