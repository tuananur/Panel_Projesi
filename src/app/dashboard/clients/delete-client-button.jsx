'use client';

import { useState } from 'react';
import { deleteClientAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
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
          Bu müşteriyi silmek istediğinize emin misiniz? Müşteriye ait tüm geçmiş kayıtlar da silinecektir!
        </div>
      </CustomDialog>
    </>
  );
}
