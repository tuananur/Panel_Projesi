const fs = require('fs');

const targetPath = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let lines = fs.readFileSync(targetPath, 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('const renderAdFormFields = (data'));
const endIdx = lines.findIndex(l => l.includes('const renderAudienceCard = ()'));

if (startIdx === -1 || endIdx === -1) {
  console.log('Could not find start or end index.');
  process.exit(1);
}

const newRenderAdFormFields = `
  const renderAdFormFields = (data, setData, isCreate, isEditing) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.8rem' }}>
        {/* Card 1: Reklam Adı ve Set Seçimi */}
        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>REKLAM ADI *</label>
            {isEditing ? (
              <input 
                required
                className="form-control" 
                value={isCreate ? data.name : editName} 
                onChange={e => isCreate ? setData({ ...data, name: e.target.value }) : setEditName(e.target.value)} 
                placeholder="Örn: Yeni Etkileşim Reklamı"
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
              />
            ) : (
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>{selectedEntity?.data?.name}</div>
            )}
          </div>
          {isCreate && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>REKLAM SETİ SEÇİN *</label>
              <select 
                required
                value={data.parent_id || ''}
                onChange={e => setData({ ...data, parent_id: e.target.value })}
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
              >
                <option value="">Seçiniz...</option>
                {adSets.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Card 2: Kimlik */}
        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>Yayınlanacak Profiller</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Facebook Sayfası *</label>
              {isEditing ? (
                <select 
                  value={data.page_id || 'Terapimle'} 
                  onChange={e => setData({ ...data, page_id: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="Terapimle">Terapimle</option>
                  <option value="Diğer Sayfa">Diğer Sayfa</option>
                </select>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{data.page_id || 'Terapimle'}</div>
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Instagram Profili *</label>
              {isEditing ? (
                <select 
                  value={data.instagram_actor_id || 'terapiylecom'} 
                  onChange={e => setData({ ...data, instagram_actor_id: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="terapiylecom">terapiylecom</option>
                  <option value="diğer_profil">diğer_profil</option>
                </select>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{data.instagram_actor_id || 'terapiylecom'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Reklam İçeriği */}
        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>Reklam İçeriği</h3>
          </div>
          
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Görsel URL *</label>
            {isEditing ? (
              <>
                <input 
                  required
                  className="form-control" 
                  value={data.image_url || ''} 
                  onChange={e => setData({ ...data, image_url: e.target.value })} 
                  placeholder="Görsel adresi girin veya şablonlardan seçin..."
                  style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '0.5rem', outline: 'none' }} 
                />
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { name: 'Ofis', url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Terapist', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Online Seans', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80' }
                  ].map(img => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => setData({ ...data, image_url: img.url })}
                      style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        background: data.image_url === img.url ? '#1877f2' : 'rgba(255,255,255,0.1)',
                        color: data.image_url === img.url ? '#fff' : 'var(--text-primary)',
                        border: data.image_url === img.url ? '1px solid #1877f2' : '1px solid var(--border-color)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{data.image_url}</div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Reklam Metni *</label>
            {isEditing ? (
              <textarea 
                required
                className="form-control" 
                value={data.primary_text || ''} 
                onChange={e => setData({ ...data, primary_text: e.target.value })} 
                placeholder="Bazen sadece doğru uzmanla konuşmak..."
                rows={4}
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.85rem', lineHeight: '1.4', outline: 'none' }} 
              />
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{data.primary_text}</div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Başlık *</label>
              {isEditing ? (
                <input 
                  required
                  className="form-control" 
                  value={data.headline || ''} 
                  onChange={e => setData({ ...data, headline: e.target.value })} 
                  placeholder="Terapiyle Sana En Uygun Terapisti Bul"
                  style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
                />
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{data.headline}</div>
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Eylem Çağrısı (Buton) *</label>
              {isEditing ? (
                <select 
                  value={data.call_to_action || 'LEARN_MORE'}
                  onChange={e => setData({ ...data, call_to_action: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="LEARN_MORE">Daha Fazla Bilgi Al</option>
                  <option value="SIGN_UP">Kaydol</option>
                  <option value="BOOK_TRAVEL">Rezervasyon Yap</option>
                  <option value="CONTACT_US">Bize Ulaşın</option>
                  <option value="APPLY_NOW">Başvur</option>
                </select>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{CTA_LABELS[data.call_to_action || 'LEARN_MORE']}</div>
              )}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Yönlendirilecek Web Sitesi (URL) *</label>
            {isEditing ? (
              <input 
                required
                type="url"
                className="form-control" 
                value={data.website_url || ''} 
                onChange={e => setData({ ...data, website_url: e.target.value })} 
                placeholder="https://terapiyle.com/"
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
              />
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{data.website_url}</div>
            )}
          </div>
          
          <div style={{ background: 'rgba(24, 119, 242, 0.05)', border: '1px solid rgba(24, 119, 242, 0.2)', padding: '0.8rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1877f2', fontWeight: 700, fontSize: '0.8rem', marginBottom: '4px' }}>
              <span>💡</span> Otomatik Ayarlar Devrede
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Katalog, Piksel, Döngüsel Format, Advantage+ Kreatif İyileştirmeleri ve Çevrimdışı Olaylar gibi tüm teknik Meta ayarları arka planda en optimize şekilde otomatik uygulanır.
            </div>
          </div>

        </div>
      </div>
    );
  };
`;

const newLines = [
  ...lines.slice(0, startIdx),
  newRenderAdFormFields.trim(),
  ...lines.slice(endIdx)
];

fs.writeFileSync(targetPath, newLines.join('\n'));
console.log('Successfully simplified renderAdFormFields');
