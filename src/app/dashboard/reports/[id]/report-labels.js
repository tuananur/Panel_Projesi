/**
 * Genel rapor: İngilizce API/kod değerlerini Türkçe gösterir.
 * Bilinmeyen SNAKE_CASE / camelCase değerler okunabilir Türkçe başlığa çevrilir.
 */

const EXACT = {
  // GA4 kanallar
  'organic search': 'Organik arama',
  'paid search': 'Ücretli arama',
  'paid social': 'Ücretli sosyal',
  'organic social': 'Organik sosyal',
  'organic shopping': 'Organik alışveriş',
  'paid shopping': 'Ücretli alışveriş',
  'paid other': 'Diğer ücretli',
  'cross-network': 'Çapraz ağ',
  'display': 'Görüntülü reklam',
  'direct': 'Doğrudan',
  'referral': 'Yönlendirme',
  'email': 'E-posta',
  'affiliates': 'Ortaklık',
  'audio': 'Ses',
  'sms': 'SMS',
  'mobile push notifications': 'Mobil bildirim',
  'unassigned': 'Atanmamış',
  '(not set)': '(belirtilmemiş)',
  '(other)': '(diğer)',
  'not set': 'Belirtilmemiş',

  // Cihaz / ziyaretçi
  desktop: 'Masaüstü',
  mobile: 'Mobil',
  tablet: 'Tablet',
  new: 'Yeni',
  returning: 'Geri dönen',
  male: 'Erkek',
  female: 'Kadın',
  unknown: 'Bilinmiyor',

  // Arama niyeti
  informational: 'Bilgi amaçlı',
  commercial: 'Ticari',
  navigational: 'Yönlendirme',
  transactional: 'Satın alma',

  // Backlink
  follow: 'Follow (takip et — SEO değeri geçer)',
  nofollow: 'Nofollow (takip etme — SEO değeri geçmez)',
  dofollow: 'Dofollow (takip et)',
  ugc: 'UGC (kullanıcı içeriği)',
  sponsored: 'Sponsored (sponsorlu)',

  // Audit
  error: 'Hata',
  warning: 'Uyarı',
  recommendation: 'Öneri',
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
  critical: 'Kritik',
  open: 'Açık',
  closed: 'Kapalı',
  fixed: 'Düzeltildi',
  ignored: 'Yok sayıldı',

  // Fırsat türleri
  keyword_opportunity: 'Anahtar kelime fırsatı',
  new_content: 'Yeni içerik',
  existing_content: 'Mevcut içerik',
  quick_win: 'Hızlı kazanım',
  content_gap: 'İçerik boşluğu',
  low_hanging_fruit: 'Kolay kazanım',
  missing_keyword: 'Eksik anahtar kelime',
  opportunity: 'Fırsat',

  // AI / SEO terimleri
  'share of voice': 'Ses payı (Share of Voice)',
  share_of_voice: 'Ses payı (Share of Voice)',
  domain_authority: 'Alan otoritesi (DA)',
  domain_rating: 'Alan puanı (DR)',
  site_health: 'Site sağlığı',

  // GA4 e-ticaret / key events
  page_view: 'Sayfa görüntüleme',
  page_viewed: 'Sayfa görüntüleme',
  session_start: 'Oturum başlangıcı',
  first_visit: 'İlk ziyaret',
  user_engagement: 'Kullanıcı etkileşimi',
  scroll: 'Kaydırma',
  click: 'Tıklama',
  view_search_results: 'Arama sonuçlarını görme',
  view_item: 'Ürün görüntüleme',
  view_item_list: 'Ürün listesi görüntüleme',
  select_item: 'Ürün seçme',
  view_promotion: 'Promosyon görüntüleme',
  select_promotion: 'Promosyon seçme',
  add_to_cart: 'Sepete ekleme',
  remove_from_cart: 'Sepetten çıkarma',
  view_cart: 'Sepeti görüntüleme',
  begin_checkout: 'Ödemeye başlama',
  add_shipping_info: 'Kargo bilgisi ekleme',
  add_payment_info: 'Ödeme bilgisi ekleme',
  purchase: 'Satın alma',
  refund: 'İade',
  generate_lead: 'Potansiyel müşteri',
  sign_up: 'Kayıt olma',
  login: 'Giriş',
  search: 'Arama',
  share: 'Paylaşım',
  file_download: 'Dosya indirme',
  video_start: 'Video başlangıcı',
  video_progress: 'Video ilerlemesi',
  video_complete: 'Video tamamlanma',
  form_start: 'Form başlangıcı',
  form_submit: 'Form gönderimi',
  contact: 'İletişim',

  // CWV durum
  good: 'İyi',
  'needs improvement': 'İyileştirilmeli',
  poor: 'Zayıf',
  pass: 'Geçti',
  fail: 'Kaldı',
};

