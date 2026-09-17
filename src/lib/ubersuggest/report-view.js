// Rapor ekranı için Ubersuggest snapshot verisini okur.
// Hiçbir değer türetilmez veya doldurulmaz: DB'de null olan alan null döner,
// ekranda "Veri yok" olarak gösterilir.

import prisma from '../prisma.js';

// Liste satırları UI'da sayfalanır; DB'den tam set çekilir.
export const ROW_LIMIT = null;

const desc = (field) => ({ [field]: { sort: 'desc', nulls: 'last' } });
const asc = (field) => ({ [field]: { sort: 'asc', nulls: 'last' } });

export async function getUbersuggestReport(clientId) {
  const id = Number(clientId);
  if (!Number.isFinite(id)) return { snapshot: null, history: [], projects: [] };

  const [snapshot, history, projects] = await Promise.all([
    prisma.seoUbersuggestSnapshot.findFirst({
      where: { clientId: id },
      orderBy: [{ snapshotDate: 'desc' }, { id: 'desc' }],
      include: {
        domainHistory: { orderBy: { yearMonth: 'asc' } },
        keywords: { orderBy: asc('currentPosition') },
        rankTracking: { orderBy: asc('newPosition') },
        averagePositions: { orderBy: { date: 'asc' } },
        topPages: { orderBy: desc('estimatedOrganicTraffic') },
        competitors: { orderBy: desc('commonKeywordCount') },
        backlinks: { orderBy: desc('sourceDomainRank') },
        anchorTexts: { orderBy: desc('externalRootDomains') },
        linkingDomains: { orderBy: desc('detectedDate') },
        backlinkOpportunities: { orderBy: desc('linksToCompetitor') },
        auditIssues: {
          orderBy: desc('issueCount'),
          include: { affectedUrls: true, _count: { select: { affectedUrls: true } } },
        },
        opportunities: { orderBy: desc('searchVolume') },
        pagespeed: { orderBy: { device: 'asc' } },
        aiProviders: { orderBy: { provider: 'asc' } },
        aiCompetitors: { orderBy: desc('visibilityPercentage') },
        aiIntents: true,
        _count: {
          select: {
            domainHistory: true,
            keywords: true,
            rankTracking: true,
            averagePositions: true,
            topPages: true,
            competitors: true,
            backlinks: true,
            anchorTexts: true,
            linkingDomains: true,
            backlinkOpportunities: true,
            auditIssues: true,
            opportunities: true,
            pagespeed: true,
            aiProviders: true,
            aiCompetitors: true,
            aiIntents: true,
          },
        },
      },
    }),
    prisma.seoUbersuggestSnapshot.findMany({
      where: { clientId: id },
      orderBy: [{ snapshotDate: 'desc' }],
      select: { id: true, domain: true, snapshotDate: true, source: true, createdAt: true, updatedAt: true },
    }),
    prisma.seoUbersuggestProject.findMany({
      where: { clientId: id },
      orderBy: { id: 'asc' },
      include: { locations: true, competitors: true },
    }),
  ]);

  return { snapshot, history, projects };
}

// --- Snapshot ana tablosundaki tüm metrikler, ekrandaki sırayla ---

export const SNAPSHOT_FIELD_GROUPS = [
  {
    title: 'Snapshot Kimliği',
    fields: [
      ['domain', 'Domain', 'text'],
      ['snapshotDate', 'Snapshot tarihi', 'date'],
      ['source', 'Kaynak', 'text'],
      ['ubersuggestProjectId', 'Ubersuggest proje kimliği', 'text'],
      ['createdAt', 'İlk kayıt', 'datetime'],
      ['updatedAt', 'Son güncelleme', 'datetime'],
    ],
  },
  {
    title: 'Domain Genel Bakış',
    note: '"Tahmini" alanlar Ubersuggest kestirimidir, ölçülmüş trafik değildir.',
    fields: [
      ['organicKeywordsCount', 'Organik anahtar kelime sayısı', 'int'],
      ['estimatedOrganicTraffic', 'Tahmini organik trafik', 'float'],
      ['paidKeywordsCount', 'Ücretli anahtar kelime sayısı', 'int'],
      ['estimatedPaidTraffic', 'Tahmini ücretli trafik', 'float'],
      ['domainAuthority', 'Domain authority', 'int'],
      ['totalBacklinks', 'Toplam backlink', 'int'],
      ['referringDomains', 'Referans veren domain', 'int'],
      ['followBacklinks', 'Follow backlink', 'int'],
      ['nofollowBacklinks', 'Nofollow backlink', 'int'],
    ],
  },
  {
    title: 'Site Audit Özeti',
    fields: [
      ['siteHealthScore', 'Site sağlık puanı', 'float'],
      ['previousSiteHealthScore', 'Önceki sağlık puanı', 'float'],
      ['crawledPagesCount', 'Taranan sayfa', 'int'],
      ['successfulPagesCount', 'Başarılı sayfa', 'int'],
      ['redirectedPagesCount', 'Yönlendirilen sayfa', 'int'],
      ['brokenPagesCount', 'Kırık sayfa', 'int'],
      ['blockedPagesCount', 'Engellenen sayfa', 'int'],
      ['totalIssuesCount', 'Toplam sorun', 'int'],
      ['auditLastCrawledAt', 'Son tarama zamanı', 'datetime'],
    ],
  },
  {
    title: 'Sıralama Takibi Özeti',
    fields: [
      ['trackedKeywordsCount', 'Takip edilen kelime', 'int'],
      ['keywordsUpCount', 'Yükselen kelime', 'int'],
      ['keywordsDownCount', 'Düşen kelime', 'int'],
      ['keywordsUnchangedCount', 'Değişmeyen kelime', 'int'],
      ['top3Old', 'İlk 3 (önce)', 'int'],
      ['top3New', 'İlk 3 (şimdi)', 'int'],
      ['top10Old', 'İlk 10 (önce)', 'int'],
      ['top10New', 'İlk 10 (şimdi)', 'int'],
      ['top100Old', 'İlk 100 (önce)', 'int'],
      ['top100New', 'İlk 100 (şimdi)', 'int'],
      ['notRankingOld', 'Sıralamada yok (önce)', 'int'],
      ['notRankingNew', 'Sıralamada yok (şimdi)', 'int'],
    ],
  },
  {
    title: 'SEO Fırsat Özeti',
    fields: [
      ['newContentOpportunityCount', 'Yeni içerik fırsatı', 'int'],
      ['existingContentOpportunityCount', 'Mevcut içerik fırsatı', 'int'],
      ['quickWinOpportunityCount', 'Hızlı kazanım fırsatı', 'int'],
    ],
  },
  {
    title: 'AI Arama Özeti',
    fields: [
      ['aiVisibilityPercentage', 'AI görünürlük', 'pct'],
      ['aiVisibilityChange', 'AI görünürlük değişimi', 'pct'],
      ['aiAverageRank', 'AI ortalama sıra', 'float'],
      ['aiAverageRankChange', 'AI ortalama sıra değişimi', 'float'],
      ['aiTotalMentions', 'AI toplam bahsedilme', 'int'],
      ['aiShareOfVoice', 'AI ses payı', 'pct'],
      ['aiSentimentScore', 'AI duygu puanı', 'float'],
      ['aiSentimentLabel', 'AI duygu etiketi', 'text'],
      ['aiTotalAnswers', 'AI toplam yanıt', 'int'],
      ['aiTotalPrompts', 'AI toplam prompt', 'int'],
      ['aiTotalCompetitors', 'AI rakip sayısı', 'int'],
    ],
  },
];
