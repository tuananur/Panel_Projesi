'use server';

import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can, getRolePermissions } from '@/lib/permissions';
import { geminiGenerateImage, geminiGenerateText, parseModelJson } from '@/lib/gemini';
import {
  defaultOtoBlogAiSettings,
  isRawKeywordTopic,
  isTurkishLanguage,
  normalizeLanguages,
  parseOtoBlogAiSettings,
  parseOtoBlogConfig,
  APP_ORIGIN,
  parseOtoBlogDraft,
  rememberUsedKeywords,
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
  return APP_ORIGIN;
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

export async function expandOtoBlogTopicFromKeywordAction(clientId, keyword, aiSettings) {
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const cleanKeyword = String(keyword || '').trim();
    if (!cleanKeyword) return { error: 'Kelime boş.' };

    if (!isRawKeywordTopic(cleanKeyword)) {
      return { success: true, topic: cleanKeyword, expanded: false };
    }

    const apiKey = await getGeminiKey();
    const settings = mergeAiSettings(client.otoBlogAiSettings, aiSettings);
    const text = await geminiGenerateText({
      apiKey,
      model: settings.textModel,
      systemPrompt: settings.textSystemPrompt,
      json: true,
      userPrompt: `Müşteri: ${client.companyName}\nSite: ${client.website || '-'}\nAnahtar kelime: ${cleanKeyword}\n\nBu bir arama kelimesi, blog konusu olarak ham kalır. Kelimeyi koruyarak 1 cümlelik net bir BLOG KONUSU yaz. Başlık yazma, tırnak kullanma. Sadece JSON döndür: {"topic":"..."}`,
    });
    const parsed = parseModelJson(text);
    const topic = String(parsed.topic || '').trim();
    if (!topic) throw new Error('Konu boş geldi.');
    return { success: true, topic, expanded: true };
  } catch (error) {
    return { error: error.message || 'Konu üretilemedi.' };
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

function selectedPublishLanguages(languages, draft) {
  const unique = [];
  for (const lang of languages || []) {
    const selected = isTurkishLanguage(lang) || draft.selectedLangIds.includes(Number(lang.id));
    if (!selected) continue;
    if (!unique.some((item) => Number(item.id) === Number(lang.id))) unique.push(lang);
  }
  unique.sort((a, b) => Number(isTurkishLanguage(b)) - Number(isTurkishLanguage(a)));
  return unique;
}

function publicLanguage(lang) {
  return { id: Number(lang.id), code: lang.code, name: lang.name };
}

export async function prepareOtoBlogPublishAction(clientId, draftInput, groupId) {
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const config = parseOtoBlogConfig(client.otoBlogConfig, client.website);
    if (!config.postUrl || !config.headerValue) return { error: 'Ayarlar’da POST URL ve key kaydet.' };

    const draft = parseOtoBlogDraft(JSON.stringify(draftInput));
    if (!draft.title || !draft.content) return { error: 'Başlık ve içerik eksik.' };
    if (!draft.imageToken) return { error: 'Önce görsel oluştur.' };

    const languagesResult = await fetchOtoBlogLanguagesAction(clientId);
    const languages = selectedPublishLanguages(languagesResult.languages, draft);
    if (!languages.some(isTurkishLanguage)) return { error: 'Türkçe zorunlu.' };

    const nextGroupId = String(groupId || '').trim() || `oto-${client.id}-${Date.now()}`;
    return { success: true, groupId: nextGroupId, languages: languages.map(publicLanguage) };
  } catch (error) {
    return { error: error.message || 'Gönderim hazırlanamadı.' };
  }
}

function draftLanguageFields(draft) {
  return {
    title: draft.title,
    content: draft.content,
    meta_title: draft.metaTitle || draft.title,
    meta_description: draft.metaDescription || '',
    short_desc: draft.shortDesc || '',
    image_alt: draft.title,
  };
}

export async function translateOtoBlogLanguageAction(clientId, draftInput, aiSettings, language) {
  const started = Date.now();
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const draft = parseOtoBlogDraft(JSON.stringify(draftInput));
    const lang = publicLanguage(language);
    if (!lang.id) return { error: 'Dil eksik.', language: lang, ok: false };

    if (isTurkishLanguage(lang)) {
      return { success: true, language: lang, fields: draftLanguageFields(draft), ms: Date.now() - started };
    }

    const apiKey = await getGeminiKey();
    const settings = mergeAiSettings(client.otoBlogAiSettings, aiSettings);
    const text = await geminiGenerateText({
      apiKey,
      model: settings.textModel,
      systemPrompt: settings.textSystemPrompt,
      json: true,
      userPrompt: `Aşağıdaki Türkçe blogu ${lang.name} (${lang.code}) diline çevir. Anlamı koru, AI kokusu ekleme. Sadece JSON döndür: {"title":"...","content":"...","meta_title":"...","meta_description":"...","short_desc":"...","image_alt":"..."}\n\nKaynak:\n${JSON.stringify(draftLanguageFields(draft))}`,
    });
    const translated = parseModelJson(text);
    const base = draftLanguageFields(draft);
    return {
      success: true,
      language: lang,
      fields: {
        title: translated.title || base.title,
        content: translated.content || base.content,
        meta_title: translated.meta_title || base.meta_title,
        meta_description: translated.meta_description || base.meta_description,
        short_desc: translated.short_desc || base.short_desc,
        image_alt: translated.image_alt || base.image_alt,
      },
      ms: Date.now() - started,
    };
  } catch (error) {
    return { error: error.message || 'Çeviri başarısız.', language, ok: false, ms: Date.now() - started };
  }
}

