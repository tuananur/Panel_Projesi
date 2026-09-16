/**
 * GA4 + Search Console veri katmanı doğrulaması.
 * Amaç: ana toplamların ülke/cihaz filtresi içermediğini ve tüm ülkelerin geldiğini kanıtlamak.
 *
 * Kullanım (proje kökünden):
 *   node test/analytics-verify/verify.mjs --property 123456789 --since 2026-08-17 --until 2026-09-15
 *   node test/analytics-verify/verify.mjs --property 123456789 --site sc-domain:ornek.com
 *
 * Credential'lar test/google-oauth/credentials.txt dosyasından okunur.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const credPath = resolve(here, '../google-oauth/credentials.txt');

function parseArgs() {
  const out = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) out[argv[i].slice(2)] = argv[i + 1];
  }
  return out;
}

function readCredentials() {
  const raw = readFileSync(credPath, 'utf8');
  const cfg = {};
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    cfg[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  });
  return cfg;
}

function ymd(date) {
  return date.toISOString().split('T')[0];
}

async function getAccessToken({ CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN }) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Token alınamadı: ${await res.text()}`);
  return (await res.json()).access_token;
}

async function ga4(token, propertyId, endpoint, payload) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`GA4 ${endpoint}: ${(await res.text()).slice(0, 400)}`);
  return res.json();
}

async function gsc(token, siteUrl, body) {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`GSC: ${(await res.text()).slice(0, 400)}`);
  return res.json();
}

async function gscAllRows(token, siteUrl, base) {
  const rows = [];
  for (let page = 0; page < 20; page += 1) {
    const data = await gsc(token, siteUrl, { ...base, rowLimit: 25000, startRow: page * 25000 });
    const pageRows = data.rows || [];
    rows.push(...pageRows);
    if (pageRows.length < 25000) break;
  }
  return rows;
}

const n = (v) => Number(v || 0).toLocaleString('tr-TR');

async function main() {
  const args = parseArgs();
  const cfg = readCredentials();

  if (!cfg.CLIENT_ID || !cfg.CLIENT_SECRET || !cfg.REFRESH_TOKEN) {
    console.error('credentials.txt içinde CLIENT_ID / CLIENT_SECRET / REFRESH_TOKEN eksik.');
    process.exit(1);
  }

  const until = args.until || ymd(new Date());
  const since = args.since || ymd(new Date(Date.now() - 29 * 86400000));
  const propertyId = args.property || cfg.GA4_PROPERTY_ID;

  console.log('='.repeat(70));
  console.log(`DÖNEM: ${since} → ${until}`);
  console.log('='.repeat(70));

  const token = await getAccessToken(cfg);
  console.log('✓ Access token alındı\n');

  // ---------- GA4 ----------
  if (!propertyId) {
    console.log('⚠ GA4 property id verilmedi (--property veya credentials.txt GA4_PROPERTY_ID), GA4 atlanıyor.\n');
  } else {
    const dateRanges = [{ startDate: since, endDate: until }];

    const summary = await ga4(token, propertyId, 'runReport', {
      dateRanges,
      metrics: [
        { name: 'activeUsers' }, { name: 'screenPageViews' }, { name: 'sessions' },
        { name: 'bounceRate' }, { name: 'averageSessionDuration' }, { name: 'eventCount' },
      ],
    });
    const sRow = summary.rows?.[0];
    const totalUsers = Number(sRow?.metricValues?.[0]?.value || 0);
    const totalSessions = Number(sRow?.metricValues?.[2]?.value || 0);

    console.log('--- GA4 GLOBAL TOPLAM (filtresiz) ---');
    if (!sRow) {
      console.log('Bu dönem için satır dönmedi → summary null olmalı.');
    } else {
      console.log(`activeUsers      : ${n(totalUsers)}`);
      console.log(`sessions         : ${n(totalSessions)}`);
      console.log(`screenPageViews  : ${n(sRow.metricValues[1].value)}`);
      console.log(`eventCount       : ${n(sRow.metricValues[5].value)}`);
    }

    const countryReport = await ga4(token, propertyId, 'runReport', {
      dateRanges,
      dimensions: [{ name: 'country' }, { name: 'countryId' }],
      metrics: [
        { name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' },
        { name: 'engagedSessions' }, { name: 'engagementRate' },
      ],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 250,
    });

    const countryRows = (countryReport.rows || []).map((r) => ({
      name: r.dimensionValues[0].value,
      code: r.dimensionValues[1].value,
      users: Number(r.metricValues[0].value || 0),
    }));
    const countrySum = countryRows.reduce((a, c) => a + c.users, 0);
    const turkey = countryRows.find((c) => c.code === 'TR');
    const others = countryRows.filter((c) => c.code !== 'TR');

    console.log('\n--- GA4 ÜLKE KIRILIMI ---');
    console.log(`Ülke sayısı              : ${countryRows.length}`);
    console.log(`Türkiye activeUsers      : ${n(turkey?.users || 0)}`);
    console.log(`Diğer ülkeler toplamı    : ${n(others.reduce((a, c) => a + c.users, 0))} (${others.length} ülke)`);
    console.log(`Ülke satırları toplamı   : ${n(countrySum)}`);
    console.log(`Global activeUsers       : ${n(totalUsers)}`);
    console.log(`Fark (kırılım - global)  : ${n(countrySum - totalUsers)}  [GA4'te normal, zorla eşitlenmiyor]`);
    console.log('İlk 10 ülke:');
    countryRows.slice(0, 10).forEach((c, i) => {
      const share = totalUsers > 0 ? ((c.users / totalUsers) * 100).toFixed(2) : '0.00';
      console.log(`  ${String(i + 1).padStart(2)}. ${c.name} (${c.code}): ${n(c.users)} — pay %${share}`);
    });

    const realtime = await ga4(token, propertyId, 'runRealtimeReport', { metrics: [{ name: 'activeUsers' }] }).catch(() => null);
    const rtUsers = realtime?.rows?.[0]?.metricValues?.[0]?.value;
    console.log('\n--- GA4 REALTIME (ayrı alan) ---');
    console.log(`realtime.activeUsers     : ${rtUsers != null ? n(rtUsers) : 'veri yok'}`);
    console.log(`summary.activeUsers      : ${n(totalUsers)}  ← realtime bunu EZMEMELİ`);
  }

  // ---------- GSC ----------
  let siteUrl = args.site || cfg.GSC_SITE_URL;
  if (!siteUrl) {
    const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sites = sitesRes.ok ? (await sitesRes.json()).siteEntry || [] : [];
    console.log(`\n⚠ --site verilmedi. Hesaptaki mülkler: ${sites.map((s) => s.siteUrl).join(', ') || 'yok'}`);
    siteUrl = sites[0]?.siteUrl;
    if (siteUrl) console.log(`İlk mülk kullanılıyor: ${siteUrl}`);
  }

  if (!siteUrl) {
    console.log('\nGSC mülkü bulunamadı, Search Console doğrulaması atlandı.');
    return;
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`GSC MÜLKÜ: ${siteUrl}`);
  console.log('='.repeat(70));

  const unfiltered = await gsc(token, siteUrl, { startDate: since, endDate: until, dimensions: [], type: 'web', rowLimit: 1 });
  const oldStyle = await gsc(token, siteUrl, {
    startDate: since, endDate: until, dimensions: [], type: 'web', rowLimit: 1,
    dimensionFilterGroups: [{ filters: [
      { dimension: 'country', expression: 'tur', operator: 'equals' },
      { dimension: 'device', expression: 'DESKTOP', operator: 'equals' },
    ] }],
  });

  const u = unfiltered.rows?.[0];
  const o = oldStyle.rows?.[0];

  console.log('\n--- GSC ÖZET: YENİ (filtresiz) vs ESKİ (tur + DESKTOP) ---');
  console.log(`clicks      : yeni ${n(u?.clicks)}  |  eski ${n(o?.clicks)}`);
  console.log(`impressions : yeni ${n(u?.impressions)}  |  eski ${n(o?.impressions)}`);
  console.log(`ctr         : yeni ${u ? (u.clicks / u.impressions * 100).toFixed(2) : '0'}%  |  eski ${o?.impressions ? (o.clicks / o.impressions * 100).toFixed(2) : '0'}%`);
  console.log(`position    : yeni ${u?.position?.toFixed(1) ?? '-'}  |  eski ${o?.position?.toFixed(1) ?? '-'}`);
  if (u?.clicks) {
    const missed = u.clicks - (o?.clicks || 0);
    console.log(`→ Eski filtre ${n(missed)} tıklamayı (%${((missed / u.clicks) * 100).toFixed(1)}) gizliyordu.`);
  }

  const countryRows = await gscAllRows(token, siteUrl, { startDate: since, endDate: until, dimensions: ['country'], type: 'web' });
  console.log(`\n--- GSC ÜLKE KIRILIMI (${countryRows.length} ülke) ---`);
  countryRows
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 15)
    .forEach((r, i) => {
      console.log(`  ${String(i + 1).padStart(2)}. ${r.keys[0]}: ${n(r.clicks)} tıklama, ${n(r.impressions)} gösterim, pos ${r.position.toFixed(1)}`);
    });

  const deviceRows = await gscAllRows(token, siteUrl, { startDate: since, endDate: until, dimensions: ['device'], type: 'web' });
  console.log(`\n--- GSC CİHAZ KIRILIMI (${deviceRows.length} cihaz) ---`);
  deviceRows
    .sort((a, b) => b.clicks - a.clicks)
    .forEach((r) => {
      console.log(`  ${r.keys[0]}: ${n(r.clicks)} tıklama, ${n(r.impressions)} gösterim, pos ${r.position.toFixed(1)}`);
    });
  const hasMobile = deviceRows.some((r) => r.keys[0] === 'MOBILE' && r.clicks + r.impressions > 0);
  console.log(`→ Mobil trafik dahil mi: ${hasMobile ? 'EVET' : 'bu dönemde mobil veri yok'}`);

  const queryRows = await gscAllRows(token, siteUrl, { startDate: since, endDate: until, dimensions: ['query', 'page'], type: 'web' });
  const uniqueQueries = new Set(queryRows.map((r) => r.keys[0]));
  console.log(`\n--- GSC SORGULAR (pagination ile) ---`);
  console.log(`query+page satırı  : ${n(queryRows.length)}`);
  console.log(`tekil sorgu sayısı : ${n(uniqueQueries.size)}  [eski kod 500 satırla sınırlıydı]`);
}

main().catch((err) => {
  console.error('\nHATA:', err.message);
  process.exit(1);
});
