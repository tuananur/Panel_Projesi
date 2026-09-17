// Ubersuggest snapshot'ının veritabanındaki tüm alanlarını filtresiz listeler.
// Boş alanlar "Veri yok" olarak görünür; hiçbir değer türetilmez.
import { SNAPSHOT_FIELD_GROUPS } from '@/lib/ubersuggest/report-view';
import { EMPTY_VALUE, ErrorNote, ListSection, Row, Section, num, parts, pct } from '../report-ui';

const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function ymd(value) {
  if (!value) return null;
  return dateFmt.format(new Date(value));
}

function ymdTime(value) {
  if (!value) return null;
  return dateTimeFmt.format(new Date(value));
}

function formatField(value, type) {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE;
  switch (type) {
    case 'int':
      return num(value);
    case 'float':
      return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(Number(value));
    case 'pct':
      return pct(value);
    case 'date':
      return ymd(value);
    case 'datetime':
      return ymdTime(value);
    case 'bool':
      return value ? 'Evet' : 'Hayır';
    default:
      return String(value);
  }
}

function bool(value) {
  if (value === null || value === undefined) return null;
  return value ? 'evet' : 'hayır';
}

/** Alt tablo başlığına "kaç kayıt, kaçı gösteriliyor" notu yazar. */
function countNote(total, shown, unit = 'kayıt') {
  if (!total) return null;
  if (shown < total) return `${num(total)} ${unit} · ilk ${num(shown)} gösteriliyor`;
  return `${num(total)} ${unit}`;
}

