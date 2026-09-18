// Genel raporun 31-47. bölümleri: Ubersuggest SEO istihbaratı.
// Tüm değerler araç verisidir; GA4 ve Search Console metrikleriyle aynı satırda toplanmaz.

import { num, pct, EMPTY_VALUE } from '../report-ui';
import { ReportSection, MetricGrid, ScoreCard, SubHeading } from './general-report-ui';
import { DataTable } from './report-data-table';
import { LineChart, BarList, GaugeChart, TwoCol } from './report-charts';

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
      [36, 'Yeni Link Veren / Linki Kesilen Siteler'],
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
    <ReportSection key="s31" no={31} title="Domain Genel Bakış" sources={[UBER]} note={snapshotNote}>
      <MetricGrid
        items={[
          { label: 'Organik anahtar kelime', source: UBER, value: num(snapshot.organicKeywordsCount) },
          { label: 'Tahmini organik trafik', source: UBER, value: num(snapshot.estimatedOrganicTraffic) },
          { label: 'Ücretli anahtar kelime', source: UBER, value: num(snapshot.paidKeywordsCount) },
          { label: 'Tahmini ücretli trafik', source: UBER, value: num(snapshot.estimatedPaidTraffic) },
          { label: 'DA (alan otoritesi)', source: UBER, value: num(snapshot.domainAuthority) },
          { label: 'Geri bağlantı (Backlink)', source: UBER, value: num(snapshot.totalBacklinks) },
          { label: 'Referans domain', source: UBER, value: num(snapshot.referringDomains) },
        ]}
      />
    </ReportSection>,
  );

  // ------------------------------------------------------------------ 32
  if (hasRows(snapshot.domainHistory)) {
    add(
      <ReportSection key="s32" no={32} title="Organik Trafik / Anahtar Kelime Tarihçesi" sources={[UBER]}>
        <LineChart
          data={snapshot.domainHistory.map((row) => ({ label: row.yearMonth, ...row }))}
          series={[
            { key: 'estimatedOrganicTraffic', label: 'Tahmini organik trafik', color: '#A142F4' },
            { key: 'organicKeywordsCount', label: 'Organik anahtar kelime sayısı' },
          ]}
        />
        <DataTable
          columns={[
            { key: 'yearMonth', label: 'Ay', type: 'text' },
            { key: 'estimatedOrganicTraffic', label: 'Tahmini trafik', type: 'float' },
            { key: 'organicKeywordsCount', label: 'Organik anahtar kelime', type: 'int' },
            { key: 'paidKeywordsCount', label: 'Ücretli anahtar kelime', type: 'int' },
            { key: 'topTierKeywords', label: '1-3', type: 'int' },
            { key: 'secondTierKeywords', label: '4-10', type: 'int' },
            { key: 'thirdTierKeywords', label: '11-50', type: 'int' },
            { key: 'fourthTierKeywords', label: '51+', type: 'int' },
          ]}
          rows={[...snapshot.domainHistory].reverse()}

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
            { key: 'commonKeywordCount', label: 'Ortak anahtar kelime', type: 'int' },
            { key: 'competitorOrganicKeywordsCount', label: 'Organik anahtar kelime', type: 'int' },
            { key: 'keywordGapCount', label: 'Kelime boşluğu (KW Gap)', type: 'int' },
            { key: 'competitorEstimatedOrganicTraffic', label: 'Tahmini trafik', type: 'float' },
            { key: 'competitorBacklinks', label: 'Geri bağlantı (Backlink)', type: 'int' },
            { key: 'competitorDomainAuthority', label: 'DA (alan otoritesi)', type: 'int' },
          ]}
          rows={snapshot.competitors}

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
        title="Kelime Boşluğu (Keyword Gap)"
        sources={[UBER]}

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
      <ReportSection key="s35" no={35} title="Geri Bağlantı Özeti" sources={[UBER]}>
        <MetricGrid
          items={[
            { label: 'Toplam backlink', source: UBER, value: num(snapshot.totalBacklinks) },
            { label: 'Referans domain', source: UBER, value: num(snapshot.referringDomains) },
            { label: 'Follow (takip et)', source: UBER, value: num(snapshot.followBacklinks) },
            { label: 'Nofollow (takip etme)', source: UBER, value: num(snapshot.nofollowBacklinks) },
            { label: 'DA (alan otoritesi)', source: UBER, value: num(snapshot.domainAuthority) },
          ]}
        />
        {hasRows(snapshot.backlinks) && (
          <DataTable
            columns={[
              { key: 'sourceDomain', label: 'Kaynak domain', type: 'text' },
              { key: 'sourceUrl', label: 'Kaynak URL', type: 'text' },
              { key: 'anchorText', label: 'Çapa metni (Anchor)', type: 'text' },
              { key: 'sourceDomainRank', label: 'DR (alan puanı)', type: 'int' },
              { key: 'followStatus', label: 'Durum', type: 'text' },
            ]}
            rows={snapshot.backlinks}


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
      <ReportSection key="s36" no={36} title="Yeni Link Veren / Linki Kesilen Siteler" sources={[UBER]}>
        <TwoCol
          left={(
            <>
              <SubHeading><span style={{ color: '#34A853' }}>Yeni ({nf.format(newDomains.length)})</span></SubHeading>
              <DataTable
                columns={[
                  { key: 'referringDomain', label: 'Domain', type: 'text' },
                  { key: 'detectedDate', label: 'Tespit', type: 'date' },
                ]}
                rows={newDomains}

                emptyNote="Yeni domain yok"
              />
            </>
          )}
          right={(
            <>
              <SubHeading><span style={{ color: '#EA4335' }}>Kaybedilen ({nf.format(lostDomains.length)})</span></SubHeading>
              <DataTable
                columns={[
                  { key: 'referringDomain', label: 'Domain', type: 'text' },
                  { key: 'detectedDate', label: 'Tespit', type: 'date' },
                ]}
                rows={lostDomains}

                emptyNote="Kaybedilen domain yok"
              />
            </>
          )}
        />
      </ReportSection>,
    );
  } else {
    skip(36, 'Yeni Link Veren / Linki Kesilen Siteler', 'Ubersuggest referans domain hareketi yok');
  }

  // ------------------------------------------------------------------ 37
  if (hasRows(snapshot.anchorTexts)) {
    add(
      <ReportSection key="s37" no={37} title="Çapa Metni (Anchor) Analizi" sources={[UBER]}>
        <DataTable
          columns={[
            { key: 'anchorText', label: 'Çapa metni (Anchor)', type: 'text' },
            { key: 'externalRootDomains', label: 'Domain', type: 'int' },
            { key: 'externalPages', label: 'Sayfa', type: 'int' },
          ]}
          rows={snapshot.anchorTexts}


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
        title="Geri Bağlantı Fırsatları"
        sources={[UBER]}

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
        <GaugeChart
          value={snapshot.siteHealthScore}
          label="Site Health"
          legend={[
            { label: 'Başarılı', value: snapshot.successfulPagesCount, color: '#34A853' },
            { label: 'Yönlendirilen', value: snapshot.redirectedPagesCount, color: '#FBBC05' },
            { label: 'Kırık', value: snapshot.brokenPagesCount, color: '#EA4335' },
            { label: 'Engellenen', value: snapshot.blockedPagesCount, color: '#4285F4' },
            { label: 'Toplam sorun', value: snapshot.totalIssuesCount, color: '#94a3b8' },
          ].filter((item) => item.value !== null && item.value !== undefined)}
        />
        <MetricGrid
          compact
          items={[
            {
              label: 'Site sağlık puanı',
              source: UBER,
              value: num(snapshot.siteHealthScore),
              hint: snapshot.previousSiteHealthScore !== null ? `Önceki: ${nf.format(snapshot.previousSiteHealthScore)}` : null,
            },
            { label: 'Taranan sayfa', source: UBER, value: num(snapshot.crawledPagesCount) },
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
      <ReportSection key="s40" no={40} title="Teknik SEO Sorunları" sources={[UBER]}>
        <DataTable
          columns={[
            { key: 'issueId', label: 'Sorun', type: 'text' },
            { key: 'issueCategory', label: 'Kategori', type: 'text' },
            { key: 'issueLevel', label: 'Seviye', type: 'text' },
            { key: 'issueCount', label: 'Adet', type: 'int' },
            { key: 'seoImpact', label: 'Etki', badge: true },
            { key: 'difficulty', label: 'Zorluk', type: 'text' },
          ]}
          rows={snapshot.auditIssues}


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

      >
        <DataTable
          columns={[
            { key: 'issueId', label: 'Sorun', type: 'text' },
            { key: 'url', label: 'URL', type: 'text' },
            { key: 'httpStatus', label: 'HTTP (yanıt kodu)', type: 'int' },
            { key: 'issueStatus', label: 'Durum', type: 'text' },
            { key: 'seoImpact', label: 'Etki', badge: true },
            { key: 'difficulty', label: 'Zorluk', type: 'text' },
            { key: 'recommendation', label: 'Öneri', type: 'text' },
          ]}
          rows={affectedUrls}

        />
      </ReportSection>,
    );
  } else {
    skip(41, 'Sorunlu URL Listesi', 'Audit sorunlarına bağlı URL kaydı yok');
  }

  // ------------------------------------------------------------------ 42
  if (hasRows(snapshot.pagespeed)) {
    add(
      <ReportSection key="s42" no={42} title="Sayfa Hızı / Temel Web Vitals" sources={[UBER]}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {snapshot.pagespeed.map((row) => (
            <ScoreCard
              key={row.device}
              title={DEVICE_LABELS[row.device] || row.device}
              score={row.performanceScore}
              rows={[
                { label: 'LCP (en büyük içerik boyaması)', value: row.lcp == null ? null : nf.format(row.lcp) },
                { label: 'INP (etkileşim gecikmesi)', value: row.inp == null ? null : nf.format(row.inp) },
                { label: 'CLS (düzen kayması)', value: row.cls == null ? null : nf.format(row.cls) },
                { label: 'FCP (ilk içerik boyaması)', value: row.fcp == null ? null : nf.format(row.fcp) },
                { label: 'TTFB (ilk bayt süresi)', value: row.ttfb == null ? null : nf.format(row.ttfb) },
                { label: 'CWV (temel web vitals)', value: row.coreWebVitalsStatus },
              ]}
            />
          ))}
        </div>
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
              { key: 'keyword', label: 'Anahtar kelime', type: 'text' },
              { key: 'currentPosition', label: 'Pozisyon', type: 'int' },
              { key: 'searchVolume', label: 'Hacim', type: 'int' },
              { key: 'seoDifficulty', label: 'SD (SEO zorluğu)', type: 'float' },
              { key: 'impact', label: 'Etki', badge: true },
              { key: 'effort', label: 'Efor', type: 'text' },
            ]}
            rows={snapshot.opportunities}


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
      <ReportSection key="s44" no={44} title="AI Arama Görünürlüğü" sources={[UBER]}>
        <MetricGrid
          items={[
            {
              label: 'AI görünürlük',
              source: UBER,
              value: snapshot.aiVisibilityPercentage === null ? EMPTY_VALUE : pct(snapshot.aiVisibilityPercentage),
              hint: snapshot.aiVisibilityChange !== null ? `Değişim: ${snapshot.aiVisibilityChange > 0 ? '+' : ''}${nf.format(snapshot.aiVisibilityChange)}` : null,
            },
            { label: 'Toplam bahsedilme', source: UBER, value: num(snapshot.aiTotalMentions) },
            { label: 'Ses payı (Share of Voice)', source: UBER, value: snapshot.aiShareOfVoice === null ? EMPTY_VALUE : pct(snapshot.aiShareOfVoice) },
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
        <BarList
          rows={snapshot.aiProviders.map((row) => ({
            label: row.provider,
            value: row.visibilityPercentage,
          }))}
          suffix="%"
          limit={10}
        />
        <DataTable
          columns={[
            { key: 'provider', label: 'Platform', type: 'text' },
            { key: 'visibilityPercentage', label: 'Görünürlük', type: 'pct' },
            { key: 'visibilityChange', label: 'Değişim', type: 'delta', colorize: 'up-good' },
            { key: 'totalMentions', label: 'Bahsedilme', type: 'int' },
            { key: 'averageRank', label: 'Ort. sıra', type: 'float' },
            { key: 'sentimentLabel', label: 'Duygu', type: 'text' },
          ]}
          rows={snapshot.aiProviders}

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
