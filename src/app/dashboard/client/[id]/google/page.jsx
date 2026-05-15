import { getGoogleAdsAction } from '@/app/actions';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import GoogleContent from './google-content';
import { getSession } from '@/lib/auth';
import { can, getRolePermissions } from '@/lib/permissions';

export default async function GoogleAdsPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const permissions = await getRolePermissions(session);
  if (!can(permissions, session.role, 'client.tab.google')) {
    redirect('/dashboard');
  }

  const result = await getGoogleAdsAction(id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="heading-1" style={{ marginBottom: '0.5rem' }}>Google Ads Yönetimi</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Bu müşterinin Google Ads reklam performansını canlı olarak takip edin.</p>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          Canlı Veri Senkronizasyonu Aktif
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
          background: 'rgba(66, 133, 244, 0.05)',
          border: '1px dashed rgba(66, 133, 244, 0.3)'
        }}>
          <AlertCircle size={48} style={{ color: '#4285F4', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Google API Bilgileri Eksik</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '1rem' }}>
            Reklam verilerini çekebilmemiz için Hizmet Ayarları bölümünden Google Customer ID ve Refresh Token bilgilerini doldurmanız gerekmektedir.
          </p>
          <Link href={`/dashboard/client/${id}/settings`} className="btn btn-primary" style={{ gap: '0.5rem', background: '#4285F4' }}>
            Ayarlara Git ve Yapılandır
          </Link>
        </div>
      ) : result.error ? (
        <div className="card animate-fade-in" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)' }}>
          <AlertCircle size={32} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h3 style={{ color: '#ef4444' }}>Google API Hatası</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 600 }}>{result.details || 'Veriler çekilirken bir hata oluştu.'}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Token süresi dolmuş veya Customer ID hatalı olabilir.</p>
        </div>
      ) : (
        <GoogleContent result={result} id={id} />
      )}
    </div>
  );
}