export default function UbersuggestPanel({ report }) {
  const { snapshot, history, projects } = report;

  if (!snapshot) {
    return (
      <Section title="Ubersuggest">
        <ErrorNote>Bu müşteri için kayıtlı Ubersuggest snapshot&apos;ı yok.</ErrorNote>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.75rem' }}>
          Veri, <code>POST /api/integrations/ubersuggest/snapshots</code> ucuna snapshot gönderildiğinde burada
          görünür.
        </p>
      </Section>
    );
  }

  const counts = snapshot._count || {};

  return (
    <>
      <Section
        title="Ubersuggest — Snapshot"
        note={`En güncel snapshot gösteriliyor · toplam ${num(history.length)} snapshot kayıtlı`}
      >
        {SNAPSHOT_FIELD_GROUPS[0].fields.map(([key, label, type]) => (
          <Row key={key} label={label} value={formatField(snapshot[key], type)} />
        ))}
      </Section>

      {SNAPSHOT_FIELD_GROUPS.slice(1).map((group) => (
        <Section key={group.title} title={group.title} note={group.note}>
          {group.fields.map(([key, label, type]) => (
            <Row key={key} label={label} value={formatField(snapshot[key], type)} />
          ))}
        </Section>
      ))}

      <ListSection
        title="Aylık Domain Geçmişi"
        note={countNote(counts.domainHistory, snapshot.domainHistory.length, 'ay')}
        items={snapshot.domainHistory}
        render={(item) => (
          <Row
            key={item.id}
            label={item.yearMonth}
            value={parts([
              item.estimatedOrganicTraffic !== null ? `tahmini organik ${num(item.estimatedOrganicTraffic)}` : null,
              item.organicKeywordsCount !== null ? `${num(item.organicKeywordsCount)} organik kelime` : null,
              item.estimatedPaidTraffic !== null ? `tahmini ücretli ${num(item.estimatedPaidTraffic)}` : null,
              item.paidKeywordsCount !== null ? `${num(item.paidKeywordsCount)} ücretli kelime` : null,
              item.topTierKeywords !== null ? `1. kademe ${num(item.topTierKeywords)}` : null,
              item.secondTierKeywords !== null ? `2. kademe ${num(item.secondTierKeywords)}` : null,
              item.thirdTierKeywords !== null ? `3. kademe ${num(item.thirdTierKeywords)}` : null,
              item.fourthTierKeywords !== null ? `4. kademe ${num(item.fourthTierKeywords)}` : null,
            ])}
          />
        )}
      />

      <ListSection
        title="Organik Anahtar Kelimeler"
        note={countNote(counts.keywords, snapshot.keywords.length, 'kelime')}
        items={snapshot.keywords}
        render={(item) => (
          <Row
            key={item.id}
            label={item.keyword}
            value={parts([
              item.currentPosition !== null ? `${item.currentPosition}. sıra` : 'sıra yok',
              item.searchVolume !== null ? `hacim ${num(item.searchVolume)}` : null,
              item.seoDifficulty !== null ? `SD ${item.seoDifficulty}` : null,
              item.paidDifficulty !== null ? `PD ${item.paidDifficulty}` : null,
              item.competition !== null ? `rekabet ${item.competition}` : null,
              item.cpc !== null ? `CPC ${item.cpc}` : null,
              item.estimatedTraffic !== null ? `tahmini trafik ${num(item.estimatedTraffic)}` : null,
              item.searchIntent,
              item.positionGroup,
              item.rankingPath || item.rankingUrl,
            ])}
          />
        )}
      />

      <ListSection
        title="Sıralama Takibi (Rank Tracking)"
        note={countNote(counts.rankTracking, snapshot.rankTracking.length, 'kelime')}
        items={snapshot.rankTracking}
        render={(item) => (
          <Row
            key={item.id}
            label={item.keyword}
            value={parts([
              item.newPosition !== null ? `şimdi ${item.newPosition}. sıra` : 'şimdi sıralamada yok',
              item.oldPosition !== null ? `önce ${item.oldPosition}. sıra` : 'önce sıralamada yok',
              item.positionChange !== null ? `değişim ${item.positionChange}` : null,
              item.rankingStatus,
              item.device,
              item.language,
              item.locationId ? `konum ${item.locationId}` : null,
              item.searchVolume !== null ? `hacim ${num(item.searchVolume)}` : null,
              item.seoDifficulty !== null ? `SD ${item.seoDifficulty}` : null,
              item.isRankingTop100 !== null ? `ilk 100: ${bool(item.isRankingTop100)}` : null,
              item.isUnstable !== null ? `dalgalı: ${bool(item.isUnstable)}` : null,
            ])}
          />
        )}
      />

      <ListSection
        title="Ortalama Pozisyon Geçmişi"
        note={countNote(counts.averagePositions, snapshot.averagePositions.length, 'gün')}
        items={snapshot.averagePositions}
        render={(item) => (
          <Row
            key={item.id}
            label={ymd(item.date)}
            value={item.averagePosition !== null ? `${item.averagePosition}. sıra` : EMPTY_VALUE}
          />
        )}
      />

      <ListSection
        title="En İyi SEO Sayfaları"
        note={countNote(counts.topPages, snapshot.topPages.length, 'sayfa')}
        items={snapshot.topPages}
        render={(item) => (
          <Row
            key={item.id}
            label={item.pageTitle ? `${item.pageTitle} — ${item.path || item.url}` : item.path || item.url}
            value={parts([
              item.estimatedOrganicTraffic !== null ? `tahmini trafik ${num(item.estimatedOrganicTraffic)}` : null,
              item.backlinks !== null ? `${num(item.backlinks)} backlink` : null,
              item.referringDomains !== null ? `${num(item.referringDomains)} referans domain` : null,
              item.facebookShares !== null ? `FB ${num(item.facebookShares)}` : null,
              item.pinterestShares !== null ? `Pinterest ${num(item.pinterestShares)}` : null,
              item.redditShares !== null ? `Reddit ${num(item.redditShares)}` : null,
            ])}
          />
        )}
      />

      <ListSection
        title="Organik Rakipler"
        note={countNote(counts.competitors, snapshot.competitors.length, 'rakip')}
        items={snapshot.competitors}
        render={(item) => (
          <Row
            key={item.id}
            label={item.competitorDomain}
            value={parts([
              item.commonKeywordCount !== null ? `${num(item.commonKeywordCount)} ortak kelime` : null,
              item.competitorOrganicKeywordsCount !== null ? `${num(item.competitorOrganicKeywordsCount)} organik kelime` : null,
              item.keywordGapCount !== null ? `${num(item.keywordGapCount)} kelime boşluğu` : null,
              item.competitorEstimatedOrganicTraffic !== null ? `tahmini trafik ${num(item.competitorEstimatedOrganicTraffic)}` : null,
              item.competitorBacklinks !== null ? `${num(item.competitorBacklinks)} backlink` : null,
              item.competitorDomainAuthority !== null ? `DA ${item.competitorDomainAuthority}` : null,
            ])}
          />
        )}
      />

      <ListSection
        title="Backlinkler"
        note={countNote(counts.backlinks, snapshot.backlinks.length, 'backlink')}
        items={snapshot.backlinks}
        render={(item) => (
          <Row
            key={item.id}
            label={item.sourceDomain || item.sourceUrl}
            value={parts([
              item.anchorText ? `anchor "${item.anchorText}"` : null,
              item.followStatus,
              item.backlinkType,
              item.sourceDomainRank !== null ? `domain rank ${item.sourceDomainRank}` : null,
              item.sourcePageRank !== null ? `sayfa rank ${item.sourcePageRank}` : null,
              item.firstSeen ? `ilk ${ymd(item.firstSeen)}` : null,
              item.lastSeen ? `son ${ymd(item.lastSeen)}` : null,
            ])}
          />
        )}
      />

      <ListSection
        title="Anchor Metinleri"
        note={countNote(counts.anchorTexts, snapshot.anchorTexts.length, 'anchor')}
        items={snapshot.anchorTexts}
        render={(item) => (
          <Row
            key={item.id}
            label={item.anchorText}
            value={parts([
              item.externalRootDomains !== null ? `${num(item.externalRootDomains)} kök domain` : null,
              item.externalPages !== null ? `${num(item.externalPages)} sayfa` : null,
            ])}
          />
        )}
      />

      <ListSection
        title="Yeni / Kaybedilen Referans Domainler"
        note={countNote(counts.linkingDomains, snapshot.linkingDomains.length, 'domain')}
        items={snapshot.linkingDomains}
        render={(item) => (
          <Row
            key={item.id}
            label={item.referringDomain}
            value={parts([item.status === 'new' ? 'yeni' : 'kaybedildi', item.detectedDate ? ymd(item.detectedDate) : null])}
          />
        )}
      />

      <ListSection
        title="Backlink Fırsatları"
        note={countNote(counts.backlinkOpportunities, snapshot.backlinkOpportunities.length, 'fırsat')}
        items={snapshot.backlinkOpportunities}
        render={(item) => (
          <Row
            key={item.id}
            label={item.referringDomain}
            value={parts([
              item.competitorDomain ? `rakip ${item.competitorDomain}` : null,
              item.linksToCompetitor !== null ? `rakibe ${num(item.linksToCompetitor)} link` : null,
              item.linksToUs !== null ? `bize ${num(item.linksToUs)} link` : null,
              item.opportunityStatus,
            ])}
          />
        )}
      />

      <Section
        title="Site Audit Sorunları"
        note={countNote(counts.auditIssues, snapshot.auditIssues.length, 'sorun türü')}
      >
        {snapshot.auditIssues.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>{EMPTY_VALUE}</p>
        ) : (
          snapshot.auditIssues.map((issue) => (
            <div key={issue.id} style={{ marginBottom: '1rem' }}>
              <Row
                label={issue.issueId}
                value={parts([
                  issue.issueCategory,
                  issue.issueLevel,
                  issue.issueCount !== null ? `${num(issue.issueCount)} adet` : null,
                  issue.seoImpact ? `etki ${issue.seoImpact}` : null,
                  issue.difficulty ? `zorluk ${issue.difficulty}` : null,
                ])}
              />
              {issue.affectedUrls.length > 0 && (
                <div style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)', marginTop: '0.35rem' }}>
                  {issue.affectedUrls.map((url) => (
                    <Row
                      key={url.id}
                      label={url.url}
                      value={parts([
                        url.httpStatus !== null ? `HTTP ${url.httpStatus}` : null,
                        url.issueStatus,
                        url.diffStatus,
                        url.ignored !== null ? `yoksayıldı: ${bool(url.ignored)}` : null,
                        url.recommendation,
                      ])}
                    />
                  ))}
                  {issue._count.affectedUrls > issue.affectedUrls.length && (
                    <p className="text-muted" style={{ fontSize: '0.75rem', paddingTop: '0.4rem' }}>
                      {num(issue._count.affectedUrls)} URL&apos;den ilk {num(issue.affectedUrls.length)} gösteriliyor.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </Section>

      <ListSection
        title="SEO Fırsatları"
        note={countNote(counts.opportunities, snapshot.opportunities.length, 'fırsat')}
        items={snapshot.opportunities}
        render={(item) => (
          <Row
            key={item.id}
            label={item.keyword || `${item.opportunityType}${item.opportunitySubtype ? ` / ${item.opportunitySubtype}` : ''}`}
            value={parts([
              item.keyword ? item.opportunityType : null,
              item.keyword && item.opportunitySubtype ? item.opportunitySubtype : null,
              item.currentPosition !== null ? `${item.currentPosition}. sıra` : null,
              item.searchVolume !== null ? `hacim ${num(item.searchVolume)}` : null,
              item.seoDifficulty !== null ? `SD ${item.seoDifficulty}` : null,
              item.paidDifficulty !== null ? `PD ${item.paidDifficulty}` : null,
              item.competition !== null ? `rekabet ${item.competition}` : null,
              item.cpc !== null ? `CPC ${item.cpc}` : null,
              item.estimatedTraffic !== null ? `tahmini trafik ${num(item.estimatedTraffic)}` : null,
              item.impact ? `etki ${item.impact}` : null,
              item.effort ? `efor ${item.effort}` : null,
              item.approved !== null ? `onaylı: ${bool(item.approved)}` : null,
              item.opportunityStatus,
              item.rankingUrl,
            ])}
          />
        )}
      />

      <Section title="PageSpeed" note={countNote(counts.pagespeed, snapshot.pagespeed.length, 'cihaz')}>
        {snapshot.pagespeed.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>{EMPTY_VALUE}</p>
        ) : (
          snapshot.pagespeed.map((row) => (
            <div key={row.id} style={{ marginBottom: '0.75rem' }}>
              <Row label={row.device} value={row.status || EMPTY_VALUE} />
              <div style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
                <Row label="Performans" value={formatField(row.performanceScore, 'float')} />
                <Row label="SEO" value={formatField(row.seoScore, 'float')} />
                <Row label="Erişilebilirlik" value={formatField(row.accessibilityScore, 'float')} />
                <Row label="En iyi uygulamalar" value={formatField(row.bestPracticesScore, 'float')} />
                <Row label="Core Web Vitals" value={formatField(row.coreWebVitalsStatus, 'text')} />
                <Row label="LCP" value={formatField(row.lcp, 'float')} />
                <Row label="INP" value={formatField(row.inp, 'float')} />
                <Row label="CLS" value={formatField(row.cls, 'float')} />
                <Row label="FCP" value={formatField(row.fcp, 'float')} />
                <Row label="TTFB" value={formatField(row.ttfb, 'float')} />
                <Row label="Speed Index" value={formatField(row.speedIndex, 'float')} />
                <Row label="Ölçüm zamanı" value={formatField(row.checkedAt, 'datetime')} />
              </div>
            </div>
          ))
        )}
      </Section>

      <ListSection
        title="AI Arama — Sağlayıcılar"
        note={countNote(counts.aiProviders, snapshot.aiProviders.length, 'sağlayıcı')}
        items={snapshot.aiProviders}
        render={(item) => (
          <Row
            key={item.id}
            label={item.provider}
            value={parts([
              item.visibilityPercentage !== null ? `görünürlük ${pct(item.visibilityPercentage)}` : null,
              item.visibilityChange !== null ? `değişim ${pct(item.visibilityChange)}` : null,
              item.averageRank !== null ? `ort. sıra ${item.averageRank}` : null,
              item.averageRankChange !== null ? `sıra değişimi ${item.averageRankChange}` : null,
              item.totalMentions !== null ? `${num(item.totalMentions)} bahsedilme` : null,
              item.sentimentScore !== null ? `duygu ${item.sentimentScore}` : null,
              item.sentimentLabel,
            ])}
          />
        )}
      />

      <ListSection
        title="AI Arama — Marka / Rakip Görünürlüğü"
        note={countNote(counts.aiCompetitors, snapshot.aiCompetitors.length, 'marka')}
        items={snapshot.aiCompetitors}
        render={(item) => (
          <Row
            key={item.id}
            label={`${item.brandName}${item.isUserBrand ? ' (bizim marka)' : ''}`}
            value={parts([
              item.visibilityPercentage !== null ? `görünürlük ${pct(item.visibilityPercentage)}` : null,
              item.averageRank !== null ? `ort. sıra ${item.averageRank}` : null,
              item.totalMentions !== null ? `${num(item.totalMentions)} bahsedilme` : null,
              item.sentimentScore !== null ? `duygu ${item.sentimentScore}` : null,
              item.sentimentLabel,
              item.sentimentPositivePercentage !== null ? `pozitif ${pct(item.sentimentPositivePercentage)}` : null,
              item.sentimentNegativePercentage !== null ? `negatif ${pct(item.sentimentNegativePercentage)}` : null,
              item.sentimentNeutralPercentage !== null ? `nötr ${pct(item.sentimentNeutralPercentage)}` : null,
              item.isTracked !== null ? `takipte: ${bool(item.isTracked)}` : null,
              item.isPinned !== null ? `sabit: ${bool(item.isPinned)}` : null,
            ])}
          />
        )}
      />

      <Section title="AI Arama — Niyet Dağılımı">
        {snapshot.aiIntents.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>{EMPTY_VALUE}</p>
        ) : (
          snapshot.aiIntents.map((item) => (
            <div key={item.id}>
              <Row label="Bilgi amaçlı" value={formatField(item.informationalCount, 'int')} />
              <Row label="Yönlendirme amaçlı" value={formatField(item.navigationalCount, 'int')} />
              <Row label="Ticari" value={formatField(item.commercialCount, 'int')} />
              <Row label="İşlem amaçlı" value={formatField(item.transactionalCount, 'int')} />
            </div>
          ))
        )}
      </Section>

      <Section title="Ubersuggest Proje Bilgisi" note={projects.length > 0 ? `${num(projects.length)} proje` : null}>
        {projects.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>{EMPTY_VALUE}</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} style={{ marginBottom: '1rem' }}>
              <Row label="Proje kimliği" value={formatField(project.ubersuggestProjectId, 'text')} />
              <Row label="Domain" value={formatField(project.domain, 'text')} />
              <Row label="Proje adı" value={formatField(project.projectTitle, 'text')} />
              <Row label="Durum" value={formatField(project.projectStatus, 'text')} />
              <Row label="Tür" value={formatField(project.projectType, 'text')} />
              <Row label="Güncelleme sıklığı" value={formatField(project.updateFrequency, 'text')} />
              <Row label="Mobil sıralama takibi" value={formatField(project.mobileRankTrackingEnabled, 'bool')} />
              <Row label="Pixel sıralama takibi" value={formatField(project.pixelRankTrackingEnabled, 'bool')} />
              <Row label="Uyarılar" value={formatField(project.alertsEnabled, 'bool')} />
              <Row label="AI marka takibi" value={formatField(project.hasAiBrandTracking, 'bool')} />
              <Row label="Takip edilen kelime" value={formatField(project.trackedKeywordCount, 'int')} />
              <Row label="Takip edilen rakip" value={formatField(project.trackedCompetitorCount, 'int')} />
              <Row label="Takip edilen konum" value={formatField(project.trackedLocationCount, 'int')} />
              <Row label="Kelime limiti / kullanım" value={`${formatField(project.keywordLimit, 'int')} / ${formatField(project.keywordUsed, 'int')}`} />
              <Row label="Rakip limiti / kullanım" value={`${formatField(project.competitorLimit, 'int')} / ${formatField(project.competitorUsed, 'int')}`} />
              <Row label="Konum limiti / kullanım" value={`${formatField(project.locationLimit, 'int')} / ${formatField(project.locationUsed, 'int')}`} />
              <Row label="AI prompt limiti / kullanım" value={`${formatField(project.aiPromptLimit, 'int')} / ${formatField(project.aiPromptUsed, 'int')}`} />
              <Row label="Kelimeler son güncelleme" value={formatField(project.keywordsLastUpdatedAt, 'datetime')} />
              <Row label="Audit son güncelleme" value={formatField(project.auditLastUpdatedAt, 'datetime')} />
              <Row label="Trafik değeri son güncelleme" value={formatField(project.trafficValueLastUpdatedAt, 'datetime')} />
              <Row
                label="Takip edilen konumlar"
                value={
                  project.locations.length > 0
                    ? project.locations.map((loc) => parts([loc.language, loc.locationId])).join(' | ')
                    : EMPTY_VALUE
                }
              />
              <Row
                label="Takip edilen rakipler"
                value={
                  project.competitors.length > 0
                    ? project.competitors.map((comp) => comp.competitorDomain).join(' | ')
                    : EMPTY_VALUE
                }
              />
            </div>
          ))
        )}
      </Section>

      <ListSection
        title="Snapshot Geçmişi"
        note={`${num(history.length)} kayıt · detaylar en güncel snapshot'a ait`}
        items={history}
        render={(item) => (
          <Row
            key={item.id}
            label={`${ymd(item.snapshotDate)} — ${item.domain}`}
            value={parts([`#${item.id}`, item.source, `kayıt ${ymdTime(item.createdAt)}`])}
          />
        )}
      />

      <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '-0.75rem' }}>
        Listeler tam kayıt setidir; toplam kayıt sayısı bölüm başlıklarında yazar.
      </p>
    </>
  );
}
