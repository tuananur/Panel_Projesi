/**
 * Bağımsız Google OAuth refresh token testi.
 * Uygulamayı etkilemez. Çalıştır:
 *   node test/google-oauth/test-token.mjs
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const credPath = join(__dirname, 'credentials.txt');

function loadCredentials(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    out[key] = value;
  }
  return out;
}

function fail(step, detail) {
  console.error(`\n❌ BAŞARISIZ: ${step}`);
  console.error(detail);
  process.exit(1);
}

async function main() {
  console.log('=== Google OAuth Token Testi ===\n');

  let creds;
  try {
    creds = loadCredentials(credPath);
  } catch {
    fail(
      'credentials.txt okunamadı',
      `Dosya yolu: ${credPath}\nÖnce credentials.example.txt dosyasını credentials.txt olarak kopyala ve doldur.`
    );
  }

  const clientId = creds.CLIENT_ID;
  const clientSecret = creds.CLIENT_SECRET;
  const refreshToken = creds.REFRESH_TOKEN;
  const propertyId = creds.GA4_PROPERTY_ID;

  if (!clientId || !clientSecret || !refreshToken) {
    fail(
      'Eksik alan',
      'CLIENT_ID, CLIENT_SECRET ve REFRESH_TOKEN credentials.txt içinde dolu olmalı.'
    );
  }

  console.log('Client ID     :', `${clientId.slice(0, 18)}...`);
  console.log('Client Secret :', `${clientSecret.slice(0, 6)}...${clientSecret.slice(-4)}`);
  console.log('Refresh Token :', `${refreshToken.slice(0, 12)}...`);
  console.log('Property ID   :', propertyId || '(yok — sadece token testi)');

  console.log('\n1) Access token yenileniyor...');
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const tokenText = await tokenRes.text();
  let tokenJson;
  try {
    tokenJson = JSON.parse(tokenText);
  } catch {
    fail('Token yanıtı JSON değil', tokenText);
  }

  if (!tokenRes.ok) {
    fail(
      'Refresh token reddedildi (invalid_grant vb.)',
      JSON.stringify(tokenJson, null, 2) +
        '\n\nBu genelde şu demek:\n' +
        '- Refresh token bu Client ID/Secret ile alınmamış\n' +
        '- Secret sonradan değiştirilmiş\n' +
        '- Token iptal edilmiş / süresi dolmuş (Testing mode)\n' +
        '- Playground kendi credentials\'ını kullanmış (dişli ayarını kontrol et)'
    );
  }

  const accessToken = tokenJson.access_token;
  if (!accessToken) {
    fail('Access token yok', JSON.stringify(tokenJson, null, 2));
  }

  console.log('✅ Access token alındı');
  console.log('   expires_in :', tokenJson.expires_in, 'sn');
  console.log('   token_type :', tokenJson.token_type || 'Bearer');
  console.log('   scope      :', tokenJson.scope || '(yanıtta yok)');

  if (!propertyId) {
    console.log('\n✅ TOKEN TESTİ BAŞARILI');
    console.log('GA4 testi için credentials.txt içine GA4_PROPERTY_ID=... ekleyip tekrar çalıştır.');
    return;
  }

  if (!/^\d+$/.test(propertyId)) {
    fail('GA4_PROPERTY_ID sadece rakam olmalı', `Gelen: ${propertyId}`);
  }

  console.log('\n2) GA4 Data API test raporu atılıyor...');
  const gaRes = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }],
        limit: 1,
      }),
    }
  );

  const gaText = await gaRes.text();
  let gaJson;
  try {
    gaJson = JSON.parse(gaText);
  } catch {
    fail('GA4 yanıtı JSON değil', gaText);
  }

  if (!gaRes.ok) {
    fail(
      'GA4 API hatası (token OK, property/izin sorunlu olabilir)',
      JSON.stringify(gaJson, null, 2) +
        '\n\nKontrol et:\n' +
        '- Property ID doğru mu?\n' +
        '- OAuth hesabının bu property\'ye erişimi var mı?\n' +
        '- Google Analytics Data API Cloud\'da Enable mı?\n' +
        '- Scope analytics.readonly var mı?'
    );
  }

  const users = gaJson.rows?.[0]?.metricValues?.[0]?.value ?? '0';
  console.log('✅ GA4 yanıtı OK — son 7 gün activeUsers:', users);
  console.log('\n✅ TÜM TESTLER BAŞARILI — bu üçlüyü Genel Ayarlar\'a koyabilirsin.');
}

main().catch((err) => {
  fail('Beklenmeyen hata', err?.stack || String(err));
});
