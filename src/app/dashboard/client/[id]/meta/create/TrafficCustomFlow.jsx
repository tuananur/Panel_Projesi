import React, { useState } from 'react';
import { ChevronDown, AlertCircle, Info, Check, CheckCircle2, Search, Plus, Sparkles, Monitor, Smartphone, LayoutTemplate, Share2, HelpCircle } from 'lucide-react';

export default function TrafficCustomFlow({ onBack }) {
  const [formData, setFormData] = useState({
    name: 'Size özel site trafiği kampanyası 16.06.2026',
    liveVideo: false,
    abTest: false,
    category: 'Varsa kategori beyan et',
    budgetType: 'Günlük Bütçe',
    budgetAmount: '30,00',
    date: '16 Haziran 2026',
    time: '11:51 GMT+3',
    partnershipAd: false,
    abTestEnabled: false,
    abTestMetric: 'Kreatif',
    abTestDuration: 7,
    abTestCompare: 'Sonuç başına ücret',
    specialCategoryOpen: false,
    specialCategory: 'Varsa kategori beyan et',
    specialCategoryCountry: 'Türkiye'
  });
  const [showReauthModal, setShowReauthModal] = useState(false);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      
      {/* İki Sütunlu Yapı */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '1.5rem', gap: '1.5rem', margin: '0 auto', maxWidth: '1600px', width: '100%' }}>
        
        {/* SOL SÜTUN - %65 Genişlik */}
        <div style={{ flex: '0 0 65%', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
          
          {/* Card 1: Adı */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Adı</label>
            <input 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-primary)' }}
            />
          </div>

          {/* Card 2: Canlı video reklamı & A/B Testi */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Canlı video reklamı</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '80%' }}>Canlı video reklam için önerilen ayarları kullanın. Bu ayarlar, reklamlarınızı daha verimli şekilde sunmak ve etkileşimi artırmak için bütçenizi ve planınızı ayarlayacaktır.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formData.liveVideo ? 'Açık' : 'Kapalı'}</span>
                <div onClick={() => setFormData({...formData, liveVideo: !formData.liveVideo})} style={{ width: '40px', height: '22px', background: formData.liveVideo ? '#1877f2' : 'var(--border-color)', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: '0.2s' }}>
                  <div style={{ width: '18px', height: '18px', background: 'var(--bg-secondary)', borderRadius: '50%', position: 'absolute', top: '2px', left: formData.liveVideo ? '20px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
            </div>

            {formData.liveVideo && (
              <div style={{ marginTop: '-0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Canlı video konumu</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>Canlı videonu nerede yayınlayacağını seç.</div>
                <div style={{ background: 'rgba(24,119,242,0.08)', border: '1px solid rgba(24,119,242,0.25)', borderRadius: '6px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '4px solid #1877f2', background: 'var(--bg-secondary)' }} />
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#1877f2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>f</div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>Facebook</span>
                </div>
              </div>
            )}

            <div style={{ width: '100%', height: '1px', background: 'var(--bg-primary)', marginBottom: '1.5rem' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>A/B Testi</h3>
              </div>
              <div 
                onClick={() => setFormData({...formData, abTestEnabled: !formData.abTestEnabled})}
                style={{ width: '40px', height: '22px', borderRadius: '11px', background: formData.abTestEnabled ? '#1877f2' : 'var(--bg-primary)', position: 'relative', cursor: 'pointer', transition: '0.2s' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--bg-secondary)', position: 'absolute', top: '2px', left: formData.abTestEnabled ? '20px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1.5rem' }}>
              Reklamınızın görselleri, metinleri, hedef kitleleri veya yerleşimleri gibi farklı versiyonlarını test ederek hangisinin en iyi performansı gösterdiğini öğrenin.
            </p>
            
            {formData.abTestEnabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Neyi test etmek istiyorsunuz?</label>
                  <select 
                    value={formData.abTestMetric}
                    onChange={e => setFormData({...formData, abTestMetric: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-secondary)' }}>
                    <option>Kreatif</option>
                    <option>Hedef Kitle</option>
                    <option>Reklam Alanı</option>
                    <option>Özel</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Test ne kadar süreyle yürütülmeli?</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', width: '150px' }}>
                    <input type="number" value={formData.abTestDuration} onChange={e => setFormData({...formData, abTestDuration: e.target.value})} style={{ width: '60px', padding: '0.8rem', border: 'none', outline: 'none', fontSize: '0.95rem', textAlign: 'center', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    <div style={{ padding: '0.8rem', background: 'var(--bg-primary)', color: 'var(--text-secondary)', borderLeft: '1px solid var(--border-color)', flex: 1, textAlign: 'center', fontSize: '0.9rem' }}>gün</div>
                  </div>
                </div>
                
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Performansı nasıl karşılaştırmak istersiniz?</label>
                  <select 
                    value={formData.abTestCompare}
                    onChange={e => setFormData({...formData, abTestCompare: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-secondary)' }}>
                    <option>Sonuç başına ücret</option>
                    <option>Erişim başına ücret</option>
                  </select>
                </div>
              </div>
            )}

          </div>

          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={20} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>Özel Reklam Kategorileri</h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1.5rem' }}>
              Reklamlarınızın finansal ürünler ve hizmetler, istihdam, konut ya da sosyal meseleler, seçimler veya siyasetle ilgili olup olmadığını beyan ederek reklamlarınızın reddedilmesini önleyin. Koşullar ülkeye göre değişir. <span style={{color:'#1877f2', cursor:'pointer'}}>Özel Reklam Kategorileri Hakkında</span>
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Kategoriler</label>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Bu kampanyanın neyin reklamını yapacağını en iyi tanımlayan kategorileri seçin.</div>
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => setFormData({...formData, specialCategoryOpen: !formData.specialCategoryOpen})}
                    style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', border: formData.specialCategoryOpen ? '1px solid #1877f2' : '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-primary)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: formData.specialCategoryOpen ? '0 0 0 2px rgba(24,119,242,0.2)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'absolute', left: '0.8rem' }}>
                      {formData.specialCategory === 'Sosyal Meseleler, Seçimler veya Siyaset' ? <span style={{fontSize:'16px'}}>📢</span> : formData.specialCategory === 'İstihdam' ? <span style={{fontSize:'16px'}}>💼</span> : formData.specialCategory === 'Konut' ? <span style={{fontSize:'16px'}}>🏠</span> : formData.specialCategory === 'Finansal ürünler ve hizmetler' ? <span style={{fontSize:'16px'}}>💳</span> : null}
                    </div>
                    <span>{formData.specialCategory !== 'Varsa kategori beyan et' && formData.specialCategory !== 'Kategori seçin' ? formData.specialCategory : 'Kategori seçin'}</span>
                    <ChevronDown size={16} color="var(--text-primary)" style={{ transform: formData.specialCategoryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                  
                  {formData.specialCategoryOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 50, overflow: 'hidden' }}>
                      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        {[
                          { 
                            id: 'Finansal ürünler ve hizmetler', 
                            icon: '💳', 
                            desc: 'Kredi kartları, uzun vadeli finansman, vadesiz ve tasarruf hesapları, yatırım hizmetleri, sigorta hizmetleri veya diğer ilgili finansal fırsatlara yönelik reklamlar.' 
                          },
                          { 
                            id: 'İstihdam', 
                            icon: '💼', 
                            desc: 'İş teklifleri, stajlar, profesyonel sertifika programları ve ilgili diğer fırsatlara yönelik reklamlar.' 
                          },
                          { 
                            id: 'Konut', 
                            icon: '🏠', 
                            desc: 'Emlak ilanları, konut sigortası, mortgage kredileri veya ilgili diğer fırsatlara yönelik reklamlar.' 
                          },
                          { 
                            id: 'Sosyal Meseleler, Seçimler veya Siyaset', 
                            icon: '📢', 
                            desc: 'Sosyal meseleler (örneğin ekonomi veya vatandaşlık hakları ve sosyal haklar), seçimler veya siyasetçiler ya da siyasi kampanyalarla ilgili reklamlar' 
                          }
                        ].map(cat => (
                          <div 
                            key={cat.id}
                            onClick={() => {
                              if (formData.specialCategory === cat.id) {
                                setFormData({...formData, specialCategory: 'Varsa kategori beyan et'});
                              } else {
                                setFormData({...formData, specialCategory: cat.id});
                              }
                            }}
                            style={{ display: 'flex', gap: '0.8rem', padding: '0.8rem 1rem', cursor: 'pointer', background: formData.specialCategory === cat.id ? 'rgba(24, 119, 242, 0.1)' : 'transparent', borderBottom: '1px solid var(--border-color)' }}
                          >
                            <div style={{ paddingTop: '2px' }}>
                              <div style={{ width: '18px', height: '18px', border: formData.specialCategory === cat.id ? 'none' : '1px solid var(--border-color)', borderRadius: '4px', background: formData.specialCategory === cat.id ? '#1877f2' : 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {formData.specialCategory === cat.id && <CheckCircle2 size={14} color="#fff" strokeWidth={3} />}
                              </div>
                            </div>
                            <div style={{ paddingTop: '1px' }}>
                              <span style={{fontSize:'16px'}}>{cat.icon}</span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '2px' }}>{cat.id}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{cat.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
                        <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          Kategorilerden hiçbiri reklamınız için geçerli değilse özel bir reklam kategorisi seçmenize gerek olmayabilir. Emin değilseniz kategorileri bildirme konusunda yardım da alabilirsiniz.
                        </p>
                        <a href="#" style={{ fontSize: '0.85rem', color: '#1877f2', textDecoration: 'none', fontWeight: 500 }}>Kategorileri Bildirme Hakkında Yardım Alın</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Ülkeler</label>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', lineHeight: '1.4' }}>Bu kampanyayı nerede yayınlamak istediğinizi seçin. Bu konumlarda reklamlarınızı yayınlamak için ilave koşullar varsa, reklam seçenekleriniz bu koşullara göre ayarlanacak.</div>
                <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                  <select 
                    value={formData.specialCategoryCountry}
                    onChange={e => setFormData({...formData, specialCategoryCountry: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', border: formData.specialCategoryCountry === 'Ülkeler seçin' ? '1px solid #dc2626' : '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: formData.specialCategoryCountry === 'Ülkeler seçin' ? 'var(--text-secondary)' : 'var(--text-primary)', outline: 'none', background: 'var(--bg-secondary)', appearance: 'none' }}>
                    <option>Ülkeler seçin</option>
                    <option>Türkiye</option>
                  </select>
                  <div style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <ChevronDown size={16} color="var(--text-primary)" />
                  </div>
                </div>
                
                {formData.specialCategoryCountry === 'Ülkeler seçin' && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.8rem', borderRadius: '6px', borderLeft: '3px solid #dc2626', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <AlertCircle size={16} color="#dc2626" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>En az bir ülke seçin. Bu, kullanabileceğiniz reklam seçeneklerini belirleyecek.</span>
                  </div>
                )}
              </div>

              {formData.specialCategory === 'Sosyal Meseleler, Seçimler veya Siyaset' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '6px', borderLeft: '3px solid #dc2626', border: '1px solid var(--border-color)' }}>
                    <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>Sosyal meseleler, seçimler veya siyasetle ilgili reklamlar yayınlamak için kimliğini doğrulaman ve bir sorumluluk reddi oluşturman gerekiyor.</span>
                      <span style={{ fontSize: '0.85rem', color: '#1877f2', cursor: 'pointer' }}>Detayları Gör</span>
                    </div>
                  </div>
                  
                  <h4 style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>Sosyal Meselelerle, Seçimlerle İlgili veya Siyasi Reklamlar Yayınlama Yetkisi</h4>

                  <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>Onaylanan Kimlik <HelpCircle size={14}/></h4>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                        <div style={{ background: '#dc2626', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}>-</div>
                        <div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.2rem' }}>Kimliğinizi onaylayın</div>
                          <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            Sosyal meselelerle, seçimlerle ilgili veya siyasi reklamlar yayınlamak isteyen kişilerden öncelikle bir devlet kurumu tarafından verilmiş geçerli bir kimlik belgesinin kopyasını yüklemelerini şart koşuyoruz. Kimlik bilgileri reklamlarda veya Meta Reklam Kütüphanesi'nde gösterilmeyecektir. Kimliğinizi onayladıktan sonra kimlik belgenizi 30 gün içinde sileriz.
                          </p>
                          <button onClick={() => setShowReauthModal(true)} style={{ background: '#1877f2', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Kimliği Onayla</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0', display: 'flex', gap: '0.8rem', alignItems: 'flex-start', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>Sayfalar ve Sorumluluk Retleri <HelpCircle size={14}/></h4>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                        <div style={{ background: '#dc2626', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}>-</div>
                        <div style={{ width: '100%' }}>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.2rem' }}>Hiçbir Sayfa reklam yayınlamak için ayarlanmadı</div>
                          <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            Bir Sayfayı onaylanmış bir reklam hesabına bağlayın ve bir sorumluluk reddi oluşturun.
                          </p>
                          <select disabled style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)', outline: 'none', background: 'var(--bg-primary)' }}>
                            <option>Sayfa seç</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Özel Reklam Kategorisi detayları</h4>
                    <div style={{ paddingLeft: '0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dürüst seçimi korumaya yardımcı olur</div>
                    
                    <h4 style={{ margin: '1rem 0 0.4rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Özel Reklam Kategorisi seçenekleri</h4>
                    <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <li>Yetkilendirme işlemini tamamla</li>
                      <li>Sorumluluk reddi ekle</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Bütçe ve Plan */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Bütçe ve Plan</div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Bütçe <Info size={14} color="var(--text-secondary)"/>
                </label>
                <select 
                  value={formData.budgetType}
                  onChange={e => setFormData({...formData, budgetType: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', appearance: 'none', background: 'var(--bg-primary)' }}
                >
                  <option>Günlük Bütçe</option>
                  <option>Toplam Bütçe</option>
                </select>
                <ChevronDown size={16} color="var(--text-secondary)" style={{ position: 'absolute', right: '1rem', bottom: '1rem', pointerEvents: 'none' }} />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>&nbsp;</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    value={formData.budgetAmount}
                    onChange={e => setFormData({...formData, budgetAmount: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem 2.5rem', border: '1px solid #e02424', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-primary)' }}
                  />
                  <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>TL</div>
                  <AlertCircle size={16} color="#e02424" style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <div style={{ color: '#e02424', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.8rem', lineHeight: '1.4' }}>
              Bütçenizin en az 46,44 TL olması gerekir; aksi takdirde reklamınız yayınlanmayabilir. Lütfen bu reklam seti için bütçenizi artırın.
            </div>

            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              Günde ortalama 30,00 TL harcayacaksınız. Maksimum günlük harcamanız 52,50 TL, maksimum haftalık harcamanız 210,00 TL.
            </div>

            <div style={{ background: 'rgba(24,119,242,0.08)', border: '1px solid rgba(24,119,242,0.25)', borderRadius: '6px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '2rem', position: 'relative' }}>
              <Info size={16} color="#1877f2" style={{ marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                Son Trafik kampanyalarınız, yaklaşık Günlük 1.025,00 TL harcayarak sonuç elde etti.
              </div>
              <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Başlangıç Tarihi</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input value={formData.date} readOnly style={{ flex: 1, padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-primary)' }} />
                  <input value={formData.time} readOnly style={{ width: '120px', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Bitiş Tarihi</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.8rem 0' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#1877f2' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Bir bitiş tarihi belirleyin</span>
                </label>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e4e6eb', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Bütçe planlama</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', opacity: 0.6 }}>
                  <input type="checkbox" disabled style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Bütçe artışlarını planlayın</span>
                </label>
              </div>
              <button style={{ padding: '0.4rem 1rem', background: 'var(--bg-primary)', border: 'none', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', opacity: 0.6 }}>Gör</button>
            </div>
          </div>

          {/* Card 5: Hedef Kitle */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Hedef Kitle</div>
            
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1rem' }}>
              Bu reklam hesabının hedef kitle kontrollerini tüm kampanyalara uygulanacak şekilde ayarlayabilirsiniz...
            </div>

            <div style={{ border: '1px solid #10b981', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Advantage+ hedef kitlesi ile sonuç başına ücretinizi %9.7 düşürebilirsiniz</div>
              </div>
              <button style={{ background: 'var(--bg-secondary)', border: '1px solid #10b981', color: '#065f46', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Advantage+ hedef kitlesini kullan</button>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #e4e6eb', marginBottom: '1.5rem' }}>
              <div style={{ paddingBottom: '0.8rem', borderBottom: '3px solid #1877f2', color: '#1877f2', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Yeni Hedef Kitle Oluştur</div>
              <div style={{ paddingBottom: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Kaydedilen hedef kitleyi kullan</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Özel Hedef Kitleler</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input placeholder="Mevcut hedef kitleleri arayın" style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', background: 'var(--bg-primary)' }} />
                  </div>
                  <button style={{ padding: '0 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Yeni Oluştur <ChevronDown size={14} />
                  </button>
                </div>
                <div style={{ color: '#1877f2', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Hariç tutulacakları ekle</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Konumlar</label>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Dahil edilen konum: Türkiye</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Yaş <Info size={14} color="var(--text-secondary)"/></label>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>18 - 65+</div>
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Cinsiyet <Info size={14} color="var(--text-secondary)"/></label>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Tüm cinsiyetler</div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Detaylı Hedefleme</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input placeholder="Demografik bilgiler, ilgi alanları veya davranışlar ekleyin" style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', background: 'var(--bg-primary)' }} />
                  </div>
                  <button style={{ padding: '0 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', color: '#1877f2' }}>Göz At</button>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button style={{ padding: '0.6rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Hedef kitleyi kaydet</button>
              </div>
            </div>
          </div>

          {/* Card 6: Reklam Şeffaflığı & Ortaklık Reklamı */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.8rem' }}>Reklam Şeffaflığı</div>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <select style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-secondary)', outline: 'none', appearance: 'none', background: 'var(--bg-primary)' }}>
                  <option>Reklamvereni seçin</option>
                </select>
                <ChevronDown size={16} color="var(--text-secondary)" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Reklamveren ve ödeyen farklı</span>
                <div style={{ width: '40px', height: '22px', background: 'var(--bg-primary)', borderRadius: '11px', position: 'relative' }}>
                  <div style={{ width: '18px', height: '18px', background: 'var(--bg-secondary)', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--bg-primary)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Ortaklık Reklamı</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '85%' }}>Başka bir işletme, marka veya içerik üreticisiyle bir ortaklık reklamı oluşturun.</div>
              </div>
              <div style={{ width: '40px', height: '22px', background: formData.partnershipAd ? '#1877f2' : 'var(--border-color)', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: '0.2s' }} onClick={() => setFormData({...formData, partnershipAd: !formData.partnershipAd})}>
                <div style={{ width: '18px', height: '18px', background: 'var(--bg-secondary)', borderRadius: '50%', position: 'absolute', top: '2px', left: formData.partnershipAd ? '20px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </div>

          </div>

          {/* Card 7: Kimlik */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Kimlik</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Facebook Sayfası</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>T</div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', flex: 1 }}>Tuana Nur Yalçın</span>
                  <ChevronDown size={16} color="var(--text-secondary)" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Instagram profili</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', overflow: 'hidden' }}>
                    <img src="https://ui-avatars.com/api/?name=F&background=random" alt="avatar" style={{ width: '100%', height: '100%' }} />
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', flex: 1 }}>flowervadi</span>
                  <ChevronDown size={16} color="var(--text-secondary)" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Threads profili</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', flex: 1 }}>Bir Threads profili seç</span>
                  <ChevronDown size={16} color="var(--text-secondary)" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 8: Reklam Kurulumu & Kaynakları */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Reklam Kurulumu</label>
              <div style={{ position: 'relative' }}>
                <select style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', appearance: 'none', background: 'var(--bg-primary)' }}>
                  <option>Mevcut gönderiyi kullan</option>
                </select>
                <ChevronDown size={16} color="var(--text-secondary)" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.8rem' }}>Reklam Kaynakları</div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Katalog</label>
                  <div style={{ position: 'relative' }}>
                    <select style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)', outline: 'none', appearance: 'none', background: 'var(--bg-primary)' }}>
                      <option>Bağlantıda değil</option>
                    </select>
                    <ChevronDown size={16} color="var(--text-secondary)" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
                <button disabled style={{ padding: '0.8rem 1rem', background: 'var(--bg-primary)', border: 'none', borderRadius: '6px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Görüntüle</button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Kaynak URL'si</label>
              <input 
                placeholder="http://www.example.com/page" 
                defaultValue="http://www.example.com/page"
                style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Reklam kaynakları (0/1)</span>
              <button disabled style={{ padding: '0.4rem 1rem', background: 'var(--bg-primary)', border: 'none', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Düzenle</button>
            </div>
          </div>

          {/* Card 9: Reklam Kreatifi */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Reklam Kreatifi</div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button style={{ flex: 1, padding: '0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}>Gönderi seç</button>
              <button style={{ flex: 1, padding: '0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}>+ Gönderi oluştur</button>
            </div>

            <div style={{ background: 'var(--bg-highlight)', border: '1px solid #ffe082', borderRadius: '6px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '1rem' }}>
              <AlertCircle size={16} color="#f59e0b" style={{ marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>Gönderi gereklidir. Yayınlamak için gönderi seçin veya oluşturun.</div>
            </div>

            <div style={{ color: '#1877f2', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Gönderi Kodunu Girin</div>
          </div>

          {/* Card 10: Kreatif Testi & Takip */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.8rem' }}>Kreatif testi</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Öğelerin farklı kombinasyonlarını deneyerek hedef kitlenizde en iyi performansı hangisinin sağladığını bulun.</div>
              <button style={{ padding: '0.6rem 1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>Test oluştur</button>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--bg-primary)', marginBottom: '1.5rem' }} />

            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Takip</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#1877f2' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>İnternet sitesi olayları</span>
                  </label>
                  <button style={{ padding: '0.4rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Ayarla</button>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: 0.7 }}>
                    <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>Uygulama Olayları</span>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#1877f2' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>Çevrimdışı olaylar</span>
                  </label>
                  <button style={{ padding: '0.4rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Ayarla</button>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>URL Parametreleri</label>
                  <input 
                    placeholder="anahtar1=değer1&anahtar2=değer2" 
                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)', outline: 'none', marginBottom: '0.5rem' }}
                  />
                  <div style={{ color: '#1877f2', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Bir URL parametresi oluşturun</div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>View Etiketleri</label>
                  <textarea 
                    rows={3}
                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', background: 'var(--bg-primary)' }}
                  />
                </div>

                <div style={{ background: 'var(--bg-primary)', borderRadius: '6px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Üçüncü taraf raporlama araçları</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>Google Analytics vb. entegrasyonlar.</div>
                  <button style={{ padding: '0.4rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Bağla</button>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* SAĞ SÜTUN - %35 Genişlik (Sticky) */}
        <div style={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '1.5rem', height: 'fit-content', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', paddingRight: '0.5rem' }}>
          
          {/* Widget A: Hata Kontrol Paneli */}
          <div style={{ border: '1px solid #e02424', borderRadius: '8px', background: 'var(--bg-secondary)', overflow: 'hidden', boxShadow: '0 4px 12px rgba(220,38,38,0.1)' }}>
            <div style={{ background: 'rgba(224,36,36,0.12)', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(224,36,36,0.25)' }}>
              <AlertCircle size={18} color="#e02424" />
              <div style={{ color: '#e05555', fontWeight: 700, fontSize: '0.9rem' }}>Değişiklikleriniz doğrulanıyor</div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Bütçenizin en az 46,44 TL olması gerekir; aksi takdirde reklamınız yayınlanmayabilir. Lütfen bu reklam seti için bütçenizi artırın. (#1885272)
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button style={{ padding: '0.6rem 1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  Bütçeyi Güncelle
                </button>
              </div>
            </div>
          </div>

          {/* Widget B: Hedef Kitle Tanımı */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Hedef Kitle Tanımı</div>
              <Info size={16} color="var(--text-muted)" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.95rem' }}>Hedef kitleniz geniş.</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              Daha geniş bir hedef kitle oluşturmak sistemlerimize daha çok esneklik sunabilir ve harcama getirinizi artırabilir.
            </div>

            {/* Gauge Dial */}
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ flex: 1, background: 'rgba(224,36,36,0.3)' }} />
                <div style={{ flex: 1, background: '#fef08a' }} />
                <div style={{ flex: 1, background: '#10b981' }} />
              </div>
              {/* Pointer Triangle */}
              <div style={{ position: 'absolute', top: '-10px', left: '80%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #1c1e21' }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '1.5rem' }}>
              <span>Dar</span>
              <span>Geniş</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1.5rem' }}>
              Tahmini hedef kitle büyüklüğü: 68.800.000 - 81.000.000 <Info size={14} color="var(--text-muted)" />
            </div>

            <div style={{ borderTop: '1px solid #e4e6eb', paddingTop: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
              <Sparkles size={16} color="#1877f2" style={{ marginTop: '2px' }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Advantage+ hedef kitlesi:</strong> Bu sayı, reklamını bu sınırların dışındaki kişilere göstermemizin performansı artıracağını düşünürsek Advantage+ hedef kitlesinin hariç tutmaların ötesinde arama yapabileceğini varsayar.
              </div>
            </div>
          </div>

          {/* Widget C: Reklam önizlemesi Panel */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '400px' }}>
            
            {/* Top Bar */}
            <div style={{ padding: '1rem', borderBottom: '1px solid #e4e6eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '36px', height: '20px', background: '#1877f2', borderRadius: '10px', position: 'relative' }}>
                  <div style={{ width: '16px', height: '16px', background: 'var(--bg-secondary)', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px' }} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Reklam önizlemesi</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Gelişmiş Önizleme <ChevronDown size={14} />
                </button>
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                  <Share2 size={14} />
                </button>
              </div>
            </div>

            {/* Device Filters Row */}
            <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ padding: '0.4rem', background: 'rgba(24,119,242,0.12)', borderRadius: '6px', color: '#1877f2', cursor: 'pointer' }}>
                <Monitor size={18} />
              </div>
              <div style={{ padding: '0.4rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <Smartphone size={18} />
              </div>
              <div style={{ padding: '0.4rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <LayoutTemplate size={18} />
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e02424', fontSize: '0.8rem', fontWeight: 600 }}>
                <AlertCircle size={16} />
                <div style={{ background: 'var(--error-color)', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>15</div>
              </div>
            </div>

            {/* Mock Canvas Area */}
            <div style={{ flex: 1, background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <div style={{ width: '220px', height: '160px', background: 'var(--bg-primary)', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src="https://img.freepik.com/free-vector/flat-hand-drawn-people-working-office-illustration_23-2148818580.jpg" alt="mockup illustration" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Bu reklam için gösterilecek önizleme yok.
              </div>
              <button style={{ padding: '0.6rem 1.5rem', background: 'var(--primary-color)', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', color: '#fff', cursor: 'pointer', boxShadow: '0 2px 4px rgba(24,119,242,0.2)' }}>
                Bunu düzeltmeme yardım et
              </button>
            </div>

            <div style={{ padding: '0.8rem 1rem', background: 'var(--bg-secondary)', borderTop: '1px solid #e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Önizlemeler farklı platformlara göre değişebilir.</span>
              <Info size={14} color="var(--text-muted)" />
            </div>

          </div>

        </div>

      </div>

      {/* Sticky Bottom Action Bar */}
      <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid #ccd0d5', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', bottom: 0, zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: '24px', height: '24px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={14} color="#fff" strokeWidth={3} />
          </div>
          <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>Tüm düzenlemeler kaydedildi</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kurallar ve Politikalara tabi.</span>
          <button style={{ padding: '0.6rem 2rem', background: 'var(--success-color)', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.95rem', color: '#fff', cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.2)' }}>
            Yayınla
          </button>
        </div>
      </div>

      {showReauthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '480px', background: 'var(--bg-secondary)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ color: '#1877f2', fontWeight: 'bold', fontSize: '1.4rem', fontFamily: 'Helvetica, Arial, sans-serif', letterSpacing: '-0.5px' }}>facebook</div>
            </div>
            <div style={{ padding: '2rem 3rem' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', color: 'var(--text-primary)', textAlign: 'center', fontWeight: 600 }}>Devam etmek için lütfen şifrenizi girin</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center', background: 'var(--bg-primary)', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <div style={{ width: '40px', height: '40px', background: '#204f63', borderRadius: '4px' }}></div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>Facebook Kullanıcısı</div>
              </div>
              
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem' }}>
                Ziyaret etmek istediğiniz sayfa için şifrenizi yeniden girmeniz gerekmektedir.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'right' }}>Şifre</span>
                <input type="password" style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', width: '200px', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
                <a href="#" style={{ color: '#1877f2', fontSize: '0.85rem', textDecoration: 'none' }}>Şifreni mi unuttun?</a>
              </div>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '0.8rem 1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => setShowReauthModal(false)} style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '0.4rem 1rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>İptal</button>
              <button onClick={() => setShowReauthModal(false)} style={{ background: '#1877f2', color: '#fff', border: '1px solid #1877f2', padding: '0.4rem 1rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>Devam</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
