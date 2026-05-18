import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ASSIGNABLE_ROLE_OPTIONS, CONFIGURABLE_ROLES, PERMISSION_GROUPS, getRoleAssignableRoles, getRolePermissions, getUserPermissionsSettings } from '@/lib/permissions';
import ThemeSettings from './theme-settings';
import RolePermissionsEditor from './role-permissions-editor';
import MailSettings from './mail-settings';
import DatabaseMaintenance from './database-maintenance';
import { getMailSettingsAction, getNotificationSettingsAction, getGoogleAdsGlobalSettingsAction, getAppearanceSettingsAction } from '@/app/actions';
import NotificationSettings from './notification-settings';
import GoogleAdsGlobalSettings from './google-ads-settings';

export const metadata = {
  title: 'Ayarlar | Dashboard',
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const isAdmin = session.role === 'ADMIN';
  const permissions = isAdmin ? await getRolePermissions() : null;
  const assignableRoles = isAdmin ? await getRoleAssignableRoles() : null;
  const users = isAdmin ? await prisma.user.findMany({ select: { id: true, username: true, role: true }, orderBy: { username: 'asc' } }) : [];
  const userPermissions = isAdmin ? await getUserPermissionsSettings() : {};
  const [mailSettings, notificationSettings, googleAdsGlobalSettings, appearanceSettings] = await Promise.all([
    getMailSettingsAction(),
    getNotificationSettingsAction(),
    getGoogleAdsGlobalSettingsAction(),
    getAppearanceSettingsAction(),
  ]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 className="heading-2" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Genel Ayarlar</h2>
        <p className="text-muted">Dashboard görünümünü ve tercihlerini buradan kişiselleştirebilirsiniz.</p>
      </div>

      <ThemeSettings initialAppearance={appearanceSettings?.settings} />

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
            <GoogleAdsGlobalSettings initialConfig={googleAdsGlobalSettings?.config} />
          </div>

          <div style={{ marginTop: '2rem' }}>
            <RolePermissionsEditor
              roles={CONFIGURABLE_ROLES}
              groups={PERMISSION_GROUPS}
              initialPermissions={permissions}
              initialAssignableRoles={assignableRoles}
              assignableRoleOptions={ASSIGNABLE_ROLE_OPTIONS}
              users={users}
              initialUserPermissions={userPermissions}
            />
          </div>
        </>
      )}
    </div>
  );
}
