// Bildirim sesleri tamamen Web Audio API ile üretilir; harici dosya gerekmez.
// Pattern: { notes: [Hz...], type: 'sine'|'square'|'triangle'|'sawtooth', step: saniye, dur: saniye, gain: 0-1 }

const SOUND_PATTERNS = {
  soft:    { notes: [660, 880],                   type: 'sine',     step: 0.13, dur: 0.24, gain: 0.18 },
  bell:    { notes: [784, 988, 1175],             type: 'sine',     step: 0.13, dur: 0.30, gain: 0.20 },
  digital: { notes: [520, 520, 780],              type: 'square',   step: 0.10, dur: 0.18, gain: 0.14 },
  chime:   { notes: [523, 659, 784, 1046],        type: 'sine',     step: 0.11, dur: 0.32, gain: 0.18 },
  pop:     { notes: [880],                        type: 'triangle', step: 0.0,  dur: 0.12, gain: 0.22 },
  alert:   { notes: [880, 660, 880, 660],         type: 'square',   step: 0.12, dur: 0.16, gain: 0.16 },
  melody:  { notes: [523, 659, 784, 659, 880],    type: 'triangle', step: 0.13, dur: 0.26, gain: 0.18 },
  subtle:  { notes: [660],                        type: 'sine',     step: 0.0,  dur: 0.22, gain: 0.12 },
  urgent:  { notes: [988, 1175, 988, 1175, 988],  type: 'square',   step: 0.09, dur: 0.14, gain: 0.20 },
};

export function playNotificationSound(sound = 'soft') {
  if (sound === 'none' || typeof window === 'undefined') return false;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume?.();

    const pattern = SOUND_PATTERNS[sound] || SOUND_PATTERNS.soft;
    const { notes, type, step, dur, gain: peak } = pattern;
    const now = ctx.currentTime + 0.03;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const startAt = now + index * step;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + dur + 0.02);
    });

    const totalLength = (notes.length - 1) * step + dur + 0.3;
    setTimeout(() => ctx.close?.(), Math.max(800, totalLength * 1000));
    return true;
  } catch (error) {
    return false;
  }
}

export function getStoredNotificationSound(fallback = 'soft') {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem('notification-sound') || fallback;
}

export function storeNotificationSound(sound) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('notification-sound', sound);
  window.dispatchEvent(new CustomEvent('notification-sound-change', { detail: { sound } }));
}
