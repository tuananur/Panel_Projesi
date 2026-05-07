'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Search, User } from 'lucide-react';

// Helper component for images with error fallback
function LogoImage({ logoUrl, companyName, size, isCircular = false }) {
  const [imgError, setImgError] = useState(false);
  
  if (!logoUrl || imgError) {
    return (
      <div style={{ 
        width: size, 
        height: size, 
        borderRadius: isCircular ? '50%' : '8px', 
        background: 'var(--accent-primary)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: parseInt(size) > 35 ? '1.2rem' : '0.8rem', 
        fontWeight: 800, 
        color: 'white', 
        flexShrink: 0 
      }}>
        {companyName ? companyName[0] : <User size={parseInt(size) * 0.5} />}
      </div>
    );
  }
  
  return (
    <img 
      src={logoUrl} 
      alt={companyName} 
      onError={() => setImgError(true)}
      style={{ 
        width: size, 
        height: size, 
        borderRadius: isCircular ? '50%' : '8px', 
        objectFit: 'cover', 
        border: '1px solid rgba(255,255,255,0.1)', 
        flexShrink: 0 
      }} 
    />
  );
}

export default function ClientSwitcher({ currentClient, allClients }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClients = allClients.filter(c => 
    c.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSwitch = (clientId) => {
    const pathParts = pathname.split('/');
    const clientIndex = pathParts.indexOf('client');
    if (clientIndex !== -1 && pathParts[clientIndex + 1]) {
      pathParts[clientIndex + 1] = clientId.toString();
    }
    
    const newPath = pathParts.join('/');
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          cursor: 'pointer',
          padding: '0.25rem 0.5rem',
          margin: '0 -0.5rem',
          borderRadius: '8px',
          transition: 'all 0.2s'
        }}
        className="client-switcher-trigger"
      >
        <LogoImage logoUrl={currentClient.logoUrl} companyName={currentClient.companyName} size="38px" />
        <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0' }}>
          {currentClient.companyName}
        </h1>
        <ChevronDown size={24} className="text-muted" style={{ 
          marginTop: '0.5rem', 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s'
        }} />
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          width: '300px', 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '12px', 
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1000,
          marginTop: '0.5rem',
          overflow: 'hidden',
          animation: 'fadeUp 0.2s ease-out'
        }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Müşteri ara..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="client-search-input"
                style={{ 
                  width: '100%', 
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)', 
                  background: 'var(--bg-primary)', 
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem' 
                }}
              />
            </div>
          </div>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '0.5rem' }}>
            {filteredClients.map(client => (
              <div 
                key={client.id}
                onClick={() => handleSwitch(client.id)}
                style={{ 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: client.id === currentClient.id ? 'var(--accent-primary)' : 'transparent',
                  color: client.id === currentClient.id ? 'white' : 'var(--text-primary)',
                  transition: 'all 0.2s',
                  marginBottom: '2px'
                }}
                className="client-option-hover"
              >
                <LogoImage logoUrl={client.logoUrl} companyName={client.companyName} size="32px" isCircular={true} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{client.companyName}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>ID: #{client.id}</div>
                </div>
                {client.id === currentClient.id && (
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }}></div>
                )}
              </div>
            ))}
            {filteredClients.length === 0 && (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Müşteri bulunamadı.
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .client-switcher-trigger:hover {
          background: rgba(255,255,255,0.05);
        }
        .client-option-hover:hover {
          background: ${isOpen ? '' : 'rgba(255,255,255,0.05)'};
        }
        .client-search-input:focus {
          outline: none;
          border-color: var(--accent-primary) !important;
          animation: searchPulse 1.5s infinite ease-in-out;
        }
        @keyframes searchPulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
