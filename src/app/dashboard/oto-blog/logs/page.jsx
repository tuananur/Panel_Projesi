import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { can, getRolePermissions } from '@/lib/permissions';
import OtoBlogAutoLogs from '../oto-blog-auto-logs';
import { getOtoBlogAutoJobsAction } from '../oto-blog-actions';

export const metadata = {
  title: 'Tam Oto Logs | Oto Blog',
};

export const dynamic = 'force-dynamic';

export default async function OtoBlogAutoLogsPage() {
  const session = await getSession();
  const permissions = await getRolePermissions(session);
  if (!session || !can(permissions, session.role, 'page.oto_blog')) {
    redirect('/dashboard');
  }

  const result = await getOtoBlogAutoJobsAction();

  return (
    <div className="animate-fade-in" style={{ maxWidth: 980 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div>
          <Link href="/dashboard/oto-blog" className="text-muted" style={{ fontSize: '0.8rem', textDecoration: 'none' }}>← Oto Blog</Link>
          <h1 className="heading-1" style={{ fontSize: '1.7rem', margin: '0.35rem 0 0' }}>Tam Oto Logs</h1>
        </div>
      </div>
      <OtoBlogAutoLogs initialJobs={result.jobs || []} initialError={result.error || null} />
    </div>
  );
}
