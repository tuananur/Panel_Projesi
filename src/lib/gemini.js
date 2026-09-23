function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text).filter(Boolean).join('\n').trim();
}

function extractImage(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const image = parts.find((part) => part.inlineData?.data);
  if (!image) return null;
  return {
    mimeType: image.inlineData.mimeType || 'image/png',
    base64: image.inlineData.data,
  };
}

export function parseModelJson(text) {
  const raw = String(text || '').trim();
  const fenced = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(fenced);
}

export async function geminiGenerateText({ apiKey, model, systemPrompt, userPrompt, json = false }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.85,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  };
  if (systemPrompt?.trim()) {
    body.systemInstruction = { parts: [{ text: systemPrompt.trim() }] };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini yazı hatası (${response.status})`);
  }
  const text = extractText(data);
  if (!text) throw new Error('Gemini boş yazı döndü.');
  return text;
}

export async function geminiGenerateImage({ apiKey, model, systemPrompt, prompt }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const fullPrompt = [systemPrompt?.trim(), prompt?.trim()].filter(Boolean).join('\n\n');
  const body = {
    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini görsel hatası (${response.status})`);
  }
  const image = extractImage(data);
  if (!image) throw new Error('Gemini görsel döndürmedi. Görsel modelini kontrol et.');
  return image;
}
