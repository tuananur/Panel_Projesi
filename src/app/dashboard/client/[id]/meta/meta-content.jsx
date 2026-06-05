'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toggleMetaStatusAction, createMetaCampaignAction, createMetaAdSetAction, createMetaAdAction, updateMetaEntityAction, deleteMetaEntityAction } from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';
import {
  TrendingUp, MousePointer2, Eye, Users as UsersIcon,
  Wallet, Search, Calendar, ChevronRight,
  AlertCircle, CheckCircle, Play, Pause, BarChart3,
  Edit, Trash2, X, BarChart
} from 'lucide-react';

const DATE_PRESETS = [
  { id: 'today', label: 'Bugün' },
  { id: 'yesterday', label: 'Dün' },
  { id: 'last_7d', label: 'Son 7 Gün' },
  { id: 'last_30d', label: 'Son 30 Gün' },
  { id: 'this_month', label: 'Bu Ay' },
  { id: 'last_month', label: 'Geçen Ay' }
];

const CTA_LABELS = {
  LEARN_MORE: 'Daha Fazla Bilgi Al',
  SIGN_UP: 'Kaydol',
  BOOK_TRAVEL: 'Rezervasyon Yap',
  CONTACT_US: 'Bize Ulaşın',
  APPLY_NOW: 'Başvur'
};

