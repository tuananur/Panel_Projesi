'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createMetaArmyCommandAction, approveMetaArmyRecommendationAction, toggleMetaStatusAction, createMetaCampaignAction, createMetaAdSetAction, createMetaAdAction, updateMetaEntityAction, deleteMetaEntityAction } from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';
import {
  TrendingUp, MousePointer2, Eye, Users as UsersIcon,
  Wallet, Search, Calendar, ChevronRight,
  AlertCircle, CheckCircle, Play, Pause, BarChart3,
  Bot, Send, ShieldCheck, Clock, Zap, ClipboardCheck, Edit, Trash2, X, BarChart
} from 'lucide-react';

const DATE_PRESETS = [
  { id: 'today', label: 'Bugün' },
  { id: 'yesterday', label: 'Dün' },
  { id: 'last_7d', label: 'Son 7 Gün' },
  { id: 'last_30d', label: 'Son 30 Gün' },
  { id: 'this_month', label: 'Bu Ay' },
  { id: 'last_month', label: 'Geçen Ay' }
];

export default function MetaContent({ result, armyResult, id, datePreset, since: initSince, until: initUntil }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('army'); // army, campaigns, adsets, ads
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedAdSetId, setSelectedAdSetId] = useState(null);

  const [campaigns, setCampaigns] = useState(result.activeCampaigns || []);
  const [adSets, setAdSets] = useState(result.adSets || []);
  const [ads, setAds] = useState(result.ads || []);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({ name: '', daily_budget: '', status: 'ACTIVE', parent_id: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [messageModal, setMessageModal] = useState({ show: false, title: '', message: '', details: '', type: 'error' });

  const [selectedEntity, setSelectedEntity] = useState(null); // { type: 'campaign'|'adset'|'ad', data: object }
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [isEditingEntity, setIsEditingEntity] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState('');

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

  const handleDeleteEntity = async (entity, type) => {
    if (!confirm(`${entity.name} öğesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) return;
    startTransition(async () => {
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

  const openDetails = (entity, type) => {
    setSelectedEntity({ type, data: entity });
    setEditName(entity.name);
    setEditBudget(entity.daily_budget || entity.lifetime_budget || '0');
    setIsEditingEntity(false);
    setShowDetailsPanel(true);
  };

  const handleUpdateName = async () => {
    startTransition(async () => {
      const updateData = { name: editName };
      if (editBudget) updateData.daily_budget = parseFloat(editBudget);
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
        const updatedObj = { ...selectedEntity.data, name: editName, daily_budget: editBudget };
        if (type === 'campaign') setCampaigns(prev => prev.map(c => c.id === selectedEntity.data.id ? { ...c, ...updatedObj } : c));
        if (type === 'adset') setAdSets(prev => prev.map(as => as.id === selectedEntity.data.id ? { ...as, ...updatedObj } : as));
        if (type === 'ad') setAds(prev => prev.map(ad => ad.id === selectedEntity.data.id ? { ...ad, ...updatedObj } : ad));
        setSelectedEntity({ type, data: updatedObj });
        setIsEditingEntity(false);
        setMessageModal({ show: true, title: 'Başarılı', message: 'Değişiklikler başarıyla kaydedildi.', type: 'success' });
      }
    });
  };

  const selectedCampaignName = campaigns.find(c => c.id === selectedCampaignId)?.name;
  const selectedAdSetName = adSets.find(as => as.id === selectedAdSetId)?.name;
  const isCustom = !!(initSince && initUntil);

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
          {activeTab !== 'army' && <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ background: '#0064e0', padding: '0.5rem 1.2rem' }}>+ Yeni Oluştur</button>}
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
        <TabButton id="army" label="Meta Ads Army" count={armyResult?.summary?.pendingCommands || 0} activeTab={activeTab} onClick={setActiveTab} />
        <TabButton id="campaigns" label="Kampanyalar" count={filteredCampaigns.length} activeTab={activeTab} onClick={setActiveTab} />
        <TabButton id="adsets" label="Reklam Setleri" count={filteredAdSets.length} activeTab={activeTab} onClick={setActiveTab} />
        <TabButton id="ads" label="Reklamlar" count={filteredAds.length} activeTab={activeTab} onClick={setActiveTab} />
      </div>

      {/* Tables */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        {activeTab === 'army' && <MetaArmyPanel clientId={id} armyResult={armyResult} />}
        
        {activeTab === 'campaigns' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1100px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ ...thStyle, width: '40px' }}><input type="checkbox" disabled /></th>
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
                  <td style={tdStyle}><input type="checkbox" disabled /></td>
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
                <th style={{ ...thStyle, width: '40px' }}><input type="checkbox" disabled /></th>
                <th style={thStyle}>REKLAM SETİ</th>
                <th style={thStyle}>DURUM</th>
                <th style={thStyle}>BÜTÇE</th>
                <th style={thStyle}>HARCAMA</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>AKSİYONLAR</th>
              </tr>
            </thead>
            <tbody>{filteredAdSets.map(as => (
              <tr key={as.id} style={trStyle}>
                <td style={tdStyle}><input type="checkbox" disabled /></td>
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
                <th style={{ ...thStyle, width: '40px' }}><input type="checkbox" disabled /></th>
                <th style={thStyle}>REKLAM</th>
                <th style={thStyle}>DURUM</th>
                <th style={thStyle}>HARCAMA</th>
                <th style={thStyle}>CTR</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>AKSİYONLAR</th>
              </tr>
            </thead>
            <tbody>{filteredAds.map(ad => (
              <tr key={ad.id} style={trStyle}>
                <td style={tdStyle}><input type="checkbox" disabled /></td>
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
            width: '100%', maxWidth: '520px', maxHeight: '90vh',
            background: '#1a1f2e', 
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)', zIndex: 10001, 
            display: 'flex', flexDirection: 'column',
            animation: 'modalFadeIn 0.3s ease-out',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '2rem 2.5rem 1rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
                Yeni {activeTab === 'campaigns' ? 'Kampanya' : activeTab === 'adsets' ? 'Reklam Seti' : 'Reklam'}
              </h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleCreateEntity} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2.5rem 2.5rem 2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>BAŞLIK *</label>
                  <input 
                    required
                    className="form-control" 
                    value={createFormData.name} 
                    onChange={e => setCreateFormData({ ...createFormData, name: e.target.value })} 
                    placeholder="Örn: Yaz İndirimi 2024"
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px' }} 
                  />
                </div>

                {(activeTab === 'adsets' || activeTab === 'ads') && (
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>
                      ÜST {activeTab === 'adsets' ? 'KAMPANYA' : 'REKLAM SETİ'} SEÇİN *
                    </label>
                    <select 
                      required
                      value={createFormData.parent_id}
                      onChange={e => setCreateFormData({ ...createFormData, parent_id: e.target.value })}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px', outline: 'none' }}
                    >
                      <option value="">Seçiniz...</option>
                      {(activeTab === 'adsets' ? campaigns : adSets).map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab !== 'ads' && (
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>GÜNLÜK BÜTÇE (TL)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={createFormData.daily_budget} 
                      onChange={e => setCreateFormData({ ...createFormData, daily_budget: e.target.value })} 
                      placeholder="Örn: 500"
                      style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px' }} 
                    />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>İLK DURUM</label>
                  <select 
                    value={createFormData.status}
                    onChange={e => setCreateFormData({ ...createFormData, status: e.target.value })}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px', outline: 'none' }}
                  >
                    <option value="ACTIVE">Aktif (Hemen Başlat)</option>
                    <option value="PAUSED">Durdurulmuş (Taslak)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#374151', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>Vazgeç</button>
                <button type="submit" disabled={isCreating} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'linear-gradient(90deg, #0064e0 0%, #00d4ff 100%)', color: '#fff', border: 'none', fontWeight: 700, cursor: isCreating ? 'not-allowed' : 'pointer', fontSize: '1rem', opacity: isCreating ? 0.7 : 1 }}>
                  {isCreating ? 'Oluşturuluyor...' : 'Oluştur'}
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
            width: '100%', maxWidth: '520px', maxHeight: '90vh',
            background: '#1a1f2e', 
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)', zIndex: 10001, 
            display: 'flex', flexDirection: 'column',
            animation: 'modalFadeIn 0.3s ease-out',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '2rem 2.5rem 1rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
                {selectedEntity.type === 'campaign' ? 'Kampanya' : selectedEntity.type === 'adset' ? 'Reklam Seti' : 'Reklam'} Detayı
              </h2>
              <button onClick={() => setShowDetailsPanel(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}><X size={24} /></button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2.5rem 2.5rem 2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Info Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>BAŞLIK *</label>
                    {isEditingEntity ? (
                      <input className="form-control" value={editName} onChange={e => setEditName(e.target.value)} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px' }} />
                    ) : (
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: '#fff', background: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>{selectedEntity.data.name}</div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {(selectedEntity.type === 'campaign' || selectedEntity.type === 'adset') && (
                      <div>
                        <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>GÜNLÜK BÜTÇE</label>
                        {isEditingEntity ? (
                          <input type="number" className="form-control" value={editBudget} onChange={e => setEditBudget(e.target.value)} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px' }} />
                        ) : (
                          <div style={{ fontWeight: 600, fontSize: '1rem', color: '#fff', background: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>{(selectedEntity.data.daily_budget / 100).toFixed(2)} TL</div>
                        )}
                      </div>
                    )}
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>DURUM</label>
                      <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
                        <StatusBadge status={selectedEntity.data.status} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Section */}
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>PERFORMANS ÖZETİ</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>Harcama</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedEntity.data.insights?.data?.[0]?.spend || 0} TL</div>
                    </div>
                    <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>Gösterim</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{Number(selectedEntity.data.insights?.data?.[0]?.impressions || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ padding: '1.5rem 2.5rem 2.5rem 2.5rem', display: 'flex', gap: '1rem' }}>
              {isEditingEntity ? (
                <>
                  <button onClick={() => setIsEditingEntity(false)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#374151', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>İptal</button>
                  <button onClick={handleUpdateName} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'linear-gradient(90deg, #c026d3 0%, #db2777 100%)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>Kaydet</button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleToggleStatus(selectedEntity.data.id, selectedEntity.data.status, selectedEntity.type)} 
                    style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#4b5563', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}
                  >
                    {selectedEntity.data.status === 'ACTIVE' || selectedEntity.data.status === 'ENABLED' ? 'Durdur' : 'Başlat'}
                  </button>
                  <button 
                    onClick={() => setIsEditingEntity(true)} 
                    style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'linear-gradient(90deg, #c026d3 0%, #db2777 100%)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}
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
    </div>
  );
}

function StatusToggle({ active, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width: '32px', height: '18px', background: active ? '#10b981' : 'rgba(255,255,255,0.1)', borderRadius: '10px', position: 'relative', cursor: 'pointer' }}>
      <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: active ? '16px' : '2px', transition: 'left 0.2s' }} />
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
const prioritySelectStyle = { background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', outline: 'none' };
const priorityOptionStyle = { background: '#0f172a', color: '#fff' };
const smallButtonStyle = { padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' };

// META ARMY PANEL COMPONENT
function MetaArmyPanel({ clientId, armyResult }) {
  const router = useRouter();
  const [isSubmitting, startCommandTransition] = useTransition();
  const [message, setMessage] = useState(null);
  const data = armyResult?.success ? armyResult : null;
  const summary = data?.summary || {};
  const commands = data?.commands || [];
  const runs = data?.runs || [];
  const findings = data?.findings || [];
  const recommendations = data?.recommendations || [];

  const submitCommand = (formData) => {
    setMessage(null);
    startCommandTransition(async () => {
      const result = await createMetaArmyCommandAction(clientId, formData);
      if (result?.error) { setMessage({ type: 'error', text: result.error }); return; }
      setMessage({ type: 'success', text: 'Komut kuyruğa alındı.' });
      router.refresh();
    });
  };

  const approveRecommendation = (recommendationId) => {
    startCommandTransition(async () => {
      const result = await approveMetaArmyRecommendationAction(recommendationId, `ONAY: ${recommendationId}`);
      if (result?.error) { alert(result.error); return; }
      router.refresh();
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <ArmyStat title="Son Kontrol" value={summary.latestRunAt ? new Date(summary.latestRunAt).toLocaleTimeString('tr-TR') : 'Yok'} icon={<Clock size={16} />} color="#3b82f6" />
        <ArmyStat title="Bekleyen" value={summary.pendingCommands || 0} icon={<Bot size={16} />} color="#a855f7" />
        <ArmyStat title="Onay Bekleyen" value={summary.pendingApprovals || 0} icon={<ClipboardCheck size={16} />} color="#f59e0b" />
        <ArmyStat title="Kritik Bulgu" value={summary.criticalFindings || 0} icon={<AlertCircle size={16} />} color="#ef4444" />
      </div>

      <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(59,130,246,0.05))' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bot size={22} /> Komut Merkezi</h2>
        <form action={submitCommand} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea name="command" rows={4} placeholder="Agent'a görev verin..." style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', color: '#fff' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <select name="priority" defaultValue="NORMAL" style={prioritySelectStyle}>
              <option value="LOW">Düşük</option><option value="NORMAL">Normal</option><option value="HIGH">Yüksek</option>
            </select>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ background: '#10b981' }}>{isSubmitting ? 'Gönderiliyor...' : 'Army’ye Gönder'}</button>
          </div>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Bulgular</h3>
          {findings.map(f => <div key={f.id} style={{ padding: '0.8rem 0', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{f.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.details}</div>
          </div>)}
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Öneriler</h3>
          {recommendations.map(r => <div key={r.id} style={{ padding: '0.8rem 0', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{r.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.details}</div>
            </div>
            {r.status === 'PENDING_APPROVAL' && <button onClick={() => approveRecommendation(r.id)} className="btn btn-primary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>Onayla</button>}
          </div>)}
        </div>
      </div>
    </div>
  );
}

function ArmyStat({ title, value, icon, color }) {
  return (<div className="card" style={{ padding: '1rem', borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{title}<span style={{ color }}>{icon}</span></div>
    <div style={{ fontSize: '1.2rem', fontWeight: 900, marginTop: '0.4rem' }}>{value}</div>
  </div>);
}
