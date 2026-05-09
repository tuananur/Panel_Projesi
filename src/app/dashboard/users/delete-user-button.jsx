'use client';

import { useState } from 'react';
import { deleteUserAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import CustomDialog from '@/app/components/custom-dialog';
import { useTheme } from '@/app/components/theme-provider';

export default function DeleteUserButton({ userId }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setGlobalLoading } = useTheme();

  async function handleDelete() {
    setLoading(true);
    setGlobalLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('id', userId);
    const result = await deleteUserAction(formData);
    
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
        style={{
          background: 'none',
          border: 'none',
          color: '#ef4444',
          cursor: 'pointer',
          fontSize: '0.8rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}
        title="Sil"
      >
        <Trash2 size={14} /> <span className="hide-mobile">Sil</span>
      </button>

      <CustomDialog
        isOpen={isOpen}
        title="Silme Onayı"
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        confirmText="Sil"
        loading={loading}
      >
        <div style={{ color: 'var(--text-secondary)' }}>
          {error ? (
            <span style={{ color: '#ef4444' }}>{error}</span>
          ) : (
            "Bu kullanıcıyı silmek istediğinize emin misiniz?"
          )}
        </div>
      </CustomDialog>
    </>
  );
}
