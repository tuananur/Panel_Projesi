'use client';

import { useState } from 'react';
import { 
  TrendingUp, Users, Eye, Clock, BarChart3, 
  Tv, Smartphone, Laptop, Sparkles, RefreshCw, Globe
} from 'lucide-react';

export default function AnalyticsContent({ result, id }) {
  const [loading, setLoading] = useState(false);
  const { summary, dailyActiveUsers, deviceBreakdown, trafficSources, topPages, countryBreakdown } = result;

  const countryData = countryBreakdown || [
    { name: 'Türkiye', percentage: 0, count: 0 },
    { name: 'Diğer', percentage: 0, count: 0 }
  ];

  const maxUsers = Math.max(...dailyActiveUsers.map(d => d.users));

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Realtime & Refresh Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: 'rgba(255, 255, 255, 0.02)', 
        padding: '1rem 1.5rem', 
        borderRadius: '12px', 
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            background: '#10b981', 
            borderRadius: '50%', 
            boxShadow: '0 0 12px #10b981',
            animation: 'pulse 1.5s infinite alternate' 
          }}></div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Şu Anda Sitede: <strong style={{ fontSize: '1.1rem', color: '#10b981', marginLeft: '0.2rem' }}>{summary.activeUsers}</strong> Aktif Kullanıcı
          </span>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="btn" 
          style={{ 
            background: 'transparent', 
            border: '1px solid var(--border-color)', 
            color: 'var(--text-secondary)',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.8rem'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Güncelleniyor...' : 'Verileri Yenile'}
        </button>
      </div>

      {/* Core Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <MetricCard 
          label="Sayfa Görüntüleme" 
          value={Number(summary.pageViews).toLocaleString()} 
          change="+12.4%" 
          isPositive={true}
          icon={<Eye size={18} style={{ color: '#F59E0B' }} />}
          sparklineColors={['rgba(245, 158, 11, 0.2)', '#F59E0B']}
        />
        <MetricCard 
          label="Oturumlar (Sessions)" 
          value={Number(summary.sessions).toLocaleString()} 
          change="+8.3%" 
          isPositive={true}
          icon={<Users size={18} style={{ color: '#3B82F6' }} />}
          sparklineColors={['rgba(59, 130, 246, 0.2)', '#3B82F6']}
        />
        <MetricCard 
          label="Hemen Çıkma Oranı" 
          value={`%${summary.bounceRate}`} 
          change="-4.2%" 
          isPositive={true} // bounce rate decreasing is positive
          icon={<TrendingUp size={18} style={{ color: '#10B981' }} />}
          sparklineColors={['rgba(16, 185, 129, 0.2)', '#10B981']}
        />
        <MetricCard 
          label="Ort. Etkileşim Süresi" 
          value={summary.avgEngagementTime} 
          change="+18sn" 
          isPositive={true}
          icon={<Clock size={18} style={{ color: '#8B5CF6' }} />}
          sparklineColors={['rgba(139, 92, 246, 0.2)', '#8B5CF6']}
        />
      </div>

      {/* Main Chart Section */}
      <div className="card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Günlük Aktif Kullanıcı Eğilimi</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Son 10 günün tekil kullanıcı trafiği.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '12px', height: '12px', background: '#F59E0B', borderRadius: '3px' }}></span>
            Kullanıcı Sayısı
          </div>
        </div>

        {/* SVG Interactive Area Chart */}
        <div style={{ width: '100%', height: '220px', position: 'relative', marginTop: '1rem' }}>
          <svg viewBox="0 0 1000 200" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="20" x2="1000" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="5,5" />
            <line x1="0" y1="80" x2="1000" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="5,5" />
            <line x1="0" y1="140" x2="1000" y2="140" stroke="rgba(255,255,255,0.05)" strokeDasharray="5,5" />
            <line x1="0" y1="200" x2="1000" y2="200" stroke="rgba(255,255,255,0.1)" />

            {/* Area Path */}
            <path 
              d={`
                M 0 200 
                ${dailyActiveUsers.map((d, index) => {
                  const x = (index / (dailyActiveUsers.length - 1)) * 1000;
                  const y = 200 - (d.users / maxUsers) * 160;
                  return `L ${x} ${y}`;
                }).join(' ')}
                L 1000 200 Z
              `} 
              fill="url(#chartGrad)"
            />

            {/* Line Path */}
            <path 
              d={dailyActiveUsers.map((d, index) => {
                const x = (index / (dailyActiveUsers.length - 1)) * 1000;
                const y = 200 - (d.users / maxUsers) * 160;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')} 
              fill="none" 
              stroke="#F59E0B" 
              strokeWidth="3"
            />

            {/* Dots & Labels */}
            {dailyActiveUsers.map((d, index) => {
              const x = (index / (dailyActiveUsers.length - 1)) * 1000;
              const y = 200 - (d.users / maxUsers) * 160;
              return (
                <g key={index} className="chart-dot">
                  <circle cx={x} cy={y} r="5" fill="#F59E0B" stroke="var(--bg-primary)" strokeWidth="2" />
                  <text x={x} y={y - 12} fill="var(--text-primary)" fontSize="10" fontWeight="700" textAnchor="middle">
                    {d.users}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* X Axis Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', padding: '0 0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {dailyActiveUsers.map((d, index) => (
            <span key={index}>{d.date}</span>
          ))}
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Device Breakdown */}
        <div className="card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Cihaz Dağılımı
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {deviceBreakdown.map((dev, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {dev.name === 'Mobil' ? <Smartphone size={14} style={{ color: dev.color }} /> : dev.name === 'Masaüstü' ? <Laptop size={14} style={{ color: dev.color }} /> : <Tv size={14} style={{ color: dev.color }} />}
                    {dev.name}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{dev.percentage}%</strong> ({Number(dev.count).toLocaleString()})
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${dev.percentage}%`, height: '100%', background: dev.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources Breakdown */}
        <div className="card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Erişim Kanalları</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            {trafficSources.map((source, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ width: '8px', height: '8px', background: source.color, borderRadius: '50%' }}></span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{source.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{Number(source.count).toLocaleString()} Oturum</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700, width: '40px', textAlign: 'right' }}>%{source.percentage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coğrafi Dağılım (Ülkeler) */}
        <div className="card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={16} style={{ color: '#8B5CF6' }} />
            Coğrafi Dağılım (Ülkeler)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            {countryData.map((country, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {country.name}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{country.percentage}%</strong> ({Number(country.count).toLocaleString()})
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${country.percentage}%`, height: '100%', background: '#8B5CF6', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>En Çok Ziyaret Edilen Sayfalar</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>En popüler sayfaların etkileşim ve gösterim detayları.</p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700 }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>SAYFA YOLU (PATH)</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>SAYFA BAŞLIĞI</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>GÖRÜNTÜLENME</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>TEKİL KULLANICI</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>ORT. SÜRE</th>
            </tr>
          </thead>
          <tbody>
            {topPages.map((page, idx) => (
              <tr key={idx} style={{ 
                borderBottom: idx === topPages.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.03)', 
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                transition: 'background 0.2s ease'
              }} className="table-row-hover">
                <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'monospace', color: '#F59E0B' }}>{page.path}</td>
                <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{page.title}</td>
                <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>{Number(page.views).toLocaleString()}</td>
                <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{Number(page.users).toLocaleString()}</td>
                <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>{page.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Styled animation overrides */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.05); }
        }
        .chart-dot circle {
          transition: r 0.15s ease, fill-opacity 0.15s ease;
        }
        .chart-dot:hover circle {
          r: 7;
        }
        .chart-dot text {
          opacity: 0;
          transition: opacity 0.15s ease, transform 0.15s ease;
          transform: translateY(2px);
        }
        .chart-dot:hover text {
          opacity: 1;
          transform: translateY(0);
        }
        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.015);
        }
      `}</style>
    </div>
  );
}

function MetricCard({ label, value, change, isPositive, icon, sparklineColors }) {
  return (
    <div className="card" style={{ 
      padding: '1.25rem', 
      background: 'rgba(255, 255, 255, 0.015)', 
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Sparkline effect */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35px', opacity: 0.15 }}>
        <svg viewBox="0 0 100 20" width="100%" height="100%" preserveAspectRatio="none">
          <path d="M0 20 Q 20 5, 40 15 T 80 5 T 100 10 L 100 20 Z" fill={sparklineColors[1]} />
          <path d="M0 20 Q 20 5, 40 15 T 80 5 T 100 10" fill="none" stroke={sparklineColors[1]} strokeWidth="1.5" />
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.4rem', borderRadius: '6px' }}>
          {icon}
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', zIndex: 2 }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.35rem', fontSize: '0.7rem' }}>
          <span style={{ 
            color: isPositive ? '#10b981' : '#ef4444', 
            fontWeight: 800,
            background: isPositive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            padding: '0.1rem 0.35rem',
            borderRadius: '4px'
          }}>
            {change}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>geçen aya göre</span>
        </div>
      </div>
    </div>
  );
}
