import { getSession } from '@/lib/auth';
import DashboardClientLayout from './dashboard-client-layout';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard | Yönetim Paneli',
};

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardClientLayout session={session}>
      {children}
    </DashboardClientLayout>
  );
}
