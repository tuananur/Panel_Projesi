'use client';

import { useState } from 'react';
import { createUserAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import CustomDialog from '@/app/components/custom-dialog';

export default function CreateUserForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData) {
    setLoading(true);
    setError('');
    
    const result = await createUserAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
      setLoading(false);
      // Reset the form manually since it's a client component using action
      document.getElementById('create-user-form').reset();
    }
  }

  return (
    <form id="create-user-form" action={handleSubmit}>
      
      <div className="input-group">
        <label htmlFor="username" className="input-label">Kullanıcı Adı</label>
        <input 
          type="text" 
          id="username" 
          name="username" 
          className="input-field" 
          required 
          placeholder="Örn: ahmet123"
        />
      </div>

      <div className="input-group">
        <label htmlFor="role" className="input-label">Rol</label>
        <select 
          id="role" 
          name="role" 
          className="input-field" 
          required
          style={{ cursor: 'pointer' }}
        >
          <option value="ADMIN">Yönetici (Admin)</option>
          <option value="DESIGNER">Tasarımcı</option>
          <option value="ADVERTISER">Reklamcı</option>
        </select>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        style={{ width: '100%', marginTop: '1rem' }}
        disabled={loading}
      >
        {loading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
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
