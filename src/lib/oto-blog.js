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
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
];

export const IMAGE_MODELS = [
  { id: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image' },
  { id: 'gemini-2.0-flash-preview-image-generation', label: 'Gemini 2.0 Flash Image' },
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
    return { ...defaults, ...parsed };
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
  };
}

export function parseOtoBlogDraft(raw) {
  const defaults = emptyOtoBlogDraft();
  if (!raw) return defaults;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const selected = Array.isArray(parsed.selectedLangIds) ? parsed.selectedLangIds.map(Number) : [1];
    if (!selected.includes(1)) selected.unshift(1);
    return { ...defaults, ...parsed, selectedLangIds: [...new Set(selected)] };
  } catch {
    return defaults;
  }
}

export function isTurkishLanguage(lang) {
  if (!lang) return false;
  return Number(lang.id) === 1 || String(lang.code || '').toLowerCase() === 'tr';
}

export function normalizeLanguages(payload) {
  const raw = Array.isArray(payload)
    ? payload
    : payload?.data || payload?.languages || payload?.items || null;

  let list = [];
  if (Array.isArray(raw)) {
    list = raw.map((item, index) => {
      if (typeof item === 'string') {
        return { id: index + 1, code: item, name: item };
      }
      const id = Number(item.id ?? item.language_id ?? item.languageId ?? index + 1);
      const code = String(item.code || item.locale || item.slug || item.short_name || item.name || id).toLowerCase();
      const name = String(item.name || item.title || item.label || item.code || id);
      return { id, code, name };
    });
  } else if (payload && typeof payload === 'object') {
    list = Object.entries(payload)
      .filter(([, value]) => value != null && typeof value !== 'object')
      .map(([key, value]) => ({
        id: Number(key) || Number(value) || 0,
        code: String(Number(key) ? value : key).toLowerCase(),
        name: String(value),
      }));
  }

  if (!list.length) return FALLBACK_LANGUAGES;
  const hasTr = list.some(isTurkishLanguage);
  return hasTr ? list : [...FALLBACK_LANGUAGES.slice(0, 1), ...list];
}
