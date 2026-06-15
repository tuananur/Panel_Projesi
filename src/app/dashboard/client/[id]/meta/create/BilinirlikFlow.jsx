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
    specialCategory: 'Varsa kategori beyan et',
    specialCategoryCountry: 'Türkiye'
  });

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
    <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={onBack}>
        <ArrowLeft size={18} color="var(--text-primary)" />
        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Reklam</span>
      </div>
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <button 
          onClick={() => setIsReviewMode(false)}
          style={{ padding: '0.5rem 1rem', background: '#e7f3ff', color: '#1877f2', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <Edit2 size={14} /> Düzenle
        </button>
        <button 
          onClick={() => setIsReviewMode(true)}
          style={{ padding: '0.5rem 1rem', background: '#1877f2', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <Eye size={14} /> Gözden Geçir
        </button>
      </div>
    </div>
  );

  const renderReviewPage = () => (
    <div style={{ flex: 1, background: '#f0f2f5', overflowY: 'auto' }}>
      {renderHeader()}
      <div style={{ maxWidth: '800px', margin: '2rem auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kampanya Adı</div>
            <div style={{ fontSize: '1.2rem', color: '#1c1e21', fontWeight: 600, marginTop: '0.2rem' }}>{formData.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Kod: 6975629799825</div>
          </div>
          
          <div style={{ height: '1px', background: 'var(--border-color)' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Satın Alma Türü</div>
              <div style={{ fontSize: '0.95rem', color: '#1c1e21', marginTop: '0.2rem' }}>Açık Artırma</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reklam Verme Amacı</div>
              <div style={{ fontSize: '0.95rem', color: '#1c1e21', marginTop: '0.2rem' }}>Bilinirlik</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bütçe Stratejisi</div>
              <div style={{ fontSize: '0.95rem', color: '#1c1e21', marginTop: '0.2rem' }}>Reklam seti bütçesi</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Reklam seti bütçe paylaşımı: Açık</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kampanya Teklif Stratejisi</div>
              <div style={{ fontSize: '0.95rem', color: '#1c1e21', marginTop: '0.2rem' }}>En yüksek hacim</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Yayın türü</div>
              <div style={{ fontSize: '0.95rem', color: '#1c1e21', marginTop: '0.2rem' }}>Standart</div>
            </div>
            {formData.specialCategory !== 'Varsa kategori beyan et' && (
              <>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Özel Reklam Kategorileri</div>
                  <div style={{ fontSize: '0.95rem', color: '#1c1e21', marginTop: '0.2rem' }}>{formData.specialCategory}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Özel Reklam Kategorisi Ülkeleri</div>
                  <div style={{ fontSize: '0.95rem', color: '#1c1e21', marginTop: '0.2rem' }}>{formData.specialCategoryCountry}</div>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '1.5rem 2rem', background: '#fdf2f2', borderTop: '1px solid #f87171' }}>
          <div style={{ color: '#dc2626', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Reklam Setleri</div>
          <div style={{ color: '#dc2626', fontSize: '0.9rem' }}><strong>Lütfen şunları ekleyin:</strong> Reklam Setleri</div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f0f2f5', overflowY: 'auto', position: 'relative' }}>
      {renderHeader()}
      
      {budgetError && (
        <div style={{ position: 'absolute', top: '5rem', right: '1.5rem', background: '#fdf2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '1rem', width: '300px', boxShadow: '0 4px 12px rgba(220,38,38,0.1)', zIndex: 10 }}>
           <div style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><AlertCircle size={16}/> Değişiklikleriniz doğrulanıyor</div>
           <div style={{ color: '#991b1b', fontSize: '0.8rem', lineHeight: '1.4' }}>Param lifetime_budget must be an integer. Instead, got float. (#100)</div>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '2rem auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1rem', paddingBottom: '4rem' }}>
        
        {/* Card A: Kampanya Adı */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1c1e21', fontWeight: 600 }}>Kampanya Adı</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ flex: 1, padding: '0.8rem', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.95rem', color: '#1c1e21', outline: 'none' }}
            />
            <button style={{ padding: '0.8rem 1.2rem', background: '#f5f6f7', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#4b4f56', cursor: 'pointer' }}>Şablon Oluştur</button>
          </div>
        </div>

        {/* Card B: Canlı Video Reklamı */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1c1e21', fontWeight: 600 }}>Canlı video reklamı</h3>
            <div 
              onClick={() => setFormData({...formData, liveVideoAd: !formData.liveVideoAd})}
              style={{ width: '40px', height: '22px', borderRadius: '11px', background: formData.liveVideoAd ? '#1877f2' : '#e4e6eb', position: 'relative', cursor: 'pointer', transition: '0.2s' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: formData.liveVideoAd ? '20px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1.5rem' }}>
            Canlı video reklam için önerilen ayarları kullanın. Bu ayarlar, reklamlarınızı daha verimli şekilde sunmak ve etkileşimi artırmak için bütçenizi ve planınızı ayarlayacaktır.
          </p>
          
          {formData.liveVideoAd && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1c1e21', marginBottom: '0.8rem' }}>Canlı video konumu</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                <input type="radio" checked readOnly style={{ width: '18px', height: '18px', accentColor: '#1877f2' }} />
                <div style={{ width: '24px', height: '24px', background: '#1877f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1rem', paddingRight: '2px' }}>f</div>
                <span style={{ fontSize: '0.9rem', color: '#1c1e21' }}>Facebook</span>
              </label>
            </div>
          )}
        </div>

        {/* Card C: Kampanya Detayları */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1c1e21', fontWeight: 600 }}>Kampanya Detayları</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Satın Alma Türü</div>
              <div style={{ fontSize: '0.95rem', color: '#1c1e21', display: 'flex', justifyContent: 'space-between' }}>
                Açık Artırma
                <button style={{ background: 'none', border: 'none', color: '#1877f2', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}><Edit2 size={12}/> Düzenle</button>
              </div>
            </div>
            
            <div style={{ height: '1px', background: 'var(--border-color)' }} />
            
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}>Kampanya amacı <HelpCircle size={12} /></div>
              <div style={{ fontSize: '0.95rem', color: '#1c1e21', display: 'flex', justifyContent: 'space-between' }}>
                Bilinirlik
                <button style={{ background: 'none', border: 'none', color: '#1877f2', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}><Edit2 size={12}/> Düzenle</button>
              </div>
            </div>
            
            <button style={{ background: 'none', border: 'none', color: '#1877f2', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginTop: '0.5rem' }}>Daha Fazla Seçenek Göster</button>
          </div>
        </div>

        {/* Card D: Advantage+ Kampanya Bütçesi */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#1c1e21', fontWeight: 600 }}>Advantage+ kampanya bütçesi</h3>
            </div>
            <div 
              onClick={() => setFormData({...formData, budgetEnabled: !formData.budgetEnabled})}
              style={{ width: '40px', height: '22px', borderRadius: '11px', background: formData.budgetEnabled ? '#1877f2' : '#e4e6eb', position: 'relative', cursor: 'pointer', transition: '0.2s' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: formData.budgetEnabled ? '20px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
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
                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.95rem', color: '#1c1e21', outline: 'none', background: '#fff' }}>
                    <option>Toplam bütçe</option>
                    <option>Günlük Bütçe</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, visibility: 'hidden' }}>Tutar</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#1c1e21', fontSize: '0.95rem' }}>TL</span>
                    <input 
                      value={formData.budgetAmount}
                      onChange={e => setFormData({...formData, budgetAmount: e.target.value})}
                      style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', border: budgetError ? '1px solid #dc2626' : '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.95rem', color: '#1c1e21', outline: 'none' }}
                    />
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TRY</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>Kampanya Teklif Stratejisi <HelpCircle size={12} /></label>
                <div style={{ fontSize: '0.95rem', color: '#1c1e21' }}>En yüksek hacim</div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="checkbox" disabled style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Bütçe artışlarını planlayın</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#1877f2', fontWeight: 600, cursor: 'pointer' }}>Gör</span>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reklam Planlaması</div>
                  <div style={{ fontSize: '0.95rem', color: '#1c1e21', marginTop: '0.2rem' }}>Reklamları sürekli yayınla</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card E: A/B Testi */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#1c1e21', fontWeight: 600 }}>A/B Testi</h3>
            </div>
            <div 
              onClick={() => setFormData({...formData, abTestEnabled: !formData.abTestEnabled})}
              style={{ width: '40px', height: '22px', borderRadius: '11px', background: formData.abTestEnabled ? '#1877f2' : '#e4e6eb', position: 'relative', cursor: 'pointer', transition: '0.2s' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: formData.abTestEnabled ? '20px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
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
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.95rem', color: '#1c1e21', outline: 'none', background: '#fff' }}>
                  <option>Kreatif</option>
                  <option>Hedef Kitle</option>
                  <option>Reklam Alanı</option>
                  <option>Özel</option>
                </select>
                {formData.abTestMetric === 'Özel' && (
                  <div style={{ marginTop: '0.5rem', border: '1px solid #ccd0d5', borderRadius: '6px', padding: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                      <Search size={16} color="var(--text-secondary)" />
                      <input placeholder="Ara" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ padding: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>Kreatif</div>
                      <div style={{ padding: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>Hedef Kitle</div>
                      <div style={{ padding: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>Reklam Alanı</div>
                      <div style={{ padding: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', background: '#e7f3ff', color: '#1877f2', borderRadius: '4px' }}>Özel</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Test ne kadar süreyle yürütülmeli?</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccd0d5', borderRadius: '6px', overflow: 'hidden', width: '150px' }}>
                  <input type="number" value={formData.abTestDuration} onChange={e => setFormData({...formData, abTestDuration: e.target.value})} style={{ width: '60px', padding: '0.8rem', border: 'none', outline: 'none', fontSize: '0.95rem', textAlign: 'center' }} />
                  <div style={{ padding: '0.8rem', background: '#f5f6f7', color: '#4b4f56', borderLeft: '1px solid #ccd0d5', flex: 1, textAlign: 'center', fontSize: '0.9rem' }}>gün</div>
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Performansı nasıl karşılaştırmak istersiniz?</label>
                <select 
                  value={formData.abTestCompare}
                  onChange={e => setFormData({...formData, abTestCompare: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.95rem', color: '#1c1e21', outline: 'none', background: '#fff' }}>
                  <option>Sonuç başına ücret</option>
                  <option>Erişim başına ücret</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Card F: Özel Reklam Kategorileri */}
        <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1c1e21', fontWeight: 600 }}>Özel Reklam Kategorileri</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1.5rem' }}>
            Kredi, istihdam, konut veya sosyal meseleler, seçimler ya da siyaset ile ilgili reklamlar için beyanda bulunmanız gerekir. Ülkeye göre gereklilikler değişiklik gösterebilir.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Kategoriler</label>
              <select 
                value={formData.specialCategory}
                onChange={e => setFormData({...formData, specialCategory: e.target.value})}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.95rem', color: '#1c1e21', outline: 'none', background: '#fff' }}>
                <option>Varsa kategori beyan et</option>
                <option>Sosyal Meseleler, Seçimler veya Siyaset</option>
                <option>Konut</option>
                <option>İstihdam</option>
              </select>
            </div>

            {formData.specialCategory === 'Sosyal Meseleler, Seçimler veya Siyaset' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f5f6f7', borderRadius: '8px', padding: '1rem', border: '1px solid #ccd0d5', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <AlertCircle color="#dc2626" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', color: '#1c1e21' }}>Onaylanan Kimlik</h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Sosyal meseleler, seçimler veya siyasetle ilgili reklamlar yayınlamak için kimliğinizi onaylamanız ve sorumluluk reddi oluşturmanız gerekir. Bu bilgiler Reklam Kütüphanesinde görünür.
                    </p>
                    <button style={{ background: '#1877f2', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Kimliği Onayla</button>
                  </div>
                </div>

                <div style={{ background: '#f5f6f7', borderRadius: '8px', padding: '1rem', border: '1px solid #ccd0d5', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <AlertCircle color="#dc2626" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ width: '100%' }}>
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', color: '#1c1e21' }}>Sayfalar ve Sorumluluk Redleri</h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Sosyal meseleler, seçimler veya siyaset hakkındaki reklamları yayınlayabileceğiniz bir Sayfanız yok. Bir Sayfayı bu reklam hesabına bağlayın.
                    </p>
                    <select disabled style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.95rem', color: '#8d949e', outline: 'none', background: '#e4e6eb' }}>
                      <option>Sayfa seç</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1c1e21', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <ChevronDown size={16} /> Özel Reklam Kategorisi detayları
                  </div>
                  <div style={{ paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dürüst seçimi korumaya yardımcı olur</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1c1e21', fontSize: '0.9rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
                    <ChevronDown size={16} /> Özel Reklam Kategorisi seçenekleri
                  </div>
                  <ul style={{ paddingLeft: '2.5rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <li>Yetkilendirme işlemini tamamla</li>
                    <li>Sorumluluk reddi ekle</li>
                  </ul>
                </div>
              </div>
            )}

            {(formData.specialCategory === 'Konut' || formData.specialCategory === 'İstihdam' || formData.specialCategory === 'Sosyal Meseleler, Seçimler veya Siyaset') && (
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Ülkeler</label>
                <select 
                  value={formData.specialCategoryCountry}
                  onChange={e => setFormData({...formData, specialCategoryCountry: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.95rem', color: '#1c1e21', outline: 'none', background: '#fff' }}>
                  <option>Türkiye</option>
                </select>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );

  return isReviewMode ? renderReviewPage() : renderForm();
}
