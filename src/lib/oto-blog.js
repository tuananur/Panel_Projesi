export const APP_ORIGIN = 'https://panel-projesi.vercel.app';

export const DEFAULT_POST_BODY = {
  title: 'Örnek Blog Yazısı',
  content: '<p>Bu örnek blog içeriğidir.</p>',
  image: 'https://picsum.photos/1200/800',
  image_alt: 'Örnek görsel',
  language_id: 1,
  translation_group_id: 'test-group-001',
  meta_title: 'Örnek Blog Yazısı',
  meta_description: 'Bu bir örnek meta açıklamasıdır.',
  short_desc: 'Örnek kısa açıklama',
};

export function siteOriginFromWebsite(website) {
  if (!website || !String(website).trim()) return '';
  try {
    const raw = String(website).trim();
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    return new URL(url).origin;
  } catch {
    return '';
  }
}

export function defaultOtoBlogConfig(website) {
  const origin = siteOriginFromWebsite(website);
  return {
    siteOrigin: origin,
    postUrl: origin ? `${origin}/api/post-create` : '',
    languagesUrl: origin ? `${origin}/api/languages` : '',
    headerName: 'X-POST-KEY',
    headerValue: '',
    inboundKey: '',
    bodyJson: JSON.stringify(DEFAULT_POST_BODY, null, 2),
  };
}

export function parseOtoBlogConfig(raw, website) {
  const defaults = defaultOtoBlogConfig(website);
  if (!raw) return defaults;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      ...defaults,
      ...parsed,
      bodyJson: parsed.bodyJson || defaults.bodyJson,
    };
  } catch {
    return defaults;
  }
}

export function assertPublicHttpUrl(value) {
  const url = new URL(String(value || '').trim());
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('URL http veya https olmalı.');
  }
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local')) {
    throw new Error('Yerel adres kabul edilmez.');
  }
  return url.toString();
}

export function parsePostBody(bodyJson) {
  const parsed = JSON.parse(bodyJson);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Body bir JSON nesnesi olmalı.');
  }
  return parsed;
}

export const TEXT_MODELS = [
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];

export const IMAGE_MODELS = [
  { id: 'gemini-3.1-flash-image', label: 'Gemini 3.1 Flash Image' },
  { id: 'gemini-3.1-flash-lite-image', label: 'Gemini 3.1 Flash-Lite Image' },
  { id: 'gemini-3-pro-image', label: 'Gemini 3 Pro Image' },
  { id: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image (eski)' },
];

export const FALLBACK_LANGUAGES = [
  { id: 1, code: 'tr', name: 'Türkçe' },
  { id: 2, code: 'en', name: 'English' },
  { id: 3, code: 'fr', name: 'Français' },
  { id: 4, code: 'ru', name: 'Русский' },
  { id: 5, code: 'de', name: 'Deutsch' },
];

export function defaultOtoBlogAiSettings() {
  return {
    textModel: TEXT_MODELS[0].id,
    imageModel: IMAGE_MODELS[0].id,
    textSystemPrompt: '',
    imageSystemPrompt: '',
  };
}

export function parseOtoBlogAiSettings(raw) {
  const defaults = defaultOtoBlogAiSettings();
  if (!raw) return defaults;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const next = { ...defaults, ...parsed };
    if (!TEXT_MODELS.some((model) => model.id === next.textModel)) next.textModel = defaults.textModel;
    if (!IMAGE_MODELS.some((model) => model.id === next.imageModel)) next.imageModel = defaults.imageModel;
    return next;
  } catch {
    return defaults;
  }
}

export function emptyOtoBlogDraft() {
  return {
    step: 1,
    topic: '',
    title: '',
    items: [],
    content: '',
    metaTitle: '',
    metaDescription: '',
    shortDesc: '',
    imagePrompt: '',
    imageToken: '',
    selectedLangIds: [1],
    translations: [],
    published: false,
    sourceKeyword: '',
    usedKeywords: [],
  };
}

