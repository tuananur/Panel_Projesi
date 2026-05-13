'use client';

import { useState } from 'react';
import { updateUserAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';
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

export default function EditUserModal({ user, managerCandidates = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setGlobalLoading } = useTheme();
  const router = useRouter();

  async function handleSubmit(formData) {
    setLoading(true);
    setGlobalLoading(true);
    setError('');
    
    const result = await updateUserAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      router.refresh();
    }
    setLoading(false);
    setGlobalLoading(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
        title="Düzenle"
      >
        <Edit size={14} /> <span className="hide-mobile">Düzenle</span>
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h2 className="heading-2" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Kullanıcıyı Düzenle</h2>
            
            <form action={handleSubmit}>
              <input type="hidden" name="id" value={user.id} />

              <div className="input-group">
                <label className="input-label">Kullanıcı Adı</label>
                <input 
                  type="text" 
                  name="username" 
                  className="input-field" 
                  defaultValue={user.username} 
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Rol</label>
                <select name="role" className="input-field" defaultValue={user.role} required>
                  {ROLES.map((role) => (
                    <option key={role.key} value={role.key}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Bağlı Yetkili</label>
                <select name="managerId" className="input-field" defaultValue={user.managerId || ''}>
                  <option value="">Yok / Admin</option>
                  {managerCandidates
                    .filter((manager) => manager.id !== user.id)
                    .map((manager) => (
                      <option key={manager.id} value={manager.id}>{manager.username} ({manager.role})</option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  onClick={() => setIsOpen(false)}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </>
  );
}
