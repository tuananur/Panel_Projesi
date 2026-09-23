'use server';

import { randomBytes } from 'crypto';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can, getRolePermissions } from '@/lib/permissions';
import { geminiGenerateImage, geminiGenerateText, parseModelJson } from '@/lib/gemini';
import {
  defaultOtoBlogAiSettings,
  isTurkishLanguage,
  normalizeLanguages,
  parseOtoBlogAiSettings,
  parseOtoBlogConfig,
  parseOtoBlogDraft,
} from '@/lib/oto-blog';

const GEMINI_SETTING_KEY = 'gemini_ai_config';

async function requireAccess() {
  const session = await getSession();
  const permissions = await getRolePermissions(session);
  if (!session || !can(permissions, session.role, 'page.oto_blog')) {
    throw new Error('Yetkisiz erişim.');
  }
  return session;
}

async function getGeminiKey() {
  const setting = await prisma.setting.findUnique({ where: { key: GEMINI_SETTING_KEY } });
  const config = setting ? JSON.parse(setting.value || '{}') : {};
  const apiKey = String(config.apiKey || '').trim();
  if (!apiKey) throw new Error('Genel Ayarlar → AI Ayarları içine Gemini API anahtarı koy.');
  return apiKey;
}

async function loadClient(clientId) {
  const id = parseInt(clientId, 10);
  if (!id) throw new Error('Geçersiz müşteri.');
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) throw new Error('Müşteri bulunamadı.');
  if (client.websiteType !== 'BEYIN_ATOLYESI') throw new Error('Önce Beyin Atölyesi altyapısını seç.');
  return client;
}

function mergeAiSettings(stored, incoming) {
  return { ...parseOtoBlogAiSettings(stored), ...(incoming || {}) };
}

async function saveDraft(clientId, draft) {
  await prisma.client.update({
    where: { id: clientId },
    data: { otoBlogDraft: JSON.stringify(draft) },
  });
  return draft;
}

async function publicAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const headerStore = await headers();
  const host = headerStore.get('x-forwarded-host') || headerStore.get('host');
  const proto = headerStore.get('x-forwarded-proto') || 'https';
  if (!host) throw new Error('Uygulama adresi bulunamadı.');
  return `${proto}://${host}`;
}

function imagePublicUrl(token, origin) {
  return `${origin}/api/oto-blog/image/${token}`;
}

export async function refineOtoBlogSystemPromptAction(clientId, kind, prompt, aiSettings) {
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const apiKey = await getGeminiKey();
    const settings = mergeAiSettings(client.otoBlogAiSettings, aiSettings);
    const draft = String(prompt || '').trim();
    if (!draft) return { error: 'Önce bir system prompt yaz.' };

    const target = kind === 'image' ? 'görsel üretimi' : 'blog yazımı';
    const text = await geminiGenerateText({
      apiKey,
      model: settings.textModel,
      systemPrompt: '',
      json: true,
      userPrompt: `Kullanıcının ${target} için yazdığı system prompt taslağını net, uygulanabilir ve profesyonel hale getir. Anlamı bozma, yasakları ve marka sesini koru. Sadece JSON döndür: {"prompt":"..."}\n\nTaslak:\n${draft}`,
    });
    const parsed = parseModelJson(text);
    const refined = String(parsed.prompt || '').trim();
    if (!refined) throw new Error('Düzeltilmiş prompt boş geldi.');
    return { success: true, prompt: refined };
  } catch (error) {
    return { error: error.message || 'Prompt düzeltilemedi.' };
  }
}

export async function saveOtoBlogAiSettingsAction(clientId, raw) {
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const config = mergeAiSettings(client.otoBlogAiSettings, raw);
    await prisma.client.update({
      where: { id: client.id },
      data: { otoBlogAiSettings: JSON.stringify(config) },
    });
    return { success: true, settings: config };
  } catch (error) {
    return { error: error.message || 'AI ayarları kaydedilemedi.' };
  }
}

export async function generateOtoBlogOutlineAction(clientId, topic, aiSettings) {
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const apiKey = await getGeminiKey();
    const settings = mergeAiSettings(client.otoBlogAiSettings, aiSettings);
    const cleanTopic = String(topic || '').trim();
    if (!cleanTopic) return { error: 'Blog konusu boş.' };

    const text = await geminiGenerateText({
      apiKey,
      model: settings.textModel,
      systemPrompt: settings.textSystemPrompt,
      json: true,
      userPrompt: `Blog konusu: ${cleanTopic}\n\nBu konuya uygun bir blog başlığı ve 5-8 içerik maddesi üret. Sadece JSON döndür: {"title":"...","items":["..."]}`,
    });
    const parsed = parseModelJson(text);
    const title = String(parsed.title || '').trim();
    const items = (Array.isArray(parsed.items) ? parsed.items : []).map((item) => String(item || '').trim()).filter(Boolean);
    if (!title || !items.length) throw new Error('Başlık veya maddeler boş geldi.');

    const draft = { ...parseOtoBlogDraft(client.otoBlogDraft), step: 2, topic: cleanTopic, title, items };
    await saveDraft(client.id, draft);
    return { success: true, draft };
  } catch (error) {
    return { error: error.message || 'Başlık üretilemedi.' };
  }
}

