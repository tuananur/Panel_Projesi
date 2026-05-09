'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Trash2, Edit2, Clock, CheckCircle2, Circle, User as UserIcon, StickyNote } from 'lucide-react';
import { addNoteAction, deleteNoteAction, updateNoteAction, toggleNoteStatusAction } from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';
import { useTheme } from '@/app/components/theme-provider';

export default function NotesClient({ clientId, notes, currentUserId, userRole }) {
  const router = useRouter();
  const { setGlobalLoading } = useTheme();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredNotes = notes.filter(note => {
    const lowerSearch = search.toLowerCase();
    const createdAt = new Date(note.createdAt);
    const dateStr = createdAt.toLocaleDateString('tr-TR'); 
    const monthNames = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];
    const monthName = monthNames[createdAt.getMonth()];
    const day = createdAt.getDate().toString();
    const fullDateText = `${day} ${monthName}`;

    return (
      (note.title?.toLowerCase().includes(lowerSearch)) ||
      (note.content.toLowerCase().includes(lowerSearch)) ||
      (note.user.username.toLowerCase().includes(lowerSearch)) ||
      (dateStr.includes(lowerSearch)) ||
      (fullDateText.includes(lowerSearch))
    );
  });

  const handleAdd = async (formData) => {
    if (loading) return;
    setLoading(true);
    setGlobalLoading(true);
    formData.append('clientId', clientId);
    const result = await addNoteAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsAddModalOpen(false);
      router.refresh();
    }
    setLoading(false);
    setGlobalLoading(false);
  };

  const handleEdit = async (formData) => {
    if (loading) return;
    setLoading(true);
    setGlobalLoading(true);
    formData.append('noteId', selectedNote.id);
    const result = await updateNoteAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsEditModalOpen(false);
      setSelectedNote(null);
      router.refresh();
    }
    setLoading(false);
    setGlobalLoading(false);
  };

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    setGlobalLoading(true);
    const formData = new FormData();
    formData.append('noteId', selectedNote.id);
    const result = await deleteNoteAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsDeleteModalOpen(false);
      setSelectedNote(null);
      router.refresh();
    }
    setLoading(false);
    setGlobalLoading(false);
  };

  const handleToggleStatus = async (noteId, currentStatus) => {
    if (loading) return;
    setLoading(true);
    setGlobalLoading(true);
    const formData = new FormData();
    formData.append('noteId', noteId);
    formData.append('isDone', (!currentStatus).toString());
    const result = await toggleNoteStatusAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
    setLoading(false);
    setGlobalLoading(false);
  };

  const canManage = (note) => {
    return userRole === 'ADMIN' || note.userId === currentUserId;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Üst Bar: Arama ve Ekleme */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Notlarda ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.75rem', width: '100%' }}
          />
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
          style={{ gap: '0.5rem' }}
        >
          <Plus size={18} /> Yeni Not Ekle
        </button>
      </div>

      {/* Notlar Listesi (Log Stili) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', width: '60px', textAlign: 'center' }}>DURUM</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', width: '25%' }}>Yazan / Tarih</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Not İçeriği</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', width: '120px', textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.map((note) => (
                <tr key={note.id} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.05)', 
                  transition: 'all 0.3s', 
                  background: note.isDone ? 'rgba(16, 185, 129, 0.03)' : 'transparent' 
                }}>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => {
                        if (note.userId !== currentUserId) {
                          setError('Bu işlemi yapmaya yetkiniz yok.');
                          return;
                        }
                        handleToggleStatus(note.id, note.isDone);
                      }}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        padding: 0, 
                        color: note.isDone ? '#10b981' : 'var(--text-secondary)',
                        opacity: note.userId === currentUserId ? 1 : 0.4
                      }}
                      title={note.userId === currentUserId ? (note.isDone ? "Yapılmadı olarak işaretle" : "Yapıldı olarak işaretle") : "Bu işlemi yapmaya yetkiniz yok."}
                    >
                      {note.isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                          <UserIcon size={12} style={{ opacity: 0.7, color: note.isDone ? '#10b981' : 'inherit' }} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: note.isDone ? '#10b981' : 'inherit' }}>{note.user.username}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: note.isDone ? 'rgba(16, 185, 129, 0.7)' : 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        <Clock size={12} />
                        {new Date(note.createdAt).toLocaleDateString('tr-TR')} {new Date(note.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {note.title && (
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: note.isDone ? '#10b981' : 'var(--accent-primary)' }}>{note.title}</div>
                      )}
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: note.isDone ? '#10b981' : 'var(--text-primary)', 
                        whiteSpace: 'pre-wrap', 
                        lineHeight: '1.6',
                        opacity: note.isDone ? 0.9 : 1
                      }}>
                        {note.content}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          onClick={() => {
                            if (note.userId !== currentUserId) {
                              setError('Bu işlemi yapmaya yetkiniz yok.');
                              return;
                            }
                            setSelectedNote(note); 
                            setIsEditModalOpen(true); 
                          }}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--text-secondary)', 
                            cursor: 'pointer', 
                            padding: '0.25rem',
                            opacity: note.userId === currentUserId ? 1 : 0.3
                          }}
                          title={note.userId !== currentUserId ? "Bu işlemi yapmaya yetkiniz yok." : "Düzenle"}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (note.userId !== currentUserId) {
                              setError('Bu işlemi yapmaya yetkiniz yok.');
                              return;
                            }
                            setSelectedNote(note); 
                            setIsDeleteModalOpen(true); 
                          }}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#ef4444', 
                            cursor: 'pointer', 
                            padding: '0.25rem',
                            opacity: note.userId === currentUserId ? 1 : 0.3
                          }}
                          title={note.userId !== currentUserId ? "Bu işlemi yapmaya yetkiniz yok." : "Sil"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
              {filteredNotes.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '5rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                      <StickyNote size={48} style={{ opacity: 0.1 }} />
                      <p>{search ? 'Arama sonucu bulunamadı.' : 'Henüz not eklenmemiş.'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ekleme Modalı */}
      <CustomDialog
        isOpen={isAddModalOpen}
        title="Yeni Not Ekle"
        onClose={() => setIsAddModalOpen(false)}
        showButtons={false}
      >
        <form action={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Başlık (İsteğe Bağlı)</label>
            <input type="text" name="title" className="input-field" placeholder="Örn: Strateji Değişikliği" />
          </div>
          <div className="input-group">
            <label className="input-label">Not İçeriği</label>
            <textarea 
              name="content" 
              className="input-field" 
              rows={6} 
              required 
              placeholder="Müşteri hakkında önemli notlar..."
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)' }}>İptal</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Ekleniyor...' : 'Notu Kaydet'}
            </button>
          </div>
        </form>
      </CustomDialog>

      {/* Düzenleme Modalı */}
      <CustomDialog
        isOpen={isEditModalOpen}
        title="Notu Düzenle"
        onClose={() => setIsEditModalOpen(false)}
        showButtons={false}
      >
        <form action={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Başlık</label>
            <input type="text" name="title" className="input-field" defaultValue={selectedNote?.title || ''} />
          </div>
          <div className="input-group">
            <label className="input-label">Not İçeriği</label>
            <textarea 
              name="content" 
              className="input-field" 
              rows={6} 
              required 
              defaultValue={selectedNote?.content || ''}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)' }}>İptal</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </form>
      </CustomDialog>

      {/* Silme Onay Modalı */}
      <CustomDialog
        isOpen={isDeleteModalOpen}
        title="Notu Sil"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        confirmText="Evet, Sil"
        confirmColor="#ef4444"
        loading={loading}
      >
        <p style={{ color: 'var(--text-secondary)' }}>Bu notu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
      </CustomDialog>

      {/* Hata Modalı */}
      <CustomDialog
        isOpen={!!error}
        title="Hata"
        onClose={() => setError('')}
        onConfirm={() => setError('')}
        confirmText="Tamam"
        showCancel={false}
      >
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
      </CustomDialog>
    </div>
  );
}
