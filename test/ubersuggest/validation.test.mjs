// Ubersuggest payload doğrulama testleri. DB gerektirmez.
// Çalıştırma: node test/ubersuggest/validation.test.mjs

import assert from 'node:assert/strict';
import { validateSnapshotPayload } from '../../src/lib/ubersuggest/validate-snapshot.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`  FAIL ${name}`);
    console.log(`       ${error.message}`);
  }
}

const base = { clientId: 1, domain: 'example.com', snapshotDate: '2026-09-01' };

console.log('\nZorunlu alanlar');

test('clientId, domain, snapshotDate eksikse reddeder', () => {
  const result = validateSnapshotPayload({});
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 3);
});

test('geçersiz snapshotDate reddedilir', () => {
  const result = validateSnapshotPayload({ ...base, snapshotDate: 'bilinmiyor' });
  assert.equal(result.ok, false);
});

test('domain normalize edilir (protokol, www, path atılır)', () => {
  const result = validateSnapshotPayload({ ...base, domain: 'HTTPS://WWW.Example.com/blog?x=1' });
  assert.equal(result.ok, true);
  assert.equal(result.value.snapshot.domain, 'example.com');
});

test('source payloadtan gelse bile ubersuggest olarak sabitlenir', () => {
  const result = validateSnapshotPayload({ ...base, source: 'semrush' });
  assert.equal(result.value.snapshot.source, 'ubersuggest');
});

console.log('\nSahte veri üretmeme');

test('eksik metrikler null kalır, 0 yazılmaz', () => {
  const { value } = validateSnapshotPayload(base);
  const s = value.snapshot;
  for (const field of [
    'organicKeywordsCount',
    'estimatedOrganicTraffic',
    'domainAuthority',
    'totalBacklinks',
    'siteHealthScore',
    'trackedKeywordsCount',
    'aiVisibilityPercentage',
    'aiSentimentLabel',
    'auditLastCrawledAt',
    'rawResponseJson',
  ]) {
    assert.equal(s[field], null, `${field} null olmalıydı, gelen: ${JSON.stringify(s[field])}`);
  }
});

test('boş string ve "N/A" gibi değerler null olur', () => {
  const { value } = validateSnapshotPayload({
    ...base,
    overview: { domainAuthority: '', estimatedOrganicTraffic: 'N/A', organicKeywordsCount: '-' },
  });
  assert.equal(value.snapshot.domainAuthority, null);
  assert.equal(value.snapshot.estimatedOrganicTraffic, null);
  assert.equal(value.snapshot.organicKeywordsCount, null);
});

test('gerçek 0 değeri korunur (null ile karıştırılmaz)', () => {
  const { value } = validateSnapshotPayload({ ...base, overview: { paidKeywordsCount: 0 } });
  assert.equal(value.snapshot.paidKeywordsCount, 0);
});

test('sayısal biçimler ayrıştırılır', () => {
  const { value } = validateSnapshotPayload({
    ...base,
    overview: { estimatedOrganicTraffic: '12,345.67', domainAuthority: '42' },
  });
  assert.equal(value.snapshot.estimatedOrganicTraffic, 12345.67);
  assert.equal(value.snapshot.domainAuthority, 42);
});

console.log('\nDiziler');

test('dizi alanları yoksa boş dizi olur', () => {
  const { value } = validateSnapshotPayload(base);
  for (const [key, rows] of Object.entries(value.children)) {
    assert.ok(Array.isArray(rows), `${key} dizi olmalı`);
    assert.equal(rows.length, 0, `${key} boş olmalı`);
  }
});

test('boş dizi kabul edilir', () => {
  const result = validateSnapshotPayload({ ...base, keywords: [], topPages: [], backlinks: [] });
  assert.equal(result.ok, true);
});

test('dizi yerine string gelirse reddedilir', () => {
  const result = validateSnapshotPayload({ ...base, keywords: 'çok' });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('keywords')));
});

