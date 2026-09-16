// Ubersuggest ingest servisi entegrasyon testi. GERÇEK DB gerektirir.
//
// Çalıştırma (proje kökünden):
//   node test/ubersuggest/ingest.test.mjs
//
// DATABASE_URL ortamdan ya da .env / .env.local dosyasından okunur.
// Test kendi geçici müşterisini ("__ubersuggest_test__") oluşturur ve sonunda siler;
// mevcut müşteri verilerine dokunmaz.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const TEST_DOMAIN = 'ubersuggest-ingest-test.invalid';
const TEST_COMPANY = '__ubersuggest_test__';

function loadEnv() {
  if (process.env.DATABASE_URL) return true;
  for (const file of ['.env.local', '.env']) {
    const full = path.resolve(process.cwd(), file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const value = match[2].replace(/^["']|["']$/g, '');
      if (!process.env[match[1]]) process.env[match[1]] = value;
    }
    if (process.env.DATABASE_URL) return true;
  }
  return Boolean(process.env.DATABASE_URL);
}

if (!loadEnv()) {
  console.error('DATABASE_URL bulunamadı. Ortam değişkeni olarak verin veya .env dosyasına ekleyin.');
  process.exit(1);
}

const { validateSnapshotPayload } = await import('../../src/lib/ubersuggest/validate-snapshot.js');
const { ingestUbersuggestSnapshot } = await import('../../src/lib/ubersuggest/ingest.js');
const prisma = (await import('../../src/lib/prisma.js')).default;

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`  FAIL ${name}`);
    console.log(`       ${error.message}`);
  }
}

function payload(overrides = {}) {
  return {
    clientId: null, // testte doldurulur
    domain: TEST_DOMAIN,
    projectId: 'ubs-test-1',
    snapshotDate: '2026-09-01',
    overview: {
      organicKeywordsCount: 128,
      estimatedOrganicTraffic: 4210.5,
      paidKeywordsCount: 0,
      // estimatedPaidTraffic ve domainAuthority bilinçli olarak yok → null kalmalı
    },
    backlinkOverview: { totalBacklinks: 980, referringDomains: 74, followBacklinks: 800, nofollowBacklinks: 180 },
    siteAudit: { siteHealthScore: 82, crawledPagesCount: 240, brokenPagesCount: 3, totalIssuesCount: 17 },
    domainHistory: [
      { yearMonth: '2026-07', estimatedOrganicTraffic: 3900, organicKeywordsCount: 120 },
      { yearMonth: '2026-08', estimatedOrganicTraffic: 4100, organicKeywordsCount: 124 },
    ],
    keywords: [
      { keyword: 'test keyword a', currentPosition: 4, searchVolume: 1300, rankingUrl: `https://${TEST_DOMAIN}/a` },
      { keyword: 'test keyword b', currentPosition: null, searchVolume: null, rankingUrl: `https://${TEST_DOMAIN}/b` },
    ],
    rankTracking: {
      summary: { trackedKeywordsCount: 2, keywordsUpCount: 1, keywordsDownCount: 0 },
      items: [
        { keyword: 'test keyword a', device: 'desktop', oldPosition: 6, newPosition: 4, positionChange: 2 },
        { keyword: 'test keyword b', device: 'mobile', oldPosition: null, newPosition: null },
      ],
    },
    averagePositions: [
      { date: '2026-08-30', averagePosition: 12.4 },
      { date: '2026-08-31', averagePosition: 11.9 },
    ],
    topPages: [{ url: `https://${TEST_DOMAIN}/a`, pageTitle: 'A', estimatedOrganicTraffic: 500 }],
    competitors: [{ competitorDomain: 'rakip-test.invalid', commonKeywordCount: 12 }],
    backlinks: [{ sourceUrl: 'https://kaynak-test.invalid/yazi', targetUrl: `https://${TEST_DOMAIN}/a`, followStatus: 'follow' }],
    anchorTexts: [{ anchorText: 'test anchor', externalRootDomains: 3, externalPages: 9 }],
    newLinkingDomains: [{ referringDomain: 'yeni-test.invalid', detectedDate: '2026-08-20' }],
    lostLinkingDomains: [{ referringDomain: 'giden-test.invalid' }],
    backlinkOpportunities: [{ referringDomain: 'firsat-test.invalid', competitorDomain: 'rakip-test.invalid', linksToUs: 0 }],
    auditIssues: [
      {
        issueId: 'missing_meta_description',
        issueCategory: 'warning',
        issueLevel: 'page',
        issueCount: 2,
        seoImpact: 'medium',
        difficulty: 'easy',
        affectedUrls: [
          { url: `https://${TEST_DOMAIN}/a`, httpStatus: 200 },
          { url: `https://${TEST_DOMAIN}/b`, httpStatus: 200 },
        ],
      },
    ],
    opportunities: {
      summary: { newContentOpportunityCount: 4, quickWinOpportunityCount: 1 },
      items: [{ opportunityType: 'KEYWORD_OPPORTUNITY', opportunitySubtype: 'quick_win', keyword: 'test keyword c', searchVolume: 700 }],
    },
    pageSpeed: [
      { device: 'desktop', status: 'completed', performanceScore: 91, lcp: 1.8 },
      { device: 'mobile', status: 'pending' },
    ],
    aiVisibility: {
      visibilityPercentage: 14.2,
      totalMentions: 31,
      providers: { openai: { visibilityPercentage: 18, totalMentions: 20 }, gemini: { visibilityPercentage: 9 } },
      competitors: [{ brandName: 'Rakip Test', averageRank: 2.1, isUserBrand: false }],
      intents: { informational: 12, commercial: 5 },
    },
    projectInfo: {
      projectTitle: 'Ubersuggest Test Projesi',
      alertsEnabled: true,
      keywordLimit: 500,
      keywordUsed: 128,
      locations: [{ language: 'tr', locationId: '2792' }],
      competitors: [{ competitorDomain: 'rakip-test.invalid', language: 'tr', locationId: '2792' }],
    },
    raw: { endpoint: '/test', fetchedAt: '2026-09-01T00:00:00.000Z' },
    ...overrides,
  };
}

