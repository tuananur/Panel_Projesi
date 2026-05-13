'use client';

import { useState } from 'react';
import { createUserAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import CustomDialog from '@/app/components/custom-dialog';
import { useTheme } from '@/app/components/theme-provider';

const ROLES = [
  { key: 'ADMIN', label: 'Yönetici (Admin)' },
  { key: 'DESIGNER_MANAGER', label: 'Tasarım Yetkilisi' },
  { key: 'DESIGNER', label: 'Tasarımcı' },
  { key: 'ADVERTISER_MANAGER', label: 'Reklam Yetkilisi' },
  { key: 'ADVERTISER', label: 'Reklamcı' },
  { key: 'DEVELOPER', label: 'Yazılımcı' },
];

export default function CreateUserForm({ managerCandidates = [] }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setGlobalLoading } = useTheme();
  const router = useRouter();

  async function handleSubmit(formData) {
    if (loading) return;
    setLoading(true);
    setGlobalLoading(true);
    setError('');
    
    const result = await createUserAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
      document.getElementById('create-user-form').reset();
    }
    setLoading(false);
    setGlobalLoading(false);
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
          {ROLES.map((role) => (
            <option key={role.key} value={role.key}>{role.label}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="managerId" className="input-label">Bağlı Yetkili</label>
        <select id="managerId" name="managerId" className="input-field" defaultValue="">
          <option value="">Yok / Admin</option>
          {managerCandidates.map((manager) => (
            <option key={manager.id} value={manager.id}>{manager.username} ({manager.role})</option>
          ))}
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
