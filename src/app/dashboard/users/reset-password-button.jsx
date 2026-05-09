'use client';

import { useState } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { resetUserPasswordAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/components/theme-provider';

export default function ResetPasswordButton({ userId }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const { setGlobalLoading } = useTheme();

  const handleReset = async () => {
    if (!confirm('Bu kullanıcının şifresini sıfırlamak istediğinizden emin misiniz? Kullanıcı ilk girişinde yeni şifre belirleyecektir.')) return;
    
    setLoading(true);
    setGlobalLoading(true);
    const result = await resetUserPasswordAction(userId);
    
    if (result.success) {
      setDone(true);
      router.refresh();
      setTimeout(() => setDone(false), 2000);
    } else {
      alert(result.error);
    }
    setLoading(false);
    setGlobalLoading(false);
  };

  return (
    <button 
      onClick={handleReset}
      disabled={loading || done}
      title="Şifreyi Sıfırla"
      style={{ 
        background: 'none', 
        border: 'none', 
        color: done ? '#10b981' : 'var(--text-secondary)', 
        cursor: (loading || done) ? 'default' : 'pointer',
        padding: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => !done && (e.currentTarget.style.color = 'var(--accent-primary)')}
      onMouseLeave={(e) => !done && (e.currentTarget.style.color = 'var(--text-secondary)')}
    >
      {done ? <Check size={16} /> : <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
    </button>
  );
}
