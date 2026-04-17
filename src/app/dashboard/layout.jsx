import { getSession } from '@/lib/auth';
import Sidebar from './sidebar';
import Header from './header';
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
    <div className="dashboard-layout animate-fade-in">
      <Sidebar role={session.role} />
      <main className="main-content">
        <Header />
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}
