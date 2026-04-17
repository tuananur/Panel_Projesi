'use client';

import { useState } from 'react';
import { loginAction } from '@/app/actions';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData) {
    setLoading(true);
    setError('');
    
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit}>
      {error && (
        <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
      
      <div className="input-group">
        <label htmlFor="username" className="input-label">Kullanıcı Adı</label>
        <input 
          type="text" 
          id="username" 
          name="username" 
          className="input-field" 
          required 
          placeholder="Kullanıcı adınızı girin"
        />
      </div>

      <div className="input-group">
        <label htmlFor="password" className="input-label">Şifre</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          className="input-field" 
          placeholder="İlk girişinizse boş bırakabilirsiniz"
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        style={{ width: '100%', marginTop: '1rem' }}
        disabled={loading}
      >
        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </button>
    </form>
  );
}
