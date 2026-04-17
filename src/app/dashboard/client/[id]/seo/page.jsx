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

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Haftalık Blog Hedefi</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{client.weeklyBlogTarget || 0}</p>
        </div>
        <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <h3 style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Bu Hafta Girilen</h3>
          <p style={{ color: '#10b981', fontSize: '2rem', fontWeight: 700 }}>
            {client.tasks.filter(t => t.status && t.date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="heading-2" style={{ fontSize: '1.25rem' }}>Blog Listesi (SEO)</h2>
        <BlogTracker clientId={client.id} initialTasks={client.tasks} isAdmin={session.role === 'ADMIN'} />
      </div>
    </div>
  );
}
