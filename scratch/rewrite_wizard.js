const fs = require('fs');

const targetPath = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let content = fs.readFileSync(targetPath, 'utf8');

// Replace state variables
content = content.replace(
  "const [createFormData, setCreateFormData] = useState({ name: '', daily_budget: '', status: 'ACTIVE', parent_id: '' });",
  `const [createFormData, setCreateFormData] = useState({ 
    objective: 'OUTCOME_TRAFFIC',
    name: 'Yeni Reklam Kampanyası', 
    daily_budget: '500', 
    status: 'ACTIVE', 
    website_url: 'https://terapiyle.com/', 
    display_link: 'https://terapiyle.com/', 
    primary_text: 'Bazen sadece doğru uzmanla konuşmak her şeyi değiştirir...', 
    headline: 'Terapiyle Sana En Uygun Terapisti Bul', 
    call_to_action: 'LEARN_MORE', 
    page_id: 'Terapimle', 
    instagram_actor_id: 'terapiylecom', 
    pixel_id: '1850906787926541', 
    image_url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80' 
  });`
);

// Replace handleCreateEntity
const handleCreateStart = '  const handleCreateEntity = async (e) => {';
const handleCreateEnd = '  };';
const hStartIndex = content.indexOf(handleCreateStart);
const hEndIndex = content.indexOf(handleCreateEnd, hStartIndex) + handleCreateEnd.length;

const newHandleCreate = `  const handleCreateEntity = async (e) => {
    e.preventDefault();
    if (!createFormData.name || !createFormData.daily_budget) {
      setMessageModal({ show: true, title: 'Eksik Bilgi', message: 'Lütfen kampanya adını ve bütçeyi doldurun.', type: 'error' });
      return;
    }
    setIsCreating(true);
    
    try {
      // 1. Create Campaign
      const campaignPayload = {
        name: createFormData.name,
        daily_budget: createFormData.daily_budget,
        status: createFormData.status
      };
      const campaignRes = await createMetaCampaignAction(clientId, campaignPayload);
      
      if (campaignRes?.error) throw new Error('Kampanya oluşturulamadı: ' + campaignRes.error);
      
      // 2. Create Ad Set
      const adSetPayload = {
        name: createFormData.name + ' - Hedef Kitle',
        parent_id: campaignRes.id,
        daily_budget: createFormData.daily_budget,
        status: createFormData.status
      };
      const adSetRes = await createMetaAdSetAction(clientId, adSetPayload);
      
      if (adSetRes?.error) throw new Error('Reklam seti oluşturulamadı: ' + adSetRes.error);
      
      // 3. Create Ad
      const adPayload = {
        ...createFormData,
        name: createFormData.name + ' - Görsel',
        parent_id: adSetRes.id,
      };
      const adRes = await createMetaAdAction(clientId, adPayload);
      
      if (adRes?.error) throw new Error('Reklam görseli oluşturulamadı: ' + adRes.error);
      
      setIsCreating(false);
      setMessageModal({ show: true, title: 'Başarılı', message: 'Reklamınız başarıyla yayına alındı! Tüm Meta ayarları (Kampanya, Set, Reklam) otomatik olarak yapıldı.', type: 'success' });
      setTimeout(() => router.push('/dashboard/client/' + clientId + '/meta'), 2500);

    } catch (err) {
      setIsCreating(false);
      setMessageModal({ show: true, title: 'Hata', message: err.message, type: 'error' });
    }
  };`;

content = content.substring(0, hStartIndex) + newHandleCreate + content.substring(hEndIndex);

// Replace the main return block
const returnStart = '  return (\n    <div style={{ display: \'flex\', flexDirection: \'column\', gap: \'1.5rem\', height: \'100%\', minHeight: \'80vh\' }}>';
const returnEnd = '    </div>\n  );\n}';
const rStartIndex = content.indexOf(returnStart);
const rEndIndex = content.lastIndexOf(returnEnd) + returnEnd.length;

