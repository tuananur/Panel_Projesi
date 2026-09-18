// PDF sayfa kesme hesabının kontrolü. Çalıştırma: node test/pdf-page-breaks.test.mjs
import assert from 'node:assert/strict';
import { computePageBreaks } from '../src/lib/pdf-export.js';

const MAX = 19000; // SAFE_PAGE_PX
let passed = 0;
const test = (name, fn) => {
  fn();
  passed += 1;
  console.log(`  ok  ${name}`);
};

const totalOf = (pages) => pages.reduce((acc, page) => acc + page.height, 0);
const contiguous = (pages) => pages.every((page, index) => (index === 0 ? page.start === 0 : page.start === pages[index - 1].start + pages[index - 1].height));

test('limite sığan içerik tek sayfa kalır', () => {
  const pages = computePageBreaks(12000, [0, 3000, 8000]);
  assert.equal(pages.length, 1);
  assert.deepEqual(pages[0], { start: 0, height: 12000 });
});

test('sınırdaki içerik hâlâ tek sayfa', () => {
  assert.equal(computePageBreaks(MAX, [0, 5000]).length, 1);
});

test('uzun içerik bölüm sınırından kesilir', () => {
  const breaks = Array.from({ length: 50 }, (_, i) => i * 900); // 45000px, 900px'lik bölümler
  const pages = computePageBreaks(45000, breaks);
  assert.ok(pages.length >= 3, `beklenen 3+ sayfa, gelen ${pages.length}`);
  assert.ok(pages.every((page) => page.height <= MAX), 'hiçbir sayfa limiti aşmamalı');
  assert.equal(totalOf(pages), 45000, 'sayfalar toplamı içeriğin tamamını kapsamalı');
  assert.ok(contiguous(pages), 'sayfalar boşluksuz ve üst üste binmeden ilerlemeli');
  // Kesme noktaları bölüm başlangıçlarına denk gelmeli (son sayfa hariç).
  pages.slice(1).forEach((page) => assert.ok(breaks.includes(page.start), `${page.start} bir bölüm başlangıcı değil`));
});

test('bölüm işareti yoksa ham sınırdan bölünür', () => {
  const pages = computePageBreaks(45000, []);
  assert.equal(totalOf(pages), 45000);
  assert.ok(contiguous(pages));
  assert.ok(pages.every((page) => page.height <= MAX));
});

test('tek bölüm limitten uzunsa sınırdan kesilir ve içerik kaybolmaz', () => {
  const pages = computePageBreaks(40000, [0, 30000]);
  assert.equal(totalOf(pages), 40000);
  assert.ok(contiguous(pages));
  assert.ok(pages.every((page) => page.height <= MAX));
});

test('sınır dışı işaretler yok sayılır', () => {
  const pages = computePageBreaks(25000, [-500, 0, 9000, 26000, 99999]);
  assert.equal(totalOf(pages), 25000);
  assert.ok(contiguous(pages));
  assert.equal(pages[1].start, 9000, 'geçerli tek bölüm sınırı kullanılmalı');
});

test('özel limit ile yakalama dilimleri canvas güvenli sınırında kalır', () => {
  const captureLimit = 8000;
  const breaks = Array.from({ length: 40 }, (_, i) => i * 1200);
  const chunks = computePageBreaks(48000, breaks, captureLimit);
  assert.ok(chunks.length >= 6);
  assert.ok(chunks.every((chunk) => chunk.height <= captureLimit));
  assert.equal(totalOf(chunks), 48000);
  assert.ok(contiguous(chunks));
});

test('boş içerik boş dilim listesi döner', () => {
  assert.deepEqual(computePageBreaks(0, [100]), []);
});

console.log(`\n${passed} test geçti.`);
