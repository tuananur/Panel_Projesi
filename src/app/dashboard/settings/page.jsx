import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ASSIGNABLE_ROLE_OPTIONS, CONFIGURABLE_ROLES, PERMISSION_GROUPS, getRoleAssignableRoles, getRolePermissions } from '@/lib/permissions';
import ThemeSettings from './theme-settings';
import RolePermissionsEditor from './role-permissions-editor';
import MailSettings from './mail-settings';
import DatabaseMaintenance from './database-maintenance';
import { getMailSettingsAction, getNotificationSettingsAction } from '@/app/actions';
import NotificationSettings from './notification-settings';

export const metadata = {
  title: 'Ayarlar | Dashboard',
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const isAdmin = session.role === 'ADMIN';
  const permissions = isAdmin ? await getRolePermissions() : null;
  const assignableRoles = isAdmin ? await getRoleAssignableRoles() : null;
  const [mailSettings, notificationSettings] = await Promise.all([
    getMailSettingsAction(),
    getNotificationSettingsAction(),
  ]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 className="heading-2" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Genel Ayarlar</h2>
        <p className="text-muted">Dashboard görünümünü ve tercihlerini buradan kişiselleştirebilirsiniz.</p>
      </div>

      <ThemeSettings />

      <div style={{ marginTop: '2rem' }}>
        <NotificationSettings initialSettings={notificationSettings?.settings} />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <MailSettings initialConfig={mailSettings?.config} />
      </div>

      {isAdmin && (
        <>
          <div style={{ marginTop: '2rem' }}>
            <DatabaseMaintenance />
          </div>

          <div style={{ marginTop: '2rem' }}>
            <RolePermissionsEditor
              roles={CONFIGURABLE_ROLES}
              groups={PERMISSION_GROUPS}
              initialPermissions={permissions}
              initialAssignableRoles={assignableRoles}
              assignableRoleOptions={ASSIGNABLE_ROLE_OPTIONS}
            />
          </div>
        </>
      )}
    </div>
  );
}
