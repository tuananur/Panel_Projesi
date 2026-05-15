import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StatsContent from './stats-content';
import { can, getRolePermissions } from '@/lib/permissions';
import { getMetaAdsAction, getGoogleAdsAction } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function StatsPage({ params, searchParams: searchParamsPromise }) {
  const { id: rawId } = await params;
  const searchParams = await searchParamsPromise;
  const id = parseInt(rawId);

  const session = await getSession();
  if (!session) redirect('/login');

  const permissions = await getRolePermissions(session);
  const hasPermission = can(permissions, session.role, 'client.tab.stats');
  
  if (!hasPermission) {
    redirect('/dashboard');
  }

  if (isNaN(id)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h2>Geçersiz Müşteri Kimliği</h2>
        <p>Girdiğiniz müşteri ID'si geçerli bir sayı değil.</p>
      </div>
    );
  }

  const now = new Date();
  const month = searchParams.month !== undefined ? parseInt(searchParams.month) : now.getMonth();
  const year = searchParams.year !== undefined ? parseInt(searchParams.year) : now.getFullYear();

  // Calculate start and end of month
  const since = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const until = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { 
        tasks: {
          where: {
            OR: [
              { date: { gte: new Date(`${year}-01-01`) } }, // Fetch enough tasks for context
              { type: 'SOCIAL' },
              { type: 'BLOG' }
            ]
          }
        } 
      }
    });

    if (!client) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <h2>Müşteri Bulunamadı</h2>
          <p>İstediğiniz müşteri veritabanında kayıtlı değil.</p>
        </div>
      );
    }

    let metaResult = { error: 'LOADING_ERROR' };
    let googleResult = { error: 'LOADING_ERROR' };

    try {
      const results = await Promise.allSettled([
        getMetaAdsAction(id, null, since, until),
        getGoogleAdsAction(id) // Google is mock, but could be extended
      ]);

      if (results[0].status === 'fulfilled') metaResult = results[0].value;
      if (results[1].status === 'fulfilled') googleResult = results[1].value;
    } catch (adsError) {
      console.error('Ads Data Fetching Failed:', adsError);
    }

    return (
      <StatsContent client={client} metaResult={metaResult} googleResult={googleResult} />
    );
  } catch (error) {
    if (error.digest?.startsWith('NEXT_REDIRECT') || error.message === 'NEXT_REDIRECT') throw error;
    console.error(`CRITICAL: Stats Page Error for Client ID ${id}:`, error);
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ marginBottom: '1.5rem', color: '#ef4444' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Veri Yükleme Hatası</h2>
        <p>İstatistikler yüklenirken beklenmedik bir hata oluştu. Bu durum genellikle hatalı veya eksik verilerden kaynaklanır.</p>
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: '8px', 
          fontSize: '0.75rem', 
          fontFamily: 'monospace',
          textAlign: 'left',
          overflowX: 'auto',
          border: '1px solid var(--border-color)'
        }}>
          Error: {error.message}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
        >
          Sayfayı Yenile
        </button>
      </div>
    );
  }
}
