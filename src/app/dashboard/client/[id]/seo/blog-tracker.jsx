'use client';

import { useState } from 'react';
import { toggleTaskAction, addTaskAction, deleteTaskAction, updateTaskDetailAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Plus, Trash2, Calendar as CalendarIcon, Link as LinkIcon } from 'lucide-react';
import CustomDialog from '@/app/components/custom-dialog';

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const DAYS_OF_WEEK = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function BlogTracker({ clientId, initialTasks, isAdmin }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const now = new Date();
  
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [linkInput, setLinkInput] = useState('');
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  // Calendar Logic
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  async function handleToggle(taskId, currentStatus) {
    setLoading(true);
    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('status', (!currentStatus).toString());
    await toggleTaskAction(formData);
    router.refresh();
    setLoading(false);
  }

  async function handleAddBlog(day) {
    setLoading(true);
    const date = new Date(selectedYear, selectedMonth, day, 12);
    const formData = new FormData();
    formData.append('clientId', clientId);
    formData.append('type', 'BLOG');
    formData.append('date', date.toISOString());
    await addTaskAction(formData);
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

  const openDetailModal = (task) => {
    setActiveTask(task);
    setLinkInput(task.link || '');
    setIsDetailModalOpen(true);
  };

  async function confirmUpdate() {
    setLoading(true);
    const formData = new FormData();
    formData.append('taskId', activeTask.id);
    formData.append('link', linkInput);
    // Note is not edited in Blog modal anymore, we keep the existing one if any
    formData.append('note', activeTask.note || '');
    await updateTaskDetailAction(formData);
    setIsDetailModalOpen(false);
    router.refresh();
    setLoading(false);
  }

  const renderDay = (day) => {
    if (!day) return <div key={Math.random()} style={{ padding: '0.2rem', border: '1px solid transparent' }}></div>;

    const dayTasks = initialTasks.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getDate() === day && tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
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
          backgroundColor: dayTasks.some(t => t.status) ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{day}</span>
          {isAdmin && (
            <button 
              onClick={() => handleAddBlog(day)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '2px' }}
            >
              <Plus size={10} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {dayTasks.map(task => (
            <div key={task.id} style={{ display: 'flex', flexDirection: 'column', padding: '4px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div 
                  onClick={() => openDetailModal(task)}
                  style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    color: task.link ? 'var(--accent-primary)' : 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flex: 1
                  }}
                >
                  <LinkIcon size={10} /> BLOG
                </div>
                <div 
                  onClick={() => handleToggle(task.id, task.status)}
                  style={{ cursor: 'pointer', color: task.status ? '#10b981' : 'var(--text-secondary)' }}
                >
                  {task.status ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span 
                  onClick={() => openDetailModal(task)}
                  style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}
                >
                  {task.link ? 'Link Kayıtlı' : 'Link Ekle...'}
                </span>
                {isAdmin && (
                  <Trash2 size={10} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => setDeleteTaskId(task.id)} />
                )}
              </div>
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
    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
      {/* Month Sidebar */}
      <div style={{ 
        width: '160px', 
        background: 'var(--bg-secondary)', 
        borderRadius: '12px', 
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
        position: 'sticky',
        top: '20px'
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <CalendarIcon size={14} /> AYLAR
        </div>
        <div style={{ padding: '0.5rem' }}>
          {MONTHS.map((month, index) => (
            <div 
              key={month}
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
              {month}
            </div>
          ))}
        </div>
      </div>

      {/* Main Calendar Content */}
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
          {calendarDays.map(day => renderDay(day))}
        </div>
      </div>

      <CustomDialog 
        isOpen={isDetailModalOpen} 
        title="Blog Detayları" 
        onClose={() => setIsDetailModalOpen(false)} 
        onConfirm={confirmUpdate} 
        loading={loading}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">URL Bağlantısını Giriniz</label>
            <input 
              type="url" 
              className="input-field" 
              placeholder="https://..." 
              value={linkInput} 
              onChange={(e) => setLinkInput(e.target.value)} 
              autoFocus
            />
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
          Bu blog kaydını silmek istediğinize emin misiniz?
        </div>
      </CustomDialog>
    </div>
  );
}
