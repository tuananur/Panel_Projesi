const fs = require('fs');
const targetPath = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let code = fs.readFileSync(targetPath, 'utf8');

const tailoredFormStr = `
  const renderTailoredTrafficFormFields = (data, setData) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.8rem', paddingBottom: '2rem' }}>
        
        {/* Adı ve Özel Kategori */}
        <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>KAMPANYA ADI *</label>
            <input required className="form-control" value={data.name || ''} onChange={e => setData({ ...data, name: e.target.value })} placeholder="Örn: Size özel site trafiği kampanyası" style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }} />
          </div>

          <div style={{ padding: '1rem', background: 'rgba(24, 119, 242, 0.05)', borderRadius: '8px', border: '1px solid rgba(24, 119, 242, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Özel Reklam Kategorileri</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Siyaset, seçimler veya sosyal meselelerle ilgili reklam mı veriyorsunuz?</div>
              </div>
              <div onClick={() => setData({...data, isSpecialAdCategory: !data.isSpecialAdCategory})} style={{ width: '40px', height: '22px', borderRadius: '11px', background: data.isSpecialAdCategory ? '#1877f2' : 'rgba(255,255,255,0.1)', border: data.isSpecialAdCategory ? 'none' : '1px solid var(--border-color)', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: data.isSpecialAdCategory ? '2px' : '1px', left: data.isSpecialAdCategory ? '20px' : '1px', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
            {data.isSpecialAdCategory && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(24, 119, 242, 0.2)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <select style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.7rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <option>Sosyal Meseleler, Seçimler veya Siyaset</option>
                </select>
                <div style={{ padding: '0.8rem', background: '#fef2f2', border: '1px solid #f87171', borderRadius: '6px', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#dc2626', fontWeight: 'bold' }}>!</span>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600, marginBottom: '0.2rem' }}>Sorumluluk Reddi Gerekli</div>
                    <div style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '0.6rem' }}>Bu tür reklamları yayınlamak için kimliğinizi doğrulamanız gerekmektedir.</div>
                    <button type="button" onClick={() => window.open('/reauth', '_blank')} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Kimliği Onayla</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gelişmiş Özellikler (A/B Testi, Canlı Video, Ortaklık) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: data.enableABTest ? '1rem' : '0' }}>
               <div>
                 <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>A/B Testi</h4>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Farklı versiyonları karşılaştırın.</div>
               </div>
               <div onClick={() => setData({...data, enableABTest: !data.enableABTest})} style={{ width: '40px', height: '22px', borderRadius: '11px', background: data.enableABTest ? '#1877f2' : 'rgba(255,255,255,0.1)', border: data.enableABTest ? 'none' : '1px solid var(--border-color)', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: data.enableABTest ? '2px' : '1px', left: data.enableABTest ? '20px' : '1px', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
               </div>
             </div>
             {data.enableABTest && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.8rem' }}>
                 <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><option>Kreatif Testi</option><option>Hedef Kitle Testi</option></select>
                 <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}><option>7 gün</option><option>14 gün</option></select>
               </div>
             )}
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: data.enableLiveVideo ? '1rem' : '0' }}>
               <div>
                 <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Canlı Video Reklamı</h4>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Yayınınızı öne çıkarın.</div>
               </div>
               <div onClick={() => setData({...data, enableLiveVideo: !data.enableLiveVideo})} style={{ width: '40px', height: '22px', borderRadius: '11px', background: data.enableLiveVideo ? '#1877f2' : 'rgba(255,255,255,0.1)', border: data.enableLiveVideo ? 'none' : '1px solid var(--border-color)', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: data.enableLiveVideo ? '2px' : '1px', left: data.enableLiveVideo ? '20px' : '1px', transition: 'all 0.2s' }} />
               </div>
             </div>
             {data.enableLiveVideo && (
               <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Önerilen canlı video bütçesi ve planı otomatik olarak uygulanacaktır.</div>
             )}
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: data.enablePartnership ? '1rem' : '0' }}>
               <div>
                 <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Ortaklık Reklamı</h4>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Başka markalarla birlikte yayınlayın.</div>
               </div>
               <div onClick={() => setData({...data, enablePartnership: !data.enablePartnership})} style={{ width: '40px', height: '22px', borderRadius: '11px', background: data.enablePartnership ? '#1877f2' : 'rgba(255,255,255,0.1)', border: data.enablePartnership ? 'none' : '1px solid var(--border-color)', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: data.enablePartnership ? '2px' : '1px', left: data.enablePartnership ? '20px' : '1px', transition: 'all 0.2s' }} />
               </div>
             </div>
             {data.enablePartnership && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.8rem' }}>
                 <button style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}>Reklam Kodunu Girin</button>
               </div>
             )}
          </div>
        </div>

        {/* Bütçe, Plan ve Hedef Kitle */}
        <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Bütçe ve Hedef Kitle <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.85rem' }}>(Basitleştirilmiş)</span></h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>TOPLAM BÜTÇE (TL)</label>
                <input type="number" value={data.daily_budget || ''} onChange={e => setData({...data, daily_budget: e.target.value})} placeholder="Örn: 1500" style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Kampanya boyunca harcanacak maksimum tutar.</div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>YAYIN TARİHLERİ</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="date" defaultValue="2026-06-15" style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem' }} />
                  <input type="date" defaultValue="2026-06-22" style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.8rem', fontWeight: 600 }}>HEDEF KİTLE</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Konum</div>
                <div style={{ padding: '0.7rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem' }}>Türkiye</div>
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Yaş Aralığı</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select style={{ flex: 1, padding: '0.7rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}><option>18</option></select>
                  <span style={{ alignSelf: 'center' }}>-</span>
                  <select style={{ flex: 1, padding: '0.7rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}><option>65+</option></select>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>İlgi Alanları (İsteğe Bağlı)</div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>🔍</span>
                <input type="text" placeholder="Psikoloji, Terapi, Kişisel Gelişim vb." style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem 0.8rem 0.8rem 2.2rem', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Reklam Kurulumu ve Kreatif */}
        <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Reklam İçeriği</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kullanıcıların göreceği görsel, metin ve hedef bağlantı.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>DÖNÜŞÜM YERİ <span style={{ cursor: 'help' }} title="Trafiği nereye göndermek istersiniz?">i</span></label>
              <select style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                <option>İnternet Sitesi</option>
                <option>Uygulama</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>KAYNAK URL <span style={{ cursor: 'help' }} title="Kullanıcıların tıklayınca gideceği web adresi.">i</span></label>
              <input type="url" placeholder="https://terapiyle.com" style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" style={{ flex: 1, padding: '0.8rem', background: 'rgba(24, 119, 242, 0.05)', border: '1px dashed #1877f2', color: '#1877f2', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                 🖼️ Medya Yükle / Seç
              </button>
              <button type="button" style={{ flex: 1, padding: '0.8rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                 Mevcut Gönderiyi Kullan
              </button>
            </div>
            
            <textarea rows="3" placeholder="Reklamınızın ana metnini (Açıklama) buraya yazın..." style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}></textarea>
          </div>
        </div>

        {/* Takip (Gelişmiş) */}
        <div style={{ padding: '1.2rem 1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Takip ve Gelişmiş Ayarlar</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Piksel, olaylar ve URL parametreleri.</div>
            </div>
            <div onClick={() => setData({...data, showAdvancedTracking: !data.showAdvancedTracking})} style={{ fontSize: '0.8rem', color: '#1877f2', fontWeight: 600, cursor: 'pointer' }}>
              {data.showAdvancedTracking ? 'Gizle ▲' : 'Göster ▼'}
            </div>
          </div>
          {data.showAdvancedTracking && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#1877f2' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>İnternet sitesi olayları (Meta Piksel)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reklam hesabınızdaki varsayılan piksel kullanılacaktır.</div>
                  </div>
               </div>
               <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>URL PARAMETRELERİ (UTM)</label>
                  <input type="text" placeholder="utm_source=facebook&utm_medium=cpc" style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }} />
               </div>
            </div>
          )}
        </div>

      </div>
    );
  };
`;

