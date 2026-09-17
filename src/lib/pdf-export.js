// Ekrandaki bir elemanı tek uzun PDF sayfası olarak kaydeder (A4'e bölmez).
// Yalnızca tarayıcıda çalışır; html2canvas ve jspdf tıklama anında dinamik yüklenir.

export const PDF_BG = '#0f172a';

/**
 * @param el        PDF'e dönüştürülecek kök eleman
 * @param fileName  indirilecek dosya adı
 * @param onClone   klon DOM üzerinde son rötuşlar (satır kırpma, gizleme)
 *
 * Klon üzerinde otomatik uygulananlar:
 *   [data-pdf-hide]   → tamamen kaldırılır (butonlar, sekme çubuğu gibi)
 *   [data-pdf-expand] → yatay kaydırma açılır, tablolar kırpılmaz
 */
export async function saveElementAsSinglePdfPage(el, fileName, { onClone } = {}) {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const prevWidth = el.style.width;
  const prevMaxWidth = el.style.maxWidth;
  el.style.width = `${el.scrollWidth}px`;
  el.style.maxWidth = `${el.scrollWidth}px`;

  const w = el.scrollWidth;
  const h = el.scrollHeight;
  const scale = Math.min(2, Math.max(1, 8192 / Math.max(w, h)));

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

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new jsPDF({
      unit: 'px',
      format: [canvas.width, canvas.height],
      hotfixes: ['px_scaling'],
      compress: true,
    });
    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
    pdf.save(fileName);
  } finally {
    el.style.width = prevWidth;
    el.style.maxWidth = prevMaxWidth;
  }
}
