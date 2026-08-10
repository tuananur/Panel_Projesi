const PRESET_LABELS = {
  today: 'Bugün',
  yesterday: 'Dün',
  last_7d: 'Son 7 Gün',
  last_30d: 'Son 30 Gün',
  this_month: 'Bu Ay',
  last_month: 'Geçen Ay',
};

export const ANALYTICS_DATE_PRESETS = [
  { id: 'today', label: 'Bugün' },
  { id: 'yesterday', label: 'Dün' },
  { id: 'last_7d', label: 'Son 7 Gün' },
  { id: 'last_30d', label: 'Son 30 Gün' },
  { id: 'this_month', label: 'Bu Ay' },
  { id: 'last_month', label: 'Geçen Ay' },
];

function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function cloneDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(since, until) {
  const start = new Date(`${since}T12:00:00`);
  const end = new Date(`${until}T12:00:00`);
  return Math.round((end - start) / 86400000) + 1;
}

export function resolveAnalyticsDateRange(preset = 'last_30d', since = null, until = null) {
  if (since && until) {
    return {
      since,
      until,
      preset: 'custom',
      label: `${since} — ${until}`,
      dayCount: daysBetween(since, until),
    };
  }

  const now = new Date();
  const today = cloneDay(now);
  let start = cloneDay(today);
  let end = cloneDay(today);

  switch (preset) {
    case 'today':
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      end = cloneDay(start);
      break;
    case 'last_7d':
      start.setDate(start.getDate() - 6);
      break;
    case 'last_30d':
      start.setDate(start.getDate() - 29);
      break;
    case 'this_month':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = cloneDay(today);
      break;
    case 'last_month':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    default:
      start.setDate(start.getDate() - 29);
  }

  const sinceStr = fmt(start);
  const untilStr = fmt(end);
  const dayCount = daysBetween(sinceStr, untilStr);

  return {
    since: sinceStr,
    until: untilStr,
    preset,
    label: PRESET_LABELS[preset] || preset,
    dayCount,
  };
}

export function getPreviousPeriod(since, until) {
  const start = new Date(`${since}T12:00:00`);
  const end = new Date(`${until}T12:00:00`);
  const days = Math.round((end - start) / 86400000) + 1;
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - days + 1);
  return { prevSince: fmt(prevStart), prevUntil: fmt(prevEnd) };
}

/** YYYYMMDD listesi for filling empty GA daily rows */
export function enumerateDatesYmd(since, until) {
  const out = [];
  const cursor = new Date(`${since}T12:00:00`);
  const end = new Date(`${until}T12:00:00`);
  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    out.push(`${y}${m}${d}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}
