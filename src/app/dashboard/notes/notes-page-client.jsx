'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Trash2, Edit2, Clock, CheckCircle2, Circle, StickyNote, Building2, User as UserIcon } from 'lucide-react';
import { addNoteAction, deleteNoteAction, updateNoteAction, toggleNoteStatusAction } from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';

export default function NotesPageClient({ initialNotes, clients, currentUserId }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'client'
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtering notes based on tab and search
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
      return note.clientId && matchesSearch;
    }
  });

  const handleAdd = async (formData) => {
    setLoading(true);
    const result = await addNoteAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsAddModalOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  const handleEdit = async (formData) => {
    setLoading(true);
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
  };

  const handleDelete = async () => {
    setLoading(true);
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
  };

  const handleToggleStatus = async (noteId, currentStatus) => {
    const formData = new FormData();
    formData.append('noteId', noteId);
    formData.append('isDone', (!currentStatus).toString());
    await toggleNoteStatusAction(formData);
    router.refresh();
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
                <tr key={note.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', opacity: note.isDone ? 0.6 : 1 }}>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleToggleStatus(note.id, note.isDone)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: note.isDone ? '#10b981' : 'var(--text-secondary)' }}
                    >
                      {note.isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Clock size={12} />
                        {new Date(note.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(note.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {(note.title || (activeTab === 'client' && note.client)) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {note.title && <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{note.title}</span>}
                          {activeTab === 'client' && note.client && (
                            <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                              {note.client.companyName}
                            </span>
                          )}
                        </div>
                      )}
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', textDecoration: note.isDone ? 'line-through' : 'none' }}>
                        {note.content}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        onClick={() => { setSelectedNote(note); setIsEditModalOpen(true); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedNote(note); setIsDeleteModalOpen(true); }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
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
        showConfirm={false}
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
        showConfirm={false}
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
