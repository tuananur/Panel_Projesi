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
export const LEASE_MS = 90 * 1000;
export const MAX_JOB_MS = 15 * 60 * 1000;
export const MAX_PHASE_RESUMES = 3;
const GEMINI_SETTING_KEY = 'gemini_ai_config';

function getRunMeta(payload) {
  const raw = payload?._run && typeof payload._run === 'object' ? payload._run : {};
  return {
    leaseUntil: Number(raw.leaseUntil) || 0,
    startedAt: Number(raw.startedAt) || 0,
    resumeAttempts: Number(raw.resumeAttempts) || 0,
    lastPhase: raw.lastPhase || null,
    failedPhase: raw.failedPhase || null,
  };
}

function setRunMeta(payload, patch) {
  return { ...payload, _run: { ...getRunMeta(payload), ...patch } };
}

function isLeaseActive(job, now = Date.now()) {
  if (!job || job.status !== 'running') return false;
  return getRunMeta(parsePayload(job.payloadJson)).leaseUntil > now;
}

function isJobExpired(job, now = Date.now()) {
  if (!job || job.status !== 'running') return false;
  const started = getRunMeta(parsePayload(job.payloadJson)).startedAt || new Date(job.createdAt).getTime();
  return Number.isFinite(started) && now - started > MAX_JOB_MS;
}

export function isJobStuck(job, now = Date.now()) {
  return Boolean(job && job.status === 'running' && !isLeaseActive(job, now));
}

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

async function logRunFail(jobId, detail) {
  const current = await prisma.otoBlogAutoJob.findUnique({ where: { id: Number(jobId) } });
  if (current) await writeJob(current, {}, `Devam isteği başarısız (${detail})`);
}

