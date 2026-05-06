'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, TrendingUp, CheckCircle2, Clock, Play, 
  Link as LinkIcon, Edit3, Trash2, CheckCircle, Circle, 
  ChevronRight, BookOpen, X, Calendar as CalendarIcon, ExternalLink, BarChart
} from 'lucide-react';
import { toggleTaskAction, updateTaskDetailAction, deleteTaskAction } from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';
import { SPECIAL_DAYS } from '@/lib/holidays';

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
  TikTok: <Play size={14} />,
  Özel: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  )
};

export default function StatsContent({ client }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTask, setActiveTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [taskStatus, setTaskStatus] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const turkishMonths = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const currentMonthName = turkishMonths[new Date().getMonth()];

  const getWeekOfMonth = (date) => {
    const d = new Date(date);
    const firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const day = firstDayOfMonth.getDay();
    const adjDay = day === 0 ? 6 : day - 1; // Monday = 0
    return Math.ceil((d.getDate() + adjDay) / 7);
  };

  const currentMonthBlogs = (client.tasks || []).filter(t => {
    if (t.type !== 'BLOG') return false;
    const d = new Date(t.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const blogsByWeek = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  currentMonthBlogs.forEach(blog => {
    const week = getWeekOfMonth(new Date(blog.date));
    if (blogsByWeek[week]) blogsByWeek[week].push(blog);
  });

  const PLATFORMS_LIST = ['Instagram', 'YouTube', 'Facebook', 'LinkedIn', 'X', 'TikTok'];

  const totalTasks = (client?.tasks || []).length;
  const completedTasks = (client?.tasks || []).filter(t => t.status);
  const pendingTasks = (client?.tasks || []).filter(t => !t.status);
  const successRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const now = new Date();
  const currentMonthTasks = client.tasks.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const completedThisMonth = currentMonthTasks.filter(t => t.status).length;

  const platformStats = {};
  const specialTasksStats = [];
  
  const socialGrid = {}; 
  const turkishDaysShort = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  
  let activePlatforms = [];
  try {
    const accounts = JSON.parse(client?.socialAccounts || '{}');
    const settingsPlatforms = Object.keys(accounts).filter(p => accounts[p] && accounts[p].trim() !== '');
    
    // Get platforms that have tasks in the current month
    const taskPlatforms = (client?.tasks || []).filter(t => {
      if (t.type !== 'SOCIAL') return false;
      const d = new Date(t.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).map(t => t.platform);
    
    // Combine and unique
    activePlatforms = [...new Set([...settingsPlatforms, ...taskPlatforms])].filter(Boolean);
  } catch (e) {
    activePlatforms = ['X', 'Instagram', 'TikTok', 'YouTube']; 
  }
  
  if (activePlatforms.length === 0) {
    activePlatforms = ['X', 'Instagram', 'TikTok', 'YouTube'];
  }

  (client?.tasks || []).filter(t => {
    if (t.type !== 'SOCIAL') return false;
    const d = new Date(t.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).forEach(t => {
    const d = new Date(t.date);
    const week = getWeekOfMonth(d);
    const dayName = turkishDaysShort[d.getDay()];
    
    if (!socialGrid[week]) socialGrid[week] = {};
    if (!socialGrid[week][dayName]) socialGrid[week][dayName] = {};
    
    socialGrid[week][dayName][t.platform] = t.status;
  });

  const accounts = JSON.parse(client?.socialAccounts || '{}');
  const activeSettingsPlatforms = Object.keys(accounts).filter(p => accounts[p] && accounts[p].trim() !== '');

  // Initialize with 0 so they always show up in the chart if in settings
  activeSettingsPlatforms.forEach(p => {
    platformStats[p] = 0;
  });

  (client?.tasks || []).filter(t => {
    if (t.type !== 'SOCIAL') return false;
    const d = new Date(t.date);
    const now = new Date();
    // Use UTC comparison to avoid timezone issues or just local is fine for dashboard
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).forEach(t => {
    if (t.platform && activeSettingsPlatforms.includes(t.platform)) {
      if (t.status) {
        platformStats[t.platform] = (platformStats[t.platform] || 0) + 1;
      }
    } else if (!t.platform || t.platform === 'Özel') {
      // Only include actual special tasks, exclude tasks for inactive platforms
      specialTasksStats.push(t);
    }
  });

  const openEditModal = (task) => {
    setActiveTask(task);
    setNoteInput(task.note || '');
    setLinkInput(task.link || '');
    setSelectedPlatforms(task.platform ? [task.platform] : []);
    setTaskStatus(task.status);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('taskId', activeTask.id);
      formData.append('note', noteInput);
      formData.append('link', linkInput);
      formData.append('status', taskStatus.toString());
      formData.append('platform', selectedPlatforms[0] || '');
      
      await updateTaskDetailAction(formData);
      setIsModalOpen(false);
      router.refresh();
    });
  };

  const handleToggleStatus = async (task) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('taskId', task.id);
      formData.append('status', (!task.status).toString());
      await toggleTaskAction(formData);
      router.refresh();
    });
  };

  const handleDeleteTask = async () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('taskId', activeTask.id);
      await deleteTaskAction(formData);
      setIsDeleteDialogOpen(false);
      setIsModalOpen(false);
      router.refresh();
    });
  };

  const getTaskStatusMessage = (task) => {
    if (task.status) return 'Tamamlandı';
    const missing = [];
    if (!task.note) missing.push('İçerik');
    if (!task.link) missing.push('Link');
    if (missing.length === 0) return 'Onay Bekliyor';
    return `${missing.join(' & ')} Bekleniyor`;
  };

  const TaskList = ({ tasks, title, icon: Icon, color }) => (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div>
          <h3 className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</h3>
          <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{tasks.length}</p>
        </div>
        <div style={{ background: `${color}15`, padding: '0.75rem', borderRadius: '12px' }}>
          <Icon size={24} color={color} />
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.6rem', 
        maxHeight: '250px', 
        overflowY: 'auto',
        paddingRight: '0.5rem',
        margin: '0 -0.5rem'
      }}>
        {tasks.length > 0 ? tasks.sort((a, b) => new Date(b.date) - new Date(a.date)).map(task => (
          <div 
            key={task.id} 
            onClick={() => openEditModal(task)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderLeft: `3px solid ${color}`
            }}
            className="task-item-card"
          >
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                {task.type === 'SOCIAL' && PLATFORM_ICONS[task.platform || 'Özel']}
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {task.type === 'BLOG' ? 'Blog İçeriği' : (task.platform || (task.note || 'Özel Görev'))}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: task.status ? '#10b981' : (getTaskStatusMessage(task).includes('Bekleniyor') ? '#f59e0b' : 'var(--text-secondary)') }}>
                  {getTaskStatusMessage(task)}
                </span>
                <span style={{ opacity: 0.3 }}>•</span>
                <span>{new Date(task.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                {task.note && (
                   <>
                     <span style={{ opacity: 0.3 }}>|</span>
                     <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{task.note}</span>
                   </>
                )}
              </div>
            </div>
            <Edit3 size={14} className="text-muted" />
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', opacity: 0.5 }}>
            <p style={{ fontSize: '0.8rem' }}>Görev bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h2 className="heading-2" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BarChart3 size={24} className="text-muted" /> Performans Verileri
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }} className="main-stats-grid">
        {/* BÖLÜM 1: AYLIK BLOG PLANI */}
        <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Blog Planı</h3>
            <BookOpen size={16} className="text-accent" />
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', opacity: 0.2, textTransform: 'uppercase' }}>{currentMonthName}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '0.75rem', flex: 1 }}>
            {[1, 2, 3, 4].map(weekNum => (
              <div key={weekNum} style={{ 
                background: 'var(--bg-primary)', 
                borderRadius: '12px', 
                padding: '0.75rem', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{weekNum}. HAFTA</span>
                  {blogsByWeek[weekNum].length > 0 && <span style={{ color: 'var(--accent-primary)' }}>{blogsByWeek[weekNum].length}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, overflow: 'hidden' }}>
                  {blogsByWeek[weekNum].length > 0 ? blogsByWeek[weekNum].slice(0, 3).map(blog => (
                    <div 
                      key={blog.id}
                      onClick={() => setSelectedBlog(blog)}
                      title={blog.note}
                      style={{ 
                        padding: '0.4rem 0.6rem', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: '6px', 
                        fontSize: '0.7rem', 
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        border: '1px solid transparent',
                        transition: 'all 0.2s',
                        maxWidth: '100%'
                      }}
                      className="blog-item-compact"
                    >
                      {blog.note.length > 25 ? blog.note.substring(0, 25) + '...' : blog.note}
                    </div>
                  )) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, fontSize: '0.6rem', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                      -
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BÖLÜM 2: TOPLAM BLOG SAYISI */}
        <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            <BarChart size={32} />
          </div>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Toplam Blog</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {(client?.tasks || []).filter(t => t.type === 'BLOG').length}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem', opacity: 0.6 }}>Tüm Zamanlar</p>
        </div>

        {/* BÖLÜM 3: SOSYAL MEDYA TAKİP TABLOSU */}
        <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px', padding: '0.75rem' }}>
          <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center' }}>Sosyal Medya Akışı</h3>
          
          <div style={{ flex: 1, overflowY: 'auto', fontSize: '0.6rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', opacity: 0.7 }}>
                  <th style={{ padding: '0.3rem 0.1rem', textAlign: 'left' }}>H</th>
                  <th style={{ padding: '0.3rem 0.1rem', textAlign: 'left' }}>G</th>
                  {activePlatforms.map(p => (
                    <th key={p} style={{ padding: '0.3rem 0.1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {PLATFORM_ICONS[p] || p[0]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map(week => (
                  Object.keys(socialGrid[week] || {}).length > 0 ? (
                    Object.keys(socialGrid[week]).map((day, idx) => (
                      <tr key={`${week}-${day}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.3rem 0.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{idx === 0 ? week : ''}</td>
                        <td style={{ padding: '0.3rem 0.1rem', opacity: 0.8 }}>{day}</td>
                        {activePlatforms.map(p => (
                          <td key={p} style={{ padding: '0.3rem 0.1rem', textAlign: 'center' }}>
                            {socialGrid[week][day][p] !== undefined ? (
                              socialGrid[week][day][p] ? 
                                <CheckCircle2 size={10} style={{ color: '#10b981' }} /> : 
                                <X size={10} style={{ color: '#ef4444' }} />
                            ) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : null
                ))}
                {Object.keys(socialGrid).length === 0 && (
                  <tr>
                    <td colSpan={activePlatforms.length + 2} style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.3 }}>Veri yok</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BÖLÜM 4: YAKLAŞAN ÖZEL GÜNLER */}
        <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Yaklaşan Özel Günler</h3>
            <CalendarIcon size={16} className="text-accent" />
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Bugün</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {(() => {
              const today = new Date();
              const upcoming = Object.entries(SPECIAL_DAYS).map(([dateStr, name]) => {
                const [month, day] = dateStr.split('-').map(Number);
                let holidayDate = new Date(today.getFullYear(), month - 1, day);
                if (holidayDate < today && (today.getDate() !== day || today.getMonth() !== month - 1)) {
                  holidayDate.setFullYear(today.getFullYear() + 1);
                }
                const diffTime = holidayDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return { name, date: holidayDate, daysLeft: diffDays };
              })
              .sort((a, b) => a.daysLeft - b.daysLeft)
              .slice(0, 5);

              return upcoming.map((item, idx) => {
                const opacity = 1 - (idx * 0.15);
                const isVeryClose = item.daysLeft <= 7;
                
                return (
                  <div key={item.name} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    padding: '0.75rem', 
                    background: isVeryClose ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.02)', 
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: isVeryClose ? 'rgba(59, 130, 246, 0.2)' : 'var(--border-color)',
                    opacity: opacity,
                    transition: 'transform 0.2s'
                  }} className="upcoming-day-item">
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      background: isVeryClose ? 'var(--accent-primary)' : 'var(--bg-primary)', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: isVeryClose ? 'white' : 'var(--text-secondary)',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{item.date.getDate()}</span>
                      <span style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>{item.date.toLocaleDateString('tr-TR', { month: 'short' })}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ fontSize: '0.65rem', color: isVeryClose ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>
                        {item.daysLeft === 0 ? 'Bugün!' : `${item.daysLeft} gün kaldı`}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* BÖLÜM 5-6: BOŞ KUTULAR */}
        {[5, 6].map(i => (
          <div key={i} className="card" style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            minHeight: '400px',
            opacity: 0.3,
            borderStyle: 'dashed'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>BÖLÜM {i}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <h3 className="heading-2" style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} /> Platform Bazlı Paylaşım Dağılımı
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Regular Platforms */}
            {(() => {
              const totalMonthlySocialShares = Object.values(platformStats).reduce((a, b) => a + b, 0) + specialTasksStats.filter(t => t.status).length;
              
              return Object.keys(platformStats).map(platform => (
                <div key={platform}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {PLATFORM_ICONS[platform]} {platform}
                    </span>
                    <span className="text-muted">{platformStats[platform]} Paylaşım</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${Math.min(100, (platformStats[platform] / (totalMonthlySocialShares || 1)) * 100)}%`, 
                      backgroundColor: 'var(--accent-primary)',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>
              ));
            })()}

            {/* Individual Special Tasks */}
            {(() => {
              const totalMonthlySocialShares = Object.values(platformStats).reduce((a, b) => a + b, 0) + specialTasksStats.filter(t => t.status).length;
              
              return specialTasksStats.map(task => (
                <div key={task.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ 
                      fontWeight: 600, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.4rem',
                      color: task.status ? '#10b981' : 'var(--text-primary)'
                    }}>
                      {PLATFORM_ICONS['Özel']} 
                      {new Date(task.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} {task.note || 'Özel Görev'}
                      {task.status && <CheckCircle size={14} />}
                    </span>
                    <span className="text-muted">{task.status ? 'Paylaşıldı' : 'Bekliyor'}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: task.status ? `${Math.min(100, (1 / (totalMonthlySocialShares || 1)) * 100)}%` : '15%', 
                      backgroundColor: task.status ? '#10b981' : 'var(--border-color)',
                      borderRadius: '4px',
                      opacity: task.status ? 1 : 0.3
                    }}></div>
                  </div>
                </div>
              ));
            })()}

            {Object.keys(platformStats).length === 0 && specialTasksStats.length === 0 && (
                <p className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>Henüz paylaşım verisi yok.</p>
            )}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '350px' }}>
          <h3 className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {currentMonthName} Ayı Verimliliği
          </h3>
          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="160" height="160" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent-primary)" strokeWidth="8" 
                  strokeDasharray={`${(completedThisMonth / (currentMonthTasks.length || 1)) * 264} 264`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
                />
             </svg>
             <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  %{Math.round((completedThisMonth / (currentMonthTasks.length || 1)) * 100)}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, opacity: 0.6 }}>BAŞARI</span>
             </div>
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
             <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currentMonthTasks.length}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, marginTop: '2px' }}>TOPLAM</div>
             </div>
             <div style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }}></div>
             <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{completedThisMonth}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, marginTop: '2px' }}>BİTEN</div>
             </div>
             <div style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }}></div>
             <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>{currentMonthTasks.length - completedThisMonth}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, marginTop: '2px' }}>KALAN</div>
             </div>
          </div>
        </div>
      </div>

      {/* Görev Düzenleme Modalı */}
      <CustomDialog 
        isOpen={isModalOpen} 
        title="Görev Düzenle" 
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

          {activeTask?.type === 'SOCIAL' && (
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="input-label" style={{ marginBottom: 0 }}>Platform Seçin (Opsiyonel)</label>
                <button 
                  type="button"
                  onClick={() => {
                    if (selectedPlatforms.length === PLATFORMS_LIST.length) {
                      setSelectedPlatforms([]);
                    } else {
                      setSelectedPlatforms([...PLATFORMS_LIST]);
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
                  {selectedPlatforms.length === PLATFORMS_LIST.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {PLATFORMS_LIST.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      if (selectedPlatforms.includes(p)) {
                        setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
                      } else {
                        setSelectedPlatforms([...selectedPlatforms, p]);
                      }
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
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
                    padding: '0.5rem 0.75rem',
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
              </div>
            </div>
          )}

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
                onClick={() => setIsDeleteDialogOpen(true)}
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}
                title="Görevi Sil"
              >
                <Trash2 size={16} /> Görevi Sil
              </button>
            </div>
          )}
        </div>
      </CustomDialog>

      {/* Tamamlananlar Listesi Modalı */}
      <CustomDialog
        isOpen={showCompletedModal}
        title="Tamamlanan Görevler"
        onClose={() => setShowCompletedModal(false)}
        showCancel={false}
        confirmText="Kapat"
        onConfirm={() => setShowCompletedModal(false)}
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <TaskList tasks={completedTasks} title="Tamamlananlar" icon={CheckCircle2} color="#10b981" />
        </div>
      </CustomDialog>

      {/* Bekleyenler Listesi Modalı */}
      <CustomDialog
        isOpen={showPendingModal}
        title="Bekleyen Görevler"
        onClose={() => setShowPendingModal(false)}
        showCancel={false}
        confirmText="Kapat"
        onConfirm={() => setShowPendingModal(false)}
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <TaskList tasks={pendingTasks} title="Bekleyen Görevler" icon={Clock} color="#f59e0b" />
        </div>
      </CustomDialog>

      {/* Silme Onayı */}
      <CustomDialog
        isOpen={isDeleteDialogOpen}
        title="Görevi Sil"
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteTask}
        confirmText="Evet, Sil"
        cancelText="İptal"
        loading={isPending}
      >
        <p style={{ color: 'var(--text-secondary)' }}>Bu görevi kalıcı olarak silmek istediğinize emin misiniz?</p>
      </CustomDialog>

      <style jsx>{`
        .task-item-hover:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: var(--accent-primary) !important;
          transform: translateX(4px);
        }
      `}</style>
      {/* Blog Detail Modal */}
      {selectedBlog && (
        <div className="modal-backdrop" onClick={() => setSelectedBlog(null)}>
          <div className="modal-content blog-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', width: '90%', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.2' }}>{selectedBlog.note}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {new Date(selectedBlog.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedBlog(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ 
              maxHeight: '60vh', 
              overflowY: 'auto', 
              padding: '1rem', 
              background: 'var(--bg-primary)', 
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              lineHeight: '1.6',
              color: 'var(--text-primary)'
            }}>
              {selectedBlog.content ? (
                <div dangerouslySetInnerHTML={{ __html: selectedBlog.content }} className="blog-content-area" />
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.5 }}>
                  <p>Bu blog için henüz içerik girilmemiş.</p>
                  {selectedBlog.link && (
                    <a href={selectedBlog.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
                      Yazıyı Kaynakta Gör <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '1rem' }}>
              {selectedBlog.link && (
                <a 
                  href={selectedBlog.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  <ExternalLink size={16} /> Linke Git
                </a>
              )}
              <button className="btn-primary" onClick={() => setSelectedBlog(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .blog-item-compact:hover {
          background: var(--bg-primary) !important;
          border-color: var(--accent-primary) !important;
          color: var(--accent-primary) !important;
          transform: translateY(-1px);
        }
        .blog-content-area :global(h1), .blog-content-area :global(h2), .blog-content-area :global(h3) {
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        .blog-content-area :global(p) {
          margin-bottom: 1rem;
        }
        .blog-content-area :global(img) {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: flex-start;
          padding-top: 5rem;
          justify-content: center;
          z-index: 9999;
          animation: modalFadeIn 0.2s ease-out;
        }
        .modal-content.blog-modal {
          background: var(--bg-secondary);
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid var(--border-color);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: modalSlideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 1024px) {
          .main-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .main-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