export function parseOtoBlogDraft(raw) {
  const defaults = emptyOtoBlogDraft();
  if (!raw) return defaults;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const selected = Array.isArray(parsed.selectedLangIds) ? parsed.selectedLangIds.map(Number) : [1];
    if (!selected.includes(1)) selected.unshift(1);
    const usedKeywords = uniqueKeywords(parsed.usedKeywords);
    return {
      ...defaults,
      ...parsed,
      selectedLangIds: [...new Set(selected)],
      sourceKeyword: String(parsed.sourceKeyword || '').trim(),
      usedKeywords,
    };
  } catch {
    return defaults;
  }
}

export function normalizeKeyword(value) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function uniqueKeywords(values) {
  const seen = new Set();
  const list = [];
  for (const value of Array.isArray(values) ? values : []) {
    const raw = String(value || '').trim();
    const key = normalizeKeyword(raw);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    list.push(raw);
  }
  return list;
}

export function rememberUsedKeywords(current, extra) {
  return uniqueKeywords([...(current || []), extra]);
}

export function isRawKeywordTopic(text) {
  const clean = String(text || '').trim();
  if (!clean) return false;
  const words = clean.split(/\s+/);
  if (words.length <= 5) return true;
  if (/[.?!]/.test(clean)) return false;
  return words.length <= 8 && clean === clean.toLocaleLowerCase('tr-TR');
}

export function keywordWasUsed(keyword, usedKeywords, blogTexts = []) {
  const needle = normalizeKeyword(keyword);
  if (needle.length < 3) return false;
  if ((usedKeywords || []).some((item) => normalizeKeyword(item) === needle)) return true;
  return (blogTexts || []).some((text) => {
    const hay = normalizeKeyword(text);
    if (!hay) return false;
    if (hay === needle) return true;
    return needle.length >= 6 && hay.includes(needle);
  });
}

export const LANGUAGE_LABELS = {
  tr: 'Türkçe',
  en: 'English',
  fr: 'Français',
  ru: 'Русский',
  de: 'Deutsch',
};

export function isTurkishLanguage(lang) {
  if (!lang) return false;
  return Number(lang.id) === 1 || String(lang.code || '').toLowerCase() === 'tr';
}

function languageName(code) {
  const key = String(code || '').toLowerCase();
  return LANGUAGE_LABELS[key] || key.toUpperCase();
}

function mapIdCodeRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return [];
  return Object.entries(record)
    .filter(([key, value]) => /^\d+$/.test(String(key)) && value != null && typeof value !== 'object')
    .map(([key, value]) => {
      const code = String(value).toLowerCase();
      return { id: Number(key), code, name: languageName(code) };
    });
}

export function normalizeLanguages(payload) {
  if (!payload) return FALLBACK_LANGUAGES;

  if (Array.isArray(payload)) {
    const list = payload.map((item, index) => {
      if (typeof item === 'string') {
        const code = item.toLowerCase();
        return { id: index + 1, code, name: languageName(code) };
      }
      const id = Number(item.id ?? item.language_id ?? item.languageId ?? index + 1);
      const code = String(item.code || item.locale || item.slug || item.short_name || item.name || id).toLowerCase();
      return { id, code, name: item.name || item.title || item.label || languageName(code) };
    });
    return list.length ? list : FALLBACK_LANGUAGES;
  }

  if (typeof payload === 'object') {
    const nested = payload.data || payload.languages || payload.items;
    const fromNestedMap = mapIdCodeRecord(nested);
    if (fromNestedMap.length) return fromNestedMap;
    if (Array.isArray(nested) && nested.length) return normalizeLanguages(nested);
    const fromRootMap = mapIdCodeRecord(payload);
    if (fromRootMap.length) return fromRootMap;
  }

  return FALLBACK_LANGUAGES;
}
