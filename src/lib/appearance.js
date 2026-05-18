// Tema ve vurgu rengi için tek doğruluk kaynağı. UI ve server action paylaşır.

export const THEME_OPTIONS = [
  { id: 'dark', label: 'Karanlık', description: 'Göz dostu gece modu' },
  { id: 'light', label: 'Aydınlık', description: 'Klasik beyaz görünüm' },
];

export const ALLOWED_THEMES = THEME_OPTIONS.map((t) => t.id);

export const ACCENT_PRESETS = [
  // Soğuk
  { id: 'blue', label: 'Okyanus Mavisi', color: '#3b82f6', hover: '#2563eb', gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', category: 'cool' },
  { id: 'sky', label: 'Gökyüzü', color: '#0ea5e9', hover: '#0284c7', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', category: 'cool' },
  { id: 'cyan', label: 'Siber Turkuaz', color: '#06b6d4', hover: '#0891b2', gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', category: 'cool' },
  { id: 'teal', label: 'Deniz Yeşili', color: '#14b8a6', hover: '#0d9488', gradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)', category: 'cool' },
  { id: 'emerald', label: 'Zümrüt', color: '#10b981', hover: '#059669', gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', category: 'cool' },
  { id: 'green', label: 'Doğa Yeşili', color: '#22c55e', hover: '#16a34a', gradient: 'linear-gradient(135deg, #22c55e 0%, #84cc16 100%)', category: 'cool' },
  { id: 'indigo', label: 'Çivit', color: '#6366f1', hover: '#4f46e5', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', category: 'cool' },
  { id: 'violet', label: 'Menekşe', color: '#8b5cf6', hover: '#7c3aed', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', category: 'cool' },
  { id: 'purple', label: 'Mistisizm Moru', color: '#a855f7', hover: '#9333ea', gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', category: 'cool' },

  // Sıcak
  { id: 'pink', label: 'Gül Pembesi', color: '#ec4899', hover: '#db2777', gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', category: 'warm' },
  { id: 'rose', label: 'Gül Kurusu', color: '#f43f5e', hover: '#e11d48', gradient: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)', category: 'warm' },
  { id: 'red', label: 'Enerji Kırmızısı', color: '#ef4444', hover: '#dc2626', gradient: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', category: 'warm' },
  { id: 'fuchsia', label: 'Füşya', color: '#d946ef', hover: '#c026d3', gradient: 'linear-gradient(135deg, #d946ef 0%, #a855f7 100%)', category: 'warm' },
  { id: 'orange', label: 'Gün Batımı', color: '#f97316', hover: '#ea580c', gradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)', category: 'warm' },
  { id: 'amber', label: 'Kehribar', color: '#f59e0b', hover: '#d97706', gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', category: 'warm' },
  { id: 'gold', label: 'Lüks Altın', color: '#eab308', hover: '#ca8a04', gradient: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)', category: 'warm' },
  { id: 'lime', label: 'Misket Limonu', color: '#84cc16', hover: '#65a30d', gradient: 'linear-gradient(135deg, #84cc16 0%, #22c55e 100%)', category: 'warm' },

  // Nötr
  { id: 'slate', label: 'Grafit', color: '#64748b', hover: '#475569', gradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', category: 'neutral' },
  { id: 'stone', label: 'Taş', color: '#78716c', hover: '#57534e', gradient: 'linear-gradient(135deg, #78716c 0%, #44403c 100%)', category: 'neutral' },
];

export const ACCENT_CATEGORIES = [
  { id: 'cool', label: 'Soğuk' },
  { id: 'warm', label: 'Sıcak' },
  { id: 'neutral', label: 'Nötr' },
];

export const ALLOWED_ACCENTS = new Set([...ACCENT_PRESETS.map((a) => a.id), 'custom']);

export const DEFAULT_APPEARANCE = { theme: 'dark', accent: 'blue', customColor: null };

const HEX_RE = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export function isValidHexColor(value) {
  return typeof value === 'string' && HEX_RE.test(value.trim());
}

export function normalizeHexColor(value) {
  if (!isValidHexColor(value)) return null;
  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 4) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return trimmed;
}

export function sanitizeAppearance(input = {}) {
  const theme = ALLOWED_THEMES.includes(input.theme) ? input.theme : DEFAULT_APPEARANCE.theme;
  const accent = ALLOWED_ACCENTS.has(input.accent) ? input.accent : DEFAULT_APPEARANCE.accent;
  const customColor = accent === 'custom' ? normalizeHexColor(input.customColor) : null;
  if (accent === 'custom' && !customColor) {
    return { theme, accent: DEFAULT_APPEARANCE.accent, customColor: null };
  }
  return { theme, accent, customColor };
}

// Bildirim sesleri için ortak allowlist — UI ve server action paylaşır.
export const NOTIFICATION_SOUND_OPTIONS = [
  { value: 'soft', label: 'Yumuşak', description: 'Hafif ve dengeli bir bildirim sesi' },
  { value: 'bell', label: 'Zil', description: 'Klasik üç notalı zil' },
  { value: 'digital', label: 'Dijital', description: 'Kısa, dijital tonlu uyarı' },
  { value: 'chime', label: 'Çıngırak', description: 'Hafif yükselen ferah ton' },
  { value: 'pop', label: 'Pop', description: 'Kısacık balon patlama efekti' },
  { value: 'alert', label: 'Alarm', description: 'Dikkat çekici çift ton' },
  { value: 'melody', label: 'Melodi', description: 'Beş notalı kısa ezgi' },
  { value: 'subtle', label: 'Sade', description: 'Çok hafif tek nota' },
  { value: 'urgent', label: 'Acil', description: 'Hızlı tekrarlı uyarı' },
  { value: 'none', label: 'Sessiz', description: 'Hiç ses çalma' },
];

export const ALLOWED_NOTIFICATION_SOUNDS = new Set(NOTIFICATION_SOUND_OPTIONS.map((s) => s.value));
