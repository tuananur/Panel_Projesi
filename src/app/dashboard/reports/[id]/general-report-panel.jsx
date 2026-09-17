// Genel Rapor sekmesi: GA4 + Search Console + Ubersuggest verisinin 50 bölümlük birleşik sunumu.
//
// Tasarım kuralı: hiçbir metrik iki kaynaktan birleştirilip tek değer gibi gösterilmez.
// Her bölüm ve her metrik hangi kaynaktan geldiğini etiketiyle taşır:
//   GA4            → gerçek kullanıcı davranışı
//   Search Console → gerçek Google arama performansı
//   Ubersuggest    → araç tahmini / SEO istihbaratı
// Verisi olmayan bölüm render edilmez; en sonda neden gizlendiği listelenir.

import { num, pct, EMPTY_VALUE } from '../report-ui';
import { ReportSection, DataTable, MetricGrid, SourceTag } from './general-report-ui';
import { LineChart, BarList, DonutChart, ChangeCards, HeatStrip } from './report-charts';
import { buildSeoSections } from './general-report-seo';
import { buildInsightSections } from './general-report-insights';

const nf = new Intl.NumberFormat('tr-TR');

const GA4 = 'GA4';
const GSC = 'Search Console';
const UBER = 'Ubersuggest';

const DEVICE_LABELS = { DESKTOP: 'Masaüstü', MOBILE: 'Mobil', TABLET: 'Tablet' };
const VISITOR_LABELS = { new: 'Yeni kullanıcı', returning: 'Geri dönen kullanıcı' };
const GENDER_LABELS = { male: 'Erkek', female: 'Kadın' };

function hasRows(value) {
  return Array.isArray(value) && value.length > 0;
}

