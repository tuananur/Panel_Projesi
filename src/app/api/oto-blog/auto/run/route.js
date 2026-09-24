import { after, NextResponse } from 'next/server';
import { RUN_HEADER, claimNextQueued, continueAutoJob } from '@/lib/oto-blog-auto';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request) {
  const token = String(request.headers.get(RUN_HEADER) || '').trim();
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const jobId = Number(body.jobId);
  if (!token || !jobId) return NextResponse.json({ ok: false }, { status: 400 });

  after(async () => {
    const deadline = Date.now() + 270000;
    let currentId = jobId;
    let currentToken = token;
    let clientId = null;

    while (Date.now() < deadline - 8000) {
      const slice = Math.min(50000, deadline - Date.now() - 8000);
      const result = await continueAutoJob(currentId, currentToken, slice);
      clientId = result.clientId || clientId;
      if (result.blocked || !result.ok) return;
      if (!result.done) continue;
      if (!clientId) return;
      const next = await claimNextQueued(clientId);
      if (!next) return;
      currentId = next.id;
      currentToken = next.continueToken;
    }
  });

  return NextResponse.json({ ok: true, accepted: true });
}
