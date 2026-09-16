// Ubersuggest payload'ındaki değerleri DB tiplerine çeviren yardımcılar.
// Temel kural: değer yoksa veya anlamlı değilse null döner — asla 0, '' veya false uydurulmaz.

const MISSING_TOKENS = new Set(['', '-', 'n/a', 'na', 'null', 'undefined', 'none', 'pending', 'not available', '—']);

function isMissing(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return MISSING_TOKENS.has(value.trim().toLowerCase());
  if (typeof value === 'number') return !Number.isFinite(value);
  return false;
}

/** Aynı alanı camelCase veya snake_case olarak kabul eder. */
export function pick(source, ...keys) {
  if (!source || typeof source !== 'object') return undefined;
  for (const key of keys) {
    if (source[key] !== undefined) return source[key];
    const snake = key.replace(/[A-Z0-9]+/g, (m) => `_${m.toLowerCase()}`);
    if (source[snake] !== undefined) return source[snake];
  }
  return undefined;
}

export function toFloatOrNull(value) {
  if (isMissing(value)) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return null;
  // "1.234,5" / "1,234.5" / "12%" / "$0.42" gibi biçimleri sayıya indirger.
  const cleaned = String(value).trim().replace(/[%$€₺\s]/g, '');
  if (!cleaned) return null;
  const normalized = cleaned.includes(',') && cleaned.includes('.')
    ? cleaned.replace(/,/g, '')
    : cleaned.replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toIntOrNull(value) {
  const parsed = toFloatOrNull(value);
  return parsed === null ? null : Math.round(parsed);
}

export function toStringOrNull(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

export function toBoolOrNull(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }
  const normalized = String(value).trim().toLowerCase();
  if (['true', 'yes', '1', 'enabled', 'on'].includes(normalized)) return true;
  if (['false', 'no', '0', 'disabled', 'off'].includes(normalized)) return false;
  return null;
}

export function toDateOrNull(value) {
  if (isMissing(value)) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    // 10 haneli değer saniye cinsinden unix timestamp kabul edilir.
    const ms = value < 1e12 ? value * 1000 : value;
    const fromNumber = new Date(ms);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }
  const raw = String(value).trim();
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00.000Z` : raw;
  const parsed = new Date(dateOnly);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Yalnızca gün hassasiyeti gereken alanlar (snapshotDate, average position date). */
export function toDateOnlyOrNull(value) {
  const parsed = toDateOrNull(value);
  if (!parsed) return null;
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

export function toYmd(date) {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

/** Protokol, www ve sondaki eğik çizgi temizlenir; unique constraint tutarlılığı için şart. */
export function normalizeDomain(value) {
  const raw = toStringOrNull(value);
  if (!raw) return null;
  let host = raw.toLowerCase();
  host = host.replace(/^[a-z]+:\/\//, '');
  host = host.replace(/^www\./, '');
  host = host.split('/')[0].split('?')[0].split('#')[0];
  return host || null;
}

export function toArray(value) {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : null;
}

export function toJsonOrNull(value) {
  if (value === null || value === undefined) return null;
  return value;
}