function emptyChildren() {
  return {
    domainHistory: [],
    keywords: [],
    rankTracking: [],
    averagePositions: [],
    topPages: [],
    competitors: [],
    backlinks: [],
    anchorTexts: [],
    linkingDomains: [],
    backlinkOpportunities: [],
    auditIssues: [],
    opportunities: [],
    pagespeed: [],
    aiProviders: [],
    aiCompetitors: [],
    aiIntents: [],
  };
}

async function cleanup(clientId) {
  if (!clientId) return;
  // Snapshot ve proje kayıtları cascade ile silinir.
  await prisma.client.delete({ where: { id: clientId } }).catch(() => {});
}

let clientId = null;

try {
  const client = await prisma.client.create({
    data: {
      companyName: TEST_COMPANY,
      contactName: 'test',
      services: 'SEO',
      website: `https://${TEST_DOMAIN}`,
    },
    select: { id: true },
  });
  clientId = client.id;
  console.log(`\nGeçici test müşterisi: id=${clientId}`);

  let firstSnapshotId = null;

  console.log('\nTemel kayıt');

  await test('gerçek payload kaydedilir ve alt kayıtlar bağlanır', async () => {
    const validation = validateSnapshotPayload(payload({ clientId }));
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));

    const result = await ingestUbersuggestSnapshot(validation.value);
    firstSnapshotId = result.snapshotId;

    assert.ok(result.snapshotId > 0);
    assert.equal(result.domain, TEST_DOMAIN);
    assert.equal(result.saved.keywords, 2);
    assert.equal(result.saved.rankTracking, 2);
    assert.equal(result.saved.domainHistory, 2);
    assert.equal(result.saved.averagePositions, 2);
    assert.equal(result.saved.topPages, 1);
    assert.equal(result.saved.competitors, 1);
    assert.equal(result.saved.backlinks, 1);
    assert.equal(result.saved.anchorTexts, 1);
    assert.equal(result.saved.linkingDomains, 2);
    assert.equal(result.saved.backlinkOpportunities, 1);
    assert.equal(result.saved.auditIssues, 1);
    assert.equal(result.saved.auditIssueUrls, 2);
    assert.equal(result.saved.opportunities, 1);
    assert.equal(result.saved.pagespeed, 2);
    assert.equal(result.saved.aiProviders, 2);
    assert.equal(result.saved.aiCompetitors, 1);
    assert.equal(result.saved.aiIntents, 1);
    assert.ok(result.projectId > 0);

    const dbKeywords = await prisma.seoUbersuggestKeyword.count({ where: { snapshotId: firstSnapshotId } });
    assert.equal(dbKeywords, 2);

    const auditUrls = await prisma.seoUbersuggestAuditIssueUrl.count({
      where: { auditIssue: { snapshotId: firstSnapshotId } },
    });
    assert.equal(auditUrls, 2, 'audit url kayıtları issue üzerinden bağlı olmalı');
  });

  await test('eksik metrikler DB\'de null kalır, 0 yazılmaz', async () => {
    const row = await prisma.seoUbersuggestSnapshot.findUnique({ where: { id: firstSnapshotId } });
    assert.equal(row.estimatedPaidTraffic, null);
    assert.equal(row.domainAuthority, null);
    assert.equal(row.aiSentimentLabel, null);
    assert.equal(row.previousSiteHealthScore, null);
    // Payload'da gerçekten 0 olan alan korunmalı.
    assert.equal(row.paidKeywordsCount, 0);
    assert.equal(row.source, 'ubersuggest');
  });

  await test('null pozisyonlar korunur', async () => {
    const row = await prisma.seoUbersuggestRankTracking.findFirst({
      where: { snapshotId: firstSnapshotId, keyword: 'test keyword b' },
    });
    assert.equal(row.newPosition, null);
    assert.equal(row.oldPosition, null);
  });

  await test('pending pagespeed satırında metrikler null', async () => {
    const row = await prisma.seoUbersuggestPagespeed.findFirst({
      where: { snapshotId: firstSnapshotId, device: 'MOBILE' },
    });
    assert.equal(row.status, 'pending');
    assert.equal(row.performanceScore, null);
    assert.equal(row.lcp, null);
  });

  console.log('\nIdempotency');

  await test('aynı client + domain + tarih ikinci kez gelirse yeni satır açılmaz', async () => {
    const validation = validateSnapshotPayload(payload({ clientId }));
    const result = await ingestUbersuggestSnapshot(validation.value);

    assert.equal(result.snapshotId, firstSnapshotId, 'aynı snapshot güncellenmeliydi');

    const snapshots = await prisma.seoUbersuggestSnapshot.count({ where: { clientId } });
    assert.equal(snapshots, 1);

    // Alt kayıtlar çoğalmamalı, baştan yazılmalı.
    const keywords = await prisma.seoUbersuggestKeyword.count({ where: { snapshotId: firstSnapshotId } });
    assert.equal(keywords, 2);
    const auditUrls = await prisma.seoUbersuggestAuditIssueUrl.count({
      where: { auditIssue: { snapshotId: firstSnapshotId } },
    });
    assert.equal(auditUrls, 2);
  });

  await test('güncelleme metrikleri değiştirir', async () => {
    const validation = validateSnapshotPayload(
      payload({ clientId, overview: { organicKeywordsCount: 200, domainAuthority: 35 } }),
    );
    await ingestUbersuggestSnapshot(validation.value);
    const row = await prisma.seoUbersuggestSnapshot.findUnique({ where: { id: firstSnapshotId } });
    assert.equal(row.organicKeywordsCount, 200);
    assert.equal(row.domainAuthority, 35);
  });

  await test('farklı snapshotDate ayrı satır olarak saklanır (tarihsel seri)', async () => {
    const validation = validateSnapshotPayload(payload({ clientId, snapshotDate: '2026-10-01' }));
    const result = await ingestUbersuggestSnapshot(validation.value);
    assert.notEqual(result.snapshotId, firstSnapshotId);

    const snapshots = await prisma.seoUbersuggestSnapshot.count({ where: { clientId } });
    assert.equal(snapshots, 2);
  });

  await test('proje kaydı upsert edilir, çoğalmaz', async () => {
    const projects = await prisma.seoUbersuggestProject.count({ where: { clientId } });
    assert.equal(projects, 1);
    const locations = await prisma.seoUbersuggestProjectLocation.count({
      where: { project: { clientId } },
    });
    assert.equal(locations, 1);
  });

  console.log('\nTransaction');

  await test('alt kayıt yazımı patlarsa tüm işlem geri alınır', async () => {
    const validation = validateSnapshotPayload(payload({ clientId }));
    const before = await prisma.seoUbersuggestKeyword.count({ where: { snapshotId: firstSnapshotId } });
    const beforeSnapshot = await prisma.seoUbersuggestSnapshot.findUnique({ where: { id: firstSnapshotId } });

    // Validation'ı atlayarak bozuk tip enjekte ediyoruz: createMany bu satırda hata verir.
    const broken = {
      snapshot: { ...validation.value.snapshot, organicKeywordsCount: 999 },
      children: { ...emptyChildren(), keywords: [{ keyword: 'bozuk', searchVolume: 'SAYI-DEGIL' }] },
      project: null,
    };

    await assert.rejects(() => ingestUbersuggestSnapshot(broken), 'ingest hata vermeliydi');

    const after = await prisma.seoUbersuggestKeyword.count({ where: { snapshotId: firstSnapshotId } });
    assert.equal(after, before, 'silinen alt kayıtlar rollback ile geri gelmeliydi');

    const afterSnapshot = await prisma.seoUbersuggestSnapshot.findUnique({ where: { id: firstSnapshotId } });
    assert.equal(
      afterSnapshot.organicKeywordsCount,
      beforeSnapshot.organicKeywordsCount,
      'snapshot güncellemesi de geri alınmalıydı',
    );
  });

  await test('bilinmeyen clientId 404 ile reddedilir', async () => {
    const validation = validateSnapshotPayload(payload({ clientId: 2_000_000_000 }));
    await assert.rejects(
      () => ingestUbersuggestSnapshot(validation.value),
      (error) => error.code === 'CLIENT_NOT_FOUND',
    );
  });

  console.log('\nBoş payload');

  await test('yalnızca zorunlu alanlarla kayıt açılabilir', async () => {
    const validation = validateSnapshotPayload({ clientId, domain: TEST_DOMAIN, snapshotDate: '2026-11-01' });
    const result = await ingestUbersuggestSnapshot(validation.value);
    assert.ok(result.snapshotId > 0);
    assert.equal(result.saved.keywords, 0);
    assert.equal(result.projectId, null);

    const row = await prisma.seoUbersuggestSnapshot.findUnique({ where: { id: result.snapshotId } });
    assert.equal(row.organicKeywordsCount, null);
    assert.equal(row.rawResponseJson, null);
  });
} finally {
  await cleanup(clientId);
  await prisma.$disconnect();
}

console.log(`\n${passed} geçti, ${failed} başarısız\n`);
process.exit(failed > 0 ? 1 : 0);
