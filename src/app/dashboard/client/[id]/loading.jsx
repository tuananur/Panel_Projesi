export default function ClientLoading() {
  return (
    <div className="animate-fade-in" style={{ display: 'grid', gap: '1rem' }}>
      <div className="card" style={{ height: '92px', background: 'rgba(255,255,255,0.035)' }} />
      <div style={{ display: 'flex', gap: '0.5rem', overflow: 'hidden' }}>
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} style={{ height: '34px', width: '120px', borderRadius: '999px', background: 'rgba(255,255,255,0.07)' }} />
        ))}
      </div>
      <div className="card" style={{ minHeight: '420px', background: 'rgba(255,255,255,0.03)' }} />
    </div>
  );
}
