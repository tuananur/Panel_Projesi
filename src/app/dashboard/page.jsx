import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { Phone, Mail, MessageCircle, ChevronRight } from 'lucide-react';
import GlobalSearch from '@/app/components/global-search';
import ClientLogo from '@/app/components/client-logo';

export const metadata = {
  title: 'Gösterge Paneli | Agency Dashboard',
};

export default async function DashboardPage() {
  const session = await getSession();
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      companyName: true,
      contactName: true,
      email: true,
      phone: true,
      services: true,
      logoUrl: true,
      tasks: { select: { status: true } },
    }
  });

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="heading-1">Hoş Geldiniz, {session.username}</h1>
        <p className="text-muted">Ajansınızın genel durumunu ve müşterilerinizi buradan takip edebilirsiniz.</p>
      </header>

      <GlobalSearch />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Toplam Müşteri</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{clients.length}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Aktif Hizmetler</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
            {clients.reduce((acc, c) => {
              try {
                if (!c.services) return acc;
                const parsed = JSON.parse(c.services);
                return acc + (Array.isArray(parsed) ? parsed.length : 0);
              } catch (e) {
                return acc + (typeof c.services === 'string' ? c.services.split(',').filter(Boolean).length : 0);
              }
            }, 0)}
          </p>
        </div>
      </div>

      <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Müşteri Portföyü</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {clients.length > 0 ? (
          clients.map(client => {
            const getSafeServices = (s) => {
              try {
                return JSON.parse(s || '[]');
              } catch (e) {
                return s ? s.split(',') : [];
              }
            };
            const services = getSafeServices(client.services);
            const pendingTasks = client.tasks.filter(t => !t.status);
            
            return (
                <div key={client.id} className="card card-interactive" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', padding: '1.25rem' }}>
                  {pendingTasks.length > 0 && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '1rem', 
                      right: '1rem', 
                      backgroundColor: '#f59e0b', 
                      color: 'white', 
                      fontSize: '0.65rem', 
                      fontWeight: 800, 
                      padding: '2px 8px', 
                      borderRadius: '100px',
                      boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)',
                      zIndex: 3
                    }}>
                      {pendingTasks.length} BEKLEYEN
                    </div>
                  )}
                  
                  <Link 
                    href={`/dashboard/client/${client.id}/stats`} 
                    prefetch={true}
                    style={{ 
                      textDecoration: 'none', 
                      color: 'inherit', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      marginBottom: '1rem'
                    }}
                  >
                    {/* Stretched link covering the entire card */}
                    <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}></span>
                    
                    <ClientLogo logoUrl={client.logoUrl} companyName={client.companyName} size="40px" />
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.1rem' }}>{client.companyName}</h3>
                      <p className="text-muted" style={{ fontSize: '0.8rem' }}>{client.contactName}</p>
                    </div>
                  </Link>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
                    {services.map(s => (
                      <span key={s} style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.15rem 0.5rem', 
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

                  <div style={{ 
                    marginTop: 'auto', 
                    paddingTop: '1rem', 
                    borderTop: '1px solid rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 2,
                    pointerEvents: 'none' // Click passes through to the stretched link
                  }}>
                    <div style={{ display: 'flex', gap: '0.75rem', pointerEvents: 'auto' }}>
                      <a 
                        href={`https://wa.me/${(client.phone || '').replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-icon-btn"
                        title="WhatsApp"
                        style={{ color: '#10b981', position: 'relative', zIndex: 3 }}
                      >
                        <MessageCircle size={18} />
                      </a>
                      {client.email && (
                        <a 
                          href={`mailto:${client.email}`}
                          className="contact-icon-btn"
                          title="E-posta"
                          style={{ color: 'var(--accent-primary)', position: 'relative', zIndex: 3 }}
                        >
                          <Mail size={18} />
                        </a>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
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
