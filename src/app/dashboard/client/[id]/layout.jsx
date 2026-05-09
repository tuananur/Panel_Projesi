import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import ClientNav from './client-nav';
import WeeklyStats from './social/weekly-stats';
import ClientSwitcher from '@/app/components/client-switcher';
import { Globe, Layout, Play, Share2, Info, User, Phone, Mail } from 'lucide-react';

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
  YouTube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.4 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
    </svg>
  ),
  Facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  X: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z" />
    </svg>
  ),
  Pinterest: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C1.124 21.627 0 16.958 0 11.987 0 5.367 5.367 0 11.987 0h.03z"/>
    </svg>
  )
};

export default async function ClientDetailLayout({ children, params }) {
  const { id } = await params;
  const session = await getSession();
  
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: {
      tasks: true
    }
  });

  if (!client) return null;

  const allClients = await prisma.client.findMany({
    select: { id: true, companyName: true, logoUrl: true },
    orderBy: { companyName: 'asc' }
  });

  const services = JSON.parse(client.services || '[]');
  const socialAccounts = JSON.parse(client.socialAccounts || '{}');
  const socialSchedule = JSON.parse(client.socialSchedule || '{}');
  const activePlatforms = Object.keys(socialAccounts).filter(p => {
    const hasAccount = socialAccounts[p] && socialAccounts[p].trim() !== '';
    const hasSchedule = socialSchedule[p] && socialSchedule[p].length > 0;
    return hasAccount || hasSchedule;
  });
  
  const canSeeSEO = services.includes('SEO') && (session.role === 'ADMIN' || session.role === 'ADVERTISER');
  const canSeeSocial = services.includes('Sosyal Medya') && (session.role === 'ADMIN' || session.role === 'DESIGNER' || session.role === 'ADVERTISER');
  const canSeeSettings = session.role === 'ADMIN' || session.role === 'DESIGNER' || session.role === 'ADVERTISER';
  const canSeeMeta = session.role === 'ADMIN' || session.role === 'ADVERTISER';

  return (
    <div className="animate-fade-in">
      <div className="responsive-flex" style={{ marginBottom: '1.5rem' }}>
        <div>
          <ClientSwitcher currentClient={client} allClients={allClients} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="İletişim Kişisi">
                 <User size={14} /> {client.contactName}
               </span>
               <a 
                 href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'inherit', textDecoration: 'none' }}
                 title="WhatsApp ile Mesaj Gönder"
               >
                 <Phone size={14} /> {client.phone}
               </a>
               {client.email && (
                 <a 
                   href={`mailto:${client.email}`} 
                   style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'inherit', textDecoration: 'none' }}
                   title="E-posta Gönder"
                 >
                   <Mail size={14} /> {client.email}
                 </a>
               )}
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
          <Suspense fallback={<div style={{ height: '60px', background: 'var(--bg-secondary)', borderRadius: '12px', opacity: 0.5 }}></div>}>
            <WeeklyStats 
              clientId={id}
              tasks={client.tasks} 
              schedule={socialSchedule} 
              platforms={activePlatforms} 
            />
          </Suspense>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <ClientNav 
          clientId={id} 
          canSeeSEO={canSeeSEO} 
          canSeeSocial={canSeeSocial} 
          canSeeSettings={canSeeSettings} 
          canSeeMeta={canSeeMeta}
        />
      </div>

      <div className="content-area-client">
        {children}
      </div>
    </div>
  );
}
