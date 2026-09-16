// Ubersuggest snapshot ingest servisi.
//
// Idempotency: (clientId, domain, snapshotDate, source) tekildir. Aynı gün için ikinci istek
// yeni satır açmaz; ana kaydı günceller ve o snapshot'a bağlı alt kayıtları baştan yazar.
// Farklı snapshotDate değerleri ayrı satır olarak kalır, yani tarihsel seri korunur.
// Tüm yazma işlemleri tek transaction içindedir: ortada hata olursa hiçbir şey kalıcı olmaz.

// Not: Bu modül test scriptlerinden saf Node ile de import edilebildiği için
// '@/...' alias'ı yerine relative yol kullanır.
import prisma from '../prisma.js';
import { UBERSUGGEST_SOURCE } from './validate-snapshot.js';

const CHUNK_SIZE = 1000;
// Binlerce satırlık payload'lar Prisma'nın 5 sn'lik varsayılan transaction limitini aşabilir.
const TRANSACTION_OPTIONS = { maxWait: 20_000, timeout: 180_000 };

export class UbersuggestIngestError extends Error {
  constructor(message, { status = 400, code = 'INGEST_ERROR' } = {}) {
    super(message);
    this.name = 'UbersuggestIngestError';
    this.status = status;
    this.code = code;
  }
}

async function createInChunks(delegate, rows, snapshotId) {
  if (rows.length === 0) return 0;
  let written = 0;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE).map((row) => ({ ...row, snapshotId }));
    const result = await delegate.createMany({ data: chunk });
    written += result.count ?? chunk.length;
  }
  return written;
}

export async function ingestUbersuggestSnapshot(validated) {
  const { snapshot, children, project } = validated;

  const client = await prisma.client.findUnique({
    where: { id: snapshot.clientId },
    select: { id: true },
  });
  if (!client) {
    throw new UbersuggestIngestError(`clientId ${snapshot.clientId} bulunamadı`, {
      status: 404,
      code: 'CLIENT_NOT_FOUND',
    });
  }

  return prisma.$transaction(async (tx) => {
    const { clientId, domain, snapshotDate, source, ...snapshotMetrics } = snapshot;

    const record = await tx.seoUbersuggestSnapshot.upsert({
      where: {
        clientId_domain_snapshotDate_source: {
          clientId,
          domain,
          snapshotDate,
          source: UBERSUGGEST_SOURCE,
        },
      },
      create: { clientId, domain, snapshotDate, source: UBERSUGGEST_SOURCE, ...snapshotMetrics },
      update: snapshotMetrics,
      select: { id: true },
    });

    const snapshotId = record.id;

    // Alt kayıtlar snapshot'a aittir; yeniden gönderimde eski içerik tamamen değiştirilir.
    // auditIssueUrls, auditIssues silinince cascade ile temizlenir.
    await Promise.all([
      tx.seoUbersuggestDomainHistory.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestKeyword.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestRankTracking.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestAveragePosition.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestTopPage.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestCompetitor.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestBacklink.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestAnchorText.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestLinkingDomain.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestBacklinkOpportunity.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestAuditIssue.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestOpportunity.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestPagespeed.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestAiProvider.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestAiCompetitor.deleteMany({ where: { snapshotId } }),
      tx.seoUbersuggestAiIntent.deleteMany({ where: { snapshotId } }),
    ]);

    const saved = {
      domainHistory: await createInChunks(tx.seoUbersuggestDomainHistory, children.domainHistory, snapshotId),
      keywords: await createInChunks(tx.seoUbersuggestKeyword, children.keywords, snapshotId),
      rankTracking: await createInChunks(tx.seoUbersuggestRankTracking, children.rankTracking, snapshotId),
      averagePositions: await createInChunks(tx.seoUbersuggestAveragePosition, children.averagePositions, snapshotId),
      topPages: await createInChunks(tx.seoUbersuggestTopPage, children.topPages, snapshotId),
      competitors: await createInChunks(tx.seoUbersuggestCompetitor, children.competitors, snapshotId),
      backlinks: await createInChunks(tx.seoUbersuggestBacklink, children.backlinks, snapshotId),
      anchorTexts: await createInChunks(tx.seoUbersuggestAnchorText, children.anchorTexts, snapshotId),
      linkingDomains: await createInChunks(tx.seoUbersuggestLinkingDomain, children.linkingDomains, snapshotId),
      backlinkOpportunities: await createInChunks(
        tx.seoUbersuggestBacklinkOpportunity,
        children.backlinkOpportunities,
        snapshotId,
      ),
      opportunities: await createInChunks(tx.seoUbersuggestOpportunity, children.opportunities, snapshotId),
      pagespeed: await createInChunks(tx.seoUbersuggestPagespeed, children.pagespeed, snapshotId),
      aiProviders: await createInChunks(tx.seoUbersuggestAiProvider, children.aiProviders, snapshotId),
      aiCompetitors: await createInChunks(tx.seoUbersuggestAiCompetitor, children.aiCompetitors, snapshotId),
      aiIntents: await createInChunks(tx.seoUbersuggestAiIntent, children.aiIntents, snapshotId),
      auditIssues: 0,
      auditIssueUrls: 0,
    };

    // Audit issue'lar iki seviyeli: createMany id döndürmediği için tek tek nested yazılır.
    for (const { affectedUrls, ...issue } of children.auditIssues) {
      await tx.seoUbersuggestAuditIssue.create({
        data: {
          ...issue,
          snapshotId,
          affectedUrls: affectedUrls.length > 0 ? { createMany: { data: affectedUrls } } : undefined,
        },
        select: { id: true },
      });
      saved.auditIssues += 1;
      saved.auditIssueUrls += affectedUrls.length;
    }

    let projectId = null;
    if (project) {
      const { locations, competitors, clientId: projectClientId, ubersuggestProjectId, ...projectFields } = project;
      const projectRecord = await tx.seoUbersuggestProject.upsert({
        where: {
          clientId_ubersuggestProjectId: {
            clientId: projectClientId,
            ubersuggestProjectId,
          },
        },
        create: { clientId: projectClientId, ubersuggestProjectId, ...projectFields },
        update: projectFields,
        select: { id: true },
      });
      projectId = projectRecord.id;

      await Promise.all([
        tx.seoUbersuggestProjectLocation.deleteMany({ where: { projectId } }),
        tx.seoUbersuggestProjectCompetitor.deleteMany({ where: { projectId } }),
      ]);

      if (locations.length > 0) {
        await tx.seoUbersuggestProjectLocation.createMany({
          data: locations.map((row) => ({ ...row, projectId })),
        });
      }
      if (competitors.length > 0) {
        await tx.seoUbersuggestProjectCompetitor.createMany({
          data: competitors.map((row) => ({ ...row, projectId })),
        });
      }
      saved.projectLocations = locations.length;
      saved.projectCompetitors = competitors.length;
    }

    return {
      snapshotId,
      projectId,
      domain,
      snapshotDate,
      saved,
    };
  }, TRANSACTION_OPTIONS);
}
