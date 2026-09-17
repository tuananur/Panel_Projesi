// Genel rapor için ek GA4 sorguları.
//
// Mevcut analytics akışı (getGoogleAnalyticsAction) bilinçli olarak değiştirilmedi; bu modül
// yalnızca genel rapor sekmesinin ihtiyaç duyduğu ek boyutları ayrı olarak çeker.
// Her sorgu tek tek korunur: bir boyut hata verirse (ör. demografi kapalı) o bölüm null döner,
// rapor çökmez ve yerine uydurma değer konmaz.

import { getGoogleOAuthConfig, refreshGoogleAccessToken } from '@/lib/google-oauth';

const GA4_ENDPOINT = 'https://analyticsdata.googleapis.com/v1beta/properties';

function toNumber(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isoFromYmd(value) {
  return value?.length === 8 ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}` : value;
}

/** GA4 satırlarını { dims: [...], metrics: [...] } biçimine indirger. */
function mapRows(report) {
  return (report?.rows || []).map((row) => ({
    dims: (row.dimensionValues || []).map((d) => d.value ?? ''),
    metrics: (row.metricValues || []).map((m) => toNumber(m.value)),
  }));
}

export async function fetchGeneralReportGa4(client, { since, until, prevSince, prevUntil }) {
  const oauth = await getGoogleOAuthConfig(client);
  const { clientId, clientSecret, refreshToken, propertyId } = oauth;
  if (!propertyId || !refreshToken || !clientId || !clientSecret) {
    return { error: 'API_MISSING' };
  }

  const tokenResult = await refreshGoogleAccessToken({ clientId, clientSecret, refreshToken });
  if (tokenResult.error) return { error: 'TOKEN_REFRESH_FAILED', details: tokenResult.details };

  const headers = {
    Authorization: `Bearer ${tokenResult.accessToken}`,
    'Content-Type': 'application/json',
  };

  const runReport = async (payload) => {
    const res = await fetch(`${GA4_ENDPOINT}/${propertyId}:runReport`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || res.statusText);
    }
    return res.json();
  };

  // Bir boyut desteklenmiyorsa veya yetki yoksa null döner; bölüm gizlenir.
  const optional = (payload) => runReport(payload).catch(() => null);

  const dateRanges = [{ startDate: since, endDate: until }];
  const prevRanges = [{ startDate: prevSince, endDate: prevUntil }];
  const organicFilter = {
    filter: {
      fieldName: 'sessionDefaultChannelGroup',
      stringFilter: { matchType: 'EXACT', value: 'Organic Search' },
    },
  };

  const [
    previousSummary,
    channelGroups,
    organicDaily,
    organicLandingPages,
    newVsReturning,
    cities,
    dayOfWeek,
    hours,
    events,
    keyEvents,
    ecommerce,
    products,
    siteSearch,
    ageBrackets,
    genders,
    previousPages,
  ] = await Promise.all([
    optional({
      dateRanges: prevRanges,
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'eventCount' },
      ],
    }),
    optional({
      dateRanges,
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'engagementRate' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 50,
    }),
    optional({
      dateRanges,
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      dimensionFilter: organicFilter,
      keepEmptyRows: true,
    }),
    optional({
      dateRanges,
      dimensions: [{ name: 'landingPage' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'engagementRate' },
        { name: 'averageSessionDuration' },
      ],
      dimensionFilter: organicFilter,
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 100,
    }),
    optional({
      dateRanges,
      dimensions: [{ name: 'newVsReturning' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'engagementRate' }],
    }),
    optional({
      dateRanges,
      dimensions: [{ name: 'city' }, { name: 'country' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 100,
    }),
    optional({
      dateRanges,
      dimensions: [{ name: 'dayOfWeek' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
    }),
    optional({
      dateRanges,
      dimensions: [{ name: 'hour' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
    }),
    optional({
      dateRanges,
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 100,
    }),
    optional({
      dateRanges,
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'keyEvents' }],
      orderBys: [{ metric: { metricName: 'keyEvents' }, desc: true }],
      limit: 50,
    }),
    optional({
      dateRanges,
      metrics: [
        { name: 'purchaseRevenue' },
        { name: 'transactions' },
        { name: 'averagePurchaseRevenue' },
        { name: 'itemsPurchased' },
      ],
    }),
    optional({
      dateRanges,
      dimensions: [{ name: 'itemName' }],
      metrics: [{ name: 'itemsPurchased' }, { name: 'itemRevenue' }],
      orderBys: [{ metric: { metricName: 'itemRevenue' }, desc: true }],
      limit: 25,
    }),
    optional({
      dateRanges,
      dimensions: [{ name: 'searchTerm' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 50,
    }),
    optional({
      dateRanges,
      dimensions: [{ name: 'userAgeBracket' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ dimension: { dimensionName: 'userAgeBracket' } }],
    }),
    optional({
      dateRanges,
      dimensions: [{ name: 'userGender' }],
      metrics: [{ name: 'activeUsers' }],
    }),
    optional({
      dateRanges: prevRanges,
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 500,
    }),
  ]);

  const summaryRow = mapRows(previousSummary)[0];

  return {
    previousSummary: summaryRow
      ? {
          activeUsers: summaryRow.metrics[0],
          pageViews: summaryRow.metrics[1],
          sessions: summaryRow.metrics[2],
          bounceRate: summaryRow.metrics[3] * 100,
          avgSessionDuration: summaryRow.metrics[4],
          eventCount: summaryRow.metrics[5],
        }
      : null,

    channelGroups: channelGroups
      ? mapRows(channelGroups).map((row) => ({
          channel: row.dims[0] || 'Bilinmiyor',
          activeUsers: row.metrics[0],
          sessions: row.metrics[1],
          engagementRate: row.metrics[2] * 100,
        }))
      : null,

    organicDaily: organicDaily
      ? mapRows(organicDaily).map((row) => ({
          date: isoFromYmd(row.dims[0]),
          activeUsers: row.metrics[0],
          sessions: row.metrics[1],
        }))
      : null,

    organicLandingPages: organicLandingPages
      ? mapRows(organicLandingPages).map((row) => ({
          path: row.dims[0] || '/',
          activeUsers: row.metrics[0],
          sessions: row.metrics[1],
          engagementRate: row.metrics[2] * 100,
          avgSessionDuration: row.metrics[3],
        }))
      : null,

    newVsReturning: newVsReturning
      ? mapRows(newVsReturning).map((row) => ({
          type: row.dims[0] || 'Bilinmiyor',
          activeUsers: row.metrics[0],
          sessions: row.metrics[1],
          engagementRate: row.metrics[2] * 100,
        }))
      : null,

    cities: cities
      ? mapRows(cities).map((row) => ({
          city: row.dims[0] || 'Bilinmiyor',
          country: row.dims[1] || '',
          activeUsers: row.metrics[0],
          sessions: row.metrics[1],
        }))
      : null,

    dayOfWeek: dayOfWeek
      ? mapRows(dayOfWeek).map((row) => ({
          day: Number(row.dims[0]),
          activeUsers: row.metrics[0],
          sessions: row.metrics[1],
        }))
      : null,

    hours: hours
      ? mapRows(hours).map((row) => ({
          hour: Number(row.dims[0]),
          activeUsers: row.metrics[0],
          sessions: row.metrics[1],
        }))
      : null,

    events: events
      ? mapRows(events).map((row) => ({
          event: row.dims[0],
          count: row.metrics[0],
          users: row.metrics[1],
        }))
      : null,

    keyEvents: keyEvents
      ? mapRows(keyEvents)
          .map((row) => ({ event: row.dims[0], count: row.metrics[0] }))
          .filter((row) => row.count > 0)
      : null,

    ecommerce: (() => {
      const row = mapRows(ecommerce)[0];
      if (!row) return null;
      const [revenue, transactions, avgRevenue, itemsPurchased] = row.metrics;
      // Hepsi sıfırsa müşteri e-ticaret ölçmüyor demektir; bölüm gizlenir.
      if (!revenue && !transactions && !itemsPurchased) return null;
      return { revenue, transactions, avgRevenue, itemsPurchased };
    })(),

    products: products
      ? mapRows(products)
          .map((row) => ({ name: row.dims[0], quantity: row.metrics[0], revenue: row.metrics[1] }))
          .filter((row) => row.quantity > 0 || row.revenue > 0)
      : null,

    siteSearch: siteSearch
      ? mapRows(siteSearch)
          .map((row) => ({ term: row.dims[0], count: row.metrics[0], users: row.metrics[1] }))
          .filter((row) => row.term && row.term !== '(not set)')
      : null,

    ageBrackets: ageBrackets
      ? mapRows(ageBrackets)
          .map((row) => ({ bracket: row.dims[0], activeUsers: row.metrics[0] }))
          .filter((row) => row.bracket && row.bracket !== 'unknown' && row.activeUsers > 0)
      : null,

    genders: genders
      ? mapRows(genders)
          .map((row) => ({ gender: row.dims[0], activeUsers: row.metrics[0] }))
          .filter((row) => row.gender && row.gender !== 'unknown' && row.activeUsers > 0)
      : null,

    previousPages: previousPages
      ? mapRows(previousPages).map((row) => ({
          path: row.dims[0],
          views: row.metrics[0],
          activeUsers: row.metrics[1],
        }))
      : null,
  };
}
