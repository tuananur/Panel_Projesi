import { NextResponse } from 'next/server';
import { validateSnapshotPayload } from '@/lib/ubersuggest/validate-snapshot';
import { ingestUbersuggestSnapshot, UbersuggestIngestError } from '@/lib/ubersuggest/ingest';
import { toYmd } from '@/lib/ubersuggest/coerce';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

function getBearerToken(req) {
  const auth = req.headers.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  return req.headers.get('x-ubersuggest-secret')?.trim() || '';
}

function assertIngestAuth(req) {
  const expected = process.env.UBERSUGGEST_INGEST_SECRET;
  if (!expected) {
    return { ok: false, status: 503, body: { success: false, error: 'INGEST_SECRET_NOT_CONFIGURED' } };
  }

  const received = getBearerToken(req);
  if (!received || received !== expected) {
    return { ok: false, status: 401, body: { success: false, error: 'UNAUTHORIZED' } };
  }

  return { ok: true };
}

export async function POST(req) {
  const auth = assertIngestAuth(req);
  if (!auth.ok) return json(auth.body, auth.status);

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: 'INVALID_JSON' }, 400);
  }

  const validation = validateSnapshotPayload(payload);
  if (!validation.ok) {
    return json({ success: false, error: 'VALIDATION_FAILED', details: validation.errors }, 422);
  }

  try {
    const result = await ingestUbersuggestSnapshot(validation.value);
    return json({
      success: true,
      snapshotId: result.snapshotId,
      projectId: result.projectId,
      domain: result.domain,
      snapshotDate: toYmd(result.snapshotDate),
      saved: result.saved,
      // Kimlik alanı (keyword/url/domain) boş olduğu için yazılmayan satır sayıları.
      skipped: validation.value.skipped,
    });
  } catch (error) {
    if (error instanceof UbersuggestIngestError) {
      return json({ success: false, error: error.code, message: error.message }, error.status);
    }
    console.error('[ubersuggest-ingest] snapshot kaydedilemedi:', error);
    return json({ success: false, error: 'INGEST_FAILED', message: error.message }, 500);
  }
}
