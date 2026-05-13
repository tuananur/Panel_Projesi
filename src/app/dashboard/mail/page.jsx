import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import MailClient from './mail-client';
import { getMailConfig } from '@/lib/mail';

export const metadata = {
  title: 'Mail | Dashboard',
};

export default async function MailPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const mailConfig = await getMailConfig({ userId: session.userId });

  if (mailConfig?.enabled !== true) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Mail</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Mail modülü bu kullanıcı için pasif. Ayarlardan maili aktif edip bağlantı bilgilerinizi kaydedin.
          </p>
        </div>
        <Link href="/dashboard/settings" className="btn btn-primary" style={{ width: 'fit-content' }}>
          Mail Ayarlarına Git
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Mail</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Gelen mailleri görüntüleyin ve dashboard üzerinden mail gönderin.
        </p>
      </div>

      <MailClient initialResult={{ success: true, messages: [] }} />
    </div>
  );
}