const WORD = {
  keyword: 'anahtar kelime',
  keywords: 'anahtar kelimeler',
  opportunity: 'fırsat',
  opportunities: 'fırsatlar',
  content: 'içerik',
  new: 'yeni',
  existing: 'mevcut',
  quick: 'hızlı',
  win: 'kazanım',
  gap: 'boşluk',
  share: 'pay',
  voice: 'ses',
  domain: 'alan',
  authority: 'otorite',
  rating: 'puan',
  health: 'sağlık',
  site: 'site',
  page: 'sayfa',
  view: 'görüntüleme',
  views: 'görüntülemeler',
  item: 'ürün',
  list: 'liste',
  cart: 'sepet',
  checkout: 'ödeme',
  begin: 'başlama',
  purchase: 'satın alma',
  add: 'ekleme',
  remove: 'çıkarma',
  shipping: 'kargo',
  payment: 'ödeme',
  info: 'bilgi',
  search: 'arama',
  organic: 'organik',
  paid: 'ücretli',
  traffic: 'trafik',
  backlink: 'geri bağlantı',
  backlinks: 'geri bağlantılar',
  referring: 'referans',
  anchor: 'çapa metni',
  follow: 'follow',
  nofollow: 'nofollow',
  status: 'durum',
  error: 'hata',
  warning: 'uyarı',
  recommendation: 'öneri',
  impact: 'etki',
  difficulty: 'zorluk',
  high: 'yüksek',
  medium: 'orta',
  low: 'düşük',
  critical: 'kritik',
  desktop: 'masaüstü',
  mobile: 'mobil',
  tablet: 'tablet',
  session: 'oturum',
  sessions: 'oturumlar',
  user: 'kullanıcı',
  users: 'kullanıcılar',
  engagement: 'etkileşim',
  bounce: 'hemen çıkma',
  rate: 'oran',
  click: 'tıklama',
  clicks: 'tıklamalar',
  impression: 'gösterim',
  impressions: 'gösterimler',
  position: 'pozisyon',
  average: 'ortalama',
  estimated: 'tahmini',
  competitor: 'rakip',
  common: 'ortak',
  missing: 'eksik',
  hanging: 'kolay',
  fruit: 'kazanım',
  promotion: 'promosyon',
  select: 'seçme',
  generate: 'oluşturma',
  lead: 'potansiyel müşteri',
  sign: 'kayıt',
  up: 'olma',
  login: 'giriş',
  file: 'dosya',
  download: 'indirme',
  video: 'video',
  start: 'başlangıç',
  progress: 'ilerleme',
  complete: 'tamamlanma',
  form: 'form',
  submit: 'gönderim',
  contact: 'iletişim',
  scroll: 'kaydırma',
  first: 'ilk',
  visit: 'ziyaret',
  refund: 'iade',
  of: '',
  to: '',
  from: '',
  the: '',
  and: 've',
  or: 'veya',
};

function normalizeKey(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function humanizeFallback(value) {
  const raw = String(value).trim();
  if (!raw) return raw;

  // KEYWORD_OPPORTUNITY / view_item_list / beginCheckout
  const parts = raw
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-.]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const translated = parts.map((part) => {
    const key = part.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(WORD, key)) return WORD[key];
    return part;
  }).filter(Boolean);

  const joined = translated.join(' ').replace(/\s+/g, ' ').trim();
  if (!joined) return raw;
  return joined.charAt(0).toLocaleUpperCase('tr-TR') + joined.slice(1);
}

/**
 * Ham İngilizce / kod değeri → Türkçe etiket.
 * URL, sayı, tarih ve zaten Türkçe metinlere dokunmaz.
 */
export function trLabel(value) {
  if (value === null || value === undefined || value === '') return value;
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  // URL / path / email / sayısal → dokunma
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/') || trimmed.includes('@')) return trimmed;
  if (/^\d+([.,]\d+)?%?$/.test(trimmed)) return trimmed;

  const key = normalizeKey(trimmed);
  if (EXACT[key]) return EXACT[key];
  if (EXACT[trimmed.toLowerCase()]) return EXACT[trimmed.toLowerCase()];

  // Çoğunlukla İngilizce kod: snake/camel/SCREAMING
  if (/[_-]/.test(trimmed) || /[a-z][A-Z]/.test(trimmed) || /^[A-Z][A-Z0-9_]+$/.test(trimmed)) {
    return humanizeFallback(trimmed);
  }

  // Kısa İngilizce kelime eşleşmesi
  if (EXACT[trimmed.toLowerCase()]) return EXACT[trimmed.toLowerCase()];

  return trimmed;
}

/** Kısaltma / metrik başlıkları — sütun ve KPI etiketleri için. */
export const METRIC = {
  users: 'Kullanıcı (Users)',
  sessions: 'Oturum (Sessions)',
  views: 'Görüntüleme (Views)',
  pageViews: 'Sayfa görüntüleme (Pageviews)',
  ctr: 'CTR (tıklama oranı)',
  cpc: 'CPC (tıklama maliyeti)',
  da: 'DA (alan otoritesi)',
  dr: 'DR (alan puanı)',
  sd: 'SD (SEO zorluğu)',
  kw: 'KW (anahtar kelime)',
  lcp: 'LCP (en büyük içerik boyaması)',
  inp: 'INP (etkileşim gecikmesi)',
  cls: 'CLS (düzen kayması)',
  fcp: 'FCP (ilk içerik boyaması)',
  ttfb: 'TTFB (ilk bayt süresi)',
  cwv: 'CWV (temel web vitals)',
  sov: 'Ses payı (Share of Voice)',
  engagement: 'Etkileşim oranı',
  bounce: 'Hemen çıkma oranı',
};
