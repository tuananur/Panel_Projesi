'use client';

import { useState } from 'react';

import { loginAction } from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';

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

      <CustomDialog
        isOpen={!!error}
        title="Hata"
        onClose={() => setError('')}
        onConfirm={() => setError('')}
        confirmText="Tamam"
        showCancel={false}
      >
        <div style={{ color: 'var(--text-secondary)' }}>
          {error}
        </div>
      </CustomDialog>
    </form>
  );
}
