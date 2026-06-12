const renderBudgetPlanning = (data, setData) => (
  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
    <div style={{ color: '#1877f2', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginBottom: '0.8rem' }} onClick={() => setData({ ...data, hideOptions: !data.hideOptions })}>
      {data.hideOptions ? 'Seçenekleri Göster ▴' : 'Seçenekleri Gizle ▴'}
    </div>
    
    {!data.hideOptions && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>Bütçe planlama <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Belirli gün veya saatlerde bütçenizi artırın.</div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={data.planIncreases || false} onChange={e => setData({ ...data, planIncreases: e.target.checked })} style={{ cursor: 'pointer' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Bütçe artışlarını planlayın</span>
            </div>
            <div style={{ position: 'relative' }}>
              <button 
                type="button" 
                onClick={() => setData({ ...data, gorDropdownOpen: !data.gorDropdownOpen })}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Gör ▾
              </button>
              {data.gorDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: '220px', padding: '0.5rem 0' }}>
                  <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Filtrele</div>
                  <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span>Yaklaşan girişler</span><span style={{ background: '#e6f4ea', color: '#137333', fontSize: '0.7rem', padding: '0 6px', borderRadius: '10px', fontWeight: 600 }}>1</span>
                  </div>
                  <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span>Tamamlanan girişler</span><span style={{ background: '#f1f3f4', color: '#5f6368', fontSize: '0.7rem', padding: '0 6px', borderRadius: '10px', fontWeight: 600 }}>0</span>
                  </div>
                  <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', background: '#e7f3ff', cursor: 'pointer' }}>
                    <span>Tüm girişler</span><span style={{ background: '#f0f2f5', color: '#1c1e21', border: '1px solid #ced0d4', fontSize: '0.7rem', padding: '0 6px', borderRadius: '10px', fontWeight: 600 }}>1</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.4rem 0' }}></div>
                  <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sırala</div>
                  <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><span style={{ fontSize: '1rem', lineHeight: '10px' }}>↑</span> En yeniden en eskiye sırala</div>
                  <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><span style={{ fontSize: '1rem', lineHeight: '10px' }}>↓</span> En eskiden en yeniye sırala</div>
                </div>
              )}
            </div>
          </div>

          {data.planIncreases && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.8rem' }}>
              {(data.planIncreasePeriods || [1]).map((periodId) => (
                <div key={periodId} style={{ padding: '1rem', background: 'rgba(24, 119, 242, 0.05)', borderRadius: '8px', border: '1px solid rgba(24, 119, 242, 0.2)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                    Bütçe artışı için süre <span style={{ fontSize: '0.85rem' }}>⌃</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>Başlangıç</div>
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        <input type="text" defaultValue="Haz 13, 2026" className="form-control" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                        <input type="text" defaultValue="00:00" className="form-control" style={{ width: '60px', padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>-</div>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>Bitiş</div>
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        <input type="text" defaultValue="Haz 14, 2026" className="form-control" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                        <input type="text" defaultValue="00:00" className="form-control" style={{ width: '60px', padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <div 
                        onClick={() => setData({ ...data, [`budgetIncreaseDropdownOpen_${periodId}`]: !data[`budgetIncreaseDropdownOpen_${periodId}`] })}
                        style={{ padding: '0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                      >
                        {data[`budgetIncreaseType_${periodId}`] || 'Günlük bütçeyi değer miktarına göre artır (TL)'}
                        <span style={{ fontSize: '0.7rem' }}>▼</span>
                      </div>
                      {data[`budgetIncreaseDropdownOpen_${periodId}`] && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '0.4rem 0' }}>
                          {[
                            'Günlük bütçeyi değer miktarına göre artır (TL)',
                            'Günlük bütçeyi belirli bir oranda (%) artır'
                          ].map(opt => (
                            <div 
                              key={opt}
                              onClick={() => setData({ ...data, [`budgetIncreaseType_${periodId}`]: opt, [`budgetIncreaseDropdownOpen_${periodId}`]: false })}
                              style={{ padding: '0.6rem 0.8rem', display: 'flex', gap: '0.6rem', alignItems: 'center', cursor: 'pointer', background: (data[`budgetIncreaseType_${periodId}`] || 'Günlük bütçeyi değer miktarına göre artır (TL)') === opt ? 'rgba(24,119,242,0.1)' : 'transparent', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                            >
                              <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: (data[`budgetIncreaseType_${periodId}`] || 'Günlük bütçeyi değer miktarına göre artır (TL)') === opt ? '4px solid #1877f2' : '1px solid var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }} />
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>{opt}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', width: '90px' }}>
                      <span style={{ fontSize: '0.75rem', paddingLeft: '0.5rem', color: 'var(--text-secondary)' }}>{data[`budgetIncreaseType_${periodId}`]?.includes('%') ? '%' : 'TL'}</span>
                      <input type="text" defaultValue={data[`budgetIncreaseType_${periodId}`]?.includes('%') ? '20' : '7,50'} style={{ width: '100%', padding: '0.5rem 0.2rem', fontSize: '0.75rem', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)' }} />
                      {!data[`budgetIncreaseType_${periodId}`]?.includes('%') && (
                        <span style={{ fontSize: '0.75rem', paddingRight: '0.5rem', color: 'var(--text-secondary)' }}>TRY</span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>Meta 13 Haz ile 14 Haz arasında günde 37,50 TL harcamayı amaçlayacak (7,50 TL artış).</div>
                  <button 
                    type="button" 
                    onClick={() => {
                      const current = data.planIncreasePeriods || [1];
                      if(current.length > 1) {
                        setData({ ...data, planIncreasePeriods: current.filter(id => id !== periodId) });
                      }
                    }}
                    style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}
                  >
                    <X size={12} /> Bu dönemi kaldır
                  </button>
                </div>
              ))}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    const current = data.planIncreasePeriods || [1];
                    if(current.length < 50) {
                      setData({ ...data, planIncreasePeriods: [...current, Math.max(...current) + 1] });
                    }
                  }}
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}
                >
                  <span style={{ fontSize: '1rem', lineHeight: '10px' }}>⊕</span> Başka bir zaman aralığı ekle
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{(data.planIncreasePeriods || [1]).length}/50 zaman dilimi</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
