import { getMetaAdsAction, getMetaArmyDashboardAction } from '@/app/actions';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import MetaContent from './meta-content';
import { getSession } from '@/lib/auth';
import { can, getRolePermissions } from '@/lib/permissions';

export default async function MetaAdsPage({ params, searchParams }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const permissions = await getRolePermissions();
  if (!can(permissions, session.role, 'client.tab.meta')) {
    redirect(`/dashboard/client/${id}`);
  }

  const sParams = await searchParams;
  const datePreset = sParams.datePreset || 'last_30d';
  const since = sParams.since || null;
  const until = sParams.until || null;
  
  const [result, armyResult] = await Promise.all([
    getMetaAdsAction(id, datePreset, since, until),
    getMetaArmyDashboardAction(id),
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="heading-1" style={{ marginBottom: '0.5rem' }}>Meta Reklam Yönetimi</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Bu müşterinin Meta (Instagram & Facebook) reklam performansını canlı olarak takip edin.</p>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          Canlı Veri Senkronizasyonu Aktif {since && until ? `(${since} - ${until})` : ''}
        </div>
      </div>

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
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '1rem' }}>
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
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 600 }}>{result.details || 'Veriler çekilirken bir hata oluştu.'}</p>
          {result.code && <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Hata Kodu: {result.code}</p>}
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Token süresi dolmuş, izinleri eksik veya ID hatalı olabilir.</p>
        </div>
      ) : (
        <MetaContent result={result} armyResult={armyResult} id={id} datePreset={datePreset} since={since} until={until} />
      )}
    </div>
  );
}
