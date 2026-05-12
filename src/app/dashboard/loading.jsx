export default function DashboardLoading() {
  return (
    <div className="animate-fade-in" style={{ display: 'grid', gap: '1.25rem' }}>
      <div style={{ height: '34px', width: '240px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ height: '18px', width: '360px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="card" style={{ height: '150px', background: 'rgba(255,255,255,0.035)' }} />
        ))}
      </div>
    </div>
  );
}
