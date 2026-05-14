'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createMetaArmyCommandAction, approveMetaArmyRecommendationAction, toggleMetaStatusAction, createMetaCampaignAction, updateMetaEntityAction } from '@/app/actions';
import {
  TrendingUp, MousePointer2, Eye, Users as UsersIcon,
  Wallet, Search, Calendar, ChevronRight,
  AlertCircle, CheckCircle, Play, Pause, BarChart3,
  Bot, Send, ShieldCheck, Clock, Zap, ClipboardCheck
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
    
    // Optimistic Update
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
        alert('Durum güncellenirken hata oluştu: ' + res.error);
        // Revert on error
        if (type === 'campaign') {
          setCampaigns(prev => prev.map(c => c.id === entityId ? { ...c, status: currentStatus } : c));
        } else if (type === 'adset') {
          setAdSets(prev => prev.map(a => a.id === entityId ? { ...a, status: currentStatus } : a));
        } else if (type === 'ad') {
          setAds(prev => prev.map(a => a.id === entityId ? { ...a, status: currentStatus } : a));
        }
      }
    });
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!createFormData.name) return;
    setIsCreating(true);
    const res = await createMetaCampaignAction(id, createFormData);
    setIsCreating(false);
    
    if (res?.error) {
      alert('Kampanya oluşturulurken hata oluştu: ' + res.error);
    } else {
      alert(`${activeTab === 'campaigns' ? 'Kampanya' : activeTab === 'adsets' ? 'Reklam Seti' : 'Reklam'} başarıyla oluşturuldu!`);
      setShowCreateModal(false);
      
      const newEntity = { 
        id: res.id || Math.random().toString(), 
        name: createFormData.name, 
        status: createFormData.status,
        insights: { data: [{ spend: 0, impressions: 0, clicks: 0, reach: 0 }] }
      };

      if (activeTab === 'campaigns') {
        setCampaigns([{ ...newEntity, daily_budget: createFormData.daily_budget ? Number(createFormData.daily_budget) * 100 : null }, ...campaigns]);
      } else if (activeTab === 'adsets') {
        setAdSets([{ ...newEntity, campaign_id: createFormData.parent_id }, ...adSets]);
      } else if (activeTab === 'ads') {
        setAds([{ ...newEntity, adset_id: createFormData.parent_id }, ...ads]);
      }
      
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

  const selectedCampaignName = campaigns.find(c => c.id === selectedCampaignId)?.name;
  const selectedAdSetName = adSets.find(as => as.id === selectedAdSetId)?.name;

  const handleUpdateName = async () => {
    if (!editName || editName === selectedEntity.data.name) {
      setIsEditingEntity(false);
      return;
    }

    startTransition(async () => {
      const updateData = { name: editName };
      if (editBudget && !isNaN(editBudget)) {
        updateData.daily_budget = parseFloat(editBudget);
      }

      const res = await updateMetaEntityAction(id, selectedEntity.data.id, updateData);
      if (res?.error) {
        alert('Güncelleme hatası: ' + res.error);
      } else {
        // Update local state
        const type = selectedEntity.type;
        const updatedObj = { ...selectedEntity.data, name: editName, daily_budget: editBudget };
        if (type === 'campaign') setCampaigns(prev => prev.map(c => c.id === selectedEntity.data.id ? { ...c, ...updatedObj } : c));
        if (type === 'adset') setAdSets(prev => prev.map(as => as.id === selectedEntity.data.id ? { ...as, ...updatedObj } : as));
        if (type === 'ad') setAds(prev => prev.map(ad => ad.id === selectedEntity.data.id ? { ...ad, ...updatedObj } : ad));
        
        setSelectedEntity(prev => ({ ...prev, data: updatedObj }));
        setIsEditingEntity(false);
      }
    });
  };

  const isCustom = !!(initSince && initUntil);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      {/* Loading Overlay */}
      {isPending && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 10, 10, 0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem'
        }}>
          <div className="spinner" style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.1)',
            borderTop: '4px solid var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
          }}></div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', letterSpacing: '1px', marginBottom: '0.5rem' }}>META VERİLERİ GÜNCELLENİYOR</p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Lütfen bekleyin, canlı veriler çekiliyor...</p>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Filter Status Bar */}
      {(selectedCampaignId || selectedAdSetId) && (
        <div className="card" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem 1rem',
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '12px'
        }}>
          <AlertCircle size={16} style={{ color: '#10b981' }} />
          <div style={{ display: 'flex', flex: 1, gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Aktif Filtre:</span>
            {selectedCampaignId && (
              <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                Kampanya: {selectedCampaignName}
              </span>
            )}
            {selectedAdSetId && (
              <>
                <ChevronRight size={14} className="text-muted" />
                <span style={{ background: '#f59e0b', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                  Set: {selectedAdSetName}
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => {
              setSelectedCampaignId(null);
              setSelectedAdSetId(null);
              setActiveTab('campaigns');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Filtreleri Temizle
          </button>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="card" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1.25rem',
        flexWrap: 'wrap',
        gap: '1.5rem',
        background: 'rgba(255,255,255,0.02)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Calendar size={16} className="text-muted" />
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleDateChange(preset.id)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    background: (!isCustom && datePreset === preset.id) ? 'var(--accent-primary)' : 'transparent',
                    color: (!isCustom && datePreset === preset.id) ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Özel:</span>
              <input
                type="date"
                value={since}
                onChange={(e) => setSince(e.target.value)}
                style={dateInputStyle}
              />
              <span style={{ color: 'var(--text-secondary)' }}>-</span>
              <input
                type="date"
                value={until}
                onChange={(e) => setUntil(e.target.value)}
                style={dateInputStyle}
              />
              <button
                onClick={handleCustomDateApply}
                disabled={!since || !until || isPending}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  background: isCustom ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                  color: isCustom ? 'white' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                Uygula
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              type="text" 
              placeholder="Ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.5rem 1rem 0.5rem 2rem', 
                fontSize: '0.8rem', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          {activeTab !== 'army' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', gap: '0.5rem', background: '#0064e0', borderColor: '#0064e0' }}
            >
              + Yeni Oluştur
            </button>
          )}
          </div>
        </div>
      </div>


      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <StatCard label="Harcama" value={`${result.summary?.spend || 0} TL`} icon={<Wallet size={16} />} color="#10b981" />
        <StatCard label="Gösterim" value={Number(result.summary?.impressions || 0).toLocaleString()} icon={<Eye size={16} />} color="#3b82f6" />
        <StatCard label="Tıklanma" value={Number(result.summary?.clicks || 0).toLocaleString()} icon={<MousePointer2 size={16} />} color="#a855f7" />
        <StatCard label="CTR" value={`%${(Number(result.summary?.ctr || 0) * 100).toFixed(2)}`} icon={<TrendingUp size={16} />} color="#f59e0b" />
        <StatCard label="CPC" value={`${Number(result.summary?.cpc || 0).toFixed(2)} TL`} icon={<BarChart3 size={16} />} color="#ec4899" />
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '2rem', overflowX: 'auto' }}>
        <TabButton id="army" label="Meta Ads Army" count={armyResult?.summary?.pendingCommands || 0} activeTab={activeTab} onClick={setActiveTab} />
        <TabButton id="campaigns" label="Kampanyalar" count={filteredCampaigns.length} activeTab={activeTab} onClick={setActiveTab} />
        <TabButton id="adsets" label="Reklam Setleri" count={filteredAdSets.length} activeTab={activeTab} onClick={setActiveTab} />
        <TabButton id="ads" label="Reklamlar" count={filteredAds.length} activeTab={activeTab} onClick={setActiveTab} />
      </div>

      {/* Main Table Content */}
      {activeTab === 'army' ? (
        <MetaArmyPanel clientId={id} armyResult={armyResult} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            {activeTab === 'campaigns' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1200px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ ...thStyle, width: '40px' }}><input type="checkbox" disabled /></th>
                    <th style={thStyle}>KAMPANYA</th>
                    <th style={thStyle}>YAYIN DURUMU</th>
                    <th style={thStyle}>SONUÇLAR</th>
                    <th style={thStyle}>SONUÇ BAŞINA ÜCRET</th>
                    <th style={thStyle}>BÜTÇE</th>
                    <th style={thStyle}>HARCANAN TUTAR</th>
                    <th style={thStyle}>GÖSTERİM</th>
                    <th style={thStyle}>ERİŞİM</th>
                    <th style={thStyle}>BİTİŞ</th>
                    <th style={thStyle}>TEKLİF STRATEJİSİ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map(camp => {
                    const insights = camp.insights?.data?.[0] || {};
                    return (
                      <tr key={camp.id} style={trStyle}>
                        <td style={tdStyle}><input type="checkbox" disabled /></td>
                        <td style={{ ...tdStyle, paddingLeft: '0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div 
                              onClick={() => handleToggleStatus(camp.id, camp.status, 'campaign')}
                              style={{ 
                                width: '32px', 
                                height: '18px', 
                                background: camp.status === 'ACTIVE' || camp.status === 'ENABLED' ? '#10b981' : 'rgba(255,255,255,0.1)', 
                                borderRadius: '10px', 
                                position: 'relative',
                                cursor: 'pointer'
                              }}>
                              <div style={{ 
                                width: '14px', 
                                height: '14px', 
                                background: 'white', 
                                borderRadius: '50%', 
                                position: 'absolute', 
                                top: '2px', 
                                left: camp.status === 'ACTIVE' || camp.status === 'ENABLED' ? '16px' : '2px',
                                transition: 'left 0.2s'
                              }} />
                            </div>
                            <span
                              style={{ fontWeight: 700, color: '#0064e0', cursor: 'pointer', textDecoration: 'none' }}
                              onClick={() => openDetails(camp, 'campaign')}
                              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >
                              {camp.name}
                            </span>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <StatusBadge status={camp.status} />
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 700 }}>{insights.inline_link_clicks || '-'}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Bağlantı Tıklaması</div>
                        </td>
                        <td style={tdStyle}>
                          {insights.cost_per_inline_link_click ? `${Number(insights.cost_per_inline_link_click).toFixed(2)} TL` : '-'}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 700 }}>
                            {camp.daily_budget ? `${(camp.daily_budget / 100).toFixed(2)} TL` :
                              camp.lifetime_budget ? `${(camp.lifetime_budget / 100).toFixed(2)} TL` : 'Bütçe Yok'}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{camp.daily_budget ? 'Günlük' : 'Toplam'}</div>
                        </td>
                        <td style={tdStyle}>{insights.spend || '0,00'} TL</td>
                        <td style={tdStyle}>{Number(insights.impressions || 0).toLocaleString('tr-TR')}</td>
                        <td style={tdStyle}>{Number(insights.reach || 0).toLocaleString('tr-TR')}</td>
                        <td style={tdStyle}>{camp.stop_time ? new Date(camp.stop_time).toLocaleDateString('tr-TR') : 'Sürekli'}</td>
                        <td style={tdStyle}>{camp.bid_strategy?.replace(/_/g, ' ') || 'En yüksek hacim'}</td>
                      </tr>
                    );
                  })}
                  {filteredCampaigns.length === 0 && <EmptyRow colSpan={11} />}
                </tbody>
              </table>
            )}

            {activeTab === 'adsets' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1100px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ ...thStyle, width: '40px' }}><input type="checkbox" disabled /></th>
                    <th style={thStyle}>REKLAM SETİ</th>
                    <th style={thStyle}>YAYIN DURUMU</th>
                    <th style={thStyle}>SONUÇLAR</th>
                    <th style={thStyle}>BÜTÇE</th>
                    <th style={thStyle}>HARCANAN TUTAR</th>
                    <th style={thStyle}>GÖSTERİM</th>
                    <th style={thStyle}>ERİŞİM</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdSets.map(as => {
                    const insights = as.insights?.data?.[0] || {};
                    return (
                      <tr key={as.id} style={trStyle}>
                        <td style={tdStyle}><input type="checkbox" disabled /></td>
                        <td style={{ ...tdStyle, paddingLeft: '0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div 
                              onClick={() => handleToggleStatus(as.id, as.status, 'adset')}
                              style={{ 
                                width: '32px', 
                                height: '18px', 
                                background: as.status === 'ACTIVE' || as.status === 'ENABLED' ? '#10b981' : 'rgba(255,255,255,0.1)', 
                                borderRadius: '10px', 
                                position: 'relative',
                                cursor: 'pointer'
                              }}>
                              <div style={{ 
                                width: '14px', 
                                height: '14px', 
                                background: 'white', 
                                borderRadius: '50%', 
                                position: 'absolute', 
                                top: '2px', 
                                left: as.status === 'ACTIVE' || as.status === 'ENABLED' ? '16px' : '2px',
                                transition: 'left 0.2s'
                              }} />
                            </div>
                            <span
                              style={{ fontWeight: 700, color: '#0064e0', cursor: 'pointer', textDecoration: 'none' }}
                              onClick={() => openDetails(as, 'adset')}
                              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >
                              {as.name}
                            </span>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <StatusBadge status={as.status} />
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 700 }}>{insights.clicks || '-'}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Tıklama</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 700 }}>
                            {as.daily_budget ? `${(as.daily_budget / 100).toFixed(2)} TL` :
                              as.lifetime_budget ? `${(as.lifetime_budget / 100).toFixed(2)} TL` : 'Bütçe Yok'}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{as.daily_budget ? 'Günlük' : 'Toplam'}</div>
                        </td>
                        <td style={tdStyle}>{insights.spend || '0,00'} TL</td>
                        <td style={tdStyle}>{Number(insights.impressions || 0).toLocaleString('tr-TR')}</td>
                        <td style={tdStyle}>{Number(insights.reach || 0).toLocaleString('tr-TR')}</td>
                      </tr>
                    );
                  })}
                  {filteredAdSets.length === 0 && <EmptyRow colSpan={8} />}
                </tbody>
              </table>
            )}

            {activeTab === 'ads' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1200px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ ...thStyle, width: '40px' }}><input type="checkbox" disabled /></th>
                    <th style={thStyle}>REKLAM</th>
                    <th style={thStyle}>ÖNİZLEME</th>
                    <th style={thStyle}>YAYIN DURUMU</th>
                    <th style={thStyle}>SONUÇLAR</th>
                    <th style={thStyle}>HARCANAN TUTAR</th>
                    <th style={thStyle}>GÖSTERİM</th>
                    <th style={thStyle}>ERİŞİM</th>
                    <th style={thStyle}>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAds.map(ad => {
                    const insights = ad.insights?.data?.[0] || {};
                    return (
                      <tr key={ad.id} style={trStyle}>
                        <td style={tdStyle}><input type="checkbox" disabled /></td>
                        <td style={{ ...tdStyle, paddingLeft: '0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div 
                              onClick={() => handleToggleStatus(ad.id, ad.status, 'ad')}
                              style={{ 
                                width: '32px', 
                                height: '18px', 
                                background: ad.status === 'ACTIVE' || ad.status === 'ENABLED' ? '#10b981' : 'rgba(255,255,255,0.1)', 
                                borderRadius: '10px', 
                                position: 'relative',
                                cursor: 'pointer'
                              }}>
                              <div style={{ 
                                width: '14px', 
                                height: '14px', 
                                background: 'white', 
                                borderRadius: '50%', 
                                position: 'absolute', 
                                top: '2px', 
                                left: ad.status === 'ACTIVE' || ad.status === 'ENABLED' ? '16px' : '2px',
                                transition: 'left 0.2s'
                              }} />
                            </div>
                            <div style={{ maxWidth: '200px' }}>
                              <div 
                                style={{ fontWeight: 700, cursor: 'pointer', color: '#0064e0' }}
                                onClick={() => openDetails(ad, 'ad')}
                              >{ad.name}</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ad.creative?.body}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          {ad.creative?.image_url || ad.creative?.thumbnail_url ? (
                            <img src={ad.creative.image_url || ad.creative.thumbnail_url} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                          ) : <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />}
                        </td>
                        <td style={tdStyle}>
                          <StatusBadge status={ad.status} />
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 700 }}>{insights.clicks || '-'}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Tıklama</div>
                        </td>
                        <td style={tdStyle}>{insights.spend || '0,00'} TL</td>
                        <td style={tdStyle}>{Number(insights.impressions || 0).toLocaleString('tr-TR')}</td>
                        <td style={tdStyle}>{Number(insights.reach || 0).toLocaleString('tr-TR')}</td>
                        <td style={tdStyle}>%{(Number(insights.ctr || 0) * 100).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                  {filteredAds.length === 0 && <EmptyRow colSpan={9} />}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="heading-2" style={{ fontSize: '1.25rem' }}>
                Yeni {activeTab === 'campaigns' ? 'Kampanya' : activeTab === 'adsets' ? 'Reklam Seti' : 'Reklam'} Oluştur
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
            </div>
            
            <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">İsim</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  placeholder="Kampanya/Reklam Adı"
                  value={createFormData.name}
                  onChange={e => setCreateFormData({...createFormData, name: e.target.value})}
                />
              </div>

              {activeTab === 'campaigns' && (
                <div className="form-group">
                  <label className="form-label">Günlük Bütçe (TL)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Örn: 100"
                    value={createFormData.daily_budget}
                    onChange={e => setCreateFormData({...createFormData, daily_budget: e.target.value})}
                  />
                </div>
              )}

              {activeTab === 'adsets' && (
                <div className="form-group">
                  <label className="form-label">Üst Kampanya Seçin</label>
                  <select 
                    className="form-control"
                    required
                    value={createFormData.parent_id}
                    onChange={e => setCreateFormData({...createFormData, parent_id: e.target.value})}
                  >
                    <option value="">Kampanya Seçin...</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {activeTab === 'ads' && (
                <div className="form-group">
                  <label className="form-label">Üst Reklam Seti Seçin</label>
                  <select 
                    className="form-control"
                    required
                    value={createFormData.parent_id}
                    onChange={e => setCreateFormData({...createFormData, parent_id: e.target.value})}
                  >
                    <option value="">Reklam Seti Seçin...</option>
                    {adSets.map(as => <option key={as.id} value={as.id}>{as.name}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Yayın Durumu</label>
                <select 
                  className="form-control"
                  value={createFormData.status}
                  onChange={e => setCreateFormData({...createFormData, status: e.target.value})}
                >
                  <option value="ACTIVE">Aktif (Yayınla)</option>
                  <option value="PAUSED">Duraklatıldı (Taslak)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>İptal</button>
                <button type="submit" disabled={isCreating} className="btn btn-primary" style={{ flex: 1, background: '#0064e0', borderColor: '#0064e0' }}>
                  {isCreating ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS / EDIT PANEL */}
      {showDetailsPanel && selectedEntity && (
        <div 
          onClick={() => setShowDetailsPanel(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', zIndex: 100000,
            display: 'flex', justifyContent: 'flex-end'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="animate-slide-in-right"
            style={{
              width: '100%', maxWidth: '480px', height: '100%',
              background: '#0f172a', // Solid dark background to prevent overlap transparency
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', 
              overflowY: 'auto', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
              position: 'relative',
              zIndex: 100001
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <h2 className="heading-2" style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', color: '#fff' }}>
                <div style={{ padding: '0.4rem', background: 'rgba(0,100,224,0.1)', borderRadius: '8px', color: '#0064e0' }}>
                  {selectedEntity.type === 'campaign' ? <BarChart3 size={20} /> : selectedEntity.type === 'adset' ? <Zap size={20} /> : <TrendingUp size={20} />}
                </div>
                {selectedEntity.type === 'campaign' ? 'Kampanya' : selectedEntity.type === 'adset' ? 'Reklam Seti' : 'Reklam'} Detayı
              </h2>
              <button onClick={() => setShowDetailsPanel(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <section>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.05em' }}>Temel Bilgiler</h4>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>İsim</label>
                    {isEditingEntity ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                          autoFocus
                        />
                        <button onClick={handleUpdateName} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Kaydet</button>
                      </div>
                    ) : (
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>{selectedEntity.data.name}</div>
                    )}
                  </div>
                  {(selectedEntity.type === 'campaign' || selectedEntity.type === 'adset') && (
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Günlük Bütçe (TL)</label>
                      {isEditingEntity ? (
                        <input 
                          type="number" 
                          className="form-control" 
                          value={editBudget}
                          onChange={e => setEditBudget(e.target.value)}
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                        />
                      ) : (
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>{selectedEntity.data.daily_budget ? (selectedEntity.data.daily_budget / 100).toFixed(2) : '0.00'} TL</div>
                      )}
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Durum</label>
                    <StatusBadge status={selectedEntity.data.status} />
                  </div>
                  {selectedEntity.data.objective && (
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Hedef</label>
                      <div style={{ fontSize: '0.85rem' }}>{selectedEntity.data.objective}</div>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '1.2rem', letterSpacing: '0.1em' }}>Performans Özeti</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Harcama</div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>{selectedEntity.data.insights?.data?.[0]?.spend || '0,00'} TL</div>
                  </div>
                  <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Gösterim</div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>{Number(selectedEntity.data.insights?.data?.[0]?.impressions || 0).toLocaleString('tr-TR')}</div>
                  </div>
                  <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Tıklama</div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>{selectedEntity.data.insights?.data?.[0]?.clicks || selectedEntity.data.insights?.data?.[0]?.inline_link_clicks || 0}</div>
                  </div>
                  <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Erişim</div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>{Number(selectedEntity.data.insights?.data?.[0]?.reach || 0).toLocaleString('tr-TR')}</div>
                  </div>
                </div>
              </section>

              {selectedEntity.type === 'campaign' && (
                <button 
                  onClick={() => {
                    setSelectedCampaignId(selectedEntity.data.id);
                    setActiveTab('adsets');
                    setShowDetailsPanel(false);
                  }}
                  className="btn btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
                >
                  Reklam Setlerini Görüntüle <ChevronRight size={16} />
                </button>
              )}

              {selectedEntity.type === 'adset' && (
                <button 
                  onClick={() => {
                    setSelectedAdSetId(selectedEntity.data.id);
                    setActiveTab('ads');
                    setShowDetailsPanel(false);
                  }}
                  className="btn btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
                >
                  Reklamları Görüntüle <ChevronRight size={16} />
                </button>
              )}
              
              <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => handleToggleStatus(selectedEntity.data.id, selectedEntity.data.status, selectedEntity.type)}
                  className="btn btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {selectedEntity.data.status === 'ACTIVE' || selectedEntity.data.status === 'ENABLED' ? 'Durdur' : 'Başlat'}
                </button>
                 <button 
                  onClick={() => setIsEditingEntity(!isEditingEntity)}
                  className="btn btn-primary" 
                  style={{ flex: 1, justifyContent: 'center', background: '#0064e0', borderColor: '#0064e0' }}
                >
                  {isEditingEntity ? 'İptal' : 'Düzenle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
        return;
      }
      setMessage({ type: 'success', text: 'Komut kuyruğa alındı. Agent döngüsü bağlandığında işlenecek.' });
      router.refresh();
    });
  };

  const approveRecommendation = (recommendationId) => {
    setMessage(null);
    startCommandTransition(async () => {
      const result = await approveMetaArmyRecommendationAction(recommendationId, `ONAY: ${recommendationId}`);
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
        return;
      }
      setMessage({ type: 'success', text: 'Öneri onaylandı. Executor bağlantısı aktif olduğunda uygulanabilir.' });
      router.refresh();
    });
  };

  if (armyResult?.error) {
    return (
      <div className="card" style={{ padding: '2rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Meta Ads Army verisi alınamadı</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{armyResult.details || armyResult.error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
        <ArmyStat title="Son Kontrol" value={summary.latestRunAt ? new Date(summary.latestRunAt).toLocaleString('tr-TR') : 'Henüz yok'} icon={<Clock size={16} />} color="#3b82f6" />
        <ArmyStat title="Bekleyen Komut" value={summary.pendingCommands || 0} icon={<Bot size={16} />} color="#a855f7" />
        <ArmyStat title="Onay Bekleyen" value={summary.pendingApprovals || 0} icon={<ClipboardCheck size={16} />} color="#f59e0b" />
        <ArmyStat title="Kritik Bulgu" value={summary.criticalFindings || 0} icon={<AlertCircle size={16} />} color="#ef4444" />
      </div>

      <div className="card" style={{ padding: '1.25rem', border: '1px solid rgba(16,185,129,0.18)', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.04))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={20} /> Meta Ads Army Komut Merkezi
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Bu alandan orchestrator'a görev verilir. İlk fazda komutlar kuyruğa alınır; reklam değiştiren aksiyonlar açık onay olmadan uygulanmaz.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>
            <ShieldCheck size={16} /> Onaylı aksiyon modu
          </div>
        </div>

        <form action={submitCommand} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <textarea
            name="command"
            rows={4}
            placeholder="Örn: Son 7 günde CPC artan kampanya ve reklam setlerini analiz et, kötü placementları ve bütçe önerilerini çıkar."
            disabled={isSubmitting}
            style={{
              width: '100%',
              resize: 'vertical',
              background: 'rgba(0,0,0,0.25)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '0.9rem',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select name="priority" defaultValue="NORMAL" disabled={isSubmitting} style={prioritySelectStyle}>
              <option value="LOW" style={priorityOptionStyle}>Düşük Öncelik</option>
              <option value="NORMAL" style={priorityOptionStyle}>Normal Öncelik</option>
              <option value="HIGH" style={priorityOptionStyle}>Yüksek Öncelik</option>
              <option value="URGENT" style={priorityOptionStyle}>Acil</option>
            </select>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={15} /> {isSubmitting ? 'Kuyruğa alınıyor...' : 'Agent Army’ye Gönder'}
            </button>
          </div>
        </form>
        {message && (
          <div style={{ marginTop: '0.75rem', color: message.type === 'error' ? '#ef4444' : '#10b981', fontSize: '0.85rem', fontWeight: 700 }}>
            {message.text}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <ArmyList title="Son Komutlar" empty="Henüz komut yok." items={commands.map((item) => ({
          id: item.id,
          title: item.command,
          meta: `${item.status} · ${item.priority} · ${new Date(item.createdAt).toLocaleString('tr-TR')}`,
          badge: item.requestedBy || 'panel'
        }))} />
        <ArmyList title="Agent Run Geçmişi" empty="Henüz agent run yok." items={runs.map((item) => ({
          id: item.id,
          title: item.summary || item.agentName,
          meta: `${item.agentName} · ${item.status} · ${new Date(item.createdAt).toLocaleString('tr-TR')}`,
          badge: item.status
        }))} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <ArmyList title="Son Bulgular" empty="Henüz bulgu yok." items={findings.map((item) => ({
          id: item.id,
          title: item.title,
          meta: `${item.category} · ${item.details}`,
          badge: item.severity
        }))} />
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={16} /> Öneriler ve Onaylar</h3>
          {recommendations.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Henüz öneri yok.</p>
          ) : recommendations.map((item) => (
            <div key={item.id} style={{ padding: '0.85rem 0', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.25rem' }}>{item.details}</div>
                  <div style={{ color: '#f59e0b', fontSize: '0.72rem', fontWeight: 800, marginTop: '0.35rem' }}>Risk: {item.riskLevel} · {item.status}</div>
                </div>
                {item.status === 'PENDING_APPROVAL' && (
                  <button onClick={() => approveRecommendation(item.id)} disabled={isSubmitting} style={{ ...smallButtonStyle, background: 'rgba(16,185,129,0.14)', color: '#10b981' }}>
                    Onayla
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArmyStat({ title, value, icon, color }) {
  return (
    <div className="card" style={{ padding: '1rem', borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
        {title}<span style={{ color }}>{icon}</span>
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 900, marginTop: '0.5rem' }}>{value}</div>
    </div>
  );
}

function ArmyList({ title, items, empty }) {
  return (
    <div className="card" style={{ padding: '1rem', minHeight: '220px' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{title}</h3>
      {items.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{empty}</p>
      ) : items.map((item) => (
        <div key={item.id} style={{ padding: '0.75rem 0', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem', marginTop: '0.25rem' }}>{item.meta}</div>
            </div>
            <span style={{ fontSize: '0.65rem', height: 'fit-content', padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontWeight: 800 }}>{item.badge}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabButton({ id, label, count, activeTab, onClick }) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        padding: '1rem 0.5rem',
        fontSize: '0.9rem',
        fontWeight: 700,
        background: 'none',
        border: 'none',
        borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      {label} <span style={{ fontSize: '0.7rem', background: isActive ? 'var(--accent-primary)22' : 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{count}</span>
    </button>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ color, opacity: 0.8 }}>{icon}</div>
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const isActive = status === 'ACTIVE';
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.2rem 0.5rem',
      borderRadius: '4px',
      background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
      color: isActive ? '#10b981' : 'var(--text-secondary)',
      fontSize: '0.65rem',
      fontWeight: 800
    }}>
      {isActive ? <Play size={10} fill="#10b981" /> : <Pause size={10} fill="var(--text-secondary)" />}
      {isActive ? 'AKTİF' : 'DURDURULDU'}
    </div>
  );
}

function EmptyRow({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <BarChart3 size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
        <p>Veri bulunamadı.</p>
      </td>
    </tr>
  );
}

const thStyle = { padding: '0.75rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle = { padding: '1rem', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)' };
const trStyle = { transition: 'background 0.2s' };
const smallButtonStyle = {
  border: '1px solid var(--border-color)',
  borderRadius: '7px',
  padding: '0.45rem 0.65rem',
  fontSize: '0.72rem',
  fontWeight: 800,
  cursor: 'pointer',
  whiteSpace: 'nowrap'
};
const prioritySelectStyle = {
  background: '#0f1f2e',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  borderRadius: '6px',
  padding: '0.55rem 0.75rem',
  fontSize: '0.75rem',
  color: '#f8fafc',
  outline: 'none',
  colorScheme: 'dark'
};

const priorityOptionStyle = {
  backgroundColor: '#f8fafc',
  color: '#0f172a'
};

const dateInputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  padding: '0.3rem 0.5rem',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
  outline: 'none',
  colorScheme: 'dark'
};
