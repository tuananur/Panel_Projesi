'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, X, Plus, Layout } from 'lucide-react';
import { addTaskAction, updateTaskDetailAction } from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';

const PLATFORM_ICONS = {
  Instagram: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  LinkedIn: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
  YouTube: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.4 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
    </svg>
  ),
  Facebook: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  ),
  X: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z" />
    </svg>
  ),
  Pinterest: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C1.124 21.627 0 16.958 0 11.987 0 5.367 5.367 0 11.987 0h.03z"/>
    </svg>
  )
};

export default function WeeklyStats({ clientId, tasks, schedule, platforms }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  
  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');
  const now = new Date();
  
  let displayMonth = monthParam !== null ? parseInt(monthParam) : now.getMonth();
  let displayYear = yearParam !== null ? parseInt(yearParam) : now.getFullYear();

  if (isNaN(displayMonth)) displayMonth = now.getMonth();
  if (isNaN(displayYear)) displayYear = now.getFullYear();

  const MONTH_NAMES = [
    'OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 
    'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'
  ];
  
  // Form States
  const [noteInput, setNoteInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const getTaskStatusMessage = (task) => {
    if (task.status) return 'Tamamlandı';
    const missing = [];
    if (!task.note) missing.push('İçerik');
    if (!task.link) missing.push('Link');
    if (missing.length === 0) return 'Onay Bekliyor';
    return `${missing.join(' & ')} Bekleniyor`;
  };

  const openEditModal = (task) => {
    setActiveTask(task);
    setNoteInput(task.note || '');
    setLinkInput(task.link || '');
    setSelectedPlatform(task.platform);
    setShowModal(true);
  };

  const openAddModal = () => {
    setActiveTask(null);
    setNoteInput('');
    setLinkInput('');
    setSelectedPlatform(null);
    setShowModal(true);
  };


  // --- Aylık hesap ---
  const socialTasksInMonth = (tasks || []).filter(t => {
    if (!t || !t.date) return false;
    try {
      const d = new Date(t.date);
      return t.type === 'SOCIAL' && d.getMonth() === displayMonth && d.getFullYear() === displayYear;
    } catch {
      return false;
    }
  });

  // Calculate total scheduled slots in this month
  let totalScheduled = 0;
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  platforms.forEach(platform => {
    const platformSchedule = Array.isArray(schedule[platform]) ? schedule[platform] : [];
    platformSchedule.forEach(dayName => {
      const targetDayIndex = daysOfWeek.indexOf(dayName);
      if (targetDayIndex === -1) return;
      
      // Count occurrences of targetDayIndex in displayMonth/displayYear
      let count = 0;
      const d = new Date(displayYear, displayMonth, 1);
      while (d.getMonth() === displayMonth) {
        if (d.getDay() === targetDayIndex) count++;
        d.setDate(d.getDate() + 1);
      }
      totalScheduled += count;
    });
  });

  const deletedTasks = socialTasksInMonth.filter(t => t.note === '__DELETED__').length;
  const actualTarget = Math.max(0, totalScheduled - deletedTasks);
  
  const socialCompleted = socialTasksInMonth.filter(t => t.status === true).length;
  const socialTasksCount = socialTasksInMonth.filter(t => t.note !== '__DELETED__').length;
  
  const displayTotal = Math.max(actualTarget, socialTasksCount);
  const socialPending = Math.max(0, displayTotal - socialCompleted);
  const percentage = displayTotal > 0 ? Math.round((socialCompleted / displayTotal) * 100) : 0;

  // --- Bekleyen görevler ---
  // --- Bekleyen görevler ---
  const allPending = (tasks || []).filter(t => t && t.type === 'SOCIAL' && !t.status).sort((a, b) => {
    try {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    } catch {
      return 0;
    }
  });

  const totalBlogs = (tasks || []).filter(t => {
    if (t.type !== 'BLOG') return false;
    const d = new Date(t.date);
    return d.getMonth() === displayMonth && d.getFullYear() === displayYear;
  }).length;

  const handleSave = async () => {
    startTransition(async () => {
      const formData = new FormData();
      
      if (activeTask) {
        formData.append('taskId', activeTask.id);
        formData.append('note', noteInput);
        formData.append('link', linkInput);
        formData.append('platform', selectedPlatform || '');
        await updateTaskDetailAction(formData);
      } else {
        formData.append('clientId', clientId);
        formData.append('type', 'SOCIAL');
        formData.append('date', new Date().toISOString());
        formData.append('platform', selectedPlatform || '');
        formData.append('note', noteInput);
        formData.append('link', linkInput);
        await addTaskAction(formData);
      }
      
      setNoteInput('');
      setLinkInput('');
      setSelectedPlatform(null);
      setActiveTask(null);
      setShowModal(false);
      router.refresh();
    });
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
        <div
          className="card"
          onClick={openAddModal}
          style={{
            padding: '0.6rem 0.8rem',
            flex: 1,
            minWidth: '350px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            cursor: 'pointer',
            borderRadius: '12px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '45px' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{socialCompleted}</span>
            <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>BİTEN</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700 }}>SOSYAL MEDYA BEKLEYEN İÇERİKLER</span>
               <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 800 }}>%{percentage}</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: 'var(--accent-primary)', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '45px' }}>
            <Clock size={16} color="#f59e0b" />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>{socialPending}</span>
            <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>KALAN</span>
          </div>
        </div>

        <div className="card" style={{ 
          padding: '0.6rem 1rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)', 
          background: 'var(--bg-secondary)',
          minWidth: '140px'
        }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.6rem', borderRadius: '10px' }}>
            <Layout size={20} color="var(--accent-primary)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{totalBlogs}</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{MONTH_NAMES[displayMonth]} AYI BLOG</span>
          </div>
        </div>
      </div>

      <CustomDialog
        isOpen={showModal}
        title={activeTask ? "Görev Düzenle" : "Yeni Görev / Not Ekle"}
        onClose={() => setShowModal(false)}
        onConfirm={handleSave}
        loading={isPending}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {allPending.length > 0 && (
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.05)', 
              border: '1px solid rgba(245, 158, 11, 0.1)', 
              borderRadius: '10px', 
              padding: '0.75rem' 
            }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> ŞU AN BEKLEYENLER
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                {allPending.slice(0, 5).map(t => (
                  <div 
                    key={t.id} 
                    onClick={(e) => { e.stopPropagation(); openEditModal(t); }}
                    style={{ 
                      fontSize: '0.75rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      color: 'var(--text-secondary)',
                      padding: '4px 6px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      transition: 'all 0.2s'
                    }}
                    className="pending-item-hover"
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      {t.platform && PLATFORM_ICONS[t.platform]} 
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.platform || 'Not'}</span>
                      <span style={{ opacity: 0.5 }}>|</span>
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>{getTaskStatusMessage(t)}</span>
                    </span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{formatDate(t.date)}</span>
                  </div>
                ))}
                {allPending.length > 3 && (
                  <div style={{ fontSize: '0.65rem', textAlign: 'center', marginTop: '2px', color: 'var(--text-muted)' }}>
                    ...ve {allPending.length - 3} görev daha bekliyor
                  </div>
                )}
              </div>
            </div>
          )}

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
              {['Instagram', 'YouTube', 'Facebook', 'LinkedIn', 'X', 'Pinterest'].map(p => (
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
      <style jsx>{`
        .pending-item-hover:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: var(--accent-primary) !important;
          transform: translateX(4px);
        }
      `}</style>
    </>
  );
}
