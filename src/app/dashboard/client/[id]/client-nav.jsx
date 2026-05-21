'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';

const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default function ClientNav({ clientId, canSeeStats = true, canSeeNotes = true, canSeeDev = false, canSeeSEO, canSeeSocial, canSeeSettings, canSeeMeta, canSeeGoogle, canSeeAnalytics }) {
  const pathname = usePathname();
  const router = useRouter();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

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

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 2);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs]);

  // Use ResizeObserver for extremely robust scroll boundary detection (resize/sidebar collapse)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      checkScroll();
    });
    observer.observe(container);

    // Observe children to capture changes in tab text or dynamic filtering
    const children = container.children;
    for (let i = 0; i < children.length; i++) {
      observer.observe(children[i]);
    }

    return () => {
      observer.disconnect();
    };
  }, [tabs]);

  useEffect(() => {
    // Auto scroll active tab into view on pathname changes
    if (scrollContainerRef.current) {
      const timer = setTimeout(() => {
        const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        checkScroll();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleScroll = () => {
    checkScroll();
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
      {/* Left Gradient Overlay & Arrow */}
      {showLeftArrow && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '50px',
          background: 'linear-gradient(to right, var(--bg-primary) 50%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <button
            onClick={scrollLeft}
            type="button"
            style={{
              pointerEvents: 'auto',
              background: 'rgba(30, 41, 59, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-lg)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              marginLeft: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-primary)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ChevronLeft />
          </button>
        </div>
      )}

      {/* Scrollable Nav Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          borderBottom: '1px solid var(--border-color)', 
          paddingBottom: '0.5rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          width: '100%',
          paddingLeft: '1rem',
          paddingRight: '1rem',
        }}
      >
        {tabs.map(tab => {
          const isActive = pathname.startsWith(tab.href) || (tab.href.endsWith('/stats') && pathname === `/dashboard/client/${clientId}`);
          return (
            <Link 
              key={tab.href} 
              href={tab.href}
              prefetch={true}
              data-active={isActive ? "true" : "false"}
              onMouseEnter={() => router.prefetch(tab.href)}
              onFocus={() => router.prefetch(tab.href)}
              style={{
                padding: '0.5rem 1rem',
                textDecoration: 'none',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.95rem',
                borderBottom: isActive ? '2.5px solid var(--accent-primary)' : '2.5px solid transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                marginBottom: '-0.6rem',
                zIndex: 2,
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Right Gradient Overlay & Arrow */}
      {showRightArrow && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '50px',
          background: 'linear-gradient(to left, var(--bg-primary) 50%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <button
            onClick={scrollRight}
            type="button"
            style={{
              pointerEvents: 'auto',
              background: 'rgba(30, 41, 59, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-lg)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              marginRight: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-primary)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
