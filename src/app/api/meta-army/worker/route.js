import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

function getBearerToken(req) {
  const auth = req.headers.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  return req.headers.get('x-meta-army-secret')?.trim() || '';
}

function assertWorkerAuth(req) {
  const expected = process.env.META_ARMY_WORKER_SECRET;
  if (!expected) {
    return { ok: false, status: 503, body: { success: false, error: 'WORKER_SECRET_NOT_CONFIGURED' } };
  }

  const received = getBearerToken(req);
  if (!received || received !== expected) {
    return { ok: false, status: 401, body: { success: false, error: 'UNAUTHORIZED' } };
  }

  return { ok: true };
}

function parseJson(value, fallback = null) {
  if (!value) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function normalizeLimit(value, fallback = 3, max = 10) {
  const parsed = Number(value || fallback);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
}

async function claimCommands(limit) {
  const queued = await prisma.metaArmyCommand.findMany({
    where: { status: 'QUEUED' },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    take: limit * 3,
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
          metaEnabled: true,
          metaAdAccountId: true,
          metaAccessToken: true,
        }
      },
      runs: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      }
    }
  });

  const claimed = [];

  for (const command of queued) {
    if (claimed.length >= limit) break;

    const updated = await prisma.metaArmyCommand.updateMany({
      where: { id: command.id, status: 'QUEUED' },
      data: { status: 'IN_PROGRESS' }
    });

    if (updated.count !== 1) continue;

    const existingRun = command.runs?.[0];
    const run = existingRun
      ? await prisma.metaArmyRun.update({
          where: { id: existingRun.id },
          data: {
            status: 'RUNNING',
            startedAt: new Date(),
            summary: existingRun.summary || 'Meta Ads Army worker tarafından işleniyor.',
          }
        })
      : await prisma.metaArmyRun.create({
          data: {
            clientId: command.clientId,
            commandId: command.id,
            agentName: 'meta-ads-orchestrator',
            status: 'RUNNING',
            startedAt: new Date(),
            summary: 'Meta Ads Army worker tarafından işleniyor.',
          }
        });

    claimed.push({
      id: command.id,
      command: command.command,
      priority: command.priority,
      source: command.source,
      requestedBy: command.requestedBy,
      createdAt: command.createdAt,
      runId: run.id,
      client: {
        id: command.client.id,
        companyName: command.client.companyName,
        metaEnabled: command.client.metaEnabled,
        metaAdAccountId: command.client.metaAdAccountId,
        metaAccessToken: command.client.metaAccessToken,
        hasAccessToken: !!command.client.metaAccessToken,
      }
    });
  }

  return claimed;
}

async function addFindings(clientId, runId, findings = []) {
  const safeFindings = Array.isArray(findings) ? findings : [findings];
  if (safeFindings.length === 0) return [];

  return prisma.metaArmyFinding.createMany({
    data: safeFindings.map((finding) => ({
      clientId,
      runId,
      severity: finding.severity || 'INFO',
      category: finding.category || 'PERFORMANCE',
      title: finding.title || 'Meta Ads Army bulgusu',
      details: finding.details || '',
      evidence: finding.evidence || null,
      metricsJson: finding.metricsJson ? JSON.stringify(parseJson(finding.metricsJson, finding.metricsJson)) : null,
    }))
  });
}

async function addRecommendations(clientId, runId, recommendations = []) {
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [recommendations];
  if (safeRecommendations.length === 0) return [];

  return prisma.metaArmyRecommendation.createMany({
    data: safeRecommendations.map((recommendation) => ({
      clientId,
      runId,
      actionType: recommendation.actionType || 'INVESTIGATE',
      status: recommendation.status || 'PENDING_APPROVAL',
      title: recommendation.title || 'Meta Ads Army önerisi',
      details: recommendation.details || '',
      expectedImpact: recommendation.expectedImpact || null,
      riskLevel: recommendation.riskLevel || 'MEDIUM',
      actionPayload: recommendation.actionPayload ? JSON.stringify(parseJson(recommendation.actionPayload, recommendation.actionPayload)) : null,
    }))
  });
}

async function completeCommand(body) {
  const commandId = Number(body.commandId);
  const runId = Number(body.runId);
  if (!commandId || !runId) return { success: false, error: 'commandId and runId are required' };

  const status = body.status === 'FAILED' ? 'FAILED' : 'COMPLETED';
  const commandStatus = status === 'FAILED' ? 'FAILED' : 'COMPLETED';

  const run = await prisma.metaArmyRun.update({
    where: { id: runId },
    data: {
      status,
      summary: body.summary || null,
      rawOutput: body.rawOutput ? JSON.stringify(parseJson(body.rawOutput, body.rawOutput)) : null,
      completedAt: new Date(),
    }
  });

  const command = await prisma.metaArmyCommand.update({
    where: { id: commandId },
    data: {
      status: commandStatus,
      result: body.result || body.summary || null,
    }
  });

  return { success: true, command, run };
}

export async function GET(req) {
  const auth = assertWorkerAuth(req);
  if (!auth.ok) return json(auth.body, auth.status);

  return json({
    success: true,
    service: 'meta-army-worker',
    actions: ['claim', 'add_findings', 'add_recommendations', 'complete', 'fail'],
  });
}

export async function POST(req) {
  const auth = assertWorkerAuth(req);
  if (!auth.ok) return json(auth.body, auth.status);

  let body = {};
  try {
    body = await req.json();
  } catch (error) {
    return json({ success: false, error: 'INVALID_JSON' }, 400);
  }

  try {
    switch (body.action) {
      case 'claim': {
        const claimed = await claimCommands(normalizeLimit(body.limit));
        return json({ success: true, commands: claimed });
      }
      case 'add_findings': {
        const clientId = Number(body.clientId);
        const runId = Number(body.runId);
        if (!clientId || !runId) return json({ success: false, error: 'clientId and runId are required' }, 400);
        const result = await addFindings(clientId, runId, body.findings || []);
        return json({ success: true, result });
      }
      case 'add_recommendations': {
        const clientId = Number(body.clientId);
        const runId = Number(body.runId);
        if (!clientId || !runId) return json({ success: false, error: 'clientId and runId are required' }, 400);
        const result = await addRecommendations(clientId, runId, body.recommendations || []);
        return json({ success: true, result });
      }
      case 'complete': {
        const result = await completeCommand(body);
        return json(result, result.success ? 200 : 400);
      }
      case 'fail': {
        const result = await completeCommand({ ...body, status: 'FAILED' });
        return json(result, result.success ? 200 : 400);
      }
      default:
        return json({ success: false, error: 'UNKNOWN_ACTION' }, 400);
    }
  } catch (error) {
    console.error('Meta Army worker API failed:', error);
    return json({ success: false, error: 'WORKER_API_FAILED', details: error.message }, 500);
  }
}
