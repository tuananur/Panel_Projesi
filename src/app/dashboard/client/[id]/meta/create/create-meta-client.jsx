'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createMetaCampaignAction, createMetaAdSetAction, createMetaAdAction } from '@/app/actions';
import { X, CheckCircle, AlertCircle, Check } from 'lucide-react';


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
  
  const [editName, setEditName] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showObjectiveModal, setShowObjectiveModal] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState('Bilinirlik');
  const objectives = [
    { id: 'Bilinirlik', label: 'Bilinirlik', desc: 'Reklamlarınızı onları hatırlama olasılığı yüksek kişilere gösterin.', icon: '📢' },
    { id: 'Trafik', label: 'Trafik', desc: 'İnsanları web sitenize veya uygulamanıza yönlendirin.', icon: '🖱️' },
    { id: 'Etkileşim', label: 'Etkileşim', desc: 'Daha fazla mesaj, video görüntülemesi veya gönderi etkileşimi alın.', icon: '💬' },
    { id: 'Potansiyel Müşteriler', label: 'Potansiyel Müşteriler', desc: 'İşletmeniz için potansiyel müşteri toplayın.', icon: '📝' },
    { id: 'Uygulama tanıtımı', label: 'Uygulama tanıtımı', desc: 'İnsanları uygulamanızı yüklemeye veya kullanmaya teşvik edin.', icon: '📱' },
    { id: 'Satışlar', label: 'Satışlar', desc: 'Ürün veya hizmetinizi satın alma ihtimali yüksek kişileri bulun.', icon: '🛍️' }
  ];
  const [createFormData, setCreateFormData] = useState({ name: '', daily_budget: '', status: 'ACTIVE', parent_id: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [previewPlacement, setPreviewPlacement] = useState('fb_feed');
  const [showAdvancedPreviewModal, setShowAdvancedPreviewModal] = useState(false);
  const [messageModal, setMessageModal] = useState({ show: false, title: '', message: '', details: '', type: 'error' });

  const StatusToggle = ({ active, onToggle }) => (
    <div onClick={onToggle} style={{ width: '36px', height: '20px', borderRadius: '10px', background: active ? '#1877f2' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-secondary)', position: 'absolute', top: '2px', left: active ? '18px' : '2px', transition: 'all 0.2s', boxShadow: 'none' }} />
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

    const renderAdPreview = (placement, data) => {
    const pageName = data.page_id || 'Terapimle';
    const igHandle = data.instagram_actor_id || 'terapiylecom';
    const imageUrl = data.image_url || 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80';
    const primaryText = data.primary_text || '';
    const headline = data.headline || '';
    const description = data.description || '';
    const cta = data.call_to_action || 'LEARN_MORE';
    const ctaLabel = CTA_LABELS[cta] || 'Daha Fazla Bilgi Al';
    const displayLink = (() => {
      try {
        return new URL(data.display_link || data.website_url || 'https://terapiyle.com/').hostname.toUpperCase();
      } catch(e) {
        return 'TERAPIYLE.COM';
      }
    })();

    if (placement === 'fb_feed') {
      return (
        <div style={{ width: '100%', boxSizing: 'border-box', background: '#ffffff', borderRadius: '8px', border: '1px solid #dddfe2', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 12px 8px 12px', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e7f3ff', border: '1px solid rgba(24,119,242,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1877f2', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 }}>
              {pageName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#050505', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pageName}</span>
                <svg viewBox="0 0 24 24" width="14" height="14" style={{ fill: '#1877f2', flexShrink: 0 }}><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </div>
              <div style={{ fontSize: '11px', color: '#65676b', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}>
                Sponsorlu • <svg viewBox="0 0 16 16" width="10" height="10" style={{ fill: '#65676b' }}><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 01-4.25-1.57c.21-.4.49-.75.83-1.03.41-.33.91-.5 1.42-.5h.67c.36 0 .69-.19.87-.5l.48-.82a1 1 0 00-.09-1.09l-.4-.49a1 1 0 00-.78-.36H5.2c-.37 0-.7-.2-.86-.53l-.22-.44a1 1 0 010-.89l.3-.61c.14-.28.42-.46.73-.49l1.1-.11a1 1 0 00.74-.45l.4-.6a1 1 0 01.83-.45h.71c.38 0 .73-.21.9-.55l.2-.4a1 1 0 00.1-.45V3c.27.05.54.12.8.2v.94c0 .35.19.67.5.85l.8.48c.31.18.5.52.5.88v.25c0 .32.15.62.4.82l.8.64a1 1 0 00.7.27H13c.24 0 .47.09.64.25l.48.48a6.5 6.5 0 01-6.12 7.71z"/></svg>
              </div>
            </div>
            <div style={{ color: '#65676b', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', padding: '0 4px' }}>•••</div>
          </div>
          <div style={{ fontSize: '13px', color: '#050505', padding: '0 12px 10px 12px', whiteSpace: 'pre-wrap', lineHeight: '1.4', wordBreak: 'break-word' }}>
            {primaryText || 'Açıklama girilmedi.'}
          </div>
          <div style={{ width: '100%', height: '180px', background: '#f0f2f5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={imageUrl} alt="Creative" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', background: '#f0f2f5', padding: '10px 12px', gap: '8px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', color: '#65676b', textTransform: 'uppercase', letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayLink}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#050505', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                {headline || 'Başlık girilmedi.'}
              </div>
              {description && (
                <div style={{ fontSize: '11.5px', color: '#65676b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                  {description}
                </div>
              )}
            </div>
            <div style={{ background: '#ffffff', color: '#050505', border: '1px solid #ccd0d5', padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', cursor: 'pointer' }}>
              {ctaLabel}
            </div>
          </div>
          {/* Facebook Feed Likes & Interaction Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '11.5px', color: '#65676b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '15px', height: '15px', borderRadius: '50%', background: '#1877f2', color: '#ffffff', fontSize: '9px' }}>👍</span>
              <span>184 Beğeni</span>
            </div>
            <div>
              <span>24 Yorum • 11 Paylaşım</span>
            </div>
          </div>
          <div style={{ display: 'flex', padding: '2px 4px', fontSize: '12px', color: '#65676b', fontWeight: '600' }}>
            <button type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'none', border: 'none', padding: '6px 0', color: '#65676b', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              <span>👍</span> Beğen
            </button>
            <button type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'none', border: 'none', padding: '6px 0', color: '#65676b', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              <span>💬</span> Yorum Yap
            </button>
            <button type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'none', border: 'none', padding: '6px 0', color: '#65676b', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              <span>↩️</span> Paylaş
            </button>
          </div>
        </div>
      );
    }

    if (placement === 'ig_feed') {
      return (
        <div style={{ width: '100%', boxSizing: 'border-box', background: '#ffffff', borderRadius: '8px', border: '1px solid #dddfe2', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', padding: '1.5px', boxSizing: 'border-box', flexShrink: 0 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '10px', fontWeight: 'bold' }}>
                {igHandle.charAt(0).toUpperCase()}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#262626', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{igHandle}</div>
              <div style={{ fontSize: '11px', color: '#262626', marginTop: '1px' }}>Sponsorlu</div>
            </div>
            <div style={{ color: '#262626', fontSize: '14px', cursor: 'pointer', padding: '0 4px' }}>•••</div>
          </div>
          {/* Image */}
          <div style={{ width: '100%', height: '180px', background: '#f0f2f5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={imageUrl} alt="Creative" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {/* Instagram Blue CTA Banner directly below image */}
          <div style={{ background: '#0095f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', cursor: 'pointer' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#ffffff', letterSpacing: '0.03em' }}>{ctaLabel.toUpperCase()}</span>
            <span style={{ fontSize: '11px', color: '#ffffff' }}>➔</span>
          </div>
          {/* Instagram Action Icons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px 4px 10px', color: '#262626', fontSize: '20px', lineHeight: '1' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ cursor: 'pointer', fontSize: '18px' }}>❤️</span>
              <span style={{ cursor: 'pointer', fontSize: '18px' }}>💬</span>
              <span style={{ cursor: 'pointer', fontSize: '18px' }}>✈️</span>
            </div>
            <span style={{ cursor: 'pointer', fontSize: '18px' }}>📥</span>
          </div>
          {/* Likes count & caption */}
          <div style={{ padding: '0 10px 10px 10px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#262626', marginBottom: '4px' }}>
              1.482 beğenme
            </div>
            <div style={{ fontSize: '12.5px', color: '#262626', lineHeight: '1.4', maxHeight: '60px', overflowY: 'auto' }}>
              <span style={{ fontWeight: '600', marginRight: '6px' }}>{igHandle}</span>
              {primaryText || 'Açıklama girilmedi.'}
            </div>
            <div style={{ fontSize: '10px', color: '#8e8e8e', marginTop: '6px', textTransform: 'uppercase', display: 'flex', gap: '6px' }}>
              <span>1 gün önce</span>
              <span>•</span>
              <span style={{ fontWeight: '600', color: '#262626', cursor: 'pointer' }}>Çeviriyi Gör</span>
            </div>
          </div>
        </div>
      );
    }

    if (placement === 'ig_stories' || placement === 'fb_stories' || placement === 'messenger_stories') {
      const platformLabel = placement === 'ig_stories' ? 'Instagram' : placement === 'fb_stories' ? 'Facebook' : 'Messenger';
      return (
        <div style={{ width: '100%', height: '280px', position: 'relative', overflow: 'hidden', borderRadius: '8px', boxSizing: 'border-box', border: '1px solid #dddfe2', background: '#000000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
          <img src={imageUrl} alt="Creative" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.95 }} />
          {/* Gradients */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)', zIndex: 1 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', zIndex: 1 }} />
          
          {/* Progress bar */}
          <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', display: 'flex', gap: '3px', zIndex: 2 }}>
            <div style={{ flex: 1, height: '2px', background: '#ffffff', borderRadius: '1px' }} />
          </div>

          {/* Header */}
          <div style={{ position: 'absolute', top: '14px', left: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2 }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #ffffff', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '9px', fontWeight: 'bold', flexShrink: 0 }}>
              {igHandle.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{igHandle}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Sponsorlu ({platformLabel})</div>
            </div>
            <div style={{ color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: '12px' }}>•••</div>
          </div>

          {/* Text Overlay */}
          <div style={{ position: 'absolute', bottom: '55px', left: '10px', right: '10px', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{headline || 'Başlık girilmedi.'}</div>
            <div style={{ fontSize: '10.5px', color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)', maxHeight: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', lineHeight: '1.3' }}>{primaryText}</div>
          </div>

          {/* CTA Swipe Up at the bottom */}
          <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', zIndex: 2 }}>
            <span style={{ fontSize: '8px', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>▲</span>
            <div style={{ background: '#ffffff', color: '#000000', padding: '5px 14px', borderRadius: '14px', fontSize: '11px', fontWeight: '600', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', cursor: 'pointer', textAlign: 'center' }}>
              {ctaLabel}
            </div>
          </div>
        </div>
      );
    }

    if (placement === 'ig_reels' || placement === 'fb_reels') {
      const platformLabel = placement === 'ig_reels' ? 'Instagram' : 'Facebook';
      return (
        <div style={{ width: '100%', height: '280px', position: 'relative', overflow: 'hidden', borderRadius: '8px', boxSizing: 'border-box', border: '1px solid #dddfe2', background: '#000000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
          <img src={imageUrl} alt="Creative" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          {/* Gradients */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)', zIndex: 1 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', zIndex: 1 }} />
          
          <div style={{ position: 'absolute', top: '10px', left: '10px', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', zIndex: 2, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {platformLabel} Reels
          </div>

          <div style={{ position: 'absolute', right: '8px', bottom: '50px', display: 'flex', flexDirection: 'column', gap: '10px', color: '#fff', fontSize: '18px', zIndex: 2, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', cursor: 'pointer' }}>
              <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>❤️</span>
              <span style={{ fontSize: '8px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Beğen</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', cursor: 'pointer' }}>
              <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>💬</span>
              <span style={{ fontSize: '8px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Yorum</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', cursor: 'pointer' }}>
              <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>✈️</span>
              <span style={{ fontSize: '8px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Paylaş</span>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '35px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ffffff', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                {igHandle.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {igHandle} • Sponsorlu
              </div>
            </div>
            <div style={{ fontSize: '10px', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.5)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>{primaryText}</div>
            <div style={{ background: '#0095f6', color: '#ffffff', padding: '6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', textAlign: 'center', marginTop: '4px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
              {ctaLabel} ➔
            </div>
          </div>
        </div>
      );
    }

    if (placement === 'threads') {
      return (
        <div style={{ width: '100%', boxSizing: 'border-box', background: '#ffffff', borderRadius: '8px', padding: '12px', border: '1px solid #dddfe2', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
              {igHandle.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#000000' }}>{igHandle}</span>
                <span style={{ fontSize: '11px', color: '#999999' }}>Sponsorlu (Threads)</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#000000', marginTop: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                {primaryText}
              </div>
              <div style={{ marginTop: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: '#ffffff' }}>
                <div style={{ height: '120px', overflow: 'hidden' }}>
                  <img src={imageUrl} alt="Creative" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#999999', textTransform: 'lowercase' }}>{displayLink}</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>{headline}</div>
                  </div>
                  <div style={{ background: '#000000', color: '#ffffff', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                    {ctaLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (placement === 'search_results') {
      return (
        <div style={{ width: '100%', boxSizing: 'border-box', background: '#ffffff', borderRadius: '8px', padding: '10px', border: '1px solid #dddfe2', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', color: '#65676b', fontWeight: '600' }}>Arama Sonucu • Sponsorlu</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1877f2', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {headline || 'Başlık'}
              </div>
              <div style={{ fontSize: '12px', color: '#050505', marginTop: '2px', lineHeight: '1.35', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {primaryText}
              </div>
              <div style={{ fontSize: '11px', color: '#65676b', marginTop: '4px', textTransform: 'lowercase' }}>
                {displayLink}
              </div>
            </div>
            <div style={{ width: '60px', height: '60px', background: '#f0f2f5', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, border: '1px solid #e5e7eb' }}>
              <img src={imageUrl} alt="Creative" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      );
    }
  };

const renderAdFormFields = (data, setData, isCreate, isEditing) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.8rem' }}>
      {showObjectiveModal && activeTab === 'campaigns' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '0', overflow: 'hidden', background: 'var(--bg-primary)' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Kampanya Amacınızı Seçin</h3>
              <button onClick={() => setShowObjectiveModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {objectives.map(obj => (
                <div 
                  key={obj.id}
                  onClick={() => setSelectedObjective(obj.id)}
                  style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    padding: '1rem', 
                    border: selectedObjective === obj.id ? '2px solid #1877f2' : '1px solid var(--border-color)', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    background: selectedObjective === obj.id ? 'rgba(24, 119, 242, 0.05)' : 'var(--bg-secondary)'
                  }}
                >
                  <div style={{ fontSize: '1.5rem' }}>{obj.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{obj.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{obj.desc}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: selectedObjective === obj.id ? '6px solid #1877f2' : '2px solid var(--border-color)', background: '#fff' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--bg-secondary)' }}>
              <button onClick={() => setShowObjectiveModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>İptal</button>
              <button onClick={() => setShowObjectiveModal(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#1877f2', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Devam Et</button>
            </div>
          </div>
        </div>
      )}
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
    const renderAudienceCard = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%' }}>
        {/* Hedef Kitle Tanımı */}
        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>Hedef Kitle Tanımı</h3>
          <div style={{ position: 'relative', height: '12px', background: 'linear-gradient(to right, #f59e0b 0%, #45bd62 40%, #45bd62 60%, #3b82f6 100%)', borderRadius: '6px', marginTop: '0.5rem' }}>
            <div style={{ position: 'absolute', top: '-4px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '3px solid #45bd62', boxShadow: 'none' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>Özel</span>
            <span style={{ color: '#45bd62' }}>Tanımlı</span>
            <span>Geniş</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: '1.35' }}>
            Hedef kitleniz tanımlı. Potansiyel erişim genişliği dengeli ve dönüşüm olasılığı yüksektir.
          </p>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem', marginTop: '0.2rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>POTANSİYEL ERİŞİM</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>32.400.000 - 38.100.000 kişi</div>
          </div>
        </div>

        {/* Tahmini Günlük Sonuçlar */}
        <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>Tahmini Günlük Sonuçlar</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
            Tahminler, ortalama bütçenize ve hedef kitle verilerinize dayanır.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ERİŞİM</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>4.5B - 13B</div>
              <div style={{ height: '4px', background: '#3b82f6', borderRadius: '2px', width: '60%', marginTop: '0.4rem' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>BAĞLANTI TIKLAMALARI</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>120 - 350</div>
              <div style={{ height: '4px', background: '#45bd62', borderRadius: '2px', width: '45%', marginTop: '0.4rem' }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
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

      <div style={{ padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', borderRadius: '8px 8px 0 0' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Yeni {activeTab === 'campaigns' ? 'Kampanya' : activeTab === 'adsets' ? 'Reklam Seti' : 'Reklam'}
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => { setActiveTab('campaigns'); setCreateFormData({ name: '', daily_budget: '', status: 'ACTIVE', parent_id: '' }); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: activeTab === 'campaigns' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'campaigns' ? '#fff' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Kampanya</button>
          <button onClick={() => { setActiveTab('adsets'); setCreateFormData({ name: '', daily_budget: '', status: 'ACTIVE', parent_id: '' }); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: activeTab === 'adsets' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'adsets' ? '#fff' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Reklam Seti</button>
          <button onClick={() => { setActiveTab('ads'); setCreateFormData({ name: 'Yeni Etkileşim Reklamı', parent_id: '', status: 'ACTIVE', website_url: 'https://terapiyle.com/', display_link: 'https://terapiyle.com/', primary_text: 'Bazen sadece doğru uzmanla konuşmak her şeyi değiştirir...', headline: 'Terapiyle Sana En Uygun Terapisti Bul', call_to_action: 'LEARN_MORE', page_id: 'Terapimle', instagram_actor_id: 'terapiylecom', pixel_id: '1850906787926541', image_url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80' }); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: activeTab === 'ads' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'ads' ? '#fff' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Reklam</button>
          <button onClick={() => router.push('/dashboard/client/' + clientId + '/meta')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}><X size={20} /></button>
        </div>
      </div>

      <form onSubmit={handleCreateEntity} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'ads' ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', flex: 1, padding: '1.5rem 2rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {activeTab === 'campaigns' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                      </div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>Kampanya Adı</label>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input required className="form-control" value={createFormData.name || ''} onChange={e => setCreateFormData({ ...createFormData, name: e.target.value })} placeholder={"Örn: Yeni " + selectedObjective + " Kampanyası"} style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
                      <button type="button" style={{ padding: '0.65rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Şablon Oluştur</button>
                    </div>
                  </div>
                </div>

                {selectedObjective === 'Bilinirlik' && (
                  <>
                    {/* Özel Reklam Kategorileri Kartı */}
                    <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={10} color="#10b981" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>Özel Reklam Kategorileri</h3>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Reklamlarınızın finansal ürünler ve hizmetler, istihdam, konut ya da sosyal meseleler, seçimler veya siyasetle ilgili olup olmadığını beyan ederek reklamlarınızın reddedilmesini önleyin. Koşullar ülkeye göre değişir. <span style={{ color: '#1877f2', cursor: 'pointer' }}>Özel Reklam Kategorileri Hakkında</span></p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Kategoriler</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bu kampanyanın neyin reklamını yapacağını en iyi tanımlayan kategorileri seçin.</div>
                        <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                          <option>Varsa kategori beyan et</option>
                          <option>Finansal ürünler ve hizmetler</option>
                          <option>İstihdam</option>
                          <option>Konut</option>
                          <option>Sosyal Meseleler, Seçimler veya Siyaset</option>
                        </select>
                      </div>
                    </div>

                    {/* Canlı Video Reklamı Kartı */}
                    <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Canlı video reklamı</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{createFormData.live_video_ad ? 'Açık' : 'Kapalı'}</span>
                          <div 
                            onClick={() => setCreateFormData({ ...createFormData, live_video_ad: !createFormData.live_video_ad })}
                            style={{ width: '40px', height: '22px', background: createFormData.live_video_ad ? '#1877f2' : '#e5e7eb', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: '0.2s' }}
                          >
                            <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: createFormData.live_video_ad ? '20px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Canlı video reklam için önerilen ayarları kullanın. Bu ayarlar, reklamlarınızı daha verimli şekilde sunmak ve etkileşimi artırmak için bütçenizi ve planınızı ayarlayacaktır.</p>
                      
                      {createFormData.live_video_ad && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Canlı video konumu</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>Canlı videonu nerede yayınlayacağını seç.</div>
                          <div style={{ background: 'rgba(24, 119, 242, 0.05)', border: '1px solid #1877f2', borderRadius: '6px', padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '5px solid #1877f2', background: '#fff' }} />
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#1877f2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>f</div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Facebook</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Kampanya Detayları Kartı */}
                    <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>Kampanya Detayları</h3>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Satın Alma Türü</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Açık Artırma</div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}>Kampanya amacı <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedObjective}</div>
                        </div>
                        <button type="button" onClick={() => setShowObjectiveModal(true)} style={{ background: 'none', border: 'none', color: '#1877f2', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Düzenle</button>
                      </div>
                    </div>

                    {/* A/B Testi Kartı */}
                    <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={10} color="#10b981" />
                          </div>
                          <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>A/B Testi</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{createFormData.ab_test ? 'Açık' : 'Kapalı'}</span>
                          <div 
                            onClick={() => setCreateFormData({ ...createFormData, ab_test: !createFormData.ab_test })}
                            style={{ width: '40px', height: '22px', background: createFormData.ab_test ? '#1877f2' : '#e5e7eb', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: '0.2s' }}
                          >
                            <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: createFormData.ab_test ? '20px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Hangisinin en iyi sonucu verdiğini görmek için sürümleri karşılaştırarak reklam performansını artırmaya yardımcı olun. Doğru sonuçlar için, sürümlerin her biri hedef kitlenizin ayrı gruplarına gösterilecektir. <span style={{ color: '#1877f2', cursor: 'pointer' }}>A/B testleri hakkında</span></p>

                      {createFormData.ab_test && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                          <div style={{ position: 'relative' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Neyi test etmek istiyorsunuz?</div>
                            <div 
                              onClick={() => setCreateFormData({ ...createFormData, abTestDropdownOpen: !createFormData.abTestDropdownOpen })}
                              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                              {createFormData.abTestType || 'Kreatif'}
                              <span style={{ fontSize: '0.7rem' }}>▼</span>
                            </div>
                            
                            {createFormData.abTestDropdownOpen && (
                              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '0.5rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.4rem 0.6rem', background: 'var(--bg-primary)' }}>
                                    <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem', fontSize: '12px' }}>🔍</span>
                                    <input 
                                      type="text" 
                                      placeholder="Ara" 
                                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                                    />
                                  </div>
                                </div>
                                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                  {[
                                    { id: 'Kreatif', title: 'Kreatif', desc: 'Hangi görsellerin, videoların veya reklam metninin en iyi sonucu verdiğini öğrenin.' },
                                    { id: 'Hedef Kitle', title: 'Hedef Kitle', desc: 'Yeni bir hedef kitleyi hedeflemenin performansı nasıl etkileyebileceğini görün.' },
                                    { id: 'Reklam Alanı', title: 'Reklam Alanı', desc: 'Reklamlarınızı göstermek için en etkili yerleri keşfedin.' },
                                    { id: 'Özel', title: 'Özel', desc: 'Birden fazla değişkeni değiştirmenin sonuçları nasıl etkileyebileceğini öğrenin.' }
                                  ].map(opt => (
                                    <div 
                                      key={opt.id}
                                      onClick={() => setCreateFormData({ ...createFormData, abTestType: opt.id, abTestDropdownOpen: false })}
                                      style={{ padding: '0.6rem 0.8rem', display: 'flex', gap: '0.8rem', cursor: 'pointer', background: (createFormData.abTestType || 'Kreatif') === opt.id ? 'rgba(24,119,242,0.1)' : 'transparent', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                                    >
                                      <div style={{ marginTop: '2px' }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: (createFormData.abTestType || 'Kreatif') === opt.id ? '5px solid #1877f2' : '1px solid var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }} />
                                      </div>
                                      <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{opt.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{opt.desc}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Test ne kadar süreyle yürütülmeli?</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Testiniz bu kadar gün boyunca veya reklam setiniz sona erene kadar çalışacak.</div>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                              <input type="number" defaultValue="7" style={{ width: '100%', border: 'none', background: 'transparent', padding: '0.65rem 0.85rem', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }} />
                              <span style={{ padding: '0 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderLeft: '1px solid var(--border-color)' }}>gün</span>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>Performansı nasıl karşılaştırmak istersiniz? <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></div>
                            <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
                              <option>Sonuç başına ücret</option>
                              <option>Alışveriş Başına Ücret</option>
                              <option>CPC (Bağlantı Tıklaması Başına Ücret)</option>
                              <option>Erişilen 1.000 Meta Hesabı başına ücret</option>
                              <optgroup label="Standart Olaylar">
                                <option>3 saniyelik video oynatımı başına ücret</option>
                                <option>Arama Başına Ücret</option>
                                <option>Atlanan Seviye Başına Ücret</option>
                                <option>Açılan Başarılar Başına Ücret</option>
                                <option>Başlatılan Alışveriş Başına Ücret</option>
                                <option>Beğenme başına ücret</option>
                                <option>Dilek Listesine Ekleme Başına Ücret</option>
                                <option>Etkinlik yanıtı başına ücret</option>
                                <option>Gönderi Etkileşimi Başına Ücret</option>
                                <option>Gönderilen Puan Başına Ücret</option>
                                <option>Kredi harcaması başına ücret</option>
                                <option>Mobil Uygulamada 2 Günlük Tutma Başına Ücret</option>
                                <option>Mobil Uygulamada 7 Günlük Tutma Başına Ücret</option>
                                <option>Potansiyel Müşteri Başına Ücret</option>
                                <option>Reklam hatırlanırlığı yükselişi başına ücret</option>
                                <option>Sepete Ekleme Başına Ücret</option>
                                <option>Tamamlanan Eğitim Başına Ücret</option>
                                <option>Tamamlanan Kayıt Başına Ücret</option>
                                <option>Uygulama Aktivasyonu Başına Ücret</option>
                                <option>Uygulama Yükleme Başına Ücret</option>
                                <option>Yeni mesajlaşma kişisi başına ücret</option>
                                <option>Yönlendirme Sayfası Görüntülemesi Başına Ücret</option>
                                <option>Çevrimdışı Diğer Dönüşümler Başına Ücret</option>
                                <option>Ödeme Bilgisi Ekleme Başına Ücret</option>
                                <option>Özel Olay Başına Ücret</option>
                                <option>İçerik Görüntülemesi Başına Ücret</option>
                              </optgroup>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Advantage+ Kampanya Bütçesi Kartı */}
                    <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>Advantage+ kampanya bütçesi ✨</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{createFormData.advantage_budget !== false ? 'Açık' : 'Kapalı'}</span>
                          <div 
                            onClick={() => setCreateFormData({ ...createFormData, advantage_budget: createFormData.advantage_budget === false ? true : false })}
                            style={{ width: '40px', height: '22px', background: createFormData.advantage_budget !== false ? '#1877f2' : '#e5e7eb', borderRadius: '11px', position: 'relative', cursor: 'pointer', transition: '0.2s' }}
                          >
                            <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: createFormData.advantage_budget !== false ? '20px' : '2px', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Daha fazla sonuç elde etmek için bütçenizi reklam setlerine dağıtın. Her bir reklam seti için harcamayı kontrol edebilirsiniz. <span style={{ color: '#1877f2', cursor: 'pointer' }}>Advantage+ kampanya bütçesi hakkında</span></p>

                      {createFormData.advantage_budget === false && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <input type="checkbox" defaultChecked style={{ marginTop: '3px' }} />
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>Bütçenizin bir kısmını diğer reklam setleriyle paylaşın <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Performansı artırma olasılığı yüksek olduğunda, reklam seti bütçenizin %20 kadarını bu kampanyadaki diğer reklam setleriyle paylaşacağız. <span style={{ color: '#1877f2', cursor: 'pointer' }}>Reklam seti bütçe paylaşımı hakkında</span></div>
                            </div>
                          </div>
                          <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.2rem' }}>Kampanya Teklif Stratejisi <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></label>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>En yüksek hacim</div>
                          </div>
                        </div>
                      )}

                      {createFormData.advantage_budget !== false && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>Bütçe <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <select style={{ width: '140px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
                                <option>Günlük bütçe</option>
                                <option>Toplam bütçe</option>
                              </select>
                              <div style={{ flex: 1, position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TL</span>
                                <input type="number" required className="form-control" value={createFormData.daily_budget || ''} onChange={e => setCreateFormData({ ...createFormData, daily_budget: e.target.value })} placeholder="0,00" style={{ width: '100%', background: 'var(--bg-secondary)', border: `1px solid ${Number(createFormData.daily_budget) < 13 && createFormData.daily_budget ? '#ef4444' : 'var(--border-color)'}`, color: 'var(--text-primary)', padding: '0.65rem 0.85rem 0.65rem 2rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: Number(createFormData.daily_budget) < 13 && createFormData.daily_budget ? '#ef4444' : 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>TRY {Number(createFormData.daily_budget) < 13 && createFormData.daily_budget && <span style={{ color: '#ef4444', fontWeight: 900 }}>⊘</span>}</span>
                              </div>
                            </div>
                            {Number(createFormData.daily_budget) < 13 && createFormData.daily_budget ? (
                              <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>Bütçeniz çok düşük. Devam etmek için bütçenizi artırın.</div>
                            ) : null}
                            {createFormData.daily_budget && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.8rem', lineHeight: '1.4' }}>
                                Günde ortalama {Number(createFormData.daily_budget).toFixed(2).replace('.', ',')} TL harcayacaksın. Maksimum günlük harcaman <strong>{(Number(createFormData.daily_budget) * 1.75).toFixed(2).replace('.', ',')} TL</strong>, maksimum haftalık harcaman <strong>{(Number(createFormData.daily_budget) * 7).toFixed(2).replace('.', ',')} TL</strong>. <br/><span style={{ color: '#1877f2', cursor: 'pointer' }}>Günlük bütçe hakkında</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.2rem' }}>Kampanya Teklif Stratejisi <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></label>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Reklam açık artırmalarında nasıl teklif vereceğimiz.</div>
                            <select style={{ width: '100%', maxWidth: '250px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
                              <option>En yüksek hacim</option>
                              <option>Sonuç başına ücret hedefi</option>
                              <optgroup label="Diğer seçenekler">
                                <option>Teklif üst sınırı</option>
                              </optgroup>
                            </select>
                          </div>

                          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <div style={{ color: '#1877f2', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginBottom: '0.8rem' }} onClick={() => setCreateFormData({ ...createFormData, hideOptions: !createFormData.hideOptions })}>
                              {createFormData.hideOptions ? 'Seçenekleri Göster ▴' : 'Seçenekleri Gizle ▴'}
                            </div>
                            
                            {!createFormData.hideOptions && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>Bütçe planlama <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></div>
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Belirli gün veya saatlerde bütçenizi artırın.</div>
                                  
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <input type="checkbox" checked={createFormData.planIncreases || false} onChange={e => setCreateFormData({ ...createFormData, planIncreases: e.target.checked })} style={{ cursor: 'pointer' }} />
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Bütçe artışlarını planlayın</span>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                      <button 
                                        type="button" 
                                        onClick={() => setCreateFormData({ ...createFormData, gorDropdownOpen: !createFormData.gorDropdownOpen })}
                                        style={{ background: '#f0f2f5', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                      >
                                        Gör ▾
                                      </button>
                                      {createFormData.gorDropdownOpen && (
                                        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: '220px', padding: '0.5rem 0' }}>
                                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Filtrele</div>
                                          
                                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                                            <span>Yaklaşan girişler</span>
                                            <span style={{ background: '#e6f4ea', color: '#137333', fontSize: '0.7rem', padding: '0 6px', borderRadius: '10px', fontWeight: 600 }}>1</span>
                                          </div>
                                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                                            <span>Tamamlanan girişler</span>
                                            <span style={{ background: '#f1f3f4', color: '#5f6368', fontSize: '0.7rem', padding: '0 6px', borderRadius: '10px', fontWeight: 600 }}>0</span>
                                          </div>
                                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', background: '#e7f3ff', cursor: 'pointer' }}>
                                            <span>Tüm girişler</span>
                                            <span style={{ background: '#f0f2f5', color: '#1c1e21', border: '1px solid #ced0d4', fontSize: '0.7rem', padding: '0 6px', borderRadius: '10px', fontWeight: 600 }}>1</span>
                                          </div>

                                          <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.4rem 0' }}></div>
                                          
                                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sırala</div>
                                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <span style={{ fontSize: '1rem', lineHeight: '10px' }}>↑</span> En yeniden en eskiye sırala
                                          </div>
                                          <div style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <span style={{ fontSize: '1rem', lineHeight: '10px' }}>↓</span> En eskiden en yeniye sırala
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                  {createFormData.planIncreases && (
                                    <div style={{ marginTop: '0.8rem', padding: '1rem', background: 'rgba(24, 119, 242, 0.05)', borderRadius: '8px', border: '1px solid rgba(24, 119, 242, 0.2)' }}>
                                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                                        Bütçe artışı için süre <span style={{ fontSize: '0.85rem' }}>⌃</span>
                                      </div>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '0.8rem' }}>
                                        <div>
                                          <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>Başlangıç</div>
                                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                                            <input type="text" defaultValue="Haz 13, 2026" className="form-control" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                                            <input type="text" defaultValue="00:00" className="form-control" style={{ width: '60px', padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                                          </div>
                                        </div>
                                        <div style={{ marginTop: '1rem' }}>-</div>
                                        <div>
                                          <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>Bitiş</div>
                                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                                            <input type="text" defaultValue="Haz 14, 2026" className="form-control" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                                            <input type="text" defaultValue="00:00" className="form-control" style={{ width: '60px', padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                                          </div>
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <select style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', background: '#fff' }}>
                                          <option>Günlük bütçeyi değer miktarına göre artır (TL)</option>
                                        </select>
                                        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', width: '90px' }}>
                                          <span style={{ fontSize: '0.75rem', paddingLeft: '0.5rem', color: 'var(--text-secondary)' }}>TL</span>
                                          <input type="text" defaultValue="1,88" style={{ width: '100%', padding: '0.5rem 0.2rem', fontSize: '0.75rem', border: 'none', outline: 'none' }} />
                                          <span style={{ fontSize: '0.75rem', paddingRight: '0.5rem', color: 'var(--text-secondary)' }}>TRY</span>
                                        </div>
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>Meta 13 Haz ile 14 Haz arasında günde 9,38 TL harcamayı amaçlayacak (1,88 TL artış).</div>
                                      <button type="button" style={{ background: '#fff', border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                        <X size={12} /> Bu dönemi kaldır
                                      </button>
                                      
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                        <button type="button" style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                          <span style={{ fontSize: '1rem', lineHeight: '10px' }}>⊕</span> Başka bir zaman aralığı ekle
                                        </button>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>1/50 zaman dilimi</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.2rem' }}>Reklam Planlaması <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--text-secondary)', color: 'var(--bg-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span></div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reklamları sürekli yayınla</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {selectedObjective !== 'Bilinirlik' && (
                  <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>Kampanya Detayları</h3>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>KAMPANYA AMACI</label>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{selectedObjective}</span>
                        <button type="button" onClick={() => setShowObjectiveModal(true)} style={{ background: 'none', border: 'none', color: '#1877f2', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Değiştir</button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Bütçe Türü</label>
                        <select style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
                          <option>Günlük Bütçe</option>
                          <option>Toplam Bütçe</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Tutar (TL) *</label>
                        <input type="number" required className="form-control" value={createFormData.daily_budget || ''} onChange={e => setCreateFormData({ ...createFormData, daily_budget: e.target.value })} placeholder="Örn: 500" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {activeTab === 'adsets' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>REKLAM SETİ ADI *</label>
                    <input required className="form-control" value={createFormData.name || ''} onChange={e => setCreateFormData({ ...createFormData, name: e.target.value })} placeholder="Örn: Terapiyle Reklam Seti 1" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>ÜST KAMPANYA SEÇİN *</label>
                    <select required value={createFormData.parent_id || ''} onChange={e => setCreateFormData({ ...createFormData, parent_id: e.target.value })} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
                      <option value="">Seçiniz...</option>
                      {campaigns.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>Bütçe ve Durum</h3>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Günlük Bütçe (TL) *</label>
                    <input type="number" required className="form-control" value={createFormData.daily_budget || ''} onChange={e => setCreateFormData({ ...createFormData, daily_budget: e.target.value })} placeholder="Örn: 500" style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>İlk Durum</label>
                    <select value={createFormData.status || 'ACTIVE'} onChange={e => setCreateFormData({ ...createFormData, status: e.target.value })} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '1rem' }}>
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>Gelişmiş Önizleme</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Advantage+ kreatif ile reklamınızın farklı reklam alanlarında nasıl görüneceğini gözden geçirebilirsiniz. Performansı en çok artıracağını tahmin ettiğimiz unsurlara göre reklamınızın varyasyonlarını göstereceğiz.</span>
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Reklamınızın görüleceği şekiller</div>

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
                    <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: p.isMobile ? '260px' : '300px', flexShrink: 0 }}>
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
            ) : (
              renderAudienceCard()
            )}
          </div>
        </div>

        <div style={{ padding: '1rem 2rem', display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
          <button type="button" onClick={() => router.push('/dashboard/client/' + clientId + '/meta')} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>İptal</button>
          <button type="submit" disabled={isCreating} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: isCreating ? '#e2f0d9' : '#42b72a', color: isCreating ? '#a8dca2' : 'var(--bg-secondary)', border: 'none', fontWeight: 700, cursor: isCreating ? 'not-allowed' : 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isCreating && <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid var(--bg-secondary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>}
            {activeTab === 'campaigns' ? 'Kampanya Oluştur' : activeTab === 'adsets' ? 'Reklam Seti Oluştur' : 'Reklamı Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
}
