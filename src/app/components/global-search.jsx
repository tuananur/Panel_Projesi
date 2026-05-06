'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, User, ChevronRight, Loader2, Target } from 'lucide-react';
import { searchTasksAction } from '@/app/actions';
import Link from 'next/link';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    setIsSearching(true);
    setIsOpen(true);
    const result = await searchTasksAction(query);
    if (result.tasks) {
      setResults(result.tasks);
    }
    setIsSearching(false);
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Tüm müşterilerde görev ara... (Örn: 19 Mayıs, Kampanya)"
          style={{
            width: '100%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '0.85rem 1rem 0.85rem 3rem',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            outline: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.2s'
          }}
          className="search-input-focus"
        />

        {query && (
          <button 
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (query.length >= 2) && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          left: 0,
          right: 0,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 15px 50px rgba(0,0,0,0.5)',
          zIndex: 1000,
          maxHeight: '450px',
          overflowY: 'auto',
          backdropFilter: 'blur(20px)',
          padding: '0.5rem'
        }}>
          {results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Bulunan Sonuçlar ({results.length})
              </div>
              {results.map((task) => {
                const taskDate = new Date(task.date);
                const month = taskDate.getMonth() + 1;
                const year = taskDate.getFullYear();
                const targetPage = task.type === 'BLOG' ? 'seo' : 'social';
                const href = `/dashboard/client/${task.client.id}/${targetPage}?month=${month}&year=${year}`;

                return (
                  <Link 
                    key={task.id} 
                    href={href}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.2s',
                      border: '1px solid transparent'
                    }}
                    className="search-result-item"
                  >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: task.type === 'BLOG' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: task.type === 'BLOG' ? '#3b82f6' : '#a855f7',
                    flexShrink: 0
                  }}>
                    <Target size={20} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{task.client.companyName}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {new Date(task.date).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <p style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--text-secondary)', 
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {task.note || 'Başlıksız Görev'}
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                </Link>
              ))}
            </div>
          ) : !isSearching && (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '1rem', opacity: 0.2 }}>
                <Search size={48} style={{ margin: '0 auto' }} />
              </div>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>Eşleşen bir görev bulunamadı.</p>
              <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Farklı bir anahtar kelime deneyebilirsiniz.</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .search-input-focus:focus {
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
          background: var(--bg-primary) !important;
        }
        .search-result-item:hover {
          background: rgba(255,255,255,0.03) !important;
          border-color: var(--border-color) !important;
          transform: translateX(4px);
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
