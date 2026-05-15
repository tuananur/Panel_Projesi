import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NotesClient from '../notes/notes-client';
import { can, getRolePermissions } from '@/lib/permissions';

const DEV_LABELS = {
  addButton: 'Yazılım Notu Ekle',
  addModalTitle: 'Yazılım Notu Ekle',
  editModalTitle: 'Yazılım Notunu Düzenle',
  searchPlaceholder: 'Yazılım notlarında ara...',
  contentPlaceholder: 'Yapılan iş, deploy notu, açıklama...',
  emptyText: 'Henüz yazılım notu eklenmemiş.',
};

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

export default async function ClientDevPage({ params }) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const clientIdNum = parseInt(id, 10);
  if (Number.isNaN(clientIdNum)) {
    redirect('/dashboard');
  }

  const permissions = await getRolePermissions(session);
  if (!can(permissions, session.role, 'client.tab.dev')) {
    redirect(`/dashboard/client/${id}`);
  }

  const [client, users] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientIdNum },
      include: {
        notes: {
          where: { category: 'DEV' },
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

  const notesForClient = sanitizeNotesForClient(client.notes ?? []);

  return (
    <div className="animate-fade-in">
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
            Yazılım Notları
          </h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            {client.companyName} için yapılan yazılım çalışmaları, hatırlatıcılar ve teknik notlar.
          </p>
        </div>
      </div>

      <NotesClient
        clientId={client.id}
        notes={notesForClient}
        currentUserId={session.userId}
        userRole={session.role}
        users={users}
        category="DEV"
        labels={DEV_LABELS}
      />
    </div>
  );
}
