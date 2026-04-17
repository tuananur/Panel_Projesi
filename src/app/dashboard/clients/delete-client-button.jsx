'use client';

import { deleteClientAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function DeleteClientButton({ clientId }) {
  const router = useRouter();

  async function handleDelete() {
    if (confirm('Bu müşteriyi silmek istediğinize emin misiniz? Müşteriye ait tüm geçmiş kayıtlar da silinecektir!')) {
      const formData = new FormData();
      formData.append('id', clientId);
      await deleteClientAction(formData);
      router.refresh();
    }
  }

  return (
    <button 
      onClick={handleDelete}
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
  );
}
