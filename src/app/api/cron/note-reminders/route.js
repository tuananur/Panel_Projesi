import { NextResponse } from 'next/server';
import { processDueNoteReminders } from '@/lib/note-reminders';
import { NOTE_REMINDER_CRON_SECRET } from '@/lib/cron-secret';
import prisma from '@/lib/prisma';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function createNotification({ userId, title, message, url, type, dedupeKey }) {
  if (!userId) return null;
  try {
    return await prisma.notification.create({
      data: {
        userId: Number(userId),
        title,
        message,
        url,
        type,
        dedupeKey,
      },
    });
  } catch (error) {
    if (error?.code === 'P2002') return null;
    console.error('Note reminder notification error:', error);
    return null;
  }
}

function assertCronAuth(req) {
  const expected = process.env.CRON_SECRET || NOTE_REMINDER_CRON_SECRET;

  const auth = req.headers.get('authorization') || '';
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
  const headerSecret = req.headers.get('x-cron-secret')?.trim() || '';
  const querySecret = req.nextUrl.searchParams.get('secret')?.trim() || '';
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  const received = bearer || headerSecret || querySecret;

  if (received && received === expected) {
    return { ok: true };
  }

  // Vercel cron (env secret yokken) x-vercel-cron header gönderir
  if (isVercelCron && !process.env.CRON_SECRET) {
    return { ok: true };
  }

  if (!received) {
    return { ok: false, status: 401, body: { success: false, error: 'UNAUTHORIZED' } };
  }

  return { ok: false, status: 401, body: { success: false, error: 'UNAUTHORIZED' } };
}

export async function GET(req) {
  const auth = assertCronAuth(req);
  if (!auth.ok) {
    return NextResponse.json(auth.body, { status: auth.status });
  }

  try {
    const result = await processDueNoteReminders({ createNotification });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Note reminders cron failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'NOTE_REMINDERS_FAILED' },
      { status: 500 }
    );
  }
}
