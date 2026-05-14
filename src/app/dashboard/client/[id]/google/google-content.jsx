'use client';

import { useState, useTransition } from 'react';
import { 
  TrendingUp, MousePointer2, Eye, 
  Wallet, BarChart3, Play, Pause,
  Calendar, Search, AlertCircle
} from 'lucide-react';

export default function GoogleContent({ result, id }) {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCampaigns = result.activeCampaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      
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
        
        <div style={{ position: 'relative', width: '250px', marginBottom: '0.5rem' }}>
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
      </div>

      {/* Main Table Content */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={thStyle}>KAMPANYA</th>
                <th style={thStyle}>DURUM</th>
                <th style={thStyle}>HARCAMA</th>
                <th style={thStyle}>TIKLANMA</th>
                <th style={thStyle}>GÖSTERİM</th>
                <th style={thStyle}>CTR</th>
                <th style={thStyle}>CPC</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map(camp => (
                <tr key={camp.id} style={trStyle}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 700, color: '#4285F4' }}>{camp.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>ID: {camp.id}</div>
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={camp.status} />
                  </td>
                  <td style={tdStyle}>{camp.spend.toLocaleString()} TL</td>
                  <td style={tdStyle}>{camp.clicks.toLocaleString()}</td>
                  <td style={tdStyle}>{camp.impressions.toLocaleString()}</td>
                  <td style={tdStyle}>%{(camp.clicks / camp.impressions * 100).toFixed(2)}</td>
                  <td style={tdStyle}>{(camp.spend / camp.clicks).toFixed(2)} TL</td>
                </tr>
              ))}
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <BarChart3 size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                    <p>Kampanya bulunamadı.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
        borderBottom: isActive ? '2px solid #4285F4' : '2px solid transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      {label} <span style={{ fontSize: '0.7rem', background: isActive ? 'rgba(66, 133, 244, 0.1)' : 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{count}</span>
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

const thStyle = { padding: '0.75rem 1rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle = { padding: '1rem', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)' };
const trStyle = { transition: 'background 0.2s' };
