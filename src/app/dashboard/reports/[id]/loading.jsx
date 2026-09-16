// Rapor sayfası Google API'lerini beklediği için navigasyon anında bu iskelet gösterilir.
export default function Loading() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '820px' }}>
      <div className="report-skeleton" style={{ width: '90px', height: '14px', marginBottom: '1.5rem' }} />
      <div className="report-skeleton" style={{ width: '260px', height: '28px', marginBottom: '1rem' }} />

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div className="report-skeleton" style={{ width: '110px', height: '26px', borderRadius: '999px' }} />
        <div className="report-skeleton" style={{ width: '140px', height: '26px', borderRadius: '999px' }} />
        <div className="report-skeleton" style={{ width: '120px', height: '26px', borderRadius: '999px' }} />
      </div>

      <div
        className="card"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 2rem' }}
      >
        <div className="spinner-container" style={{ width: '60px', height: '60px' }}>
          <div className="spinner" style={{ width: '44px', height: '44px' }} />
          <div className="spinner-inner" style={{ width: '28px', height: '28px' }} />
        </div>
        <strong style={{ fontSize: '1rem', animation: 'pulse-text 1.8s ease-in-out infinite' }}>
          Rapor verileri yükleniyor
        </strong>
        <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: '420px' }}>
          Google Analytics ve Search Console sorguları yanıt verene kadar sürebilir. Ubersuggest verileri
          veritabanından okunur.
        </p>
      </div>

      {[0, 1].map((index) => (
        <div key={index} className="card" style={{ marginTop: '1.5rem' }}>
          <div className="report-skeleton" style={{ width: '180px', height: '18px', marginBottom: '1.25rem' }} />
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.6rem 0',
                borderBottom: '1px dashed var(--border-color)',
              }}
            >
              <div className="report-skeleton" style={{ width: `${45 + row * 8}%`, height: '12px' }} />
              <div className="report-skeleton" style={{ width: '70px', height: '12px' }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
