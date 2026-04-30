import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import BlogTracker from './blog-tracker';

export default async function SEOPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: {
      tasks: {
        where: { type: 'BLOG' },
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!client) return null;

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const enteredThisWeek = client.tasks.filter(t => t.status && new Date(t.date) >= oneWeekAgo).length;
  const totalArchive = client.tasks.filter(t => t.status).length;
  const weeklyTarget = client.weeklyBlogTarget || 5; // Default 5 if not set
  const completionRate = Math.min(100, Math.round((enteredThisWeek / weeklyTarget) * 100));

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* 1. Haftalık Hedef */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.25rem' }}>
          <h3 className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Haftalık Blog Hedefi</h3>
          <p style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>{weeklyTarget}</p>
        </div>

        {/* 2. Bu Hafta Girilen */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <h3 className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Bu Hafta Girilen</h3>
          <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#10b981', margin: 0 }}>{enteredThisWeek}</p>
        </div>

        {/* 3. Tamamlama Oranı */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.25rem' }}>
          <h3 className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Hedef Tamamlama</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <p style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-primary)', margin: 0 }}>%{completionRate}</p>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
            <div style={{ width: `${completionRate}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }}></div>
          </div>
        </div>

        {/* 4. Toplam Arşiv */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.25rem', background: 'var(--bg-secondary)' }}>
          <h3 className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Toplam Blog Arşivi</h3>
          <p style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, opacity: 0.9 }}>{totalArchive}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Yayındaki tüm içerikler</p>
        </div>
      </div>

      <div className="card">
        <h2 className="heading-2" style={{ fontSize: '1.25rem' }}>Blog Listesi (SEO)</h2>
        <BlogTracker clientId={client.id} initialTasks={client.tasks} isAdmin={session.role === 'ADMIN' || session.role === 'ADVERTISER'} />
      </div>
    </div>
  );
}
