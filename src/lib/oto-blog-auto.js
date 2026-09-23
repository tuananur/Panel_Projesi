import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { geminiGenerateImage, geminiGenerateText, parseModelJson } from '@/lib/gemini';
import {
  APP_ORIGIN,
  isTurkishLanguage,
  normalizeLanguages,
  parseOtoBlogAiSettings,
  parseOtoBlogConfig,
} from '@/lib/oto-blog';

export const INBOUND_HEADER = 'X-OTO-BLOG-KEY';
export const RUN_HEADER = 'X-OTO-RUN-KEY';
const GEMINI_SETTING_KEY = 'gemini_ai_config';

export function generateOtoBlogInboundKey() {
  return randomBytes(24).toString('hex');
}

export function readAutoAuthKey(request) {
  const inbound = String(request.headers.get(INBOUND_HEADER) || '').trim();
  if (inbound) return inbound;
  return String(request.headers.get('x-post-key') || '').trim();
}

export async function findClientByAutoKey(key) {
  const clean = String(key || '').trim();
  if (!clean) return null;

  const byColumn = await prisma.client.findUnique({ where: { otoBlogInboundKey: clean } });
  if (byColumn && byColumn.websiteType === 'BEYIN_ATOLYESI') return byColumn;

  const clients = await prisma.client.findMany({ where: { websiteType: 'BEYIN_ATOLYESI' } });
  return clients.find((client) => {
    const config = parseOtoBlogConfig(client.otoBlogConfig, client.website);
    return config.inboundKey === clean || config.headerValue === clean;
  }) || null;
}

export async function resolveAppUrl() {
  return APP_ORIGIN;
}

