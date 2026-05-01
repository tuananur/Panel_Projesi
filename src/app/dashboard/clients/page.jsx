import prisma from '@/lib/prisma';
import CreateClientForm from './create-client-form';
import DeleteClientButton from './delete-client-button';
import EditClientModal from './edit-client-modal';
import { getSession } from '@/lib/auth';
import { Phone, Mail, MessageCircle, Globe } from 'lucide-react';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Müşteriler | Dashboard',
};

export default async function ClientsPage() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: 0 }}>Müşteri Yönetimi</h1>
      </div>

      <div className="responsive-flex" style={{ gap: '2rem', alignItems: 'start' }}>
        <div className="card" style={{ flex: 1, minWidth: 0 }}>
          <h2 className="heading-2" style={{ fontSize: '1.25rem' }}>Mevcut Müşteriler</h2>
          
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Firma Adı</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>İletişim</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Hizmetler</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const services = JSON.parse(client.services || '[]');
                  
                  return (
                    <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{client.companyName}</div>
                          {client.website && (
                            <a 
                              href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ 
                                fontSize: '0.6rem', 
                                color: 'var(--accent-primary)', 
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                width: 'fit-content'
                              }}
                            >
                              <Globe size={10} /> Web Sitesi
                            </a>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.1rem', color: 'var(--text-primary)' }}>{client.contactName}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                          <a 
                            href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', color: '#10b981', textDecoration: 'none', fontWeight: 500 }}
                          >
                            <MessageCircle size={10} /> {client.phone}
                          </a>
                          {client.email && (
                            <a 
                              href={`mailto:${client.email}`}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.3rem', 
                                fontSize: '0.65rem', 
                                color: 'var(--text-secondary)', 
                                textDecoration: 'none', 
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '110px'
                              }}
                              title={client.email}
                            >
                              <Mail size={10} /> {client.email}
                            </a>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {services.length > 0 ? services.map(s => (
                            <span key={s} style={{ padding: '1px 4px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', borderRadius: '3px', fontSize: '0.55rem', fontWeight: 700 }}>
                              {s === 'Sosyal Medya' ? 'SM' : s}
                            </span>
                          )) : (
                            <span className="text-muted" style={{ fontSize: '0.6rem' }}>-</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <EditClientModal client={client} />
                          <DeleteClientButton clientId={client.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Henüz müşteri eklenmemiş.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ width: '100%', maxWidth: '350px', flexShrink: 0 }}>
          <h2 className="heading-2" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Yeni Müşteri Ekle</h2>
          <CreateClientForm />
        </div>
      </div>
    </div>
  );
}
