import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Globe, Instagram, Facebook, Linkedin, Youtube, Twitter, ExternalLink, Shield } from 'lucide-react';

export const metadata = {
  title: 'Giriş Bilgileri | Dashboard',
};

const PLATFORM_ICONS = {
  Instagram: <Instagram size={18} />,
  Facebook: <Facebook size={18} />,
  LinkedIn: <Linkedin size={18} />,
  YouTube: <Youtube size={18} />,
  X: <Twitter size={18} />,
  Pinterest: <Globe size={18} />,
};

export default async function CredentialsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const clients = await prisma.client.findMany({
    orderBy: { companyName: 'asc' },
    select: {
      id: true,
      companyName: true,
      socialAccounts: true,
      website: true,
    }
  });

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="heading-1">Giriş Bilgileri</h1>
        <p className="text-muted">Müşterilerinize ait web sitesi ve sosyal medya panellerine buradan hızlıca erişebilirsiniz.</p>
      </header>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MÜŞTERİ</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>WEB SİTESİ</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SOSYAL MEDYA HESAPLARI</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const socialAccounts = JSON.parse(client.socialAccounts || '{}');
                const activePlatforms = Object.entries(socialAccounts).filter(([_, url]) => url && url.trim() !== '');

                return (
                  <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{client.companyName}</span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {client.website ? (
                        <a 
                          href={client.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            color: 'var(--accent-primary)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500
                          }}
                        >
                          <Globe size={16} /> Web Sitesi <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Tanımlanmamış</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {activePlatforms.length > 0 ? (
                          activePlatforms.map(([platform, url]) => (
                            <a 
                              key={platform} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title={platform}
                              style={{ 
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '10px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-secondary)',
                                transition: 'all 0.2s ease',
                                border: '1px solid rgba(255,255,255,0.1)'
                              }}
                              className="social-icon-btn-hover"
                            >
                              {PLATFORM_ICONS[platform] || <Globe size={18} />}
                            </a>
                          ))
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Sosyal medya hesabı yok</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .table-row-hover:hover {
          background-color: rgba(255,255,255,0.02);
        }
        .social-icon-btn-hover:hover {
          background-color: var(--accent-primary) !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
      `}} />
    </div>
  );
}