const newReturn = `  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', minHeight: '80vh' }}>
      {messageModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            {messageModal.type === 'success' ? <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} /> : <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />}
            <h3 style={{ marginBottom: '1rem', color: messageModal.type === 'error' ? '#ef4444' : '#10b981' }}>{messageModal.title}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{messageModal.message}</p>
            {messageModal.details && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '1rem', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px' }}>{messageModal.details}</p>}
            <button onClick={() => { setMessageModal({ ...messageModal, show: false }); if (messageModal.type === 'success') router.push('/dashboard/client/' + clientId + '/meta'); }} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', background: messageModal.type === 'error' ? '#ef4444' : '#10b981' }}>Tamam</button>
          </div>
        </div>
      )}

      <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', borderRadius: '8px 8px 0 0' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Hızlı Reklam Sihirbazı
          </h2>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tek bir form ile Facebook ve Instagram'da saniyeler içinde reklam çıkın.</p>
        </div>
        <button type="button" onClick={() => router.push('/dashboard/client/' + clientId + '/meta')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}><X size={24} /></button>
      </div>

      <form onSubmit={handleCreateEntity} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1, padding: '1.5rem 2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            
            {/* SOL SÜTUN: FORM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* 1. ADIM: HEDEF VE BÜTÇE */}
              <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Amacınız & Bütçeniz</h3>
                </div>
                
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Reklam Kampanyası Adı *</label>
                  <input required className="form-control" value={createFormData.name} onChange={e => setCreateFormData({ ...createFormData, name: e.target.value })} placeholder="Örn: Terapiyle Kayıt Reklamı 11.02" style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Amacınız Nedir?</label>
                    <select value={createFormData.objective} onChange={e => setCreateFormData({ ...createFormData, objective: e.target.value })} style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}>
                      <option value="OUTCOME_TRAFFIC">Trafik (Web Sitesi Ziyareti)</option>
                      <option value="OUTCOME_AWARENESS">Marka Bilinirliği</option>
                      <option value="OUTCOME_ENGAGEMENT">Etkileşim (Beğeni/Yorum)</option>
                      <option value="OUTCOME_LEADS">Potansiyel Müşteri Bulma</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Günlük Bütçe (TL) *</label>
                    <input type="number" required className="form-control" value={createFormData.daily_budget} onChange={e => setCreateFormData({ ...createFormData, daily_budget: e.target.value })} placeholder="Örn: 500" style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ background: 'rgba(24, 119, 242, 0.05)', border: '1px solid rgba(24, 119, 242, 0.2)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1877f2', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span>💡</span> Otomatik Optimizasyon Aktif
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Sistemimiz arka planda en verimli Hedef Kitleyi (Advantage+), En Yüksek Hacim teklif stratejisini ve gerekli Facebook/Instagram reklam seti ayarlarını sizin için otomatik olarak uygulayacaktır.
                  </div>
                </div>
              </div>

              {/* 2. ADIM: REKLAM İÇERİĞİ */}
              <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Reklam İçeriği</h3>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Görsel URL *</label>
                  <input required className="form-control" value={createFormData.image_url} onChange={e => setCreateFormData({ ...createFormData, image_url: e.target.value })} placeholder="Görsel linki..." style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '0.8rem', outline: 'none' }} />
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                      { name: 'Ofis', url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80' },
                      { name: 'Terapist', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80' },
                      { name: 'Online Seans', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80' }
                    ].map(img => (
                      <button
                        key={img.name}
                        type="button"
                        onClick={() => setCreateFormData({ ...createFormData, image_url: img.url })}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '20px',
                          background: createFormData.image_url === img.url ? '#1877f2' : 'transparent',
                          color: createFormData.image_url === img.url ? '#fff' : 'var(--text-primary)',
                          border: createFormData.image_url === img.url ? '1px solid #1877f2' : '1px solid var(--border-color)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {img.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Reklam Metni *</label>
                  <textarea required className="form-control" value={createFormData.primary_text} onChange={e => setCreateFormData({ ...createFormData, primary_text: e.target.value })} placeholder="Bazen sadece doğru uzmanla konuşmak..." rows={3} style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem 1rem', borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem', lineHeight: '1.4', outline: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Kalın Başlık *</label>
                    <input required className="form-control" value={createFormData.headline} onChange={e => setCreateFormData({ ...createFormData, headline: e.target.value })} placeholder="Sana En Uygun Terapisti Bul" style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Buton (Eylem Çağrısı)</label>
                    <select value={createFormData.call_to_action} onChange={e => setCreateFormData({ ...createFormData, call_to_action: e.target.value })} style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}>
                      <option value="LEARN_MORE">Daha Fazla Bilgi Al</option>
                      <option value="SIGN_UP">Kaydol</option>
                      <option value="BOOK_TRAVEL">Rezervasyon Yap</option>
                      <option value="CONTACT_US">Bize Ulaşın</option>
                      <option value="APPLY_NOW">Başvur</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Yönlendirilecek Web Sitesi *</label>
                  <input required type="url" className="form-control" value={createFormData.website_url} onChange={e => setCreateFormData({ ...createFormData, website_url: e.target.value })} placeholder="https://terapiyle.com/" style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                </div>
              </div>

            </div>

            {/* SAĞ SÜTUN: ÖNİZLEME */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>Canlı Önizleme (Tüm Alanlar)</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reklamınızın Meta platformlarında tam olarak nasıl görüneceğini anlık kontrol edin.</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', paddingBottom: '1.5rem', width: '100%', justifyContent: 'flex-start' }}>
                  {[
                    { id: 'fb_feed', label: 'Facebook Akış', icon: 'f', isMobile: false },
                    { id: 'ig_feed', label: 'Instagram Akış', icon: 'i', isMobile: false },
                    { id: 'ig_stories', label: 'Instagram Stories', icon: 'i', isMobile: true },
                    { id: 'fb_stories', label: 'Facebook Stories', icon: 'f', isMobile: true },
                    { id: 'ig_reels', label: 'Instagram Reels', icon: 'i', isMobile: true },
                    { id: 'fb_reels', label: 'Facebook Reels', icon: 'f', isMobile: true },
                    { id: 'threads', label: 'Threads Akış', icon: '@', isMobile: false },
                    { id: 'search_results', label: 'Arama Sonuçları', icon: 'f', isMobile: false }
                  ].map(p => (
                    <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: p.isMobile ? '260px' : '300px', flexShrink: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: p.icon === 'i' ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' : p.icon === '@' ? '#000' : '#1877f2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                          {p.icon}
                        </div>
                        {p.label}
                      </div>

                      {p.isMobile ? (
                        <div style={{ 
                          width: '100%', background: '#ffffff', borderRadius: '32px', padding: '6px',
                          border: '2px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box', overflow: 'hidden', position: 'relative'
                        }}>
                          <div style={{ width: '80px', height: '20px', background: '#e5e7eb', margin: '0 auto', borderRadius: '0 0 12px 12px', position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', top: '-6px' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#9ca3af' }}></div>
                            <div style={{ width: '24px', height: '3px', background: '#9ca3af', borderRadius: '2px' }}></div>
                          </div>
                          <div style={{ borderRadius: '26px', overflow: 'hidden', background: '#000000', marginTop: '-14px' }}>
                            {renderAdPreview(p.id, createFormData)}
                          </div>
                        </div>
                      ) : (
                        <div style={{ width: '100%', background: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                          {renderAdPreview(p.id, createFormData)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        </div>

        <div style={{ padding: '1.2rem 2rem', display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', flexShrink: 0, position: 'sticky', bottom: 0, zIndex: 100 }}>
          <button type="button" onClick={() => router.push('/dashboard/client/' + clientId + '/meta')} style={{ flex: 1, maxWidth: '200px', padding: '1rem', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>İptal Et</button>
          <button type="submit" disabled={isCreating} style={{ flex: 2, padding: '1rem', borderRadius: '8px', background: isCreating ? '#93c5fd' : '#1877f2', color: '#fff', border: 'none', fontWeight: 700, cursor: isCreating ? 'not-allowed' : 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(24,119,242,0.3)' }}>
            {isCreating ? (
              <>
                <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Kampanya Yayına Alınıyor...
              </>
            ) : (
              <>
                🚀 Reklamı Yayına Al (Tek Tıkla)
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}`;

content = content.substring(0, rStartIndex) + newReturn;

fs.writeFileSync(targetPath, content);
console.log('Wizard rewrite successful.');
