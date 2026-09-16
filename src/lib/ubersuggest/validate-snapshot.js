// Ubersuggest snapshot payload doğrulama + normalizasyon.
//
// Sözleşme:
// - clientId, domain, snapshotDate zorunludur; eksikse istek reddedilir.
// - source her zaman "ubersuggest"tir; payload farklı bir değer gönderse bile ezilir.
// - Diziler opsiyoneldir: yok/null ise []. Dizi olmayan bir değer gelirse hata verilir.
// - Metrikler null kalabilir. Eksik metrik için 0/false/'' üretilmez.
// - Kimlik alanı (keyword, url, domain, provider...) boş olan satırlar yazılmaz, `skipped` altında raporlanır.
// - Alanlar hem camelCase hem snake_case olarak okunabilir.

import {
  pick,
  toArray,
  toBoolOrNull,
  toDateOnlyOrNull,
  toDateOrNull,
  toFloatOrNull,
  toIntOrNull,
  toJsonOrNull,
  toStringOrNull,
  normalizeDomain,
} from './coerce.js';

export const UBERSUGGEST_SOURCE = 'ubersuggest';

const AUDIT_CATEGORIES = ['error', 'warning', 'recommendation'];
const AUDIT_LEVELS = ['domain', 'page'];
const SEO_IMPACTS = ['high', 'medium', 'low'];
const DIFFICULTIES = ['easy', 'moderate', 'hard'];
const LINKING_STATUSES = ['new', 'lost'];
const AI_PROVIDERS = ['openai', 'gemini', 'google_aio'];

/** Serbest metni beklenen sözlükle eşler; eşleşme yoksa null (uydurma yapılmaz). */
function toEnumOrNull(value, allowed) {
  const raw = toStringOrNull(value);
  if (!raw) return null;
  const normalized = raw.toLowerCase().replace(/[\s-]+/g, '_');
  return allowed.includes(normalized) ? normalized : null;
}

function toDeviceOrNull(value) {
  const raw = toStringOrNull(value);
  if (!raw) return null;
  const normalized = raw.toUpperCase();
  if (normalized.startsWith('DESK')) return 'DESKTOP';
  if (normalized.startsWith('MOB')) return 'MOBILE';
  if (normalized.startsWith('TAB')) return 'TABLET';
  return normalized;
}

function pathFromUrl(url, explicitPath) {
  const given = toStringOrNull(explicitPath);
  if (given) return given;
  const raw = toStringOrNull(url);
  if (!raw) return null;
  try {
    return new URL(raw.includes('://') ? raw : `https://${raw}`).pathname || null;
  } catch {
    return null;
  }
}

/** `X` dizi ya da `{ summary, items }` biçiminde gelebilir; ikisini de tek şekle indirger. */
function splitSummaryAndItems(value, ...itemKeys) {
  if (Array.isArray(value)) return { summary: null, items: value, valid: true };
  if (value === null || value === undefined) return { summary: null, items: [], valid: true };
  if (typeof value !== 'object') return { summary: null, items: [], valid: false };

  const summary = pick(value, 'summary') ?? value;
  let items;
  for (const key of ['items', 'rows', 'data', ...itemKeys]) {
    const candidate = pick(value, key);
    if (candidate !== undefined) {
      items = candidate;
      break;
    }
  }
  if (items === undefined || items === null) return { summary, items: [], valid: true };
  if (!Array.isArray(items)) return { summary, items: [], valid: false };
  return { summary, items, valid: true };
}

function dedupeBy(rows, keyFn) {
  const seen = new Set();
  const result = [];
  for (const row of rows) {
    const key = keyFn(row);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(row);
  }
  return result;
}