test('kimlik alanı boş olan satırlar atlanır ve raporlanır', () => {
  const { value } = validateSnapshotPayload({
    ...base,
    keywords: [{ keyword: 'seo ajansı', rankingUrl: 'https://example.com/seo' }, { keyword: '' }, {}],
    topPages: [{ url: 'https://example.com/a' }, { url: null }],
  });
  assert.equal(value.children.keywords.length, 1);
  assert.equal(value.skipped.keywords, 2);
  assert.equal(value.children.topPages.length, 1);
  assert.equal(value.skipped.topPages, 1);
});

test('aynı keyword + rankingUrl ikilisi tekilleştirilir', () => {
  const { value } = validateSnapshotPayload({
    ...base,
    keywords: [
      { keyword: 'seo', rankingUrl: 'https://example.com/a' },
      { keyword: 'seo', rankingUrl: 'https://example.com/a' },
      { keyword: 'seo', rankingUrl: 'https://example.com/b' },
    ],
  });
  assert.equal(value.children.keywords.length, 2);
  assert.equal(value.skipped.keywords, 1);
});

console.log('\nAlan biçimleri');

test('snake_case alan adları da okunur', () => {
  const { value } = validateSnapshotPayload({
    client_id: 7,
    domain: 'example.com',
    snapshot_date: '2026-09-01',
    overview: { organic_keywords_count: 120, estimated_organic_traffic: 3400 },
  });
  assert.equal(value.snapshot.clientId, 7);
  assert.equal(value.snapshot.organicKeywordsCount, 120);
  assert.equal(value.snapshot.estimatedOrganicTraffic, 3400);
});

test('rankingUrl üzerinden path çıkarılır', () => {
  const { value } = validateSnapshotPayload({
    ...base,
    keywords: [{ keyword: 'x', rankingUrl: 'https://example.com/kategori/urun?a=1' }],
  });
  assert.equal(value.children.keywords[0].rankingPath, '/kategori/urun');
});

test('null pozisyon sahte 100/101 değerine çevrilmez', () => {
  const { value } = validateSnapshotPayload({
    ...base,
    rankTracking: [{ keyword: 'sıralamada yok', newPosition: null, oldPosition: 4 }],
  });
  const row = value.children.rankTracking[0];
  assert.equal(row.newPosition, null);
  assert.equal(row.oldPosition, 4);
});

test('rankTracking hem dizi hem { summary, items } olarak verilebilir', () => {
  const asArray = validateSnapshotPayload({ ...base, rankTracking: [{ keyword: 'a' }] });
  assert.equal(asArray.value.children.rankTracking.length, 1);

  const asObject = validateSnapshotPayload({
    ...base,
    rankTracking: { summary: { trackedKeywordsCount: 50, keywordsUpCount: 3 }, items: [{ keyword: 'a' }] },
  });
  assert.equal(asObject.value.snapshot.trackedKeywordsCount, 50);
  assert.equal(asObject.value.snapshot.keywordsUpCount, 3);
  assert.equal(asObject.value.children.rankTracking.length, 1);
});

console.log('\nPageSpeed');

test('pending durumunda metrikler null kalır', () => {
  const { value } = validateSnapshotPayload({
    ...base,
    pageSpeed: [{ device: 'mobile', status: 'pending' }],
  });
  const row = value.children.pagespeed[0];
  assert.equal(row.device, 'MOBILE');
  assert.equal(row.status, 'pending');
  for (const field of ['performanceScore', 'lcp', 'inp', 'cls', 'fcp', 'ttfb', 'speedIndex']) {
    assert.equal(row[field], null, `${field} null olmalıydı`);
  }
});

test('{ desktop, mobile } nesnesi satırlara çevrilir', () => {
  const { value } = validateSnapshotPayload({
    ...base,
    pageSpeed: { desktop: { status: 'completed', performanceScore: 88 }, mobile: { status: 'pending' } },
  });
  assert.equal(value.children.pagespeed.length, 2);
  assert.deepEqual(
    value.children.pagespeed.map((r) => r.device),
    ['DESKTOP', 'MOBILE'],
  );
});

console.log('\nEnum alanları');