export async function enqueueAutoJobRun(origin, jobId, token) {
  try {
    const response = await fetch(`${origin}/api/oto-blog/auto/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [RUN_HEADER]: token },
      body: JSON.stringify({ jobId }),
      cache: 'no-store',
    });
    if (response.ok) return response;
    await logRunFail(jobId, response.status);
    if (response.status === 508) {
      await continueAutoJob(jobId, token, 50000);
    }
    return response;
  } catch (error) {
    await logRunFail(jobId, error.message || 'ağ');
    await continueAutoJob(jobId, token, 50000);
    return null;
  }
}

export async function continueAutoJob(jobId, token, budgetMs = 50000) {
  const started = Date.now();
  let result = { ok: true, done: false, phase: null, clientId: null };
  while (Date.now() - started < budgetMs) {
    result = await processAutoJobStep(jobId, token);
    if (result.blocked) return result;
    if (!result.ok || result.done) break;
  }
  if (!result.clientId) {
    const job = await prisma.otoBlogAutoJob.findUnique({ where: { id: Number(jobId) }, select: { clientId: true } });
    result.clientId = job?.clientId || null;
  }
  return result;
}

export async function claimNextQueued(clientId) {
  const next = await prisma.otoBlogAutoJob.findFirst({
    where: { clientId, status: 'queued' },
    orderBy: { id: 'asc' },
  });
  if (!next) return null;
  const claimed = await prisma.otoBlogAutoJob.updateMany({
    where: { id: next.id, status: 'queued' },
    data: { status: 'running', statusText: 'Başlıyor' },
  });
  if (claimed.count === 0) return null;
  const payload = parsePayload(next.payloadJson);
  await writeJob(next, {
    payloadJson: JSON.stringify(setRunMeta(payload, {
      startedAt: Date.now(),
      leaseUntil: Date.now() + LEASE_MS,
      lastPhase: next.phase,
      resumeAttempts: 0,
    })),
  }, 'Kuyruk sırası geldi, başlıyor');
  return prisma.otoBlogAutoJob.findUnique({ where: { id: next.id } });
}

async function failRunningJob(job, message) {
  const payload = parsePayload(job.payloadJson);
  await writeJob(job, {
    status: 'error',
    phase: 'error',
    statusText: 'Hata',
    error: message,
    payloadJson: JSON.stringify(setRunMeta(payload, { failedPhase: job.phase === 'error' ? getRunMeta(payload).failedPhase : job.phase, leaseUntil: 0 })),
  }, `Hata: ${message}`);
}

async function resumeOrphanJob(job) {
  const payload = parsePayload(job.payloadJson);
  const meta = getRunMeta(payload);
  const samePhase = (meta.lastPhase || job.phase) === job.phase;
  const attempts = samePhase ? meta.resumeAttempts + 1 : 1;
  if (attempts > MAX_PHASE_RESUMES) {
    await failRunningJob(job, `Aynı adım (${job.phase}) ${MAX_PHASE_RESUMES} kez takıldı.`);
    return false;
  }
  await writeJob(job, {
    payloadJson: JSON.stringify(setRunMeta(payload, {
      resumeAttempts: attempts,
      lastPhase: job.phase,
      leaseUntil: Date.now() + LEASE_MS,
      startedAt: meta.startedAt || Date.now(),
    })),
  }, `Yetim iş devam ettiriliyor (${job.phase}, ${attempts}/${MAX_PHASE_RESUMES})`);
  await enqueueAutoJobRun(await resolveAppUrl(), job.id, job.continueToken);
  return true;
}

export async function kickClientQueue(clientId) {
  const running = await prisma.otoBlogAutoJob.findFirst({
    where: { clientId, status: 'running' },
    orderBy: { id: 'asc' },
  });

  if (running) {
    if (isJobExpired(running)) {
      await failRunningJob(running, 'İş 15 dakikayı aştı.');
    } else if (isLeaseActive(running)) {
      return { started: false };
    } else {
      const resumed = await resumeOrphanJob(running);
      if (resumed) return { started: true, jobId: running.id, recovered: true };
    }
  }

  const next = await claimNextQueued(clientId);
  if (!next) return { started: false };
  await enqueueAutoJobRun(await resolveAppUrl(), next.id, next.continueToken);
  return { started: true, jobId: next.id };
}

export async function cancelAutoJob(jobId) {
  const job = await prisma.otoBlogAutoJob.findUnique({ where: { id: Number(jobId) } });
  if (!job) return { ok: false, error: 'İş bulunamadı.' };
  if (job.status === 'done') return { ok: false, error: 'Biten iş iptal edilemez.' };
  if (job.status === 'cancelled') return { ok: true, job };

  await writeJob(job, {
    status: 'cancelled',
    phase: 'cancelled',
    statusText: 'İptal edildi',
    error: null,
  }, 'İptal edildi');
  await kickClientQueue(job.clientId);
  return { ok: true };
}

export async function resumeAutoJob(jobId) {
  const job = await prisma.otoBlogAutoJob.findUnique({ where: { id: Number(jobId) } });
  if (!job) return { ok: false, error: 'İş bulunamadı.' };
  if (job.status === 'done') return { ok: false, error: 'Bu iş zaten bitti.' };
  if (job.status === 'cancelled') return { ok: false, error: 'Bu iş iptal edildi.' };
  if (job.status === 'queued') return { ok: false, error: 'İş sırada bekliyor, otomatik başlayacak.' };
  if (job.status === 'running' && isLeaseActive(job)) return { ok: false, error: 'İş şu an çalışıyor.' };

  const payload = parsePayload(job.payloadJson);
  if (job.status === 'error') {
    const failedPhase = getRunMeta(payload).failedPhase;
    const rollback = (
      (failedPhase && failedPhase !== 'error' && failedPhase)
      || (payload.imageToken && 'languages')
      || (payload.imagePrompt && 'image')
      || (payload.content && 'image_prompt')
      || (payload.title && 'content')
      || (job.refinedTopic && 'outline')
      || 'queued'
    );
    await writeJob(job, {
      status: 'running',
      phase: rollback,
      error: null,
      statusText: 'Devam ettiriliyor',
      payloadJson: JSON.stringify(setRunMeta(payload, {
        resumeAttempts: 0,
        failedPhase: null,
        leaseUntil: Date.now() + LEASE_MS,
        startedAt: Date.now(),
      })),
    }, 'Manuel devam ettirildi', { force: true });
  } else {
    await writeJob(job, {
      payloadJson: JSON.stringify(setRunMeta(payload, { resumeAttempts: 0, leaseUntil: Date.now() + LEASE_MS })),
    }, 'Manuel devam ettirildi');
  }

  const current = await prisma.otoBlogAutoJob.findUnique({ where: { id: job.id } });
  await enqueueAutoJobRun(await resolveAppUrl(), current.id, current.continueToken);
  return { ok: true };
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

async function writeJob(job, patch, logText, { force = false } = {}) {
  const current = await prisma.otoBlogAutoJob.findUnique({
    where: { id: job.id },
    select: { logsJson: true, status: true, payloadJson: true, phase: true },
  });
  if (
    !force
    && current
    && (current.status === 'cancelled' || current.status === 'error')
    && patch.status
    && patch.status !== 'cancelled'
    && patch.status !== 'error'
  ) {
    return current;
  }
  const logs = parseLogs(current?.logsJson);
  if (logText) logs.push({ at: new Date().toISOString(), text: logText });

  const currentPayload = parsePayload(current?.payloadJson);
  const incomingPayload = patch.payloadJson ? parsePayload(patch.payloadJson) : currentPayload;
  const currentMeta = getRunMeta(currentPayload);
  const incomingMeta = getRunMeta(incomingPayload);
  const nextPhase = patch.phase || current?.phase;
  const phaseChanged = Boolean(patch.phase && current && patch.phase !== current.phase);
  const { payloadJson: _ignored, ...rest } = patch;

  const next = await prisma.otoBlogAutoJob.update({
    where: { id: job.id },
    data: {
      ...rest,
      payloadJson: JSON.stringify(setRunMeta({ ...currentPayload, ...incomingPayload }, {
        startedAt: incomingMeta.startedAt || currentMeta.startedAt || Date.now(),
        leaseUntil: patch.status === 'error' || patch.status === 'cancelled' || patch.status === 'done'
          ? 0
          : Date.now() + LEASE_MS,
        lastPhase: nextPhase,
        resumeAttempts: phaseChanged ? 0 : (incomingMeta.resumeAttempts || currentMeta.resumeAttempts || 0),
        failedPhase: incomingMeta.failedPhase || currentMeta.failedPhase || null,
      })),
      logsJson: JSON.stringify(logs.slice(-80)),
    },
  });
  return next;
}

async function failJob(job, error) {
  const message = error?.message || String(error || 'Bilinmeyen hata');
  await failRunningJob(job, message);
}

export async function createAutoJob(client, topic, { waiting = false } = {}) {
  const token = randomBytes(24).toString('hex');
  const now = new Date().toISOString();
  const logs = [{ at: now, text: `Konu alındı: ${topic}` }];
  if (waiting) logs.push({ at: now, text: 'Sıraya alındı, önceki iş bitince başlayacak' });
  return prisma.otoBlogAutoJob.create({
    data: {
      clientId: client.id,
      continueToken: token,
      topic,
      status: 'queued',
      statusText: waiting ? 'Sırada bekliyor' : 'Sırada',
      phase: 'queued',
      payloadJson: JSON.stringify({ topic }),
      logsJson: JSON.stringify(logs),
    },
  });
}

export async function processAutoJobStep(jobId, token) {
  const job = await prisma.otoBlogAutoJob.findUnique({
    where: { id: Number(jobId) },
    include: { client: true },
  });
  if (!job || job.continueToken !== token) return { ok: false, error: 'Job bulunamadı.', clientId: job?.clientId || null };
  if (job.status === 'done' || job.status === 'error' || job.status === 'cancelled') {
    return { ok: true, done: true, phase: job.phase, clientId: job.clientId };
  }
  if (job.status === 'queued') {
    const running = await prisma.otoBlogAutoJob.findFirst({
      where: { clientId: job.clientId, status: 'running', NOT: { id: job.id } },
    });
    if (running) return { ok: true, done: false, blocked: true, phase: 'queued', clientId: job.clientId };
  }
  if (job.status === 'running' && isJobExpired(job)) {
    await failRunningJob(job, 'İş 15 dakikayı aştı.');
    return { ok: false, done: true, phase: 'error', clientId: job.clientId };
  }
  if (job.status === 'running') {
    await writeJob(job, {});
  }

  try {
    const next = await runPhase(job);
    return { ok: true, done: next.phase === 'done' || next.phase === 'error', phase: next.phase, clientId: job.clientId };
  } catch (error) {
    await failJob(job, error);
    return { ok: false, done: true, phase: 'error', error: error.message, clientId: job.clientId };
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
  const text = await withLeaseHeartbeat(job, () => geminiGenerateText({
    apiKey,
    model: ai.textModel,
    systemPrompt: ai.textSystemPrompt,
    json: true,
    userPrompt: `Konu: ${payload.topic}\nBaşlık: ${payload.title}\nMaddeler:\n${(payload.items || []).map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nBu başlık ve maddelere göre yayınlanacak tam bir blog yazısı yaz. HTML kullan (p, h2, h3, ul, li). AI yazmış gibi durmasın. Sadece JSON döndür: {"content":"<p>...</p>","meta_title":"...","meta_description":"...","short_desc":"..."}`,
  }));
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
  await writeJob(job, { statusText: 'Görsel prompt yazılıyor' }, 'Görsel prompt yazılıyor');
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

async function withLeaseHeartbeat(job, work) {
  const timer = setInterval(() => {
    writeJob(job, {}).catch(() => {});
  }, 20000);
  try {
    return await work();
  } finally {
    clearInterval(timer);
  }
}

async function makeImage(job, payload, ai) {
  await writeJob(job, { statusText: 'Fotoğraf üretiliyor' }, 'Fotoğraf üretiliyor');
  const apiKey = await getGeminiKey();
  const image = await withLeaseHeartbeat(job, () => geminiGenerateImage({
    apiKey,
    model: ai.imageModel,
    systemPrompt: ai.imageSystemPrompt,
    prompt: payload.imagePrompt,
  }));
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
  const text = await withLeaseHeartbeat(job, () => geminiGenerateText({
    apiKey,
    model: ai.textModel,
    systemPrompt: ai.textSystemPrompt,
    json: true,
    userPrompt: `Aşağıdaki Türkçe blogu ${lang.name} (${lang.code}) diline çevir. Anlamı koru, AI kokusu ekleme. Sadece JSON döndür: {"title":"...","content":"...","meta_title":"...","meta_description":"...","short_desc":"...","image_alt":"..."}\n\nKaynak:\n${JSON.stringify(draftFields(payload))}`,
  }));
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
