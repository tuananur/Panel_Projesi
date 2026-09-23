import { after, NextResponse } from 'next/server';
import {
  RUN_HEADER,
  continueAutoJob,
  enqueueAutoJobRun,
  resolveAppUrl,
} from '@/lib/oto-blog-auto';

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

  const origin = await resolveAppUrl();
  after(async () => {
    const result = await continueAutoJob(jobId, token, 50000);
    if (result.ok && !result.done) {
      await enqueueAutoJobRun(origin, jobId, token);
    }
  });

  return NextResponse.json({ ok: true, accepted: true });
}
