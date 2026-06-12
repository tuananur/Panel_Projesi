'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createMetaCampaignAction, createMetaAdSetAction, createMetaAdAction } from '@/app/actions';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const CTA_LABELS = {
  LEARN_MORE: 'Daha Fazla Bilgi Al',
  SIGN_UP: 'Kaydol',
  BOOK_TRAVEL: 'Rezervasyon Yap',
  CONTACT_US: 'Bize Ulaşın',
  APPLY_NOW: 'Başvur'
};

export default function CreateMetaClient({ clientId, initialCampaigns, initialAdSets }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('campaigns');
  
  const [campaigns, setCampaigns] = useState(initialCampaigns || []);
  const [adSets, setAdSets] = useState(initialAdSets || []);
  
  const [createFormData, setCreateFormData] = useState({ name: '', daily_budget: '', status: 'ACTIVE', parent_id: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [previewPlacement, setPreviewPlacement] = useState('fb_feed');
  const [showAdvancedPreviewModal, setShowAdvancedPreviewModal] = useState(false);
  const [messageModal, setMessageModal] = useState({ show: false, title: '', message: '', details: '', type: 'error' });

  const StatusToggle = ({ active, onToggle }) => (
    <div onClick={onToggle} style={{ width: '36px', height: '20px', borderRadius: '10px', background: active ? '#1877f2' : '#e4e6eb', position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: active ? '18px' : '2px', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  );

  const handleCreateEntity = async (e) => {
    e.preventDefault();
    if (!createFormData.name) return;
    setIsCreating(true);
    
    let res;
    if (activeTab === 'campaigns') res = await createMetaCampaignAction(clientId, createFormData);
    else if (activeTab === 'adsets') res = await createMetaAdSetAction(clientId, createFormData);
    else if (activeTab === 'ads') res = await createMetaAdAction(clientId, createFormData);
    
    setIsCreating(false);
    
    if (res?.error) {
      setMessageModal({ show: true, title: 'Hata', message: res.error, details: res.details || '', type: 'error' });
    } else {
      setMessageModal({ show: true, title: 'Başarılı', message: 'Başarıyla oluşturuldu! Yönlendiriliyorsunuz...', type: 'success' });
      setTimeout(() => router.push('/dashboard/client/' + clientId + '/meta'), 1500);
    }
  };

  

  

  

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100vh', paddingBottom: '2rem' }}>
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

      <div style={{ padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dddfe2', background: '#ffffff', borderRadius: '8px 8px 0 0' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#1c1e21' }}>
          Yeni {activeTab === 'campaigns' ? 'Kampanya' : activeTab === 'adsets' ? 'Reklam Seti' : 'Reklam'}
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => { setActiveTab('campaigns'); setCreateFormData({ name: '', daily_budget: '', status: 'ACTIVE', parent_id: '' }); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccd0d5', background: activeTab === 'campaigns' ? '#e7f3ff' : '#fff', color: activeTab === 'campaigns' ? '#1877f2' : '#1c1e21', fontWeight: 600, cursor: 'pointer' }}>Kampanya</button>
          <button onClick={() => { setActiveTab('adsets'); setCreateFormData({ name: '', daily_budget: '', status: 'ACTIVE', parent_id: '' }); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccd0d5', background: activeTab === 'adsets' ? '#e7f3ff' : '#fff', color: activeTab === 'adsets' ? '#1877f2' : '#1c1e21', fontWeight: 600, cursor: 'pointer' }}>Reklam Seti</button>
          <button onClick={() => { setActiveTab('ads'); setCreateFormData({ name: 'Yeni Etkileşim Reklamı', parent_id: '', status: 'ACTIVE', website_url: 'https://terapiyle.com/', display_link: 'https://terapiyle.com/', primary_text: 'Bazen sadece doğru uzmanla konuşmak her şeyi değiştirir...', headline: 'Terapiyle Sana En Uygun Terapisti Bul', call_to_action: 'LEARN_MORE', page_id: 'Terapimle', instagram_actor_id: 'terapiylecom', pixel_id: '1850906787926541', image_url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80' }); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccd0d5', background: activeTab === 'ads' ? '#e7f3ff' : '#fff', color: activeTab === 'ads' ? '#1877f2' : '#1c1e21', fontWeight: 600, cursor: 'pointer' }}>Reklam</button>
          <button onClick={() => router.push('/dashboard/client/' + clientId + '/meta')} style={{ background: 'none', border: 'none', color: '#606770', cursor: 'pointer', padding: '0.5rem' }}><X size={20} /></button>
        </div>
      </div>

      <form onSubmit={handleCreateEntity} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f0f2f5', borderRadius: '0 0 8px 8px', overflow: 'visible' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', flex: 1, padding: '1.5rem 2rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {activeTab === 'campaigns' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>KAMPANYA ADI *</label>
                    <input required className="form-control" value={createFormData.name || ''} onChange={e => setCreateFormData({ ...createFormData, name: e.target.value })} placeholder="Örn: Terapiyle Kayıt Reklamı 11.02" style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
                  </div>
                </div>
                
                <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Kampanya Detayları</h3>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Özel Reklam Kategorileri</label>
                    <select disabled style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#606770', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem' }}><option>Hiçbir Kategori Seçilmedi</option></select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Satın Alma Türü</label>
                      <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#606770' }}>Açık Artırma</div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Kampanya Amacı</label>
                      <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#606770' }}>Trafik / Üye Kaydı</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Kampanya Bütçesi</h3>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Günlük Bütçe (TL) *</label>
                    <input type="number" required className="form-control" value={createFormData.daily_budget || ''} onChange={e => setCreateFormData({ ...createFormData, daily_budget: e.target.value })} placeholder="Örn: 500" style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Kampanya Durumu</label>
                    <select value={createFormData.status || 'ACTIVE'} onChange={e => setCreateFormData({ ...createFormData, status: e.target.value })} style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
                      <option value="ACTIVE">Aktif (Hemen Başlat)</option>
                      <option value="PAUSED">Durdurulmuş (Taslak)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'adsets' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>REKLAM SETİ ADI *</label>
                    <input required className="form-control" value={createFormData.name || ''} onChange={e => setCreateFormData({ ...createFormData, name: e.target.value })} placeholder="Örn: Terapiyle Reklam Seti 1" style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>ÜST KAMPANYA SEÇİN *</label>
                    <select required value={createFormData.parent_id || ''} onChange={e => setCreateFormData({ ...createFormData, parent_id: e.target.value })} style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
                      <option value="">Seçiniz...</option>
                      {campaigns.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Bütçe ve Durum</h3>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Günlük Bütçe (TL) *</label>
                    <input type="number" required className="form-control" value={createFormData.daily_budget || ''} onChange={e => setCreateFormData({ ...createFormData, daily_budget: e.target.value })} placeholder="Örn: 500" style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>İlk Durum</label>
                    <select value={createFormData.status || 'ACTIVE'} onChange={e => setCreateFormData({ ...createFormData, status: e.target.value })} style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
                      <option value="ACTIVE">Aktif (Hemen Başlat)</option>
                      <option value="PAUSED">Durdurulmuş (Taslak)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ads' && renderAdFormFields(createFormData, setCreateFormData, true, true)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingRight: '0.5rem' }}>
            {activeTab === 'ads' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1c1e21' }}>Reklam Önizlemesi</span>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem', background: '#e4e6eb', padding: '3px', borderRadius: '8px', marginBottom: '1.2rem', width: '100%' }}>
                  <button type="button" onClick={() => setPreviewPlacement('fb_feed')} style={{ flex: 1, padding: '0.5rem 0.2rem', fontSize: '0.7rem', borderRadius: '6px', border: 'none', background: previewPlacement === 'fb_feed' ? '#ffffff' : 'transparent', color: previewPlacement === 'fb_feed' ? '#1c1e21' : '#606770', boxShadow: previewPlacement === 'fb_feed' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontWeight: 600 }}>Facebook Akış</button>
                  <button type="button" onClick={() => setPreviewPlacement('ig_feed')} style={{ flex: 1, padding: '0.5rem 0.2rem', fontSize: '0.7rem', borderRadius: '6px', border: 'none', background: previewPlacement === 'ig_feed' ? '#ffffff' : 'transparent', color: previewPlacement === 'ig_feed' ? '#1c1e21' : '#606770', boxShadow: previewPlacement === 'ig_feed' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontWeight: 600 }}>Instagram Akış</button>
                  <button type="button" onClick={() => setPreviewPlacement('ig_stories')} style={{ flex: 1, padding: '0.5rem 0.2rem', fontSize: '0.7rem', borderRadius: '6px', border: 'none', background: previewPlacement === 'ig_stories' ? '#ffffff' : 'transparent', color: previewPlacement === 'ig_stories' ? '#1c1e21' : '#606770', boxShadow: previewPlacement === 'ig_stories' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontWeight: 600 }}>Hikaye & Reels</button>
                </div>

                <div style={{ 
                  width: '100%', maxWidth: '310px', background: '#1a1a1a', borderRadius: '40px', padding: '10px',
                  border: '3px solid #333', boxShadow: '0 20px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05) inset',
                  fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box', overflow: 'hidden', position: 'relative'
                }}>
                  <div style={{ width: '100px', height: '22px', background: '#1a1a1a', margin: '0 auto', borderRadius: '0 0 16px 16px', position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2a2a2a', border: '1px solid #333' }}></div>
                    <div style={{ width: '40px', height: '3px', background: '#2a2a2a', borderRadius: '2px' }}></div>
                  </div>
                  <div style={{ borderRadius: '30px', overflow: 'hidden', background: '#ffffff' }}>
                    {renderAdPreview(previewPlacement, createFormData)}
                  </div>
                  <div style={{ width: '100px', height: '4px', background: '#555', margin: '8px auto 2px auto', borderRadius: '2px' }}></div>
                </div>
              </div>
            ) : (
              renderAudienceCard()
            )}
          </div>
        </div>

        <div style={{ padding: '1rem 2rem', display: 'flex', gap: '1rem', borderTop: '1px solid #dddfe2', background: '#ffffff', flexShrink: 0 }}>
          <button type="button" onClick={() => router.push('/dashboard/client/' + clientId + '/meta')} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#ffffff', color: '#4b5563', border: '1px solid #ccd0d5', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>İptal</button>
          <button type="submit" disabled={isCreating} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: isCreating ? '#e2f0d9' : '#42b72a', color: isCreating ? '#a8dca2' : '#ffffff', border: 'none', fontWeight: 700, cursor: isCreating ? 'not-allowed' : 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isCreating && <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>}
            {activeTab === 'campaigns' ? 'Kampanya Oluştur' : activeTab === 'adsets' ? 'Reklam Seti Oluştur' : 'Reklamı Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
}
