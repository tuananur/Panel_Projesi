import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NotesClient from './notes-client';

export default async function ClientNotesPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: {
      notes: {
        include: {
          user: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!client) {
    redirect('/dashboard');
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>İş Takip Listesi</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>{client.companyName} için eklenen özel notlar ve hatırlatıcılar.</p>
        </div>
      </div>

      <NotesClient 
        clientId={client.id} 
        notes={client.notes} 
        currentUserId={session.userId} 
        userRole={session.role}
      />
    </div>
  );
}
