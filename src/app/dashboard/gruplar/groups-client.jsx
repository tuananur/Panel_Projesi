'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UsersRound, Plus, Trash2, Building2 } from 'lucide-react';
import { addClientGroupAction, deleteClientGroupAction } from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';

export default function GroupsClient({ initialGroups = [], clients = [], userRole, currentUserId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (formData) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await addClientGroupAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setIsAddOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (loading) return;
    if (!confirm('Bu grubu silmek istediğinize emin misiniz?')) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', id);
      const result = await deleteClientGroupAction(formData);
      if (result?.error) alert(result.error);
      else router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-1" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UsersRound size={28} style={{ color: 'var(--accent-primary)' }} />
            Gruplar
          </h1>
          <p className="text-muted" style={{ maxWidth: '560px' }}>
            Müşterilerle açılan grup sohbetlerini takip edin.
            {userRole === 'ADMIN' ? ' Yönetici olarak tüm grupları görürsünüz.' : ' Yalnızca kendi eklediğiniz grupları görürsünüz.'}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Grup Ekle
        </button>
      </div>

      {initialGroups.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="text-muted">Henüz grup eklenmemiş.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {initialGroups.map((group) => (
            <div
              key={group.id}
              className="glass-panel"
              style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{group.name}</h3>
                {(group.userId === currentUserId || userRole === 'ADMIN') && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDelete(group.id)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}
                    title="Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Building2 size={14} />
                {group.client?.companyName || '—'}
              </div>

              {userRole === 'ADMIN' && group.user?.username && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Ekleyen: <strong>{group.user.username}</strong>
                </div>
              )}

              <div style={{ fontSize: '0.8rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Gruptaki kişiler</span>
                <div style={{ marginTop: '0.35rem' }}>{group.members}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CustomDialog isOpen={isAddOpen} title="Grup Ekle" onClose={() => { setIsAddOpen(false); setError(''); }} showButtons={false}>
        <form action={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          <div className="input-group">
            <label className="input-label">Grup adı *</label>
            <input type="text" name="name" className="input-field" placeholder="Örn. Çiçek Sepeti - Tasarım Grubu" required />
          </div>
          <div className="input-group">
            <label className="input-label">İlgili müşteri *</label>
            <select name="clientId" className="input-field" required defaultValue="">
              <option value="" disabled>Müşteri seçin</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Gruptaki kişiler *</label>
            <textarea
              name="members"
              className="input-field"
              rows={4}
              placeholder="Her satıra bir isim veya virgülle ayırın..."
              required
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setIsAddOpen(false)}>İptal</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Ekleniyor...' : 'Ekle'}
            </button>
          </div>
        </form>
      </CustomDialog>
    </div>
  );
}