export async function enqueueAutoJobRun(origin, jobId, token) {
  await fetch(`${origin}/api/oto-blog/auto/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', [RUN_HEADER]: token },
    body: JSON.stringify({ jobId }),
    cache: 'no-store',
  });
}

async function getGeminiKey() {
  const setting = await prisma.setting.findUnique({ where: { key: GEMINI_SETTING_KEY } });
  const config = setting ? JSON.parse(setting.value || '{}') : {};
  const apiKey = String(config.apiKey || '').trim();
  if (!apiKey) throw new Error('Gemini API anahtarı yok.');
  return apiKey;
}

function parseLogs(raw) {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parsePayload(raw) {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function publicLang(lang) {
  return { id: Number(lang.id), code: lang.code, name: lang.name };
}

function draftFields(payload) {
  return {
    title: payload.title,
    content: payload.content,
    meta_title: payload.metaTitle || payload.title,
    meta_description: payload.metaDescription || '',
    short_desc: payload.shortDesc || '',
    image_alt: payload.title,
  };
}

async function writeJob(job, patch, logText) {
  const logs = parseLogs(job.logsJson);
  if (logText) logs.push({ at: new Date().toISOString(), text: logText });
  const next = await prisma.otoBlogAutoJob.update({
    where: { id: job.id },
    data: {
      ...patch,
      logsJson: JSON.stringify(logs.slice(-80)),
    },
  });
  return next;
}

async function failJob(job, error) {
  const message = error?.message || String(error || 'Bilinmeyen hata');
  await writeJob(job, {
    status: 'error',
    phase: 'error',
    statusText: 'Hata',
    error: message,
  }, `Hata: ${message}`);
}

export async function createAutoJob(client, topic) {
  const token = randomBytes(24).toString('hex');
  return prisma.otoBlogAutoJob.create({
    data: {
      clientId: client.id,
      continueToken: token,
      topic,
      status: 'queued',
      statusText: 'Sırada',
      phase: 'queued',
      payloadJson: JSON.stringify({ topic }),
      logsJson: JSON.stringify([{ at: new Date().toISOString(), text: `Konu alındı: ${topic}` }]),
    },
  });
}

export async function processAutoJobStep(jobId, token) {
  const job = await prisma.otoBlogAutoJob.findUnique({
    where: { id: Number(jobId) },
    include: { client: true },
  });
  if (!job || job.continueToken !== token) return { ok: false, error: 'Job bulunamadı.' };
  if (job.phase === 'done' || job.phase === 'error') return { ok: true, done: true, phase: job.phase };

  try {
    const next = await runPhase(job);
    return { ok: true, done: next.phase === 'done' || next.phase === 'error', phase: next.phase };
  } catch (error) {
    await failJob(job, error);
    return { ok: false, done: true, phase: 'error', error: error.message };
  }
}

async function runPhase(job) {
  const client = job.client;
  const payload = parsePayload(job.payloadJson);
  const ai = parseOtoBlogAiSettings(client.otoBlogAiSettings);
  const config = parseOtoBlogConfig(client.otoBlogConfig, client.website);

  switch (job.phase) {
    case 'queued':
      return writeJob(job, { phase: 'topic', status: 'running', statusText: 'Konu düzenleniyor' }, 'Konu AI ile düzenleniyor');
    case 'topic':
      return refineTopic(job, client, payload, ai);
    case 'outline':
      return makeOutline(job, payload, ai);
    case 'content':
      return makeContent(job, payload, ai);
    case 'image_prompt':
      return makeImagePrompt(job, payload, ai);
    case 'image':
      return makeImage(job, payload, ai);
    case 'languages':
      return loadLanguages(job, client, payload, config);
    case 'translate':
      return translateLang(job, payload, ai);
    case 'send':
      return sendLang(job, payload, config);
    case 'finalize':
      return finalizeJob(job, payload);
    default:
      throw new Error(`Bilinmeyen adım: ${job.phase}`);
  }
}

async function refineTopic(job, client, payload, ai) {
  const apiKey = await getGeminiKey();
  const text = await geminiGenerateText({
    apiKey,
    model: ai.textModel,
    systemPrompt: ai.textSystemPrompt,
    json: true,
    userPrompt: `Müşteri: ${client.companyName}\nSite: ${client.website || '-'}\nKullanıcının yazdığı konu: ${payload.topic}\n\nBu konuyu blog üretimi için net, doğal bir BLOG KONUSU haline getir. Başlık yazma. Anlamı bozma, gerekmezse az düzelt. Sadece JSON: {"topic":"..."}`,
  });
  const refinedTopic = String(parseModelJson(text).topic || payload.topic).trim();
  if (!refinedTopic) throw new Error('Düzenlenmiş konu boş.');
  return writeJob(job, {
    refinedTopic,
    title: job.title,
    phase: 'outline',
    statusText: 'Blog yazılıyor',
    payloadJson: JSON.stringify({ ...payload, topic: refinedTopic, refinedTopic }),
  }, `Konu hazır: ${refinedTopic}`);
}

async function makeOutline(job, payload, ai) {
  const apiKey = await getGeminiKey();
  const text = await geminiGenerateText({
    apiKey,
    model: ai.textModel,
    systemPrompt: ai.textSystemPrompt,
    json: true,
    userPrompt: `Blog konusu: ${payload.topic}\n\nBu konuya uygun bir blog başlığı ve 5-8 içerik maddesi üret. Sadece JSON döndür: {"title":"...","items":["..."]}`,
  });
  const parsed = parseModelJson(text);
  const title = String(parsed.title || '').trim();
  const items = (Array.isArray(parsed.items) ? parsed.items : []).map((item) => String(item || '').trim()).filter(Boolean);
  if (!title || !items.length) throw new Error('Başlık veya maddeler boş.');
  return writeJob(job, {
    title,
    phase: 'content',
    statusText: 'Blog yazılıyor',
    payloadJson: JSON.stringify({ ...payload, title, items }),
  }, `Başlık: ${title}`);
}

async function makeContent(job, payload, ai) {
  const apiKey = await getGeminiKey();
  const text = await geminiGenerateText({
    apiKey,
    model: ai.textModel,
    systemPrompt: ai.textSystemPrompt,
    json: true,
    userPrompt: `Konu: ${payload.topic}\nBaşlık: ${payload.title}\nMaddeler:\n${(payload.items || []).map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nBu başlık ve maddelere göre yayınlanacak tam bir blog yazısı yaz. HTML kullan (p, h2, h3, ul, li). AI yazmış gibi durmasın. Sadece JSON döndür: {"content":"<p>...</p>","meta_title":"...","meta_description":"...","short_desc":"..."}`,
  });
  const parsed = parseModelJson(text);
  const content = String(parsed.content || '').trim();
  if (!content) throw new Error('Blog içeriği boş.');
  return writeJob(job, {
    phase: 'image_prompt',
    statusText: 'Fotoğraf oluşturuluyor',
    payloadJson: JSON.stringify({
      ...payload,
      content,
      metaTitle: String(parsed.meta_title || payload.title).trim(),
      metaDescription: String(parsed.meta_description || '').trim(),
      shortDesc: String(parsed.short_desc || '').trim(),
    }),
  }, 'İçerik yazıldı');
}

async function makeImagePrompt(job, payload, ai) {
  const apiKey = await getGeminiKey();
  const text = await geminiGenerateText({
    apiKey,
    model: ai.textModel,
    systemPrompt: ai.imageSystemPrompt || ai.textSystemPrompt,
    json: true,
    userPrompt: `Başlık: ${payload.title}\nİçerik (kısaltılmış): ${String(payload.content || '').replace(/<[^>]+>/g, ' ').slice(0, 1800)}\n\nBu yazıya kapak fotoğrafı için detaylı bir görsel prompt yaz. Sadece JSON döndür: {"prompt":"..."}`,
  });
  const imagePrompt = String(parseModelJson(text).prompt || '').trim();
  if (!imagePrompt) throw new Error('Görsel prompt boş.');
  return writeJob(job, {
    phase: 'image',
    statusText: 'Fotoğraf oluşturuluyor',
    payloadJson: JSON.stringify({ ...payload, imagePrompt }),
  }, 'Görsel prompt hazır');
}

async function makeImage(job, payload, ai) {
  const apiKey = await getGeminiKey();
  const image = await geminiGenerateImage({
    apiKey,
    model: ai.imageModel,
    systemPrompt: ai.imageSystemPrompt,
    prompt: payload.imagePrompt,
  });
  const token = randomBytes(24).toString('hex');
  await prisma.otoBlogTempImage.create({
    data: {
      token,
      clientId: job.clientId,
      mimeType: image.mimeType,
      data: Buffer.from(image.base64, 'base64'),
    },
  });
  return writeJob(job, {
    phase: 'languages',
    statusText: 'Diller alınıyor',
    payloadJson: JSON.stringify({ ...payload, imageToken: token }),
  }, 'Fotoğraf oluşturuldu');
}

async function loadLanguages(job, client, payload, config) {
  if (!config.languagesUrl) throw new Error('Diller URL yok.');
  if (!config.postUrl || !config.headerValue) throw new Error('POST URL veya key yok.');
  const headersMap = { Accept: 'application/json' };
  if (config.headerName && config.headerValue) headersMap[config.headerName] = config.headerValue;
  const response = await fetch(config.languagesUrl, { headers: headersMap, cache: 'no-store' });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Diller alınamadı (${response.status}).`);
  const languages = normalizeLanguages(data)
    .map(publicLang)
    .filter((lang, index, list) => list.findIndex((item) => item.id === lang.id) === index)
    .sort((a, b) => Number(isTurkishLanguage(b)) - Number(isTurkishLanguage(a)));
  if (!languages.some(isTurkishLanguage)) throw new Error('Türkçe dil listesinde yok.');
  const groupId = `oto-auto-${job.clientId}-${job.id}`;
  const first = languages[0];
  return writeJob(job, {
    phase: isTurkishLanguage(first) ? 'send' : 'translate',
    statusText: isTurkishLanguage(first) ? `${first.name} gönderiliyor` : `${first.name} çevriliyor`,
    payloadJson: JSON.stringify({
      ...payload,
      languages,
      groupId,
      langIndex: 0,
    }),
  }, `Diller: ${languages.map((lang) => lang.name).join(', ')}`);
}

async function translateLang(job, payload, ai) {
  const lang = payload.languages[payload.langIndex];
  if (!lang) return writeJob(job, { phase: 'finalize', statusText: 'Tamamlanıyor' }, 'Diller bitti');
  if (isTurkishLanguage(lang)) {
    return writeJob(job, { phase: 'send', statusText: `${lang.name} gönderiliyor` });
  }
  const apiKey = await getGeminiKey();
  const text = await geminiGenerateText({
    apiKey,
    model: ai.textModel,
    systemPrompt: ai.textSystemPrompt,
    json: true,
    userPrompt: `Aşağıdaki Türkçe blogu ${lang.name} (${lang.code}) diline çevir. Anlamı koru, AI kokusu ekleme. Sadece JSON döndür: {"title":"...","content":"...","meta_title":"...","meta_description":"...","short_desc":"...","image_alt":"..."}\n\nKaynak:\n${JSON.stringify(draftFields(payload))}`,
  });
  const translated = parseModelJson(text);
  const base = draftFields(payload);
  const fieldsByLang = { ...(payload.fieldsByLang || {}) };
  fieldsByLang[lang.id] = {
    title: translated.title || base.title,
    content: translated.content || base.content,
    meta_title: translated.meta_title || base.meta_title,
    meta_description: translated.meta_description || base.meta_description,
    short_desc: translated.short_desc || base.short_desc,
    image_alt: translated.image_alt || base.image_alt,
  };
  return writeJob(job, {
    phase: 'send',
    statusText: `${lang.name} gönderiliyor`,
    payloadJson: JSON.stringify({ ...payload, fieldsByLang }),
  }, `${lang.name} çevrildi`);
}

async function sendLang(job, payload, config) {
  const lang = payload.languages[payload.langIndex];
  if (!lang) return writeJob(job, { phase: 'finalize', statusText: 'Tamamlanıyor' }, 'Diller bitti');
  const origin = await resolveAppUrl();
  const fields = payload.fieldsByLang?.[lang.id] || draftFields(payload);
  const postBody = {
    ...fields,
    image: `${origin}/api/oto-blog/image/${payload.imageToken}`,
    language_id: lang.id,
    translation_group_id: payload.groupId,
  };
  const headersMap = { Accept: 'application/json', 'Content-Type': 'application/json' };
  headersMap[config.headerName] = config.headerValue;
  const response = await fetch(config.postUrl, {
    method: 'POST',
    headers: headersMap,
    body: JSON.stringify(postBody),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`${lang.name} gönderilemedi (${response.status}).`);

  const nextIndex = payload.langIndex + 1;
  const nextLang = payload.languages[nextIndex];
  if (!nextLang) {
    return writeJob(job, {
      phase: 'finalize',
      statusText: 'Tamamlanıyor',
      payloadJson: JSON.stringify({ ...payload, langIndex: nextIndex }),
    }, `${lang.name} gönderildi (${response.status})`);
  }
  return writeJob(job, {
    phase: isTurkishLanguage(nextLang) ? 'send' : 'translate',
    statusText: isTurkishLanguage(nextLang) ? `${nextLang.name} gönderiliyor` : `${nextLang.name} çevriliyor`,
    payloadJson: JSON.stringify({ ...payload, langIndex: nextIndex }),
  }, `${lang.name} gönderildi (${response.status})`);
}

async function finalizeJob(job, payload) {
  if (payload.imageToken) {
    await prisma.otoBlogTempImage.deleteMany({ where: { token: payload.imageToken } });
  }
  return writeJob(job, {
    status: 'done',
    phase: 'done',
    statusText: 'Tamamlandı',
    error: null,
  }, 'Bloglar taslak olarak sitelerine düştü');
}
