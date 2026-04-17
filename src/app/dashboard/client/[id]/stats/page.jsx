import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { BarChart3, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

export default async function StatsPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: {
      tasks: true
    }
  });

  if (!client) return null;

  const totalTasks = client.tasks.length;
  const completedTasks = client.tasks.filter(t => t.status).length;
  const pendingTasks = totalTasks - completedTasks;
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Monthly stats (current month)
  const now = new Date();
  const currentMonthTasks = client.tasks.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  const completedThisMonth = currentMonthTasks.filter(t => t.status).length;

  // Platform breakdown
  const platforms = {};
  client.tasks.filter(t => t.type === 'SOCIAL').forEach(t => {
    platforms[t.platform] = (platforms[t.platform] || 0) + (t.status ? 1 : 0);
  });

  return (
    <div className="animate-fade-in">
      <h2 className="heading-2" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BarChart3 size={24} className="text-muted" /> Performans Verileri
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ background: 'var(--accent-gradient)' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Genel Başarı Oranı</h3>
          <p style={{ color: 'white', fontSize: '2.5rem', fontWeight: 700 }}>%{successRate}</p>
          <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${successRate}%`, backgroundColor: 'white' }}></div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Tamamlanan Görevler</h3>
              <p style={{ fontSize: '2rem', fontWeight: 700 }}>{completedTasks}</p>
            </div>
            <CheckCircle2 size={32} color="#10b981" />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Toplam {totalTasks} planlı içerik içinden</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Bekleyen İşler</h3>
              <p style={{ fontSize: '2rem', fontWeight: 700 }}>{pendingTasks}</p>
            </div>
            <Clock size={32} color="#f59e0b" />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>En kısa sürede tamamlanması gereken</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <h3 className="heading-2" style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} /> Platform Bazlı Paylaşım Dağılımı
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {Object.keys(platforms).length > 0 ? Object.keys(platforms).map(platform => (
              <div key={platform}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>{platform}</span>
                  <span className="text-muted">{platforms[platform]} Paylaşım</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(100, (platforms[platform] / (completedTasks || 1)) * 100)}%`, 
                    backgroundColor: 'var(--accent-primary)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
            )) : (
                <p className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>Henüz paylaşım verisi yok.</p>
            )}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <h3 className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Bu Ay Üretilen İçerik</h3>
          <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="150" height="150" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
               <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent-primary)" strokeWidth="8" 
                 strokeDasharray={`${(completedThisMonth / (currentMonthTasks.length || 1)) * 283} 283`}
                 transform="rotate(-90 50 50)"
               />
             </svg>
             <div style={{ position: 'absolute', fontSize: '1.5rem', fontWeight: 700 }}>{completedThisMonth}</div>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>{now.toLocaleString('tr-TR', { month: 'long' })} Ayı</p>
        </div>
      </div>
    </div>
  );
}