export function validateSnapshotPayload(payload) {
  const errors = [];
  const skipped = {};

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, errors: ['payload bir nesne olmalı'] };
  }

  const noteSkipped = (bucket, count) => {
    if (count > 0) skipped[bucket] = (skipped[bucket] || 0) + count;
  };

  // --- Zorunlu kimlik alanları ---
  const clientId = toIntOrNull(pick(payload, 'clientId'));
  if (clientId === null || clientId <= 0) errors.push('clientId zorunlu ve pozitif bir tam sayı olmalı');

  const domain = normalizeDomain(pick(payload, 'domain'));
  if (!domain) errors.push('domain zorunlu');

  const snapshotDate = toDateOnlyOrNull(pick(payload, 'snapshotDate'));
  if (!snapshotDate) errors.push('snapshotDate zorunlu ve geçerli bir tarih olmalı');

  const ubersuggestProjectId = toStringOrNull(pick(payload, 'projectId', 'ubersuggestProjectId'));

  // --- Dizi alanlarının tipini önceden doğrula ---
  const arrayFields = {
    domainHistory: pick(payload, 'domainHistory'),
    keywords: pick(payload, 'keywords'),
    averagePositions: pick(payload, 'averagePositions'),
    topPages: pick(payload, 'topPages'),
    competitors: pick(payload, 'competitors'),
    backlinks: pick(payload, 'backlinks'),
    anchorTexts: pick(payload, 'anchorTexts'),
    newLinkingDomains: pick(payload, 'newLinkingDomains'),
    lostLinkingDomains: pick(payload, 'lostLinkingDomains'),
    backlinkOpportunities: pick(payload, 'backlinkOpportunities'),
    auditIssues: pick(payload, 'auditIssues'),
  };
  const arrays = {};
  for (const [field, value] of Object.entries(arrayFields)) {
    const parsed = toArray(value);
    if (parsed === null) errors.push(`${field} bir dizi olmalı`);
    arrays[field] = parsed || [];
  }

  const rankTrackingInput = splitSummaryAndItems(pick(payload, 'rankTracking'), 'keywords', 'tracked');
  if (!rankTrackingInput.valid) errors.push('rankTracking bir dizi ya da { summary, items } nesnesi olmalı');

  const opportunitiesInput = splitSummaryAndItems(pick(payload, 'opportunities'), 'opportunities');
  if (!opportunitiesInput.valid) errors.push('opportunities bir dizi ya da { summary, items } nesnesi olmalı');

  const pageSpeedInput = pick(payload, 'pageSpeed', 'pagespeed');
  let pageSpeedRows = [];
  if (Array.isArray(pageSpeedInput)) {
    pageSpeedRows = pageSpeedInput;
  } else if (pageSpeedInput && typeof pageSpeedInput === 'object') {
    // { desktop: {...}, mobile: {...} } biçimini satırlara çevirir.
    for (const key of ['desktop', 'mobile', 'DESKTOP', 'MOBILE']) {
      const entry = pageSpeedInput[key];
      if (entry && typeof entry === 'object') pageSpeedRows.push({ device: key, ...entry });
    }
    if (pageSpeedRows.length === 0 && pick(pageSpeedInput, 'device')) pageSpeedRows = [pageSpeedInput];
  } else if (pageSpeedInput !== null && pageSpeedInput !== undefined) {
    errors.push('pageSpeed bir dizi ya da { desktop, mobile } nesnesi olmalı');
  }

  const aiVisibility = pick(payload, 'aiVisibility');
  if (aiVisibility !== null && aiVisibility !== undefined && (typeof aiVisibility !== 'object' || Array.isArray(aiVisibility))) {
    errors.push('aiVisibility bir nesne olmalı');
  }
  const aiInput = aiVisibility && typeof aiVisibility === 'object' && !Array.isArray(aiVisibility) ? aiVisibility : {};

  const aiProvidersRaw = pick(aiInput, 'providers');
  let aiProviderRows = [];
  if (Array.isArray(aiProvidersRaw)) {
    aiProviderRows = aiProvidersRaw;
  } else if (aiProvidersRaw && typeof aiProvidersRaw === 'object') {
    aiProviderRows = Object.entries(aiProvidersRaw).map(([provider, entry]) => ({ provider, ...(entry || {}) }));
  } else if (aiProvidersRaw !== null && aiProvidersRaw !== undefined) {
    errors.push('aiVisibility.providers bir dizi ya da nesne olmalı');
  }

  const aiCompetitorsRaw = toArray(pick(aiInput, 'competitors'));
  if (aiCompetitorsRaw === null) errors.push('aiVisibility.competitors bir dizi olmalı');

  const projectInfoRaw = pick(payload, 'projectInfo');
  if (projectInfoRaw !== null && projectInfoRaw !== undefined && (typeof projectInfoRaw !== 'object' || Array.isArray(projectInfoRaw))) {
    errors.push('projectInfo bir nesne olmalı');
  }

  if (errors.length > 0) return { ok: false, errors };

  // --- Snapshot ana kaydı ---
  const overview = pick(payload, 'overview') || {};
  const backlinkOverview = pick(payload, 'backlinkOverview') || {};
  const siteAudit = pick(payload, 'siteAudit') || {};
  const rankSummary = rankTrackingInput.summary || {};
  const opportunitySummary = opportunitiesInput.summary || {};

  // Backlink metrikleri hem overview hem backlinkOverview altında gelebilir.
  const backlinkMetric = (...keys) => {
    const fromDetail = pick(backlinkOverview, ...keys);
    return fromDetail !== undefined ? fromDetail : pick(overview, ...keys);
  };

  const snapshot = {
    clientId,
    domain,
    ubersuggestProjectId,
    snapshotDate,
    source: UBERSUGGEST_SOURCE,

    organicKeywordsCount: toIntOrNull(pick(overview, 'organicKeywordsCount', 'organicKeywords')),
    estimatedOrganicTraffic: toFloatOrNull(pick(overview, 'estimatedOrganicTraffic', 'organicTraffic')),
    paidKeywordsCount: toIntOrNull(pick(overview, 'paidKeywordsCount', 'paidKeywords')),
    estimatedPaidTraffic: toFloatOrNull(pick(overview, 'estimatedPaidTraffic', 'paidTraffic')),
    domainAuthority: toIntOrNull(pick(overview, 'domainAuthority')),
    totalBacklinks: toIntOrNull(backlinkMetric('totalBacklinks', 'backlinks')),
    referringDomains: toIntOrNull(backlinkMetric('referringDomains')),
    followBacklinks: toIntOrNull(backlinkMetric('followBacklinks')),
    nofollowBacklinks: toIntOrNull(backlinkMetric('nofollowBacklinks')),

    siteHealthScore: toFloatOrNull(pick(siteAudit, 'siteHealthScore', 'healthScore')),
    previousSiteHealthScore: toFloatOrNull(pick(siteAudit, 'previousSiteHealthScore')),
    crawledPagesCount: toIntOrNull(pick(siteAudit, 'crawledPagesCount', 'crawledPages')),
    successfulPagesCount: toIntOrNull(pick(siteAudit, 'successfulPagesCount', 'successfulPages')),
    redirectedPagesCount: toIntOrNull(pick(siteAudit, 'redirectedPagesCount', 'redirectedPages')),
    brokenPagesCount: toIntOrNull(pick(siteAudit, 'brokenPagesCount', 'brokenPages')),
    blockedPagesCount: toIntOrNull(pick(siteAudit, 'blockedPagesCount', 'blockedPages')),
    totalIssuesCount: toIntOrNull(pick(siteAudit, 'totalIssuesCount', 'totalIssues')),
    auditLastCrawledAt: toDateOrNull(pick(siteAudit, 'auditLastCrawledAt', 'lastCrawledAt')),

    trackedKeywordsCount: toIntOrNull(pick(rankSummary, 'trackedKeywordsCount', 'trackedKeywords')),
    keywordsUpCount: toIntOrNull(pick(rankSummary, 'keywordsUpCount', 'up')),
    keywordsDownCount: toIntOrNull(pick(rankSummary, 'keywordsDownCount', 'down')),
    keywordsUnchangedCount: toIntOrNull(pick(rankSummary, 'keywordsUnchangedCount', 'unchanged')),
    top3Old: toIntOrNull(pick(rankSummary, 'top3Old')),
    top3New: toIntOrNull(pick(rankSummary, 'top3New')),
    top10Old: toIntOrNull(pick(rankSummary, 'top10Old')),
    top10New: toIntOrNull(pick(rankSummary, 'top10New')),
    top100Old: toIntOrNull(pick(rankSummary, 'top100Old')),
    top100New: toIntOrNull(pick(rankSummary, 'top100New')),
    notRankingOld: toIntOrNull(pick(rankSummary, 'notRankingOld')),
    notRankingNew: toIntOrNull(pick(rankSummary, 'notRankingNew')),

    newContentOpportunityCount: toIntOrNull(pick(opportunitySummary, 'newContentOpportunityCount', 'newContent')),
    existingContentOpportunityCount: toIntOrNull(pick(opportunitySummary, 'existingContentOpportunityCount', 'existingContent')),
    quickWinOpportunityCount: toIntOrNull(pick(opportunitySummary, 'quickWinOpportunityCount', 'quickWin')),

    aiVisibilityPercentage: toFloatOrNull(pick(aiInput, 'visibilityPercentage', 'aiVisibilityPercentage')),
    aiVisibilityChange: toFloatOrNull(pick(aiInput, 'visibilityChange', 'aiVisibilityChange')),
    aiAverageRank: toFloatOrNull(pick(aiInput, 'averageRank', 'aiAverageRank')),
    aiAverageRankChange: toFloatOrNull(pick(aiInput, 'averageRankChange', 'aiAverageRankChange')),
    aiTotalMentions: toIntOrNull(pick(aiInput, 'totalMentions', 'aiTotalMentions')),
    aiShareOfVoice: toFloatOrNull(pick(aiInput, 'shareOfVoice', 'aiShareOfVoice')),
    aiSentimentScore: toFloatOrNull(pick(aiInput, 'sentimentScore', 'aiSentimentScore')),
    aiSentimentLabel: toStringOrNull(pick(aiInput, 'sentimentLabel', 'aiSentimentLabel')),
    aiTotalAnswers: toIntOrNull(pick(aiInput, 'totalAnswers', 'aiTotalAnswers')),
    aiTotalPrompts: toIntOrNull(pick(aiInput, 'totalPrompts', 'aiTotalPrompts')),
    aiTotalCompetitors: toIntOrNull(pick(aiInput, 'totalCompetitors', 'aiTotalCompetitors')),

    rawResponseJson: toJsonOrNull(pick(payload, 'raw', 'rawResponseJson')),
  };

  // --- Alt kayıtlar ---
  const before = {};
  const track = (bucket, rows) => {
    before[bucket] = rows.length;
    return rows;
  };

  let domainHistory = track('domainHistory', arrays.domainHistory)
    .map((row) => ({
      yearMonth: toStringOrNull(pick(row, 'yearMonth', 'month', 'date')),
      estimatedOrganicTraffic: toFloatOrNull(pick(row, 'estimatedOrganicTraffic', 'organicTraffic')),
      organicKeywordsCount: toIntOrNull(pick(row, 'organicKeywordsCount', 'organicKeywords')),
      estimatedPaidTraffic: toFloatOrNull(pick(row, 'estimatedPaidTraffic', 'paidTraffic')),
      paidKeywordsCount: toIntOrNull(pick(row, 'paidKeywordsCount', 'paidKeywords')),
      topTierKeywords: toIntOrNull(pick(row, 'topTierKeywords')),
      secondTierKeywords: toIntOrNull(pick(row, 'secondTierKeywords')),
      thirdTierKeywords: toIntOrNull(pick(row, 'thirdTierKeywords')),
      fourthTierKeywords: toIntOrNull(pick(row, 'fourthTierKeywords')),
    }))
    .filter((row) => row.yearMonth !== null);
  domainHistory = dedupeBy(domainHistory, (row) => row.yearMonth);
  noteSkipped('domainHistory', before.domainHistory - domainHistory.length);

  let keywords = track('keywords', arrays.keywords)
    .map((row) => {
      const rankingUrl = toStringOrNull(pick(row, 'rankingUrl', 'url'));
      return {
        keyword: toStringOrNull(pick(row, 'keyword')),
        searchIntent: toStringOrNull(pick(row, 'searchIntent', 'intent')),
        currentPosition: toIntOrNull(pick(row, 'currentPosition', 'position')),
        searchVolume: toIntOrNull(pick(row, 'searchVolume', 'volume')),
        seoDifficulty: toFloatOrNull(pick(row, 'seoDifficulty', 'sd')),
        paidDifficulty: toFloatOrNull(pick(row, 'paidDifficulty', 'pd')),
        competition: toFloatOrNull(pick(row, 'competition')),
        cpc: toFloatOrNull(pick(row, 'cpc')),
        estimatedTraffic: toFloatOrNull(pick(row, 'estimatedTraffic', 'traffic')),
        rankingUrl,
        rankingPath: pathFromUrl(rankingUrl, pick(row, 'rankingPath', 'path')),
        positionGroup: toStringOrNull(pick(row, 'positionGroup')),
        sourceUpdatedAt: toDateOrNull(pick(row, 'sourceUpdatedAt', 'updatedAt')),
      };
    })
    .filter((row) => row.keyword !== null);
  keywords = dedupeBy(keywords, (row) => `${row.keyword}\u0000${row.rankingUrl ?? ''}`);
  noteSkipped('keywords', before.keywords - keywords.length);

  const rankTracking = track('rankTracking', rankTrackingInput.items)
    .map((row) => ({
      keyword: toStringOrNull(pick(row, 'keyword')),
      language: toStringOrNull(pick(row, 'language', 'lang')),
      locationId: toStringOrNull(pick(row, 'locationId', 'loc')),
      device: toDeviceOrNull(pick(row, 'device')),
      searchVolume: toIntOrNull(pick(row, 'searchVolume', 'volume')),
      seoDifficulty: toFloatOrNull(pick(row, 'seoDifficulty', 'sd')),
      competition: toFloatOrNull(pick(row, 'competition')),
      oldPosition: toIntOrNull(pick(row, 'oldPosition')),
      oldPositionDate: toDateOrNull(pick(row, 'oldPositionDate')),
      oldRankingUrl: toStringOrNull(pick(row, 'oldRankingUrl')),
      newPosition: toIntOrNull(pick(row, 'newPosition')),
      newPositionDate: toDateOrNull(pick(row, 'newPositionDate')),
      newRankingUrl: toStringOrNull(pick(row, 'newRankingUrl')),
      positionChange: toIntOrNull(pick(row, 'positionChange')),
      rankingStatus: toStringOrNull(pick(row, 'rankingStatus', 'status')),
      isRankingTop100: toBoolOrNull(pick(row, 'isRankingTop100')),
      isUnstable: toBoolOrNull(pick(row, 'isUnstable')),
      sourceUpdatedAt: toDateOrNull(pick(row, 'sourceUpdatedAt', 'updatedAt')),
    }))
    .filter((row) => row.keyword !== null);
  noteSkipped('rankTracking', before.rankTracking - rankTracking.length);

  let averagePositions = track('averagePositions', arrays.averagePositions)
    .map((row) => ({
      date: toDateOnlyOrNull(pick(row, 'date')),
      averagePosition: toFloatOrNull(pick(row, 'averagePosition', 'position', 'value')),
    }))
    .filter((row) => row.date !== null);
  averagePositions = dedupeBy(averagePositions, (row) => row.date.getTime());
  noteSkipped('averagePositions', before.averagePositions - averagePositions.length);

  const topPages = track('topPages', arrays.topPages)
    .map((row) => {
      const url = toStringOrNull(pick(row, 'url'));
      return {
        url,
        path: pathFromUrl(url, pick(row, 'path')),
        pageTitle: toStringOrNull(pick(row, 'pageTitle', 'title')),
        estimatedOrganicTraffic: toFloatOrNull(pick(row, 'estimatedOrganicTraffic', 'organicTraffic', 'traffic')),
        backlinks: toIntOrNull(pick(row, 'backlinks')),
        referringDomains: toIntOrNull(pick(row, 'referringDomains')),
        facebookShares: toIntOrNull(pick(row, 'facebookShares')),
        pinterestShares: toIntOrNull(pick(row, 'pinterestShares')),
        redditShares: toIntOrNull(pick(row, 'redditShares')),
      };
    })
    .filter((row) => row.url !== null);
  noteSkipped('topPages', before.topPages - topPages.length);

  const competitors = track('competitors', arrays.competitors)
    .map((row) => ({
      competitorDomain: normalizeDomain(pick(row, 'competitorDomain', 'domain')),
      commonKeywordCount: toIntOrNull(pick(row, 'commonKeywordCount', 'commonKeywords')),
      competitorOrganicKeywordsCount: toIntOrNull(pick(row, 'competitorOrganicKeywordsCount', 'organicKeywords')),
      keywordGapCount: toIntOrNull(pick(row, 'keywordGapCount', 'keywordGap')),
      competitorEstimatedOrganicTraffic: toFloatOrNull(pick(row, 'competitorEstimatedOrganicTraffic', 'estimatedOrganicTraffic', 'organicTraffic')),
      competitorBacklinks: toIntOrNull(pick(row, 'competitorBacklinks', 'backlinks')),
      competitorDomainAuthority: toIntOrNull(pick(row, 'competitorDomainAuthority', 'domainAuthority')),
    }))
    .filter((row) => row.competitorDomain !== null);
  noteSkipped('competitors', before.competitors - competitors.length);

  const backlinks = track('backlinks', arrays.backlinks)
    .map((row) => {
      const sourceUrl = toStringOrNull(pick(row, 'sourceUrl'));
      return {
        sourceUrl,
        sourceDomain: normalizeDomain(pick(row, 'sourceDomain')) || normalizeDomain(sourceUrl),
        targetUrl: toStringOrNull(pick(row, 'targetUrl')),
        anchorText: toStringOrNull(pick(row, 'anchorText')),
        firstSeen: toDateOrNull(pick(row, 'firstSeen')),
        lastSeen: toDateOrNull(pick(row, 'lastSeen')),
        sourceDomainRank: toIntOrNull(pick(row, 'sourceDomainRank')),
        sourcePageRank: toIntOrNull(pick(row, 'sourcePageRank')),
        backlinkType: toStringOrNull(pick(row, 'backlinkType')),
        followStatus: toStringOrNull(pick(row, 'followStatus')),
      };
    })
    .filter((row) => row.sourceUrl !== null);
  noteSkipped('backlinks', before.backlinks - backlinks.length);

  const anchorTexts = track('anchorTexts', arrays.anchorTexts)
    .map((row) => ({
      anchorText: toStringOrNull(pick(row, 'anchorText', 'anchor')),
      externalRootDomains: toIntOrNull(pick(row, 'externalRootDomains')),
      externalPages: toIntOrNull(pick(row, 'externalPages')),
    }))
    .filter((row) => row.anchorText !== null);
  noteSkipped('anchorTexts', before.anchorTexts - anchorTexts.length);

  const mapLinkingDomains = (rows, defaultStatus) =>
    rows
      .map((row) => ({
        referringDomain: normalizeDomain(pick(row, 'referringDomain', 'domain')) || normalizeDomain(row),
        detectedDate: toDateOrNull(pick(row, 'detectedDate', 'date')),
        status: toEnumOrNull(pick(row, 'status'), LINKING_STATUSES) || defaultStatus,
      }))
      .filter((row) => row.referringDomain !== null);

  const newLinkingDomains = mapLinkingDomains(arrays.newLinkingDomains, 'new');
  const lostLinkingDomains = mapLinkingDomains(arrays.lostLinkingDomains, 'lost');
  const linkingDomains = [...newLinkingDomains, ...lostLinkingDomains];
  noteSkipped(
    'linkingDomains',
    arrays.newLinkingDomains.length + arrays.lostLinkingDomains.length - linkingDomains.length,
  );

  const backlinkOpportunities = track('backlinkOpportunities', arrays.backlinkOpportunities)
    .map((row) => ({
      referringDomain: normalizeDomain(pick(row, 'referringDomain', 'domain')),
      competitorDomain: normalizeDomain(pick(row, 'competitorDomain')),
      ourDomain: normalizeDomain(pick(row, 'ourDomain')) || domain,
      linksToCompetitor: toIntOrNull(pick(row, 'linksToCompetitor')),
      linksToUs: toIntOrNull(pick(row, 'linksToUs')),
      opportunityStatus: toStringOrNull(pick(row, 'opportunityStatus', 'status')),
    }))
    .filter((row) => row.referringDomain !== null);
  noteSkipped('backlinkOpportunities', before.backlinkOpportunities - backlinkOpportunities.length);

  let skippedAuditUrls = 0;
  const auditIssues = track('auditIssues', arrays.auditIssues)
    .map((row) => {
      const rawUrls = pick(row, 'affectedUrls', 'urls');
      const urlRows = Array.isArray(rawUrls) ? rawUrls : [];
      const affectedUrls = urlRows
        .map((urlRow) => ({
          url: toStringOrNull(pick(urlRow, 'url')),
          httpStatus: toIntOrNull(pick(urlRow, 'httpStatus', 'statusCode')),
          issueStatus: toStringOrNull(pick(urlRow, 'issueStatus', 'status')),
          recommendation: toStringOrNull(pick(urlRow, 'recommendation')),
          ignored: toBoolOrNull(pick(urlRow, 'ignored')),
          diffStatus: toStringOrNull(pick(urlRow, 'diffStatus')),
        }))
        .filter((urlRow) => urlRow.url !== null);
      skippedAuditUrls += urlRows.length - affectedUrls.length;

      return {
        issueId: toStringOrNull(pick(row, 'issueId', 'id')),
        issueCategory: toEnumOrNull(pick(row, 'issueCategory', 'category'), AUDIT_CATEGORIES),
        issueLevel: toEnumOrNull(pick(row, 'issueLevel', 'level'), AUDIT_LEVELS),
        issueCount: toIntOrNull(pick(row, 'issueCount', 'count')),
        seoImpact: toEnumOrNull(pick(row, 'seoImpact', 'impact'), SEO_IMPACTS),
        difficulty: toEnumOrNull(pick(row, 'difficulty'), DIFFICULTIES),
        affectedUrls,
      };
    })
    .filter((row) => row.issueId !== null);
  noteSkipped('auditIssues', before.auditIssues - auditIssues.length);
  noteSkipped('auditIssueUrls', skippedAuditUrls);

  const opportunities = track('opportunities', opportunitiesInput.items)
    .map((row) => ({
      opportunityType: toStringOrNull(pick(row, 'opportunityType', 'type')),
      opportunitySubtype: toStringOrNull(pick(row, 'opportunitySubtype', 'subtype')),
      keyword: toStringOrNull(pick(row, 'keyword')),
      currentPosition: toIntOrNull(pick(row, 'currentPosition', 'position')),
      searchVolume: toIntOrNull(pick(row, 'searchVolume', 'volume')),
      seoDifficulty: toFloatOrNull(pick(row, 'seoDifficulty')),
      paidDifficulty: toFloatOrNull(pick(row, 'paidDifficulty')),
      competition: toFloatOrNull(pick(row, 'competition')),
      cpc: toFloatOrNull(pick(row, 'cpc')),
      rankingUrl: toStringOrNull(pick(row, 'rankingUrl', 'url')),
      estimatedTraffic: toFloatOrNull(pick(row, 'estimatedTraffic', 'traffic')),
      impact: toStringOrNull(pick(row, 'impact')),
      effort: toStringOrNull(pick(row, 'effort')),
      approved: toBoolOrNull(pick(row, 'approved')),
      opportunityStatus: toStringOrNull(pick(row, 'opportunityStatus', 'status')),
    }))
    .filter((row) => row.opportunityType !== null);
  noteSkipped('opportunities', before.opportunities - opportunities.length);

  // PageSpeed: status "pending" ise metrikler null bırakılır, tahmini değer üretilmez.
  let pagespeed = pageSpeedRows
    .map((row) => ({
      device: toDeviceOrNull(pick(row, 'device')),
      status: toStringOrNull(pick(row, 'status')),
      performanceScore: toFloatOrNull(pick(row, 'performanceScore', 'performance')),
      seoScore: toFloatOrNull(pick(row, 'seoScore', 'seo')),
      accessibilityScore: toFloatOrNull(pick(row, 'accessibilityScore', 'accessibility')),
      bestPracticesScore: toFloatOrNull(pick(row, 'bestPracticesScore', 'bestPractices')),
      coreWebVitalsStatus: toStringOrNull(pick(row, 'coreWebVitalsStatus', 'coreWebVitals')),
      lcp: toFloatOrNull(pick(row, 'lcp')),
      inp: toFloatOrNull(pick(row, 'inp')),
      cls: toFloatOrNull(pick(row, 'cls')),
      fcp: toFloatOrNull(pick(row, 'fcp')),
      ttfb: toFloatOrNull(pick(row, 'ttfb')),
      speedIndex: toFloatOrNull(pick(row, 'speedIndex')),
      checkedAt: toDateOrNull(pick(row, 'checkedAt')),
    }))
    .filter((row) => row.device !== null);
  pagespeed = dedupeBy(pagespeed, (row) => row.device);
  noteSkipped('pagespeed', pageSpeedRows.length - pagespeed.length);

  let aiProviders = aiProviderRows
    .map((row) => ({
      provider: toEnumOrNull(pick(row, 'provider'), AI_PROVIDERS),
      visibilityPercentage: toFloatOrNull(pick(row, 'visibilityPercentage')),
      visibilityChange: toFloatOrNull(pick(row, 'visibilityChange')),
      averageRank: toFloatOrNull(pick(row, 'averageRank')),
      averageRankChange: toFloatOrNull(pick(row, 'averageRankChange')),
      totalMentions: toIntOrNull(pick(row, 'totalMentions')),
      sentimentScore: toFloatOrNull(pick(row, 'sentimentScore')),
      sentimentLabel: toStringOrNull(pick(row, 'sentimentLabel')),
      positiveKeywordsJson: toJsonOrNull(pick(row, 'positiveKeywords', 'positiveKeywordsJson')),
      negativeKeywordsJson: toJsonOrNull(pick(row, 'negativeKeywords', 'negativeKeywordsJson')),
    }))
    .filter((row) => row.provider !== null);
  aiProviders = dedupeBy(aiProviders, (row) => row.provider);
  noteSkipped('aiProviders', aiProviderRows.length - aiProviders.length);

  const aiCompetitors = (aiCompetitorsRaw || [])
    .map((row) => ({
      brandName: toStringOrNull(pick(row, 'brandName', 'brand', 'name')),
      isUserBrand: toBoolOrNull(pick(row, 'isUserBrand')),
      isTracked: toBoolOrNull(pick(row, 'isTracked')),
      isPinned: toBoolOrNull(pick(row, 'isPinned')),
      averageRank: toFloatOrNull(pick(row, 'averageRank')),
      totalMentions: toIntOrNull(pick(row, 'totalMentions')),
      visibilityPercentage: toFloatOrNull(pick(row, 'visibilityPercentage')),
      sentimentScore: toFloatOrNull(pick(row, 'sentimentScore')),
      sentimentPositivePercentage: toFloatOrNull(pick(row, 'sentimentPositivePercentage')),
      sentimentNegativePercentage: toFloatOrNull(pick(row, 'sentimentNegativePercentage')),
      sentimentNeutralPercentage: toFloatOrNull(pick(row, 'sentimentNeutralPercentage')),
      sentimentLabel: toStringOrNull(pick(row, 'sentimentLabel')),
    }))
    .filter((row) => row.brandName !== null);
  noteSkipped('aiCompetitors', (aiCompetitorsRaw || []).length - aiCompetitors.length);

  const intentsRaw = pick(aiInput, 'intents', 'intentDistribution');
  const aiIntents = [];
  if (intentsRaw && typeof intentsRaw === 'object' && !Array.isArray(intentsRaw)) {
    const row = {
      informationalCount: toIntOrNull(pick(intentsRaw, 'informationalCount', 'informational')),
      navigationalCount: toIntOrNull(pick(intentsRaw, 'navigationalCount', 'navigational')),
      commercialCount: toIntOrNull(pick(intentsRaw, 'commercialCount', 'commercial')),
      transactionalCount: toIntOrNull(pick(intentsRaw, 'transactionalCount', 'transactional')),
    };
    // Tüm alanlar null ise boş satır yazmaya gerek yok.
    if (Object.values(row).some((v) => v !== null)) aiIntents.push(row);
  }

  // --- Proje bilgisi (snapshot'tan bağımsız, client + projectId bazlı) ---
  let project = null;
  const projectInfo = projectInfoRaw && typeof projectInfoRaw === 'object' && !Array.isArray(projectInfoRaw) ? projectInfoRaw : null;
  const projectIdForRecord = toStringOrNull(pick(projectInfo || {}, 'ubersuggestProjectId', 'projectId')) || ubersuggestProjectId;
  if (projectInfo && projectIdForRecord) {
    const locationsRaw = toArray(pick(projectInfo, 'locations')) || [];
    const projectCompetitorsRaw = toArray(pick(projectInfo, 'competitors')) || [];

    const locations = locationsRaw
      .map((row) => ({
        language: toStringOrNull(pick(row, 'language', 'lang')),
        locationId: toStringOrNull(pick(row, 'locationId', 'loc')),
      }))
      .filter((row) => row.language !== null || row.locationId !== null);

    const projectCompetitors = projectCompetitorsRaw
      .map((row) => ({
        competitorDomain: normalizeDomain(pick(row, 'competitorDomain', 'domain')) || normalizeDomain(row),
        language: toStringOrNull(pick(row, 'language', 'lang')),
        locationId: toStringOrNull(pick(row, 'locationId', 'loc')),
      }))
      .filter((row) => row.competitorDomain !== null);

    project = {
      clientId,
      ubersuggestProjectId: projectIdForRecord,
      domain: normalizeDomain(pick(projectInfo, 'domain')) || domain,
      projectTitle: toStringOrNull(pick(projectInfo, 'projectTitle', 'title')),
      projectStatus: toStringOrNull(pick(projectInfo, 'projectStatus', 'status')),
      projectType: toStringOrNull(pick(projectInfo, 'projectType', 'type')),
      updateFrequency: toStringOrNull(pick(projectInfo, 'updateFrequency')),
      mobileRankTrackingEnabled: toBoolOrNull(pick(projectInfo, 'mobileRankTrackingEnabled')),
      pixelRankTrackingEnabled: toBoolOrNull(pick(projectInfo, 'pixelRankTrackingEnabled')),
      alertsEnabled: toBoolOrNull(pick(projectInfo, 'alertsEnabled')),
      hasAiBrandTracking: toBoolOrNull(pick(projectInfo, 'hasAiBrandTracking')),
      trackedKeywordCount: toIntOrNull(pick(projectInfo, 'trackedKeywordCount')),
      trackedCompetitorCount: toIntOrNull(pick(projectInfo, 'trackedCompetitorCount')),
      trackedLocationCount: toIntOrNull(pick(projectInfo, 'trackedLocationCount')),
      keywordsLastUpdatedAt: toDateOrNull(pick(projectInfo, 'keywordsLastUpdatedAt')),
      auditLastUpdatedAt: toDateOrNull(pick(projectInfo, 'auditLastUpdatedAt')),
      trafficValueLastUpdatedAt: toDateOrNull(pick(projectInfo, 'trafficValueLastUpdatedAt')),
      keywordLimit: toIntOrNull(pick(projectInfo, 'keywordLimit')),
      keywordUsed: toIntOrNull(pick(projectInfo, 'keywordUsed')),
      competitorLimit: toIntOrNull(pick(projectInfo, 'competitorLimit')),
      competitorUsed: toIntOrNull(pick(projectInfo, 'competitorUsed')),
      locationLimit: toIntOrNull(pick(projectInfo, 'locationLimit')),
      locationUsed: toIntOrNull(pick(projectInfo, 'locationUsed')),
      aiPromptLimit: toIntOrNull(pick(projectInfo, 'aiPromptLimit')),
      aiPromptUsed: toIntOrNull(pick(projectInfo, 'aiPromptUsed')),
      locations,
      competitors: projectCompetitors,
    };
  }

  return {
    ok: true,
    value: {
      snapshot,
      children: {
        domainHistory,
        keywords,
        rankTracking,
        averagePositions,
        topPages,
        competitors,
        backlinks,
        anchorTexts,
        linkingDomains,
        backlinkOpportunities,
        auditIssues,
        opportunities,
        pagespeed,
        aiProviders,
        aiCompetitors,
        aiIntents,
      },
      project,
      skipped,
    },
  };
}
