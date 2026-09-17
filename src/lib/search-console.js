import { countryNameFromCode, UNKNOWN_COUNTRY_LABEL } from '@/lib/country-codes';

// Search Console API tek istekte en fazla 25.000 satır döner; fazlası startRow ile sayfalanır.
const GSC_MAX_ROW_LIMIT = 25000;
const GSC_MAX_PAGES = 20;

function formatGscDate(date) {
  return date.toISOString().split('T')[0];
}

function gscDateRange(daysBack, lagDays = 3) {
  const end = new Date();
  end.setDate(end.getDate() - lagDays);
  const start = new Date(end);
  start.setDate(start.getDate() - daysBack + 1);
  return { startDate: formatGscDate(start), endDate: formatGscDate(end) };
}

export function normalizeWebsiteHost(website) {
  if (!website || !String(website).trim()) return '';
  try {
    const raw = String(website).trim();
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return String(website).replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
  }
}

export async function listSearchConsoleSites(accessToken) {
  const res = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || res.statusText);
  }
  const data = await res.json();
  return data.siteEntry || [];
}

export async function resolveSearchConsoleSiteUrl(accessToken, client) {
  const explicit = client?.searchConsoleSiteUrl?.trim();
  if (explicit) return explicit;

  const host = normalizeWebsiteHost(client?.website);
  if (!host) return null;

  const sites = await listSearchConsoleSites(accessToken);
  const candidates = [
    `sc-domain:${host}`,
    `https://${host}/`,
    `https://www.${host}/`,
    `http://${host}/`,
  ];

  for (const candidate of candidates) {
    const found = sites.find((s) => s.siteUrl === candidate);
    if (found) return found.siteUrl;
  }

  const fuzzy = sites.find((s) => {
    const u = (s.siteUrl || '').toLowerCase();
    return u.includes(host);
  });
  return fuzzy?.siteUrl || null;
}

/**
 * Tek searchAnalytics isteği. Ülke/cihaz filtresi uygulanmaz: tüm trafik döner.
 * searchType 'web' (Google Web Arama) olarak sabit; image/video/news ayrı raporlardır.
 */
async function querySearchAnalytics(accessToken, siteUrl, { startDate, endDate, dimensions = [], startRow = 0, rowLimit = GSC_MAX_ROW_LIMIT }) {
  const encodedSite = encodeURIComponent(siteUrl);
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        type: 'web',
        rowLimit,
        startRow,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || res.statusText);
  }

  return res.json();
}

/** Sayfalama ile tüm satırları toplar. Sınıra dayanırsa truncated=true. */
async function queryAllRows(accessToken, siteUrl, { startDate, endDate, dimensions }) {
  const rows = [];
  let truncated = false;

  for (let page = 0; page < GSC_MAX_PAGES; page += 1) {
    const data = await querySearchAnalytics(accessToken, siteUrl, {
      startDate,
      endDate,
      dimensions,
      startRow: page * GSC_MAX_ROW_LIMIT,
      rowLimit: GSC_MAX_ROW_LIMIT,
    });
    const pageRows = data.rows || [];
    rows.push(...pageRows);
    if (pageRows.length < GSC_MAX_ROW_LIMIT) return { rows, truncated };
    if (page === GSC_MAX_PAGES - 1) truncated = true;
  }

  return { rows, truncated };
}

function ratio(clicks, impressions) {
  return impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0;
}

function round1(value) {
  return Math.round((value || 0) * 10) / 10;
}

function aggregateRowsByQuery(rows) {
  const byQuery = new Map();

  (rows || []).forEach((row) => {
    const query = row.keys?.[0];
    const page = row.keys?.[1] || '';
    if (!query) return;

    const impressions = row.impressions || 0;
    const clicks = row.clicks || 0;
    const position = row.position || 0;

    const existing = byQuery.get(query);
    if (!existing) {
      byQuery.set(query, {
        query,
        page,
        pageImpressions: impressions,
        positionWeightedSum: position * impressions,
        impressions,
        clicks,
      });
      return;
    }

    byQuery.set(query, {
      query,
      page: impressions >= existing.pageImpressions ? page : existing.page,
      pageImpressions: Math.max(existing.pageImpressions, impressions),
      positionWeightedSum: existing.positionWeightedSum + position * impressions,
      impressions: existing.impressions + impressions,
      clicks: existing.clicks + clicks,
    });
  });

  const result = new Map();
  for (const [query, data] of byQuery) {
    result.set(query, {
      query: data.query,
      page: data.page,
      position: data.impressions > 0 ? round1(data.positionWeightedSum / data.impressions) : 0,
      impressions: data.impressions,
      clicks: data.clicks,
    });
  }
  return result;
}

