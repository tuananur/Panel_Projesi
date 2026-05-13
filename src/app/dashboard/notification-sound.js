export function playNotificationSound(sound = 'soft') {
  if (sound === 'none' || typeof window === 'undefined') return false;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume?.();

    const patterns = {
      soft: [660, 880],
      bell: [784, 988, 1175],
      digital: [520, 520, 780],
    };
    const notes = patterns[sound] || patterns.soft;
    const now = ctx.currentTime + 0.03;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = sound === 'digital' ? 'square' : 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + index * 0.13);
      gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.13 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.13 + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.13);
      osc.stop(now + index * 0.13 + 0.26);
    });

    setTimeout(() => ctx.close?.(), 1200);
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