export async function publishOtoBlogLanguageAction(clientId, draftInput, language, groupId, fields) {
  const started = Date.now();
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const config = parseOtoBlogConfig(client.otoBlogConfig, client.website);
    if (!config.postUrl || !config.headerValue) return { error: 'Ayarlar’da POST URL ve key kaydet.', ok: false };

    const draft = parseOtoBlogDraft(JSON.stringify(draftInput));
    const lang = publicLanguage(language);
    if (!lang.id || !groupId) return { error: 'Dil veya grup eksik.', ok: false };

    const origin = await publicAppUrl();
    const payload = {
      ...draftLanguageFields(draft),
      ...(fields || {}),
      image: imagePublicUrl(draft.imageToken, origin),
      language_id: lang.id,
      translation_group_id: groupId,
    };

    const headersMap = { Accept: 'application/json', 'Content-Type': 'application/json' };
    headersMap[config.headerName] = config.headerValue;
    const response = await fetch(config.postUrl, {
      method: 'POST',
      headers: headersMap,
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    return {
      success: response.ok,
      language: lang,
      ok: response.ok,
      status: response.status,
      ms: Date.now() - started,
    };
  } catch (error) {
    return { error: error.message || 'Dil gönderilemedi.', language, ok: false, ms: Date.now() - started };
  }
}

export async function getOtoBlogAutoJobsAction() {
  try {
    await requireAccess();
    const jobs = await prisma.otoBlogAutoJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 80,
      select: {
        id: true,
        topic: true,
        refinedTopic: true,
        title: true,
        status: true,
        statusText: true,
        phase: true,
        logsJson: true,
        error: true,
        createdAt: true,
        updatedAt: true,
        client: { select: { id: true, companyName: true, website: true } },
      },
    });
    return {
      success: true,
      jobs: jobs.map((job) => ({
        ...job,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        logs: (() => {
          try {
            const parsed = JSON.parse(job.logsJson || '[]');
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })(),
      })),
    };
  } catch (error) {
    return { error: error.message || 'Loglar alınamadı.' };
  }
}

export async function resumeOtoBlogAutoJobAction(jobId) {
  try {
    await requireAccess();
    const id = parseInt(jobId, 10);
    const job = await prisma.otoBlogAutoJob.findUnique({ where: { id } });
    if (!job) return { error: 'İş bulunamadı.' };
    if (job.status === 'done') return { error: 'Bu iş zaten bitti.' };

    if (job.status === 'error') {
      const rollbackPhase = job.phase === 'error' ? 'image_prompt' : job.phase;
      await prisma.otoBlogAutoJob.update({
        where: { id },
        data: {
          status: 'running',
          phase: rollbackPhase === 'error' ? 'queued' : rollbackPhase,
          error: null,
          statusText: 'Devam ettiriliyor',
        },
      });
    }

    const { enqueueAutoJobRun, resolveAppUrl } = await import('@/lib/oto-blog-auto');
    const origin = await resolveAppUrl();
    await enqueueAutoJobRun(origin, job.id, job.continueToken);
    return { success: true };
  } catch (error) {
    return { error: error.message || 'Devam ettirilemedi.' };
  }
}

export async function finalizeOtoBlogPublishAction(clientId, draftInput) {
  try {
    await requireAccess();
    const client = await loadClient(clientId);
    const draft = parseOtoBlogDraft(JSON.stringify(draftInput));
    if (draft.imageToken) {
      await prisma.otoBlogTempImage.deleteMany({ where: { token: draft.imageToken } });
    }
    const usedExtra = draft.sourceKeyword || (isRawKeywordTopic(draft.topic) ? draft.topic : '');
    const nextDraft = {
      ...draft,
      published: true,
      step: 7,
      usedKeywords: rememberUsedKeywords(draft.usedKeywords, usedExtra),
    };
    await saveDraft(client.id, nextDraft);
    return { success: true, draft: nextDraft };
  } catch (error) {
    return { error: error.message || 'Gönderim tamamlanamadı.' };
  }
}
