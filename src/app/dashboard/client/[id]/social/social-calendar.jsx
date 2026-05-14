'use client';

import { useState, useTransition, useEffect } from 'react';
import { toggleTaskAction, addTaskAction, deleteTaskAction, updateTaskDetailAction, removeScheduleDayAction, bulkDeleteDayAction } from '@/app/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Plus, Trash2, Play, Link as LinkIcon, Calendar as CalendarIcon } from 'lucide-react';
import CustomDialog from '@/app/components/custom-dialog';
import { SPECIAL_DAYS } from '@/lib/holidays';
import { useTheme } from '@/app/components/theme-provider';

const DAYS_OF_WEEK = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const PLATFORMS = ['Instagram', 'YouTube', 'Facebook', 'LinkedIn', 'X', 'Pinterest'];

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z" />
    </svg>
  ),
  Pinterest: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C1.124 21.627 0 16.958 0 11.987 0 5.367 5.367 0 11.987 0h.03z"/>
    </svg>
  ),
  Özel: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  )
};

export default function SocialCalendar({ clientId, initialTasks, platforms, schedule, socialAccounts, isAdmin }) {
  const router = useRouter();
  const { setGlobalLoading } = useTheme();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const now = new Date();
  
  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');

  const [selectedMonth, setSelectedMonth] = useState(monthParam !== null ? parseInt(monthParam) : now.getMonth());
  const [selectedYear, setSelectedYear] = useState(yearParam !== null ? parseInt(yearParam) : now.getFullYear());

  const updateUrl = (month, year) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', month);
    params.set('year', year);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleMonthChange = (index) => {
    setSelectedMonth(index);
    updateUrl(index, selectedYear);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    updateUrl(selectedMonth, year);
  };

  const taskIdParam = searchParams.get('taskId');

  const getTaskStatusMessage = (task) => {
    if (task.status) return 'Tamamlandı';
    const missing = [];
    if (!task.note) missing.push('İçerik');
    if (!task.link) missing.push('Link');
    if (missing.length === 0) return 'Onay Bekliyor';
    return `${missing.join(' & ')} Eksik`;
  };
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [taskStatus, setTaskStatus] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [scheduleDeleteData, setScheduleDeleteData] = useState(null);
  const [bulkDeleteData, setBulkDeleteData] = useState(null);
  const [singleGhostDeleteData, setSingleGhostDeleteData] = useState(null);

  useEffect(() => {
    if (taskIdParam && initialTasks.length > 0) {
      const task = initialTasks.find(t => t.id.toString() === taskIdParam);
      if (task) {
        const tDate = new Date(task.date);
        setSelectedMonth(tDate.getMonth());
        setSelectedYear(tDate.getFullYear());
        
        // Use timeout to ensure state updates (month/year) are processed if needed
        setTimeout(() => {
          openModal(tDate.getDate(), task.platform, task);
        }, 100);
      }
    }
  }, [taskIdParam, initialTasks]);

  const year = selectedYear;
  const month = selectedMonth;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };
  
  const handleToday = () => {
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };

  async function handleToggle(taskId, currentStatus) {
    setGlobalLoading(true);
    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('status', (!currentStatus).toString());
    await toggleTaskAction(formData);
    router.refresh();
    setGlobalLoading(false);
  }

  async function handleDelete() {
    if (!deleteTaskId) return;
    setGlobalLoading(true);
    const formData = new FormData();
    formData.append('taskId', deleteTaskId);
    await deleteTaskAction(formData);
    setDeleteTaskId(null);
    router.refresh();
    setGlobalLoading(false);
  }

  async function handleRemoveFromSchedule() {
    if (!scheduleDeleteData) return;
    setGlobalLoading(true);
    const formData = new FormData();
    formData.append('clientId', clientId);
    formData.append('platform', scheduleDeleteData.platform);
    formData.append('dayName', scheduleDeleteData.dayName);
    await removeScheduleDayAction(formData);
    setScheduleDeleteData(null);
    router.refresh();
    setGlobalLoading(false);
  }

  async function handleBulkDelete() {
    if (!bulkDeleteData) return;
    setGlobalLoading(true);
    const formData = new FormData();
    formData.append('clientId', clientId);
    formData.append('date', bulkDeleteData.date.toISOString());
    formData.append('platformsToHide', JSON.stringify(bulkDeleteData.platformsToHide));
    await bulkDeleteDayAction(formData);
    setBulkDeleteData(null);
    router.refresh();
    setGlobalLoading(false);
  }

  async function handleSingleGhostDelete() {
    if (!singleGhostDeleteData) return;
    setGlobalLoading(true);
    const formData = new FormData();
    formData.append('clientId', clientId);
    formData.append('type', 'SOCIAL');
    formData.append('date', singleGhostDeleteData.date.toISOString());
    formData.append('platform', singleGhostDeleteData.platform);
    formData.append('note', '__DELETED__');
    formData.append('status', 'false');
    await addTaskAction(formData);
    setSingleGhostDeleteData(null);
    router.refresh();
    setGlobalLoading(false);
  }

  const openModal = (day, platform = null, task = null) => {
    setActiveDay(day);
    if (task) {
      setSelectedPlatforms([task.platform || '']);
      setTaskStatus(task.status);
    } else if (platform) {
      setSelectedPlatforms([platform]);
      setTaskStatus(false);
    } else {
      setSelectedPlatforms([]);
      setTaskStatus(false);
    }
    setActiveTask(task);
    setNoteInput(task?.note || '');
    setLinkInput(task?.link || '');
    setIsModalOpen(true);
  };

  async function handleSave() {
    setGlobalLoading(true);
    if (activeTask) {
      const formData = new FormData();
      formData.append('taskId', activeTask.id);
      formData.append('note', noteInput);
      formData.append('link', linkInput);
      formData.append('status', taskStatus.toString());
      formData.append('platform', selectedPlatforms[0] || '');
      await updateTaskDetailAction(formData);
    } else {
      const date = new Date(year, month, activeDay, 12);
      const platformsToCreate = selectedPlatforms.length > 0 ? selectedPlatforms : [''];
      
      for (const p of platformsToCreate) {
        const formData = new FormData();
        formData.append('clientId', clientId);
        formData.append('type', 'SOCIAL');
        formData.append('date', date.toISOString());
        formData.append('platform', p);
        formData.append('note', noteInput);
        formData.append('link', linkInput);
        formData.append('status', taskStatus.toString());
        await addTaskAction(formData);
      }
    }
    setIsModalOpen(false);
    router.refresh();
    setGlobalLoading(false);
  }

  const renderDay = (day) => {
    if (!day) return <div key={Math.random()} style={{ padding: '0.2rem', border: '1px solid transparent' }}></div>;

    const date = new Date(year, month, day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const targetDateStr = new Date(year, month, day).toLocaleDateString('en-CA'); // YYYY-MM-DD
    const dayTasks = initialTasks.filter(t => {
      try {
        const tDate = new Date(t.date);
        if (isNaN(tDate.getTime())) return false;
        const isCorrectDate = tDate.toLocaleDateString('en-CA') === targetDateStr;
        if (!isCorrectDate) return false;
        
        // If task has a platform, it must be in the active platforms list from settings
        if (t.platform && !platforms.includes(t.platform)) return false;

        // Hide manually deleted tasks
        if (t.note === '__DELETED__') return false;
        
        return true;
      } catch {
        return false;
      }
    });

    const scheduledOnly = PLATFORMS.filter(p => {
      const isScheduled = (schedule[p] || []).includes(dayName);
      // Check if any task (including __DELETED__ ones) exists for this day and platform
      const hasAnyTask = initialTasks.some(t => {
        try {
          const tDate = new Date(t.date);
          if (isNaN(tDate.getTime())) return false;
          return tDate.toLocaleDateString('en-CA') === targetDateStr && t.platform === p;
        } catch {
          return false;
        }
      });
      return isScheduled && !hasAnyTask;
    });

    const highlightDay = searchParams.get('highlight');
    const isActuallyHighlighted = highlightDay && parseInt(highlightDay) === day;
    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${monthStr}-${dayStr}`;
    const specialDayName = SPECIAL_DAYS[dateKey];

    return (
      <div 
        key={day} 
        className={isActuallyHighlighted ? 'search-highlight' : ''}
        style={{ 
          padding: '0.4rem', 
          border: isActuallyHighlighted ? '2px solid var(--accent-primary)' : (isToday ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)'), 
          minHeight: '90px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          backgroundColor: isActuallyHighlighted ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            color: isToday ? '#fff' : 'var(--text-secondary)',
            backgroundColor: isToday ? 'var(--accent-primary)' : 'transparent',
            width: '20px',
            height: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}>
            {day}
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Plus 
              size={14} 
              style={{ cursor: 'pointer', color: 'var(--accent-primary)' }} 
              onClick={() => openModal(day)} 
            />
          </div>
        </div>

        {specialDayName && (
          <div style={{ 
            fontSize: '0.6rem', 
            fontWeight: 600, 
            color: '#ef4444', 
            background: 'rgba(239, 68, 68, 0.15)', 
            padding: '3px 5px', 
            borderRadius: '4px',
            marginTop: '3px',
            marginBottom: '3px',
            display: 'inline-block',
            width: 'fit-content',
            lineHeight: '1.2'
          }} title={specialDayName}>
            {specialDayName}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {dayTasks.map(task => (
            <div 
              key={task.id} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                padding: '4px 6px', 
                borderRadius: '4px', 
                background: task.status ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)', 
                border: '1px solid',
                borderColor: task.status ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div 
                  onClick={() => openModal(day, task.platform, task)}
                  style={{ 
                    fontSize: '0.6rem', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    color: task.status ? '#10b981' : '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flex: 1
                  }}
                >
                  {task.platform ? PLATFORM_ICONS[task.platform] : PLATFORM_ICONS['Özel']}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.platform || (task.note ? (task.note.length > 15 ? task.note.substring(0, 15) + '...' : task.note) : 'Not')}
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
                    style={{ cursor: 'pointer', color: task.status ? '#10b981' : '#f59e0b' }}
                  >
                    {task.status ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  </div>
                </div>
              </div>
              
              {(task.note || task.link || !task.status) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', gap: '4px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, overflow: 'hidden' }}>
                    {!task.status && (
                      <span style={{ fontSize: '0.45rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>
                        {getTaskStatusMessage(task)}
                      </span>
                    )}
                    {task.note && (
                      <span 
                        onClick={() => openModal(day, task.platform, task)}
                        style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}
                      >
                        {task.note}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {scheduledOnly.map(p => (
            <div 
              key={p} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '4px 6px', 
                borderRadius: '4px', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)',
                opacity: 0.8
              }}
              className="ghost-task-hover"
            >
              <div 
                onClick={() => openModal(day, p)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', flex: 1 }}
              >
                <Circle size={10} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{p}</span>
              </div>
              <Trash2 
                size={11} 
                style={{ cursor: 'pointer', color: '#ef4444' }} 
                onClick={(e) => {
                  e.stopPropagation();
                  const date = new Date(year, month, day, 12);
                  setSingleGhostDeleteData({ platform: p, date });
                }}
                title="Sadece Bugün İçin Kaldır"
              />
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
    <div className="responsive-flex" style={{ marginTop: '0.5rem', alignItems: 'stretch' }}>
      {/* Month Sidebar */}
      <div className="month-sidebar" style={{ 
        width: '160px', 
        background: 'var(--bg-secondary)', 
        borderRadius: '12px', 
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
        position: 'sticky',
        top: '20px',
        flexShrink: 0
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <CalendarIcon size={14} /> AYLAR
        </div>
        <div style={{ padding: '0.5rem' }}>
          {MONTHS.map((m, index) => (
            <div 
              key={m}
              onClick={() => handleMonthChange(index)}
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="calendar-header">
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
            {MONTHS[selectedMonth]} {selectedYear}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={() => handleYearChange(selectedYear - 1)} style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>{selectedYear - 1}</button>
            <button className="btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: 'var(--accent-primary)', color: 'white' }}>{selectedYear}</button>
            <button className="btn" onClick={() => handleYearChange(selectedYear + 1)} style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>{selectedYear + 1}</button>
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
        isOpen={isModalOpen} 
        title={activeTask ? 'Görev Düzenle' : 'Yeni Görev / Not Ekle'} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleSave}
        loading={isPending}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Platform Seçin (Opsiyonel)</label>
              {!activeTask && (
                <button 
                  type="button"
                  onClick={() => {
                    if (selectedPlatforms.length === PLATFORMS.length) {
                      setSelectedPlatforms([]);
                    } else {
                      setSelectedPlatforms([...PLATFORMS]);
                    }
                  }}
                  style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--accent-primary)', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {selectedPlatforms.length === PLATFORMS.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    if (activeTask) {
                      setSelectedPlatforms([p]);
                    } else {
                      if (selectedPlatforms.includes(p)) {
                        setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
                      } else {
                        setSelectedPlatforms([...selectedPlatforms, p]);
                      }
                    }
                  }}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: selectedPlatforms.includes(p) ? 'var(--accent-primary)' : 'var(--border-color)',
                    backgroundColor: selectedPlatforms.includes(p) ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                    color: selectedPlatforms.includes(p) ? 'var(--accent-primary)' : 'var(--text-secondary)',
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
              {!activeTask && (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPlatforms.includes('')) {
                      setSelectedPlatforms(selectedPlatforms.filter(item => item !== ''));
                    } else {
                      setSelectedPlatforms([...selectedPlatforms, '']);
                    }
                  }}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: selectedPlatforms.includes('') ? 'var(--accent-primary)' : 'var(--border-color)',
                    backgroundColor: selectedPlatforms.includes('') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                    color: selectedPlatforms.includes('') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  {PLATFORM_ICONS['Özel']}
                  Özel
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Durum Seçin</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button"
                  onClick={() => setTaskStatus(false)}
                  style={{ 
                    flex: 1,
                    background: !taskStatus ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.02)',
                    color: !taskStatus ? '#f59e0b' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: !taskStatus ? '#f59e0b' : 'var(--border-color)',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Circle size={14} /> Bekliyor
                </button>
                <button 
                  type="button"
                  onClick={() => setTaskStatus(true)}
                  style={{ 
                    flex: 1,
                    background: taskStatus ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                    color: taskStatus ? '#10b981' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: taskStatus ? '#10b981' : 'var(--border-color)',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <CheckCircle2 size={14} /> Tamamlandı
                </button>
              </div>
            </div>
          </div>
          
          {activeTask && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button 
                type="button"
                onClick={() => setDeleteTaskId(activeTask.id)}
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}
                title="Görevi Sil"
              >
                <Trash2 size={16} /> Görevi Sil
              </button>
            </div>
          )}
        </div>
      </CustomDialog>

      <CustomDialog
        isOpen={!!deleteTaskId}
        title="Silme Onayı"
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDelete}
        confirmText="Sil"
        loading={isPending}
      >
        <div style={{ color: 'var(--text-secondary)' }}>
          Bu görevi silmek istediğinize emin misiniz?
        </div>
      </CustomDialog>
      <CustomDialog
        isOpen={!!scheduleDeleteData}
        title="Plandan Kaldırma Onayı"
        onClose={() => setScheduleDeleteData(null)}
        onConfirm={handleRemoveFromSchedule}
        confirmText="Plandan Kaldır"
        loading={isPending}
      >
        <div style={{ color: 'var(--text-secondary)' }}>
          <strong>{scheduleDeleteData?.platform}</strong> platformunu tüm <strong>{scheduleDeleteData?.displayDayName}</strong> günlerinden kaldırmak istediğinize emin misiniz?
        </div>
      </CustomDialog>
      <CustomDialog
        isOpen={!!bulkDeleteData}
        title="Toplu Silme Onayı"
        onClose={() => setBulkDeleteData(null)}
        onConfirm={handleBulkDelete}
        confirmText="Günü Temizle"
        loading={isPending}
      >
        <div style={{ color: 'var(--text-secondary)' }}>
          <strong>{bulkDeleteData?.dateStr}</strong> tarihindeki TÜM görevleri temizlemek istediğinize emin misiniz?
        </div>
      </CustomDialog>

      <CustomDialog
        isOpen={!!singleGhostDeleteData}
        title="Görevi Kaldırma Onayı"
        onClose={() => setSingleGhostDeleteData(null)}
        onConfirm={handleSingleGhostDelete}
        confirmText="Sadece Bugün İçin Kaldır"
        loading={isPending}
      >
        <div style={{ color: 'var(--text-secondary)' }}>
          <strong>{singleGhostDeleteData?.platform}</strong> platformunu sadece bu gün için kaldırmak istediğinize emin misiniz?
        </div>
      </CustomDialog>
    </div>
  );
}
