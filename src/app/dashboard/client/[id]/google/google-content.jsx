'use client';

import { useState, useTransition } from 'react';
import { 
  TrendingUp, MousePointer2, Eye, 
  Wallet, BarChart3, Play, Pause,
  Calendar, Search, AlertCircle,
  Edit, Trash2, X
} from 'lucide-react';
import { 
  toggleGoogleStatusAction, 
  updateGoogleEntityAction, 
  deleteGoogleEntityAction,
  createGoogleCampaignAction
} from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';

export default function GoogleContent({ result, id }) {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [campaigns, setCampaigns] = useState(result.activeCampaigns || []);
  
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [isEditingEntity, setIsEditingEntity] = useState(false);
  const [editName, setEditName] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState({ name: '', status: 'ENABLED' });
  
  const [messageModal, setMessageModal] = useState({ show: false, title: '', message: '', details: '', type: 'error' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, entity: null, type: null });
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!createFormData.name.trim()) return;
    setIsCreating(true);
    const res = await createGoogleCampaignAction(id, createFormData);
    setIsCreating(false);

    if (res?.error) {
      setMessageModal({ show: true, title: 'Hata', message: res.error, type: 'error' });
    } else {
      const newCampaign = {
        id: res.id,
        name: createFormData.name,
        status: createFormData.status,
        spend: 0,
        clicks: 0,
        impressions: 0
      };
      setCampaigns([newCampaign, ...campaigns]);
      setShowCreateModal(false);
      setCreateFormData({ name: '', status: 'ENABLED' });
      setMessageModal({ show: true, title: 'Başarılı', message: 'Kampanya başarıyla oluşturuldu.', type: 'success' });
    }
  };

  const handleToggleStatus = (entityId, currentStatus) => {
    const newStatus = currentStatus === 'ENABLED' ? 'PAUSED' : 'ENABLED';
    
    // Optimistic update
    setCampaigns(prev => prev.map(c => c.id === entityId ? { ...c, status: newStatus } : c));
    if (selectedEntity?.data?.id === entityId) {
      setSelectedEntity({ ...selectedEntity, data: { ...selectedEntity.data, status: newStatus } });
    }

    startTransition(async () => {
      const res = await toggleGoogleStatusAction(id, entityId, newStatus);
      if (res?.error) {
        setMessageModal({ show: true, title: 'Hata', message: 'Durum güncellenirken hata oluştu: ' + res.error, type: 'error' });
        setCampaigns(prev => prev.map(c => c.id === entityId ? { ...c, status: currentStatus } : c));
      } else {
        setMessageModal({ show: true, title: 'Başarılı', message: 'Durum başarıyla güncellendi.', type: 'success' });
      }
    });
  };

  const openDetails = (entity) => {
    setSelectedEntity({ data: entity });
    setEditName(entity.name);
    setIsEditingEntity(false);
    setShowDetailsPanel(true);
  };

  const handleUpdateName = () => {
    if (!editName.trim()) return;
    
    startTransition(async () => {
      const res = await updateGoogleEntityAction(id, selectedEntity.data.id, { name: editName });
      if (res?.error) {
        setMessageModal({ show: true, title: 'Hata', message: res.error, type: 'error' });
      } else {
        const updatedObj = { ...selectedEntity.data, name: editName };
        setCampaigns(prev => prev.map(c => c.id === selectedEntity.data.id ? { ...c, name: editName } : c));
        setSelectedEntity({ data: updatedObj });
        setIsEditingEntity(false);
        setMessageModal({ show: true, title: 'Başarılı', message: 'Başarıyla güncellendi.', type: 'success' });
      }
    });
  };

  const handleDeleteEntity = (entity) => {
    setDeleteConfirm({ show: true, entity, type: 'single' });
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCampaigns.length && filteredCampaigns.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCampaigns.map(c => c.id));
    }
  };

  const handleBulkStatus = (newStatus) => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      let successCount = 0;
      let errorCount = 0;
      for (const entityId of selectedIds) {
        const res = await toggleGoogleStatusAction(id, entityId, newStatus);
        if (res?.error) errorCount++;
        else successCount++;
      }
      setSelectedIds([]);
      setMessageModal({ 
        show: true, 
        title: 'Toplu İşlem Tamamlandı', 
        message: `${successCount} öğe güncellendi. ${errorCount > 0 ? errorCount + ' öğede hata oluştu.' : ''}`,
        type: errorCount > 0 ? 'error' : 'success' 
      });
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirm({ show: true, entity: { name: `${selectedIds.length} öğe` }, type: 'bulk' });
  };

  const confirmDelete = async () => {
    const { entity, type } = deleteConfirm;
    if (!entity) return;
    setDeleteConfirm({ show: false, entity: null, type: null });
    
    startTransition(async () => {
      if (type === 'bulk') {
        let successCount = 0;
        let errorCount = 0;
        for (const entityId of selectedIds) {
          const res = await deleteGoogleEntityAction(id, entityId);
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
      } else {
        const res = await deleteGoogleEntityAction(id, entity.id);
        if (res?.error) {
          setMessageModal({ show: true, title: 'Hata', message: 'Silme hatası: ' + res.error, type: 'error' });
        } else {
          setCampaigns(prev => prev.filter(c => c.id !== entity.id));
          setMessageModal({ show: true, title: 'Başarılı', message: 'Başarıyla silindi.', type: 'success' });
          if (selectedEntity?.data?.id === entity.id) setShowDetailsPanel(false);
        }
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      
      {/* Loading Overlay */}
      {isPending && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
          <div className="spinner" style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #4285F4', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: 'white', fontWeight: 800 }}>GOOGLE VERİLERİ GÜNCELLENİYOR...</p>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <StatCard label="Harcama" value={`${result.summary?.spend || 0} TL`} icon={<Wallet size={16} />} color="#4285F4" />
        <StatCard label="Gösterim" value={Number(result.summary?.impressions || 0).toLocaleString()} icon={<Eye size={16} />} color="#3b82f6" />
        <StatCard label="Tıklanma" value={Number(result.summary?.clicks || 0).toLocaleString()} icon={<MousePointer2 size={16} />} color="#a855f7" />
        <StatCard label="CTR" value={`%${(Number(result.summary?.ctr || 0) * 100).toFixed(2)}`} icon={<TrendingUp size={16} />} color="#f59e0b" />
        <StatCard label="CPC" value={`${Number(result.summary?.cpc || 0).toFixed(2)} TL`} icon={<BarChart3 size={16} />} color="#ec4899" />
      </div>

      {/* Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <TabButton id="campaigns" label="Kampanyalar" count={filteredCampaigns.length} activeTab={activeTab} onClick={setActiveTab} />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              type="text" 
              placeholder="Kampanya ara..." 
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
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ background: '#4285F4', padding: '0.5rem 1.2rem' }}>+ Yeni Oluştur</button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '1.5rem', 
          padding: '1rem 1.5rem', background: '#4285F4', borderRadius: '12px',
          animation: 'slideDown 0.3s ease-out', color: '#fff',
          boxShadow: '0 10px 30px rgba(66, 133, 244, 0.3)'
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedIds.length} öğe seçildi</div>
          <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => handleBulkStatus('ENABLED')} style={{ ...smallButtonStyle, background: '#10b981', color: '#fff' }}>Seçilenleri Başlat</button>
            <button onClick={() => handleBulkStatus('PAUSED')} style={{ ...smallButtonStyle, background: '#f59e0b', color: '#fff' }}>Seçilenleri Durdur</button>
            <button onClick={handleBulkDelete} style={{ ...smallButtonStyle, background: '#ef4444', color: '#fff' }}>Seçilenleri Sil</button>
          </div>
          <button onClick={() => setSelectedIds([])} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.8 }}>Seçimi Temizle</button>
        </div>
      )}

      {/* Main Table Content */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
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
                <th style={thStyle}>HARCAMA</th>
                <th style={thStyle}>TIKLANMA</th>
                <th style={thStyle}>GÖSTERİM</th>
                <th style={thStyle}>CTR</th>
                <th style={thStyle}>CPC</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>AKSİYONLAR</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map(camp => (
                <tr key={camp.id} style={trStyle}>
                  <td style={tdStyle}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(camp.id)} 
                      onChange={() => toggleSelection(camp.id)} 
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <StatusToggle active={camp.status === 'ENABLED'} onToggle={() => handleToggleStatus(camp.id, camp.status)} />
                      <div>
                        <div onClick={() => openDetails(camp)} style={{ fontWeight: 700, color: '#4285F4', cursor: 'pointer' }}>{camp.name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>ID: {camp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={camp.status} />
                  </td>
                  <td style={tdStyle}>{camp.spend.toLocaleString()} TL</td>
                  <td style={tdStyle}>{camp.clicks.toLocaleString()}</td>
                  <td style={tdStyle}>{camp.impressions.toLocaleString()}</td>
                  <td style={tdStyle}>%{(camp.clicks / camp.impressions * 100).toFixed(2)}</td>
                  <td style={tdStyle}>{(camp.spend / camp.clicks).toFixed(2)} TL</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => openDetails(camp)} className="btn-icon"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteEntity(camp)} className="btn-icon danger"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <BarChart3 size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                    <p>Kampanya bulunamadı.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
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
            <div style={{ padding: '2rem 2.5rem 1rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>Kampanya Detayı</h2>
              <button onClick={() => setShowDetailsPanel(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}><X size={24} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2.5rem 2.5rem 2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>BAŞLIK *</label>
                  {isEditingEntity ? (
                    <input className="form-control" value={editName} onChange={e => setEditName(e.target.value)} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px', width: '100%' }} />
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: '#fff', background: '#0f172a', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>{selectedEntity.data.name}</div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>Harcama</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedEntity.data.spend.toLocaleString()} TL</div>
                  </div>
                  <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>Durum</div>
                    <StatusBadge status={selectedEntity.data.status} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem 2.5rem 2.5rem 2.5rem', display: 'flex', gap: '1rem' }}>
              {isEditingEntity ? (
                <>
                  <button onClick={() => setIsEditingEntity(false)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#374151', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>İptal</button>
                  <button onClick={handleUpdateName} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#4285F4', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Kaydet</button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleToggleStatus(selectedEntity.data.id, selectedEntity.data.status)} 
                    style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#4b5563', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {selectedEntity.data.status === 'ENABLED' ? 'Durdur' : 'Başlat'}
                  </button>
                  <button 
                    onClick={() => setIsEditingEntity(true)} 
                    style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#4285F4', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
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
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>Yeni Google Kampanyası</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleCreateCampaign} style={{ padding: '1.5rem 2.5rem 2.5rem 2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>KAMPANYA ADI *</label>
                  <input 
                    required
                    className="form-control" 
                    value={createFormData.name} 
                    onChange={e => setCreateFormData({ ...createFormData, name: e.target.value })} 
                    placeholder="Örn: Google Search - Marka"
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>İLK DURUM</label>
                  <select 
                    value={createFormData.status}
                    onChange={e => setCreateFormData({ ...createFormData, status: e.target.value })}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px', outline: 'none' }}
                  >
                    <option value="ENABLED">Aktif (Hemen Başlat)</option>
                    <option value="PAUSED">Durdurulmuş (Taslak)</option>
                  </select>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#374151', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Vazgeç</button>
                  <button type="submit" disabled={isCreating} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#4285F4', color: '#fff', border: 'none', fontWeight: 700, cursor: isCreating ? 'not-allowed' : 'pointer', opacity: isCreating ? 0.7 : 1 }}>
                    {isCreating ? 'Oluşturuluyor...' : 'Oluştur'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}

      {/* MESSAGES & CONFIRMS */}
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
        </div>
      </CustomDialog>

      <CustomDialog
        isOpen={deleteConfirm.show}
        title="Öğeyi Sil"
        onClose={() => setDeleteConfirm({ show: false, entity: null })}
        onConfirm={confirmDelete}
        confirmText="Sil"
        cancelText="Vazgeç"
        showCancel={true}
      >
        <div style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
          <strong>{deleteConfirm.entity?.name}</strong> öğesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </div>
      </CustomDialog>
    </div>
  );
}

function StatusToggle({ active, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width: '42px', height: '22px', background: active ? '#10b981' : 'rgba(255,255,255,0.1)', borderRadius: '12px', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
      <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: active ? '22px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </div>
  );
}

function TabButton({ id, label, count, activeTab, onClick }) {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={() => onClick(id)}
      style={{ 
        padding: '1rem 0', 
        fontSize: '0.9rem', 
        fontWeight: 700, 
        background: 'none', 
        border: 'none', 
        borderBottom: isActive ? '2px solid #4285F4' : '2px solid transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s'
      }}
    >
      {label} <span style={{ fontSize: '0.7rem', background: isActive ? 'rgba(66, 133, 244, 0.1)' : 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '10px' }}>{count}</span>
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
  const isActive = status === 'ENABLED';
  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '0.4rem', 
      padding: '0.25rem 0.75rem', 
      borderRadius: '20px',
      background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      color: isActive ? '#10b981' : '#ef4444',
      fontSize: '0.7rem',
      fontWeight: 800
    }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#10b981' : '#ef4444' }} />
      {isActive ? 'AKTİF' : 'DURDURULDU'}
    </div>
  );
}

const thStyle = { padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' };
const trStyle = { transition: 'background 0.2s' };
const smallButtonStyle = { padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' };
