import SetPasswordForm from './set-password-form';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Şifre Belirle | Dashboard',
};

export default async function SetPasswordPage() {
  const session = await getSession();
  
  // Extra safety check just in case middleware is bypassed
  if (!session || !session.requiresPasswordSet) {
    redirect('/dashboard');
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', margin: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="heading-2">Hoş Geldiniz, {session.username}</h1>
          <p className="text-muted">Lütfen devam etmek için yeni şifrenizi belirleyin.</p>
        </div>
        <SetPasswordForm userId={session.userId} />
      </div>
    </main>
  );
}
