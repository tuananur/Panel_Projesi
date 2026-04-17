'use client';

import { useState } from 'react';
import { setPasswordAction } from '@/app/actions';

export default function SetPasswordForm({ userId }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // We bind the userId to the action
  const actionWithId = setPasswordAction.bind(null, userId);

  async function handleSubmit(formData) {
    setLoading(true);
    setError('');
    
    const result = await actionWithId(formData);
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
        {loading ? 'Kaydediliyor...' : 'Şifreyi Kaydet ve Devam Et'}
      </button>
    </form>
  );
}
