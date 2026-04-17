'use client';

import { deleteUserAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function DeleteUserButton({ userId }) {
  const router = useRouter();

  async function handleDelete() {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      const formData = new FormData();
      formData.append('id', userId);
      await deleteUserAction(formData);
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
