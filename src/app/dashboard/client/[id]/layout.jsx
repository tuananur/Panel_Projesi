import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import ClientNav from './client-nav';
import WeeklyStats from './social/weekly-stats';
import { Globe, Layout, Play, Share2, Info, User, Phone } from 'lucide-react';

const BRAND_ICONS = {
  Instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  LinkedIn: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
  YouTube: <Play size={18} />,
  Facebook: <Layout size={18} />,
  X: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
    </svg>
  ),
  TikTok: <Play size={18} />
};

export default async function ClientDetailLayout({ children, params }) {
  const { id } = await params;
  const session = await getSession();
  
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: {
      tasks: {
        where: { type: 'SOCIAL' }
      }
    }
  });

  if (!client) return null;

  const services = JSON.parse(client.services || '[]');
  const socialAccounts = JSON.parse(client.socialAccounts || '{}');
  const socialSchedule = JSON.parse(client.socialSchedule || '{}');
  const activePlatforms = Object.keys(socialAccounts).filter(p => socialAccounts[p]);
  
  const canSeeSEO = services.includes('SEO') && (session.role === 'ADMIN' || session.role === 'ADVERTISER');
  const canSeeSocial = services.includes('Sosyal Medya') && (session.role === 'ADMIN' || session.role === 'DESIGNER' || session.role === 'ADVERTISER');
  const canSeeSettings = session.role === 'ADMIN';

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{client.companyName}</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={14} /> {client.contactName}</span>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={14} /> {client.phone}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              {client.website && (
                <a 
                  href={client.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
                >
                  <Globe size={14} /> Web Sitesi
                </a>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                {Object.keys(socialAccounts).map(platform => {
                  if (!socialAccounts[platform]) return null;
                  return (
                    <a 
                      key={platform} 
                      href={socialAccounts[platform]} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      title={platform}
                      className="social-icon-hover"
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      {BRAND_ICONS[platform] || <Globe size={18} />}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Stats moved back to Header with full data */}
        <div style={{ marginTop: '0.5rem' }}>
          <WeeklyStats 
            tasks={client.tasks} 
            schedule={socialSchedule} 
            platforms={activePlatforms} 
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <ClientNav 
          clientId={id} 
          canSeeSEO={canSeeSEO} 
          canSeeSocial={canSeeSocial} 
          canSeeSettings={canSeeSettings} 
        />
      </div>

      <div className="content-area-client">
        {children}
      </div>
    </div>
  );
}
