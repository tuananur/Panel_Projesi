'use client';

import { useState } from 'react';
import { deleteClientAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import CustomDialog from '@/app/components/custom-dialog';

export default function DeleteClientButton({ clientId }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const formData = new FormData();
    formData.append('id', clientId);
    await deleteClientAction(formData);
    setIsOpen(false);
    router.refresh();
    setLoading(false);
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
          fontSize: '0.85rem',
          textDecoration: 'underline'
        }}
      >
        Sil
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
          Bu müşteriyi silmek istediğinize emin misiniz? Müşteriye ait tüm geçmiş kayıtlar da silinecektir!
        </div>
      </CustomDialog>
    </>
  );
}
