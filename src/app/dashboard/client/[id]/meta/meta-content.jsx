'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  TrendingUp, MousePointer2, Eye, Users as UsersIcon, 
  Wallet, Search, Calendar, ChevronRight, 
  AlertCircle, CheckCircle, Play, Pause, BarChart3
} from 'lucide-react';

const DATE_PRESETS = [
  { id: 'today', label: 'Bugün' },
  { id: 'yesterday', label: 'Dün' },
  { id: 'last_7d', label: 'Son 7 Gün' },
  { id: 'last_30d', label: 'Son 30 Gün' },
  { id: 'this_month', label: 'Bu Ay' },
  { id: 'last_month', label: 'Geçen Ay' }
];

export default function MetaContent({ result, id, datePreset, since: initSince, until: initUntil }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('campaigns'); // campaigns, adsets, ads
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedAdSetId, setSelectedAdSetId] = useState(null);
  
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

  const filteredCampaigns = result.activeCampaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdSets = result.adSets.filter(as => {
    const matchesSearch = as.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCampaign = selectedCampaignId ? as.campaign_id === selectedCampaignId : true;
    return matchesSearch && matchesCampaign;
  });

  const filteredAds = result.ads.filter(ad => {
    const matchesSearch = ad.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAdSet = selectedAdSetId ? ad.adset_id === selectedAdSetId : true;
    const matchesCampaign = selectedCampaignId ? result.adSets.find(as => as.id === ad.adset_id)?.campaign_id === selectedCampaignId : true;
    return matchesSearch && matchesAdSet && matchesCampaign;
  });

  const selectedCampaignName = result.activeCampaigns.find(c => c.id === selectedCampaignId)?.name;
  const selectedAdSetName = result.adSets.find(as => as.id === selectedAdSetId)?.name;

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
        </div>

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
      <div style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '2rem' }}>
        <TabButton id="campaigns" label="Kampanyalar" count={filteredCampaigns.length} activeTab={activeTab} onClick={setActiveTab} />
        <TabButton id="adsets" label="Reklam Setleri" count={filteredAdSets.length} activeTab={activeTab} onClick={setActiveTab} />
        <TabButton id="ads" label="Reklamlar" count={filteredAds.length} activeTab={activeTab} onClick={setActiveTab} />
      </div>

      {/* Main Table Content */}
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
                          <div style={{ 
                            width: '32px', 
                            height: '18px', 
                            background: camp.status === 'ACTIVE' ? '#0064e0' : 'rgba(255,255,255,0.1)', 
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
                              left: camp.status === 'ACTIVE' ? '16px' : '2px',
                              transition: 'left 0.2s'
                            }} />
                          </div>
                          <span 
                            style={{ fontWeight: 700, color: '#0064e0', cursor: 'pointer', textDecoration: 'none' }}
                            onClick={() => {
                              setSelectedCampaignId(camp.id);
                              setActiveTab('adsets');
                            }}
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
                          <div style={{ 
                            width: '32px', 
                            height: '18px', 
                            background: as.status === 'ACTIVE' ? '#0064e0' : 'rgba(255,255,255,0.1)', 
                            borderRadius: '10px', 
                            position: 'relative'
                          }}>
                            <div style={{ 
                              width: '14px', 
                              height: '14px', 
                              background: 'white', 
                              borderRadius: '50%', 
                              position: 'absolute', 
                              top: '2px', 
                              left: as.status === 'ACTIVE' ? '16px' : '2px',
                              transition: 'left 0.2s'
                            }} />
                          </div>
                          <span 
                            style={{ fontWeight: 700, color: '#0064e0', cursor: 'pointer', textDecoration: 'none' }}
                            onClick={() => {
                              setSelectedAdSetId(as.id);
                              setActiveTab('ads');
                            }}
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
                          <div style={{ 
                            width: '32px', 
                            height: '18px', 
                            background: ad.status === 'ACTIVE' ? '#0064e0' : 'rgba(255,255,255,0.1)', 
                            borderRadius: '10px', 
                            position: 'relative'
                          }}>
                            <div style={{ 
                              width: '14px', 
                              height: '14px', 
                              background: 'white', 
                              borderRadius: '50%', 
                              position: 'absolute', 
                              top: '2px', 
                              left: ad.status === 'ACTIVE' ? '16px' : '2px',
                              transition: 'left 0.2s'
                            }} />
                          </div>
                          <div style={{ maxWidth: '200px' }}>
                            <div style={{ fontWeight: 700 }}>{ad.name}</div>
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
