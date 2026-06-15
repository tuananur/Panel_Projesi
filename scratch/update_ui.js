const fs = require('fs');
const targetPath = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let code = fs.readFileSync(targetPath, 'utf8');

const newRenderAdset = `
  const renderAdsetFormFields = (data, setData, isCreate, isEditing) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.8rem' }}>
        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div><h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Bütçe ve Plan</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Bütçe <span style={{ cursor: 'help' }} title="Günlük veya toplam kampanya bütçesi belirleyin.">i</span></label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <option>Günlük Bütçe</option><option>Toplam Bütçe</option>
                </select>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type="number" value={data.daily_budget || ''} onChange={e => setData({...data, daily_budget: e.target.value})} placeholder="50,00" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid #1877f2', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem', textAlign: 'right', paddingRight: '2.5rem' }} />
                  <span style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TRY</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>Plan</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.8rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Başlangıç Tarihi</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="date" defaultValue="2026-06-15" style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem' }} />
                  <input type="time" defaultValue="12:28" style={{ width: '100px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Bitiş Tarihi</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Bir bitiş tarihi belirleyin</span>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
              <div style={{ color: '#1877f2', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginBottom: '0.8rem' }} onClick={() => setData({...data, showBudgetPlan: !data.showBudgetPlan})}>
                {data.showBudgetPlan ? 'Seçenekleri Gizle ▲' : 'Seçenekleri Göster ▼'}
              </div>
              {data.showBudgetPlan && (
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Bütçe planlama <span style={{ cursor: 'help' }} title="Belirli gün ve saatlerde reklam harcamalarınızı artırın veya azaltın.">i</span></div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Belirli gün veya saatlerde bütçenizi artırın.</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Bütçe artışlarını planlayın</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Hedef Kitle</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Reklamlarınızı kimlerin görmesini istediğinizi tanımlayın. <span style={{ color: '#1877f2', cursor: 'pointer' }}>Daha fazla bilgi alın</span></div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem 1rem', borderBottom: '2px solid #1877f2', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Yeni Hedef Kitle Oluştur</div>
            <div style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Kaydedilen hedef kitleyi kullan ▼</div>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Özel Hedef Kitleler <span style={{ cursor: 'help' }} title="Daha önce etkileşime giren kişileri dahil edin.">i</span></label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>🔍</span>
              <input type="text" placeholder="Mevcut hedef kitleleri arayın" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.65rem 0.65rem 2rem', borderRadius: '4px', fontSize: '0.85rem' }} />
            </div>
            <button type="button" style={{ marginTop: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Hariç tutulacakları ekle</button>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Konumlar <span style={{ cursor: 'help' }} title="Reklamlarınızın yayınlanacağı ülke veya şehirler.">i</span></label>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Dahil edilen konum:</div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}><li>Türkiye</li></ul>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Yaş <span style={{ cursor: 'help' }} title="Hedef kitlenizin yaş aralığı.">i</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <option>18</option><option>20</option>
                </select>
                <span>-</span>
                <select style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <option>65+</option><option>50</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Cinsiyet <span style={{ cursor: 'help' }} title="Hangi cinsiyete reklam göstermek istediğinizi seçin.">i</span></label>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}><input type="radio" name="gender" defaultChecked /> Tümü</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}><input type="radio" name="gender" /> Erkekler</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}><input type="radio" name="gender" /> Kadınlar</label>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Detaylı Hedefleme <span style={{ cursor: 'help' }} title="İlgi alanları, demografik bilgiler veya davranışlara göre hedefleme.">i</span></label>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Şunlarla eşleşen kişileri dahil et:</div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>🔍</span>
              <input type="text" placeholder="Demografik bilgiler, ilgi alanları veya davranışlar ekleyin" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.65rem 0.65rem 2rem', borderRadius: '4px', fontSize: '0.85rem' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Diller <span style={{ cursor: 'help' }} title="Kullanıcıların dilleri.">i</span></label>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Tüm diller</div>
          </div>
        </div>
      </div>
    );
  };
`;