function buildChange(currentPos, previousPos) {
  if (previousPos == null || previousPos <= 0) {
    return { previousPosition: null, change: 0, improved: null, isNew: true };
  }
  const roundedPrev = Math.round(previousPos);
  const delta = roundedPrev - Math.round(currentPos);
  return { previousPosition: roundedPrev, change: delta, improved: delta > 0, isNew: false };
}

/** Boyutsuz sorgu tek satır döner: dönemin gerçek toplamı. Satır yoksa null. */
function parseSummaryRow(rows) {
  const row = rows?.[0];
  if (!row) return null;
  const clicks = row.clicks || 0;
  const impressions = row.impressions || 0;
  return {
    clicks,
    impressions,
    ctr: ratio(clicks, impressions),
    position: round1(row.position),
  };
}

function mapBreakdownRows(rows, keyMapper) {
  return (rows || [])
    .map((row) => {
      const rawKey = row.keys?.[0] || '';
      const clicks = row.clicks || 0;
      const impressions = row.impressions || 0;
      return {
        ...keyMapper(rawKey),
        clicks,
        impressions,
        ctr: ratio(clicks, impressions),
        position: round1(row.position),
      };
    })
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);
}

export const GSC_KEYWORDS_PAGE_SIZE = 10;
export const GSC_TOP_KEYWORDS_LIMIT = 10;

/** Aylık hafta kırılımı; normalize edilmiş daily listesinden üretilir. */
export function weeklyTrendFromDaily(daily, month, year) {
  const weeks = [
    { label: '1. Hafta', clicks: 0, impressions: 0 },
    { label: '2. Hafta', clicks: 0, impressions: 0 },
    { label: '3. Hafta', clicks: 0, impressions: 0 },
    { label: '4. Hafta', clicks: 0, impressions: 0 },
  ];

  (daily || []).forEach((row) => {
    if (!row?.date) return;
    const d = new Date(`${row.date}T12:00:00`);
    if (d.getMonth() !== month || d.getFullYear() !== year) return;
    const weekIndex = Math.min(3, Math.floor((d.getDate() - 1) / 7));
    weeks[weekIndex].clicks += row.clicks || 0;
    weeks[weekIndex].impressions += row.impressions || 0;
  });

  return weeks;
}

/**
 * Seçilen dönemin tüm Search Console verisi: ülke/cihaz filtresi yok, sayfalama var.
 * Dönen alanlar: summary, daily, queries, countries, devices.
 */
