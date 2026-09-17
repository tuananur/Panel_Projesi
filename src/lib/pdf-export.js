// Ekrandaki bir elemanı uzun PDF sayfası olarak kaydeder (A4'e bölmez).
// Yalnızca tarayıcıda çalışır; html2canvas ve jspdf tıklama anında dinamik yüklenir.

export const PDF_BG = '#0f172a';

// PDF spesifikasyonu bir sayfayı en fazla 14400 user unit (200 inç) yapabilir; jsPDF de
// bunu aşan formatı sessizce 14400'e kırpar ve taşan içerik sayfa dışında kalır.
// px birimi 0.75 unit'e karşılık geldiği için sayfa başına üst sınır 19200 canvas pikselidir.
const MAX_PAGE_PX = 19200;
// Yuvarlama farklarında kırpmaya düşmemek için küçük bir pay bırakılır.
const SAFE_PAGE_PX = MAX_PAGE_PX - 200;

/**
 * Kesme noktalarını hesaplar: her sayfa mümkün olan en fazla tam bölümü alır,
 * böylece bir kartın ortasından geçilmez. Tek bir bölüm sayfa sınırından uzunsa
 * (nadiren) o bölüm sınırda kesilir.
 *
 * @param totalPx   canvas yüksekliği (canvas pikseli)
 * @param breakPx   bölüm başlangıçlarının canvas pikseli cinsinden konumları (artan)
 */
export function computePageBreaks(totalPx, breakPx = []) {
  if (totalPx <= SAFE_PAGE_PX) return [{ start: 0, height: totalPx }];

  const candidates = breakPx
    .map((value) => Math.round(value))
    .filter((value) => value > 0 && value < totalPx)
    .sort((a, b) => a - b);

  const pages = [];
  let start = 0;

  while (start < totalPx) {
    const remaining = totalPx - start;
    if (remaining <= SAFE_PAGE_PX) {
      pages.push({ start, height: remaining });
      break;
    }

    const limit = start + SAFE_PAGE_PX;
    // Sınırı geçmeyen en son bölüm başlangıcı; bulunamazsa ham sınırdan kes.
    let end = 0;
    for (const candidate of candidates) {
      if (candidate > start && candidate <= limit) end = candidate;
      if (candidate > limit) break;
    }
    if (end === 0) end = limit;

    pages.push({ start, height: end - start });
    start = end;
  }

  return pages;
}

/**
 * @param el              PDF'e dönüştürülecek kök eleman
 * @param fileName        indirilecek dosya adı
 * @param onClone         klon DOM üzerinde son rötuşlar
 * @param sectionSelector sayfa kesmelerinin hizalanacağı bölüm elemanları
 *
 * Klon üzerinde otomatik uygulananlar:
 *   [data-pdf-hide]   → tamamen kaldırılır (butonlar, filtre çubukları gibi)
 *   [data-pdf-expand] → yatay kaydırma açılır, tablolar kırpılmaz
 *
 * Not: içerik tek sayfaya sığıyorsa tek uzun sayfa üretilir. Sığmıyorsa PDF sayfa
 * limiti nedeniyle bölüm sınırlarından birden fazla uzun sayfaya bölünür; yazı
 * boyutu her sayfada birebir korunur.
 */
export async function saveElementAsLongPdf(el, fileName, { onClone, sectionSelector = '[data-pdf-break]' } = {}) {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const prevWidth = el.style.width;
  const prevMaxWidth = el.style.maxWidth;
  el.style.width = `${el.scrollWidth}px`;
  el.style.maxWidth = `${el.scrollWidth}px`;

  const w = el.scrollWidth;
  const h = el.scrollHeight;
  const scale = Math.min(2, Math.max(1, 8192 / Math.max(w, h)));

  // Bölüm başlangıçları CSS pikseli olarak, kökün üstüne göre ölçülür.
  const rootTop = el.getBoundingClientRect().top;
  const sectionOffsets = sectionSelector
    ? [...el.querySelectorAll(sectionSelector)].map((node) => node.getBoundingClientRect().top - rootTop)
    : [];

  try {
    const canvas = await html2canvas(el, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: PDF_BG,
      logging: false,
      width: w,
      height: h,
      scrollX: 0,
      scrollY: 0,
      windowWidth: w,
      windowHeight: h,
      onclone: (doc, clonedEl) => {
        doc.querySelectorAll('[data-pdf-hide]').forEach((n) => n.remove());
        doc.querySelectorAll('.tooltip-content').forEach((n) => n.remove());
        doc.querySelectorAll('[data-pdf-expand]').forEach((n) => {
          n.style.overflow = 'visible';
          n.style.maxWidth = 'none';
        });
        onClone?.(doc, clonedEl);
      },
    });

    // CSS pikselinden canvas pikseline gerçek oran (html2canvas ölçeği yuvarlayabilir).
    const pxRatio = canvas.height / h;
    const pages = computePageBreaks(canvas.height, sectionOffsets.map((offset) => offset * pxRatio));

    const pdf = new jsPDF({
      unit: 'px',
      format: [canvas.width, pages[0].height],
      hotfixes: ['px_scaling'],
      compress: true,
    });

    const slice = document.createElement('canvas');
    const ctx = slice.getContext('2d');

    pages.forEach((page, index) => {
      slice.width = canvas.width;
      slice.height = page.height;
      ctx.fillStyle = PDF_BG;
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, page.start, canvas.width, page.height, 0, 0, canvas.width, page.height);

      if (index > 0) pdf.addPage([canvas.width, page.height]);
      pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, canvas.width, page.height, undefined, 'FAST');
    });

    // Dilim canvası serbest bırakılır: uzun raporlarda yüzlerce MB tutabilir.
    slice.width = 0;
    slice.height = 0;

    pdf.save(fileName);
    return { pageCount: pages.length };
  } finally {
    el.style.width = prevWidth;
    el.style.maxWidth = prevMaxWidth;
  }
}
