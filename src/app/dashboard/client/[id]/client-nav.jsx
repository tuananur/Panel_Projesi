'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ClientNav({ clientId, canSeeSEO, canSeeSocial, canSeeSettings }) {
  const pathname = usePathname();

  const tabs = [
    { href: `/dashboard/client/${clientId}/stats`, label: 'İstatistikler', show: true },
    { href: `/dashboard/client/${clientId}/seo`, label: 'SEO Takibi', show: canSeeSEO },
    { href: `/dashboard/client/${clientId}/social`, label: 'Sosyal Medya Takvimi', show: canSeeSocial },
    { href: `/dashboard/client/${clientId}/settings`, label: 'Hizmet Ayarları', show: canSeeSettings },
  ].filter(tab => tab.show);

  return (
    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
      {tabs.map(tab => {
        const isActive = pathname.startsWith(tab.href) || (tab.href.endsWith('/stats') && pathname === `/dashboard/client/${clientId}`);
        return (
          <Link 
            key={tab.href} 
            href={tab.href}
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
