export function getMonthDateRange(month, year) {
  const m = Number(month);
  const y = Number(year);
  const since = `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const until = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const prevMonth = m === 0 ? 11 : m - 1;
  const prevYear = m === 0 ? y - 1 : y;
  const prevSince = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-01`;
  const prevLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
  const prevUntil = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`;

  return { since, until, prevSince, prevUntil, month: m, year: y };
}

export function isCurrentMonthRange(since, until) {
  const now = new Date();
  const start = new Date(`${since}T00:00:00`);
  const end = new Date(`${until}T23:59:59`);
  return now >= start && now <= end;
}
