import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getInboxMessagesAction } from '@/app/actions';
import MailClient from './mail-client';

export const metadata = {
  title: 'Mail | Dashboard',
};

export default async function MailPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const initialResult = await getInboxMessagesAction('all');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="heading-1" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Mail</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Gelen mailleri görüntüleyin ve dashboard üzerinden mail gönderin.
        </p>
      </div>

      <MailClient initialResult={initialResult} />
    </div>
  );
}
