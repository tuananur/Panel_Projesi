import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ASSIGNABLE_ROLE_OPTIONS, CONFIGURABLE_ROLES, PERMISSION_GROUPS, getRoleAssignableRoles, getRolePermissions, getUserPermissionsSettings } from '@/lib/permissions';
import ThemeSettings from './theme-settings';
import RolePermissionsEditor from './role-permissions-editor';
import MailSettings from './mail-settings';
import DatabaseMaintenance from './database-maintenance';
import { getMailSettingsAction, getNotificationSettingsAction, getGoogleAdsGlobalSettingsAction, getAppearanceSettingsAction, getGoogleAnalyticsGlobalSettingsAction, getGeminiSettingsAction } from '@/app/actions';
import NotificationSettings from './notification-settings';
import GoogleAdsGlobalSettings from './google-ads-settings';
import GoogleAnalyticsGlobalSettings from './google-analytics-settings';
import AiSettings from './ai-settings';
import SettingsTabs from './settings-tabs';

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
  const [mailSettings, notificationSettings, googleAdsGlobalSettings, appearanceSettings, googleAnalyticsGlobalSettings, geminiSettings] = await Promise.all([
    getMailSettingsAction(),
    getNotificationSettingsAction(),
    isAdmin ? getGoogleAdsGlobalSettingsAction() : Promise.resolve(null),
    getAppearanceSettingsAction(),
    isAdmin ? getGoogleAnalyticsGlobalSettingsAction() : Promise.resolve(null),
    isAdmin ? getGeminiSettingsAction() : Promise.resolve(null),
  ]);

  const tabs = [
    { id: 'theme', label: 'Görünüm' },
    { id: 'notifications', label: 'Bildirim' },
    { id: 'mail', label: 'Mail' },
    ...(isAdmin ? [
      { id: 'system', label: 'Sistem' },
      { id: 'ads', label: 'Google Ads' },
      { id: 'analytics', label: 'Analytics' },
      { id: 'roles', label: 'Yetkiler' },
      { id: 'ai', label: 'AI Ayarları' },
    ] : []),
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="heading-2" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Genel Ayarlar</h2>
        <p className="text-muted">Dashboard görünümünü ve tercihlerini buradan kişiselleştirebilirsiniz.</p>
      </div>

      <SettingsTabs items={tabs}>
        <ThemeSettings initialAppearance={appearanceSettings?.settings} />
        <NotificationSettings initialSettings={notificationSettings?.settings} />
        <MailSettings initialConfig={mailSettings?.config} />
        {isAdmin && <DatabaseMaintenance />}
        {isAdmin && <GoogleAdsGlobalSettings initialConfig={googleAdsGlobalSettings?.config} />}
        {isAdmin && <GoogleAnalyticsGlobalSettings initialConfig={googleAnalyticsGlobalSettings?.config} />}
        {isAdmin && (
          <RolePermissionsEditor
            roles={CONFIGURABLE_ROLES}
            groups={PERMISSION_GROUPS}
            initialPermissions={permissions}
            initialAssignableRoles={assignableRoles}
            assignableRoleOptions={ASSIGNABLE_ROLE_OPTIONS}
            users={users}
            initialUserPermissions={userPermissions}
          />
        )}
        {isAdmin && <AiSettings initialConfig={geminiSettings?.config} />}
      </SettingsTabs>
    </div>
  );
}
