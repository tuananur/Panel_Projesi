import { getSession } from '@/lib/auth';
import DashboardClientLayout from './dashboard-client-layout';
import { redirect } from 'next/navigation';
import { getRolePermissions } from '@/lib/permissions';

export const metadata = {
  title: 'Dashboard | Yönetim Paneli',
};

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const permissions = await getRolePermissions();

  return (
    <DashboardClientLayout session={session} permissions={permissions}>
      {children}
    </DashboardClientLayout>
  );
}
