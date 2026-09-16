'use client';

import Link, { useLinkStatus } from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';

// Rapor sayfası Google API'lerini beklediği için tıklamadan sonra satırı işaretliyoruz.
// Hedefin loading.jsx dosyası önceden getirilebildiyse pending durumu hiç görünmez.
function RowBody({ children }) {
  const { pending } = useLinkStatus();
  return (
    <div
      className={`report-row${pending ? ' is-pending' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.25rem',
      }}
    >
      {children}
      {pending ? (
        <Loader2 size={18} style={{ color: '#4285F4', flexShrink: 0, animation: 'spin 0.9s linear infinite' }} />
      ) : (
        <ChevronRight size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
      )}
    </div>
  );
}

export default function ReportRowLink({ href, isFirst, children }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'var(--text-primary)',
        borderTop: isFirst ? 'none' : '1px solid var(--border-color)',
      }}
    >
      <RowBody>{children}</RowBody>
    </Link>
  );
}
