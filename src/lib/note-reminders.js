import prisma from '@/lib/prisma';

const REMINDER_BUFFER_MS = 60_000;

export function isFutureReminderTime(date) {
  if (!date || Number.isNaN(date.getTime())) return false;
  return date.getTime() > Date.now() + REMINDER_BUFFER_MS;
}

export function buildNoteReminderPayload(note) {
  const clientPart = note.client?.companyName ? ` (${note.client.companyName})` : '';
  const title = 'Yapılacak hatırlatması';
  const message = note.title
    ? `"${note.title}"${clientPart} için planladığınız zaman geldi.`
    : `Planladığınız not${clientPart} için zaman geldi.`;
  const url = note.clientId
    ? `/dashboard/client/${note.clientId}/notes`
    : '/dashboard/notes';

  return { title, message, url };
}

export async function processDueNoteReminders({ userId = null, createNotification } = {}) {
  if (typeof createNotification !== 'function') {
    throw new Error('createNotification is required');
  }

  const now = new Date();
  const dueNotes = await prisma.note.findMany({
    where: {
      remindAt: { lte: now },
      reminderSentAt: null,
      reminderUserId: userId != null ? userId : { not: null },
    },
    include: {
      client: { select: { id: true, companyName: true } },
    },
    orderBy: { remindAt: 'asc' },
    take: userId != null ? 50 : 200,
  });

  let sent = 0;
  for (const note of dueNotes) {
    const targetUserId = note.reminderUserId;
    if (!targetUserId) continue;

    const { title, message, url } = buildNoteReminderPayload(note);
    await createNotification({
      userId: targetUserId,
      title,
      message,
      url,
      type: 'NOTE_REMINDER',
      dedupeKey: `note-reminder-${note.id}`,
    });

    await prisma.note.update({
      where: { id: note.id },
      data: { reminderSentAt: now },
    });
    sent += 1;
  }

  return { sent, checked: dueNotes.length };
}
