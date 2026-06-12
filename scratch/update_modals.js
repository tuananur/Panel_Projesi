const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace showObjectiveModal
const objectiveStartStr = `{showObjectiveModal && activeTab === 'campaigns' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '0', overflow: 'hidden', background: 'var(--bg-primary)' }}>`;
          
const objectiveEndStr = `          </div>
        </div>
      )}`;

const newObjectiveModal = `{showObjectiveModal && activeTab === 'campaigns' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '750px', padding: '0', overflow: 'hidden', background: 'var(--bg-primary)', borderRadius: '8px' }}>
            <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Bir kampanya amacı seçin</h3>
              <button onClick={() => setShowObjectiveModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1, padding: '1rem', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '50vh', overflowY: 'auto' }}>
                {objectives.map(obj => (
                  <label 
                    key={obj.id}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '1rem', 
                      padding: '0.6rem',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      background: selectedObjective === obj.id ? 'var(--bg-secondary)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="objective"
                      value={obj.id}
                      checked={selectedObjective === obj.id}
                      onChange={() => setSelectedObjective(obj.id)}
                      style={{ margin: 0, width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1877f2' }} 
                    />
                    <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      {obj.icon}
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {obj.label}
                    </div>
                  </label>
                ))}
              </div>
              
              <div style={{ flex: 1.2, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                <div style={{ width: '100%', maxWidth: '250px', marginBottom: '1.5rem', position: 'relative' }}>
                  <img src="https://cdn-icons-png.flaticon.com/512/854/854878.png" alt="Map Illustration" style={{ width: '100%', height: 'auto', opacity: 0.2 }} />
                  <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '80px', height: '80px', background: '#fff', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <img src="https://cdn-icons-png.flaticon.com/512/73/73196.png" alt="Compass" style={{ width: '40px', height: '40px', opacity: 0.6 }} />
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.5', padding: '0 1rem' }}>
                  Kampanya amacınız, reklamlarınızı yayınlayarak ulaşmayı amaçladığınız işletme hedefidir. Daha fazla bilgi için fareyi her birinin üzerine getirin.
                </div>
              </div>
            </div>
            
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--bg-primary)' }}>
              <button onClick={() => setShowObjectiveModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>İptal</button>
              <button onClick={() => {
                setShowObjectiveModal(false);
                if (selectedObjective === 'Trafik') setShowTrafficSetupModal(true);
              }} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#1877f2', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Devam</button>
            </div>
          </div>
        </div>
      )}`;

const objStartIdx = content.indexOf(objectiveStartStr);
if (objStartIdx !== -1) {
  const objEndIdx = content.indexOf(objectiveEndStr, objStartIdx);
  if (objEndIdx !== -1) {
    const beforeObj = content.substring(0, objStartIdx);
    const afterObj = content.substring(objEndIdx + objectiveEndStr.length);
    content = beforeObj + newObjectiveModal + afterObj;
  }
}

// 2. Replace showTrafficSetupModal
const trafficStartStr = `{showTrafficSetupModal && activeTab === 'campaigns' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '0', overflow: 'hidden', background: 'var(--bg-primary)' }}>`;
          
const trafficEndStr = `          </div>
        </div>
      )}`;

const newTrafficModal = `{showTrafficSetupModal && activeTab === 'campaigns' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '650px', padding: '0', overflow: 'hidden', background: 'var(--bg-primary)', borderRadius: '8px' }}>
            <div style={{ padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Bir kampanya kurulumu seçin</h3>
              <button onClick={() => setShowTrafficSetupModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', maxHeight: '75vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>Amacı trafik olan kampanyanızı, özelleştirilmiş ve kolay bir kurulum kullanarak veya manuel olarak oluşturun. Öneriler, reklam hesabınızdaki son hareketlere göre değişebilir.</p>
              
              <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', gap: '0.8rem', alignItems: 'flex-start', background: '#fff' }}>
                 <div style={{ marginTop: '2px' }}><AlertCircle size={16} color="var(--text-secondary)" /></div>
                 <div>
                   <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Bu öneriyi neden görüyorum?</div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bu kurulum, reklam hesabınızdaki bilgilere ve hareketlere dayalı olarak önerilmiştir.</div>
                 </div>
                 <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={16} /></button>
              </div>

              <label 
                style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', border: trafficSetupType === 'custom' ? '1px solid #1877f2' : '1px solid transparent', borderRadius: '8px', cursor: 'pointer', background: trafficSetupType === 'custom' ? '#e7f3ff' : 'transparent', transition: 'background 0.2s' }}
              >
                <input 
                  type="radio" 
                  name="trafficSetup"
                  checked={trafficSetupType === 'custom'}
                  onChange={() => setTrafficSetupType('custom')}
                  style={{ margin: 0, width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1877f2', flexShrink: 0 }} 
                />
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: trafficSetupType === 'custom' ? '#d0e5fb' : '#e7f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   <img src="https://cdn-icons-png.flaticon.com/512/3256/3256083.png" alt="custom" style={{ width: '25px', height: '25px', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Size özel site trafiği kampanyası</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.4' }}>Hızlıca, en uygun fiyata daha fazla site trafiği almanıza yardımcı olacak şekilde optimize edilmiş bir kampanya oluşturun.<br/>Ön ayarlarda Advantage+ reklam alanları, en yüksek hacim teklif stratejisi ve daha fazlası bulunur.</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                    <span style={{ padding: '0.3rem 0.6rem', background: '#f1f5f9', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Basitleştirilmiş</span>
                    <span style={{ padding: '0.3rem 0.6rem', background: '#f1f5f9', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Özelleştirilmiş</span>
                    <span style={{ padding: '0.3rem 0.6rem', background: '#f1f5f9', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>En iyi uygulamalar</span>
                  </div>
                </div>
              </label>

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '0' }} />

              <label 
                style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', border: trafficSetupType === 'manual' ? '1px solid #1877f2' : '1px solid transparent', borderRadius: '8px', cursor: 'pointer', background: trafficSetupType === 'manual' ? '#e7f3ff' : 'var(--bg-secondary)', transition: 'background 0.2s' }}
              >
                <input 
                  type="radio" 
                  name="trafficSetup"
                  checked={trafficSetupType === 'manual'}
                  onChange={() => setTrafficSetupType('manual')}
                  style={{ margin: 0, width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1877f2', flexShrink: 0 }} 
                />
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                   <img src="https://cdn-icons-png.flaticon.com/512/3524/3524335.png" alt="manual" style={{ width: '25px', height: '25px', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Manuel trafik kampanyası</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Tüm ayarlar üzerinde daha hassas kontrol sağlamak için sıfırdan bir trafik kampanyası oluşturun.</div>
                </div>
              </label>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--bg-primary)' }}>
              <button onClick={() => setShowTrafficSetupModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Geri</button>
              <button onClick={() => setShowTrafficSetupModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#0064d1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Devam</button>
            </div>
          </div>
        </div>
      )}`;

const trafStartIdx = content.indexOf(trafficStartStr);
if (trafStartIdx !== -1) {
  const trafEndIdx = content.indexOf(trafficEndStr, trafStartIdx);
  if (trafEndIdx !== -1) {
    const beforeTraf = content.substring(0, trafStartIdx);
    const afterTraf = content.substring(trafEndIdx + trafficEndStr.length);
    content = beforeTraf + newTrafficModal + afterTraf;
  }
}

fs.writeFileSync(filePath, content);
console.log('Modals updated');
