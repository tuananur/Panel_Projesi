import prisma from '@/lib/prisma';
import CreateUserForm from './create-user-form';
import DeleteUserButton from './delete-user-button';
import EditUserModal from './edit-user-modal';
import { getSession } from '@/lib/auth';

import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Kullanıcılar | Dashboard',
};

export default async function UsersPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: 0 }}>Kullanıcı Yönetimi</h1>
      </div>

      <div className="responsive-flex" style={{ gap: '2rem', alignItems: 'start' }}>
        <div className="card" style={{ flex: 1, minWidth: 0 }}>
          <h2 className="heading-2" style={{ fontSize: '1.25rem' }}>Mevcut Kullanıcılar</h2>
          
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>ID</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Kullanıcı Adı</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Rol</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Durum</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.4rem 0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.id}</td>
                    <td style={{ padding: '0.4rem 0.3rem', fontWeight: 600, fontSize: '0.8rem' }}>{user.username}</td>
                    <td style={{ padding: '0.4rem 0.3rem' }}>
                      <span className="role-badge" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.4rem 0.3rem' }}>
                      {user.password ? (
                        <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 500 }}>Aktif</span>
                      ) : (
                        <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 500 }}>Bekliyor</span>
                      )}
                    </td>
                    <td style={{ padding: '0.4rem 0.3rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {user.id !== session.userId && (
                          <>
                            <EditUserModal user={user} />
                            <DeleteUserButton userId={user.id} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Kullanıcı bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ width: '100%', maxWidth: '350px', flexShrink: 0 }}>
          <h2 className="heading-2" style={{ fontSize: '1.25rem' }}>Yeni Kullanıcı Ekle</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Kullanıcının şifresi yoktur. İlk girişte şifresini kendisi belirleyecektir.
          </p>
          <CreateUserForm />
        </div>
      </div>
    </div>
  );
}
