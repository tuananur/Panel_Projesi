"use client";

import React, { useState, useEffect } from 'react';
import { X, Search, ChevronDown, CheckCircle2, AlertCircle, Edit2, Pencil, Eye, ArrowLeft, MoreHorizontal, Video, Megaphone, HelpCircle } from 'lucide-react';

export default function BilinirlikFlow({ onBack, clientName, activeTab = 'campaigns' }) {
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
    specialCategory: 'Varsa kategori beyan et',
    specialCategoryCountry: 'Türkiye',
    purchaseType: 'Rezervasyon',
    campaignObjective: 'Bilinirlik',
    bidStrategy: 'Sonuç başına ücret hedefi',
    budgetPlanVisible: true,
    spendingLimitEnabled: true,
    spendingLimitAmount: ''
  });

  const [purchaseTypeOpen, setPurchaseTypeOpen] = useState(false);
  const [bidStrategyOpen, setBidStrategyOpen] = useState(false);
  const [spendingLimitEditMode, setSpendingLimitEditMode] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);

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
        
        {activeTab === 'campaigns' || activeTab === 'adsets' ? (
          <>
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
        {formData.purchaseType !== 'Rezervasyon' && (
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
        )}

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
              {formData.purchaseType === 'Rezervasyon' ? (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {formData.campaignObjective}
                </div>
              ) : (
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
              )}
            </div>
            
            {formData.purchaseType !== 'Rezervasyon' && !(formData.budgetEnabled && formData.budgetType === 'Toplam bütçe') && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button style={{ background: 'none', border: 'none', color: '#1877f2', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}>Seçenekleri Gizle <ChevronDown size={14} style={{transform: 'rotate(180deg)'}} /></button>
                  <button onClick={() => setSpendingLimitEditMode(!spendingLimitEditMode)} style={{ background: 'none', border: 'none', color: '#1877f2', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}><Pencil size={14} /> Düzenle</button>
                </div>
                
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>Kampanya Harcama Sınırı <span style={{color:'var(--text-secondary)', fontWeight: 400}}>· İsteğe bağlı</span> <HelpCircle size={12}/></div>
                  
                  {spendingLimitEditMode ? (
                    <div style={{ marginTop: '0.8rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.8rem' }}>
                        <input type="checkbox" checked={formData.spendingLimitEnabled} onChange={() => setFormData({...formData, spendingLimitEnabled: !formData.spendingLimitEnabled})} style={{ accentColor: '#1877f2', width: '16px', height: '16px' }} />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Kampanya Harcama Sınırı Ekle</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-primary)', fontSize: '0.95rem' }}>TL</span>
                        <input 
                          placeholder="Ayarlı Sınır Yok"
                          value={formData.spendingLimitAmount}
                          onChange={e => setFormData({...formData, spendingLimitAmount: e.target.value})}
                          style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.2rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-secondary)' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Toplam 0,00 TL Harcandı</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem', paddingLeft: '0.5rem' }}>Hiçbiri eklenmedi</div>
                  )}
                </div>
              </div>
            )}
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

        {/* Card D: Advantage+ Kampanya Bütçesi */}
        {formData.purchaseType !== 'Rezervasyon' && (
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
                  <input 
                    type="checkbox" 
                    checked={formData.budgetPlanVisible} 
                    onChange={() => setFormData({...formData, budgetPlanVisible: !formData.budgetPlanVisible})} 
                    disabled={formData.budgetType === 'Toplam bütçe'}
                    style={{ width: '16px', height: '16px', accentColor: '#1877f2', cursor: formData.budgetType === 'Toplam bütçe' ? 'not-allowed' : 'pointer', opacity: formData.budgetType === 'Toplam bütçe' ? 0.5 : 1 }} 
                  />
                  <span style={{ fontSize: '0.9rem', color: formData.budgetType === 'Toplam bütçe' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>Bütçe artışlarını planlayın</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border-color)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', background: 'var(--bg-secondary)' }}>
                    Gör <ChevronDown size={14} />
                  </div>
                </div>

                {formData.budgetPlanVisible && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.8rem' }}>
                    {(formData.planIncreasePeriods || [1]).map((periodId) => (
                      <div key={periodId} style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(24, 119, 242, 0.03)', borderRadius: '8px', border: '1px solid rgba(24, 119, 242, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Bütçe artışı için süre</div>
                          <ChevronDown size={16} />
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>Başlangıç</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input value={formData[`budgetIncreaseStart_${periodId}`] || "16 Haz 2026"} onChange={e => setFormData({...formData, [`budgetIncreaseStart_${periodId}`]: e.target.value})} style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }} />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                <span style={{fontSize: '14px'}}>🕒</span> <input value={formData[`budgetIncreaseStartTime_${periodId}`] || "00:00"} onChange={e => setFormData({...formData, [`budgetIncreaseStartTime_${periodId}`]: e.target.value})} style={{ border: 'none', background: 'transparent', outline: 'none', width: '40px', color: 'var(--text-primary)' }} />
                              </div>
                            </div>
                          </div>
                          <div style={{ color: 'var(--text-secondary)', marginTop: '1.5rem' }}>-</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>Bitiş</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input value={formData[`budgetIncreaseEnd_${periodId}`] || "17 Haz 2026"} onChange={e => setFormData({...formData, [`budgetIncreaseEnd_${periodId}`]: e.target.value})} style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }} />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                <span style={{fontSize: '14px'}}>🕒</span> <input value={formData[`budgetIncreaseEndTime_${periodId}`] || "00:00"} onChange={e => setFormData({...formData, [`budgetIncreaseEndTime_${periodId}`]: e.target.value})} style={{ border: 'none', background: 'transparent', outline: 'none', width: '40px', color: 'var(--text-primary)' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <select style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}>
                            <option>Günlük bütçeyi değer miktarına göre artır (TL)</option>
                          </select>
                          <div style={{ display: 'flex', alignItems: 'center', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', width: '120px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>TL </span>
                            <input value={formData[`budgetIncreaseAmount_${periodId}`] || "12,50"} onChange={e => setFormData({...formData, [`budgetIncreaseAmount_${periodId}`]: e.target.value})} style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', width: '40px' }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>TRY</span>
                          </div>
                        </div>
                        
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                          Meta {(formData[`budgetIncreaseStart_${periodId}`] || "16 Haz").split(' ')[0] + " " + (formData[`budgetIncreaseStart_${periodId}`] || "16 Haz").split(' ')[1]} ile {(formData[`budgetIncreaseEnd_${periodId}`] || "17 Haz").split(' ')[0] + " " + (formData[`budgetIncreaseEnd_${periodId}`] || "17 Haz").split(' ')[1]} arasında günde {(parseFloat(50) + parseFloat((formData[`budgetIncreaseAmount_${periodId}`] || "12,50").replace(',','.'))).toFixed(2).replace('.', ',')} TL harcamayı amaçlayacak ({formData[`budgetIncreaseAmount_${periodId}`] || "12,50"} TL artış).
                        </div>
                        
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const current = formData.planIncreasePeriods || [1];
                            if(current.length === 1) {
                              setFormData({ ...formData, budgetPlanVisible: false, planIncreasePeriods: [1] });
                            } else {
                              setFormData({ ...formData, planIncreasePeriods: current.filter(id => id !== periodId) });
                            }
                          }}
                          style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <span style={{fontSize: '14px'}}>🗑️</span> Bu dönemi kaldır
                        </button>
                      </div>
                    ))}
                    
                    <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const current = formData.planIncreasePeriods || [1];
                          if(current.length < 50) {
                            const nextId = current.length > 0 ? Math.max(...current.map(n => Number(n))) + 1 : 1;
                            setFormData({ ...formData, planIncreasePeriods: [...current, nextId] });
                          }
                        }}
                        style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span style={{fontSize: '14px', fontWeight: 'bold'}}>+</span> Başka bir zaman aralığı ekle
                      </button>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{(formData.planIncreasePeriods || [1]).length}/50 zaman dilimi</div>
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
        )}

        {formData.purchaseType !== 'Rezervasyon' && (
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
        )}
        </>
        ) : null}

      </div>
    </div>
  );

  return (
    <>
      {isReviewMode ? renderReviewPage() : renderForm()}
      
      {showReauthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '480px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden', border: '1px solid #ddd' }}>
            <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ color: '#1877f2', fontWeight: 'bold', fontSize: '1.4rem', fontFamily: 'Helvetica, Arial, sans-serif', letterSpacing: '-0.5px' }}>facebook</div>
            </div>
            <div style={{ padding: '2rem 3rem' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', color: '#1c1e21', textAlign: 'center', fontWeight: 600 }}>Devam etmek için lütfen şifrenizi girin</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center', background: '#f5f6f7', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                <div style={{ width: '40px', height: '40px', background: '#204f63', borderRadius: '4px' }}></div>
                <div style={{ fontSize: '0.95rem', color: '#1c1e21', fontWeight: 600 }}>{clientName || 'Facebook Kullanıcısı'}</div>
              </div>
              
              <p style={{ fontSize: '0.85rem', color: '#606770', textAlign: 'center', marginBottom: '1.5rem' }}>
                Ziyaret etmek istediğiniz sayfa için şifrenizi yeniden girmeniz gerekmektedir.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#1c1e21', textAlign: 'right' }}>Şifre</span>
                <input type="password" style={{ padding: '0.5rem', border: '1px solid #ccd0d5', borderRadius: '4px', width: '200px', outline: 'none' }} />
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
                <a href="#" style={{ color: '#1877f2', fontSize: '0.85rem', textDecoration: 'none' }}>Şifreni mi unuttun?</a>
              </div>
            </div>
            <div style={{ background: '#f5f6f7', padding: '0.8rem 1rem', borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => setShowReauthModal(false)} style={{ background: '#e4e6eb', color: '#4b4f56', border: '1px solid #ccd0d5', padding: '0.4rem 1rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>İptal</button>
              <button onClick={() => setShowReauthModal(false)} style={{ background: '#1877f2', color: '#fff', border: '1px solid #1877f2', padding: '0.4rem 1rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>Devam</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