const formRenderStrStart = code.indexOf('const renderAdsetFormFields');
if (formRenderStrStart === -1) {
  console.log('Could not find start index for injection.');
  process.exit(1);
}

// Inject tailoredFormStr right before renderAdsetFormFields
code = code.slice(0, formRenderStrStart) + tailoredFormStr + '\n\n' + code.slice(formRenderStrStart);

// Now find where activeTab is used to display the tabs content.
// `{activeTab === 'adsets' && renderAdsetFormFields`
// we need to wrap the whole tab logic.
const tabContentStart = code.indexOf("            {activeTab === 'campaigns' && (");
const tabContentEnd = code.indexOf("          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingRight: '0.5rem' }}>");

if (tabContentStart === -1 || tabContentEnd === -1) {
  console.log("Could not find tab content bounds");
  process.exit(1);
}

const wrapperStart = `
            {selectedObjective === 'Trafik' && trafficSetupType === 'custom' ? (
               renderTailoredTrafficFormFields(createFormData, setCreateFormData)
            ) : (
              <>
`;
const wrapperEnd = `
              </>
            )}
`;

code = code.slice(0, tabContentStart) + wrapperStart + code.slice(tabContentStart, tabContentEnd) + wrapperEnd + code.slice(tabContentEnd);

fs.writeFileSync(targetPath, code, 'utf8');
console.log('Tailored Traffic UI injected successfully!');
