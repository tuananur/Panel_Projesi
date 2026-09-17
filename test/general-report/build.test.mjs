// Genel rapor hesaplama katmanının DB/API gerektirmeyen kontrolü.
// Çalıştırma: node test/general-report/build.test.mjs

import assert from 'node:assert/strict';
import { buildGeneralReport, changePct, pathFromUrl } from '../../src/lib/general-report/build.js';

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok  ${name}`);
}

console.log('changePct / pathFromUrl');
test('önceki dönem sıfırsa yüzde hesaplanmaz', () => {
  assert.equal(changePct(10, 0), null);
  assert.equal(changePct(10, null), null);
  assert.equal(changePct(null, 10), null);
  assert.equal(changePct(150, 100), 50);
});

test('GSC tam URL yola indirgenir', () => {
  assert.equal(pathFromUrl('https://site.com/blog/yazi'), '/blog/yazi');
  assert.equal(pathFromUrl('/blog/yazi'), '/blog/yazi');
  assert.equal(pathFromUrl(''), null);
});

console.log('\nboş girdi');
test('hiç veri yokken çökmeden boş rapor döner', () => {
  const report = buildGeneralReport({ ga: null, gsc: null, extras: null, ubersuggest: null, period: {} });
  assert.deepEqual(report.comparison, []);
  assert.equal(report.organic, null);
  assert.deepEqual(report.analysis, []);
  assert.deepEqual(report.actions, []);
  assert.equal(report.pageMovements.views, null);
  assert.equal(report.pageMovements.clicks, null);
});

console.log('\ndolu girdi');
const ga = {
  summary: { activeUsers: 1200, pageViews: 4000, sessions: 1500, bounceRate: 42 },
  pages: [
    { path: '/a', title: 'A', views: 300 },
    { path: '/b', title: 'B', views: 100 },
  ],
  daily: [],
};
const gsc = {
  summary: { clicks: 500, impressions: 20000, ctr: 2.5, position: 12.4 },
  compareSummary: { clicks: 400, impressions: 15000, ctr: 2.66, position: 14.1 },
  queries: [
    { keyword: 'a', url: 'https://site.com/a', clicks: 10, impressions: 1000, ctr: 1, position: 6, previousPosition: 9, positionChange: 3, isNew: false },
    { keyword: 'b', url: 'https://site.com/b', clicks: 2, impressions: 800, ctr: 0.25, position: 14, previousPosition: 11, positionChange: -3, isNew: false },
    { keyword: 'c', url: 'https://site.com/c', clicks: 0, impressions: 50, ctr: 0, position: 60, previousPosition: null, positionChange: 0, isNew: true },
  ],
  pages: [
    { page: 'https://site.com/a', clicks: 40, impressions: 900, ctr: 4.4, position: 5 },
    { page: 'https://site.com/b', clicks: 5, impressions: 400, ctr: 1.25, position: 15 },
  ],
  comparePages: [
    { page: 'https://site.com/a', clicks: 20, impressions: 700, ctr: 2.8, position: 7 },
    { page: 'https://site.com/b', clicks: 15, impressions: 500, ctr: 3, position: 12 },
  ],
};
const extras = {
  previousSummary: { activeUsers: 1000, pageViews: 3600, sessions: 1300, bounceRate: 45 },
  channelGroups: [
    { channel: 'Organic Search', activeUsers: 400, sessions: 500, engagementRate: 60 },
    { channel: 'Direct', activeUsers: 800, sessions: 1000, engagementRate: 50 },
  ],
  previousPages: [
    { path: '/a', views: 200 },
    { path: '/b', views: 180 },
  ],
  dayOfWeek: [{ day: 1, activeUsers: 100, sessions: 120 }, { day: 5, activeUsers: 300, sessions: 400 }],
  hours: [{ hour: 9, activeUsers: 50, sessions: 60 }, { hour: 21, activeUsers: 200, sessions: 260 }],
};
const ubersuggest = {
  snapshot: {
    siteHealthScore: 68,
    totalIssuesCount: 42,
    brokenPagesCount: 3,
    totalBacklinks: 1200,
    referringDomains: 90,
    domainAuthority: 31,
    quickWinOpportunityCount: 4,
    newContentOpportunityCount: 7,
    rankTracking: [
      { keyword: 'k1', oldPosition: 12, newPosition: 6, positionChange: 6, searchVolume: 900 },
      { keyword: 'k2', oldPosition: 4, newPosition: 11, positionChange: -7, searchVolume: 500 },
      { keyword: 'k3', oldPosition: 8, newPosition: 8, positionChange: 0, searchVolume: 100 },
    ],
    keywords: [{ keyword: 'k4', currentPosition: 9, searchVolume: 1200 }],
    auditIssues: [{ issueId: 'duplicate_title', seoImpact: 'high' }, { issueId: 'thin_content', seoImpact: 'medium' }],
    pagespeed: [{ device: 'MOBILE', performanceScore: 38 }, { device: 'DESKTOP', performanceScore: 82 }],
    backlinkOpportunities: [{ referringDomain: 'x.com' }],
  },
};

const report = buildGeneralReport({ ga, gsc, extras, ubersuggest, period: { since: '2026-08-01', until: '2026-08-31' } });

test('dönem karşılaştırması iki kaynağı ayrı satırlarda tutar', () => {
  const labels = report.comparison.map((row) => `${row.source}:${row.label}`);
  assert.ok(labels.includes('GA4:Aktif kullanıcı'));
  assert.ok(labels.includes('Search Console:Organik tıklama'));
  const users = report.comparison.find((row) => row.label === 'Aktif kullanıcı');
  assert.equal(Math.round(users.changePct), 20);
});

test('organik pay kanal grubundan hesaplanır', () => {
  assert.equal(report.organic.organic.sessions, 500);
  assert.ok(Math.abs(report.organic.sessionShare - 33.33) < 0.1);
});

test('yükselen/düşen kelimeler Ubersuggest takibinden gelir', () => {
  assert.deepEqual(report.movements.trackedRising.map((r) => r.keyword), ['k1']);
  assert.deepEqual(report.movements.trackedFalling.map((r) => r.keyword), ['k2']);
  assert.deepEqual(report.movements.gscRising.map((r) => r.keyword), ['a']);
  assert.deepEqual(report.movements.gscFalling.map((r) => r.keyword), ['b']);
});

test('CTR fırsatı site ortalamasının altındaki sorguları seçer', () => {
  const keywords = report.opportunities.ctrOpportunities.map((row) => row.keyword);
  assert.ok(keywords.includes('a'), 'pozisyon 6, CTR %1 < site %2.5 olan sorgu listede olmalı');
  assert.ok(!keywords.includes('c'), 'pozisyon 60 olan sorgu listede olmamalı');
});

test('4-20 aralığı fırsatları gösterim medyanına göre süzülür', () => {
  assert.deepEqual(report.opportunities.strikingDistance.map((row) => row.keyword), ['a', 'b']);
  assert.deepEqual(report.opportunities.uberStriking.map((row) => row.keyword), ['k4']);
});

test('kazanan/kaybeden sayfalar iki kaynakta ayrı hesaplanır', () => {
  assert.deepEqual(report.pageMovements.views.winners.map((r) => r.path), ['/a']);
  assert.deepEqual(report.pageMovements.views.losers.map((r) => r.path), ['/b']);
  assert.deepEqual(report.pageMovements.clicks.winners.map((r) => r.path), ['/a']);
  assert.deepEqual(report.pageMovements.clicks.losers.map((r) => r.path), ['/b']);
});

test('gün/saat analizi en yoğunları bulur', () => {
  assert.equal(report.timeAnalysis.busiestDay.day, 5);
  assert.equal(report.timeAnalysis.busiestHour.hour, 21);
});

test('analiz maddeleri kaynak etiketi taşır ve üç soruyu yanıtlar', () => {
  assert.ok(report.analysis.length >= 5);
  report.analysis.forEach((item) => {
    assert.ok(item.source, 'kaynak boş olmamalı');
    assert.ok(item.what && item.why && item.todo);
  });
});

test('aksiyon planı önceliğe göre sıralanır ve kritikleri yakalar', () => {
  const priorities = report.actions.map((action) => action.priority);
  const order = { Kritik: 0, Yüksek: 1, Orta: 2, Düşük: 3 };
  const sorted = [...priorities].sort((a, b) => order[a] - order[b]);
  assert.deepEqual(priorities, sorted);
  assert.ok(report.actions.some((a) => a.title.includes('Kırık sayfaları')), 'kırık sayfa aksiyonu üretilmeli');
  assert.ok(report.actions.some((a) => a.title.includes('Mobil hızı')), 'mobil hız aksiyonu üretilmeli');
});

test('yönetici özeti iyi/kötü/fırsat/sonraki adımları doldurur', () => {
  assert.ok(report.conclusion.good.length > 0);
  assert.ok(report.conclusion.bad.length > 0);
  assert.ok(report.conclusion.opportunities.length > 0);
  assert.ok(report.conclusion.next.length > 0 && report.conclusion.next.length <= 5);
});

console.log(`\n${passed} test geçti.`);
