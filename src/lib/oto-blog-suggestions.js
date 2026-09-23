import prisma from '@/lib/prisma';
import { keywordWasUsed, normalizeKeyword } from '@/lib/oto-blog';

const SUGGESTION_LIMIT = 24;

function scoreSuggestion(row) {
  const subtype = String(row.subtype || '').toLowerCase();
  const type = String(row.type || '').toUpperCase();
  let score = row.volume || 0;
  if (type === 'KEYWORD_OPPORTUNITY') score += 5000;
  if (subtype.includes('new') || subtype.includes('content')) score += 4000;
  if (subtype.includes('quick')) score += 3000;
  if (row.position != null && row.position >= 4 && row.position <= 20) score += 1500;
  if (String(row.intent || '').toLowerCase().includes('inform')) score += 800;
  if (!row.rankingUrl) score += 400;
  return score;
}

export async function loadOtoBlogKeywordSuggestions(clientId, usedKeywords = []) {
  const id = Number(clientId);
  if (!Number.isFinite(id)) return [];

  const snapshot = await prisma.seoUbersuggestSnapshot.findFirst({
    where: { clientId: id },
    orderBy: [{ snapshotDate: 'desc' }, { id: 'desc' }],
    select: { id: true },
  });

  const [opportunities, keywords, tasks] = await Promise.all([
    snapshot
      ? prisma.seoUbersuggestOpportunity.findMany({
          where: { snapshotId: snapshot.id, keyword: { not: null } },
          orderBy: { searchVolume: 'desc' },
          take: 50,
          select: {
            keyword: true,
            opportunityType: true,
            opportunitySubtype: true,
            searchVolume: true,
            currentPosition: true,
            rankingUrl: true,
          },
        })
      : [],
    snapshot
      ? prisma.seoUbersuggestKeyword.findMany({
          where: { snapshotId: snapshot.id, searchVolume: { gt: 0 } },
          orderBy: { searchVolume: 'desc' },
          take: 50,
          select: {
            keyword: true,
            searchVolume: true,
            currentPosition: true,
            searchIntent: true,
            rankingUrl: true,
          },
        })
      : [],
    prisma.task.findMany({
      where: { clientId: id, type: 'BLOG' },
      select: { note: true, content: true, link: true },
    }),
  ]);

  const blogTexts = tasks.flatMap((task) => [task.note, task.content, task.link].filter(Boolean));
  const merged = [];
  const seen = new Set();

  function push(row) {
    const keyword = String(row.keyword || '').trim();
    const key = normalizeKeyword(keyword);
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push({
      keyword,
      volume: row.volume ?? null,
      position: row.position ?? null,
      type: row.type || '',
      subtype: row.subtype || '',
      intent: row.intent || '',
      rankingUrl: row.rankingUrl || '',
    });
  }

  for (const row of opportunities) {
    push({
      keyword: row.keyword,
      volume: row.searchVolume,
      position: row.currentPosition,
      type: row.opportunityType,
      subtype: row.opportunitySubtype,
      rankingUrl: row.rankingUrl,
    });
  }
  for (const row of keywords) {
    push({
      keyword: row.keyword,
      volume: row.searchVolume,
      position: row.currentPosition,
      type: 'KEYWORD',
      intent: row.searchIntent,
      rankingUrl: row.rankingUrl,
    });
  }

  return merged
    .sort((a, b) => scoreSuggestion(b) - scoreSuggestion(a))
    .slice(0, SUGGESTION_LIMIT)
    .map((row) => ({
      keyword: row.keyword,
      volume: row.volume,
      position: row.position,
      used: keywordWasUsed(row.keyword, usedKeywords, blogTexts),
    }));
}
