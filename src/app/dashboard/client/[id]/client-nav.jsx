'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function ClientNav({ clientId, canSeeStats = true, canSeeNotes = true, canSeeDev = false, canSeeSEO, canSeeSocial, canSeeSettings, canSeeMeta, canSeeGoogle, canSeeAnalytics }) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { href: `/dashboard/client/${clientId}/stats`, label: 'İstatistikler', show: canSeeStats },
    { href: `/dashboard/client/${clientId}/notes`, label: 'Yapılacaklar Listesi', show: canSeeNotes },
    { href: `/dashboard/client/${clientId}/dev`, label: 'Yazılım', show: canSeeDev },
    { href: `/dashboard/client/${clientId}/meta`, label: 'Meta Reklamları', show: canSeeMeta },
    { href: `/dashboard/client/${clientId}/google`, label: 'Google Reklamları', show: canSeeGoogle },
    { href: `/dashboard/client/${clientId}/analytics`, label: 'Google Analytics', show: canSeeAnalytics },
    { href: `/dashboard/client/${clientId}/seo`, label: 'SEO Takibi', show: canSeeSEO },
    { href: `/dashboard/client/${clientId}/social`, label: 'Sosyal Medya Takvimi', show: canSeeSocial },
    { href: `/dashboard/client/${clientId}/settings`, label: 'Hizmet Ayarları', show: canSeeSettings },
  ].filter(tab => tab.show);

  return (
    <div style={{ 
      display: 'flex', 
      gap: '0.5rem', 
      borderBottom: '1px solid var(--border-color)', 
      paddingBottom: '0.5rem',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none'
    }}>
      {tabs.map(tab => {
        const isActive = pathname.startsWith(tab.href) || (tab.href.endsWith('/stats') && pathname === `/dashboard/client/${clientId}`);
        return (
          <Link 
            key={tab.href} 
            href={tab.href}
            prefetch={true}
            onMouseEnter={() => router.prefetch(tab.href)}
            onFocus={() => router.prefetch(tab.href)}
            style={{
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.95rem',
              borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              marginBottom: '-0.6rem'
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
