import { after, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  INBOUND_HEADER,
  createAutoJob,
  enqueueAutoJobRun,
  findClientByAutoKey,
  readAutoAuthKey,
  resolveAppUrl,
} from '@/lib/oto-blog-auto';
import { parseOtoBlogConfig } from '@/lib/oto-blog';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
  const key = readAutoAuthKey(request);
  if (!key) {
    return NextResponse.json({ ok: false, error: `${INBOUND_HEADER} veya X-POST-KEY gerekli.` }, { status: 401 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON body gerekli.' }, { status: 400 });
  }

  const topic = String(body.topic || '').trim();
  if (!topic) return NextResponse.json({ ok: false, error: 'topic boş.' }, { status: 400 });
  if (topic.length > 2000) return NextResponse.json({ ok: false, error: 'topic çok uzun.' }, { status: 400 });

  const client = await findClientByAutoKey(key);
  if (!client) {
    return NextResponse.json({ ok: false, error: 'Geçersiz anahtar.' }, { status: 401 });
  }

  const config = parseOtoBlogConfig(client.otoBlogConfig, client.website);
  if (!config.postUrl || !config.headerValue) {
    return NextResponse.json({ ok: false, error: 'Müşteri oto blog POST ayarı eksik.' }, { status: 503 });
  }

  const active = await prisma.otoBlogAutoJob.findFirst({
    where: { clientId: client.id, status: { in: ['queued', 'running'] } },
  });
  if (active) {
    return NextResponse.json({ ok: false, error: 'Bu site için zaten bir blog oluşturuluyor.' }, { status: 409 });
  }

  const job = await createAutoJob(client, topic);
  const origin = await resolveAppUrl();
  after(() => enqueueAutoJobRun(origin, job.id, job.continueToken));

  return NextResponse.json({
    ok: true,
    message: 'Sistem bloglarınızı oluşturmaya başladı',
  }, { status: 202 });
}
