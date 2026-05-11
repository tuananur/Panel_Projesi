import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NotesClient from './notes-client';

function sanitizeNotesForClient(notes) {
  const list = Array.isArray(notes) ? notes : [];
  return list.map((note) => ({
    ...note,
    title: note.title ?? null,
    content: note.content ?? '',
    user: note.user
      ? { ...note.user, username: note.user.username ?? '' }
      : { id: 0, username: 'Bilinmiyor' },
  }));
}

export default async function ClientNotesPage({ params }) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const clientIdNum = parseInt(id, 10);
  if (Number.isNaN(clientIdNum)) {
    console.error('[ClientNotesPage] invalid client id param', { id });
    redirect('/dashboard');
  }

  try {
    const client = await prisma.client.findUnique({
      where: { id: clientIdNum },
      include: {
        notes: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      redirect('/dashboard');
    }

    const notesForClient = sanitizeNotesForClient(client.notes);

    const showDebug =
      process.env.DASHBOARD_ROUTE_DEBUG === '1' && session.role === 'ADMIN';

    return (
      <div className="animate-fade-in">
        {showDebug && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              fontSize: '0.75rem',
              borderRadius: '8px',
              border: '1px dashed var(--border-color)',
              color: 'var(--text-secondary)',
            }}
          >
            <strong>DEBUG</strong> Vercel’de geçici olarak{' '}
            <code>DASHBOARD_ROUTE_DEBUG=1</code> açık; bu panel sadece admin için. Sunucu loglarında da aynı
            istekle ilişkili Prisma hatalarını kontrol edin.
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              İş Takip Listesi
            </h1>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              {client.companyName} için eklenen özel notlar ve hatırlatıcılar.
            </p>
          </div>
        </div>

        <NotesClient
          clientId={client.id}
          notes={notesForClient}
          currentUserId={session.userId}
          userRole={session.role}
        />
      </div>
    );
  } catch (err) {
    console.error('[ClientNotesPage] failed', {
      clientId: clientIdNum,
      message: err?.message,
      name: err?.name,
      stack: err?.stack,
    });
    throw err;
  }
}