const newRenderAd = `
  const renderAdFormFields = (data, setData, isCreate, isEditing) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.8rem' }}>
        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Reklam Şeffaflığı</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.4' }}>
              Reklamveren ve ödeyen hakkında bilgi vererek hedef kitleniz için şeffaflığı artırın. Bu kişilerin adları, konumları ve referansları, reklamlar yayınlanırken Meta Reklam Kütüphanesinde herkese açık olarak gösterilecek. <span style={{ color: '#1877f2', cursor: 'pointer' }}>Reklam şeffaflığı hakkında</span>
            </div>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Reklamveren (isteğe bağlı) <span style={{ cursor: 'help' }} title="Reklamı veren kurum veya kişinin adı.">i</span></label>
            <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem' }}>
              <option>Reklamvereni seçin</option><option>Terapimle</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
             <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: '#e5e7eb', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
             </div>
             <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reklamveren ve ödeyen farklı</span>
          </div>
        </div>

        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Kimlik</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Reklamınızda kullanılacak profiller.</div>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Facebook Sayfası <span style={{ cursor: 'help' }} title="Reklamı yayınlayacak Facebook sayfası.">i</span></label>
            <select value={data.page_id || 'Terapimle'} onChange={e => setData({...data, page_id: e.target.value})} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem' }}>
              <option value="Terapimle">Terapimle</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Sorumluluk reddi</label>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>-</div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.2rem' }}>Reklam yayınlamak için sorumluluk reddi gerekli</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '0.6rem' }}>Sosyal meselelerle, seçimlerle veya siyasetle ilgili reklamlar yayınlamak için onaylı bir sorumluluk reddine ihtiyacınız var. <span style={{ color: '#1877f2', cursor: 'pointer' }}>Daha fazla bilgi</span></div>
                <button type="button" style={{ background: '#1877f2', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Sorumluluk Reddi Oluştur</button>
              </div>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Instagram profili <span style={{ cursor: 'help' }} title="Reklamı yayınlayacak Instagram profili.">i</span></label>
            <select value={data.instagram_actor_id || 'terapiylecom'} onChange={e => setData({...data, instagram_actor_id: e.target.value})} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem' }}>
              <option value="terapiylecom">terapiylecom</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Threads profili <span style={{ cursor: 'help' }} title="Reklamı yayınlayacak Threads profili.">i</span></label>
            <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem' }}>
              <option>Bir Threads profili seç</option>
            </select>
          </div>
        </div>

        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Reklam Kurulumu</h3>
          <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            <option>Mevcut gönderiyi kullan</option><option>Yeni reklam oluştur</option>
          </select>
        </div>

        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Reklam kaynakları</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.4' }}>
              Reklamınıza işlem yapmayı teşvik edebilecek daha fazla bilgi eklemek için reklam kaynaklarını bağlayın. <span style={{ color: '#1877f2', cursor: 'pointer' }}>Reklam kaynakları hakkında</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Katalog <span style={{ cursor: 'help' }} title="Ürün katalog bağlantısı.">i</span></label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                <option>Bağlantıda değil</option>
              </select>
              <button type="button" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Görüntüle</button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Kaynak URL'si <span style={{ cursor: 'help' }} title="Otomatik algılamalar için site URL'si.">i</span></label>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Ekleme yapabileceğiniz site bağlantılarını otomatik olarak bulmak için bir URL girin.</div>
            <input type="url" placeholder="http://www.example.com/page" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
             <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Reklam kaynakları (0/1)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Kapak: Site bağlantıları</div>
             </div>
             <button type="button" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Düzenle</button>
          </div>
        </div>

        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Reklam Kreatifi</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.4' }}>
              Reklam metninizi, medyanızı ve iyileştirmelerinizi seçin ve optimize edin.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button type="button" style={{ flex: 1, background: 'transparent', border: '1px solid var(--text-primary)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>🖼️ Gönderi seç</button>
            <button type="button" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>+ Gönderi oluştur</button>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px dashed var(--text-secondary)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>Gönderi gereklidir. Yayınlamak için gönderi seçin veya oluşturun.</div>
          </div>
          <div style={{ color: '#1877f2', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Gönderi Kodunu Girin</div>
        </div>

        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Takip</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.4' }}>
              Takip edilecek dönüşüm olaylarını seçin. Bu reklam hesabının seçili dönüşüm veri seti varsayılan olarak takip edilecek.
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>İnternet sitesi olayları <span style={{ cursor: 'help' }} title="Meta Piksel olayları">i</span></div>
            <button type="button" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Ayarla</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" style={{ width: '16px', height: '16px' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Uygulama Olayları</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Çevrimdışı olaylar <span style={{ cursor: 'help' }} title="Mağaza ziyaretleri vb.">i</span></div>
            <button type="button" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Ayarla</button>
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}></div>
          <div style={{ color: '#1877f2', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginBottom: '0.5rem' }} onClick={() => setData({...data, showAdvancedTracking: !data.showAdvancedTracking})}>
            {data.showAdvancedTracking ? 'Gelişmiş ayarları gizle ▲' : 'Gelişmiş ayarları göster ▼'}
          </div>
          {data.showAdvancedTracking && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>URL Parametreleri <span style={{ cursor: 'help' }} title="URL'nize eklenecek UTM etiketleri.">i</span></label>
                <input type="text" placeholder="anahtar1=deger1&anahtar2=deger2" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem' }} />
                <div style={{ color: '#1877f2', fontSize: '0.75rem', marginTop: '0.4rem', cursor: 'pointer' }}>Bir URL parametresi oluşturun</div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>View Etiketleri <span style={{ cursor: 'help' }} title="Gösterim tabanlı takip için kullanılır.">i</span></label>
                <textarea rows="3" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem', borderRadius: '4px', fontSize: '0.85rem', resize: 'vertical' }}></textarea>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>Üçüncü taraf raporlama araçları</label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', lineHeight: '1.4' }}>
                  Meta alışverişleri Google raporlarınıza dahil edilmeyebilir. Kullanıcıları internet sitenize veya mağazanıza yönlendiren reklamlardaki işlemleri ölçmek için hesabınızı bağlayın. <span style={{ color: '#1877f2', cursor: 'pointer' }}>Daha fazla bilgi alın</span>
                </div>
                <button type="button" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 1.2rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Bağla</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
`;

