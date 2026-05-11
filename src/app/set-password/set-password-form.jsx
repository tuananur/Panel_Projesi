'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomDialog from '@/app/components/custom-dialog';
import { useTheme } from '@/app/components/theme-provider';
import { setPasswordAction } from '@/app/actions';

export default function SetPasswordForm({ userId }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setGlobalLoading } = useTheme();

  // We bind the userId to the action
  const actionWithId = setPasswordAction.bind(null, userId);

  async function handleSubmit(formData) {
    if (loading) return;
    setLoading(true);
    setGlobalLoading(true);
    setError('');
    try {
      const result = await actionWithId(formData);
      if (result?.error) {
        setError(result.error);
      }
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  }

  return (
    <form action={handleSubmit}>
      
      <div className="input-group">
        <label htmlFor="password" className="input-label">Yeni Şifre</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          className="input-field" 
          required 
          placeholder="En az 6 karakter"
          minLength={6}
        />
      </div>

      <div className="input-group">
        <label htmlFor="confirmPassword" className="input-label">Yeni Şifre (Tekrar)</label>
        <input 
          type="password" 
          id="confirmPassword" 
          name="confirmPassword" 
          className="input-field" 
          required 
          placeholder="Şifrenizi tekrar girin"
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        style={{ width: '100%', marginTop: '1rem' }}
        disabled={loading}
      >
        {loading ? 'Şifre Belirleniyor...' : 'Şifremi Belirle ve Giriş Yap'}
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
