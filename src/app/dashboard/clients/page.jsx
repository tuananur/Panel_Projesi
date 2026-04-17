import prisma from '@/lib/prisma';
import CreateClientForm from './create-client-form';
import DeleteClientButton from './delete-client-button';
import EditClientModal from './edit-client-modal';
import { getSession } from '@/lib/auth';

export const metadata = {
  title: 'Müşteriler | Dashboard',
};

export default async function ClientsPage() {
  const session = await getSession();
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: 0 }}>Müşteri Yönetimi</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        <div className="card">
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
                      <td style={{ padding: '1rem 0.75rem', maxWidth: '300px' }}>
                        <div style={{ fontWeight: 500 }}>{client.companyName}</div>
                        {client.website && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{client.website}</div>}
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div>{client.contactName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{client.phone}</div>
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {services.length > 0 ? services.map(s => (
                            <span key={s} style={{ padding: '0.2rem 0.5rem', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                              {s}
                            </span>
                          )) : (
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Hizmet yok</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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

        <div className="card">
          <h2 className="heading-2" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Yeni Müşteri Ekle</h2>
          <CreateClientForm />
        </div>
      </div>
    </div>
  );
}
