const renderSpecialAdCategories = (data, setData) => (
  <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={10} color="#10b981" />
      </div>
      <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>Özel Reklam Kategorileri</h3>
    </div>
    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
      Reklamlarınızın finansal ürünler ve hizmetler, istihdam, konut ya da sosyal meseleler, seçimler veya siyasetle ilgili olup olmadığını beyan ederek reklamlarınızın reddedilmesini önleyin. Koşullar ülkeye göre değişir. <span style={{ color: '#1877f2', cursor: 'pointer' }}>Özel Reklam Kategorileri Hakkında</span>
    </p>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Kategoriler</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Bu kampanyanın neyin reklamını yapacağını en iyi tanımlayan kategorileri seçin.</div>
      
      <div style={{ position: 'relative' }}>
        <div 
          onClick={() => setData({ ...data, categoryDropdownOpen: !data.categoryDropdownOpen })}
          style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid #1877f2', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {data.cat_fin ? 'Finansal ürünler ve hizmetler' : data.cat_emp ? 'İstihdam' : data.cat_hou ? 'Konut' : data.cat_soc ? 'Sosyal Meseleler, Seçimler veya Siyaset' : 'Varsa kategori beyan et'} <span style={{ fontSize: '0.7rem', color: '#000' }}>▼</span>
        </div>
        {data.categoryDropdownOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {[
              { id: 'fin', label: 'Finansal ürünler ve hizmetler', desc: 'Kredi kartları, uzun vadeli finansman, vadesiz ve tasarruf hesapları, yatırım hizmetleri, sigorta hizmetleri veya diğer ilgili finansal fırsatlara yönelik reklamlar.', icon: '💳' },
              { id: 'emp', label: 'İstihdam', desc: 'İş teklifleri, stajlar, profesyonel sertifika programları ve ilgili diğer fırsatlara yönelik reklamlar.', icon: '💼' },
              { id: 'hou', label: 'Konut', desc: 'Emlak ilanları, konut sigortası, mortgage kredileri veya ilgili diğer fırsatlara yönelik reklamlar.', icon: '🏠' },
              { id: 'soc', label: 'Sosyal Meseleler, Seçimler veya Siyaset', desc: 'Sosyal meseleler (örneğin ekonomi veya vatandaşlık hakları ve sosyal haklar), seçimler veya siyasetçiler ya da siyasi kampanyalarla ilgili reklamlar', icon: '📢' }
            ].map(cat => (
              <div key={cat.id} style={{ display: 'flex', gap: '0.8rem', padding: '0.8rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', alignItems: 'flex-start', background: data[`cat_${cat.id}`] ? 'rgba(24,119,242,0.05)' : 'transparent' }} onClick={() => setData({ ...data, [`cat_${cat.id}`]: !data[`cat_${cat.id}`] })}>
                <div style={{ width: '16px', height: '16px', border: '1px solid var(--border-color)', borderRadius: '4px', background: data[`cat_${cat.id}`] ? '#1877f2' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  {data[`cat_${cat.id}`] && <Check size={12} color="#fff" />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>{cat.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.4' }}>{cat.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: '1rem', background: '#f9fafb', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Kategorilerden hiçbiri reklamınız için geçerli değilse özel bir reklam kategorisi seçmenize gerek olmayabilir. Emin değilseniz kategorileri bildirme konusunda yardım da alabilirsiniz.
              <div style={{ color: '#1877f2', marginTop: '0.5rem', cursor: 'pointer' }}>Kategorileri Bildirme Hakkında Yardım Alın</div>
            </div>
          </div>
        )}
      </div>
    </div>
    
    {(data.cat_fin || data.cat_emp || data.cat_hou || data.cat_soc) && (
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Ülkeler</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Bu kampanyayı nerede yayınlamak istediğinizi seçin. Bu konumlarda reklamlarınızı yayınlamak için ilave koşullar varsa, reklam seçenekleriniz bu koşullara göre ayarlanacak.</div>
        <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', appearance: 'none' }}>
          <option>Türkiye</option>
        </select>
        
        <div style={{ marginTop: '0.8rem', padding: '1rem', border: '1px solid #dc2626', borderLeft: '4px solid #dc2626', borderRadius: '4px', background: 'var(--bg-primary)', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
          <div style={{ marginTop: '2px' }}><AlertCircle size={16} color="#dc2626" /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Sosyal meseleler, seçimler veya siyasetle ilgili reklamlar yayınlamak için kimliğini doğrulaman ve bir sorumluluk reddi oluşturman gerekiyor.</div>
            <div style={{ fontSize: '0.85rem', color: '#1877f2', cursor: 'pointer' }}>Detayları Gör</div>
          </div>
        </div>
      </div>
    )}
    
    {data.cat_soc && (
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>Sosyal Meseleler, Seçimlerle İlgili veya Siyasi Reklamlar Yayınlama Yetkisi</h3>
        
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>Onaylanan Kimlik <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></div>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>-</div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#1877f2', fontWeight: 600, marginBottom: '0.2rem' }}>Kimliğinizi onaylayın</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '0.8rem' }}>Sosyal meselelerle, seçimlerle ilgili veya siyasi reklamlar yayınlamak isteyen kişilerden öncelikle bir devlet kurumu tarafından verilmiş geçerli bir kimlik belgesinin kopyasını yüklemelerini şart koşuyoruz. Kimlik bilgileri reklamlarda veya Meta Reklam Kütüphanesinde gösterilmeyecektir. Kimliğinizi onayladıktan sonra kimlik belgenizi 30 gün içinde sileriz.</div>
              <button type="button" style={{ background: '#1877f2', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Kimliği Onayla</button>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>Sayfalar ve Sorumluluk Retleri <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></div>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>-</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.2rem' }}>Hiçbir Sayfa reklam yayınlamak için ayarlanmadı</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '0.8rem' }}>Bir Sayfayı onaylanmış bir reklam hesabına bağlayın ve bir sorumluluk reddi oluşturun.</div>
              <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', appearance: 'none' }}>
                <option>Sayfa seç</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Özel Reklam Kategorisi detayları</div>
          
          <div style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ padding: '0.8rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setData({...data, socDetail1: !data.socDetail1})}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Bu kategorinin beyan edilmesi nasıl yardımcı olur?</span>
              <span>{data.socDetail1 ? '▲' : '▼'}</span>
            </div>
            {data.socDetail1 && (
              <div style={{ padding: '0 0 1rem 0', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏢</div>
                <span style={{ fontSize: '0.85rem', color: '#1877f2' }}>Dürüst seçimi korumaya yardımcı olur</span>
              </div>
            )}
          </div>

          <div>
            <div style={{ padding: '0.8rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setData({...data, socDetail2: !data.socDetail2})}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Özel Reklam Kategorisi seçenekleri</span>
              <span>{data.socDetail2 ? '▲' : '▼'}</span>
            </div>
            {data.socDetail2 && (
              <div style={{ padding: '0 0 1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📋</div>
                  <span style={{ fontSize: '0.85rem', color: '#1877f2' }}>Yetkilendirme işlemini tamamla</span>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ℹ️</div>
                  <span style={{ fontSize: '0.85rem', color: '#1877f2' }}>Sorumluluk reddi ekle</span>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👥</div>
                  <span style={{ fontSize: '0.85rem', color: '#1877f2' }}>Değiştirilmiş hedef kitle seçenekleri</span>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📖</div>
                  <span style={{ fontSize: '0.85rem', color: '#1877f2' }}>Daha fazla şeffaflık</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
