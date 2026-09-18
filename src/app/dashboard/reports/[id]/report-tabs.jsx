'use client';

import { useState } from 'react';

// Sekme içerikleri sunucuda hazırlanıp prop olarak gelir; sekme değişimi yeni istek atmaz.
export default function ReportTabs({ tabs }) {
  const available = tabs.filter(Boolean);
  const [activeId, setActiveId] = useState(available[0]?.id);
  const active = available.find((tab) => tab.id === activeId) || available[0];

  return (
    <>
      <div
        role="tablist"
          style={{
          display: 'flex',
          gap: '0.25rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          flexWrap: 'wrap',
        }}
        data-pdf-hide
      >
        {available.map((tab) => {
          const isActive = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1rem',
                border: 'none',
                borderBottom: `2px solid ${isActive ? '#4285F4' : 'transparent'}`,
                background: 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
              <span
                aria-hidden
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: tab.hasData ? '#10B981' : '#ef4444',
                  opacity: isActive ? 1 : 0.5,
                }}
              />
            </button>
          );
        })}
      </div>

      <div role="tabpanel">{active?.content}</div>
    </>
  );
}
