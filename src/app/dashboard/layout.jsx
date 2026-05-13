import { getSession } from '@/lib/auth';
import DashboardClientLayout from './dashboard-client-layout';
import { redirect } from 'next/navigation';
import { getRolePermissions } from '@/lib/permissions';
import { getMailConfig } from '@/lib/mail';
import { getNotificationSettingsAction } from '@/app/actions';

export const metadata = {
  title: 'Dashboard | Yönetim Paneli',
};

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const [permissions, mailConfig, notificationSettingsResult] = await Promise.all([
    getRolePermissions(),
    getMailConfig({ userId: session.userId }),
    getNotificationSettingsAction(),
  ]);

  return (
    <DashboardClientLayout
      session={session}
      permissions={permissions}
      mailEnabled={mailConfig?.enabled === true}
      notificationSettings={notificationSettingsResult?.settings}
    >
      {children}
    </DashboardClientLayout>
  );
}
