'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Trash2, Edit2, Clock, CheckCircle2, Circle, User as UserIcon, StickyNote } from 'lucide-react';
import { addNoteAction, deleteNoteAction, updateNoteAction, toggleNoteStatusAction } from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';
import { useTheme } from '@/app/components/theme-provider';

const DEFAULT_LABELS = {
  addButton: 'Yeni Ekle',
  addModalTitle: 'Yeni Yapılacak Ekle',
  editModalTitle: 'Yapılacağı Düzenle',
  searchPlaceholder: 'Yapılacaklarda ara...',
  contentPlaceholder: 'Açıklama (opsiyonel)...',
  emptyText: 'Henüz yapılacak eklenmemiş.',
};

export default function NotesClient({ clientId, notes, currentUserId, userRole, debugSnapshot, category = 'TASK', labels = DEFAULT_LABELS }) {
  const router = useRouter();
  const { setGlobalLoading } = useTheme();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const defaultDateValue = activeDay
    ? `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(activeDay).padStart(2, '0')}`
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const DAYS_OF_WEEK = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  useEffect(() => {
    if (debugSnapshot) {
      console.log('[ClientNotes DEBUG client]', debugSnapshot);
    }
  }, [debugSnapshot]);

  const noteList = Array.isArray(notes) ? notes : [];

  const filteredNotes = noteList.filter(note => {
    const lowerSearch = search.toLowerCase();
    const createdAt = new Date(note.createdAt);
    const dateStr = createdAt.toLocaleDateString('tr-TR'); 
    const monthNames = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];
    const monthName = monthNames[createdAt.getMonth()];
    const day = createdAt.getDate().toString();
    const fullDateText = `${day} ${monthName}`;

    const contentLower = (note.content ?? '').toLowerCase();
    const userLower = (note.user?.username ?? '').toLowerCase();

    return (
      (note.title?.toLowerCase().includes(lowerSearch)) ||
      contentLower.includes(lowerSearch) ||
      userLower.includes(lowerSearch) ||
      (dateStr.includes(lowerSearch)) ||
      (fullDateText.includes(lowerSearch))
    );
  });

  const handleAdd = async (formData) => {
    if (loading) return;
    setLoading(true);
    setGlobalLoading(true);
    formData.append('clientId', clientId);
    formData.append('category', category);
    const selectedDate = formData.get('date');
    if (selectedDate) {
      const [year, month, day] = selectedDate.toString().split('-').map(Number);
      const dateWithCurrentTime = new Date();
      dateWithCurrentTime.setFullYear(year, month - 1, day);
      formData.set('createdAt', dateWithCurrentTime.toISOString());
    } else {
      formData.set('createdAt', new Date().toISOString());
    }
    formData.delete('assigneeUserId');
    const result = await addNoteAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsAddModalOpen(false);
      setActiveDay(null);
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
    formData.delete('assigneeUserId');
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
      {debugSnapshot && (
        <details
          open
          style={{
            border: '1px solid #f59e0b',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            background: 'rgba(0,0,0,0.25)',
            fontSize: '0.7rem',
          }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#f59e0b', marginBottom: '0.5rem' }}>
            DEBUG snapshot (sunucudan) — kapatmak için URL’den ?debug=1 kaldır
          </summary>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            İstemci konsolunda da basıldı: <code>[ClientNotes DEBUG client]</code>
          </p>
          <pre
            style={{
              margin: 0,
              overflow: 'auto',
              maxHeight: '320px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'var(--text-primary)',
            }}
          >
            {(() => {
              try {
                const text = JSON.stringify(debugSnapshot, null, 2);
                return text.length > 24000 ? `${text.slice(0, 24000)}\n… (truncated)` : text;
              } catch (e) {
                return String(e);
              }
            })()}
          </pre>
        </details>
      )}
      {/* Üst Bar: Arama ve Ekleme */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder={labels.searchPlaceholder || DEFAULT_LABELS.searchPlaceholder} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.75rem', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)', marginRight: '0.5rem' }}>
            <button 
              onClick={() => setViewMode('list')}
              style={{ 
                padding: '0.4rem 0.75rem', 
                fontSize: '0.75rem', 
                borderRadius: '6px', 
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'list' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              Liste
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              style={{ 
                padding: '0.4rem 0.75rem', 
                fontSize: '0.75rem', 
                borderRadius: '6px', 
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'calendar' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'calendar' ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              Takvim
            </button>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
            style={{ gap: '0.5rem' }}
          >
            <Plus size={18} /> {labels.addButton || DEFAULT_LABELS.addButton}
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        /* Notlar Listesi (Log Stili) */
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', width: '60px', textAlign: 'center' }}>DURUM</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', width: '25%' }}>Yazan / Tarih</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Yapılacak</th>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                          <UserIcon size={12} style={{ opacity: 0.7, color: note.isDone ? '#10b981' : 'inherit' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: note.isDone ? '#10b981' : 'inherit' }}>
                            {note.user?.username ?? '—'}
                          </div>
                          {note.createdByUser && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              ({note.createdByUser.username})
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: note.isDone ? 'rgba(16, 185, 129, 0.7)' : 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        <Clock size={12} />
                        {new Date(note.createdAt).toLocaleDateString('tr-TR')} {new Date(note.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })}
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
                        {note.content ?? ''}
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
                      <p>{search ? 'Arama sonucu bulunamadı.' : (labels.emptyText || DEFAULT_LABELS.emptyText)}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        /* Takvim Görünümü */
        <div className="responsive-flex" style={{ alignItems: 'stretch' }}>
          {/* Sidebar */}
          <div style={{ 
            width: '160px', 
            background: 'var(--bg-secondary)', 
            borderRadius: '12px', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            height: 'fit-content',
            flexShrink: 0
          }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              AYLAR
            </div>
            <div style={{ padding: '0.5rem' }}>
              {MONTHS.map((m, index) => (
                <div 
                  key={m}
                  onClick={() => setSelectedMonth(index)}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    marginBottom: '2px',
                    transition: 'all 0.2s',
                    backgroundColor: selectedMonth === index ? 'var(--accent-primary)' : 'transparent',
                    color: selectedMonth === index ? 'white' : 'var(--text-secondary)',
                    fontWeight: selectedMonth === index ? 600 : 400
                  }}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>

          {/* Takvim İçeriği */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                {MONTHS[selectedMonth]} {selectedYear}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn" onClick={() => setSelectedYear(selectedYear - 1)} style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>{selectedYear - 1}</button>
                <button className="btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: 'var(--accent-primary)', color: 'white' }}>{selectedYear}</button>
                <button className="btn" onClick={() => setSelectedYear(selectedYear + 1)} style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>{selectedYear + 1}</button>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '1px', 
              background: 'var(--border-color)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '10px', 
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)'
            }}>
              {DAYS_OF_WEEK.map(day => (
                <div key={day} style={{ padding: '0.75rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {day}
                </div>
              ))}
              {(() => {
                const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
                const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
                const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
                const calendarDays = [];
                for (let i = 0; i < startOffset; i++) calendarDays.push(null);
                for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

                return calendarDays.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} style={{ padding: '0.2rem', background: 'rgba(255,255,255,0.01)' }}></div>;

                  const dayNotes = noteList.filter(n => {
                    const d = new Date(n.createdAt);
                    return d.getDate() === day && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
                  });

                  const isToday = day === now.getDate() && selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

                  return (
                    <div 
                      key={day} 
                      onClick={(e) => {
                        if (e.target === e.currentTarget || e.target.tagName === 'SPAN') {
                          setActiveDay(day);
                          setIsAddModalOpen(true);
                        }
                      }}
                      style={{ 
                        padding: '0.5rem', 
                        border: isToday ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', 
                        minHeight: '110px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.3rem',
                        backgroundColor: dayNotes.length > 0 ? 'rgba(59, 130, 246, 0.02)' : 'transparent',
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 800, 
                        color: isToday ? '#fff' : 'var(--text-secondary)',
                        backgroundColor: isToday ? 'var(--accent-primary)' : 'transparent',
                        width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'
                      }}>{day}</span>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflowY: 'auto', paddingRight: '2px' }}>
                        {dayNotes.map(note => (
                          <div 
                            key={note.id} 
                            onClick={() => { setSelectedNote(note); setIsEditModalOpen(true); }}
                            style={{ 
                              fontSize: '0.6rem', 
                              padding: '4px 6px', 
                              borderRadius: '4px', 
                              background: note.isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                              color: note.isDone ? '#10b981' : 'var(--text-primary)',
                              border: '1px solid',
                              borderColor: note.isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                              cursor: 'pointer',
                              fontWeight: 600,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1px',
                            }}
                            title={(note.title ?? '') || (note.content ?? '') || ''}
                          >
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {note.isDone && <CheckCircle2 size={8} style={{ marginRight: '3px', display: 'inline' }} />}
                              {(() => {
                                if (note.title) return note.title;
                                const c = note.content ?? '';
                                return c.length > 15 ? `${c.slice(0, 15)}...` : (c || '…');
                              })()}
                            </div>
                            <div style={{ fontSize: '0.55rem', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {note.user?.username ?? ''}
                              {note.createdByUser && (
                                <span style={{ opacity: 0.7 }}> ({note.createdByUser.username})</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Ekleme Modalı */}
      <CustomDialog
        isOpen={isAddModalOpen}
        title={labels.addModalTitle || DEFAULT_LABELS.addModalTitle}
        onClose={() => {
          setIsAddModalOpen(false);
          setActiveDay(null);
        }}
        showButtons={false}
      >
        <form action={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {activeDay && (
            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textAlign: 'center' }}>
              Tarih: {activeDay} {MONTHS[selectedMonth]} {selectedYear}
            </div>
          )}
          <div className="input-group">
            <label className="input-label">Başlık *</label>
            <input type="text" name="title" className="input-field" placeholder="Örn: İçerik metnini kontrol et" required />
          </div>
          <div className="input-group">
            <label className="input-label">Tarih <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(boş bırakılırsa bugün)</span></label>
            <input type="date" name="date" className="input-field" defaultValue={defaultDateValue} />
          </div>
          <div className="input-group">
            <label className="input-label">Açıklama <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(opsiyonel)</span></label>
            <textarea 
              name="content" 
              className="input-field" 
              rows={6} 
              placeholder={labels.contentPlaceholder || DEFAULT_LABELS.contentPlaceholder}
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

      {/* Düzenleme Modalı */}
      <CustomDialog
        isOpen={isEditModalOpen}
        title={labels.editModalTitle || DEFAULT_LABELS.editModalTitle}
        onClose={() => setIsEditModalOpen(false)}
        showButtons={false}
      >
        <form action={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input type="hidden" name="clientId" value={clientId} />
          <div className="input-group">
            <label className="input-label">Başlık *</label>
            <input type="text" name="title" className="input-field" defaultValue={selectedNote?.title || ''} required />
          </div>
          <div className="input-group">
            <label className="input-label">Açıklama <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(opsiyonel)</span></label>
            <textarea 
              name="content" 
              className="input-field" 
              rows={6} 
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
        title="Yapılacağı Sil"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        confirmText="Evet, Sil"
        confirmColor="#ef4444"
        loading={loading}
      >
        <p style={{ color: 'var(--text-secondary)' }}>Bu yapılacağı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
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