export async function fetchSearchConsoleKeywords(accessToken, siteUrl, period = null) {
  // Sayfa boyutlu sorgular yalnızca genel rapor için gerekli; analitik ekranını yavaşlatmamak
  // adına varsayılan olarak çalıştırılmaz.
  const includePages = Boolean(period?.includePages);
  const current = period
    ? { startDate: period.startDate, endDate: period.endDate }
    : gscDateRange(28, 3);

  let previousStart = period?.compareStartDate;
  let previousEnd = period?.compareEndDate;

  if (!previousStart || !previousEnd) {
    const currentEndDate = new Date(`${current.endDate}T12:00:00`);
    const previousEndDate = new Date(currentEndDate);
    previousEndDate.setDate(previousEndDate.getDate() - 28);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousStartDate.getDate() - 27);
    previousStart = formatGscDate(previousStartDate);
    previousEnd = formatGscDate(previousEndDate);
  }

  const [
    summaryData,
    compareSummaryData,
    dailyData,
    countryData,
    deviceData,
    currentQueries,
    previousQueries,
    currentPages,
    previousPages,
  ] = await Promise.all([
    querySearchAnalytics(accessToken, siteUrl, {
      startDate: current.startDate,
      endDate: current.endDate,
      dimensions: [],
      rowLimit: 1,
    }),
    // Önceki dönemin toplamı: genel rapordaki değişim yüzdeleri için.
    querySearchAnalytics(accessToken, siteUrl, {
      startDate: previousStart,
      endDate: previousEnd,
      dimensions: [],
      rowLimit: 1,
    }),
    queryAllRows(accessToken, siteUrl, {
      startDate: current.startDate,
      endDate: current.endDate,
      dimensions: ['date'],
    }),
    queryAllRows(accessToken, siteUrl, {
      startDate: current.startDate,
      endDate: current.endDate,
      dimensions: ['country'],
    }),
    queryAllRows(accessToken, siteUrl, {
      startDate: current.startDate,
      endDate: current.endDate,
      dimensions: ['device'],
    }),
    queryAllRows(accessToken, siteUrl, {
      startDate: current.startDate,
      endDate: current.endDate,
      dimensions: ['query', 'page'],
    }),
    queryAllRows(accessToken, siteUrl, {
      startDate: previousStart,
      endDate: previousEnd,
      dimensions: ['query', 'page'],
    }),
    // Sayfa bazlı performans ve kazanan/kaybeden sayfa karşılaştırması için.
    includePages
      ? queryAllRows(accessToken, siteUrl, {
          startDate: current.startDate,
          endDate: current.endDate,
          dimensions: ['page'],
        })
      : Promise.resolve({ rows: [] }),
    includePages
      ? queryAllRows(accessToken, siteUrl, {
          startDate: previousStart,
          endDate: previousEnd,
          dimensions: ['page'],
        })
      : Promise.resolve({ rows: [] }),
  ]);

  const currentMap = aggregateRowsByQuery(currentQueries.rows);
  const previousMap = aggregateRowsByQuery(previousQueries.rows);

  const queries = [...currentMap.values()]
    .map((row) => {
      const prev = previousMap.get(row.query);
      const changeInfo = buildChange(row.position, prev?.position ?? null);
      return {
        keyword: row.query,
        url: row.page,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: ratio(row.clicks, row.impressions),
        position: Math.round(row.position) || Math.ceil(row.position),
        positionExact: row.position,
        previousPosition: changeInfo.previousPosition,
        positionChange: changeInfo.change,
        improved: changeInfo.improved,
        isNew: changeInfo.isNew,
      };
    })
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions || a.position - b.position);

  const daily = (dailyData.rows || [])
    .map((row) => {
      const clicks = row.clicks || 0;
      const impressions = row.impressions || 0;
      return {
        date: row.keys?.[0] || '',
        clicks,
        impressions,
        ctr: ratio(clicks, impressions),
        position: round1(row.position),
      };
    })
    .filter((row) => row.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const countries = mapBreakdownRows(countryData.rows, (code) => ({
    countryCode: code || null,
    countryName: countryNameFromCode(code) || UNKNOWN_COUNTRY_LABEL,
  }));

  const devices = mapBreakdownRows(deviceData.rows, (device) => ({
    device: device || 'UNKNOWN',
  }));

  const pages = includePages ? mapBreakdownRows(currentPages.rows, (page) => ({ page: page || '' })) : null;
  const comparePages = includePages
    ? mapBreakdownRows(previousPages.rows, (page) => ({ page: page || '' }))
    : null;

  return {
    siteUrl,
    scope: 'ALL',
    period: { since: current.startDate, until: current.endDate },
    comparePeriod: { since: previousStart, until: previousEnd },
    periodLabel: `${current.startDate} — ${current.endDate}`,
    compareLabel: `${previousStart} — ${previousEnd} ile karşılaştırma`,
    summary: parseSummaryRow(summaryData.rows),
    compareSummary: parseSummaryRow(compareSummaryData.rows),
    daily,
    queries,
    countries,
    devices,
    // includePages verilmediğinde bu iki alan null kalır: boş dizi ile "veri yok" karışmasın.
    pages,
    comparePages,
    totalQueries: queries.length,
    truncated: currentQueries.truncated || previousQueries.truncated,
  };
}
