import { after, NextResponse } from 'next/server';
import {
  RUN_HEADER,
  enqueueAutoJobRun,
  processAutoJobStep,
  resolveAppUrl,
} from '@/lib/oto-blog-auto';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

  const result = await processAutoJobStep(jobId, token);
  if (!result.ok && !result.done) return NextResponse.json(result, { status: 404 });

  if (!result.done) {
    const job = await prisma.otoBlogAutoJob.findUnique({
      where: { id: jobId },
      select: { continueToken: true },
    });
    if (job) {
      const origin = await resolveAppUrl();
      after(() => enqueueAutoJobRun(origin, jobId, job.continueToken));
    }
  }

  return NextResponse.json({ ok: true, phase: result.phase, done: result.done });
}
