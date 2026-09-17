/** Genel rapor bölüm açıklamaları — başlık altındaki not metinleri. */

export const SECTION_NOTES = {
  1: `Bu kart, seçilen dönemin ana performans özetini tek bakışta gösterir. Yeşil/kırmızı oklar bir önceki aynı uzunluktaki döneme göre değişimdir.

Kullanıcı (Users) = siteye giren yaklaşık benzersiz kişi sayısı
Oturum (Sessions) = site ziyaretlerinin toplam sayısı
Sayfa görüntüleme (Pageviews) = açılan sayfaların toplamı
Organik tıklama = Google arama sonuçlarından siteye gelen gerçek tıklamalar (Search Console)
Gösterim (Impressions) = sorgunuzun Google’da kaç kez göründüğü
CTR (Click-Through Rate / tıklama oranı) = tıklama ÷ gösterim
Ort. pozisyon = Google’da ortalama sıralama (düşük daha iyi)
Organik keyword / tahmini trafik / DA / backlink / site sağlığı = Ubersuggest araç tahminleri (gerçek ziyaretçi sayısı değildir)`,

  2: `Bu kart, seçilen dönemi aynı uzunluktaki önceki dönemle karşılaştırır. Yeşil iyileşme, kırmızı gerilemedir.

Aktif kullanıcı = benzersiz ziyaretçi değişimi
Oturum = ziyaret sayısı değişimi
Organik tıklama / gösterim / CTR / pozisyon = Search Console metriklerinin dönemler arası farkı`,

  3: `Bu kart, dönemde gün gün trafik hareketini gösterir. Çizgilere mouse ile geldiğinizde o günün değerleri çıkar.

Aktif kullanıcı = o gündeki benzersiz ziyaretçi
Oturum = o gündeki ziyaret sayısı
Sayfa görüntüleme = o günde açılan sayfa adedi
Hemen çıkma oranı (Bounce Rate) = tek sayfa bakıp çıkan oturumların oranı (yüksek genelde kötü)`,

  4: `Bu kart, trafiğin hangi kanallardan geldiğini gösterir. Kanal grubu GA4 sınıflandırmasıdır; kaynak adı ise ham referrer’dır.

Oturum = o kanaldan gelen ziyaret sayısı
Kullanıcı = o kanaldan gelen benzersiz kişi
Örnek: Organik arama = Google/Bing gibi arama motorlarından gelen trafik`,

  5: `Bu kart yalnızca GA4’teki “Organik arama” kanalını özetler. Search Console tıklamalarıyla aynı sayı değildir; farklı ölçüm yöntemleridir.

Organik kullanıcı / oturum = arama motorundan gelen trafik
Organik oturum/kullanıcı payı = tüm trafiğin yüzde kaçı organik
Etkileşim oranı (Engagement Rate) = anlamlı etkileşim gösteren oturumların oranı`,

  6: `Bu kart, Google arama sonuçlarındaki gerçek performansı özetler (Search Console).

Tıklama = sonuçlardan siteye gelen tıklama
Gösterim = sonucunuzun kaç kez listelendiği
CTR (tıklama oranı) = tıklama ÷ gösterim
Ortalama pozisyon = ortalama sıralama (1 = en üst)
Toplam sorgu = ölçülen farklı arama ifadesi sayısı`,

  7: `Bu kart, Search Console metriklerinin gün gün kırılımını gösterir. Hover ile günlük değerleri görebilirsiniz.

Tıklama / gösterim / CTR / pozisyon = her gün için aynı tanımlar (bkz. bölüm 6)`,

  8: `Bu kart, Google’da siteye trafik getiren arama sorgularını listeler. Önce pozisyon değişimi olanlar, sonda değişim 0 olanlar gelir.

Sorgu = kullanıcının yazdığı arama ifadesi
Tıklama / gösterim / CTR = o sorgu için gerçek Google metrikleri
Pozisyon = ortalama sıralama; Önceki = önceki dönem pozisyonu
Değişim = pozisyon farkı (pozitif = yukarı çıkış, daha iyi)
Sıralanan URL = Google’ın o sorgu için gösterdiği sayfa`,

  9: `Bu kart, Ubersuggest’in ölçtüğü anahtar kelime performansını gösterir. Pozisyon GSC ortalamasından farklı olabilir.

Keyword (anahtar kelime) = takip/ölçülen arama ifadesi
Pozisyon = araç ölçümü sıralama
Hacim (Search Volume) = aylık tahmini arama sayısı
SD (SEO Difficulty / SEO zorluğu) = sıralama zorluk skoru
CPC (Cost Per Click / tıklama maliyeti) = reklamda ortalama tıklama ücreti
Niyet = bilgisel / ticari / yönlendirme / satın alma
Tahmini trafik = araç tahminidir, gerçek GA4 trafiği değildir`,

  10: `Bu kart, Ubersuggest rank tracker ile takip edilen kelimelerin güncel durumunu gösterir.

Takip edilen kelime = düzenli ölçülen anahtar kelime
Yeni / eski pozisyon = son iki ölçüm
Pozisyonu boş olan kelime genelde ilk 100’de değildir`,

  11: `Bu kart, dönemde sıralaması en çok yükselen anahtar kelimeleri gösterir (yukarı çıkış = iyileşme).

Değişim = pozisyon farkı; pozitif değer daha iyi sıralama demektir`,

  12: `Bu kart, dönemde sıralaması en çok düşen anahtar kelimeleri gösterir (aşağı iniş = gerileme).

Değişim = pozisyon farkı; negatif değer sıralama kaybı demektir`,

  13: `Bu kart, sıralanmaya yakın veya fırsat potansiyeli taşıyan kelimeleri listeler (Ubersuggest / GSC birleşik sinyal).

Fırsat = hacmi olan ama henüz güçlü sıralanmayan veya iyileştirilebilir kelimeler`,

  14: `Bu kart, Google’da ilk 10’da olup CTR’ı site ortalamasının altında kalan sorguları gösterir. Ölçüt sabit sektör ortalaması değil, sitenizin kendi gerçek CTR ortalamasıdır.

CTR (tıklama oranı) düşükse başlık/meta açıklama iyileştirmesi genelde ilk aksiyondur`,

  15: `Bu kart, organik aramadan gelen kullanıcıların ilk indiği sayfaları (landing page) gösterir.

Landing page = oturumun başladığı URL
Kullanıcı / oturum / görüntüleme = o iniş sayfasındaki GA4 metrikleri`,

  16: `Bu kart, Ubersuggest’e göre en çok organik trafik tahmini üreten sayfaları listeler.

Tahmini trafik = araç modeli; gerçek ziyaret sayısı GA4’te doğrulanmalıdır`,

  17: `Bu kart, dönemde en çok ziyaret edilen sayfaları GA4 verisiyle gösterir.

Yol (path) = sayfa adresi
Görüntüleme / kullanıcı / ortalama süre = o sayfanın popülerliği ve etkileşimi`,

  18: `Bu kart, görüntüleme veya tıklaması artan (kazanan) ve azalan (kaybeden) sayfaları karşılaştırır.

Kazanan = önceki döneme göre yükselen sayfalar
Kaybeden = önceki döneme göre düşen sayfalar`,

  19: `Bu kart, ilk kez gelen (yeni) ile daha önce gelmiş (geri dönen) kullanıcıları ayırır.

Yeni kullanıcı = ilk ziyaret
Geri dönen = tekrar ziyaret edenler
Retention sinyali için kritik dengedir`,

  20: `Bu kart, kullanıcıların ne kadar süre sonra geri döndüğüne dair cohort / retention özetidir (GA4).

Cohort = aynı dönemde kazanılan kullanıcı grubu
Retention = grubun sonraki günlerde geri gelme oranı`,

  21: `Bu kart, trafiğin masaüstü / mobil / tablet kırılımını gösterir.

Oturum ve kullanıcı payı cihaz deneyimini ve mobil önceliği değerlendirmek için kullanılır`,

  22: `Bu kart, GA4’e göre site trafiğinin ülke dağılımını gösterir.

Ülke = ziyaretçinin coğrafyası; pay = toplam aktif kullanıcıya oran`,

  23: `Bu kart, Search Console’daki ülke bazlı Google arama performansını gösterir.

Tıklama / gösterim / CTR / pozisyon = o ülkedeki Google sonuç performansı`,

  24: `Bu kart, GA4 şehir kırılımını gösterir (mümkün olan ölçümde).

Şehir = ziyaretçi konumu; oturum / kullanıcı = o şehirden gelen trafik`,

  25: `Bu kart, ziyaretçilerin kullandığı tarayıcı dağılımını gösterir.

Tarayıcı uyumluluğu ve teknik hata önceliği için kullanılır`,

  26: `Bu kart, GA4 demografik (yaş / cinsiyet) sinyallerini gösterir. Veri, Google sinyalleri açık hesaplarda gelir; her sitede olmayabilir.

Yaş aralığı / cinsiyet = tahmini demografik kırılım`,

  27: `Bu kart, haftanın günü ve saate göre trafik yoğunluğunu gösterir.

Isı haritası / şerit: koyu veya yüksek değer = daha yoğun trafik saati`,

  28: `Bu kart, GA4’teki dönüşüm / key event (önemli olay) sayılarını listeler.

Key event = iş için kritik olay (form, satın alma, lead vb.)
Event adı İngilizce gelse bile Türkçe karşılığıyla gösterilir (ör. begin_checkout → ödemeye başlama)`,

  29: `Bu kart, e-ticaret hunisi ve gelir sinyallerini özetler (GA4 e-ticaret etkinlikleri).

view_item_list = ürün listesi görüntüleme
view_item = ürün görüntüleme
add_to_cart = sepete ekleme
begin_checkout = ödemeye başlama
purchase = satın alma
Gelir = purchase ile ilişkili ciro`,

  30: `Bu kart, sitedeki dahili arama kutusunda kullanıcıların ne aradığını gösterir.

İç arama terimi = ziyaretçinin sitede yazdığı kelime; içerik boşluğu sinyali olabilir`,

  31: `Bu kart, domain’in Ubersuggest genel SEO özetidir (araç tahmini).

Organik keyword = sıralandığı tahmin edilen kelime sayısı
Tahmini organik trafik = araç modeli
DA (Domain Authority / alan otoritesi) = 0–100 otorite skoru
Backlink = siteye gelen dış bağlantı sayısı
Referans domain = link veren benzersiz alan adı sayısı`,

  32: `Bu kart, aylık tahmini organik trafik ve keyword tarihçesini gösterir.

Ay = dönem; tahmini trafik / organik KW = zaman içindeki trend`,

  33: `Bu kart, ortak keyword ve tahmini trafik ile rakipleri karşılaştırır.

Ortak KW = hem sizin hem rakibin sıralandığı kelimeler
KW gap = rakipte olup sizde olmayan kelime sayısı
DA = rakibin alan otoritesi`,

  34: `Bu kart, Keyword Gap (anahtar kelime boşluğu) özetidir: rakip sıralıyor, siz sıralamıyorsunuz.

Sayı ne kadar yüksekse içerik/SEO fırsatı o kadar büyüktür. Kelime listesi bu payload’da yoksa yalnızca sayılar gösterilir`,

  35: `Bu kart, backlink profilinin genel görünümüdür.

Follow = SEO değeri geçen link
Nofollow = SEO değeri geçmeyen link
DR (Domain Rank / alan puanı) = link veren domain’in güç skoru
Anchor (çapa metni) = linkte görünen yazı`,

  36: `Bu kart, yeni keşfedilen ve kaybedilen referans domainleri gösterir.

Yeni = yeni link veren domain
Kaybedilen = artık link vermeyen domain`,

  37: `Bu kart, backlink’lerde kullanılan çapa (anchor) metin dağılımını gösterir.

Aşırı marka dışı / aşırı keyword anchor oranı spam riski işaret edebilir`,

  38: `Bu kart, rakibe link verip size vermeyen siteleri (backlink fırsatları) listeler.

Outreach (ulaşım) için aday domain havuzudur`,

  39: `Bu kart, teknik SEO tarama sağlığını özetler (Ubersuggest audit).

Site sağlık puanı = 0–100 teknik skor
Başarılı / yönlendirilen / kırık / engellenen sayfalar = tarama sınıfları
Toplam sorun = tespit edilen teknik issue adedi`,

  40: `Bu kart, teknik SEO sorunlarını etki ve zorluğa göre listeler.

Sorun kodu / kategori İngilizce gelse bile Türkçe gösterilir
Etki (Impact) = SEO’ya zarar seviyesi
Zorluk = düzeltme eforu`,

  41: `Bu kart, teknik sorunlara bağlı URL listesini sayfalar. Tüm kayıtlar gezilebilir.

HTTP = sunucu yanıt kodu (ör. 404 = bulunamadı)
Durum = sorunun açık/kapalı hali
Öneri = araçtan gelen düzeltme tavsiyesi`,

  42: `Bu kart, PageSpeed / Core Web Vitals (temel web vitals) ölçümlerini cihaz bazında gösterir.

LCP (Largest Contentful Paint) = ana içeriğin yüklenme süresi
INP (Interaction to Next Paint) = etkileşim gecikmesi
CLS (Cumulative Layout Shift) = düzen kayması
FCP (First Contentful Paint) = ilk içerik boyaması
TTFB (Time to First Byte) = ilk bayt süresi
CWV = bu metriklerin genel durumu`,

  43: `Bu kart, Ubersuggest SEO fırsatlarını türüne göre gösterir.

KEYWORD_OPPORTUNITY gibi tür kodları Türkçe’ye çevrilir (anahtar kelime fırsatı vb.)
Hacim / pozisyon / zorluk = fırsatın büyüklüğü ve uygulanabilirliği`,

  44: `Bu kart, AI arama motorlarındaki görünürlük özetidir (ChatGPT, Perplexity vb. sinyaller).

Ses payı (Share of Voice) = AI cevaplarında markanızın göreli görünürlüğü
Bahsedilme / ortalama sıra = AI cevaplarındaki yeriniz`,

  45: `Bu kart, AI görünürlüğünü platform bazında kırar.

Görünürlük % = o platformdaki ses payı benzeri skor
Değişim = önceki ölçüme göre fark`,

  46: `Bu kart, AI aramada rakiplerinizle görünürlük karşılaştırmasıdır.

Rakip görünürlüğü sizden yüksekse içerik/AI SEO fırsatı vardır`,

  47: `Bu kart, AI arama niyet dağılımını gösterir.

Bilgi amaçlı / ticari / yönlendirme / satın alma = kullanıcı niyeti sınıfları`,

  48: `Bu kart, yukarıdaki gerçek ölçümlerden üretilen Beyin Atölyesi yorumudur: ne oldu, neden önemli, ne yapılmalı.`,

  49: `Bu kart, ölçülen etkiye göre önceliklendirilmiş aksiyon listesidir. Yüksek = önce yapılmalı.`,

  50: `Bu kart, dönemin yönetici özetidir: iyi gidenler, kötü gidenler, fırsatlar ve gelecek dönem işleri.`,
};
