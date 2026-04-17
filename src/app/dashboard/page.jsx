import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export const metadata = {
  title: 'Gösterge Paneli | Agency Dashboard',
};

export default async function DashboardPage() {
  const session = await getSession();
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 className="heading-1">Hoş Geldiniz, {session.username}</h1>
        <p className="text-muted">Ajansınızın genel durumunu ve müşterilerinizi buradan takip edebilirsiniz.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Toplam Müşteri</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{clients.length}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Aktif Hizmetler</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
            {clients.reduce((acc, c) => acc + JSON.parse(c.services || '[]').length, 0)}
          </p>
        </div>
      </div>

      <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Müşteri Portföyü</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {clients.length > 0 ? (
          clients.map(client => {
            const services = JSON.parse(client.services || '[]');
            
            // Rol kontrolü: Tasarımcı sadece Sosyal Medya olanları görsün gibi filtreler eklenebilir.
            // Fakat reklamcı (SEO+Sosyal Medya) vs. görebilsin. Şimdilik hepsini listeleyelim.

            return (
              <Link key={client.id} href={`/dashboard/client/${client.id}/stats`} style={{ textDecoration: 'none' }}>
                <div className="card card-interactive" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{client.companyName}</h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem', flex: 1 }}>{client.contactName}</p>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {services.map(s => (
                      <span key={s} style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '100px', 
                        backgroundColor: s === 'SEO' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                        color: s === 'SEO' ? '#60a5fa' : '#c084fc',
                        border: `1px solid ${s === 'SEO' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)'}`,
                        fontWeight: 600
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
            <p className="text-muted">Henüz kayıtlı müşteri bulunmuyor.</p>
            <Link href="/dashboard/clients" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Yeni Müşteri Ekle</Link>
          </div>
        )}
      </div>
    </div>
  );
}
