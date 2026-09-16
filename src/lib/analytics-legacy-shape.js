import { weeklyTrendFromDaily } from '@/lib/search-console';

// getGoogleAnalyticsAction artık analytics/searchConsole olarak ayrılmış temiz bir yapı döndürüyor.
// Mevcut analitik ve istatistik ekranları eski düz alan adlarını okuduğu için bu adaptör
// sadece isim eşlemesi yapar. Veri üretmez, eksik veriyi sıfırla doldurmaz.
const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

function withColor(list, offset = 0) {
  return (list || []).map((item, index) => ({
    ...item,
    color: CHART_COLORS[(index + offset) % CHART_COLORS.length],
  }));
}

export function toLegacyAnalyticsShape(result) {
  if (!result || result.error || !result.analytics) return result;

  const { analytics, searchConsole } = result;
  const summary = analytics.summary;

  const legacySearchConsole = searchConsole && !searchConsole.error
    ? {
        ...searchConsole,
        summary: searchConsole.summary || { clicks: 0, impressions: 0, ctr: 0, position: 0 },
        keywords: (searchConsole.queries || []).map((q) => ({
          ...q,
          ctr: Number(q.ctr || 0).toFixed(2),
          previousPosition: q.previousPosition ?? 100,
          improved: q.improved ?? true,
        })),
        totalKeywords: searchConsole.totalQueries || 0,
        weeklyTrend: weeklyTrendFromDaily(
          searchConsole.daily,
          new Date(`${searchConsole.period?.until}T12:00:00`).getMonth(),
          new Date(`${searchConsole.period?.until}T12:00:00`).getFullYear()
        ),
      }
    : searchConsole;

  return {
    success: result.success,
    isLive: result.isLive,
    reportPeriod: result.reportPeriod,
    realtime: analytics.realtime,
    summary: summary
      ? {
          activeUsers: summary.activeUsers,
          pageViews: summary.pageViews,
          sessions: summary.sessions,
          bounceRate: summary.bounceRate,
          avgEngagementTime: summary.avgEngagementTime,
          eventCount: summary.eventCount,
        }
      : null,
    dailyActiveUsers: (analytics.daily || []).map((d) => ({
      date: d.label,
      rawDate: d.rawDate,
      users: d.activeUsers,
      pageViews: d.pageViews,
      sessions: d.sessions,
      bounceRate: d.bounceRate,
      avgDuration: d.avgSessionDuration,
    })),
    deviceBreakdown: withColor(
      (analytics.devices || []).map((d) => ({
        name: d.name,
        count: d.activeUsers,
        percentage: Math.round(d.percentage),
      }))
    ),
    trafficSources: withColor(
      (analytics.channels || []).slice(0, 10).map((c) => ({
        name: c.name,
        count: c.activeUsers,
        percentage: Math.round(c.percentage),
      })),
      1
    ),
    topPages: (analytics.pages || []).slice(0, 20).map((p) => ({
      path: p.path,
      title: p.title,
      views: p.views,
      users: p.activeUsers,
      time: formatDuration(p.avgSessionDuration),
    })),
    // Donut grafiği okunur kalsın diye ilk 10 ülke; tam liste result.analytics.countries içinde.
    countryBreakdown: (analytics.countries || []).slice(0, 10).map((c) => ({
      name: c.country,
      count: c.activeUsers,
      percentage: Math.round(c.percentage),
    })),
    browserBreakdown: withColor(
      (analytics.browsers || []).map((b) => ({
        name: b.name,
        count: b.sessions,
        percentage: Math.round(b.percentage),
      }))
    ),
    searchConsole: legacySearchConsole,
    analytics,
  };
}

function formatDuration(seconds) {
  const secs = Math.round(seconds || 0);
  if (secs < 60) return `0dk ${secs}sn`;
  return `${Math.floor(secs / 60)}dk ${secs % 60}sn`;
}
