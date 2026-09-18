// Ekrandaki bir elemanı uzun PDF sayfası olarak kaydeder (A4'e bölmez).
// Yalnızca tarayıcıda çalışır; html2canvas ve jspdf tıklama anında dinamik yüklenir.

export const PDF_BG = '#ffffff';

// PDF spesifikasyonu bir sayfayı en fazla 14400 user unit (200 inç) yapabilir; jsPDF de
// bunu aşan formatı sessizce 14400'e kırpar ve taşan içerik sayfa dışında kalır.
// px birimi 0.75 unit'e karşılık geldiği için sayfa başına üst sınır 19200 canvas pikselidir.
const MAX_PAGE_PX = 19200;
// Yuvarlama farklarında kırpmaya düşmemek için küçük bir pay bırakılır.
const SAFE_PAGE_PX = MAX_PAGE_PX - 200;

// Tarayıcı canvas kenar limiti genelde 32767–65535. Tek seferde tüm raporu çizmek
// bu limiti aşınca html2canvas boş (beyaz/koyu) canvas döndürür. Dilim yüksekliği
// bunun altında tutulur.
const MAX_CAPTURE_PX = 16000;

// Dosya boyutu: retina scale + yüksek JPEG kalitesi 30MB+ üretiyordu.
// ~5MB hedefi için dar yakalama + scale 1 + orta JPEG.
const PDF_WIDTH_CAP = 1000;
const PDF_SCALE = 1;
const JPEG_QUALITY = 0.68;

/**
 * Kesme noktalarını hesaplar: her dilim mümkün olan en fazla tam bölümü alır,
 * böylece bir kartın ortasından geçilmez. Tek bir bölüm sınırdan uzunsa
 * (nadiren) o bölüm sınırda kesilir.
 *
 * @param totalPx   toplam yükseklik (canvas veya CSS pikseli)
 * @param breakPx   bölüm başlangıçları (artan)
 * @param limitPx   dilim üst sınırı (varsayılan: PDF sayfa limiti)
 */
export function computePageBreaks(totalPx, breakPx = [], limitPx = SAFE_PAGE_PX) {
  if (totalPx <= 0) return [];
  if (totalPx <= limitPx) return [{ start: 0, height: totalPx }];

  const candidates = breakPx
    .map((value) => Math.round(value))
    .filter((value) => value > 0 && value < totalPx)
    .sort((a, b) => a - b);

  const pages = [];
  let start = 0;

  while (start < totalPx) {
    const remaining = totalPx - start;
    if (remaining <= limitPx) {
      pages.push({ start, height: remaining });
      break;
    }

    const limit = start + limitPx;
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

function prepareClone(doc, clonedEl, w, onClone) {
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
 * Uzun raporlar tarayıcı canvas limitini aşmasın diye bölüm sınırlarından
 * dilim dilim html2canvas ile alınır; her dilim ayrı uzun PDF sayfası olur.
 */
export async function saveElementAsLongPdf(el, fileName, { onClone, sectionSelector = '[data-pdf-break]' } = {}) {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const prevOverflow = el.style.overflow;
  const prevWidth = el.style.width;
  const prevMaxWidth = el.style.maxWidth;
  // scrollWidth tooltip/taşma ile şişerse ölçüm bozulur — görünür genişliği kullan, PDF için üst sınır.
  el.style.overflow = 'hidden';
  const rawW = Math.max(el.clientWidth || 0, Math.min(el.scrollWidth || 0, 1600)) || el.offsetWidth || 1200;
  const w = Math.min(rawW, PDF_WIDTH_CAP);
  el.style.width = `${w}px`;
  el.style.maxWidth = `${w}px`;

  const h = el.scrollHeight;
  const scale = Math.min(PDF_SCALE, MAX_CAPTURE_PX / Math.max(w, 1));
  const maxCssChunk = Math.max(1, Math.floor(MAX_CAPTURE_PX / scale));

  const rootTop = el.getBoundingClientRect().top;
  const sectionOffsets = sectionSelector
    ? [...el.querySelectorAll(sectionSelector)].map((node) => node.getBoundingClientRect().top - rootTop)
    : [];

  const chunks = computePageBreaks(h, sectionOffsets, maxCssChunk);

  try {
    const canvases = [];
    for (const chunk of chunks) {
      const canvas = await html2canvas(el, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: PDF_BG,
        logging: false,
        x: 0,
        y: chunk.start,
        width: w,
        height: chunk.height,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: w,
        windowHeight: Math.max(h, chunk.height),
        onclone: (doc, clonedEl) => prepareClone(doc, clonedEl, w, onClone),
      });
      canvases.push(canvas);
    }

    if (canvases.length === 0) {
      throw new Error('PDF için çizilecek içerik bulunamadı');
    }

    const pdf = new jsPDF({
      unit: 'px',
      format: [canvases[0].width, canvases[0].height],
      hotfixes: ['px_scaling'],
      compress: true,
    });

    let pageCount = 0;
    canvases.forEach((canvas, index) => {
      // Tek dilim PDF sayfa limitini aşarsa (ölçek/yuvarlama), alt dilimlere böl.
      const pageSlices = computePageBreaks(canvas.height, [], SAFE_PAGE_PX);
      pageSlices.forEach((slice, sliceIndex) => {
        const piece = document.createElement('canvas');
        piece.width = canvas.width;
        piece.height = slice.height;
        const ctx = piece.getContext('2d');
        ctx.fillStyle = PDF_BG;
        ctx.fillRect(0, 0, piece.width, piece.height);
        ctx.drawImage(canvas, 0, slice.start, canvas.width, slice.height, 0, 0, canvas.width, slice.height);

        if (pageCount > 0) pdf.addPage([piece.width, piece.height]);
        pdf.addImage(piece.toDataURL('image/jpeg', JPEG_QUALITY), 'JPEG', 0, 0, piece.width, piece.height, undefined, 'FAST');
        piece.width = 0;
        piece.height = 0;
        pageCount += 1;
      });
    });

    pdf.save(fileName);
    return { pageCount };
  } finally {
    el.style.width = prevWidth;
    el.style.maxWidth = prevMaxWidth;
    el.style.overflow = prevOverflow;
  }
}
