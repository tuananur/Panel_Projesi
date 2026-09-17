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
  { no: 9, title: 'SEO Anahtar Kelime Performansı' },
  { no: 10, title: 'Takip Edilen Anahtar Kelimeler' },
  { no: 11, title: 'En Çok Yükselen Anahtar Kelimeler' },
  { no: 12, title: 'En Çok Düşen Anahtar Kelimeler' },
  { no: 13, title: 'SEO Fırsat Anahtar Kelimeleri' },
  { no: 14, title: 'CTR (tıklama oranı) Fırsatları' },
  { no: 15, title: 'Organik İniş Sayfaları' },
  { no: 16, title: 'En İyi SEO Sayfaları' },
  { no: 17, title: 'En Çok Ziyaret Edilen Sayfalar' },
  { no: 18, title: 'Kazanan / Kaybeden Sayfalar' },
  { no: 19, title: 'Yeni vs Geri Dönen Kullanıcılar' },
  { no: 20, title: 'Elde Tutma / Cohort' },
  { no: 21, title: 'Cihaz Dağılımı' },
  { no: 22, title: 'Ülke Dağılımı' },
  { no: 23, title: 'Search Console Ülke Performansı' },
  { no: 24, title: 'Şehir Dağılımı' },
  { no: 25, title: 'Tarayıcı Dağılımı' },
  { no: 26, title: 'Yaş / Cinsiyet' },
  { no: 27, title: 'Gün ve Saat Analizi' },
  { no: 28, title: 'Dönüşümler / Önemli Olaylar' },
  { no: 29, title: 'E-Ticaret Performansı' },
  { no: 30, title: 'İç Arama Verileri' },
  { no: 31, title: 'Domain Genel Bakış' },
  { no: 32, title: 'Organik Trafik / Anahtar Kelime Tarihçesi' },
  { no: 33, title: 'Rakip Analizi' },
  { no: 34, title: 'Kelime Boşluğu (Keyword Gap)' },
  { no: 35, title: 'Geri Bağlantı Özeti' },
  { no: 36, title: 'Yeni / Kaybedilen Referans Domainler' },
  { no: 37, title: 'Çapa Metni (Anchor) Analizi' },
  { no: 38, title: 'Geri Bağlantı Fırsatları' },
  { no: 39, title: 'Teknik SEO Sağlığı' },
  { no: 40, title: 'Teknik SEO Sorunları' },
  { no: 41, title: 'Sorunlu URL Listesi' },
  { no: 42, title: 'Sayfa Hızı / Temel Web Vitals' },
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
export const CHARTS_ONLY_KEY = 'general-report-charts-only';

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

export function loadChartsOnly() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(CHARTS_ONLY_KEY) === '1';
}

export function saveChartsOnly(value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CHARTS_ONLY_KEY, value ? '1' : '0');
}