test('tanınmayan enum değeri null olur, uydurulmaz', () => {
  const { value } = validateSnapshotPayload({
    ...base,
    auditIssues: [{ issueId: 'missing_title', issueCategory: 'kritik', seoImpact: 'high', difficulty: 'easy' }],
  });
  const row = value.children.auditIssues[0];
  assert.equal(row.issueCategory, null);
  assert.equal(row.seoImpact, 'high');
  assert.equal(row.difficulty, 'easy');
});

test('audit issue url listesi issue altına bağlanır', () => {
  const { value } = validateSnapshotPayload({
    ...base,
    auditIssues: [
      {
        issueId: 'broken_link',
        issueCategory: 'error',
        affectedUrls: [{ url: 'https://example.com/404', httpStatus: 404 }, { url: '' }],
      },
    ],
  });
  assert.equal(value.children.auditIssues[0].affectedUrls.length, 1);
  assert.equal(value.skipped.auditIssueUrls, 1);
});

test('AI provider listesi nesne olarak da verilebilir', () => {
  const { value } = validateSnapshotPayload({
    ...base,
    aiVisibility: {
      visibilityPercentage: 12.5,
      providers: { openai: { visibilityPercentage: 20 }, bing_copilot: { visibilityPercentage: 5 } },
      competitors: [{ brandName: 'Rakip A', averageRank: 2.4 }],
      intents: { informational: 10, transactional: 2 },
    },
  });
  assert.equal(value.snapshot.aiVisibilityPercentage, 12.5);
  // Desteklenmeyen provider (bing_copilot) atılır.
  assert.equal(value.children.aiProviders.length, 1);
  assert.equal(value.children.aiProviders[0].provider, 'openai');
  assert.equal(value.children.aiCompetitors.length, 1);
  assert.equal(value.children.aiIntents.length, 1);
  assert.equal(value.children.aiIntents[0].informationalCount, 10);
  assert.equal(value.children.aiIntents[0].navigationalCount, null);
});

test('boş intent nesnesi satır üretmez', () => {
  const { value } = validateSnapshotPayload({ ...base, aiVisibility: { intents: {} } });
  assert.equal(value.children.aiIntents.length, 0);
});

console.log('\nLinking domain ve proje');

test('new/lost referring domainler tek tabloda status ile ayrılır', () => {
  const { value } = validateSnapshotPayload({
    ...base,
    newLinkingDomains: [{ referringDomain: 'yeni.com', detectedDate: '2026-08-15' }],
    lostLinkingDomains: [{ referringDomain: 'giden.com' }],
  });
  assert.equal(value.children.linkingDomains.length, 2);
  assert.equal(value.children.linkingDomains[0].status, 'new');
  assert.equal(value.children.linkingDomains[1].status, 'lost');
  assert.equal(value.children.linkingDomains[1].detectedDate, null);
});

test('projectInfo yoksa proje kaydı üretilmez', () => {
  const { value } = validateSnapshotPayload(base);
  assert.equal(value.project, null);
});

test('projectInfo varsa proje + alt listeler normalize edilir', () => {
  const { value } = validateSnapshotPayload({
    ...base,
    projectId: 'ubs-123',
    projectInfo: {
      projectTitle: 'Example SEO',
      alertsEnabled: 'true',
      keywordLimit: 500,
      locations: [{ language: 'tr', locationId: '2792' }],
      competitors: [{ competitorDomain: 'https://rakip.com/' }],
    },
  });
  assert.equal(value.project.ubersuggestProjectId, 'ubs-123');
  assert.equal(value.project.alertsEnabled, true);
  assert.equal(value.project.keywordUsed, null);
  assert.equal(value.project.locations.length, 1);
  assert.equal(value.project.competitors[0].competitorDomain, 'rakip.com');
});

test('raw response olduğu gibi saklanır', () => {
  const raw = { endpoint: '/domain/overview', body: { a: 1 } };
  const { value } = validateSnapshotPayload({ ...base, raw });
  assert.deepEqual(value.snapshot.rawResponseJson, raw);
});

console.log(`\n${passed} geçti, ${failed} başarısız\n`);
process.exit(failed > 0 ? 1 : 0);