export default function GeneralReportPanel({ ga, gsc, extras, ubersuggest, report, periodLabel }) {
  const sections = [];
  const hidden = [];
  const add = (node) => sections.push(node);
  const skip = (no, title, reason) => hidden.push({ no, title, reason });

  const snapshot = ubersuggest?.snapshot || null;
  const gscOk = Boolean(gsc?.summary);
  const gaOk = Boolean(ga?.summary);

  // ------------------------------------------------------------------ 1
  if (gaOk || gscOk || snapshot) {
    add(
      <ReportSection
        key="s1"
        no={1}
        title="Rapor Özeti"
        sources={[gaOk && GA4, gscOk && GSC, snapshot && UBER].filter(Boolean)}
        note={`Dönem: ${periodLabel}. GA4 ve Search Console metrikleri bu döneme aittir; Ubersuggest değerleri en güncel snapshot'tan gelir.`}
      >
        <MetricGrid
          items={[
            gaOk && { label: 'Toplam kullanıcı', source: GA4, value: num(ga.summary.activeUsers) },
            gaOk && { label: 'Oturum', source: GA4, value: num(ga.summary.sessions) },
            gaOk && { label: 'Sayfa görüntüleme', source: GA4, value: num(ga.summary.pageViews) },
            gscOk && { label: 'Organik tıklama', source: GSC, value: num(gsc.summary.clicks), hint: 'Google aramadan gelen gerçek tıklama' },
            gscOk && { label: 'Organik gösterim', source: GSC, value: num(gsc.summary.impressions) },
            gscOk && { label: 'CTR', source: GSC, value: pct(gsc.summary.ctr) },
            gscOk && { label: 'Ortalama pozisyon', source: GSC, value: gsc.summary.position?.toFixed(1) ?? EMPTY_VALUE },
            snapshot && { label: 'Organik keyword sayısı', source: UBER, value: num(snapshot.organicKeywordsCount) },
            snapshot && { label: 'Tahmini organik trafik', source: UBER, value: num(snapshot.estimatedOrganicTraffic), hint: 'Araç tahmini, GA4 trafiğiyle aynı şey değil' },
            snapshot && { label: 'Domain Authority', source: UBER, value: num(snapshot.domainAuthority) },
            snapshot && { label: 'Backlink', source: UBER, value: num(snapshot.totalBacklinks) },
            snapshot && { label: 'Site Health', source: UBER, value: num(snapshot.siteHealthScore) },
          ].filter(Boolean)}
        />
      </ReportSection>,
    );
  } else {
    skip(1, 'Rapor Özeti', 'Hiçbir kaynaktan veri gelmedi');
  }

  // ------------------------------------------------------------------ 2
  if (hasRows(report.comparison)) {
    add(
      <ReportSection
        key="s2"
        no={2}
        title="Dönem Karşılaştırması"
        sources={[...new Set(report.comparison.map((row) => row.source))]}
        note="Bu dönem, aynı uzunluktaki önceki dönemle karşılaştırılır. Yeşil iyileşme, kırmızı gerilemedir."
      >
        <ChangeCards rows={report.comparison} />
        {hasRows(ga?.daily) && (
          <LineChart
            data={ga.daily}
            series={[
              { key: 'activeUsers', label: 'Aktif kullanıcı (GA4)' },
              { key: 'sessions', label: 'Oturum (GA4)' },
            ]}
          />
        )}
      </ReportSection>,
    );
  } else {
    skip(2, 'Dönem Karşılaştırması', 'Önceki dönem verisi alınamadı');
  }

  // ------------------------------------------------------------------ 3
  if (hasRows(ga?.daily)) {
    add(
      <ReportSection key="s3" no={3} title="Trafik Trendi" sources={[GA4]} note="Seçilen dönemdeki günlük hareket.">
        <LineChart
          data={ga.daily}
          series={[
            { key: 'activeUsers', label: 'Aktif kullanıcı' },
            { key: 'sessions', label: 'Oturum' },
            { key: 'pageViews', label: 'Sayfa görüntüleme' },
          ]}
        />
        <LineChart
          data={ga.daily}
          series={[{ key: 'bounceRate', label: 'Hemen çıkma oranı (%)', color: '#EA4335' }]}
          height={140}
          valueSuffix="%"
        />
      </ReportSection>,
    );
  } else {
    skip(3, 'Trafik Trendi', 'GA4 günlük verisi yok');
  }

  // ------------------------------------------------------------------ 4
  if (hasRows(ga?.channels) || hasRows(extras?.channelGroups)) {
    add(
      <ReportSection
        key="s4"
        no={4}
        title="Trafik Kaynakları"
        sources={[GA4]}
        note="Kaynak kırılımı oturum bazlıdır. Kanal grubu, GA4'ün kendi sınıflandırmasıdır; kaynak adı ise ham referrer."
      >
        {hasRows(extras?.channelGroups) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}>Kanal grubu</h3>
            <BarList
              rows={extras.channelGroups.map((row) => ({ label: row.channel, value: row.sessions, users: row.activeUsers }))}
              secondary="users"
              limit={12}
            />
          </>
        )}
        {hasRows(ga?.channels) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '1.25rem 0 0.25rem' }}>Kaynak (referrer)</h3>
            <DonutChart rows={ga.channels.slice(0, 7).map((row) => ({ label: row.name, value: row.sessions }))} />
            <DataTable
              columns={[
                { key: 'name', label: 'Kaynak', type: 'text' },
                { key: 'activeUsers', label: 'Kullanıcı', type: 'int' },
                { key: 'sessions', label: 'Oturum', type: 'int' },
                { key: 'percentage', label: 'Pay', type: 'pct' },
              ]}
              rows={ga.channels}
              limit={20}
            />
          </>
        )}
      </ReportSection>,
    );
  } else {
    skip(4, 'Trafik Kaynakları', 'GA4 kaynak verisi yok');
  }

  // ------------------------------------------------------------------ 5
  if (report.organic?.organic) {
    const organic = report.organic;
    add(
      <ReportSection
        key="s5"
        no={5}
        title="Organik Trafik Özeti"
        sources={[GA4]}
        note="Bu bölüm GA4 organik arama kanalıdır; Search Console tıklamaları ile aynı sayı değildir (farklı ölçüm yöntemleri)."
      >
        <MetricGrid
          items={[
            { label: 'Organik kullanıcı', source: GA4, value: num(organic.organic.activeUsers) },
            { label: 'Organik oturum', source: GA4, value: num(organic.organic.sessions) },
            { label: 'Organik oturum payı', source: GA4, value: organic.sessionShare === null ? EMPTY_VALUE : pct(organic.sessionShare) },
            { label: 'Organik kullanıcı payı', source: GA4, value: organic.userShare === null ? EMPTY_VALUE : pct(organic.userShare) },
            { label: 'Etkileşim oranı', source: GA4, value: pct(organic.organic.engagementRate) },
          ]}
        />
        {hasRows(organic.daily) && (
          <LineChart
            data={organic.daily.map((row) => ({ ...row, label: row.date?.slice(5) }))}
            series={[
              { key: 'sessions', label: 'Organik oturum', color: '#34A853' },
              { key: 'activeUsers', label: 'Organik kullanıcı' },
            ]}
          />
        )}
      </ReportSection>,
    );
  } else {
    skip(5, 'Organik Trafik Özeti', 'GA4 kanal grubu verisi alınamadı');
  }

  // ------------------------------------------------------------------ 6
  if (gscOk) {
    add(
      <ReportSection key="s6" no={6} title="Search Console Genel Performans" sources={[GSC]} note="Google aramada gerçekleşen gerçek performans.">
        <MetricGrid
          items={[
            { label: 'Toplam tıklama', source: GSC, value: num(gsc.summary.clicks) },
            { label: 'Toplam gösterim', source: GSC, value: num(gsc.summary.impressions) },
            { label: 'CTR', source: GSC, value: pct(gsc.summary.ctr) },
            { label: 'Ortalama pozisyon', source: GSC, value: gsc.summary.position?.toFixed(1) ?? EMPTY_VALUE },
            { label: 'Toplam sorgu sayısı', source: GSC, value: num(gsc.totalQueries) },
          ]}
        />
      </ReportSection>,
    );
  } else {
    skip(6, 'Search Console Genel Performans', 'Search Console verisi yok');
  }

  // ------------------------------------------------------------------ 7
  if (hasRows(gsc?.daily)) {
    const daily = gsc.daily.map((row) => ({ ...row, label: row.date?.slice(5) }));
    add(
      <ReportSection key="s7" no={7} title="Search Console Günlük Performans" sources={[GSC]}>
        <LineChart
          data={daily}
          series={[
            { key: 'clicks', label: 'Tıklama', color: '#34A853' },
            { key: 'impressions', label: 'Gösterim' },
          ]}
        />
        <LineChart
          data={daily}
          series={[
            { key: 'ctr', label: 'CTR (%)', color: '#FBBC05' },
            { key: 'position', label: 'Pozisyon', color: '#EA4335' },
          ]}
          height={150}
        />
      </ReportSection>,
    );
  } else {
    skip(7, 'Search Console Günlük Performans', 'GSC günlük verisi yok');
  }

  // ------------------------------------------------------------------ 8
  if (hasRows(gsc?.queries)) {
    add(
      <ReportSection
        key="s8"
        no={8}
        title="Google Arama Sorguları"
        sources={[GSC]}
        note="Pozisyon değişimi, önceki dönemle karşılaştırmadır. Pozitif değer yukarı çıkışı gösterir."
      >
        <DataTable
          columns={[
            { key: 'keyword', label: 'Sorgu', type: 'text' },
            { key: 'clicks', label: 'Tıklama', type: 'int' },
            { key: 'impressions', label: 'Gösterim', type: 'int' },
            { key: 'ctr', label: 'CTR', type: 'pct' },
            { key: 'position', label: 'Pozisyon', type: 'float' },
            { key: 'previousPosition', label: 'Önceki', type: 'float' },
            { key: 'positionChange', label: 'Değişim', type: 'delta' },
            { key: 'url', label: 'Sıralanan URL', type: 'text' },
          ]}
          rows={gsc.queries}
          limit={50}
        />
      </ReportSection>,
    );
  } else {
    skip(8, 'Google Arama Sorguları', 'GSC sorgu verisi yok');
  }

  // ------------------------------------------------------------------ 9
  if (hasRows(snapshot?.keywords)) {
    add(
      <ReportSection
        key="s9"
        no={9}
        title="SEO Keyword Performansı"
        sources={[UBER]}
        note="Arama hacmi ve zorluk yalnızca bu kaynakta bulunur. Pozisyon, Ubersuggest ölçümüdür; Search Console ortalama pozisyonundan farklıdır."
      >
        <DataTable
          columns={[
            { key: 'keyword', label: 'Keyword', type: 'text' },
            { key: 'currentPosition', label: 'Pozisyon', type: 'int' },
            { key: 'searchVolume', label: 'Hacim', type: 'int' },
            { key: 'seoDifficulty', label: 'SD', type: 'float' },
            { key: 'cpc', label: 'CPC', type: 'float' },
            { key: 'searchIntent', label: 'Niyet', type: 'text' },
            { key: 'estimatedTraffic', label: 'Tahmini trafik', type: 'float' },
            { key: 'rankingUrl', label: 'Sıralanan URL', type: 'text' },
          ]}
          rows={snapshot.keywords}
          limit={50}
          totalCount={snapshot._count?.keywords}
        />
      </ReportSection>,
    );
  } else {
    skip(9, 'SEO Keyword Performansı', 'Ubersuggest keyword verisi yok');
  }

  // ------------------------------------------------------------------ 10
  if (snapshot && (snapshot.trackedKeywordsCount !== null || hasRows(snapshot.rankTracking))) {
    add(
      <ReportSection
        key="s10"
        no={10}
        title="Takip Edilen Keyword / Rank Tracking"
        sources={[UBER]}
        note="Ubersuggest rank tracker ölçümü. Pozisyonu boş olan kelime ilk 100'de değildir."
      >
        <MetricGrid
          items={[
            { label: 'Takip edilen kelime', source: UBER, value: num(snapshot.trackedKeywordsCount) },
            { label: 'Top 3', source: UBER, value: num(snapshot.top3New), hint: snapshot.top3Old !== null ? `Önceki: ${nf.format(snapshot.top3Old)}` : null },
            { label: 'Top 10', source: UBER, value: num(snapshot.top10New), hint: snapshot.top10Old !== null ? `Önceki: ${nf.format(snapshot.top10Old)}` : null },
            { label: 'Top 100', source: UBER, value: num(snapshot.top100New), hint: snapshot.top100Old !== null ? `Önceki: ${nf.format(snapshot.top100Old)}` : null },
            { label: 'Sıralanmayan', source: UBER, value: num(snapshot.notRankingNew), hint: snapshot.notRankingOld !== null ? `Önceki: ${nf.format(snapshot.notRankingOld)}` : null },
            { label: 'Yükselen', source: UBER, value: num(snapshot.keywordsUpCount) },
            { label: 'Düşen', source: UBER, value: num(snapshot.keywordsDownCount) },
            { label: 'Sabit', source: UBER, value: num(snapshot.keywordsUnchangedCount) },
          ]}
        />
        {hasRows(snapshot.averagePositions) && (
          <LineChart
            data={snapshot.averagePositions.map((row) => ({
              label: new Date(row.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
              averagePosition: row.averagePosition,
            }))}
            series={[{ key: 'averagePosition', label: 'Ortalama pozisyon (takip edilen)', color: '#A142F4' }]}
            height={150}
          />
        )}
      </ReportSection>,
    );
  } else {
    skip(10, 'Takip Edilen Keyword / Rank Tracking', 'Ubersuggest rank tracking verisi yok');
  }

  // ------------------------------------------------------------------ 11 / 12
  const movementColumns = (source) => [
    { key: 'keyword', label: 'Keyword', type: 'text' },
    { key: 'oldPosition', label: 'Eski sıra', type: 'int' },
    { key: 'newPosition', label: 'Yeni sıra', type: 'int' },
    { key: 'change', label: 'Değişim', type: 'delta' },
    ...(source === UBER
      ? [{ key: 'searchVolume', label: 'Hacim', type: 'int' }]
      : [{ key: 'clicks', label: 'Tıklama', type: 'int' }, { key: 'impressions', label: 'Gösterim', type: 'int' }]),
  ];

  const rising = hasRows(report.movements.trackedRising) ? report.movements.trackedRising : report.movements.gscRising;
  const risingSource = hasRows(report.movements.trackedRising) ? UBER : GSC;
  if (hasRows(rising)) {
    add(
      <ReportSection
        key="s11"
        no={11}
        title="En Çok Yükselen Keywordler"
        sources={[risingSource]}
        note={risingSource === UBER ? 'Ubersuggest rank tracker karşılaştırması.' : 'Search Console pozisyon değişimi (önceki dönem ile).'}
      >
        <DataTable columns={movementColumns(risingSource)} rows={rising} limit={25} />
      </ReportSection>,
    );
  } else {
    skip(11, 'En Çok Yükselen Keywordler', 'Pozisyon karşılaştırması için veri yok');
  }

  const falling = hasRows(report.movements.trackedFalling) ? report.movements.trackedFalling : report.movements.gscFalling;
  const fallingSource = hasRows(report.movements.trackedFalling) ? UBER : GSC;
  if (hasRows(falling)) {
    add(
      <ReportSection
        key="s12"
        no={12}
        title="En Çok Düşen Keywordler"
        sources={[fallingSource]}
        note={fallingSource === UBER ? 'Ubersuggest rank tracker karşılaştırması.' : 'Search Console pozisyon değişimi (önceki dönem ile).'}
      >
        <DataTable columns={movementColumns(fallingSource)} rows={falling} limit={25} />
      </ReportSection>,
    );
  } else {
    skip(12, 'En Çok Düşen Keywordler', 'Pozisyon karşılaştırması için veri yok');
  }

  // ------------------------------------------------------------------ 13
  const opportunities = report.opportunities;
  if (hasRows(opportunities.strikingDistance) || hasRows(opportunities.uberStriking) || hasRows(opportunities.uberOpportunities)) {
    add(
      <ReportSection
        key="s13"
        no={13}
        title="SEO Fırsat Keywordleri"
        sources={[hasRows(opportunities.strikingDistance) && GSC, (hasRows(opportunities.uberStriking) || hasRows(opportunities.uberOpportunities)) && UBER].filter(Boolean)}
        note={`Search Console tarafı: 4-20 pozisyon aralığı ve medyan üstü gösterim (medyan: ${opportunities.impressionMedian === null ? EMPTY_VALUE : nf.format(Math.round(opportunities.impressionMedian))}). Ubersuggest tarafı: 4-20 aralığında hacimli kelimeler.`}
      >
        {hasRows(opportunities.strikingDistance) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.4rem' }}>Search Console — ilk sayfaya yakın sorgular</h3>
            <DataTable
              columns={[
                { key: 'keyword', label: 'Sorgu', type: 'text' },
                { key: 'position', label: 'Pozisyon', type: 'float' },
                { key: 'impressions', label: 'Gösterim', type: 'int' },
                { key: 'clicks', label: 'Tıklama', type: 'int' },
                { key: 'ctr', label: 'CTR', type: 'pct' },
                { key: 'url', label: 'URL', type: 'text' },
              ]}
              rows={opportunities.strikingDistance}
              limit={25}
            />
          </>
        )}
        {hasRows(opportunities.uberStriking) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '1.25rem 0 0.4rem' }}>Ubersuggest — hacimli ve yakın kelimeler</h3>
            <DataTable
              columns={[
                { key: 'keyword', label: 'Keyword', type: 'text' },
                { key: 'currentPosition', label: 'Pozisyon', type: 'int' },
                { key: 'searchVolume', label: 'Hacim', type: 'int' },
                { key: 'seoDifficulty', label: 'SD', type: 'float' },
                { key: 'estimatedTraffic', label: 'Tahmini trafik', type: 'float' },
              ]}
              rows={opportunities.uberStriking}
              limit={25}
            />
          </>
        )}
        {hasRows(opportunities.uberOpportunities) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '1.25rem 0 0.4rem' }}>Ubersuggest — işaretli fırsatlar</h3>
            <DataTable
              columns={[
                { key: 'opportunityType', label: 'Tür', type: 'text' },
                { key: 'opportunitySubtype', label: 'Alt tür', type: 'text' },
                { key: 'keyword', label: 'Keyword', type: 'text' },
                { key: 'currentPosition', label: 'Pozisyon', type: 'int' },
                { key: 'searchVolume', label: 'Hacim', type: 'int' },
                { key: 'impact', label: 'Etki', type: 'text' },
                { key: 'effort', label: 'Efor', type: 'text' },
              ]}
              rows={opportunities.uberOpportunities}
              limit={25}
              totalCount={snapshot?._count?.opportunities}
            />
          </>
        )}
      </ReportSection>,
    );
  } else {
    skip(13, 'SEO Fırsat Keywordleri', 'Fırsat hesaplaması için yeterli sorgu/keyword verisi yok');
  }

  // ------------------------------------------------------------------ 14
  if (hasRows(opportunities.ctrOpportunities)) {
    add(
      <ReportSection
        key="s14"
        no={14}
        title="CTR Fırsatları"
        sources={[GSC]}
        note={`İlk 10'da olup CTR'ı site ortalamasının (${pct(opportunities.siteCtr)}) altında kalan sorgular. Sabit sektör ortalaması değil, sitenin kendi gerçek ortalaması ölçüt alınır.`}
      >
        <DataTable
          columns={[
            { key: 'keyword', label: 'Sorgu', type: 'text' },
            { key: 'position', label: 'Pozisyon', type: 'float' },
            { key: 'impressions', label: 'Gösterim', type: 'int' },
            { key: 'clicks', label: 'Tıklama', type: 'int' },
            { key: 'ctr', label: 'CTR', type: 'pct' },
            { key: 'url', label: 'URL', type: 'text' },
          ]}
          rows={opportunities.ctrOpportunities}
          limit={25}
        />
      </ReportSection>,
    );
  } else {
    skip(14, 'CTR Fırsatları', 'CTR karşılaştırması için GSC verisi yetersiz');
  }

  // ------------------------------------------------------------------ 15
  const landing = report.landingPages;
  if (hasRows(landing.merged) || hasRows(landing.gscOnly)) {
    add(
      <ReportSection
        key="s15"
        no={15}
        title="Organik Landing Pages"
        sources={hasRows(landing.merged) ? [GA4, GSC] : [GSC]}
        note={
          hasRows(landing.merged)
            ? 'GA4 organik oturumları ile aynı yolun Search Console performansı yan yana. İki kaynak toplanmaz, ayrı kolonlarda gösterilir.'
            : 'GA4 landing page boyutu alınamadı; yalnızca Search Console sayfa performansı gösteriliyor.'
        }
      >
        {hasRows(landing.merged) ? (
          <DataTable
            columns={[
              { key: 'path', label: 'Landing page', type: 'text' },
              { key: 'activeUsers', label: 'Organik kullanıcı (GA4)', type: 'int' },
              { key: 'sessions', label: 'Oturum (GA4)', type: 'int' },
              { key: 'engagementRate', label: 'Etkileşim (GA4)', type: 'pct' },
              { key: 'gscClicks', label: 'Tıklama (GSC)', type: 'int' },
              { key: 'gscImpressions', label: 'Gösterim (GSC)', type: 'int' },
              { key: 'gscCtr', label: 'CTR (GSC)', type: 'pct' },
              { key: 'gscPosition', label: 'Pozisyon (GSC)', type: 'float' },
            ]}
            rows={landing.merged}
            limit={30}
          />
        ) : (
          <DataTable
            columns={[
              { key: 'path', label: 'Sayfa', type: 'text' },
              { key: 'clicks', label: 'Tıklama', type: 'int' },
              { key: 'impressions', label: 'Gösterim', type: 'int' },
              { key: 'ctr', label: 'CTR', type: 'pct' },
              { key: 'position', label: 'Pozisyon', type: 'float' },
            ]}
            rows={landing.gscOnly}
            limit={30}
          />
        )}
      </ReportSection>,
    );
  } else {
    skip(15, 'Organik Landing Pages', 'GA4 landing page ve GSC sayfa verisi yok');
  }

  // ------------------------------------------------------------------ 16
  if (hasRows(snapshot?.topPages)) {
    add(
      <ReportSection
        key="s16"
        no={16}
        title="Top SEO Sayfaları"
        sources={[UBER]}
        note="Trafik değeri araç tahminidir; GA4 görüntüleme sayısıyla karşılaştırılmamalıdır."
      >
        <DataTable
          columns={[
            { key: 'url', label: 'URL', type: 'text' },
            { key: 'pageTitle', label: 'Başlık', type: 'text' },
            { key: 'estimatedOrganicTraffic', label: 'Tahmini trafik', type: 'float' },
            { key: 'backlinks', label: 'Backlink', type: 'int' },
            { key: 'referringDomains', label: 'Ref. domain', type: 'int' },
          ]}
          rows={snapshot.topPages}
          limit={25}
          totalCount={snapshot._count?.topPages}
        />
      </ReportSection>,
    );
  } else {
    skip(16, 'Top SEO Sayfaları', 'Ubersuggest sayfa verisi yok');
  }

  // ------------------------------------------------------------------ 17
  if (hasRows(ga?.pages)) {
    add(
      <ReportSection key="s17" no={17} title="En Çok Ziyaret Edilen Sayfalar" sources={[GA4]}>
        <DataTable
          columns={[
            { key: 'title', label: 'Sayfa başlığı', type: 'text' },
            { key: 'path', label: 'Yol', type: 'text' },
            { key: 'views', label: 'Görüntüleme', type: 'int' },
            { key: 'activeUsers', label: 'Kullanıcı', type: 'int' },
            { key: 'avgSessionDuration', label: 'Ort. süre (sn)', type: 'float' },
          ]}
          rows={ga.pages}
          limit={30}
        />
      </ReportSection>,
    );
  } else {
    skip(17, 'En Çok Ziyaret Edilen Sayfalar', 'GA4 sayfa verisi yok');
  }

  // ------------------------------------------------------------------ 18
  const moves = report.pageMovements;
  if (moves.views || moves.clicks) {
    add(
      <ReportSection
        key="s18"
        no={18}
        title="Kazanan / Kaybeden Sayfalar"
        sources={[moves.views && GA4, moves.clicks && GSC].filter(Boolean)}
        note="Her iki kaynak da önceki dönemle karşılaştırılır. Yalnızca iki dönemde de veri bulunan sayfalar listelenir."
      >
        {moves.views && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.4rem' }}>Görüntüleme artan sayfalar <SourceTag source={GA4} /></h3>
            <DataTable
              columns={[
                { key: 'path', label: 'Sayfa', type: 'text' },
                { key: 'previous', label: 'Önceki', type: 'int' },
                { key: 'current', label: 'Bu dönem', type: 'int' },
                { key: 'change', label: 'Fark', type: 'delta' },
                { key: 'changePct', label: 'Değişim', type: 'pct' },
              ]}
              rows={moves.views.winners}
              limit={15}
            />
            <h3 style={{ fontSize: '0.85rem', margin: '1.25rem 0 0.4rem' }}>Görüntüleme düşen sayfalar <SourceTag source={GA4} /></h3>
            <DataTable
              columns={[
                { key: 'path', label: 'Sayfa', type: 'text' },
                { key: 'previous', label: 'Önceki', type: 'int' },
                { key: 'current', label: 'Bu dönem', type: 'int' },
                { key: 'change', label: 'Fark', type: 'delta' },
                { key: 'changePct', label: 'Değişim', type: 'pct' },
              ]}
              rows={moves.views.losers}
              limit={15}
            />
          </>
        )}
        {moves.clicks && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '1.5rem 0 0.4rem' }}>Organik tıklama artan sayfalar <SourceTag source={GSC} /></h3>
            <DataTable
              columns={[
                { key: 'path', label: 'Sayfa', type: 'text' },
                { key: 'previous', label: 'Önceki tıklama', type: 'int' },
                { key: 'current', label: 'Bu dönem', type: 'int' },
                { key: 'change', label: 'Fark', type: 'delta' },
                { key: 'positionChange', label: 'Pozisyon değişimi', type: 'delta' },
              ]}
              rows={moves.clicks.winners}
              limit={15}
            />
            <h3 style={{ fontSize: '0.85rem', margin: '1.25rem 0 0.4rem' }}>Organik tıklama düşen sayfalar <SourceTag source={GSC} /></h3>
            <DataTable
              columns={[
                { key: 'path', label: 'Sayfa', type: 'text' },
                { key: 'previous', label: 'Önceki tıklama', type: 'int' },
                { key: 'current', label: 'Bu dönem', type: 'int' },
                { key: 'change', label: 'Fark', type: 'delta' },
                { key: 'positionChange', label: 'Pozisyon değişimi', type: 'delta' },
              ]}
              rows={moves.clicks.losers}
              limit={15}
            />
          </>
        )}
      </ReportSection>,
    );
  } else {
    skip(18, 'Kazanan / Kaybeden Sayfalar', 'Önceki dönem sayfa verisi alınamadı');
  }

  // ------------------------------------------------------------------ 19
  if (hasRows(extras?.newVsReturning)) {
    const rows = extras.newVsReturning.map((row) => ({
      ...row,
      label: VISITOR_LABELS[row.type] || row.type,
    }));
    const total = rows.reduce((acc, row) => acc + row.activeUsers, 0);
    add(
      <ReportSection key="s19" no={19} title="Yeni vs Geri Dönen Kullanıcılar" sources={[GA4]}>
        <DonutChart rows={rows.map((row) => ({ label: row.label, value: row.activeUsers }))} />
        <DataTable
          columns={[
            { key: 'label', label: 'Tür', type: 'text' },
            { key: 'activeUsers', label: 'Kullanıcı', type: 'int' },
            { key: 'sessions', label: 'Oturum', type: 'int' },
            { key: 'engagementRate', label: 'Etkileşim', type: 'pct' },
            { key: 'share', label: 'Pay', type: 'pct' },
          ]}
          rows={rows.map((row) => ({ ...row, share: total > 0 ? (row.activeUsers / total) * 100 : null }))}
          limit={5}
        />
      </ReportSection>,
    );
  } else {
    skip(19, 'Yeni vs Geri Dönen Kullanıcılar', 'GA4 newVsReturning verisi yok');
  }

  // 20 — cohort/retention için GA4 cohortSpec sorgusu bu panelde çalıştırılmıyor.
  skip(20, 'Retention / Cohort', 'GA4 cohort sorgusu bu raporda çalıştırılmıyor, veri toplanmıyor');

  // ------------------------------------------------------------------ 21
  if (hasRows(ga?.devices) || hasRows(gsc?.devices)) {
    add(
      <ReportSection
        key="s21"
        no={21}
        title="Cihaz Dağılımı"
        sources={[hasRows(ga?.devices) && GA4, hasRows(gsc?.devices) && GSC].filter(Boolean)}
        note="GA4 site kullanımını, Search Console arama sonuçlarındaki cihaz kırılımını gösterir. İki tablo aynı şeyi ölçmez."
      >
        {hasRows(ga?.devices) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}>Site kullanımı <SourceTag source={GA4} /></h3>
            <DonutChart rows={ga.devices.map((row) => ({ label: row.name, value: row.activeUsers }))} />
            <DataTable
              columns={[
                { key: 'name', label: 'Cihaz', type: 'text' },
                { key: 'activeUsers', label: 'Kullanıcı', type: 'int' },
                { key: 'sessions', label: 'Oturum', type: 'int' },
                { key: 'percentage', label: 'Pay', type: 'pct' },
              ]}
              rows={ga.devices}
              limit={10}
            />
          </>
        )}
        {hasRows(gsc?.devices) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '1.25rem 0 0.4rem' }}>Arama performansı <SourceTag source={GSC} /></h3>
            <DataTable
              columns={[
                { key: 'label', label: 'Cihaz', type: 'text' },
                { key: 'clicks', label: 'Tıklama', type: 'int' },
                { key: 'impressions', label: 'Gösterim', type: 'int' },
                { key: 'ctr', label: 'CTR', type: 'pct' },
                { key: 'position', label: 'Pozisyon', type: 'float' },
              ]}
              rows={gsc.devices.map((row) => ({ ...row, label: DEVICE_LABELS[row.device] || row.device }))}
              limit={10}
            />
          </>
        )}
      </ReportSection>,
    );
  } else {
    skip(21, 'Cihaz Dağılımı', 'Cihaz verisi yok');
  }

  // ------------------------------------------------------------------ 22
  if (hasRows(ga?.countries)) {
    add(
      <ReportSection key="s22" no={22} title="Ülke Dağılımı" sources={[GA4]} note="Site ziyaretlerinin ülke kırılımı.">
        <DataTable
          columns={[
            { key: 'country', label: 'Ülke', type: 'text' },
            { key: 'activeUsers', label: 'Kullanıcı', type: 'int' },
            { key: 'sessions', label: 'Oturum', type: 'int' },
            { key: 'views', label: 'Görüntüleme', type: 'int' },
            { key: 'engagementRate', label: 'Etkileşim', type: 'pct' },
            { key: 'percentage', label: 'Pay', type: 'pct' },
          ]}
          rows={ga.countries}
          limit={30}
        />
      </ReportSection>,
    );
  } else {
    skip(22, 'Ülke Dağılımı', 'GA4 ülke verisi yok');
  }

  // ------------------------------------------------------------------ 23
  if (hasRows(gsc?.countries)) {
    add(
      <ReportSection
        key="s23"
        no={23}
        title="Search Console Ülke Performansı"
        sources={[GSC]}
        note="Google aramadaki ülke kırılımı. GA4 ülke tablosuyla aynı sayıları vermez."
      >
        <DataTable
          columns={[
            { key: 'countryName', label: 'Ülke', type: 'text' },
            { key: 'clicks', label: 'Tıklama', type: 'int' },
            { key: 'impressions', label: 'Gösterim', type: 'int' },
            { key: 'ctr', label: 'CTR', type: 'pct' },
            { key: 'position', label: 'Pozisyon', type: 'float' },
          ]}
          rows={gsc.countries}
          limit={30}
        />
      </ReportSection>,
    );
  } else {
    skip(23, 'Search Console Ülke Performansı', 'GSC ülke verisi yok');
  }

  // ------------------------------------------------------------------ 24
  if (hasRows(extras?.cities)) {
    add(
      <ReportSection key="s24" no={24} title="Şehir Dağılımı" sources={[GA4]}>
        <BarList
          rows={extras.cities.slice(0, 12).map((row) => ({ label: `${row.city}${row.country ? ` (${row.country})` : ''}`, value: row.sessions, users: row.activeUsers }))}
          secondary="users"
        />
        <DataTable
          columns={[
            { key: 'city', label: 'Şehir', type: 'text' },
            { key: 'country', label: 'Ülke', type: 'text' },
            { key: 'activeUsers', label: 'Kullanıcı', type: 'int' },
            { key: 'sessions', label: 'Oturum', type: 'int' },
          ]}
          rows={extras.cities}
          limit={30}
        />
      </ReportSection>,
    );
  } else {
    skip(24, 'Şehir Dağılımı', 'GA4 şehir verisi alınamadı');
  }

  // ------------------------------------------------------------------ 25
  if (hasRows(ga?.browsers)) {
    add(
      <ReportSection key="s25" no={25} title="Tarayıcı Dağılımı" sources={[GA4]}>
        <BarList rows={ga.browsers.map((row) => ({ label: row.name, value: row.sessions, users: row.activeUsers }))} secondary="users" limit={10} />
      </ReportSection>,
    );
  } else {
    skip(25, 'Tarayıcı Dağılımı', 'GA4 tarayıcı verisi yok');
  }

  // ------------------------------------------------------------------ 26
  if (hasRows(extras?.ageBrackets) || hasRows(extras?.genders)) {
    add(
      <ReportSection
        key="s26"
        no={26}
        title="Yaş / Cinsiyet"
        sources={[GA4]}
        note="Google Signals kapalıysa veya eşik altında kalıyorsa bu veri boş gelir; boş satırlar gösterilmez."
      >
        {hasRows(extras.ageBrackets) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}>Yaş aralığı</h3>
            <BarList rows={extras.ageBrackets.map((row) => ({ label: row.bracket, value: row.activeUsers }))} limit={10} />
          </>
        )}
        {hasRows(extras.genders) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '1.25rem 0 0.25rem' }}>Cinsiyet</h3>
            <DonutChart rows={extras.genders.map((row) => ({ label: GENDER_LABELS[row.gender] || row.gender, value: row.activeUsers }))} />
          </>
        )}
      </ReportSection>,
    );
  } else {
    skip(26, 'Yaş / Cinsiyet', 'GA4 demografi verisi yok (Google Signals kapalı veya eşik altında)');
  }

  // ------------------------------------------------------------------ 27
  const timeAnalysis = report.timeAnalysis;
  if (timeAnalysis && (hasRows(timeAnalysis.days) || hasRows(timeAnalysis.hours))) {
    add(
      <ReportSection
        key="s27"
        no={27}
        title="Gün ve Saat Analizi"
        sources={[GA4]}
        note={[
          timeAnalysis.busiestDay ? `En yoğun gün: ${['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][timeAnalysis.busiestDay.day]}` : null,
          timeAnalysis.busiestHour ? `en yoğun saat: ${String(timeAnalysis.busiestHour.hour).padStart(2, '0')}:00` : null,
        ].filter(Boolean).join(' · ') || undefined}
      >
        {hasRows(timeAnalysis.days) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.25rem' }}>Haftanın günleri (oturum)</h3>
            <HeatStrip rows={timeAnalysis.days} />
          </>
        )}
        {hasRows(timeAnalysis.hours) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '1.25rem 0 0.25rem' }}>Saatler (oturum)</h3>
            <HeatStrip rows={timeAnalysis.hours} />
          </>
        )}
      </ReportSection>,
    );
  } else {
    skip(27, 'Gün ve Saat Analizi', 'GA4 gün/saat verisi alınamadı');
  }

  // ------------------------------------------------------------------ 28
  if (hasRows(extras?.keyEvents) || hasRows(extras?.events)) {
    add(
      <ReportSection
        key="s28"
        no={28}
        title="Dönüşümler / Key Events"
        sources={[GA4]}
        note="Anahtar olay olarak işaretlenmiş event'ler ayrı listelenir. İşaretli olay yoksa yalnızca tüm event sayıları görünür."
      >
        {hasRows(extras.keyEvents) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '0 0 0.4rem' }}>Anahtar olaylar</h3>
            <DataTable
              columns={[
                { key: 'event', label: 'Olay', type: 'text' },
                { key: 'count', label: 'Sayı', type: 'int' },
              ]}
              rows={extras.keyEvents}
              limit={25}
            />
          </>
        )}
        {hasRows(extras.events) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '1.25rem 0 0.4rem' }}>Tüm olaylar</h3>
            <DataTable
              columns={[
                { key: 'event', label: 'Olay', type: 'text' },
                { key: 'count', label: 'Sayı', type: 'int' },
                { key: 'users', label: 'Kullanıcı', type: 'int' },
              ]}
              rows={extras.events}
              limit={30}
            />
          </>
        )}
      </ReportSection>,
    );
  } else {
    skip(28, 'Dönüşümler / Key Events', 'GA4 event verisi yok');
  }

  // ------------------------------------------------------------------ 29
  if (extras?.ecommerce) {
    add(
      <ReportSection key="s29" no={29} title="E-Ticaret Performansı" sources={[GA4]} note="Yalnızca e-ticaret ölçümü yapan mülklerde dolu gelir.">
        <MetricGrid
          items={[
            { label: 'Gelir', source: GA4, value: extras.ecommerce.revenue === null ? EMPTY_VALUE : `${nf.format(Math.round(extras.ecommerce.revenue))} ₺` },
            { label: 'Sipariş', source: GA4, value: num(extras.ecommerce.transactions) },
            { label: 'Ortalama sepet', source: GA4, value: extras.ecommerce.avgRevenue === null ? EMPTY_VALUE : `${nf.format(Math.round(extras.ecommerce.avgRevenue))} ₺` },
            { label: 'Satılan ürün', source: GA4, value: num(extras.ecommerce.itemsPurchased) },
            gaOk && {
              label: 'Dönüşüm oranı',
              source: GA4,
              value: ga.summary.sessions > 0 ? pct((extras.ecommerce.transactions / ga.summary.sessions) * 100) : EMPTY_VALUE,
              hint: 'Sipariş / oturum',
            },
          ].filter(Boolean)}
        />
        {hasRows(extras.products) && (
          <>
            <h3 style={{ fontSize: '0.85rem', margin: '1.25rem 0 0.4rem' }}>En çok satan ürünler</h3>
            <DataTable
              columns={[
                { key: 'name', label: 'Ürün', type: 'text' },
                { key: 'quantity', label: 'Adet', type: 'int' },
                { key: 'revenue', label: 'Gelir', type: 'money' },
              ]}
              rows={extras.products}
              limit={20}
            />
          </>
        )}
      </ReportSection>,
    );
  } else {
    skip(29, 'E-Ticaret Performansı', 'GA4 e-ticaret ölçümü yok veya tüm değerler sıfır');
  }

  // ------------------------------------------------------------------ 30
  if (hasRows(extras?.siteSearch)) {
    add(
      <ReportSection key="s30" no={30} title="İç Arama Verileri" sources={[GA4]} note="Site içi aramanın GA4'te yapılandırılmış olması gerekir.">
        <DataTable
          columns={[
            { key: 'term', label: 'Arama terimi', type: 'text' },
            { key: 'count', label: 'Arama sayısı', type: 'int' },
            { key: 'users', label: 'Kullanıcı', type: 'int' },
          ]}
          rows={extras.siteSearch}
          limit={30}
        />
      </ReportSection>,
    );
  } else {
    skip(30, 'İç Arama Verileri', 'GA4 site içi arama verisi yok');
  }

  // 31-47: Ubersuggest bölümleri, 48-50: veriden türetilen analiz.
  const seo = buildSeoSections(ubersuggest);
  const insights = buildInsightSections(report);
  hidden.push(...seo.hidden, ...insights.hidden);

  return (
    <>
      {sections}
      {seo.sections}
      {insights.sections}
      {hidden.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h2 className="heading-2" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Veri olmadığı için gizlenen bölümler</h2>
          <p className="text-muted" style={{ fontSize: '0.78rem', marginBottom: '0.75rem' }}>
            Bu bölümler uydurma değer yerine gizlendi. Sebepler aşağıda.
          </p>
          {hidden
            .slice()
            .sort((a, b) => a.no - b.no)
            .map((item) => (
              <div
                key={item.no}
                data-section-no={item.no}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '0.4rem 0',
                  borderBottom: '1px dashed var(--border-color)',
                  fontSize: '0.82rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)', minWidth: '1.75rem' }}>{item.no}</span>
                <span style={{ fontWeight: 600, minWidth: '180px' }}>{item.title}</span>
                <span className="text-muted">{item.reason}</span>
              </div>
            ))}
        </div>
      )}
    </>
  );
}
