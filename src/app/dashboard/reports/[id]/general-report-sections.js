// Genel raporun 50 bölümünün sabit kataloğu.
// Ayarlar paneli ve görünürlük filtresi buradan beslenir; başlıklar panelle birebir aynı olmalı.

export const GENERAL_REPORT_SECTIONS = [
  { no: 1, title: 'Rapor Özeti' },
  { no: 2, title: 'Dönem Karşılaştırması' },
  { no: 3, title: 'Trafik Trendi' },
  { no: 4, title: 'Trafik Kaynakları' },
  { no: 5, title: 'Organik Trafik Özeti' },
  { no: 6, title: 'Search Console Genel Performans' },
  { no: 7, title: 'Search Console Günlük Performans' },
  { no: 8, title: 'Google Arama Sorguları' },
  { no: 9, title: 'SEO Keyword Performansı' },
  { no: 10, title: 'Takip Edilen Keyword / Rank Tracking' },
  { no: 11, title: 'En Çok Yükselen Keywordler' },
  { no: 12, title: 'En Çok Düşen Keywordler' },
  { no: 13, title: 'SEO Fırsat Keywordleri' },
  { no: 14, title: 'CTR Fırsatları' },
  { no: 15, title: 'Organik Landing Pages' },
  { no: 16, title: 'Top SEO Sayfaları' },
  { no: 17, title: 'En Çok Ziyaret Edilen Sayfalar' },
  { no: 18, title: 'Kazanan / Kaybeden Sayfalar' },
  { no: 19, title: 'Yeni vs Geri Dönen Kullanıcılar' },
  { no: 20, title: 'Retention / Cohort' },
  { no: 21, title: 'Cihaz Dağılımı' },
  { no: 22, title: 'Ülke Dağılımı' },
  { no: 23, title: 'Search Console Ülke Performansı' },
  { no: 24, title: 'Şehir Dağılımı' },
  { no: 25, title: 'Tarayıcı Dağılımı' },
  { no: 26, title: 'Yaş / Cinsiyet' },
  { no: 27, title: 'Gün ve Saat Analizi' },
  { no: 28, title: 'Dönüşümler / Key Events' },
  { no: 29, title: 'E-Ticaret Performansı' },
  { no: 30, title: 'İç Arama Verileri' },
  { no: 31, title: 'Domain Overview' },
  { no: 32, title: 'Organik Trafik / Keyword Tarihçesi' },
  { no: 33, title: 'Rakip Analizi' },
  { no: 34, title: 'Keyword Gap' },
  { no: 35, title: 'Backlink Overview' },
  { no: 36, title: 'Yeni / Kaybedilen Referans Domainler' },
  { no: 37, title: 'Anchor Text Analizi' },
  { no: 38, title: 'Backlink Fırsatları' },
  { no: 39, title: 'Teknik SEO Sağlığı' },
  { no: 40, title: 'Teknik SEO Sorunları' },
  { no: 41, title: 'Sorunlu URL Listesi' },
  { no: 42, title: 'PageSpeed / Core Web Vitals' },
  { no: 43, title: 'SEO Fırsatları' },
  { no: 44, title: 'AI Arama Görünürlüğü' },
  { no: 45, title: 'AI Platform Kırılımı' },
  { no: 46, title: 'AI Rakip Karşılaştırması' },
  { no: 47, title: 'AI Arama Niyeti' },
  { no: 48, title: 'Beyin Atölyesi Analizi' },
  { no: 49, title: 'Önceliklendirilmiş Aksiyon Planı' },
  { no: 50, title: 'Yönetici Özeti' },
];

export const ALL_SECTION_NOS = GENERAL_REPORT_SECTIONS.map((section) => section.no);

export const STORAGE_KEY = 'general-report-visible-sections';

export function defaultVisibleSet() {
  return new Set(ALL_SECTION_NOS);
}

/** localStorage'dan okur; bozuk/eksik kayıtta tüm bölümler açık döner. */
export function loadVisibleSections() {
  if (typeof window === 'undefined') return defaultVisibleSet();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultVisibleSet();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultVisibleSet();
    const valid = parsed.map(Number).filter((no) => ALL_SECTION_NOS.includes(no));
    return valid.length > 0 ? new Set(valid) : defaultVisibleSet();
  } catch {
    return defaultVisibleSet();
  }
}

export function saveVisibleSections(visible) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...visible].sort((a, b) => a - b)));
}
