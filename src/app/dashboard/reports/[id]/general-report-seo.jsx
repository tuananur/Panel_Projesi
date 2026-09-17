// Genel raporun 31-47. bölümleri: Ubersuggest SEO istihbaratı.
// Tüm değerler araç verisidir; GA4 ve Search Console metrikleriyle aynı satırda toplanmaz.

import { num, pct, EMPTY_VALUE } from '../report-ui';
import { ReportSection, DataTable, MetricGrid } from './general-report-ui';
import { LineChart, BarList } from './report-charts';

const UBER = 'Ubersuggest';
const nf = new Intl.NumberFormat('tr-TR');

const DEVICE_LABELS = { DESKTOP: 'Masaüstü', MOBILE: 'Mobil' };

function hasRows(value) {
  return Array.isArray(value) && value.length > 0;
}

/** JSX bölümleri ve gizlenen bölüm gerekçelerini birlikte döndürür. */
export function buildSeoSections(ubersuggest) {
  const sections = [];
  const hidden = [];
  const add = (node) => sections.push(node);
  const skip = (no, title, reason) => hidden.push({ no, title, reason });

  const snapshot = ubersuggest?.snapshot || null;

  if (!snapshot) {
    [
      [31, 'Domain Overview'],
      [32, 'Organik Trafik / Keyword Tarihçesi'],
      [33, 'Rakip Analizi'],
      [34, 'Keyword Gap'],
      [35, 'Backlink Overview'],
      [36, 'Yeni / Kaybedilen Referans Domainler'],
      [37, 'Anchor Text Analizi'],
      [38, 'Backlink Fırsatları'],
      [39, 'Teknik SEO Sağlığı'],
      [40, 'Teknik SEO Sorunları'],
      [41, 'Sorunlu URL Listesi'],
      [42, 'PageSpeed / Core Web Vitals'],
      [43, 'SEO Fırsatları'],
      [44, 'AI Arama Görünürlüğü'],
      [45, 'AI Platform Kırılımı'],
      [46, 'AI Rakip Karşılaştırması'],
      [47, 'AI Arama Niyeti'],
    ].forEach(([no, title]) => skip(no, title, 'Bu müşteri için kayıtlı Ubersuggest snapshot yok'));
    return { sections, hidden };
  }

  const counts = snapshot._count || {};
  const snapshotNote = `Snapshot tarihi: ${new Date(snapshot.snapshotDate).toLocaleDateString('tr-TR')} · domain: ${snapshot.domain}`;

  // ------------------------------------------------------------------ 31
  add(
    <ReportSection key="s31" no={31} title="Domain Overview" sources={[UBER]} note={`${snapshotNote}. Trafik değerleri araç tahminidir.`}>
      <MetricGrid
        items={[
          { label: 'Organik keyword', source: UBER, value: num(snapshot.organicKeywordsCount) },
          { label: 'Tahmini organik trafik', source: UBER, value: num(snapshot.estimatedOrganicTraffic) },
          { label: 'Paid keyword', source: UBER, value: num(snapshot.paidKeywordsCount) },
          { label: 'Tahmini paid trafik', source: UBER, value: num(snapshot.estimatedPaidTraffic) },
          { label: 'Domain Authority', source: UBER, value: num(snapshot.domainAuthority) },
          { label: 'Backlink', source: UBER, value: num(snapshot.totalBacklinks) },
          { label: 'Referans domain', source: UBER, value: num(snapshot.referringDomains) },
        ]}
      />
    </ReportSection>,
  );

  // ------------------------------------------------------------------ 32
  if (hasRows(snapshot.domainHistory)) {
    add(
      <ReportSection key="s32" no={32} title="Organik Trafik / Keyword Tarihçesi" sources={[UBER]} note="Aylık araç tahmini geçmişi.">
        <LineChart
          data={snapshot.domainHistory.map((row) => ({ label: row.yearMonth, ...row }))}
          series={[
            { key: 'estimatedOrganicTraffic', label: 'Tahmini organik trafik', color: '#A142F4' },
            { key: 'organicKeywordsCount', label: 'Organik keyword sayısı' },
          ]}
        />
        <DataTable
          columns={[
            { key: 'yearMonth', label: 'Ay', type: 'text' },
            { key: 'estimatedOrganicTraffic', label: 'Tahmini trafik', type: 'float' },
            { key: 'organicKeywordsCount', label: 'Organik KW', type: 'int' },
            { key: 'paidKeywordsCount', label: 'Paid KW', type: 'int' },
            { key: 'topTierKeywords', label: '1-3', type: 'int' },
            { key: 'secondTierKeywords', label: '4-10', type: 'int' },
            { key: 'thirdTierKeywords', label: '11-50', type: 'int' },
            { key: 'fourthTierKeywords', label: '51+', type: 'int' },
          ]}
          rows={[...snapshot.domainHistory].reverse()}
          limit={24}
        />
      </ReportSection>,
    );
  } else {
    skip(32, 'Organik Trafik / Keyword Tarihçesi', 'Ubersuggest domain geçmişi yok');
  }

  // ------------------------------------------------------------------ 33
  if (hasRows(snapshot.competitors)) {
    add(
      <ReportSection key="s33" no={33} title="Rakip Analizi" sources={[UBER]}>
        <DataTable
          columns={[
            { key: 'competitorDomain', label: 'Rakip', type: 'text' },
            { key: 'commonKeywordCount', label: 'Ortak KW', type: 'int' },
            { key: 'competitorOrganicKeywordsCount', label: 'Organik KW', type: 'int' },
            { key: 'keywordGapCount', label: 'KW gap', type: 'int' },
            { key: 'competitorEstimatedOrganicTraffic', label: 'Tahmini trafik', type: 'float' },
            { key: 'competitorBacklinks', label: 'Backlink', type: 'int' },
            { key: 'competitorDomainAuthority', label: 'DA', type: 'int' },
          ]}
          rows={snapshot.competitors}
          limit={25}
        />
      </ReportSection>,
    );
  } else {
    skip(33, 'Rakip Analizi', 'Ubersuggest rakip verisi yok');
  }

  // ------------------------------------------------------------------ 34
  const gapRows = (snapshot.competitors || []).filter((row) => (row.keywordGapCount || 0) > 0);
  if (gapRows.length > 0) {
    add(
      <ReportSection
        key="s34"
        no={34}
        title="Keyword Gap"
        sources={[UBER]}
        note="Rakibin sıralandığı, bizim sıralanmadığımız kelime sayısı. Kelime listesi Ubersuggest verisinde yer almadığı için yalnızca sayılar gösterilir."
      >
        <BarList
          rows={gapRows.map((row) => ({ label: row.competitorDomain, value: row.keywordGapCount, common: row.commonKeywordCount }))}
          secondary="common"
          limit={15}
        />
      </ReportSection>,
    );
  } else {
    skip(34, 'Keyword Gap', 'Rakip verisinde keyword gap sayısı yok');
  }

  // ------------------------------------------------------------------ 35
  if (snapshot.totalBacklinks !== null || snapshot.referringDomains !== null) {
    add(
      <ReportSection key="s35" no={35} title="Backlink Overview" sources={[UBER]}>
        <MetricGrid
          items={[
            { label: 'Toplam backlink', source: UBER, value: num(snapshot.totalBacklinks) },
            { label: 'Referans domain', source: UBER, value: num(snapshot.referringDomains) },
            { label: 'Follow', source: UBER, value: num(snapshot.followBacklinks) },
            { label: 'Nofollow', source: UBER, value: num(snapshot.nofollowBacklinks) },
            { label: 'Domain Authority', source: UBER, value: num(snapshot.domainAuthority) },
          ]}
        />
        {hasRows(snapshot.backlinks) && (
          <DataTable
            columns={[
              { key: 'sourceDomain', label: 'Kaynak domain', type: 'text' },
              { key: 'sourceUrl', label: 'Kaynak URL', type: 'text' },
              { key: 'anchorText', label: 'Anchor', type: 'text' },
              { key: 'sourceDomainRank', label: 'DR', type: 'int' },
              { key: 'followStatus', label: 'Durum', type: 'text' },
            ]}
            rows={snapshot.backlinks}
            limit={25}
            totalCount={counts.backlinks}
          />
        )}
      </ReportSection>,
    );
  } else {
    skip(35, 'Backlink Overview', 'Ubersuggest backlink özeti yok');
  }

  // ------------------------------------------------------------------ 36
  const newDomains = (snapshot.linkingDomains || []).filter((row) => row.status === 'new');
  const lostDomains = (snapshot.linkingDomains || []).filter((row) => row.status === 'lost');
  if (newDomains.length > 0 || lostDomains.length > 0) {
    add(
      <ReportSection key="s36" no={36} title="Yeni / Kaybedilen Referans Domainler" sources={[UBER]}>
        {newDomains.length > 0 && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.4rem' }}>Yeni ({nf.format(newDomains.length)})</h3>
            <DataTable
              columns={[
                { key: 'referringDomain', label: 'Domain', type: 'text' },
                { key: 'detectedDate', label: 'Tespit', type: 'date' },
              ]}
              rows={newDomains}
              limit={25}
            />
          </>
        )}
        {lostDomains.length > 0 && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '1.25rem 0 0.4rem' }}>Kaybedilen ({nf.format(lostDomains.length)})</h3>
            <DataTable
              columns={[
                { key: 'referringDomain', label: 'Domain', type: 'text' },
                { key: 'detectedDate', label: 'Tespit', type: 'date' },
              ]}
              rows={lostDomains}
              limit={25}
            />
          </>
        )}
      </ReportSection>,
    );
  } else {
    skip(36, 'Yeni / Kaybedilen Referans Domainler', 'Ubersuggest referans domain hareketi yok');
  }

  // ------------------------------------------------------------------ 37
  if (hasRows(snapshot.anchorTexts)) {
    add(
      <ReportSection key="s37" no={37} title="Anchor Text Analizi" sources={[UBER]}>
        <DataTable
          columns={[
            { key: 'anchorText', label: 'Anchor', type: 'text' },
            { key: 'externalRootDomains', label: 'Domain', type: 'int' },
            { key: 'externalPages', label: 'Sayfa', type: 'int' },
          ]}
          rows={snapshot.anchorTexts}
          limit={25}
          totalCount={counts.anchorTexts}
        />
      </ReportSection>,
    );
  } else {
    skip(37, 'Anchor Text Analizi', 'Ubersuggest anchor verisi yok');
  }

  // ------------------------------------------------------------------ 38
  if (hasRows(snapshot.backlinkOpportunities)) {
    add(
      <ReportSection
        key="s38"
        no={38}
        title="Backlink Fırsatları"
        sources={[UBER]}
        note="Rakibe link veren, size vermeyen siteler."
      >
        <DataTable
          columns={[
            { key: 'referringDomain', label: 'Domain', type: 'text' },
            { key: 'competitorDomain', label: 'Rakip', type: 'text' },
            { key: 'linksToCompetitor', label: 'Rakibe link', type: 'int' },
            { key: 'linksToUs', label: 'Bize link', type: 'int' },
            { key: 'opportunityStatus', label: 'Durum', type: 'text' },
          ]}
          rows={snapshot.backlinkOpportunities}
          limit={25}
          totalCount={counts.backlinkOpportunities}
        />
      </ReportSection>,
    );
  } else {
    skip(38, 'Backlink Fırsatları', 'Ubersuggest backlink fırsatı yok');
  }

  // ------------------------------------------------------------------ 39
  if (snapshot.siteHealthScore !== null || snapshot.crawledPagesCount !== null) {
    add(
      <ReportSection
        key="s39"
        no={39}
        title="Teknik SEO Sağlığı"
        sources={[UBER]}
        note={snapshot.auditLastCrawledAt ? `Son tarama: ${new Date(snapshot.auditLastCrawledAt).toLocaleDateString('tr-TR')}` : undefined}
      >
        <MetricGrid
          items={[
            {
              label: 'Site sağlık puanı',
              source: UBER,
              value: num(snapshot.siteHealthScore),
              hint: snapshot.previousSiteHealthScore !== null ? `Önceki: ${nf.format(snapshot.previousSiteHealthScore)}` : null,
            },
            { label: 'Taranan sayfa', source: UBER, value: num(snapshot.crawledPagesCount) },
            { label: 'Başarılı', source: UBER, value: num(snapshot.successfulPagesCount) },
            { label: 'Yönlendirilen', source: UBER, value: num(snapshot.redirectedPagesCount) },
            { label: 'Kırık', source: UBER, value: num(snapshot.brokenPagesCount) },
            { label: 'Engellenen', source: UBER, value: num(snapshot.blockedPagesCount) },
            { label: 'Toplam sorun', source: UBER, value: num(snapshot.totalIssuesCount) },
          ]}
        />
      </ReportSection>,
    );
  } else {
    skip(39, 'Teknik SEO Sağlığı', 'Ubersuggest site audit özeti yok');
  }

  // ------------------------------------------------------------------ 40
  if (hasRows(snapshot.auditIssues)) {
    add(
      <ReportSection key="s40" no={40} title="Teknik SEO Sorunları" sources={[UBER]} note="Etki ve zorluk değerleri Ubersuggest sınıflandırmasıdır.">
        <DataTable
          columns={[
            { key: 'issueId', label: 'Sorun', type: 'text' },
            { key: 'issueCategory', label: 'Kategori', type: 'text' },
            { key: 'issueLevel', label: 'Seviye', type: 'text' },
            { key: 'issueCount', label: 'Adet', type: 'int' },
            { key: 'seoImpact', label: 'Etki', type: 'text' },
            { key: 'difficulty', label: 'Zorluk', type: 'text' },
          ]}
          rows={snapshot.auditIssues}
          limit={40}
          totalCount={counts.auditIssues}
        />
      </ReportSection>,
    );
  } else {
    skip(40, 'Teknik SEO Sorunları', 'Ubersuggest audit sorun listesi yok');
  }

  // ------------------------------------------------------------------ 41
  const affectedUrls = (snapshot.auditIssues || []).flatMap((issue) =>
    (issue.affectedUrls || []).map((row) => ({
      issueId: issue.issueId,
      seoImpact: issue.seoImpact,
      difficulty: issue.difficulty,
      url: row.url,
      httpStatus: row.httpStatus,
      issueStatus: row.issueStatus,
      recommendation: row.recommendation,
    })),
  );
  if (affectedUrls.length > 0) {
    add(
      <ReportSection
        key="s41"
        no={41}
        title="Sorunlu URL Listesi"
        sources={[UBER]}
        note="Her sorun için ilk 50 URL saklanır; tam liste Ubersuggest tarafındadır."
      >
        <DataTable
          columns={[
            { key: 'issueId', label: 'Sorun', type: 'text' },
            { key: 'url', label: 'URL', type: 'text' },
            { key: 'httpStatus', label: 'HTTP', type: 'int' },
            { key: 'issueStatus', label: 'Durum', type: 'text' },
            { key: 'seoImpact', label: 'Etki', type: 'text' },
            { key: 'difficulty', label: 'Zorluk', type: 'text' },
            { key: 'recommendation', label: 'Öneri', type: 'text' },
          ]}
          rows={affectedUrls}
          limit={50}
        />
      </ReportSection>,
    );
  } else {
    skip(41, 'Sorunlu URL Listesi', 'Audit sorunlarına bağlı URL kaydı yok');
  }

  // ------------------------------------------------------------------ 42
  if (hasRows(snapshot.pagespeed)) {
    add(
      <ReportSection key="s42" no={42} title="PageSpeed / Core Web Vitals" sources={[UBER]}>
        <DataTable
          columns={[
            { key: 'deviceLabel', label: 'Cihaz', type: 'text' },
            { key: 'performanceScore', label: 'Performans', type: 'float' },
            { key: 'seoScore', label: 'SEO', type: 'float' },
            { key: 'coreWebVitalsStatus', label: 'CWV', type: 'text' },
            { key: 'lcp', label: 'LCP', type: 'float' },
            { key: 'inp', label: 'INP', type: 'float' },
            { key: 'cls', label: 'CLS', type: 'float' },
            { key: 'fcp', label: 'FCP', type: 'float' },
            { key: 'ttfb', label: 'TTFB', type: 'float' },
          ]}
          rows={snapshot.pagespeed.map((row) => ({ ...row, deviceLabel: DEVICE_LABELS[row.device] || row.device }))}
          limit={5}
        />
      </ReportSection>,
    );
  } else {
    skip(42, 'PageSpeed / Core Web Vitals', 'Ubersuggest pagespeed verisi yok');
  }

  // ------------------------------------------------------------------ 43
  if (
    snapshot.newContentOpportunityCount !== null ||
    snapshot.existingContentOpportunityCount !== null ||
    snapshot.quickWinOpportunityCount !== null ||
    hasRows(snapshot.opportunities)
  ) {
    add(
      <ReportSection key="s43" no={43} title="SEO Fırsatları" sources={[UBER]}>
        <MetricGrid
          items={[
            { label: 'Yeni içerik fırsatı', source: UBER, value: num(snapshot.newContentOpportunityCount) },
            { label: 'Mevcut içerik fırsatı', source: UBER, value: num(snapshot.existingContentOpportunityCount) },
            { label: 'Hızlı kazanım', source: UBER, value: num(snapshot.quickWinOpportunityCount) },
          ]}
        />
        {hasRows(snapshot.opportunities) && (
          <DataTable
            columns={[
              { key: 'opportunityType', label: 'Tür', type: 'text' },
              { key: 'opportunitySubtype', label: 'Alt tür', type: 'text' },
              { key: 'keyword', label: 'Keyword', type: 'text' },
              { key: 'currentPosition', label: 'Pozisyon', type: 'int' },
              { key: 'searchVolume', label: 'Hacim', type: 'int' },
              { key: 'seoDifficulty', label: 'SD', type: 'float' },
              { key: 'impact', label: 'Etki', type: 'text' },
              { key: 'effort', label: 'Efor', type: 'text' },
            ]}
            rows={snapshot.opportunities}
            limit={30}
            totalCount={counts.opportunities}
          />
        )}
      </ReportSection>,
    );
  } else {
    skip(43, 'SEO Fırsatları', 'Ubersuggest fırsat verisi yok');
  }

  // ------------------------------------------------------------------ 44
  if (snapshot.aiVisibilityPercentage !== null || snapshot.aiTotalMentions !== null) {
    add(
      <ReportSection key="s44" no={44} title="AI Arama Görünürlüğü" sources={[UBER]} note="AI asistanlarındaki marka görünürlüğü; Google organik verisinden bağımsızdır.">
        <MetricGrid
          items={[
            {
              label: 'AI görünürlük',
              source: UBER,
              value: snapshot.aiVisibilityPercentage === null ? EMPTY_VALUE : pct(snapshot.aiVisibilityPercentage),
              hint: snapshot.aiVisibilityChange !== null ? `Değişim: ${snapshot.aiVisibilityChange > 0 ? '+' : ''}${nf.format(snapshot.aiVisibilityChange)}` : null,
            },
            { label: 'Toplam bahsedilme', source: UBER, value: num(snapshot.aiTotalMentions) },
            { label: 'Share of Voice', source: UBER, value: snapshot.aiShareOfVoice === null ? EMPTY_VALUE : pct(snapshot.aiShareOfVoice) },
            {
              label: 'Ortalama sıra',
              source: UBER,
              value: num(snapshot.aiAverageRank),
              hint: snapshot.aiAverageRankChange !== null ? `Değişim: ${snapshot.aiAverageRankChange > 0 ? '+' : ''}${nf.format(snapshot.aiAverageRankChange)}` : null,
            },
            {
              label: 'Duygu',
              source: UBER,
              value: snapshot.aiSentimentLabel || (snapshot.aiSentimentScore === null ? EMPTY_VALUE : nf.format(snapshot.aiSentimentScore)),
            },
            { label: 'Prompt / cevap', source: UBER, value: snapshot.aiTotalPrompts === null && snapshot.aiTotalAnswers === null ? EMPTY_VALUE : `${num(snapshot.aiTotalPrompts)} / ${num(snapshot.aiTotalAnswers)}` },
          ]}
        />
      </ReportSection>,
    );
  } else {
    skip(44, 'AI Arama Görünürlüğü', 'Ubersuggest AI görünürlük verisi yok');
  }

  // ------------------------------------------------------------------ 45
  if (hasRows(snapshot.aiProviders)) {
    add(
      <ReportSection key="s45" no={45} title="AI Platform Kırılımı" sources={[UBER]}>
        <DataTable
          columns={[
            { key: 'provider', label: 'Platform', type: 'text' },
            { key: 'visibilityPercentage', label: 'Görünürlük', type: 'pct' },
            { key: 'visibilityChange', label: 'Değişim', type: 'delta' },
            { key: 'totalMentions', label: 'Bahsedilme', type: 'int' },
            { key: 'averageRank', label: 'Ort. sıra', type: 'float' },
            { key: 'sentimentLabel', label: 'Duygu', type: 'text' },
          ]}
          rows={snapshot.aiProviders}
          limit={10}
        />
      </ReportSection>,
    );
  } else {
    skip(45, 'AI Platform Kırılımı', 'Ubersuggest AI platform verisi yok');
  }

  // ------------------------------------------------------------------ 46
  if (hasRows(snapshot.aiCompetitors)) {
    add(
      <ReportSection key="s46" no={46} title="AI Rakip Karşılaştırması" sources={[UBER]}>
        <DataTable
          columns={[
            { key: 'brandName', label: 'Marka', type: 'text' },
            { key: 'visibilityPercentage', label: 'Görünürlük', type: 'pct' },
            { key: 'totalMentions', label: 'Bahsedilme', type: 'int' },
            { key: 'averageRank', label: 'Ort. sıra', type: 'float' },
            { key: 'sentimentLabel', label: 'Duygu', type: 'text' },
            { key: 'sentimentPositivePercentage', label: 'Pozitif', type: 'pct' },
            { key: 'sentimentNegativePercentage', label: 'Negatif', type: 'pct' },
          ]}
          rows={snapshot.aiCompetitors}
          limit={20}
        />
      </ReportSection>,
    );
  } else {
    skip(46, 'AI Rakip Karşılaştırması', 'Ubersuggest AI rakip verisi yok');
  }

  // ------------------------------------------------------------------ 47
  const intent = (snapshot.aiIntents || [])[0] || null;
  if (intent) {
    add(
      <ReportSection key="s47" no={47} title="AI Arama Niyeti" sources={[UBER]}>
        <BarList
          rows={[
            { label: 'Bilgi amaçlı (informational)', value: intent.informationalCount },
            { label: 'Ticari (commercial)', value: intent.commercialCount },
            { label: 'Yönlendirme (navigational)', value: intent.navigationalCount },
            { label: 'Satın alma (transactional)', value: intent.transactionalCount },
          ].filter((row) => row.value !== null && row.value !== undefined)}
          limit={4}
        />
      </ReportSection>,
    );
  } else {
    skip(47, 'AI Arama Niyeti', 'Ubersuggest AI niyet verisi yok');
  }

  return { sections, hidden };
}
