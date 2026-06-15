"use client";

import React, { useState, useEffect } from 'react';
import { X, Search, ChevronDown, CheckCircle2, AlertCircle, Edit2, Eye, ArrowLeft, MoreHorizontal, Video, Megaphone, HelpCircle } from 'lucide-react';

export default function BilinirlikFlow({ onBack }) {
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Yeni Bilinirlik Kampanyası',
    liveVideoAd: true,
    budgetEnabled: true,
    budgetType: 'Toplam bütçe',
    budgetAmount: '16.250,94',
    abTestEnabled: true,
    abTestMetric: 'Kreatif',
    abTestDuration: 7,
    abTestCompare: 'Sonuç başına ücret',
    specialCategory: 'İstihdam',
    specialCategoryCountry: 'Ülkeler seçin',
    purchaseType: 'Rezervasyon',
    campaignObjective: 'Bilinirlik',
    bidStrategy: 'Sonuç başına ücret hedefi',
    budgetPlanVisible: true
  });

  const [purchaseTypeOpen, setPurchaseTypeOpen] = useState(false);
  const [bidStrategyOpen, setBidStrategyOpen] = useState(false);

  const [budgetError, setBudgetError] = useState(false);

  // Validate budget format (simulate float error)
  useEffect(() => {
    if (formData.budgetEnabled && formData.budgetType === 'Toplam bütçe' && formData.budgetAmount.includes(',')) {
      setBudgetError(true);
    } else {
      setBudgetError(false);
    }
  }, [formData.budgetAmount, formData.budgetType, formData.budgetEnabled]);

  const renderHeader = () => (
    <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={onBack}>
        <ArrowLeft size={18} color="var(--text-primary)" />
        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Reklam</span>
      </div>
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <button 
          onClick={() => setIsReviewMode(false)}
          style={{ padding: '0.5rem 1rem', background: 'rgba(24, 119, 242, 0.1)', color: '#1877f2', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <Edit2 size={14} /> Düzenle
        </button>
        <button 
          onClick={() => setIsReviewMode(true)}
          style={{ padding: '0.5rem 1rem', background: '#1877f2', color: 'var(--bg-secondary)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <Eye size={14} /> Gözden Geçir
        </button>
      </div>
    </div>
  );

  const renderReviewPage = () => (
    <div style={{ flex: 1, background: 'var(--bg-primary)', overflowY: 'auto' }}>
      {renderHeader()}
      <div style={{ maxWidth: '800px', margin: '2rem auto', background: 'var(--bg-secondary)', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kampanya Adı</div>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.2rem' }}>{formData.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Kod: 6975629799825</div>
          </div>
          
          <div style={{ height: '1px', background: 'var(--border-color)' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Satın Alma Türü</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>Açık Artırma</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reklam Verme Amacı</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>Bilinirlik</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bütçe Stratejisi</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>Reklam seti bütçesi</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Reklam seti bütçe paylaşımı: Açık</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kampanya Teklif Stratejisi</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>En yüksek hacim</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Yayın türü</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>Standart</div>
            </div>
            {formData.specialCategory !== 'Varsa kategori beyan et' && (
              <>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Özel Reklam Kategorileri</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{formData.specialCategory}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Özel Reklam Kategorisi Ülkeleri</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{formData.specialCategoryCountry}</div>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '1.5rem 2rem', background: 'rgba(239, 68, 68, 0.1)', borderTop: '1px solid #f87171' }}>
          <div style={{ color: '#dc2626', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Reklam Setleri</div>
          <div style={{ color: '#dc2626', fontSize: '0.9rem' }}><strong>Lütfen şunları ekleyin:</strong> Reklam Setleri</div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflowY: 'auto', position: 'relative' }}>
      {renderHeader()}
      
      {budgetError && (
        <div style={{ position: 'absolute', top: '5rem', right: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #f87171', borderRadius: '8px', padding: '1rem', width: '300px', boxShadow: '0 4px 12px rgba(220,38,38,0.1)', zIndex: 10 }}>
           <div style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><AlertCircle size={16}/> Değişiklikleriniz doğrulanıyor</div>
           <div style={{ color: '#991b1b', fontSize: '0.8rem', lineHeight: '1.4' }}>Param lifetime_budget must be an integer. Instead, got float. (#100)</div>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '2rem auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1rem', paddingBottom: '4rem' }}>
        
        {/* Card A: Kampanya Adı */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>Kampanya Adı</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ flex: 1, padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none' }}
            />
            <button style={{ padding: '0.8rem 1.2rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Şablon Oluştur</button>
          </div>
        </div>

        {/* Card B: Canlı Video Reklamı */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>Canlı video reklamı</h3>
            <div 
              onClick={() => setFormData({...formData, liveVideoAd: !formData.liveVideoAd})}
              style={{ width: '40px', height: '22px', borderRadius: '11px', background: formData.liveVideoAd ? '#1877f2' : 'var(--bg-primary)', position: 'relative', cursor: 'pointer', transition: '0.2s' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--bg-secondary)', position: 'absolute', top: '2px', left: formData.liveVideoAd ? '20px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1.5rem' }}>
            Canlı video reklam için önerilen ayarları kullanın. Bu ayarlar, reklamlarınızı daha verimli şekilde sunmak ve etkileşimi artırmak için bütçenizi ve planınızı ayarlayacaktır.
          </p>
          
          {formData.liveVideoAd && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.8rem' }}>Canlı video konumu</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                <input type="radio" checked readOnly style={{ width: '18px', height: '18px', accentColor: '#1877f2' }} />
                <div style={{ width: '24px', height: '24px', background: '#1877f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-secondary)', fontWeight: 'bold', fontSize: '1rem', paddingRight: '2px' }}>f</div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Facebook</span>
              </label>
            </div>
          )}
        </div>

        {/* Card C: Kampanya Detayları */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>Kampanya Detayları</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Satın Alma Türü</label>
              <div 
                onClick={() => setPurchaseTypeOpen(!purchaseTypeOpen)}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-primary)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                {formData.purchaseType || 'Açık Artırma'}
                <ChevronDown size={16} />
              </div>
              {purchaseTypeOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
                  <div 
                    onClick={() => { setFormData({...formData, purchaseType: 'Açık Artırma'}); setPurchaseTypeOpen(false); }}
                    style={{ padding: '0.8rem', cursor: 'pointer', background: formData.purchaseType === 'Açık Artırma' ? 'rgba(24, 119, 242, 0.1)' : 'transparent', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <input type="radio" checked={formData.purchaseType === 'Açık Artırma'} readOnly style={{ accentColor: '#1877f2', width: '16px', height: '16px', marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>Açık Artırma</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Uygun maliyetli tekliflerle gerçek zamanlı olarak satın alın.</div>
                    </div>
                  </div>
                  <div 
                    onClick={() => { setFormData({...formData, purchaseType: 'Rezervasyon'}); setPurchaseTypeOpen(false); }}
                    style={{ padding: '0.8rem', cursor: 'pointer', background: formData.purchaseType === 'Rezervasyon' ? 'rgba(24, 119, 242, 0.1)' : 'transparent', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <input type="radio" checked={formData.purchaseType === 'Rezervasyon'} readOnly style={{ accentColor: '#1877f2', width: '16px', height: '16px', marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>Rezervasyon</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Daha öngörülebilir sonuçlar için önceden satın alın.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>Kampanya amacı <HelpCircle size={12} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { id: 'Bilinirlik', icon: <Megaphone size={16} color="#fff" />, bg: '#1877f2' },
                  { id: 'Trafik', icon: <span style={{fontSize:'16px'}}>🖱️</span>, bg: 'var(--bg-primary)', hideOnRez: true },
                  { id: 'Etkileşim', icon: <span style={{fontSize:'16px'}}>💬</span>, bg: 'var(--bg-primary)' },
                  { id: 'Potansiyel Müşteriler', icon: <span style={{fontSize:'16px'}}>📋</span>, bg: 'var(--bg-primary)', hideOnRez: true },
                  { id: 'Uygulama tanıtımı', icon: <span style={{fontSize:'16px'}}>📱</span>, bg: 'var(--bg-primary)', hideOnRez: true },
                  { id: 'Satışlar', icon: <span style={{fontSize:'16px'}}>🛍️</span>, bg: 'var(--bg-primary)', hideOnRez: true }
                ].filter(obj => !(formData.purchaseType === 'Rezervasyon' && obj.hideOnRez)).map(obj => (
                  <label key={obj.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem', cursor: 'pointer', borderRadius: '6px', background: formData.campaignObjective === obj.id ? 'rgba(24, 119, 242, 0.1)' : 'transparent' }}>
                    <input type="radio" checked={formData.campaignObjective === obj.id} onChange={() => setFormData({...formData, campaignObjective: obj.id})} style={{ accentColor: '#1877f2', width: '16px', height: '16px' }} />
                    <div style={{ width: '32px', height: '32px', background: obj.bg, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {obj.icon}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{obj.id}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: '0.5rem' }}>
              <button style={{ background: 'none', border: 'none', color: '#1877f2', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}>Seçenekleri Gizle <ChevronDown size={14} style={{transform: 'rotate(180deg)'}} /></button>
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>Kampanya Harcama Sınırı <span style={{color:'var(--text-secondary)', fontWeight: 400}}>· İsteğe bağlı</span> <HelpCircle size={12}/></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem', paddingLeft: '0.5rem' }}>Hiçbiri eklenmedi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Özel Reklam Kategorileri (Moved here) */}
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
                <select 
                  value={formData.specialCategory}
                  onChange={e => setFormData({...formData, specialCategory: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-secondary)', appearance: 'none' }}>
                  <option>Kategori seçin</option>
                  <option>Sosyal Meseleler, Seçimler veya Siyaset</option>
                  <option>Konut</option>
                  <option value="İstihdam">İstihdam</option>
                </select>
                <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  {formData.specialCategory === 'İstihdam' ? <span style={{fontSize:'16px'}}>💼</span> : null}
                </div>
                <div style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <ChevronDown size={16} color="var(--text-primary)" />
                </div>
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
                <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <AlertCircle color="#dc2626" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Onaylanan Kimlik</h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Sosyal meseleler, seçimler veya siyasetle ilgili reklamlar yayınlamak için kimliğinizi onaylamanız ve sorumluluk reddi oluşturmanız gerekir. Bu bilgiler Reklam Kütüphanesinde görünür.
                    </p>
                    <button style={{ background: '#1877f2', color: 'var(--bg-secondary)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Kimliği Onayla</button>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <AlertCircle color="#dc2626" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ width: '100%' }}>
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Sayfalar ve Sorumluluk Redleri</h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Sosyal meseleler, seçimler veya siyaset hakkındaki reklamları yayınlayabileceğiniz bir Sayfanız yok. Bir Sayfayı bu reklam hesabına bağlayın.
                    </p>
                    <select disabled style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-secondary)', outline: 'none', background: 'var(--bg-primary)' }}>
                      <option>Sayfa seç</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <ChevronDown size={16} /> Özel Reklam Kategorisi detayları
                  </div>
                  <div style={{ paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dürüst seçimi korumaya yardımcı olur</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
                    <ChevronDown size={16} /> Özel Reklam Kategorisi seçenekleri
                  </div>
                  <ul style={{ paddingLeft: '2.5rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <li>Yetkilendirme işlemini tamamla</li>
                    <li>Sorumluluk reddi ekle</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card D: Advantage+ Kampanya Bütçesi */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>Advantage+ kampanya bütçesi</h3>
            </div>
            <div 
              onClick={() => setFormData({...formData, budgetEnabled: !formData.budgetEnabled})}
              style={{ width: '40px', height: '22px', borderRadius: '11px', background: formData.budgetEnabled ? '#1877f2' : 'var(--bg-primary)', position: 'relative', cursor: 'pointer', transition: '0.2s' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--bg-secondary)', position: 'absolute', top: '2px', left: formData.budgetEnabled ? '20px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1.5rem' }}>
            Kampanya bütçeniz performansı en üst düzeye çıkarmak için reklam setleriniz arasında otomatik olarak dağıtılır. Bütçenizi kontrol etmek için her reklam setinde bir harcama limiti belirleyebilirsiniz.
          </p>
          
          {formData.budgetEnabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>Bütçe <HelpCircle size={12} /></label>
                  <select 
                    value={formData.budgetType}
                    onChange={e => setFormData({...formData, budgetType: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-secondary)' }}>
                    <option>Toplam bütçe</option>
                    <option>Günlük Bütçe</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, visibility: 'hidden' }}>Tutar</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-primary)', fontSize: '0.95rem' }}>TL</span>
                    <input 
                      value={formData.budgetAmount}
                      onChange={e => setFormData({...formData, budgetAmount: e.target.value})}
                      style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', border: budgetError ? '1px solid #dc2626' : '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none' }}
                    />
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TRY</span>
                  </div>
                </div>
              </div>
              
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>Kampanya Teklif Stratejisi <HelpCircle size={12} /></label>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>Reklam açık artırmalarında nasıl teklif vereceğimiz.</div>
                
                <div 
                  onClick={() => setBidStrategyOpen(!bidStrategyOpen)}
                  style={{ width: 'fit-content', minWidth: '220px', padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  {formData.bidStrategy || 'Sonuç başına ücret hedefi'}
                  <ChevronDown size={16} />
                </div>

                {bidStrategyOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', width: '380px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
                    <div 
                      onClick={() => { setFormData({...formData, bidStrategy: 'En yüksek hacim'}); setBidStrategyOpen(false); }}
                      style={{ padding: '0.8rem', cursor: 'pointer', background: formData.bidStrategy === 'En yüksek hacim' ? 'rgba(24, 119, 242, 0.1)' : 'transparent' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>En yüksek hacim</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Bütçeniz için en fazla sonucu elde edin.</div>
                    </div>
                    <div 
                      onClick={() => { setFormData({...formData, bidStrategy: 'Sonuç başına ücret hedefi'}); setBidStrategyOpen(false); }}
                      style={{ padding: '0.8rem', cursor: 'pointer', background: formData.bidStrategy === 'Sonuç başına ücret hedefi' ? 'rgba(24, 119, 242, 0.1)' : 'transparent' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>Sonuç başına ücret hedefi</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Sonuçların hacmini en üst düzeye çıkarırken sonuç başına belirli bir ücret hedefleyin.</div>
                    </div>
                    <div 
                      onClick={() => { setBidStrategyOpen(false); }}
                      style={{ padding: '0.8rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Diğer seçenekler</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Teklif üst sınırı</div>
                      </div>
                      <ChevronDown size={16} style={{transform: 'rotate(-90deg)'}} />
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="checkbox" checked={formData.budgetPlanVisible} onChange={() => setFormData({...formData, budgetPlanVisible: !formData.budgetPlanVisible})} style={{ width: '16px', height: '16px', accentColor: '#1877f2', cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Bütçe artışlarını planlayın</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border-color)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', background: 'var(--bg-secondary)' }}>
                    Gör <ChevronDown size={14} />
                  </div>
                </div>

                {formData.budgetPlanVisible && (
                  <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(24, 119, 242, 0.03)', borderRadius: '8px', border: '1px solid rgba(24, 119, 242, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Bütçe artışı için süre</div>
                      <ChevronDown size={16} />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>Başlangıç</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input value="Haz 16, 2026" readOnly style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            <span style={{fontSize: '14px'}}>🕒</span> 00:00
                          </div>
                        </div>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '1.5rem' }}>-</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>Bitiş</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input value="Haz 17, 2026" readOnly style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            <span style={{fontSize: '14px'}}>🕒</span> 00:00
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <select style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}>
                        <option>Günlük bütçeyi değer miktarına göre artır (TL)</option>
                      </select>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', width: '120px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>TL 12,50</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>TRY</span>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                      Meta 16 Haz ile 17 Haz arasında günde 62,50 TL harcamayı amaçlayacak (12,50 TL artış).
                    </div>
                    
                    <button style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{fontSize: '14px'}}>🗑️</span> Bu dönemi kaldır
                    </button>
                    
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{fontSize: '14px', fontWeight: 'bold'}}>+</span> Başka bir zaman aralığı ekle
                      </button>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1/50 zaman dilimi</div>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>Reklam Planlaması <HelpCircle size={12} /></div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>Reklamları sürekli yayınla</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card E: A/B Testi */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
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
                {formData.abTestMetric === 'Özel' && (
                  <div style={{ marginTop: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                      <Search size={16} color="var(--text-secondary)" />
                      <input placeholder="Ara" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ padding: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>Kreatif</div>
                      <div style={{ padding: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>Hedef Kitle</div>
                      <div style={{ padding: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>Reklam Alanı</div>
                      <div style={{ padding: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', background: 'rgba(24, 119, 242, 0.1)', color: '#1877f2', borderRadius: '4px' }}>Özel</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Test ne kadar süreyle yürütülmeli?</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', width: '150px' }}>
                  <input type="number" value={formData.abTestDuration} onChange={e => setFormData({...formData, abTestDuration: e.target.value})} style={{ width: '60px', padding: '0.8rem', border: 'none', outline: 'none', fontSize: '0.95rem', textAlign: 'center' }} />
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

        {/* Old Özel Reklam Kategorileri location is now empty since we moved it up */}

      </div>
    </div>
  );

  return isReviewMode ? renderReviewPage() : renderForm();
}
