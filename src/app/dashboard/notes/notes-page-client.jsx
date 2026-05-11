'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Trash2, Edit2, Clock, CheckCircle2, Circle, StickyNote, Building2, User as UserIcon } from 'lucide-react';
import { addNoteAction, deleteNoteAction, updateNoteAction, toggleNoteStatusAction } from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';
import { useTheme } from '@/app/components/theme-provider';

export default function NotesPageClient({ initialNotes, clients, currentUserId, userRole }) {
  const router = useRouter();
  const { setGlobalLoading } = useTheme();
  
  // Clear notification on mount
  useEffect(() => {
    if (initialNotes.length > 0) {
      const latestOtherNote = initialNotes.find(n => n.userId !== currentUserId);
      if (latestOtherNote) {
        const lastSeen = parseInt(localStorage.getItem('last_seen_note_id') || '0');
        if (latestOtherNote.id > lastSeen) {
          localStorage.setItem('last_seen_note_id', latestOtherNote.id.toString());
          window.dispatchEvent(new Event('storage'));
        }
      }
    }
  }, [initialNotes, currentUserId]);
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'client'
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtering notes based on tab and search
  const clientTabUsers = Array.from(
    new Map(
      initialNotes
        .filter((note) => note.clientId && note.user)
        .map((note) => [note.userId, { id: note.userId, username: note.user.username }])
    ).values()
  );

  const filteredNotes = initialNotes.filter(note => {
    const lowerSearch = search.toLowerCase();
    const createdAt = new Date(note.createdAt);
    const dateStr = createdAt.toLocaleDateString('tr-TR'); // "19.05.2024"
    const monthNames = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];
    const monthName = monthNames[createdAt.getMonth()];
    const day = createdAt.getDate().toString();
    const fullDateText = `${day} ${monthName}`; // "19 mayıs"

    const matchesSearch = 
      (note.title?.toLowerCase().includes(lowerSearch)) ||
      (note.content.toLowerCase().includes(lowerSearch)) ||
      (note.client?.companyName.toLowerCase().includes(lowerSearch)) ||
      (dateStr.includes(lowerSearch)) ||
      (fullDateText.includes(lowerSearch));
    
    if (activeTab === 'general') {
      return !note.clientId && matchesSearch;
    } else {
      const matchesOwner = userRole === 'ADMIN' || note.userId === currentUserId;
      const matchesClient = selectedClientId === 'all' || String(note.clientId) === selectedClientId;
      const matchesDate = !selectedDate || note.createdAt.slice(0, 10) === selectedDate;
      const matchesUser = userRole !== 'ADMIN' || selectedUserId === 'all' || String(note.userId) === selectedUserId;
      return note.clientId && matchesSearch && matchesOwner && matchesClient && matchesDate && matchesUser;
    }
  });

  const handleAdd = async (formData) => {
    if (loading) return;
    setLoading(true);
    setGlobalLoading(true);
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
    await toggleNoteStatusAction(formData);
    router.refresh();
    setLoading(false);
    setGlobalLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Tab Navigasyonu */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('general')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'general' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'general' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Genel Notlar
        </button>
        <button 
          onClick={() => setActiveTab('client')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'client' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'client' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Müşteriye Özel Notlar
        </button>
      </div>

      {/* Arama ve Ekleme */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder={activeTab === 'general' ? "Genel notlarda ara..." : "Müşteri notlarında ara..."}
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

      {activeTab === 'client' && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {userRole === 'ADMIN' && (
            <select
              className="input-field"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="all">Tüm Kullanıcılar</option>
              {clientTabUsers.map((user) => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
          )}

          <select
            className="input-field"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            style={{ minWidth: '220px' }}
          >
            <option value="all">Tüm Müşteriler</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.companyName}</option>
            ))}
          </select>

          <input
            type="date"
            className="input-field"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ minWidth: '170px' }}
          />
        </div>
      )}

      {/* Notlar Listesi (Log Stili Tablo) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', width: '60px' }}>Durum</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', width: '200px' }}>Tarih / Yazılış</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Not Detayı</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', width: '100px', textAlign: 'right' }}>İşlemler</th>
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
                        if (note.userId !== currentUserId && userRole !== 'ADMIN') {
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
                        opacity: (note.userId === currentUserId || userRole === 'ADMIN') ? 1 : 0.4
                      }}
                      title={(note.userId === currentUserId || userRole === 'ADMIN') ? (note.isDone ? "Yapılmadı olarak işaretle" : "Yapıldı olarak işaretle") : "Bu işlemi yapmaya yetkiniz yok."}
                    >
                      {note.isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: note.isDone ? '#10b981' : 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Clock size={12} />
                        {new Date(note.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: note.isDone ? 'rgba(16, 185, 129, 0.7)' : 'var(--text-secondary)' }}>
                        {new Date(note.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {(note.title || (activeTab === 'client' && note.client)) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {note.title && <span style={{ fontWeight: 700, fontSize: '0.85rem', color: note.isDone ? '#10b981' : 'var(--accent-primary)' }}>{note.title}</span>}
                          {activeTab === 'client' && note.client && (
                            <span style={{ 
                              fontSize: '0.7rem', 
                              padding: '1px 6px', 
                              borderRadius: '4px', 
                              background: note.isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                              color: note.isDone ? '#10b981' : 'var(--accent-primary)', 
                              fontWeight: 600 
                            }}>
                              {note.client.companyName}
                            </span>
                          )}
                        </div>
                      )}
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: note.isDone ? '#10b981' : 'var(--text-primary)', 
                        whiteSpace: 'pre-wrap',
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
                          if (note.userId !== currentUserId && userRole !== 'ADMIN') {
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
                          opacity: (note.userId === currentUserId || userRole === 'ADMIN') ? 1 : 0.3
                        }}
                        title={(note.userId !== currentUserId && userRole !== 'ADMIN') ? "Bu işlemi yapmaya yetkiniz yok." : "Düzenle"}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (note.userId !== currentUserId && userRole !== 'ADMIN') {
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
                          opacity: (note.userId === currentUserId || userRole === 'ADMIN') ? 1 : 0.3
                        }}
                        title={(note.userId !== currentUserId && userRole !== 'ADMIN') ? "Bu işlemi yapmaya yetkiniz yok." : "Sil"}
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
                      <p>Henüz not bulunamadı.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modallar (Aynı Kaldı) */}
      <CustomDialog
        isOpen={isAddModalOpen}
        title="Yeni Not Ekle"
        onClose={() => setIsAddModalOpen(false)}
        showButtons={false}
      >
        <form action={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {activeTab === 'client' && (
            <div className="input-group">
              <label className="input-label">Müşteri Seçin</label>
              <select name="clientId" className="input-field" required>
                <option value="">Müşteri Seçiniz...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="input-group">
            <label className="input-label">Başlık</label>
            <input type="text" name="title" className="input-field" placeholder="Not başlığı..." />
          </div>

          <div className="input-group">
            <label className="input-label">Not İçeriği</label>
            <textarea 
              name="content" 
              className="input-field" 
              rows={5} 
              required 
              placeholder="Notunuzu yazın..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)' }}>İptal</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Ekleniyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </CustomDialog>

      <CustomDialog
        isOpen={isEditModalOpen}
        title="Notu Düzenle"
        onClose={() => setIsEditModalOpen(false)}
        showButtons={false}
      >
        <form action={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {selectedNote?.clientId && (
            <div className="input-group">
              <label className="input-label">Müşteri</label>
              <select name="clientId" className="input-field" defaultValue={selectedNote.clientId}>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="input-group">
            <label className="input-label">Başlık</label>
            <input type="text" name="title" className="input-field" defaultValue={selectedNote?.title || ''} />
          </div>

          <div className="input-group">
            <label className="input-label">Not İçeriği</label>
            <textarea 
              name="content" 
              className="input-field" 
              rows={5} 
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

      <CustomDialog
        isOpen={isDeleteModalOpen}
        title="Notu Sil"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        confirmText="Evet, Sil"
        confirmColor="#ef4444"
        loading={loading}
      >
        <p style={{ color: 'var(--text-secondary)' }}>Bu notu kalıcı olarak silmek istediğinizden emin misiniz?</p>
      </CustomDialog>

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