export async function generateOtoBlogContentAction(clientId, { title, items, topic }, aiSettings) {
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const apiKey = await getGeminiKey();
    const settings = mergeAiSettings(client.otoBlogAiSettings, aiSettings);
    const cleanTitle = String(title || '').trim();
    const cleanItems = (items || []).map((item) => String(item || '').trim()).filter(Boolean);
    if (!cleanTitle || !cleanItems.length) return { error: 'Başlık ve maddeler gerekli.' };

    const text = await geminiGenerateText({
      apiKey,
      model: settings.textModel,
      systemPrompt: settings.textSystemPrompt,
      json: true,
      userPrompt: `Konu: ${String(topic || '').trim()}\nBaşlık: ${cleanTitle}\nMaddeler:\n${cleanItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nBu başlık ve maddelere göre yayınlanacak tam bir blog yazısı yaz. HTML kullan (p, h2, h3, ul, li). AI yazmış gibi durmasın. Sadece JSON döndür: {"content":"<p>...</p>","meta_title":"...","meta_description":"...","short_desc":"..."}`,
    });
    const parsed = parseModelJson(text);
    const content = String(parsed.content || '').trim();
    if (!content) throw new Error('Blog içeriği boş geldi.');

    const draft = {
      ...parseOtoBlogDraft(client.otoBlogDraft),
      step: 3,
      topic: String(topic || parseOtoBlogDraft(client.otoBlogDraft).topic),
      title: cleanTitle,
      items: cleanItems,
      content,
      metaTitle: String(parsed.meta_title || cleanTitle).trim(),
      metaDescription: String(parsed.meta_description || '').trim(),
      shortDesc: String(parsed.short_desc || '').trim(),
    };
    await saveDraft(client.id, draft);
    return { success: true, draft };
  } catch (error) {
    return { error: error.message || 'İçerik üretilemedi.' };
  }
}

export async function generateOtoBlogImagePromptAction(clientId, { title, content }, aiSettings) {
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const apiKey = await getGeminiKey();
    const settings = mergeAiSettings(client.otoBlogAiSettings, aiSettings);
    if (!title || !content) return { error: 'Başlık ve içerik gerekli.' };

    const text = await geminiGenerateText({
      apiKey,
      model: settings.textModel,
      systemPrompt: settings.imageSystemPrompt || settings.textSystemPrompt,
      json: true,
      userPrompt: `Başlık: ${title}\nİçerik (kısaltılmış): ${String(content).replace(/<[^>]+>/g, ' ').slice(0, 1800)}\n\nBu yazıya kapak fotoğrafı için detaylı bir görsel prompt yaz. Sadece JSON döndür: {"prompt":"..."}`,
    });
    const parsed = parseModelJson(text);
    const imagePrompt = String(parsed.prompt || '').trim();
    if (!imagePrompt) throw new Error('Görsel prompt boş geldi.');

    const draft = { ...parseOtoBlogDraft(client.otoBlogDraft), step: 4, title, content, imagePrompt };
    await saveDraft(client.id, draft);
    return { success: true, draft };
  } catch (error) {
    return { error: error.message || 'Prompt üretilemedi.' };
  }
}

export async function generateOtoBlogImageAction(clientId, imagePrompt, aiSettings) {
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const apiKey = await getGeminiKey();
    const settings = mergeAiSettings(client.otoBlogAiSettings, aiSettings);
    const prompt = String(imagePrompt || '').trim();
    if (!prompt) return { error: 'Görsel prompt boş.' };

    const image = await geminiGenerateImage({
      apiKey,
      model: settings.imageModel,
      systemPrompt: settings.imageSystemPrompt,
      prompt,
    });

    await prisma.otoBlogTempImage.deleteMany({ where: { clientId: client.id } });
    const token = randomBytes(24).toString('hex');
    await prisma.otoBlogTempImage.create({
      data: {
        token,
        clientId: client.id,
        mimeType: image.mimeType,
        data: Buffer.from(image.base64, 'base64'),
      },
    });

    const origin = await publicAppUrl();
    const draft = { ...parseOtoBlogDraft(client.otoBlogDraft), step: 4, imagePrompt: prompt, imageToken: token };
    await saveDraft(client.id, draft);
    return { success: true, draft, imageUrl: imagePublicUrl(token, origin) };
  } catch (error) {
    return { error: error.message || 'Görsel üretilemedi.' };
  }
}

