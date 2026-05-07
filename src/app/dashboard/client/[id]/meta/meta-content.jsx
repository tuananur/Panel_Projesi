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
  const [activeTab, setActiveTab] = useState('campaigns'); // campaigns, ads
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const filteredAds = result.ads.filter(ad => 
    ad.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <button 
          onClick={() => setActiveTab('campaigns')}
          style={{ 
            padding: '1rem 0.5rem', 
            fontSize: '0.9rem', 
            fontWeight: 700, 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'campaigns' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'campaigns' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          Kampanyalar ({filteredCampaigns.length})
        </button>
        <button 
          onClick={() => setActiveTab('ads')}
          style={{ 
            padding: '1rem 0.5rem', 
            fontSize: '0.9rem', 
            fontWeight: 700, 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'ads' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'ads' ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          Reklamlar ({filteredAds.length})
        </button>
      </div>

      {/* Main Table Content */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {activeTab === 'campaigns' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={thStyle}>DURUM</th>
                  <th style={thStyle}>KAMPANYA ADI</th>
                  <th style={thStyle}>STRATEJİ</th>
                  <th style={thStyle}>BÜTÇE</th>
                  <th style={thStyle}>BAŞLANGIÇ</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map(camp => (
                  <tr key={camp.id} style={trStyle}>
                    <td style={tdStyle}>
                      <StatusBadge status={camp.status} />
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--accent-primary)' }}>{camp.name}</td>
                    <td style={tdStyle}>{camp.objective?.replace('_', ' ')}</td>
                    <td style={tdStyle}>
                      {camp.daily_budget ? `${(camp.daily_budget / 100).toFixed(2)} TL (Günlük)` : 
                       camp.lifetime_budget ? `${(camp.lifetime_budget / 100).toFixed(2)} TL (Toplam)` : 'Bütçe Belirtilmedi'}
                    </td>
                    <td style={tdStyle}>{new Date(camp.start_time).toLocaleDateString('tr-TR')}</td>
                  </tr>
                ))}
                {filteredCampaigns.length === 0 && <EmptyRow colSpan={5} />}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={thStyle}>ÖNİZLEME</th>
                  <th style={thStyle}>REKLAM ADI</th>
                  <th style={thStyle}>DURUM</th>
                  <th style={thStyle}>HARCAMA</th>
                  <th style={thStyle}>GÖSTERİM</th>
                  <th style={thStyle}>TIKLAMA</th>
                  <th style={thStyle}>CTR</th>
                </tr>
              </thead>
              <tbody>
                {filteredAds.map(ad => {
                  const insights = ad.insights?.data?.[0] || {};
                  return (
                    <tr key={ad.id} style={trStyle}>
                      <td style={tdStyle}>
                        {ad.creative?.image_url || ad.creative?.thumbnail_url ? (
                          <img src={ad.creative.image_url || ad.creative.thumbnail_url} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                        ) : <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />}
                      </td>
                      <td style={{ ...tdStyle, maxWidth: '200px' }}>
                        <div style={{ fontWeight: 700 }}>{ad.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ad.creative?.body}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={ad.status} />
                      </td>
                      <td style={tdStyle}>{insights.spend || 0} TL</td>
                      <td style={tdStyle}>{Number(insights.impressions || 0).toLocaleString()}</td>
                      <td style={tdStyle}>{Number(insights.clicks || 0).toLocaleString()}</td>
                      <td style={tdStyle}>%{(Number(insights.ctr || 0) * 100).toFixed(2)}</td>
                    </tr>
                  );
                })}
                {filteredAds.length === 0 && <EmptyRow colSpan={7} />}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
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
