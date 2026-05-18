'use client';

import Link from 'next/link';
import { AlertTriangle, CalendarClock, Bell, CheckSquare, ClipboardCheck, ArrowRight } from 'lucide-react';

function WorkItemList({ items, emptyText }) {
  if (!items?.length) {
    return <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{emptyText}</p>;
  }
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/dashboard/work-items?notificationWorkItem=${item.id}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <span style={{ minWidth: 0, flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {item.client?.companyName || 'Genel'}
                {item.assigneeUsername ? ` · ${item.assigneeUsername}` : ''}
              </span>
            </span>
            <ArrowRight size={14} style={{ flexShrink: 0, opacity: 0.5 }} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardToday({ summary }) {
  const cards = [
    { label: 'Geciken iş', value: summary.overdueCount, color: '#ef4444', icon: <AlertTriangle size={18} />, href: '/dashboard/work-items' },
    { label: 'Bugün vadesi', value: summary.dueTodayCount, color: '#f59e0b', icon: <CalendarClock size={18} />, href: '/dashboard/work-items' },
    { label: 'Onay bekleyen', value: summary.pendingApprovalCount, color: '#8b5cf6', icon: <ClipboardCheck size={18} />, href: '/dashboard/work-items' },
    { label: 'Okunmamış bildirim', value: summary.unreadNotifications, color: '#3b82f6', icon: <Bell size={18} />, href: '/dashboard' },
    { label: 'Bekleyen görev', value: summary.pendingTasks, color: '#10b981', icon: <CheckSquare size={18} />, href: '/dashboard/clients' },
  ];

  return (
    <section style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 className="heading-2" style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Bugün</h2>
        <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>Geciken işler, vadesi gelenler ve bekleyen öğelerin özeti.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="glass-panel"
            style={{
              padding: '1rem',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              border: `1px solid ${card.color}22`,
            }}
          >
            <span style={{ color: card.color, display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 700 }}>
              {card.icon} {card.label}
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: card.color }}>{card.value}</span>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <article className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ef4444', marginBottom: '0.75rem' }}>Geciken işler</h3>
          <WorkItemList items={summary.overdueWorkItems} emptyText="Geciken iş yok." />
        </article>
        <article className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f59e0b', marginBottom: '0.75rem' }}>Bugün vadesi gelenler</h3>
          <WorkItemList items={summary.dueTodayWorkItems} emptyText="Bugün için vadesi gelen iş yok." />
        </article>
      </div>
    </section>
  );
}
