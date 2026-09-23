'use client';

import { Children, useState } from 'react';

export default function SettingsTabs({ items, children }) {
  const panels = Children.toArray(children);
  const [activeId, setActiveId] = useState(items[0]?.id);

  return (
    <div>
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: '0.4rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveId(item.id)}
              className="btn"
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: active ? 800 : 600,
                background: active ? 'var(--accent-primary)' : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item, index) => (
        <div key={item.id} role="tabpanel" hidden={item.id !== activeId}>
          {panels[index]}
        </div>
      ))}
    </div>
  );
}
