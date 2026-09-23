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
