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

async function querySearchAnalytics(accessToken, siteUrl, startDate, endDate) {
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
        dimensions: ['query', 'page'],
        rowLimit: 500,
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
    if (!existing || impressions > existing.impressions) {
      byQuery.set(query, {
        query,
        page,
        position: Math.round(position * 10) / 10,
        impressions,
        clicks,
      });
    } else if (existing && impressions === existing.impressions && position < existing.position) {
      byQuery.set(query, {
        ...existing,
        page,
        position: Math.round(position * 10) / 10,
      });
    }
  });

  return byQuery;
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

export async function fetchSearchConsoleKeywords(accessToken, siteUrl) {
  const current = gscDateRange(28, 3);

  const currentEndDate = new Date(`${current.endDate}T12:00:00`);
  const previousEndDate = new Date(currentEndDate);
  previousEndDate.setDate(previousEndDate.getDate() - 28);
  const previousStartDate = new Date(previousEndDate);
  previousStartDate.setDate(previousStartDate.getDate() - 27);

  const [currentData, previousData] = await Promise.all([
    querySearchAnalytics(accessToken, siteUrl, current.startDate, current.endDate),
    querySearchAnalytics(
      accessToken,
      siteUrl,
      formatGscDate(previousStartDate),
      formatGscDate(previousEndDate)
    ),
  ]);

  const currentMap = aggregateRowsByQuery(currentData.rows);
  const previousMap = aggregateRowsByQuery(previousData.rows);

  const keywords = [...currentMap.values()]
    .map((row) => {
      const prev = previousMap.get(row.query);
      const changeInfo = buildChange(row.position, prev?.position ?? null);
      return {
        keyword: row.query,
        position: Math.round(row.position) || Math.ceil(row.position),
        positionExact: row.position,
        url: row.page,
        clicks: row.clicks,
        impressions: row.impressions,
        previousPosition: changeInfo.previousDisplay,
        positionChange: changeInfo.change,
        improved: changeInfo.improved,
        isNew: changeInfo.isNew,
      };
    })
    .sort((a, b) => a.position - b.position || b.impressions - a.impressions);

  return {
    siteUrl,
    periodLabel: `${current.startDate} — ${current.endDate}`,
    compareLabel: 'Önceki 28 güne göre',
    device: 'Masaüstü',
    country: 'Türkiye',
    keywords,
    totalKeywords: keywords.length,
  };
}
