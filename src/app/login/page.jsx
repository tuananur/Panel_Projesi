import LoginForm from './login-form';

export const metadata = {
  title: 'Giriş Yap | Dashboard',
  description: 'Yönetim paneline giriş yapın',
};

export default function LoginPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', margin: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="heading-2" style={{ marginBottom: '0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Yönetim Paneli
          </h1>
          <p className="text-muted">Devam etmek için giriş yapın</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