export default function MetaContent({ result, id, datePreset, since: initSince, until: initUntil }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedAdSetId, setSelectedAdSetId] = useState(null);

  const [campaigns, setCampaigns] = useState(result.activeCampaigns || []);
  const [adSets, setAdSets] = useState(result.adSets || []);
  const [ads, setAds] = useState(result.ads || []);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({ name: '', daily_budget: '', status: 'ACTIVE', parent_id: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [previewPlacement, setPreviewPlacement] = useState('fb_feed');
  const [messageModal, setMessageModal] = useState({ show: false, title: '', message: '', details: '', type: 'error' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, entity: null, type: null });
  const [selectedIds, setSelectedIds] = useState([]);

  const [selectedEntity, setSelectedEntity] = useState(null); // { type: 'campaign'|'adset'|'ad', data: object }
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [isEditingEntity, setIsEditingEntity] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editCreativeData, setEditCreativeData] = useState({});

  const [since, setSince] = useState(initSince || '');
  const [until, setUntil] = useState(initUntil || '');

  const handleDateChange = (preset) => {
    setSince('');
    setUntil('');
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('datePreset', preset);
      params.delete('since');
      params.delete('until');
      router.push(`?${params.toString()}`);
    });
  };

  const handleCustomDateApply = () => {
    if (!since || !until) return;
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('datePreset');
      params.set('since', since);
      params.set('until', until);
      router.push(`?${params.toString()}`);
    });
  };

  const handleDeleteEntity = (entity, type) => {
    setDeleteConfirm({ show: true, entity, type });
  };

  const confirmDelete = async () => {
    const { entity, type } = deleteConfirm;
    if (!entity) return;
    setDeleteConfirm({ ...deleteConfirm, show: false });
    
    startTransition(async () => {
      if (type === 'bulk') {
        let successCount = 0;
        let errorCount = 0;
        for (const entityId of selectedIds) {
          const res = await deleteMetaEntityAction(id, entityId);
          if (res?.error) errorCount++;
          else successCount++;
        }
        setSelectedIds([]);
        setMessageModal({ 
          show: true, 
          title: 'Toplu Silme Tamamlandı', 
          message: `${successCount} öğe silindi. ${errorCount > 0 ? errorCount + ' öğede hata oluştu.' : ''}`,
          type: errorCount > 0 ? 'error' : 'success'
        });
        router.refresh();
      } else {
        const res = await deleteMetaEntityAction(id, entity.id);
        if (res?.error) {
          setMessageModal({ show: true, title: 'Hata', message: 'Silme hatası: ' + res.error, type: 'error' });
        } else {
          if (type === 'campaign') setCampaigns(prev => prev.filter(c => c.id !== entity.id));
          if (type === 'adset') setAdSets(prev => prev.filter(as => as.id !== entity.id));
          if (type === 'ad') setAds(prev => prev.filter(ad => ad.id !== entity.id));
          setMessageModal({ show: true, title: 'Başarılı', message: 'Başarıyla silindi.', type: 'success' });
          if (selectedEntity?.data?.id === entity.id) setShowDetailsPanel(false);
        }
      }
    });
  };

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdSets = adSets.filter(as => {
    const matchesSearch = as.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCampaign = selectedCampaignId ? as.campaign_id === selectedCampaignId : true;
    return matchesSearch && matchesCampaign;
  });

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAdSet = selectedAdSetId ? ad.adset_id === selectedAdSetId : true;
    const matchesCampaign = selectedCampaignId ? adSets.find(as => as.id === ad.adset_id)?.campaign_id === selectedCampaignId : true;
    return matchesSearch && matchesAdSet && matchesCampaign;
  });

  const currentTabItems = activeTab === 'campaigns' ? filteredCampaigns : activeTab === 'adsets' ? filteredAdSets : activeTab === 'ads' ? filteredAds : [];

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentTabItems.length && currentTabItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentTabItems.map(item => item.id));
    }
  };

  const handleBulkStatus = (newStatus) => {
    if (selectedIds.length === 0) return;
    
    startTransition(async () => {
      let successCount = 0;
      let errorCount = 0;
      for (const entityId of selectedIds) {
        const res = await toggleMetaStatusAction(id, entityId, newStatus);
        if (res?.error) errorCount++;
        else successCount++;
      }
      
      setSelectedIds([]);
      setMessageModal({ 
        show: true, 
        title: 'Toplu İşlem Tamamlandı', 
        message: `${successCount} öğe başarıyla güncellendi. ${errorCount > 0 ? errorCount + ' öğede hata oluştu.' : ''}`,
        type: errorCount > 0 ? 'error' : 'success'
      });
      router.refresh();
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirm({ show: true, entity: { name: `${selectedIds.length} öğe` }, type: 'bulk' });
  };

  const handleToggleStatus = async (entityId, currentStatus, type) => {
    const newStatus = currentStatus === 'ACTIVE' || currentStatus === 'ENABLED' ? 'PAUSED' : 'ACTIVE';
    
    if (type === 'campaign') {
      setCampaigns(prev => prev.map(c => c.id === entityId ? { ...c, status: newStatus } : c));
    } else if (type === 'adset') {
      setAdSets(prev => prev.map(a => a.id === entityId ? { ...a, status: newStatus } : a));
    } else if (type === 'ad') {
      setAds(prev => prev.map(a => a.id === entityId ? { ...a, status: newStatus } : a));
    }

    startTransition(async () => {
      const res = await toggleMetaStatusAction(id, entityId, newStatus);
      if (res?.error) {
        setMessageModal({ show: true, title: 'Hata', message: 'Durum güncellenirken hata oluştu: ' + res.error, type: 'error' });
        if (type === 'campaign') setCampaigns(prev => prev.map(c => c.id === entityId ? { ...c, status: currentStatus } : c));
        if (type === 'adset') setAdSets(prev => prev.map(a => a.id === entityId ? { ...a, status: currentStatus } : a));
        if (type === 'ad') setAds(prev => prev.map(a => a.id === entityId ? { ...a, status: currentStatus } : a));
      } else {
        setMessageModal({ show: true, title: 'Başarılı', message: 'Durum başarıyla güncellendi.', type: 'success' });
      }
    });
  };

  const handleCreateEntity = async (e) => {
    e.preventDefault();
    if (!createFormData.name) return;
    setIsCreating(true);
    
    let res;
    if (activeTab === 'campaigns') {
      res = await createMetaCampaignAction(id, createFormData);
    } else if (activeTab === 'adsets') {
      res = await createMetaAdSetAction(id, createFormData);
    } else if (activeTab === 'ads') {
      res = await createMetaAdAction(id, createFormData);
    }
    
    setIsCreating(false);
    
    if (res?.error) {
      setMessageModal({ 
        show: true, 
        title: 'Hata', 
        message: res.error,
        details: res.details || '',
        type: 'error'
      });
    } else {
      setMessageModal({ show: true, title: 'Başarılı', message: 'Başarıyla oluşturuldu!', type: 'success' });
      setShowCreateModal(false);
      const newEntity = { id: res.id, name: createFormData.name, status: createFormData.status, insights: { data: [] } };
      if (activeTab === 'campaigns') setCampaigns([newEntity, ...campaigns]);
      else if (activeTab === 'adsets') setAdSets([newEntity, ...adSets]);
      else if (activeTab === 'ads') setAds([newEntity, ...ads]);
      setCreateFormData({ name: '', daily_budget: '', status: 'ACTIVE', parent_id: '' });
    }
  };

  const handleOpenCreateModal = () => {
    if (activeTab === 'ads') {
      setCreateFormData({
        name: 'Yeni Etkileşim Reklamı',
        parent_id: selectedAdSetId || '',
        status: 'ACTIVE',
        website_url: 'https://terapiyle.com/',
        display_link: 'https://terapiyle.com/',
        primary_text: 'Bazen sadece doğru uzmanla konuşmak her şeyi değiştirir. Terapiyle, seni anlayan terapistle hızlı ve güvenli şekilde eşleşmeni sağlar. Kendin için bir adım at.',
        headline: 'Terapiyle Sana En Uygun Terapisti Bul',
        description: 'Terapiyle. Online, güvenli ve kolay! Dilediğin anda dilediğin uzman...',
        call_to_action: 'LEARN_MORE',
        page_id: 'Terapimle',
        instagram_actor_id: 'terapiylecom',
        pixel_id: '1850906787926541',
        url_params: 'anahtar1=deger1&anahtar2=deger2',
        image_url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80',
      });
    } else {
      setCreateFormData({
        name: '',
        daily_budget: '',
        status: 'ACTIVE',
        parent_id: activeTab === 'adsets' ? (selectedCampaignId || '') : '',
      });
    }
    setShowCreateModal(true);
  };

  const openDetails = (entity, type) => {
    setSelectedEntity({ type, data: entity });
    setEditName(entity.name);
    setEditBudget(entity.daily_budget || entity.lifetime_budget || '0');
    setIsEditingEntity(false);

    if (type === 'ad') {
      const creative = entity.creative || {};
      const objectStorySpec = creative.object_story_spec || {};
      const linkData = objectStorySpec.link_data || {};
      
      setEditCreativeData({
        page_id: objectStorySpec.page_id || 'Terapimle',
        instagram_actor_id: objectStorySpec.instagram_actor_id || 'terapiylecom',
        website_url: linkData.link || entity.link_url || 'https://terapiyle.com/',
        display_link: linkData.display_link || 'https://terapiyle.com/',
        primary_text: linkData.message || creative.body || 'Bazen sadece doğru uzmanla konuşmak...',
        headline: linkData.name || creative.title || creative.name || 'Terapiyle Sana En Uygun Terapisti Bul',
        description: linkData.description || '',
        call_to_action: linkData.call_to_action?.type || 'LEARN_MORE',
        pixel_id: '1850906787926541',
        url_params: entity.url_tags || 'anahtar1=deger1&anahtar2=deger2',
        image_url: creative.image_url || creative.thumbnail_url || 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80',
      });
      setPreviewPlacement('fb_feed');
    }

    setShowDetailsPanel(true);
  };

  const handleUpdateName = async () => {
    startTransition(async () => {
      let updateData = { name: editName };
      if (editBudget) updateData.daily_budget = parseFloat(editBudget);
      
      if (selectedEntity.type === 'ad') {
        updateData = {
          name: editName,
          ...editCreativeData
        };
      }
      
      const res = await updateMetaEntityAction(id, selectedEntity.data.id, updateData);
      if (res?.error) {
        setMessageModal({ 
          show: true, 
          title: 'Hata', 
          message: res.error, 
          details: res.details || '',
          type: 'error' 
        });
      } else {
        const type = selectedEntity.type;
        const updatedObj = { 
          ...selectedEntity.data, 
          name: editName, 
          daily_budget: editBudget,
          creative: type === 'ad' ? {
            ...selectedEntity.data.creative,
            body: editCreativeData.primary_text,
            image_url: editCreativeData.image_url,
            title: editCreativeData.headline,
            object_story_spec: {
              page_id: editCreativeData.page_id,
              instagram_actor_id: editCreativeData.instagram_actor_id,
              link_data: {
                link: editCreativeData.website_url,
                display_link: editCreativeData.display_link,
                message: editCreativeData.primary_text,
                name: editCreativeData.headline,
                description: editCreativeData.description,
                call_to_action: { type: editCreativeData.call_to_action }
              }
            }
          } : undefined
        };
        if (type === 'campaign') setCampaigns(prev => prev.map(c => c.id === selectedEntity.data.id ? { ...c, ...updatedObj } : c));
        if (type === 'adset') setAdSets(prev => prev.map(as => as.id === selectedEntity.data.id ? { ...as, ...updatedObj } : as));
        if (type === 'ad') setAds(prev => prev.map(ad => ad.id === selectedEntity.data.id ? { ...ad, ...updatedObj } : ad));
        setSelectedEntity({ type, data: updatedObj });
        setIsEditingEntity(false);
        setMessageModal({ show: true, title: 'Başarılı', message: 'Başarıyla güncellendi.', type: 'success' });
      }
    });
  };

  const selectedCampaignName = campaigns.find(c => c.id === selectedCampaignId)?.name;
  const selectedAdSetName = adSets.find(as => as.id === selectedAdSetId)?.name;
  const isCustom = !!(initSince && initUntil);

  const [showAdvancedPreviewModal, setShowAdvancedPreviewModal] = useState(false);
  const [advancedPreviewTab, setAdvancedPreviewTab] = useState('placements'); // 'placements' | 'creative'
  const [advancedFilters, setAdvancedFilters] = useState({
    feeds: true,
    stories: true,
    search: true,
  });

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
    const parentCampaignName = campaigns.find(c => c.id === adSets.find(as => as.id === data.parent_id)?.campaign_id)?.name;
    const parentAdSetName = adSets.find(as => as.id === data.parent_id)?.name;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.8rem' }}>
        {/* Card 1: Reklam Adı */}
        <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>REKLAM ADI *</label>
              {isEditing ? (
                <input 
                  required
                  className="form-control" 
                  value={isCreate ? data.name : editName} 
                  onChange={e => isCreate ? setData({ ...data, name: e.target.value }) : setEditName(e.target.value)} 
                  placeholder="Örn: Yeni Etkileşim Reklamı"
                  style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
                />
              ) : (
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1c1e21', background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2' }}>{selectedEntity?.data?.name}</div>
              )}
            </div>
            <button type="button" style={{ padding: '0.65rem 1rem', background: '#e4e6eb', color: '#1c1e21', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Şablon Oluştur</button>
          </div>
          {isCreate && (
            <div>
              <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>REKLAM SETİ SEÇİN *</label>
              <select 
                required
                value={data.parent_id || ''}
                onChange={e => setData({ ...data, parent_id: e.target.value })}
                style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
              >
                <option value="">Seçiniz...</option>
                {adSets.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Card 2: Ortaklık Reklamı */}
        <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Ortaklık Reklamı</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: data.partnership_ad ? '#1877f2' : '#606770', fontWeight: 700 }}>
                {data.partnership_ad ? 'AÇIK' : 'KAPALI'}
              </span>
              <StatusToggle active={!!data.partnership_ad} onToggle={() => isEditing && setData({ ...data, partnership_ad: !data.partnership_ad })} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#606770', lineHeight: '1.4' }}>
            İçerik üreticileri, markalar ve diğer işletmelerle birlikte reklamlar yayınlayın. Bu reklamlar, kampanya performansını artırmak için her iki profilden gelen sinyallerden yararlanır.
          </p>
        </div>

        {/* Card 3: Kimlik */}
        <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Kimlik</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#606770' }}>Reklamınızda kullanılacak profiller</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Facebook Sayfası *</label>
              {isEditing ? (
                <select 
                  value={data.page_id || 'Terapimle'} 
                  onChange={e => setData({ ...data, page_id: e.target.value })}
                  style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="Terapimle">Terapimle</option>
                  <option value="Diğer Sayfa">Diğer Sayfa</option>
                </select>
              ) : (
                <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#1c1e21' }}>{data.page_id || 'Terapimle'}</div>
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Instagram Profili *</label>
              {isEditing ? (
                <select 
                  value={data.instagram_actor_id || 'terapiylecom'} 
                  onChange={e => setData({ ...data, instagram_actor_id: e.target.value })}
                  style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="terapiylecom">terapiylecom</option>
                  <option value="diğer_profil">diğer_profil</option>
                </select>
              ) : (
                <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#1c1e21' }}>{data.instagram_actor_id || 'terapiylecom'}</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '0.8rem', marginTop: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                disabled={!isEditing}
                checked={data.threads_enabled !== false} 
                onChange={e => setData({ ...data, threads_enabled: e.target.checked })} 
                style={{ width: '14px', height: '14px', accentColor: '#1877f2', cursor: isEditing ? 'pointer' : 'default' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#1c1e21', fontWeight: 600 }}>Instagram hesabını kullan (Threads profili)</span>
            </div>
            <button type="button" style={{ padding: '0.3rem 0.6rem', background: '#e4e6eb', color: '#1c1e21', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Profil oluştur</button>
          </div>
        </div>

        {/* Card 4: Reklam Kurulumu */}
        <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Reklam Kurulumu</h3>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Reklam Kurulumu</label>
            {isEditing ? (
              <select 
                value={data.setup_type || 'Reklam Oluştur'}
                onChange={e => setData({ ...data, setup_type: e.target.value })}
                style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
              >
                <option value="Reklam Oluştur">Reklam Oluştur</option>
                <option value="Mevcut Gönderiyi Kullan">Mevcut Gönderiyi Kullan</option>
              </select>
            ) : (
              <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#1c1e21' }}>{data.setup_type || 'Reklam Oluştur'}</div>
            )}
          </div>
          
          <div>
            <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Medya Kurulumu</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.2rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isEditing ? 'pointer' : 'default' }}>
                <input 
                  type="radio" 
                  name={`media_setup_${isCreate ? 'c' : 'e'}`}
                  disabled={!isEditing}
                  checked={data.media_setup !== 'catalog'} 
                  onChange={() => setData({ ...data, media_setup: 'manuel' })}
                  style={{ marginTop: '3px', accentColor: '#1877f2' }}
                />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#1c1e21', fontWeight: 600 }}>Manuel yükleme</div>
                  <div style={{ fontSize: '0.7rem', color: '#606770' }}>Medyayı ve metinleri kendiniz seçin.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isEditing ? 'pointer' : 'default' }}>
                <input 
                  type="radio" 
                  name={`media_setup_${isCreate ? 'c' : 'e'}`}
                  disabled={!isEditing}
                  checked={data.media_setup === 'catalog'} 
                  onChange={() => setData({ ...data, media_setup: 'catalog' })}
                  style={{ marginTop: '3px', accentColor: '#1877f2' }}
                />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#1c1e21', fontWeight: 600 }}>Advantage+ katalog reklamları</div>
                  <div style={{ fontSize: '0.7rem', color: '#606770' }}>Kataloğunuzdaki ürün görsellerini ve videolarını otomatik olarak gösterin.</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Format</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.2rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isEditing ? 'pointer' : 'default' }}>
                <input 
                  type="radio" 
                  name={`format_${isCreate ? 'c' : 'e'}`}
                  disabled={!isEditing}
                  checked={data.format !== 'carousel' && data.format !== 'collection'} 
                  onChange={() => setData({ ...data, format: 'single_image' })}
                  style={{ marginTop: '3px', accentColor: '#1877f2' }}
                />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#1c1e21', fontWeight: 600 }}>Tek Görsel veya Video</div>
                  <div style={{ fontSize: '0.7rem', color: '#606770' }}>Bir görsel ya da video veya birden fazla görsel içeren slayt gösterisi.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isEditing ? 'pointer' : 'default' }}>
                <input 
                  type="radio" 
                  name={`format_${isCreate ? 'c' : 'e'}`}
                  disabled={!isEditing}
                  checked={data.format === 'carousel'} 
                  onChange={() => setData({ ...data, format: 'carousel' })}
                  style={{ marginTop: '3px', accentColor: '#1877f2' }}
                />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#1c1e21', fontWeight: 600 }}>Döngü</div>
                  <div style={{ fontSize: '0.7rem', color: '#606770' }}>Kaydırılabilen iki veya daha fazla görsel ya da video.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isEditing ? 'pointer' : 'default' }}>
                <input 
                  type="radio" 
                  name={`format_${isCreate ? 'c' : 'e'}`}
                  disabled={!isEditing}
                  checked={data.format === 'collection'} 
                  onChange={() => setData({ ...data, format: 'collection' })}
                  style={{ marginTop: '3px', accentColor: '#1877f2' }}
                />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#1c1e21', fontWeight: 600 }}>Koleksiyon</div>
                  <div style={{ fontSize: '0.7rem', color: '#606770' }}>Tam ekran mobil deneyimle açılan öğe grubu.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Card 5: Yönlendirme Hedefi */}
        <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Yönlendirme Hedefi</h3>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'default' }}>
            <input type="radio" checked readOnly style={{ marginTop: '3px', accentColor: '#1877f2' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#1c1e21', fontWeight: 600 }}>İnternet Sitesi</div>
              <div style={{ fontSize: '0.7rem', color: '#606770' }}>İnsanları internet sitenize yönlendirin.</div>
            </div>
          </label>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginTop: '0.2rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>İnternet Sitesi Adresi (URL) *</label>
              {isEditing ? (
                <input 
                  required
                  type="url"
                  className="form-control" 
                  value={data.website_url || ''} 
                  onChange={e => setData({ ...data, website_url: e.target.value })} 
                  placeholder="https://terapiyle.com/"
                  style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
                />
              ) : (
                <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#1c1e21', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.website_url}</div>
              )}
            </div>
            <button 
              type="button" 
              onClick={() => { if (data.website_url) window.open(data.website_url, '_blank'); }}
              style={{ padding: '0.65rem 1rem', background: '#e4e6eb', color: '#1c1e21', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              URL Önizlemesini Gör
            </button>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Görünen Bağlantı</label>
            {isEditing ? (
              <input 
                className="form-control" 
                value={data.display_link || ''} 
                onChange={e => setData({ ...data, display_link: e.target.value })} 
                placeholder="https://terapiyle.com/"
                style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
              />
            ) : (
              <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#1c1e21', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.display_link || '-'}</div>
            )}
            <div style={{ fontSize: '0.7rem', color: '#606770', marginTop: '0.4rem', display: 'flex', gap: '4px' }}>
              <span>ℹ️ URL parametreleri tek bir yerden yönetebilmeniz için Takip bölümüne taşındı.</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Tarayıcı eklentileri</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: isEditing ? 'pointer' : 'default', fontSize: '0.75rem', color: '#1c1e21' }}>
                <input 
                  type="radio" 
                  name={`browser_add_on_${isCreate ? 'c' : 'e'}`}
                  disabled={!isEditing}
                  checked={data.browser_add_on !== 'call' && data.browser_add_on !== 'whatsapp'} 
                  onChange={() => setData({ ...data, browser_add_on: 'none' })}
                  style={{ accentColor: '#1877f2' }}
                />
                Yok
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: isEditing ? 'pointer' : 'default', fontSize: '0.75rem', color: '#1c1e21' }}>
                <input 
                  type="radio" 
                  name={`browser_add_on_${isCreate ? 'c' : 'e'}`}
                  disabled={!isEditing}
                  checked={data.browser_add_on === 'call'} 
                  onChange={() => setData({ ...data, browser_add_on: 'call' })}
                  style={{ accentColor: '#1877f2' }}
                />
                Ara
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: isEditing ? 'pointer' : 'default', fontSize: '0.75rem', color: '#1c1e21' }}>
                <input 
                  type="radio" 
                  name={`browser_add_on_${isCreate ? 'c' : 'e'}`}
                  disabled={!isEditing}
                  checked={data.browser_add_on === 'whatsapp'} 
                  onChange={() => setData({ ...data, browser_add_on: 'whatsapp' })}
                  style={{ accentColor: '#1877f2' }}
                />
                WhatsApp
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid #e5e7eb', paddingTop: '0.8rem', marginTop: '0.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isEditing ? 'pointer' : 'default', fontSize: '0.75rem', color: '#1c1e21' }}>
              <input 
                type="checkbox" 
                disabled={!isEditing}
                checked={data.instant_experience === true} 
                onChange={e => setData({ ...data, instant_experience: e.target.checked })} 
                style={{ accentColor: '#1877f2' }}
              />
              Hızlı Deneyim (Instant Experience)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isEditing ? 'pointer' : 'default', fontSize: '0.75rem', color: '#1c1e21' }}>
              <input 
                type="checkbox" 
                disabled={!isEditing}
                checked={data.facebook_event === true} 
                onChange={e => setData({ ...data, facebook_event: e.target.checked })} 
                style={{ accentColor: '#1877f2' }}
              />
              Facebook Etkinliği
            </label>
          </div>
        </div>

        {/* Card 6: Reklam Kreatifi */}
        <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Reklam Kreatifi</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#606770' }}>Reklam metninizi, medyanızı ve iyileştirmelerinizi seçin ve optimize edin.</p>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#606770', fontWeight: 600 }}>Medya (Görsel URL) *</label>
              {isEditing && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" style={{ padding: '0.25rem 0.5rem', background: '#e4e6eb', color: '#1c1e21', border: '1px solid #ccd0d5', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}>Medyayı Düzenle</button>
                  <button type="button" onClick={() => setData({ ...data, image_url: '' })} style={{ padding: '0.25rem 0.5rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}>🗑️</button>
                </div>
              )}
            </div>
            {isEditing ? (
              <>
                <input 
                  required
                  className="form-control" 
                  value={data.image_url || ''} 
                  onChange={e => setData({ ...data, image_url: e.target.value })} 
                  placeholder="Görsel adresi girin veya şablonlardan seçin..."
                  style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '0.5rem', outline: 'none' }} 
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
                        background: data.image_url === img.url ? '#1877f2' : '#e4e6eb',
                        color: data.image_url === img.url ? '#fff' : '#1c1e21',
                        border: data.image_url === img.url ? '1px solid #1877f2' : '1px solid #ccd0d5',
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
              <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#1c1e21', wordBreak: 'break-all' }}>{data.image_url}</div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Ana Metin *</label>
            {isEditing ? (
              <textarea 
                required
                className="form-control" 
                value={data.primary_text || ''} 
                onChange={e => setData({ ...data, primary_text: e.target.value })} 
                placeholder="Bazen sadece doğru uzmanla konuşmak..."
                rows={4}
                style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.85rem', lineHeight: '1.4', outline: 'none' }} 
              />
            ) : (
              <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#1c1e21', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{data.primary_text}</div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Başlık *</label>
            {isEditing ? (
              <input 
                required
                className="form-control" 
                value={data.headline || ''} 
                onChange={e => setData({ ...data, headline: e.target.value })} 
                placeholder="Terapiyle Sana En Uygun Terapisti Bul"
                style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
              />
            ) : (
              <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#1c1e21' }}>{data.headline}</div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Açıklama</label>
            {isEditing ? (
              <input 
                className="form-control" 
                value={data.description || ''} 
                onChange={e => setData({ ...data, description: e.target.value })} 
                placeholder="Terapiyle. Online, güvenli ve kolay!..."
                style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
              />
            ) : (
              <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#1c1e21' }}>{data.description || '-'}</div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '0.8rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#1c1e21', fontWeight: 600 }}>Metni kişiye göre optimize et</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.65rem', color: data.optimize_text !== false ? '#45bd62' : '#606770', fontWeight: 700 }}>
                {data.optimize_text !== false ? 'ETKİN' : 'DEVRE DIŞI'}
              </span>
              <StatusToggle active={data.optimize_text !== false} onToggle={() => isEditing && setData({ ...data, optimize_text: data.optimize_text === false })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Eylem Çağrısı *</label>
              {isEditing ? (
                <select 
                  value={data.call_to_action || 'LEARN_MORE'}
                  onChange={e => setData({ ...data, call_to_action: e.target.value })}
                  style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="LEARN_MORE">Daha Fazla Bilgi Al</option>
                  <option value="SIGN_UP">Kaydol</option>
                  <option value="BOOK_TRAVEL">Rezervasyon Yap</option>
                  <option value="CONTACT_US">Bize Ulaşın</option>
                  <option value="APPLY_NOW">Başvur</option>
                </select>
              ) : (
                <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#1c1e21' }}>{CTA_LABELS[data.call_to_action || 'LEARN_MORE']}</div>
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Advantage+ kreatif</label>
              <div style={{ padding: '0.65rem 0.85rem', background: '#f5f6f7', border: '1px solid #dddfe2', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#1c1e21' }}>
                <span>Kreatif iyileştirmeleri (2/7)</span>
                <button type="button" style={{ background: 'none', border: 'none', color: '#1877f2', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}>Düzenle</button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Kreatif testi</label>
              <button type="button" style={{ width: '100%', padding: '0.6rem', background: '#e4e6eb', color: '#1c1e21', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Test oluştur</button>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Diller</label>
              <div style={{ padding: '0.4rem 0.8rem', background: '#f5f6f7', border: '1px solid #dddfe2', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#1c1e21' }}>
                <span>Otomatik çeviriler</span>
                <StatusToggle active={false} onToggle={() => {}} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 7: Takip */}
        <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Takip</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#606770' }}>Takip edilecek dönüşüm olaylarını seçin.</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', color: '#1c1e21' }}>
              <input type="checkbox" checked readOnly style={{ accentColor: '#1877f2' }} />
              İnternet sitesi olayları
            </label>
            <div style={{ marginLeft: '22px', padding: '0.6rem 0.8rem', background: '#f5f6f7', border: '1px solid #dddfe2', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#45bd62', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1c1e21' }}>TERAPİYLE - Piksel</span>
              </div>
              {isEditing ? (
                <input 
                  required
                  className="form-control" 
                  value={data.pixel_id || '1850906787926541'} 
                  onChange={e => setData({ ...data, pixel_id: e.target.value })} 
                  style={{ width: '160px', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', textAlign: 'right', outline: 'none' }} 
                />
              ) : (
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1c1e21' }}>{data.pixel_id || '1850906787926541'}</div>
              )}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', opacity: 0.5, color: '#1c1e21' }}>
              <input type="checkbox" disabled style={{ accentColor: '#1877f2' }} />
              Uygulama Olayları
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', color: '#1c1e21' }}>
                <input type="checkbox" checked readOnly style={{ accentColor: '#1877f2' }} />
                Çevrimdışı olaylar
              </label>
              <button type="button" style={{ padding: '0.3rem 0.6rem', background: '#e4e6eb', color: '#1c1e21', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Ayarla</button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>URL Parametreleri</label>
            {isEditing ? (
              <input 
                className="form-control" 
                value={data.url_params || ''} 
                onChange={e => setData({ ...data, url_params: e.target.value })} 
                placeholder="anahtar1=deger1&anahtar2=deger2"
                style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '0.4rem', outline: 'none' }} 
              />
            ) : (
              <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#1c1e21' }}>{data.url_params || '-'}</div>
            )}
            <button type="button" style={{ background: 'none', border: 'none', color: '#1877f2', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}>Bir URL parametresi oluşturun</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '0.8rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#606770' }}>Üçüncü taraf raporlama araçları</span>
            <button type="button" style={{ padding: '0.3rem 0.6rem', background: '#e4e6eb', color: '#1c1e21', border: '1px solid #ccd0d5', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Bağla</button>
          </div>
        </div>
      </div>
    );
  };

  const renderAudienceCard = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%' }}>
        {/* Hedef Kitle Tanımı */}
        <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Hedef Kitle Tanımı</h3>
          <div style={{ position: 'relative', height: '12px', background: 'linear-gradient(to right, #f59e0b 0%, #45bd62 40%, #45bd62 60%, #3b82f6 100%)', borderRadius: '6px', marginTop: '0.5rem' }}>
            <div style={{ position: 'absolute', top: '-4px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', border: '3px solid #45bd62', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#606770', fontWeight: 600 }}>
            <span>Özel</span>
            <span style={{ color: '#45bd62' }}>Tanımlı</span>
            <span>Geniş</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#1c1e21', lineHeight: '1.35' }}>
            Hedef kitleniz tanımlı. Potansiyel erişim genişliği dengeli ve dönüşüm olasılığı yüksektir.
          </p>
          <div style={{ borderTop: '1px solid #dddfe2', paddingTop: '0.6rem', marginTop: '0.2rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#606770', fontWeight: 600 }}>POTANSİYEL ERİŞİM</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1c1e21', marginTop: '0.2rem' }}>32.400.000 - 38.100.000 kişi</div>
          </div>
        </div>

        {/* Tahmini Günlük Sonuçlar */}
        <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Tahmini Günlük Sonuçlar</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#606770', lineHeight: '1.3' }}>
            Tahminler, ortalama bütçenize ve hedef kitle verilerinize dayanır.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', borderTop: '1px solid #dddfe2', paddingTop: '0.8rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#606770', fontWeight: 600 }}>ERİŞİM</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1c1e21', marginTop: '0.2rem' }}>4.5B - 13B</div>
              <div style={{ height: '4px', background: '#3b82f6', borderRadius: '2px', width: '60%', marginTop: '0.4rem' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#606770', fontWeight: 600 }}>BAĞLANTI TIKLAMALARI</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1c1e21', marginTop: '0.2rem' }}>120 - 350</div>
              <div style={{ height: '4px', background: '#45bd62', borderRadius: '2px', width: '45%', marginTop: '0.4rem' }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      {/* Loading Overlay */}
      {isPending && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
          <div className="spinner" style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: 'white', fontWeight: 800 }}>META VERİLERİ GÜNCELLENİYOR...</p>
        </div>
      )}

      {/* Filter Status Bar */}
      {(selectedCampaignId || selectedAdSetId) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
          <AlertCircle size={16} color="#10b981" />
          <div style={{ flex: 1, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Filtre:</span>
            {selectedCampaignId && <span style={{ background: '#0064e0', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{selectedCampaignName}</span>}
            {selectedAdSetId && <><ChevronRight size={14} /><span style={{ background: '#f59e0b', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{selectedAdSetName}</span></>}
          </div>
          <button onClick={() => { setSelectedCampaignId(null); setSelectedAdSetId(null); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}>Temizle</button>
        </div>
      )}

      {/* Top Bar */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.5rem', gap: '1rem', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Calendar size={16} color="var(--text-secondary)" />
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
            {DATE_PRESETS.map(preset => (
              <button key={preset.id} onClick={() => handleDateChange(preset.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px', border: 'none', background: (!isCustom && datePreset === preset.id) ? '#0064e0' : 'transparent', color: '#fff', cursor: 'pointer' }}>{preset.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input type="text" placeholder="Ara..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
          </div>
          <button onClick={handleOpenCreateModal} className="btn btn-primary" style={{ background: '#0064e0', padding: '0.5rem 1.2rem' }}>+ Yeni Oluştur</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <StatCard label="Harcama" value={`${result.summary?.spend || 0} TL`} icon={<Wallet size={16} />} color="#10b981" />
        <StatCard label="Gösterim" value={Number(result.summary?.impressions || 0).toLocaleString()} icon={<Eye size={16} />} color="#3b82f6" />
        <StatCard label="Tıklanma" value={Number(result.summary?.clicks || 0).toLocaleString()} icon={<MousePointer2 size={16} />} color="#a855f7" />
        <StatCard label="CTR" value={`%${(Number(result.summary?.ctr || 0) * 100).toFixed(2)}`} icon={<TrendingUp size={16} />} color="#f59e0b" />
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '2rem' }}>
        <TabButton id="campaigns" label="Kampanyalar" count={filteredCampaigns.length} activeTab={activeTab} onClick={setActiveTab} />
        <TabButton id="adsets" label="Reklam Setleri" count={filteredAdSets.length} activeTab={activeTab} onClick={setActiveTab} />
        <TabButton id="ads" label="Reklamlar" count={filteredAds.length} activeTab={activeTab} onClick={setActiveTab} />
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '1.5rem', 
          padding: '1rem 1.5rem', background: '#0064e0', borderRadius: '12px',
          animation: 'slideDown 0.3s ease-out', color: '#fff',
          boxShadow: '0 10px 30px rgba(0, 100, 224, 0.3)'
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedIds.length} öğe seçildi</div>
          <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => handleBulkStatus('ACTIVE')} style={{ ...smallButtonStyle, background: '#10b981', color: '#fff' }}>Seçilenleri Başlat</button>
            <button onClick={() => handleBulkStatus('PAUSED')} style={{ ...smallButtonStyle, background: '#f59e0b', color: '#fff' }}>Seçilenleri Durdur</button>
            <button onClick={handleBulkDelete} style={{ ...smallButtonStyle, background: '#ef4444', color: '#fff' }}>Seçilenleri Sil</button>
          </div>
          <button onClick={() => setSelectedIds([])} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.8 }}>Seçimi Temizle</button>
        </div>
      )}

      {/* Tables */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        {activeTab === 'campaigns' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1100px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ ...thStyle, width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredCampaigns.length && filteredCampaigns.length > 0} 
                    onChange={toggleSelectAll} 
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={thStyle}>KAMPANYA</th>
                <th style={thStyle}>DURUM</th>
                <th style={thStyle}>SONUÇLAR</th>
                <th style={thStyle}>BÜTÇE</th>
                <th style={thStyle}>HARCAMA</th>
                <th style={thStyle}>STRATEJİ</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>AKSİYONLAR</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map(c => (
                <tr key={c.id} style={trStyle}>
                  <td style={tdStyle}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(c.id)} 
                      onChange={() => toggleSelection(c.id)} 
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <StatusToggle active={c.status === 'ACTIVE' || c.status === 'ENABLED'} onToggle={() => handleToggleStatus(c.id, c.status, 'campaign')} />
                      <span onClick={() => openDetails(c, 'campaign')} style={{ fontWeight: 700, color: '#0064e0', cursor: 'pointer' }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={tdStyle}><StatusBadge status={c.status} /></td>
                  <td style={tdStyle}>{c.insights?.data?.[0]?.inline_link_clicks || 0} Tık</td>
                  <td style={tdStyle}>{c.daily_budget ? (c.daily_budget / 100).toFixed(2) + ' TL' : 'Bütçe Yok'}</td>
                  <td style={tdStyle}>{c.insights?.data?.[0]?.spend || 0} TL</td>
                  <td style={tdStyle}>{c.bid_strategy?.replace(/_/g, ' ') || 'Lowest Cost'}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => openDetails(c, 'campaign')} className="btn-icon"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteEntity(c, 'campaign')} className="btn-icon danger"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'adsets' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ ...thStyle, width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredAdSets.length && filteredAdSets.length > 0} 
                    onChange={toggleSelectAll} 
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={thStyle}>REKLAM SETİ</th>
                <th style={thStyle}>DURUM</th>
                <th style={thStyle}>BÜTÇE</th>
                <th style={thStyle}>HARCAMA</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>AKSİYONLAR</th>
              </tr>
            </thead>
            <tbody>{filteredAdSets.map(as => (
              <tr key={as.id} style={trStyle}>
                <td style={tdStyle}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(as.id)} 
                    onChange={() => toggleSelection(as.id)} 
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={tdStyle}><div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <StatusToggle active={as.status === 'ACTIVE' || as.status === 'ENABLED'} onToggle={() => handleToggleStatus(as.id, as.status, 'adset')} />
                  <span onClick={() => openDetails(as, 'adset')} style={{ fontWeight: 700, color: '#0064e0', cursor: 'pointer' }}>{as.name}</span>
                </div></td>
                <td style={tdStyle}><StatusBadge status={as.status} /></td>
                <td style={tdStyle}>{as.daily_budget ? (as.daily_budget / 100).toFixed(2) + ' TL' : 'Bütçe Yok'}</td>
                <td style={tdStyle}>{as.insights?.data?.[0]?.spend || 0} TL</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => openDetails(as, 'adset')} className="btn-icon"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteEntity(as, 'adset')} className="btn-icon danger"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}

        {activeTab === 'ads' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ ...thStyle, width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredAds.length && filteredAds.length > 0} 
                    onChange={toggleSelectAll} 
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={thStyle}>REKLAM</th>
                <th style={thStyle}>DURUM</th>
                <th style={thStyle}>HARCAMA</th>
                <th style={thStyle}>CTR</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>AKSİYONLAR</th>
              </tr>
            </thead>
            <tbody>{filteredAds.map(ad => (
              <tr key={ad.id} style={trStyle}>
                <td style={tdStyle}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(ad.id)} 
                    onChange={() => toggleSelection(ad.id)} 
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={tdStyle}><div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <StatusToggle active={ad.status === 'ACTIVE' || ad.status === 'ENABLED'} onToggle={() => handleToggleStatus(ad.id, ad.status, 'ad')} />
                  <span onClick={() => openDetails(ad, 'ad')} style={{ fontWeight: 700, color: '#0064e0', cursor: 'pointer' }}>{ad.name}</span>
                </div></td>
                <td style={tdStyle}><StatusBadge status={ad.status} /></td>
                <td style={tdStyle}>{ad.insights?.data?.[0]?.spend || 0} TL</td>
                <td style={tdStyle}>%{(Number(ad.insights?.data?.[0]?.ctr || 0) * 100).toFixed(2)}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => openDetails(ad, 'ad')} className="btn-icon"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteEntity(ad, 'ad')} className="btn-icon danger"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {/* PREMIUM CENTERED MODAL */}
      {/* CREATE ENTITY MODAL */}
      {showCreateModal && (
        <>
          <div onClick={() => setShowCreateModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 10000 }} />
          <div style={{ 
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '98%', 
            maxWidth: '1380px', 
            height: '92vh',
            maxHeight: '92vh',
            background: '#f0f2f5', 
            borderRadius: '24px',
            boxShadow: '0 12px 28px 0 rgba(0,0,0,0.2), 0 2px 4px 0 rgba(0,0,0,0.1)', zIndex: 10001, 
            display: 'flex', flexDirection: 'column',
            animation: 'modalFadeIn 0.3s ease-out',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dddfe2', background: '#ffffff', flexShrink: 0 }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1c1e21' }}>
                Yeni {activeTab === 'campaigns' ? 'Kampanya' : activeTab === 'adsets' ? 'Reklam Seti' : 'Reklam'}
              </h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#606770', cursor: 'pointer', padding: '0.5rem' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateEntity} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1.2fr 340px', gap: '1.5rem', flex: 1, overflow: 'hidden', minHeight: 0, padding: '1.5rem 2rem 0.5rem 2rem' }}>
                {/* Sol Sütun - Hiyerarşik Ağaç Görünümü */}
                <div style={{ background: '#ffffff', borderRight: '1px solid #dddfe2', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#606770', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reklam Düzenleme</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {/* Kampanya Düğümü */}
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', 
                      background: activeTab === 'campaigns' ? '#e7f3ff' : 'transparent', 
                      fontSize: '0.75rem', 
                      color: activeTab === 'campaigns' ? '#1877f2' : '#1c1e21', 
                      border: activeTab === 'campaigns' ? '1px solid rgba(24,119,242,0.2)' : '1px solid transparent',
                      fontWeight: activeTab === 'campaigns' ? 700 : 500
                    }}>
                      <span style={{ fontSize: '0.9rem' }}>📁</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {activeTab === 'campaigns' 
                          ? (createFormData.name || 'Yeni Kampanya') 
                          : (campaigns.find(c => c.id === adSets.find(as => as.id === createFormData.parent_id)?.campaign_id)?.name || 'Terapiyle Campaign')}
                      </span>
                    </div>
                    {/* Reklam Seti Düğümü */}
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', 
                      background: activeTab === 'adsets' ? '#e7f3ff' : 'transparent', 
                      fontSize: '0.75rem', 
                      color: activeTab === 'adsets' ? '#1877f2' : '#1c1e21', 
                      border: activeTab === 'adsets' ? '1px solid rgba(24,119,242,0.2)' : '1px solid transparent',
                      marginLeft: '12px',
                      fontWeight: activeTab === 'adsets' ? 700 : 500
                    }}>
                      <span style={{ fontSize: '0.9rem' }}>📂</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {activeTab === 'campaigns'
                          ? 'Yeni Reklam Seti'
                          : (activeTab === 'adsets' 
                            ? (createFormData.name || 'Yeni Reklam Seti')
                            : (adSets.find(as => as.id === createFormData.parent_id)?.name || 'Set Seçilmedi'))}
                      </span>
                    </div>
                    {/* Reklam Düğümü */}
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', 
                      background: activeTab === 'ads' ? '#e7f3ff' : 'transparent', 
                      fontSize: '0.75rem', 
                      color: activeTab === 'ads' ? '#1877f2' : '#1c1e21', 
                      border: activeTab === 'ads' ? '1px solid rgba(24,119,242,0.2)' : '1px solid transparent',
                      marginLeft: '24px',
                      fontWeight: activeTab === 'ads' ? 700 : 500
                    }}>
                      <span style={{ fontSize: '0.9rem' }}>✨</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {activeTab === 'ads' ? (createFormData.name || 'Yeni Reklam') : 'Yeni Reklam'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Orta Sütun - Form Alanları */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.8rem' }}>
                  {activeTab === 'campaigns' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Kampanya Adı */}
                      <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>KAMPANYA ADI *</label>
                          <input 
                            required
                            className="form-control" 
                            value={createFormData.name || ''} 
                            onChange={e => setCreateFormData({ ...createFormData, name: e.target.value })} 
                            placeholder="Örn: Terapiyle Kayıt Reklamı 11.02"
                            style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
                          />
                        </div>
                      </div>
                      
                      {/* Kampanya Detayları */}
                      <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Kampanya Detayları</h3>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Özel Reklam Kategorileri</label>
                          <select disabled style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#606770', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                            <option>Hiçbir Kategori Seçilmedi</option>
                          </select>
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

                      {/* Kampanya Bütçesi */}
                      <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Kampanya Bütçesi</h3>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Günlük Bütçe (TL) *</label>
                          <input 
                            type="number" 
                            required
                            className="form-control" 
                            value={createFormData.daily_budget || ''} 
                            onChange={e => setCreateFormData({ ...createFormData, daily_budget: e.target.value })} 
                            placeholder="Örn: 500"
                            style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Kampanya Durumu</label>
                          <select 
                            value={createFormData.status || 'ACTIVE'}
                            onChange={e => setCreateFormData({ ...createFormData, status: e.target.value })}
                            style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                          >
                            <option value="ACTIVE">Aktif (Hemen Başlat)</option>
                            <option value="PAUSED">Durdurulmuş (Taslak)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'adsets' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Reklam Seti Adı */}
                      <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>REKLAM SETİ ADI *</label>
                          <input 
                            required
                            className="form-control" 
                            value={createFormData.name || ''} 
                            onChange={e => setCreateFormData({ ...createFormData, name: e.target.value })} 
                            placeholder="Örn: Terapiyle Reklam Seti 1"
                            style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>ÜST KAMPANYA SEÇİN *</label>
                          <select 
                            required
                            value={createFormData.parent_id || ''}
                            onChange={e => setCreateFormData({ ...createFormData, parent_id: e.target.value })}
                            style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                          >
                            <option value="">Seçiniz...</option>
                            {campaigns.map(item => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Bütçe ve Durum */}
                      <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Bütçe ve Durum</h3>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Günlük Bütçe (TL) *</label>
                          <input 
                            type="number" 
                            required
                            className="form-control" 
                            value={createFormData.daily_budget || ''} 
                            onChange={e => setCreateFormData({ ...createFormData, daily_budget: e.target.value })} 
                            placeholder="Örn: 500"
                            style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>İlk Durum</label>
                          <select 
                            value={createFormData.status || 'ACTIVE'}
                            onChange={e => setCreateFormData({ ...createFormData, status: e.target.value })}
                            style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                          >
                            <option value="ACTIVE">Aktif (Hemen Başlat)</option>
                            <option value="PAUSED">Durdurulmuş (Taslak)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'ads' && renderAdFormFields(createFormData, setCreateFormData, true, true)}
                </div>

                {/* Sağ Sütun - Önizleme Mockup / Audience Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {activeTab === 'ads' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1c1e21' }}>Reklam Önizlemesi</span>
                        <button
                          type="button"
                          onClick={() => setShowAdvancedPreviewModal(true)}
                          style={{
                            background: '#e7f3ff',
                            color: '#1877f2',
                            border: '1px solid rgba(24,119,242,0.2)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          🔍 Gelişmiş Önizleme
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.25rem', background: '#e4e6eb', padding: '3px', borderRadius: '8px', marginBottom: '1.2rem', width: '100%' }}>
                        <button type="button" onClick={() => setPreviewPlacement('fb_feed')} style={{ flex: 1, padding: '0.5rem 0.2rem', fontSize: '0.7rem', borderRadius: '6px', border: 'none', background: previewPlacement === 'fb_feed' ? '#ffffff' : 'transparent', color: previewPlacement === 'fb_feed' ? '#1c1e21' : '#606770', boxShadow: previewPlacement === 'fb_feed' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontWeight: 600 }}>Facebook Akış</button>
                        <button type="button" onClick={() => setPreviewPlacement('ig_feed')} style={{ flex: 1, padding: '0.5rem 0.2rem', fontSize: '0.7rem', borderRadius: '6px', border: 'none', background: previewPlacement === 'ig_feed' ? '#ffffff' : 'transparent', color: previewPlacement === 'ig_feed' ? '#1c1e21' : '#606770', boxShadow: previewPlacement === 'ig_feed' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontWeight: 600 }}>Instagram Akış</button>
                        <button type="button" onClick={() => setPreviewPlacement('ig_stories')} style={{ flex: 1, padding: '0.5rem 0.2rem', fontSize: '0.7rem', borderRadius: '6px', border: 'none', background: previewPlacement === 'ig_stories' ? '#ffffff' : 'transparent', color: previewPlacement === 'ig_stories' ? '#1c1e21' : '#606770', boxShadow: previewPlacement === 'ig_stories' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontWeight: 600 }}>Hikaye & Reels</button>
                      </div>

                      <div style={{ 
                        width: '100%',
                        maxWidth: '310px', 
                        background: '#e4e6eb', 
                        borderRadius: '32px', 
                        padding: '8px',
                        border: '4px solid #ccd0d5',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        boxSizing: 'border-box',
                        overflow: 'hidden'
                      }}>
                        <div style={{ width: '80px', height: '14px', background: '#ccd0d5', margin: '0 auto 8px auto', borderRadius: '0 0 10px 10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div style={{ width: '30px', height: '3px', background: '#ffffff', borderRadius: '1.5px' }}></div>
                        </div>
                        {renderAdPreview(previewPlacement, createFormData)}
                      </div>
                    </div>
                  ) : (
                    renderAudienceCard()
                  )}
                </div>
              </div>

              <div style={{ padding: '1rem 2rem', display: 'flex', gap: '1rem', borderTop: '1px solid #dddfe2', background: '#ffffff', flexShrink: 0 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#ffffff', color: '#4b5563', border: '1px solid #ccd0d5', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>Kapat</button>
                <button type="submit" disabled={isCreating} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: isCreating ? '#e2f0d9' : '#42b72a', color: isCreating ? '#a6cda6' : '#ffffff', border: 'none', fontWeight: 700, cursor: isCreating ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}>
                  {isCreating ? 'Oluşturuluyor...' : 'Yayınla'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* PREMIUM CENTERED MODAL */}
      {showDetailsPanel && selectedEntity && (
        <>
          <div onClick={() => setShowDetailsPanel(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 10000 }} />
          <div style={{ 
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '98%',
            maxWidth: '1380px', 
            height: '92vh',
            maxHeight: '92vh',
            background: '#f0f2f5', 
            borderRadius: '24px',
            boxShadow: '0 12px 28px 0 rgba(0,0,0,0.2), 0 2px 4px 0 rgba(0,0,0,0.1)', zIndex: 10001, 
            display: 'flex', flexDirection: 'column',
            animation: 'modalFadeIn 0.3s ease-out',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dddfe2', background: '#ffffff', flexShrink: 0 }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1c1e21' }}>
                {selectedEntity.type === 'campaign' ? 'Kampanya' : selectedEntity.type === 'adset' ? 'Reklam Seti' : 'Reklam'} Detayı
              </h2>
              <button onClick={() => setShowDetailsPanel(false)} style={{ background: 'none', border: 'none', color: '#606770', cursor: 'pointer', padding: '0.5rem' }}><X size={20} /></button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1.2fr 340px', gap: '1.5rem', flex: 1, overflow: 'hidden', minHeight: 0, padding: '1.5rem 2rem 0.5rem 2rem' }}>
                {/* Sol Sütun - Hiyerarşik Ağaç Görünümü */}
                <div style={{ background: '#ffffff', borderRight: '1px solid #dddfe2', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#606770', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reklam Düzenleme</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {/* Kampanya Düğümü */}
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', 
                      background: selectedEntity.type === 'campaign' ? '#e7f3ff' : 'transparent', 
                      fontSize: '0.75rem', 
                      color: selectedEntity.type === 'campaign' ? '#1877f2' : '#1c1e21', 
                      border: selectedEntity.type === 'campaign' ? '1px solid rgba(24,119,242,0.2)' : '1px solid transparent',
                      fontWeight: selectedEntity.type === 'campaign' ? 700 : 500
                    }}>
                      <span style={{ fontSize: '0.9rem' }}>📁</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedEntity.type === 'campaign' 
                          ? (isEditingEntity ? editName : selectedEntity.data.name) 
                          : (campaigns.find(c => c.id === adSets.find(as => as.id === selectedEntity.data.adset_id)?.campaign_id)?.name || 'Terapiyle Campaign')}
                      </span>
                    </div>
                    {/* Reklam Seti Düğümü */}
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', 
                      background: selectedEntity.type === 'adset' ? '#e7f3ff' : 'transparent', 
                      fontSize: '0.75rem', 
                      color: selectedEntity.type === 'adset' ? '#1877f2' : '#1c1e21', 
                      border: selectedEntity.type === 'adset' ? '1px solid rgba(24,119,242,0.2)' : '1px solid transparent',
                      marginLeft: '12px',
                      fontWeight: selectedEntity.type === 'adset' ? 700 : 500
                    }}>
                      <span style={{ fontSize: '0.9rem' }}>📂</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedEntity.type === 'campaign'
                          ? 'Reklam Seti'
                          : (selectedEntity.type === 'adset' 
                            ? (isEditingEntity ? editName : selectedEntity.data.name)
                            : (adSets.find(as => as.id === selectedEntity.data.adset_id)?.name || 'Set Seçilmedi'))}
                      </span>
                    </div>
                    {/* Reklam Düğümü */}
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', 
                      background: selectedEntity.type === 'ad' ? '#e7f3ff' : 'transparent', 
                      fontSize: '0.75rem', 
                      color: selectedEntity.type === 'ad' ? '#1877f2' : '#1c1e21', 
                      border: selectedEntity.type === 'ad' ? '1px solid rgba(24,119,242,0.2)' : '1px solid transparent',
                      marginLeft: '24px',
                      fontWeight: selectedEntity.type === 'ad' ? 700 : 500
                    }}>
                      <span style={{ fontSize: '0.9rem' }}>✨</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedEntity.type === 'ad' ? (isEditingEntity ? editName : selectedEntity.data.name) : 'Reklam Detayı'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Orta Sütun - Form Alanları */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.8rem' }}>
                  {selectedEntity.type === 'campaign' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Kampanya Adı */}
                      <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>KAMPANYA ADI *</label>
                          {isEditingEntity ? (
                            <input 
                              required
                              className="form-control" 
                              value={editName} 
                              onChange={e => setEditName(e.target.value)} 
                              style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
                            />
                          ) : (
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1c1e21', background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2' }}>{selectedEntity.data.name}</div>
                          )}
                        </div>
                      </div>

                      {/* Kampanya Detayları */}
                      <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Kampanya Detayları</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Satın Alma Türü</label>
                            <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#606770' }}>Açık Artırma</div>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Kampanya Amacı</label>
                            <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', fontSize: '0.85rem', color: '#606770' }}>Trafik</div>
                          </div>
                        </div>
                      </div>

                      {/* Bütçe ve Durum */}
                      <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Bütçe ve Durum</h3>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Günlük Bütçe (TL)</label>
                          {isEditingEntity ? (
                            <input 
                              type="number" 
                              className="form-control" 
                              value={editBudget} 
                              onChange={e => setEditBudget(e.target.value)} 
                              style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
                            />
                          ) : (
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1c1e21', background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2' }}>{(selectedEntity.data.daily_budget / 100).toFixed(2)} TL</div>
                          )}
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Durum</label>
                          <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', display: 'flex', alignItems: 'center' }}>
                            <StatusBadge status={selectedEntity.data.status} />
                          </div>
                        </div>
                      </div>

                      {/* Performance Section */}
                      <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Performans Özeti</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div style={{ background: '#f5f6f7', padding: '1rem', borderRadius: '8px', border: '1px solid #dddfe2' }}>
                            <div style={{ fontSize: '0.7rem', color: '#606770', marginBottom: '0.3rem' }}>Harcama</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1c1e21' }}>{selectedEntity.data.insights?.data?.[0]?.spend || 0} TL</div>
                          </div>
                          <div style={{ background: '#f5f6f7', padding: '1rem', borderRadius: '8px', border: '1px solid #dddfe2' }}>
                            <div style={{ fontSize: '0.7rem', color: '#606770', marginBottom: '0.3rem' }}>Gösterim</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1c1e21' }}>{Number(selectedEntity.data.insights?.data?.[0]?.impressions || 0).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEntity.type === 'adset' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Reklam Seti Adı */}
                      <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>REKLAM SETİ ADI *</label>
                          {isEditingEntity ? (
                            <input 
                              required
                              className="form-control" 
                              value={editName} 
                              onChange={e => setEditName(e.target.value)} 
                              style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
                            />
                          ) : (
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1c1e21', background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2' }}>{selectedEntity.data.name}</div>
                          )}
                        </div>
                      </div>

                      {/* Bütçe ve Durum */}
                      <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Bütçe ve Durum</h3>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Günlük Bütçe (TL)</label>
                          {isEditingEntity ? (
                            <input 
                              type="number" 
                              className="form-control" 
                              value={editBudget} 
                              onChange={e => setEditBudget(e.target.value)} 
                              style={{ width: '100%', background: '#ffffff', border: '1px solid #ccd0d5', color: '#1c1e21', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }} 
                            />
                          ) : (
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1c1e21', background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2' }}>{(selectedEntity.data.daily_budget / 100).toFixed(2)} TL</div>
                          )}
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#606770', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Durum</label>
                          <div style={{ background: '#f5f6f7', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #dddfe2', display: 'flex', alignItems: 'center' }}>
                            <StatusBadge status={selectedEntity.data.status} />
                          </div>
                        </div>
                      </div>

                      {/* Performance Section */}
                      <div style={{ padding: '1.2rem', background: '#ffffff', border: '1px solid #dddfe2', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#1c1e21', fontWeight: 700 }}>Performans Özeti</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div style={{ background: '#f5f6f7', padding: '1rem', borderRadius: '8px', border: '1px solid #dddfe2' }}>
                            <div style={{ fontSize: '0.7rem', color: '#606770', marginBottom: '0.3rem' }}>Harcama</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1c1e21' }}>{selectedEntity.data.insights?.data?.[0]?.spend || 0} TL</div>
                          </div>
                          <div style={{ background: '#f5f6f7', padding: '1rem', borderRadius: '8px', border: '1px solid #dddfe2' }}>
                            <div style={{ fontSize: '0.7rem', color: '#606770', marginBottom: '0.3rem' }}>Gösterim</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1c1e21' }}>{Number(selectedEntity.data.insights?.data?.[0]?.impressions || 0).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEntity.type === 'ad' && renderAdFormFields(editCreativeData, setEditCreativeData, false, isEditingEntity)}
                </div>

                {/* Sağ Sütun - Önizleme Mockup / Audience Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {selectedEntity.type === 'ad' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1c1e21' }}>Reklam Önizlemesi</span>
                        <button
                          type="button"
                          onClick={() => setShowAdvancedPreviewModal(true)}
                          style={{
                            background: '#e7f3ff',
                            color: '#1877f2',
                            border: '1px solid rgba(24,119,242,0.2)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          🔍 Gelişmiş Önizleme
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.25rem', background: '#e4e6eb', padding: '3px', borderRadius: '8px', marginBottom: '1.2rem', width: '100%', boxSizing: 'border-box' }}>
                        <button type="button" onClick={() => setPreviewPlacement('fb_feed')} style={{ flex: 1, padding: '0.5rem 0.2rem', fontSize: '0.7rem', borderRadius: '6px', border: 'none', background: previewPlacement === 'fb_feed' ? '#ffffff' : 'transparent', color: previewPlacement === 'fb_feed' ? '#1c1e21' : '#606770', boxShadow: previewPlacement === 'fb_feed' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontWeight: 600 }}>Facebook Akış</button>
                        <button type="button" onClick={() => setPreviewPlacement('ig_feed')} style={{ flex: 1, padding: '0.5rem 0.2rem', fontSize: '0.7rem', borderRadius: '6px', border: 'none', background: previewPlacement === 'ig_feed' ? '#ffffff' : 'transparent', color: previewPlacement === 'ig_feed' ? '#1c1e21' : '#606770', boxShadow: previewPlacement === 'ig_feed' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontWeight: 600 }}>Instagram Akış</button>
                        <button type="button" onClick={() => setPreviewPlacement('ig_stories')} style={{ flex: 1, padding: '0.5rem 0.2rem', fontSize: '0.7rem', borderRadius: '6px', border: 'none', background: previewPlacement === 'ig_stories' ? '#ffffff' : 'transparent', color: previewPlacement === 'ig_stories' ? '#1c1e21' : '#606770', boxShadow: previewPlacement === 'ig_stories' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontWeight: 600 }}>Hikaye & Reels</button>
                      </div>

                      <div style={{ 
                        width: '100%',
                        maxWidth: '310px', 
                        background: '#e4e6eb', 
                        borderRadius: '32px', 
                        padding: '8px',
                        border: '4px solid #ccd0d5',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        boxSizing: 'border-box',
                        overflow: 'hidden'
                      }}>
                        <div style={{ width: '80px', height: '14px', background: '#ccd0d5', margin: '0 auto 8px auto', borderRadius: '0 0 10px 10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div style={{ width: '30px', height: '3px', background: '#ffffff', borderRadius: '1.5px' }}></div>
                        </div>
                        {renderAdPreview(previewPlacement, editCreativeData)}
                      </div>
                    </div>
                  ) : (
                    renderAudienceCard()
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ padding: '1rem 2rem', display: 'flex', gap: '1rem', borderTop: '1px solid #dddfe2', background: '#ffffff', flexShrink: 0 }}>
              {isEditingEntity ? (
                <>
                  <button type="button" onClick={() => setIsEditingEntity(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#ffffff', color: '#4b5563', border: '1px solid #ccd0d5', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>İptal</button>
                  <button type="button" onClick={handleUpdateName} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#1877f2', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>Kaydet</button>
                </>
              ) : (
                <>
                  <button 
                    type="button" 
                    onClick={() => setShowDetailsPanel(false)} 
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#ffffff', color: '#4b5563', border: '1px solid #ccd0d5', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Kapat
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleToggleStatus(selectedEntity.data.id, selectedEntity.data.status, selectedEntity.type)} 
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#e4e6eb', color: '#1c1e21', border: '1px solid #ccd0d5', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    {selectedEntity.data.status === 'ACTIVE' || selectedEntity.data.status === 'ENABLED' ? 'Durdur' : 'Başlat'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditingEntity(true)} 
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#1877f2', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Düzenle
                  </button>
                </>
              )}
            </div>
          </div>
          <style>{`
            @keyframes modalFadeIn {
              from { opacity: 0; transform: translate(-50%, -45%); }
              to { opacity: 1; transform: translate(-50%, -50%); }
            }
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </>
      )}


      <CustomDialog
        isOpen={messageModal.show}
        title={messageModal.title}
        onClose={() => setMessageModal({ ...messageModal, show: false })}
        onConfirm={() => setMessageModal({ ...messageModal, show: false })}
        confirmText="Tamam"
        showCancel={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', lineHeight: '1.5', fontWeight: 500 }}>{messageModal.message}</div>
          {messageModal.details && (
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'pre-wrap' }}>
              {messageModal.details}
            </div>
          )}
        </div>
      </CustomDialog>

      <CustomDialog
        isOpen={deleteConfirm.show}
        title="Öğeyi Sil"
        onClose={() => setDeleteConfirm({ show: false, entity: null, type: null })}
        onConfirm={confirmDelete}
        confirmText="Sil"
        cancelText="Vazgeç"
        showCancel={true}
      >
        <div style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
          <strong>{deleteConfirm.entity?.name}</strong> öğesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </div>
      </CustomDialog>

      {/* ADVANCED PREVIEW MODAL */}
      {showAdvancedPreviewModal && (
        <>
          <div onClick={() => setShowAdvancedPreviewModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 11000 }} />
          <div style={{ 
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: '1400px', height: '90vh',
            background: '#f0f2f5', 
            borderRadius: '24px',
            boxShadow: '0 12px 28px 0 rgba(0,0,0,0.2), 0 2px 4px 0 rgba(0,0,0,0.1)', zIndex: 11001, 
            display: 'flex', flexDirection: 'column',
            animation: 'modalFadeIn 0.3s ease-out',
            overflow: 'hidden',
            border: '1px solid #ccd0d5'
          }}>
            {/* Header */}
            <div style={{ padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dddfe2', background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1c1e21' }}>Gelişmiş Önizleme</h2>
                <div style={{ background: '#e7f3ff', color: '#1877f2', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '10px', fontWeight: 700 }}>9 Yerleşim</div>
              </div>
              <button onClick={() => setShowAdvancedPreviewModal(false)} style={{ background: 'none', border: 'none', color: '#606770', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
            </div>

            {/* Filter / Subheader Bar */}
            <div style={{ padding: '0.8rem 2rem', background: '#ffffff', borderBottom: '1px solid #dddfe2', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              {/* TABS */}
              <div style={{ display: 'flex', gap: '0.25rem', background: '#e4e6eb', padding: '3px', borderRadius: '8px' }}>
                <button 
                  onClick={() => setAdvancedPreviewTab('placements')} 
                  style={{ 
                    padding: '0.4rem 1rem', fontSize: '0.75rem', borderRadius: '6px', border: 'none', 
                    background: advancedPreviewTab === 'placements' ? '#ffffff' : 'transparent', 
                    color: advancedPreviewTab === 'placements' ? '#1c1e21' : '#606770',
                    boxShadow: advancedPreviewTab === 'placements' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer', fontWeight: 600 
                  }}
                >
                  Reklam Alanları (Placements)
                </button>
                <button 
                  onClick={() => setAdvancedPreviewTab('creative')} 
                  style={{ 
                    padding: '0.4rem 1rem', fontSize: '0.75rem', borderRadius: '6px', border: 'none', 
                    background: advancedPreviewTab === 'creative' ? '#ffffff' : 'transparent', 
                    color: advancedPreviewTab === 'creative' ? '#1c1e21' : '#606770',
                    boxShadow: advancedPreviewTab === 'creative' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer', fontWeight: 600 
                  }}
                >
                  Advantage+ kreatif
                </button>
              </div>

              {/* FILTERS */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#606770', fontWeight: 600 }}>FİLTRELE:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#1c1e21', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={advancedFilters.feeds} 
                    onChange={e => setAdvancedFilters({ ...advancedFilters, feeds: e.target.checked })}
                    style={{ accentColor: '#1877f2' }}
                  />
                  Akışlar (Feeds)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#1c1e21', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={advancedFilters.stories} 
                    onChange={e => setAdvancedFilters({ ...advancedFilters, stories: e.target.checked })}
                    style={{ accentColor: '#1877f2' }}
                  />
                  Hikayeler & Reels
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#1c1e21', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={advancedFilters.search} 
                    onChange={e => setAdvancedFilters({ ...advancedFilters, search: e.target.checked })}
                    style={{ accentColor: '#1877f2' }}
                  />
                  Arama & Mesajlar
                </label>
              </div>
            </div>

            {/* Grid Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '2rem' 
              }}>
                {/* 1. Facebook Feed */}
                {advancedFilters.feeds && (
                  <div style={previewCardStyle}>
                    <div style={previewCardHeaderStyle}>Facebook Akışı</div>
                    <div style={phoneWrapperStyle}>
                      {renderAdPreview('fb_feed', showDetailsPanel ? editCreativeData : createFormData)}
                    </div>
                  </div>
                )}

                {/* 2. Instagram Feed */}
                {advancedFilters.feeds && (
                  <div style={previewCardStyle}>
                    <div style={previewCardHeaderStyle}>Instagram Akışı</div>
                    <div style={phoneWrapperStyle}>
                      {renderAdPreview('ig_feed', showDetailsPanel ? editCreativeData : createFormData)}
                    </div>
                  </div>
                )}

                {/* 3. Instagram Stories */}
                {advancedFilters.stories && (
                  <div style={previewCardStyle}>
                    <div style={previewCardHeaderStyle}>Instagram Hikayeleri</div>
                    <div style={phoneWrapperStyle}>
                      {renderAdPreview('ig_stories', showDetailsPanel ? editCreativeData : createFormData)}
                    </div>
                  </div>
                )}

                {/* 4. Facebook Stories */}
                {advancedFilters.stories && (
                  <div style={previewCardStyle}>
                    <div style={previewCardHeaderStyle}>Facebook Hikayeleri</div>
                    <div style={phoneWrapperStyle}>
                      {renderAdPreview('fb_stories', showDetailsPanel ? editCreativeData : createFormData)}
                    </div>
                  </div>
                )}

                {/* 5. Instagram Reels */}
                {advancedFilters.stories && (
                  <div style={previewCardStyle}>
                    <div style={previewCardHeaderStyle}>Instagram Reels</div>
                    <div style={phoneWrapperStyle}>
                      {renderAdPreview('ig_reels', showDetailsPanel ? editCreativeData : createFormData)}
                    </div>
                  </div>
                )}

                {/* 6. Facebook Reels */}
                {advancedFilters.stories && (
                  <div style={previewCardStyle}>
                    <div style={previewCardHeaderStyle}>Facebook Reels</div>
                    <div style={phoneWrapperStyle}>
                      {renderAdPreview('fb_reels', showDetailsPanel ? editCreativeData : createFormData)}
                    </div>
                  </div>
                )}

                {/* 7. Threads Akışı */}
                {advancedFilters.feeds && (
                  <div style={previewCardStyle}>
                    <div style={previewCardHeaderStyle}>Threads Akışı</div>
                    <div style={phoneWrapperStyle}>
                      {renderAdPreview('threads', showDetailsPanel ? editCreativeData : createFormData)}
                    </div>
                  </div>
                )}

                {/* 8. Facebook Arama Sonuçları */}
                {advancedFilters.search && (
                  <div style={previewCardStyle}>
                    <div style={previewCardHeaderStyle}>Facebook Arama Sonuçları</div>
                    <div style={phoneWrapperStyle}>
                      {renderAdPreview('search_results', showDetailsPanel ? editCreativeData : createFormData)}
                    </div>
                  </div>
                )}

                {/* 9. Messenger Hikayeleri */}
                {advancedFilters.stories && (
                  <div style={previewCardStyle}>
                    <div style={previewCardHeaderStyle}>Messenger Hikayeleri</div>
                    <div style={phoneWrapperStyle}>
                      {renderAdPreview('messenger_stories', showDetailsPanel ? editCreativeData : createFormData)}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #dddfe2', background: '#ffffff' }}>
              <button 
                type="button"
                onClick={() => setShowAdvancedPreviewModal(false)} 
                style={{ padding: '0.65rem 1.5rem', background: '#ffffff', color: '#4b5563', border: '1px solid #ccd0d5', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Kapat
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatusToggle({ active, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width: '42px', height: '22px', background: active ? '#1877f2' : '#bcc0c4', borderRadius: '12px', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
      <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: active ? '22px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${color}`, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700 }}>{label}<span style={{ color }}>{icon}</span></div>
      <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function TabButton({ id, label, count, activeTab, onClick }) {
  const active = activeTab === id;
  return (
    <button onClick={() => onClick(id)} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: active ? '2px solid #0064e0' : '2px solid transparent', color: active ? '#fff' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
      {label} <span style={{ background: active ? '#0064e0' : 'rgba(255,255,255,0.1)', color: active ? '#fff' : 'var(--text-secondary)', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.7rem' }}>{count}</span>
    </button>
  );
}

function StatusBadge({ status }) {
  const active = status === 'ACTIVE' || status === 'ENABLED';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '20px', background: active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: active ? '#10b981' : '#ef4444', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: active ? '#10b981' : '#ef4444' }} />
      {active ? 'AKTİF' : 'DURDURULDU'}
    </div>
  );
}

function EmptyRow({ colSpan }) {
  return (<tr><td colSpan={colSpan} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Veri bulunamadı.</td></tr>);
}

const thStyle = { padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' };
const trStyle = { transition: 'background 0.2s' };
const dateInputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', padding: '0.3rem 0.5rem', fontSize: '0.75rem', outline: 'none' };
const smallButtonStyle = { padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' };

const previewCardStyle = {
  background: '#ffffff',
  border: '1px solid #dddfe2',
  borderRadius: '16px',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.8rem',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};

const previewCardHeaderStyle = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#1c1e21',
  textAlign: 'center',
  width: '100%',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '0.4rem',
  marginBottom: '0.2rem'
};

const phoneWrapperStyle = {
  width: '100%',
  maxWidth: '280px', 
  background: '#e4e6eb', 
  borderRadius: '24px', 
  padding: '6px',
  border: '3px solid #ccd0d5',
  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  boxSizing: 'border-box',
  overflow: 'hidden'
};
