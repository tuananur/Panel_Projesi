// Ekrandaki bir elemanı uzun PDF sayfası olarak kaydeder (A4'e bölmez).
// Yalnızca tarayıcıda çalışır; html2canvas ve jspdf tıklama anında dinamik yüklenir.

export const PDF_BG = '#ffffff';

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
/** PDF klonunda tema değişkenlerini zorla aydınlık yapar (ekran teması ne olursa olsun). */
function forceLightThemeForPdf(root) {
  if (!root) return;
  const light = {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#ffffff',
    '--bg-tertiary': '#f8fafc',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--border-color': '#e2e8f0',
    '--scrollbar-track': '#f1f5f9',
    '--scrollbar-thumb': '#94a3b8',
    '--scrollbar-thumb-hover': '#64748b',
  };
  Object.entries(light).forEach(([key, value]) => root.style.setProperty(key, value));
  root.style.background = '#ffffff';
  root.style.color = '#0f172a';
  root.querySelectorAll('.card, [class*="card"]').forEach((node) => {
    node.style.background = '#ffffff';
    node.style.color = '#0f172a';
    node.style.borderColor = '#e2e8f0';
  });
}

export async function saveElementAsLongPdf(el, fileName, { onClone, sectionSelector = '[data-pdf-break]' } = {}) {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const prevOverflow = el.style.overflow;
  const prevWidth = el.style.width;
  const prevMaxWidth = el.style.maxWidth;
  // scrollWidth tooltip/taşma ile şişerse PDF boş/devasa beyaz sayfa olur — görünür genişliği kullan.
  el.style.overflow = 'hidden';
  const w = Math.max(el.clientWidth || 0, Math.min(el.scrollWidth || 0, 1600)) || el.offsetWidth || 1200;
  const h = el.scrollHeight;
  el.style.width = `${w}px`;
  el.style.maxWidth = `${w}px`;

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
      scrollY: -window.scrollY,
      windowWidth: w,
      windowHeight: h,
      onclone: (doc, clonedEl) => {
        doc.querySelectorAll('[data-pdf-hide]').forEach((n) => n.remove());
        doc.querySelectorAll('.tooltip-content, [id*="tooltip"], [id*="Tooltip"]').forEach((n) => n.remove());
        doc.querySelectorAll('[data-pdf-expand]').forEach((n) => {
          n.style.overflow = 'visible';
          n.style.maxWidth = 'none';
        });
        clonedEl.style.overflow = 'hidden';
        clonedEl.style.width = `${w}px`;
        clonedEl.style.maxWidth = `${w}px`;
        clonedEl.style.background = PDF_BG;
        clonedEl.style.color = '#0f172a';
        // Klonlanan DOM'da gizli (display:none) bölümler zaten yok sayılır; renkleri zorla aydınlık yap.
        forceLightThemeForPdf(clonedEl);
        clonedEl.querySelectorAll('*').forEach((node) => {
          if (!(node instanceof doc.defaultView.HTMLElement)) return;
          const style = doc.defaultView.getComputedStyle(node);
          // html2canvas oklch/lab renkleri boş çizebiliyor — computed RGB'ye sabitle.
          if (style.color) node.style.color = style.color;
          if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            node.style.backgroundColor = style.backgroundColor;
          }
        });
        onClone?.(doc, clonedEl);
      },
    });

    // CSS pikselinden canvas pikseline gerçek oran (html2canvas ölçeği yuvarlayabilir).
    const pxRatio = canvas.height / Math.max(h, 1);
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
    el.style.overflow = prevOverflow;
  }
}
