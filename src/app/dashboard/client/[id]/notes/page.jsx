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
    createdByUser: note.createdByUser
      ? { id: note.createdByUser.id, username: note.createdByUser.username ?? '' }
      : null,
  }));
}

export default async function ClientNotesPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const clientIdNum = parseInt(id, 10);
  if (Number.isNaN(clientIdNum)) {
    console.error('[ClientNotesPage] invalid client id param', { id });
    redirect('/dashboard');
  }

  const debugQuery = sp?.debug === '1';
  const debugEnv = process.env.DASHBOARD_ROUTE_DEBUG === '1';
  const debugEnabled = session.role === 'ADMIN' && (debugQuery || debugEnv);

  try {
    const [client, users] = await Promise.all([
      prisma.client.findUnique({
        where: { id: clientIdNum },
        include: {
          notes: {
            include: {
              user: true,
              createdByUser: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      session.role === 'ADMIN'
        ? prisma.user.findMany({ select: { id: true, username: true }, orderBy: { username: 'asc' } })
        : Promise.resolve([]),
    ]);

    if (!client) {
      redirect('/dashboard');
    }

    const rawNotes = client.notes ?? [];
    const notesForClient = sanitizeNotesForClient(rawNotes);

    let debugSnapshot = null;
    if (debugEnabled) {
      debugSnapshot = {
        generatedAt: new Date().toISOString(),
        route: 'dashboard/client/[id]/notes',
        paramId: id,
        parsedClientId: clientIdNum,
        companyName: client.companyName,
        session: { userId: session.userId, role: session.role },
        flags: { debugQuery, debugEnv, NODE_ENV: process.env.NODE_ENV },
        notesCount: rawNotes.length,
        rawNotesShape: rawNotes.slice(0, 50).map((n) => ({
          id: n.id,
          userId: n.userId,
          clientId: n.clientId,
          hasUser: !!n.user,
          username: n.user?.username ?? null,
          title: n.title ?? null,
          contentType: n.content == null ? 'null/undefined' : typeof n.content,
          contentLength: n.content == null ? null : String(n.content).length,
          createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
        })),
        afterSanitize: {
          notesCount: notesForClient.length,
          firstIds: notesForClient.slice(0, 10).map((n) => n.id),
        },
      };
      console.log('[ClientNotes DEBUG server]', JSON.stringify(debugSnapshot, null, 2));
    }

    return (
      <div className="animate-fade-in">
        {debugEnabled && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              fontSize: '0.75rem',
              borderRadius: '8px',
              border: '1px dashed #f59e0b',
              color: 'var(--text-secondary)',
              background: 'rgba(245, 158, 11, 0.08)',
            }}
          >
            <strong style={{ color: '#f59e0b' }}>DEBUG AKTİF</strong> — Admin + (
            <code>?debug=1</code> veya <code>DASHBOARD_ROUTE_DEBUG=1</code>). Vercel / sunucu loglarında{' '}
            <code>[ClientNotes DEBUG server</code> ile arat. Aşağıda istemci paneli de var.
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
          users={users}
          debugSnapshot={debugSnapshot}
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
