import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CONFIGURABLE_ROLES, PERMISSION_GROUPS, getRolePermissions } from '@/lib/permissions';
import ThemeSettings from './theme-settings';
import RolePermissionsEditor from './role-permissions-editor';
import MailSettings from './mail-settings';
import { getMailSettingsAction } from '@/app/actions';

export const metadata = {
  title: 'Ayarlar | Dashboard',
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const isAdmin = session.role === 'ADMIN';
  const permissions = isAdmin ? await getRolePermissions() : null;
  const mailSettings = isAdmin ? await getMailSettingsAction() : null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 className="heading-2" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Genel Ayarlar</h2>
        <p className="text-muted">Dashboard görünümünü ve tercihlerini buradan kişiselleştirebilirsiniz.</p>
      </div>

      <ThemeSettings />

      {isAdmin && (
        <>
          <div style={{ marginTop: '2rem' }}>
            <MailSettings initialConfig={mailSettings?.config} />
          </div>

          <div style={{ marginTop: '2rem' }}>
            <RolePermissionsEditor
              roles={CONFIGURABLE_ROLES}
              groups={PERMISSION_GROUPS}
              initialPermissions={permissions}
            />
          </div>
        </>
      )}
    </div>
  );
}