export async function fetchOtoBlogLanguagesAction(clientId) {
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const config = parseOtoBlogConfig(client.otoBlogConfig, client.website);
    if (!config.languagesUrl) return { error: 'Önce Ayarlar’dan GET URL kaydet.' };

    const headersMap = { Accept: 'application/json' };
    if (config.headerName && config.headerValue) headersMap[config.headerName] = config.headerValue;
    const response = await fetch(config.languagesUrl, { headers: headersMap, cache: 'no-store' });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(`Diller alınamadı (${response.status}).`);
    const languages = normalizeLanguages(data);
    return { success: true, languages };
  } catch (error) {
    return { error: error.message || 'Diller alınamadı.', languages: normalizeLanguages(null) };
  }
}

export async function saveOtoBlogDraftAction(clientId, draft) {
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const next = parseOtoBlogDraft(JSON.stringify(draft));
    await saveDraft(client.id, next);
    return { success: true, draft: next };
  } catch (error) {
    return { error: error.message || 'Taslak kaydedilemedi.' };
  }
}

export async function publishOtoBlogAction(clientId, draftInput, aiSettings) {
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const apiKey = await getGeminiKey();
    const settings = mergeAiSettings(client.otoBlogAiSettings, aiSettings);
    const config = parseOtoBlogConfig(client.otoBlogConfig, client.website);
    if (!config.postUrl || !config.headerValue) return { error: 'Ayarlar’da POST URL ve key kaydet.' };

    const draft = parseOtoBlogDraft(JSON.stringify(draftInput));
    if (!draft.title || !draft.content) return { error: 'Başlık ve içerik eksik.' };
    if (!draft.imageToken) return { error: 'Önce görsel oluştur.' };

    const languagesResult = await fetchOtoBlogLanguagesAction(clientId);
    const languages = languagesResult.languages || [];
    const unique = [];
    for (const lang of languages) {
      const selected = isTurkishLanguage(lang) || draft.selectedLangIds.includes(Number(lang.id));
      if (!selected) continue;
      if (!unique.some((item) => Number(item.id) === Number(lang.id))) unique.push(lang);
    }
    if (!unique.some(isTurkishLanguage)) return { error: 'Türkçe zorunlu.' };

    const origin = await publicAppUrl();
    const imageUrl = imagePublicUrl(draft.imageToken, origin);
    const groupId = `oto-${client.id}-${Date.now()}`;
    const results = [];

    for (const lang of unique) {
      let payload = {
        title: draft.title,
        content: draft.content,
        image: imageUrl,
        image_alt: draft.title,
        language_id: Number(lang.id),
        translation_group_id: groupId,
        meta_title: draft.metaTitle || draft.title,
        meta_description: draft.metaDescription || '',
        short_desc: draft.shortDesc || '',
      };

      if (!isTurkishLanguage(lang)) {
        const text = await geminiGenerateText({
          apiKey,
          model: settings.textModel,
          systemPrompt: settings.textSystemPrompt,
          json: true,
          userPrompt: `Aşağıdaki Türkçe blogu ${lang.name} (${lang.code}) diline çevir. Anlamı koru, AI kokusu ekleme. Sadece JSON döndür: {"title":"...","content":"...","meta_title":"...","meta_description":"...","short_desc":"...","image_alt":"..."}\n\nKaynak:\n${JSON.stringify({
            title: draft.title,
            content: draft.content,
            meta_title: draft.metaTitle,
            meta_description: draft.metaDescription,
            short_desc: draft.shortDesc,
            image_alt: draft.title,
          })}`,
        });
        const translated = parseModelJson(text);
        payload = {
          ...payload,
          title: translated.title || payload.title,
          content: translated.content || payload.content,
          meta_title: translated.meta_title || payload.meta_title,
          meta_description: translated.meta_description || payload.meta_description,
          short_desc: translated.short_desc || payload.short_desc,
          image_alt: translated.image_alt || payload.image_alt,
        };
      }

      const headersMap = { Accept: 'application/json', 'Content-Type': 'application/json' };
      headersMap[config.headerName] = config.headerValue;
      const response = await fetch(config.postUrl, {
        method: 'POST',
        headers: headersMap,
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      const data = await response.text();
      let parsed = data;
      try { parsed = data ? JSON.parse(data) : null; } catch { /* raw */ }
      results.push({
        language: lang,
        ok: response.ok,
        status: response.status,
        data: parsed,
        payload,
      });
    }

    const allOk = results.every((item) => item.ok);
    if (allOk && draft.imageToken) {
      await prisma.otoBlogTempImage.deleteMany({ where: { token: draft.imageToken } });
    }

    return { success: allOk, results, allOk };
  } catch (error) {
    return { error: error.message || 'Yayın başarısız.' };
  }
}