const renderAdFormFieldsStart = code.indexOf('const renderAdFormFields =');
const renderAdFormFieldsEnd = code.indexOf('const renderAudienceCard =');

if (renderAdFormFieldsStart === -1 || renderAdFormFieldsEnd === -1) {
  console.log("Could not find boundaries for renderAdFormFields");
  process.exit(1);
}

let newCode = code.slice(0, renderAdFormFieldsStart) + newRenderAdset + '\n' + newRenderAd + '\n' + code.slice(renderAdFormFieldsEnd);

const adsetBlockStart = newCode.indexOf("            {activeTab === 'adsets' && (");
if (adsetBlockStart !== -1) {
  const adsetBlockEnd = newCode.indexOf("            {activeTab === 'ads' && ", adsetBlockStart);
  if (adsetBlockEnd !== -1) {
    const replacement = "            {activeTab === 'adsets' && renderAdsetFormFields(createFormData, setCreateFormData, true, true)}\n";
    newCode = newCode.slice(0, adsetBlockStart) + replacement + newCode.slice(adsetBlockEnd);
  } else {
    console.log("Could not find end of adset block");
  }
} else {
  console.log("Could not find start of adset block");
}

fs.writeFileSync(targetPath, newCode, 'utf8');
console.log("Successfully updated UI!");
