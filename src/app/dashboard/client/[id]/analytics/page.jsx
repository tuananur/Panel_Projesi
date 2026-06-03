import { getGoogleAnalyticsAction } from '@/app/actions';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AnalyticsContent from './analytics-content';
import { getSession } from '@/lib/auth';
import { can, getRolePermissions } from '@/lib/permissions';

export default async function GoogleAnalyticsPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  const permissions = await getRolePermissions(session);
  if (!can(permissions, session.role, 'client.tab.analytics')) {
    redirect('/dashboard');
  }

  const result = await getGoogleAnalyticsAction(id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="heading-1" style={{ marginBottom: '0.5rem' }}>Google Analytics & Search Console</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Organik anahtar kelime sıralamaları (GSC) ve site trafik performansı (GA4).</p>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          Canlı İzleme Aktif
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
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px dashed rgba(245, 158, 11, 0.3)'
        }}>
          <AlertCircle size={48} style={{ color: '#F59E0B', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Google Analytics Bağlantısı Yapılandırılmamış</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '1.5rem' }}>
            Web sitesi trafik istatistiklerini görüntüleyebilmeniz için Hizmet Ayarları bölümünden GA4 Mülk Kimliğini ve Genel Ayarlar'da Google API Refresh Token bilgisini tamamlamalısınız.
          </p>
          <Link href={`/dashboard/client/${id}/settings`} className="btn btn-primary" style={{ gap: '0.5rem', background: '#F59E0B' }}>
            Ayarlara Git ve Yapılandır
          </Link>
        </div>
      ) : result.error ? (
        <div className="card animate-fade-in" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={32} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h3 style={{ color: '#ef4444' }}>Google API Hatası</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 600 }}>{result.details || 'Google Analytics verileri alınırken bir hata oluştu.'}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Sistem genelindeki refresh token süresi dolmuş veya müşterinin mülk kimliği hatalı olabilir.</p>
        </div>
      ) : (
        <AnalyticsContent result={result} id={id} />
      )}
    </div>
  );
}
