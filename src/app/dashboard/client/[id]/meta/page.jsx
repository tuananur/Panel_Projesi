import { getMetaAdsAction } from '@/app/actions';
import ClientNav from '../client-nav';
import { AlertCircle, ExternalLink, TrendingUp, MousePointer2, Eye, Users as UsersIcon, Wallet } from 'lucide-react';
import Link from 'next/link';

export default async function MetaAdsPage({ params }) {
  const { id } = params;
  const result = await getMetaAdsAction(id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="heading-1" style={{ marginBottom: '0.5rem' }}>Meta Reklam Yönetimi</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Bu müşterinin Meta (Instagram & Facebook) reklam performansını canlı olarak takip edin.</p>
      </div>

      <ClientNav clientId={id} />

      {result.error === 'API_MISSING' ? (
        <div className="card animate-fade-in" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '4rem 2rem', 
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px dashed rgba(239, 68, 68, 0.3)'
        }}>
          <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Meta API Bilgileri Eksik</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '2rem' }}>
            Reklam verilerini çekebilmemiz için Hizmet Ayarları bölümünden Meta Access Token ve Reklam Hesabı ID bilgilerini doldurmanız gerekmektedir.
          </p>
          <Link href={`/dashboard/client/${id}/settings`} className="btn btn-primary" style={{ gap: '0.5rem' }}>
            Ayarlara Git ve Yapılandır
          </Link>
        </div>
      ) : result.error ? (
        <div className="card animate-fade-in" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)' }}>
          <AlertCircle size={32} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h3 style={{ color: '#ef4444' }}>Meta API Hatası</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{result.details || 'Veriler çekilirken bir hata oluştu.'}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Token süresi dolmuş veya ID hatalı olabilir.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
          {/* Özet Kartları */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <StatCard 
              label="Toplam Harcama" 
              value={`${result.summary?.spend || 0} TL`} 
              icon={<Wallet size={20} />} 
              subtext="Son 30 Gün"
              color="#10b981"
            />
            <StatCard 
              label="Gösterim" 
              value={Number(result.summary?.impressions || 0).toLocaleString()} 
              icon={<Eye size={20} />} 
              subtext="Reklam Görülme"
              color="#3b82f6"
            />
            <StatCard 
              label="Tıklanma" 
              value={Number(result.summary?.clicks || 0).toLocaleString()} 
              icon={<MousePointer2 size={20} />} 
              subtext="Web Sitesi/Profil"
              color="#a855f7"
            />
            <StatCard 
              label="Erişim" 
              value={Number(result.summary?.reach || 0).toLocaleString()} 
              icon={<UsersIcon size={20} />} 
              subtext="Tekil Kişi"
              color="#f59e0b"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
             {/* Verimlilik Metrikleri */}
             <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Verimlilik</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <EfficiencyItem label="Tıklama Oranı (CTR)" value={`%${(Number(result.summary?.ctr || 0) * 100).toFixed(2)}`} />
                  <EfficiencyItem label="Tıklama Başı Maliyet (CPC)" value={`${Number(result.summary?.cpc || 0).toFixed(2)} TL`} />
                  <EfficiencyItem label="Harcama Durumu" value="Aktif" color="#10b981" />
                </div>
                <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <p>Bu veriler Meta Marketing API üzerinden son 30 günlük performansı yansıtmaktadır.</p>
                </div>
             </div>

             {/* Aktif Kampanyalar */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Aktif Kampanyalar</h3>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: 'full', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 600 }}>
                      {result.activeCampaigns.length} Aktif
                    </span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                          <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>KAMPANYA ADI</th>
                          <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>HEDEF</th>
                          <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>DURUM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.activeCampaigns.map(camp => (
                          <tr key={camp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>{camp.name}</td>
                            <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{camp.objective?.replace('_', ' ')}</td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                                <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                                AKTİF
                              </span>
                            </td>
                          </tr>
                        ))}
                        {result.activeCampaigns.length === 0 && (
                          <tr>
                            <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                              Şu an aktif kampanya bulunmuyor.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* YENİ: Reklam Detayları */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Reklam İçerikleri (Ads)</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {result.ads.map(ad => (
                      <div key={ad.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1.5rem' }}>
                        {ad.creative?.image_url || ad.creative?.thumbnail_url ? (
                          <img 
                            src={ad.creative.image_url || ad.creative.thumbnail_url} 
                            alt={ad.name}
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', background: 'var(--bg-primary)' }}
                          />
                        ) : (
                          <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={24} style={{ opacity: 0.2 }} />
                          </div>
                        )}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ad.name}</h4>
                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: ad.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.1)', color: ad.status === 'ACTIVE' ? '#10b981' : 'var(--text-secondary)', fontWeight: 700 }}>
                              {ad.status === 'ACTIVE' ? 'AKTİF' : 'DURDURULDU'}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {ad.creative?.body || 'Reklam metni bulunamadı.'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {result.ads.length === 0 && (
                      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Reklam detayı bulunamadı.
                      </div>
                    )}
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, subtext, color }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
        <div style={{ color }}>{icon}</div>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{subtext}</div>
    </div>
  );
}

function EfficiencyItem({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '1rem', fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
