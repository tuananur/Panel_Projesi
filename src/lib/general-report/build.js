// Genel rapor hesaplama katmanı.
//
// Kurallar:
// - Her metrik tek bir kaynaktan gelir ve kaynağı etiketlenir. GA4 "gerçek kullanıcı",
//   GSC "gerçek Google arama", Ubersuggest "tahmin/araç verisi" olarak ayrı tutulur.
// - Aynı isimli metrikler birleştirilmez: organik trafik (GA4) ile tahmini organik trafik
//   (Ubersuggest) ve tıklama (GSC) ayrı satırlardır.
// - Veri yoksa null/boş dizi döner; hiçbir değer tahmin edilmez veya sıfırla doldurulmaz.

export const SOURCE_GA4 = 'GA4';
export const SOURCE_GSC = 'Search Console';
export const SOURCE_UBER = 'Ubersuggest';

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

/** Yüzde değişim. Önceki dönem sıfır/yoksa oran tanımsızdır, null döner. */
export function changePct(current, previous) {
  if (current === null || current === undefined) return null;
  if (previous === null || previous === undefined || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function diff(current, previous) {
  if (current === null || current === undefined) return null;
  if (previous === null || previous === undefined) return null;
  return current - previous;
}

/** GSC tam URL'sinden yol çıkarır; GA4 pagePath ile eşleştirmek için. */
export function pathFromUrl(url) {
  if (!url) return null;
  try {
    return new URL(url).pathname || '/';
  } catch {
    return url.startsWith('/') ? url : null;
  }
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function sum(rows, key) {
  return rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
}

// --- Bölüm 2: dönem karşılaştırması ---

function buildComparison(ga, gsc, extras) {
  const rows = [];
  const prev = extras?.previousSummary || null;

  if (ga?.summary && prev) {
    rows.push(
      { label: 'Aktif kullanıcı', source: SOURCE_GA4, current: ga.summary.activeUsers, previous: prev.activeUsers, unit: 'count' },
      { label: 'Oturum', source: SOURCE_GA4, current: ga.summary.sessions, previous: prev.sessions, unit: 'count' },
      { label: 'Sayfa görüntüleme', source: SOURCE_GA4, current: ga.summary.pageViews, previous: prev.pageViews, unit: 'count' },
      { label: 'Hemen çıkma oranı', source: SOURCE_GA4, current: ga.summary.bounceRate, previous: prev.bounceRate, unit: 'pct', lowerIsBetter: true },
    );
  }

  const gscPrev = gsc?.compareSummary || null;
  if (gsc?.summary && gscPrev) {
    rows.push(
      { label: 'Organik tıklama', source: SOURCE_GSC, current: gsc.summary.clicks, previous: gscPrev.clicks, unit: 'count' },
      { label: 'Organik gösterim', source: SOURCE_GSC, current: gsc.summary.impressions, previous: gscPrev.impressions, unit: 'count' },
      { label: 'CTR', source: SOURCE_GSC, current: gsc.summary.ctr, previous: gscPrev.ctr, unit: 'pct' },
      { label: 'Ortalama pozisyon', source: SOURCE_GSC, current: gsc.summary.position, previous: gscPrev.position, unit: 'position', lowerIsBetter: true },
    );
  }

  return rows.map((row) => ({
    ...row,
    changePct: changePct(row.current, row.previous),
    changeAbs: diff(row.current, row.previous),
  }));
}

// --- Bölüm 5: organik trafik (GA4 kanal grubu) ---

function buildOrganicTraffic(ga, extras) {
  const groups = extras?.channelGroups;
  if (!groups || groups.length === 0) return null;

  const organic = groups.find((row) => row.channel === 'Organic Search') || null;
  const totalSessions = sum(groups, 'sessions');
  const totalUsers = sum(groups, 'activeUsers');

  return {
    organic,
    totalSessions,
    totalUsers,
    sessionShare: organic && totalSessions > 0 ? (organic.sessions / totalSessions) * 100 : null,
    userShare: organic && totalUsers > 0 ? (organic.activeUsers / totalUsers) * 100 : null,
    daily: extras?.organicDaily || null,
    groups,
  };
}

// --- Bölüm 11/12: yükselen ve düşen kelimeler ---

function buildRankMovements(ubersuggest, gsc) {
  const tracked = ubersuggest?.snapshot?.rankTracking || [];

  const withChange = tracked
    .filter((row) => row.positionChange !== null && row.positionChange !== 0)
    .map((row) => ({
      keyword: row.keyword,
      oldPosition: row.oldPosition,
      newPosition: row.newPosition,
      change: row.positionChange,
      searchVolume: row.searchVolume,
      source: SOURCE_UBER,
    }));

  // GSC tarafı: pozisyonu değişen sorgular. Ubersuggest takibi yoksa tek kaynak bu olur.
  const gscMoves = (gsc?.queries || [])
    .filter((row) => !row.isNew && row.positionChange !== 0 && row.previousPosition !== null)
    .map((row) => ({
      keyword: row.keyword,
      oldPosition: row.previousPosition,
      newPosition: row.position,
      change: row.positionChange,
      clicks: row.clicks,
      impressions: row.impressions,
      source: SOURCE_GSC,
    }));

  const byChangeDesc = (a, b) => b.change - a.change;
  const byChangeAsc = (a, b) => a.change - b.change;

  return {
    trackedRising: withChange.filter((row) => row.change > 0).sort(byChangeDesc).slice(0, 50),
    trackedFalling: withChange.filter((row) => row.change < 0).sort(byChangeAsc).slice(0, 50),
    gscRising: gscMoves.filter((row) => row.change > 0).sort(byChangeDesc).slice(0, 50),
    gscFalling: gscMoves.filter((row) => row.change < 0).sort(byChangeAsc).slice(0, 50),
  };
}

// --- Bölüm 13/14: fırsatlar ---

function buildOpportunities(gsc, ubersuggest) {
  const queries = gsc?.queries || [];
  const impressionValues = queries.filter((row) => row.impressions > 0).map((row) => row.impressions);
  const impressionMedian = median(impressionValues);
  const siteCtr = gsc?.summary?.ctr ?? null;

  // 4-20 arası pozisyonda, medyan üstü gösterim alan sorgular: ilk sayfaya taşınabilir olanlar.
  const strikingDistance = impressionMedian
    ? queries
        .filter((row) => row.position >= 4 && row.position <= 20 && row.impressions >= impressionMedian)
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 50)
    : [];

  // Pozisyonu ilk 10'da olmasına rağmen CTR'ı sitenin kendi ortalamasının altında kalanlar.
  // Sabit bir sektör benchmark'ı kullanılmaz; kıyas ölçütü sitenin gerçek ortalaması.
  const ctrOpportunities = siteCtr
    ? queries
        .filter((row) => row.position <= 10 && row.impressions > 0 && row.ctr < siteCtr && row.impressions >= (impressionMedian || 0))
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 50)
    : [];

  const uberOpportunities = ubersuggest?.snapshot?.opportunities || [];
  const uberKeywords = ubersuggest?.snapshot?.keywords || [];

  // Ubersuggest tarafı: 4-20 pozisyonda ve arama hacmi olan kelimeler.
  const uberStriking = uberKeywords
    .filter((row) => row.currentPosition !== null && row.currentPosition >= 4 && row.currentPosition <= 20 && (row.searchVolume || 0) > 0)
    .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
    .slice(0, 50);

  return {
    impressionMedian,
    siteCtr,
    strikingDistance,
    ctrOpportunities,
    uberStriking,
    uberOpportunities,
  };
}

// --- Bölüm 15: organik landing page (GA4) + GSC sayfa performansı ---

function buildLandingPages(extras, gsc) {
  const gaPages = extras?.organicLandingPages || null;
  const gscPages = gsc?.pages || [];
  const gscByPath = new Map();
  gscPages.forEach((row) => {
    const path = pathFromUrl(row.page);
    if (path) gscByPath.set(path, row);
  });

  if (!gaPages || gaPages.length === 0) {
    // GA4 landing page boyutu yoksa yalnızca GSC sayfa performansı gösterilir.
    return {
      merged: null,
      gscOnly: gscPages
        .map((row) => ({ ...row, path: pathFromUrl(row.page) }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 100),
    };
  }

  return {
    merged: gaPages.slice(0, 100).map((row) => {
      const gscRow = gscByPath.get(row.path) || null;
      return {
        ...row,
        gscClicks: gscRow?.clicks ?? null,
        gscImpressions: gscRow?.impressions ?? null,
        gscCtr: gscRow?.ctr ?? null,
        gscPosition: gscRow?.position ?? null,
      };
    }),
    gscOnly: null,
  };
}

// --- Bölüm 18: kazanan / kaybeden sayfalar ---

function buildPageMovements(ga, extras, gsc) {
  const result = { views: null, clicks: null };

  const currentPages = ga?.pages || [];
  const previousPages = extras?.previousPages || null;
  if (currentPages.length > 0 && previousPages) {
    const prevByPath = new Map(previousPages.map((row) => [row.path, row]));
    const rows = currentPages
      .map((row) => {
        const prev = prevByPath.get(row.path);
        if (!prev) return null;
        return {
          path: row.path,
          title: row.title,
          current: row.views,
          previous: prev.views,
          change: row.views - prev.views,
          changePct: changePct(row.views, prev.views),
        };
      })
      .filter(Boolean);

    result.views = {
      winners: rows.filter((row) => row.change > 0).sort((a, b) => b.change - a.change).slice(0, 25),
      losers: rows.filter((row) => row.change < 0).sort((a, b) => a.change - b.change).slice(0, 25),
    };
  }

  const gscCurrent = gsc?.pages || [];
  const gscPrevious = gsc?.comparePages || null;
  if (gscCurrent.length > 0 && gscPrevious) {
    const prevByPage = new Map(gscPrevious.map((row) => [row.page, row]));
    const rows = gscCurrent
      .map((row) => {
        const prev = prevByPage.get(row.page);
        if (!prev) return null;
        return {
          page: row.page,
          path: pathFromUrl(row.page),
          current: row.clicks,
          previous: prev.clicks,
          change: row.clicks - prev.clicks,
          changePct: changePct(row.clicks, prev.clicks),
          positionChange: prev.position !== null && row.position !== null ? prev.position - row.position : null,
        };
      })
      .filter(Boolean);

    result.clicks = {
      winners: rows.filter((row) => row.change > 0).sort((a, b) => b.change - a.change).slice(0, 25),
      losers: rows.filter((row) => row.change < 0).sort((a, b) => a.change - b.change).slice(0, 25),
    };
  }

  return result;
}

// --- Bölüm 27: gün ve saat ---

function buildTimeAnalysis(extras) {
  const days = extras?.dayOfWeek;
  const hours = extras?.hours;
  if (!days && !hours) return null;

  return {
    days: days
      ? [...days].sort((a, b) => a.day - b.day).map((row) => ({ ...row, label: DAY_NAMES[row.day] || `Gün ${row.day}` }))
      : null,
    hours: hours
      ? [...hours].sort((a, b) => a.hour - b.hour).map((row) => ({ ...row, label: `${String(row.hour).padStart(2, '0')}:00` }))
      : null,
    busiestDay: days && days.length > 0 ? [...days].sort((a, b) => b.sessions - a.sessions)[0] : null,
    busiestHour: hours && hours.length > 0 ? [...hours].sort((a, b) => b.sessions - a.sessions)[0] : null,
  };
}

// --- Bölüm 48/49/50: veriden türetilen analiz, aksiyon planı ve sonuç ---

function buildAnalysis({ comparison, organic, movements, opportunities, ubersuggest, pageMovements }) {
  const items = [];
  const snapshot = ubersuggest?.snapshot || null;

  const find = (label) => comparison.find((row) => row.label === label) || null;
  const users = find('Aktif kullanıcı');
  const clicks = find('Organik tıklama');
  const impressions = find('Organik gösterim');
  const position = find('Ortalama pozisyon');

  if (users?.changePct !== null && users?.changePct !== undefined) {
    const dir = users.changePct >= 0 ? 'arttı' : 'azaldı';
    items.push({
      title: 'Site trafiği',
      source: SOURCE_GA4,
      what: `Aktif kullanıcı önceki döneme göre %${Math.abs(users.changePct).toFixed(1)} ${dir} (${Math.round(users.previous)} → ${Math.round(users.current)}).`,
      why: 'Toplam kullanıcı, tüm kanalların birleşik sonucudur; kampanya, sezon ve SEO etkisi burada toplanır.',
      todo: users.changePct >= 0
        ? 'Artışın hangi kanaldan geldiğini trafik kaynakları bölümünden doğrulayın ve o kanala bütçe/içerik ağırlığı verin.'
        : 'Düşüşün kanal kırılımını kontrol edin; organik düşüşse sıralama kaybı, direkt düşüşse kampanya kesintisi olasıdır.',
    });
  }

  if (clicks?.changePct !== null && clicks?.changePct !== undefined) {
    const dir = clicks.changePct >= 0 ? 'arttı' : 'azaldı';
    const impressionNote = impressions?.changePct !== null && impressions?.changePct !== undefined
      ? ` Gösterim aynı dönemde %${Math.abs(impressions.changePct).toFixed(1)} ${impressions.changePct >= 0 ? 'arttı' : 'azaldı'}.`
      : '';
    items.push({
      title: 'Google arama performansı',
      source: SOURCE_GSC,
      what: `Organik tıklama %${Math.abs(clicks.changePct).toFixed(1)} ${dir}.${impressionNote}`,
      why: 'Gösterim artarken tıklama artmıyorsa sorun görünürlükte değil, başlık/açıklama ve pozisyondadır.',
      todo: impressions?.changePct > 0 && clicks.changePct <= 0
        ? 'CTR fırsatları bölümündeki sorguların başlık ve meta açıklamalarını yeniden yazın.'
        : 'Tıklama getiren sorguların içeriklerini güncel tutun ve ilk 3 dışındaki yüksek hacimli sorgulara odaklanın.',
    });
  }

  if (position?.changeAbs !== null && position?.changeAbs !== undefined) {
    const improved = position.changeAbs < 0;
    items.push({
      title: 'Ortalama pozisyon',
      source: SOURCE_GSC,
      what: `Ortalama pozisyon ${position.previous} → ${position.current} (${improved ? 'iyileşme' : 'gerileme'}).`,
      why: 'Ortalama pozisyon, tüm sorguların gösterim ağırlıklı ortalamasıdır; yeni sorgular girdikçe dalgalanabilir.',
      todo: improved
        ? 'İyileşen sorguların içeriklerini koruyun, iç linkleme ile destekleyin.'
        : 'Düşen kelimeler bölümündeki sorguların hedef sayfalarını içerik ve teknik yönden gözden geçirin.',
    });
  }

  if (organic?.sessionShare !== null && organic?.sessionShare !== undefined) {
    items.push({
      title: 'Organik kanalın payı',
      source: SOURCE_GA4,
      what: `Organik arama, oturumların %${organic.sessionShare.toFixed(1)}'ini getiriyor.`,
      why: 'Organik pay düşükse trafik reklama veya sosyal medyaya bağımlıdır; yüksekse SEO kaybı doğrudan ciroyu etkiler.',
      todo: organic.sessionShare < 40
        ? 'Organik payı artırmak için içerik üretim hızını ve teknik SEO sorunlarının kapatılmasını önceliklendirin.'
        : 'Organik bağımlılık yüksek; sıralama kayıplarına karşı düzenli takip ve içerik tazeleme planı kurun.',
    });
  }

  const falling = movements.trackedFalling.length > 0 ? movements.trackedFalling : movements.gscFalling;
  const rising = movements.trackedRising.length > 0 ? movements.trackedRising : movements.gscRising;
  if (rising.length > 0 || falling.length > 0) {
    items.push({
      title: 'Sıralama hareketleri',
      source: movements.trackedFalling.length > 0 ? SOURCE_UBER : SOURCE_GSC,
      what: `${rising.length} kelime yükseldi, ${falling.length} kelime düştü.`,
      why: 'Yükselen ve düşen kelime dengesi, SEO çalışmasının yönünü tek bakışta gösterir.',
      todo: falling.length > rising.length
        ? 'Düşen kelimelerin hedef sayfalarını rakip içeriklerle karşılaştırıp güncelleyin.'
        : 'Yükselen kelimeleri ilk 3\'e taşımak için iç link ve içerik derinliği çalışması yapın.',
    });
  }

  if (opportunities.strikingDistance.length > 0) {
    items.push({
      title: 'İlk sayfa fırsatı',
      source: SOURCE_GSC,
      what: `${opportunities.strikingDistance.length} sorgu 4-20 pozisyon aralığında ve medyan üstü gösterim alıyor.`,
      why: 'Bu aralıktaki sorgular en düşük eforla en hızlı tıklama artışını sağlayan gruptur.',
      todo: 'Listedeki sorguların hedef sayfalarına içerik ekleyin, başlıkları sorgu diline yaklaştırın.',
    });
  }

  if (opportunities.ctrOpportunities.length > 0) {
    items.push({
      title: 'CTR kaybı',
      source: SOURCE_GSC,
      what: `${opportunities.ctrOpportunities.length} sorgu ilk 10'da olmasına rağmen site ortalaması (%${(opportunities.siteCtr || 0).toFixed(2)}) altında CTR alıyor.`,
      why: 'Pozisyon iyi ama tıklama düşükse kayıp doğrudan başlık, açıklama veya SERP görünümündedir.',
      todo: 'Bu sorguların başlık ve meta açıklamalarını yeniden yazın, uygun sayfalarda yapılandırılmış veri ekleyin.',
    });
  }

  if (snapshot) {
    if (snapshot.siteHealthScore !== null) {
      items.push({
        title: 'Teknik sağlık',
        source: SOURCE_UBER,
        what: `Site sağlık puanı ${snapshot.siteHealthScore}${snapshot.totalIssuesCount !== null ? `, toplam ${snapshot.totalIssuesCount} sorun` : ''}.`,
        why: 'Teknik sorunlar taranabilirliği ve sayfa deneyimini bozarak içerik çalışmasının getirisini düşürür.',
        todo: 'Teknik SEO sorunları bölümündeki yüksek etkili ve kolay maddeleri önce kapatın.',
      });
    }
    if (snapshot.totalBacklinks !== null || snapshot.referringDomains !== null) {
      items.push({
        title: 'Backlink profili',
        source: SOURCE_UBER,
        what: `${snapshot.totalBacklinks !== null ? `${snapshot.totalBacklinks} backlink` : 'Backlink verisi yok'}${snapshot.referringDomains !== null ? `, ${snapshot.referringDomains} referans domain` : ''}${snapshot.domainAuthority !== null ? `, DA ${snapshot.domainAuthority}` : ''}.`,
        why: 'Referans domain sayısı, rekabetçi kelimelerde sıralama tavanını belirleyen ana etkendir.',
        todo: 'Backlink fırsatları bölümündeki rakibe link veren siteleri hedefleyen bir erişim listesi çıkarın.',
      });
    }
  }

  if (pageMovements.views?.losers?.length > 0 || pageMovements.clicks?.losers?.length > 0) {
    const viewLosers = pageMovements.views?.losers?.length || 0;
    const clickLosers = pageMovements.clicks?.losers?.length || 0;
    items.push({
      title: 'Kaybeden sayfalar',
      source: viewLosers && clickLosers ? `${SOURCE_GA4} + ${SOURCE_GSC}` : viewLosers ? SOURCE_GA4 : SOURCE_GSC,
      what: `${viewLosers} sayfa görüntüleme, ${clickLosers} sayfa organik tıklama kaybetti.`,
      why: 'Belirli sayfalarda yoğunlaşan kayıp, genelde içerik güncelliği veya kaybedilen sıralamaya işaret eder.',
      todo: 'En çok kaybeden ilk 5 sayfayı içerik tazeliği, başlık ve iç link açısından elden geçirin.',
    });
  }

  return items;
}

function buildActionPlan({ comparison, opportunities, movements, ubersuggest, pageMovements }) {
  const actions = [];
  const snapshot = ubersuggest?.snapshot || null;
  const add = (priority, title, detail, source) => actions.push({ priority, title, detail, source });

  const clicks = comparison.find((row) => row.label === 'Organik tıklama');
  if (clicks?.changePct !== null && clicks?.changePct !== undefined && clicks.changePct <= -10) {
    add('Kritik', 'Organik tıklama düşüşünü durdur', `Tıklama %${Math.abs(clicks.changePct).toFixed(1)} düştü. Düşen kelimeler ve kaybeden sayfalar listelerinden başlayın.`, SOURCE_GSC);
  }

  if (snapshot?.brokenPagesCount > 0) {
    add('Kritik', 'Kırık sayfaları düzelt', `${snapshot.brokenPagesCount} sayfa kırık durumda. Sorunlu URL listesindeki 4xx/5xx kayıtlarını kapatın.`, SOURCE_UBER);
  }

  const highImpactIssues = (snapshot?.auditIssues || []).filter((issue) => issue.seoImpact === 'high');
  if (highImpactIssues.length > 0) {
    add('Yüksek', 'Yüksek etkili teknik sorunları kapat', `${highImpactIssues.length} yüksek etkili sorun var: ${highImpactIssues.slice(0, 5).map((i) => i.issueId).join(', ')}.`, SOURCE_UBER);
  }

  const mobileSpeed = (snapshot?.pagespeed || []).find((row) => row.device === 'MOBILE');
  if (mobileSpeed?.performanceScore !== null && mobileSpeed?.performanceScore !== undefined && mobileSpeed.performanceScore < 50) {
    add('Yüksek', 'Mobil hızı iyileştir', `Mobil performans puanı ${mobileSpeed.performanceScore}. LCP ve TTFB değerlerini önceliklendirin.`, SOURCE_UBER);
  }

  if (opportunities.ctrOpportunities.length > 0) {
    add('Yüksek', 'CTR düşük sayfaları optimize et', `${opportunities.ctrOpportunities.length} sorgu ilk 10'da ama site ortalamasının altında CTR alıyor. Başlık ve meta açıklamaları yeniden yazın.`, SOURCE_GSC);
  }

  if (opportunities.strikingDistance.length > 0) {
    add('Yüksek', '4-20 arası kelimeleri ilk sayfaya taşı', `${opportunities.strikingDistance.length} sorgu bu aralıkta. En yüksek gösterimli 10 tanesiyle başlayın.`, SOURCE_GSC);
  }

  const falling = movements.trackedFalling.length > 0 ? movements.trackedFalling : movements.gscFalling;
  if (falling.length > 0) {
    add('Orta', 'Düşen kelimelerin sayfalarını güncelle', `${falling.length} kelime geriledi. En çok düşen: ${falling.slice(0, 5).map((row) => row.keyword).join(', ')}.`, movements.trackedFalling.length > 0 ? SOURCE_UBER : SOURCE_GSC);
  }

  if ((snapshot?.backlinkOpportunities || []).length > 0) {
    add('Orta', 'Backlink boşluğunu kapat', `${snapshot.backlinkOpportunities.length} site rakibe link verip size vermiyor. Erişim listesi çıkarın.`, SOURCE_UBER);
  }

  const quickWins = snapshot?.quickWinOpportunityCount;
  if (quickWins > 0) {
    add('Orta', 'Hızlı kazanım fırsatlarını uygula', `${quickWins} hızlı kazanım fırsatı işaretli.`, SOURCE_UBER);
  }

  if (pageMovements.views?.losers?.length > 0) {
    add('Orta', 'Trafiği düşen sayfaları tazele', `${pageMovements.views.losers.length} sayfa görüntüleme kaybetti. İlk 5: ${pageMovements.views.losers.slice(0, 5).map((row) => row.path).join(', ')}.`, SOURCE_GA4);
  }

  const mediumIssues = (snapshot?.auditIssues || []).filter((issue) => issue.seoImpact === 'medium');
  if (mediumIssues.length > 0) {
    add('Düşük', 'Orta etkili teknik sorunları planla', `${mediumIssues.length} orta etkili sorun sıraya alınabilir.`, SOURCE_UBER);
  }

  if (snapshot?.newContentOpportunityCount > 0) {
    add('Düşük', 'Yeni içerik fırsatlarını takvimle', `${snapshot.newContentOpportunityCount} yeni içerik fırsatı var.`, SOURCE_UBER);
  }

  const order = { Kritik: 0, Yüksek: 1, Orta: 2, Düşük: 3 };
  return actions.sort((a, b) => order[a.priority] - order[b.priority]);
}

function buildConclusion({ comparison, organic, movements, opportunities, actions }) {
  const good = [];
  const bad = [];

  comparison.forEach((row) => {
    if (row.changePct === null) return;
    const improved = row.lowerIsBetter ? row.changePct < 0 : row.changePct > 0;
    const text = `${row.label} (${row.source}) %${Math.abs(row.changePct).toFixed(1)} ${row.changePct >= 0 ? 'arttı' : 'azaldı'}`;
    if (Math.abs(row.changePct) < 1) return;
    (improved ? good : bad).push(text);
  });

  const rising = movements.trackedRising.length > 0 ? movements.trackedRising : movements.gscRising;
  const falling = movements.trackedFalling.length > 0 ? movements.trackedFalling : movements.gscFalling;
  if (rising.length > falling.length) good.push(`${rising.length} kelime yükseldi, ${falling.length} kelime düştü`);
  if (falling.length > rising.length) bad.push(`${falling.length} kelime düştü, ${rising.length} kelime yükseldi`);

  const opportunitiesList = [];
  if (opportunities.strikingDistance.length > 0) {
    opportunitiesList.push(`${opportunities.strikingDistance.length} sorgu 4-20 aralığında, ilk sayfaya taşınabilir`);
  }
  if (opportunities.ctrOpportunities.length > 0) {
    opportunitiesList.push(`${opportunities.ctrOpportunities.length} sorguda CTR site ortalamasının altında`);
  }
  if (opportunities.uberStriking.length > 0) {
    opportunitiesList.push(`${opportunities.uberStriking.length} takip edilen kelime hacimli ve 4-20 aralığında`);
  }
  if (organic?.sessionShare !== null && organic?.sessionShare !== undefined && organic.sessionShare < 40) {
    opportunitiesList.push(`organik pay %${organic.sessionShare.toFixed(1)}, büyütme alanı var`);
  }

  return {
    good,
    bad,
    opportunities: opportunitiesList,
    next: actions.slice(0, 5).map((action) => `${action.priority}: ${action.title}`),
  };
}

export function buildGeneralReport({ ga, gsc, extras, ubersuggest, period }) {
  const comparison = buildComparison(ga, gsc, extras);
  const organic = buildOrganicTraffic(ga, extras);
  const movements = buildRankMovements(ubersuggest, gsc);
  const opportunities = buildOpportunities(gsc, ubersuggest);
  const landingPages = buildLandingPages(extras, gsc);
  const pageMovements = buildPageMovements(ga, extras, gsc);
  const timeAnalysis = buildTimeAnalysis(extras);

  const analysis = buildAnalysis({ comparison, organic, movements, opportunities, ubersuggest, pageMovements });
  const actions = buildActionPlan({ comparison, opportunities, movements, ubersuggest, pageMovements });
  const conclusion = buildConclusion({ comparison, organic, movements, opportunities, actions });

  return {
    period,
    comparison,
    organic,
    movements,
    opportunities,
    landingPages,
    pageMovements,
    timeAnalysis,
    analysis,
    actions,
    conclusion,
  };
}
