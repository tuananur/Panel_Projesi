export default function WeeklyStats({ tasks, schedule, platforms }) {
  const now = new Date();
  const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Calculate start (Monday) and end (Sunday) of current week
  const startOfWeek = new Date(now);
  const diff = now.getDay() === 0 ? -6 : 1 - now.getDay();
  startOfWeek.setDate(now.getDate() + diff);
  startOfWeek.setHours(0,0,0,0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23,59,59,999);

  // 1. Count completed tasks from DB for this week
  const completed = tasks.filter(t => {
    const d = new Date(t.date);
    return d >= startOfWeek && d <= endOfWeek && t.status === true;
  }).length;

  // 2. Count total TARGET tasks for this week based on schedule
  let totalTarget = 0;
  platforms.forEach(p => {
    const platformSchedule = schedule[p] || [];
    totalTarget += platformSchedule.length;
  });

  // 3. Add any "Special/Extra" tasks that are completed but not in regular schedule
  // (Optional: for simplicity, let's just use the max of (completed, totalTarget) or similar)
  // Actually, let's just use totalTarget as the goal.
  const displayTotal = Math.max(totalTarget, completed);

  const percentage = displayTotal > 0 ? Math.round((completed / displayTotal) * 100) : 0;

  return (
    <div className="card" style={{ padding: '0.75rem 1rem', minWidth: '180px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div>
        <h3 style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Haftalık Durum</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{completed}/{displayTotal}</span>
          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>%{percentage}</span>
        </div>
      </div>
      <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: 'var(--accent-primary)', transition: 'width 0.5s ease' }}></div>
      </div>
    </div>
  );
}
