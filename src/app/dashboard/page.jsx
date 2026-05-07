import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { Phone, Mail, MessageCircle, ChevronRight } from 'lucide-react';
import GlobalSearch from '@/app/components/global-search';

export const metadata = {
  title: 'Gösterge Paneli | Agency Dashboard',
};

export default async function DashboardPage() {
  const session = await getSession();
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tasks: true
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
            {clients.reduce((acc, c) => acc + JSON.parse(c.services || '[]').length, 0)}
          </p>
        </div>
      </div>

      <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Müşteri Portföyü</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {clients.length > 0 ? (
          clients.map(client => {
            const services = JSON.parse(client.services || '[]');
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
                      boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)'
                    }}>
                      {pendingTasks.length} BEKLEYEN
                    </div>
                  )}
                  
                  <Link href={`/dashboard/client/${client.id}/stats`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    {client.logoUrl ? (
                      <img src={client.logoUrl} alt={client.companyName} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                        {client.companyName[0]}
                      </div>
                    )}
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.1rem' }}>{client.companyName}</h3>
                      <p className="text-muted" style={{ fontSize: '0.8rem' }}>{client.contactName}</p>
                    </div>
                  </Link>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
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

                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <a 
                        href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-icon-btn"
                        title="WhatsApp"
                        style={{ color: '#10b981' }}
                      >
                        <MessageCircle size={18} />
                      </a>
                      {client.email && (
                        <a 
                          href={`mailto:${client.email}`}
                          className="contact-icon-btn"
                          title="E-posta"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          <Mail size={18} />
                        </a>
                      )}
                    </div>
                    <Link href={`/dashboard/client/${client.id}/stats`} style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                      <ChevronRight size={18} />
                    </Link>
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
