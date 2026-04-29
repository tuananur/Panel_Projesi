'use client';

import { useState } from 'react';
import { toggleTaskAction, addTaskAction, deleteTaskAction, updateTaskDetailAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Plus, Trash2, Instagram, Linkedin, Youtube, Facebook, Twitter, Play, Link as LinkIcon } from 'lucide-react';
import CustomDialog from '@/app/components/custom-dialog';

const DAYS_OF_WEEK = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const PLATFORMS = ['Instagram', 'YouTube', 'Facebook', 'LinkedIn', 'X', 'TikTok'];

const PLATFORM_ICONS = {
  Instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  LinkedIn: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
  YouTube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.4 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
    </svg>
  ),
  Facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  ),
  X: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
    </svg>
  ),
  TikTok: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
    </svg>
  )
};

export default function SocialCalendar({ clientId, initialTasks, platforms, schedule, socialAccounts, isAdmin }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1));
  const handleToday = () => setCurrentDate(new Date());

  async function handleToggle(taskId, currentStatus) {
    setLoading(true);
    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('status', (!currentStatus).toString());
    await toggleTaskAction(formData);
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteTaskId) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('taskId', deleteTaskId);
    await deleteTaskAction(formData);
    setDeleteTaskId(null);
    router.refresh();
    setLoading(false);
  }

  const openModal = (day, platform = null, task = null) => {
    setActiveDay(day);
    setSelectedPlatform(platform || task?.platform || null);
    setActiveTask(task);
    setNoteInput(task?.note || '');
    setLinkInput(task?.link || '');
    setIsModalOpen(true);
  };

  async function handleSave() {
    setLoading(true);
    const platformToSave = selectedPlatform || '';
    
    if (activeTask) {
      const formData = new FormData();
      formData.append('taskId', activeTask.id);
      formData.append('note', noteInput);
      formData.append('link', linkInput);
      formData.append('platform', platformToSave);
      await updateTaskDetailAction(formData);
    } else {
      const date = new Date(year, month, activeDay, 12);
      const formData = new FormData();
      formData.append('clientId', clientId);
      formData.append('type', 'SOCIAL');
      formData.append('date', date.toISOString());
      formData.append('platform', platformToSave);
      formData.append('note', noteInput);
      formData.append('link', linkInput);
      await addTaskAction(formData);
    }
    setIsModalOpen(false);
    router.refresh();
    setLoading(false);
  }

  const renderDay = (day) => {
    if (!day) return <div key={Math.random()} style={{ padding: '0.2rem', border: '1px solid transparent' }}></div>;

    const date = new Date(year, month, day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayTasks = initialTasks.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getDate() === day && tDate.getMonth() === month && tDate.getFullYear() === year;
    });

    const scheduledOnly = PLATFORMS.filter(p => {
      const isScheduled = (schedule[p] || []).includes(dayName);
      const hasTask = dayTasks.some(t => t.platform === p);
      return isScheduled && !hasTask;
    });

    return (
      <div 
        key={day} 
        style={{ 
          padding: '0.4rem', 
          border: '1px solid var(--border-color)', 
          minHeight: '90px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          backgroundColor: 'transparent',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{day}</span>
          {isAdmin && (
            <button 
              onClick={() => openModal(day)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '2px' }}
            >
              <Plus size={10} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {dayTasks.map(task => (
            <div 
              key={task.id} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                padding: '4px 6px', 
                borderRadius: '4px', 
                background: task.status ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.05)', 
                border: '1px solid',
                borderColor: task.status ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div 
                  onClick={() => openModal(day, task.platform, task)}
                  style={{ 
                    fontSize: '0.6rem', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    color: task.status ? '#10b981' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flex: 1
                  }}
                >
                  {task.platform ? PLATFORM_ICONS[task.platform] : <Plus size={12} />}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.platform || 'Not'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {task.link && (
                    <a 
                      href={task.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Linki Aç"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <LinkIcon size={12} />
                    </a>
                  )}
                  <div 
                    onClick={() => handleToggle(task.id, task.status)}
                    style={{ cursor: 'pointer', color: task.status ? '#10b981' : 'var(--text-secondary)' }}
                  >
                    {task.status ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  </div>
                </div>
              </div>
              
              {(task.note || task.link) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                  <span 
                    onClick={() => openModal(day, task.platform, task)}
                    style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}
                  >
                    {task.note || 'Link Kayıtlı'}
                  </span>
                  {isAdmin && (
                    <Trash2 size={8} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => setDeleteTaskId(task.id)} />
                  )}
                </div>
              )}
            </div>
          ))}

          {scheduledOnly.map(p => (
            <div 
              key={p} 
              onClick={() => openModal(day, p)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                padding: '4px 6px', 
                borderRadius: '4px', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                opacity: 0.5
              }}
            >
              <Circle size={10} color="var(--text-secondary)" />
              <span style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const calendarDays = [];
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
          {currentDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="calendar-controls">
          <button className="btn" onClick={handlePrevMonth} style={{ padding: '0.25rem' }}><ChevronLeft size={16} /></button>
          <button className="btn" onClick={handleToday} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Bugün</button>
          <button className="btn" onClick={handleNextMonth} style={{ padding: '0.25rem' }}><ChevronRight size={16} /></button>
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
        {calendarDays.map(day => renderDay(day))}
      </div>

      <CustomDialog 
        isOpen={isModalOpen} 
        title={activeTask ? 'Görev Düzenle' : 'Yeni Görev / Not Ekle'} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleSave}
        loading={loading}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Özel İçerik</label>
            <textarea 
              className="input-field" 
              placeholder="İçerik detaylarını buraya yazın..." 
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">URL Bağlantısını Giriniz</label>
            <input 
              type="url" 
              className="input-field" 
              placeholder="https://..." 
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Platform Seçin (Opsiyonel)</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPlatform(selectedPlatform === p ? null : p)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: selectedPlatform === p ? 'var(--accent-primary)' : 'var(--border-color)',
                    backgroundColor: selectedPlatform === p ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                    color: selectedPlatform === p ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  {PLATFORM_ICONS[p]}
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CustomDialog>

      <CustomDialog
        isOpen={!!deleteTaskId}
        title="Silme Onayı"
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDelete}
        confirmText="Sil"
        loading={loading}
      >
        <div style={{ color: 'var(--text-secondary)' }}>
          Bu görevi silmek istediğinize emin misiniz?
        </div>
      </CustomDialog>
    </div>
  );
}
