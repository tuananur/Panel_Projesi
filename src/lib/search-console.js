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

async function querySearchAnalytics(accessToken, siteUrl, { startDate, endDate, dimensions = ['query', 'page'] }) {
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
        rowLimit: dimensions.includes('date') ? 1000 : 500,
        type: 'web',
        dimensionFilterGroups: [
          {
            filters: [
              { dimension: 'country', expression: 'tur', operator: 'equals' },
              { dimension: 'device', expression: 'DESKTOP', operator: 'equals' },
            ],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || res.statusText);
  }

  return res.json();
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
      position: data.impressions > 0
        ? Math.round((data.positionWeightedSum / data.impressions) * 10) / 10
        : 0,
      impressions: data.impressions,
      clicks: data.clicks,
    });
  }
  return result;
}

function buildChange(currentPos, previousPos) {
  if (previousPos == null || previousPos <= 0) {
    return {
      previousDisplay: 100,
      change: currentPos > 0 ? Math.round(100 - currentPos) : 0,
      improved: true,
      isNew: true,
    };
  }
  const roundedPrev = Math.round(previousPos);
  const roundedCurr = Math.round(currentPos);
  const delta = roundedPrev - roundedCurr;
  return {
    previousDisplay: roundedPrev,
    change: delta,
    improved: delta > 0,
    isNew: false,
  };
}

function parseSummaryRow(rows) {
  const row = rows?.[0];
  if (!row) {
    return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  }
  const clicks = row.clicks || 0;
  const impressions = row.impressions || 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  return {
    clicks,
    impressions,
    ctr: Math.round(ctr * 100) / 100,
    position: Math.round((row.position || 0) * 10) / 10,
  };
}

function buildWeeklyTrend(dailyRows, month, year) {
  const weeks = [
    { label: '1. Hafta', clicks: 0, impressions: 0 },
    { label: '2. Hafta', clicks: 0, impressions: 0 },
    { label: '3. Hafta', clicks: 0, impressions: 0 },
    { label: '4. Hafta', clicks: 0, impressions: 0 },
  ];

  (dailyRows || []).forEach((row) => {
    const dateStr = row.keys?.[0];
    if (!dateStr) return;
    const d = new Date(`${dateStr}T12:00:00`);
    if (d.getMonth() !== month || d.getFullYear() !== year) return;
    const weekIndex = Math.min(3, Math.floor((d.getDate() - 1) / 7));
    weeks[weekIndex].clicks += row.clicks || 0;
    weeks[weekIndex].impressions += row.impressions || 0;
  });

  return weeks;
}

export const GSC_KEYWORDS_PAGE_SIZE = 10;
export const GSC_TOP_KEYWORDS_LIMIT = 10;

export async function fetchSearchConsoleKeywords(accessToken, siteUrl, period = null) {
  const current = period
    ? { startDate: period.startDate, endDate: period.endDate }
    : gscDateRange(28, 3);

  const compareStartDate = period?.compareStartDate;
  const compareEndDate = period?.compareEndDate;

  let previousStart = compareStartDate;
  let previousEnd = compareEndDate;

  if (!previousStart || !previousEnd) {
    const currentEndDate = new Date(`${current.endDate}T12:00:00`);
    const previousEndDate = new Date(currentEndDate);
    previousEndDate.setDate(previousEndDate.getDate() - 28);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousStartDate.getDate() - 27);
    previousStart = formatGscDate(previousStartDate);
    previousEnd = formatGscDate(previousEndDate);
  }

  const [summaryData, dailyData, currentData, previousData] = await Promise.all([
    querySearchAnalytics(accessToken, siteUrl, {
      startDate: current.startDate,
      endDate: current.endDate,
      dimensions: [],
    }),
    querySearchAnalytics(accessToken, siteUrl, {
      startDate: current.startDate,
      endDate: current.endDate,
      dimensions: ['date'],
    }),
    querySearchAnalytics(accessToken, siteUrl, {
      startDate: current.startDate,
      endDate: current.endDate,
      dimensions: ['query', 'page'],
    }),
    querySearchAnalytics(accessToken, siteUrl, {
      startDate: previousStart,
      endDate: previousEnd,
      dimensions: ['query', 'page'],
    }),
  ]);

  const currentMap = aggregateRowsByQuery(currentData.rows);
  const previousMap = aggregateRowsByQuery(previousData.rows);

  const keywords = [...currentMap.values()]
    .map((row) => {
      const prev = previousMap.get(row.query);
      const changeInfo = buildChange(row.position, prev?.position ?? null);
      const ctr = row.impressions > 0 ? ((row.clicks / row.impressions) * 100).toFixed(2) : '0.00';
      return {
        keyword: row.query,
        position: Math.round(row.position) || Math.ceil(row.position),
        positionExact: row.position,
        url: row.page,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr,
        previousPosition: changeInfo.previousDisplay,
        positionChange: changeInfo.change,
        improved: changeInfo.improved,
        isNew: changeInfo.isNew,
      };
    })
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions || a.position - b.position);

  const summary = parseSummaryRow(summaryData.rows);
  const month = period?.month;
  const year = period?.year;
  const weeklyTrend = month != null && year != null
    ? buildWeeklyTrend(dailyData.rows, month, year)
    : buildWeeklyTrend(dailyData.rows, new Date(current.endDate).getMonth(), new Date(current.endDate).getFullYear());

  return {
    siteUrl,
    periodLabel: `${current.startDate} — ${current.endDate}`,
    compareLabel: period
      ? `${previousStart} — ${previousEnd} ile karşılaştırma`
      : 'Önceki 28 güne göre',
    device: 'Masaüstü',
    country: 'Türkiye',
    summary,
    weeklyTrend,
    keywords,
    totalKeywords: keywords.length,
  };
}
