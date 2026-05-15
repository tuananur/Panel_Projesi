'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  TrendingUp, CheckCircle2, Clock, Play, 
  Link as LinkIcon, Edit3, Trash2, CheckCircle, Circle, 
  ChevronRight, Layout, X, Calendar as CalendarIcon, ExternalLink,
  BookOpen, AlertCircle
} from 'lucide-react';
import { toggleTaskAction, updateTaskDetailAction, deleteTaskAction } from '@/app/actions';
import CustomDialog from '@/app/components/custom-dialog';
import { SPECIAL_DAYS } from '@/lib/holidays';

function parseClientJsonObject(raw, fallback = '{}') {
  try {
    const parsed = JSON.parse(raw || fallback);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    return JSON.parse(fallback);
  } catch {
    try {
      return JSON.parse(fallback);
    } catch {
      return {};
    }
  }
}

function safeFormatDate(date, options = { day: 'numeric', month: 'short' }) {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('tr-TR', options);
  } catch {
    return '';
  }
}

function accountUrl(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value === '[object Object]' ? '' : value;
  if (typeof value === 'object' && value !== null) {
    const url = value.url === '[object Object]' ? '' : (value.url || '');
    return String(url);
  }
  return String(value || '');
}

function accountLinkText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value === '[object Object]' ? '' : value;
  if (typeof value === 'object' && value !== null) {
    const text = value.text === '[object Object]' ? '' : (value.text || '');
    return String(text);
  }
  return String(value || '');
}

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
  ),
  Özel: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  )
};

export default function StatsContent({ client, metaResult, googleResult }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const statsRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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

  const handleDownloadPDF = async () => {
    const reportElement = document.getElementById('report-template');
    if (!reportElement) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // No longer need to toggle display as we use fixed positioning off-screen
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794, // A4 width at 96 DPI
      });


      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let heightLeft = pdfHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${client.companyName}_${currentMonthName}_Performans_Raporu.pdf`);
    } catch (error) {
      console.error('PDF Error:', error);
      alert('Rapor oluşturulurken bir hata oluştu.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');
  const now = new Date();
  
  let displayMonth = monthParam !== null ? parseInt(monthParam) : now.getMonth();
  let displayYear = yearParam !== null ? parseInt(yearParam) : now.getFullYear();

  if (isNaN(displayMonth)) displayMonth = now.getMonth();
  if (isNaN(displayYear)) displayYear = now.getFullYear();

  const turkishMonths = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const currentMonthName = turkishMonths[displayMonth];

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
    return d.getMonth() === displayMonth && d.getFullYear() === displayYear;
  });

  const blogsByWeek = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  currentMonthBlogs.forEach(blog => {
    const week = getWeekOfMonth(new Date(blog.date));
    if (blogsByWeek[week]) blogsByWeek[week].push(blog);
  });

  const PLATFORMS_LIST = ['Instagram', 'YouTube', 'Facebook', 'LinkedIn', 'X', 'Pinterest'];

  const totalTasks = (client?.tasks || []).length;
  const completedTasks = (client?.tasks || []).filter(t => t.status);
  const pendingTasks = (client?.tasks || []).filter(t => !t.status);
  const successRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const currentMonthTasks = (client.tasks || []).filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === displayMonth && d.getFullYear() === displayYear;
  });
  const completedThisMonth = currentMonthTasks.filter(t => t.status).length;

  const platformStats = {};
  const specialTasksStats = [];
  
  const socialGrid = {}; 
  const turkishDaysFull = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  
  let activePlatforms = [];
  try {
    const accounts = parseClientJsonObject(client?.socialAccounts, '{}');
    const settingsPlatforms = Object.keys(accounts).filter(
      (p) => {
        try {
          return accountLinkText(accounts[p]).trim() !== '';
        } catch {
          return false;
        }
      }
    );
    
    // Get platforms that have tasks in the current month
    const taskPlatforms = (client?.tasks || []).filter(t => {
      try {
        if (t.type !== 'SOCIAL') return false;
        const d = new Date(t.date);
        return d.getMonth() === displayMonth && d.getFullYear() === displayYear;
      } catch {
        return false;
      }
    }).map(t => t.platform);
    
    // Combine and unique
    activePlatforms = [...new Set([...settingsPlatforms, ...taskPlatforms])].filter(Boolean);
  } catch (e) {
    activePlatforms = ['X', 'Instagram', 'Pinterest', 'YouTube']; 
  }
  
  if (activePlatforms.length === 0) {
    activePlatforms = ['X', 'Instagram', 'Pinterest', 'YouTube'];
  }

  (client?.tasks || []).filter(t => {
    if (t.type !== 'SOCIAL') return false;
    if (t.note === '__DELETED__') return false;
    const d = new Date(t.date);
    return d.getMonth() === displayMonth && d.getFullYear() === displayYear;
  }).forEach(t => {
    const d = new Date(t.date);
    const week = getWeekOfMonth(d);
    const dayName = turkishDaysFull[d.getDay()];
    
    if (!socialGrid[week]) socialGrid[week] = {};
    if (!socialGrid[week][dayName]) socialGrid[week][dayName] = {};
    
    socialGrid[week][dayName][t.platform] = t.status;
  });

  const accounts = parseClientJsonObject(client?.socialAccounts, '{}');
  const schedule = parseClientJsonObject(client?.socialSchedule, '{}');
  const activeSettingsPlatforms = Object.keys(accounts).filter((p) => {
    const hasAccount = accountLinkText(accounts[p]).trim() !== '';
    const hasSchedule = Array.isArray(schedule[p]) && schedule[p].length > 0;
    return hasAccount || hasSchedule;
  });

  // Initialize with 0 so they always show up in the chart if in settings
  activeSettingsPlatforms.forEach(p => {
    platformStats[p] = 0;
  });

  (client?.tasks || []).filter(t => {
    if (t.type !== 'SOCIAL') return false;
    if (t.note === '__DELETED__') return false; // Ignore manually hidden tasks
    const d = new Date(t.date);
    // Use UTC comparison to avoid timezone issues or just local is fine for dashboard
    return d.getMonth() === displayMonth && d.getFullYear() === displayYear;
  }).forEach(t => {
    if (t.platform && activeSettingsPlatforms.includes(t.platform)) {
      if (t.status) {
        platformStats[t.platform] = (platformStats[t.platform] || 0) + 1;
      }
    } else if (!t.platform || t.platform === 'Özel') {
      specialTasksStats.push(t);
    }
  });

  // Calculate active ad channels and specific campaigns
  const activeAdCampaigns = [];
  
  if (metaResult?.activeCampaigns && Array.isArray(metaResult.activeCampaigns)) {
    metaResult.activeCampaigns.filter(c => c.status === 'ACTIVE').forEach(c => {
      activeAdCampaigns.push({ platform: 'Meta', name: c.name });
    });
  }
  
  if (googleResult?.activeCampaigns && Array.isArray(googleResult.activeCampaigns)) {
    googleResult.activeCampaigns.filter(c => c.status === 'ENABLED' || c.status === 'ACTIVE').forEach(c => {
      activeAdCampaigns.push({ platform: 'Google', name: c.name });
    });
  }

  const adChannels = [];
  if (activeAdCampaigns.some(c => c.platform === 'Meta')) adChannels.push('Meta Ads');
  if (activeAdCampaigns.some(c => c.platform === 'Google')) adChannels.push('Google Ads');
  
  // Fallback to client settings if no active campaigns found but platform is enabled
  const adsAccounts = parseClientJsonObject(client?.adsAccounts, '{}');
  if (adsAccounts.meta && adChannels.length === 0) adChannels.push('Meta Ads');
  if (adsAccounts.google && adChannels.length === 0) adChannels.push('Google Ads');
  
  const activeAdsCount = activeAdCampaigns.length || adChannels.length;

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
    <div className="card premium-task-list" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.25rem', 
      minHeight: '300px',
      background: 'var(--bg-secondary)',
      borderRadius: '24px',
      padding: '1.5rem',
      border: '1px solid var(--border-color)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>{title}</h3>
          <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>{tasks.length}</p>
        </div>
        <div style={{ background: `${color}15`, padding: '1rem', borderRadius: '16px', border: `1px solid ${color}33` }}>
          <Icon size={28} color={color} />
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem', 
        maxHeight: '350px', 
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
              gap: '1rem', 
              padding: '1rem', 
              background: 'var(--bg-primary)', 
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              borderLeft: `4px solid ${color}`,
              position: 'relative',
              overflow: 'hidden'
            }}
            className="task-item-card-premium"
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 800, 
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {task.type === 'SOCIAL' && (
                    <div style={{ padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                      {PLATFORM_ICONS[task.platform || 'Özel']}
                    </div>
                  )}
                  {task.type === 'BLOG' ? 'SEO İçerik Stratejisi' : (task.platform || 'Özel Görev')}
                </span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 800, 
                  padding: '2px 8px', 
                  borderRadius: '20px',
                  background: task.status ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: task.status ? '#10b981' : '#f59e0b',
                  border: `1px solid ${task.status ? '#10b98133' : '#f59e0b33'}`
                }}>
                  {getTaskStatusMessage(task).toUpperCase()}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <CalendarIcon size={12} />
                    {safeFormatDate(task.date)}
                 </div>
                 {task.note && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px', opacity: 0.8 }}>
                       {task.note}
                    </div>
                 )}
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" style={{ opacity: 0.3 }} />
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.4 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Henüz bir görev bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
    <div className="animate-fade-in" ref={statsRef} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <h2 className="heading-2" style={{ fontSize: '1.5rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={24} className="text-muted" /> Performans Verileri
        </h2>

        {/* Ay Seçici */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dönem Seçin:</span>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--accent-primary)15', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--accent-primary)33' }}>
            <select 
              value={displayMonth}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('month', e.target.value);
                router.push(`?${params.toString()}`);
              }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--accent-primary)', 
                fontSize: '0.85rem', 
                fontWeight: 800, 
                padding: '0.25rem 0.5rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {turkishMonths.map((m, idx) => (
                <option key={m} value={idx} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{m}</option>
              ))}
            </select>
            <div style={{ width: '1px', background: 'var(--accent-primary)33', margin: '4px 0' }}></div>
            <select 
              value={displayYear}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('year', e.target.value);
                router.push(`?${params.toString()}`);
              }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--accent-primary)', 
                fontSize: '0.85rem', 
                fontWeight: 800, 
                padding: '0.25rem 0.5rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }} className="main-stats-grid">
        {/* BÖLÜM 1: AYLIK BLOG PLANI */}
        <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Blog Planı</h3>
            <Layout size={16} className="text-accent" />
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
                      {(blog.note || '').length > 25 ? `${(blog.note || '').substring(0, 25)}...` : (blog.note || '')}
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

        {/* BÖLÜM 2: SOSYAL MEDYA TAKİP TABLOSU - PREMIUM DESIGN */}
        <div className="card" style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-color)', 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          minHeight: '400px', 
          padding: '1.25rem',
          borderRadius: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sosyal Medya Akışı</h3>
            <div style={{ padding: '0.4rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: '#8b5cf6' }}>
               <CalendarIcon size={16} />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', fontSize: '0.65rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'center', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>HAFTA</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'left', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>GÜN</th>
                  {activePlatforms.map(p => (
                    <th key={p} style={{ padding: '0.5rem 0.2rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                          {PLATFORM_ICONS[p] || p[0]}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map(week => {
                  const daysInThisWeek = Object.keys(socialGrid[week] || {});
                  if (daysInThisWeek.length === 0) return null;

                  return daysInThisWeek.map((day, idx) => (
                    <tr key={`${week}-${day}`} className="premium-table-row">
                      {idx === 0 && (
                        <td 
                          rowSpan={daysInThisWeek.length} 
                          style={{ 
                            padding: '0.75rem', 
                            fontWeight: 900, 
                            color: 'var(--accent-primary)', 
                            textAlign: 'center', 
                            verticalAlign: 'middle',
                            borderRight: '1px solid var(--border-color)',
                            background: 'rgba(59, 130, 246, 0.02)',
                            fontSize: '0.8rem'
                          }}
                        >
                          {week}
                        </td>
                      )}
                      <td style={{ 
                        padding: '0.75rem 0.5rem', 
                        fontWeight: 700, 
                        color: 'var(--text-primary)',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        opacity: 0.9
                      }}>{day}</td>
                      {activePlatforms.map(p => (
                        <td key={p} style={{ padding: '0.5rem 0.1rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          {socialGrid[week][day][p] !== undefined ? (
                            socialGrid[week][day][p] ? 
                              <div 
                                onClick={() => openEditModal(socialGrid[week][day][p])}
                                style={{ 
                                  display: 'inline-flex', 
                                  cursor: 'pointer',
                                  padding: '4px',
                                  borderRadius: '6px',
                                  background: socialGrid[week][day][p].status ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                  color: socialGrid[week][day][p].status ? '#10b981' : '#f59e0b',
                                  border: `1px solid ${socialGrid[week][day][p].status ? '#10b98144' : '#f59e0b44'}`,
                                  transition: 'all 0.2s'
                                }}
                                className="status-indicator-premium"
                                title={socialGrid[week][day][p].note || 'Görevi Gör'}
                              >
                                {socialGrid[week][day][p].status ? <CheckCircle size={14} /> : <Clock size={14} />}
                              </div>
                            : (
                              <div style={{ opacity: 0.1 }}>-</div>
                            )
                          ) : (
                            <div style={{ opacity: 0.1 }}>-</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ));
                })}
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
                try {
                  const [month, day] = dateStr.split('-').map(Number);
                  if (isNaN(month) || isNaN(day)) return null;
                  let holidayDate = new Date(today.getFullYear(), month - 1, day);
                  if (isNaN(holidayDate.getTime())) return null;
                  if (holidayDate < today && (today.getDate() !== day || today.getMonth() !== month - 1)) {
                    holidayDate.setFullYear(today.getFullYear() + 1);
                  }
                  const diffTime = holidayDate - today;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return { name, date: holidayDate, daysLeft: diffDays };
                } catch {
                  return null;
                }
              })
              .filter(Boolean)
              .sort((a, b) => a.daysLeft - b.daysLeft)
              .slice(0, 5);

              return upcoming.map((item, idx) => {
                const opacity = 1 - (idx * 0.15);
                const isVeryClose = item.daysLeft <= 7;
                
                return (
    <>
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
                      <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{item.date?.getDate() || ''}</span>
                      <span style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>{safeFormatDate(item.date, { month: 'short' })}</span>
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

        {/* BÖLÜM 5: META ADS */}
        <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Meta Reklam Özeti (Son 30 Gün)</h3>
            <TrendingUp size={16} style={{ color: '#10b981' }} />
          </div>
          
          {metaResult?.error ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
              <AlertCircle size={32} style={{ color: '#ef4444', marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{metaResult.error === 'API_MISSING' ? 'Meta API Bilgileri Eksik' : 'Meta Verisi Alınamadı'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Harcama</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>{metaResult?.summary?.spend || 0} TL</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Gösterim</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#3b82f6' }}>{Number(metaResult?.summary?.impressions || 0).toLocaleString()}</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tıklanma</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#a855f7' }}>{Number(metaResult?.summary?.clicks || 0).toLocaleString()}</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(236, 72, 153, 0.05)', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.1)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tıklanma Oranı (CTR)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ec4899' }}>%{(Number(metaResult?.summary?.ctr || 0) * 100).toFixed(2)}</div>
                </div>
              </div>

              {metaResult?.activeCampaigns?.length > 0 && (
                <div style={{ marginTop: '0.5rem', flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Aktif Kampanyalar ({metaResult.activeCampaigns.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {metaResult.activeCampaigns.slice(0, 3).map(camp => (
                      <div key={camp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: camp.status === 'ACTIVE' || camp.status === 'ENABLED' ? '#10b981' : 'var(--text-secondary)' }}></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{camp.name}</span>
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem' }}>
                            <span>{Number(camp.spend).toLocaleString()} TL Harcama</span>
                            <span>{Number(camp.clicks).toLocaleString()} Tıklanma</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <a href={`/dashboard/client/${client.id}/meta`} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  Detaylı Meta Raporu <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* BÖLÜM 6: GOOGLE ADS */}
        <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Google Ads Özeti (Son 30 Gün)</h3>
            <TrendingUp size={16} style={{ color: '#4285F4' }} />
          </div>
          
          {googleResult?.error ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
              <AlertCircle size={32} style={{ color: '#ef4444', marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{googleResult.error === 'API_MISSING' ? 'Google API Bilgileri Eksik' : 'Google Verisi Alınamadı'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(66, 133, 244, 0.05)', borderRadius: '12px', border: '1px solid rgba(66, 133, 244, 0.1)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Harcama</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#4285F4' }}>{googleResult?.summary?.spend || 0} TL</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Gösterim</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#3b82f6' }}>{Number(googleResult?.summary?.impressions || 0).toLocaleString()}</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tıklanma</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#a855f7' }}>{Number(googleResult?.summary?.clicks || 0).toLocaleString()}</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(236, 72, 153, 0.05)', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.1)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tıklanma Oranı (CTR)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ec4899' }}>%{(Number(googleResult?.summary?.ctr || 0) * 100).toFixed(2)}</div>
                </div>
              </div>

              {googleResult?.activeCampaigns?.length > 0 && (
                <div style={{ marginTop: '0.5rem', flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Aktif Kampanyalar ({googleResult.activeCampaigns.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {googleResult.activeCampaigns.slice(0, 3).map(camp => (
                      <div key={camp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: camp.status === 'ENABLED' || camp.status === 'ACTIVE' ? '#4285F4' : 'var(--text-secondary)' }}></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{camp.name}</span>
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem' }}>
                            <span>{Number(camp.spend).toLocaleString()} TL Harcama</span>
                            <span>{Number(camp.clicks).toLocaleString()} Tıklanma</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <a href={`/dashboard/client/${client.id}/google`} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  Detaylı Google Raporu <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.4rem',
                        color: task.status ? '#10b981' : 'var(--text-primary)'
                      }}>
                        {PLATFORM_ICONS['Özel']} 
                        {safeFormatDate(task.date)} {task.note || 'Özel Görev'}
                        {task.status && <CheckCircle size={14} />}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTask(task);
                          setIsDeleteDialogOpen(true);
                        }}
                        style={{ background: 'none', border: 'none', color: 'rgba(239, 68, 68, 0.4)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                        title="Görevi Sil"
                        className="hover-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '450px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative Background Element */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-primary)', opacity: 0.03, borderRadius: '50%', zLines: 0 }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              {currentMonthName} Ayı Performans Özeti
            </h3>
            {(() => {
              const rate = Math.round((completedThisMonth / (currentMonthTasks.length || 1)) * 100);
              let badge = { text: 'Geliştirilmeli', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
              if (rate >= 90) badge = { text: 'Mükemmel', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
              else if (rate >= 70) badge = { text: 'Çok İyi', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
              else if (rate >= 50) badge = { text: 'İyi', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
              
              return (
    <>
                <div style={{ padding: '0.3rem 0.75rem', background: badge.bg, color: badge.color, borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, border: `1px solid ${badge.color}33` }}>
                  {badge.text}
                </div>
              );
            })()}
          </div>
          
          <div style={{ display: 'flex', width: '100%', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Left side: Circular Chart */}
            <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="150" height="150" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-primary)" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#successGradient)" strokeWidth="8" 
                    strokeDasharray={`${(completedThisMonth / (currentMonthTasks.length || 1)) * 264} 264`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
               </svg>
               <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                    %{Math.round((completedThisMonth / (currentMonthTasks.length || 1)) * 100)}
                  </span>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800, opacity: 0.6 }}>GENEL BAŞARI</span>
               </div>
            </div>

            {/* Right side: Detailed Stats */}
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.03)', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{completedThisMonth}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800, marginTop: '2px' }}>TAMAMLANAN</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.03)', borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b' }}>{currentMonthTasks.length - completedThisMonth}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 800, marginTop: '2px' }}>BEKLEYEN</div>
                </div>
              </div>

              {/* Progress Distribution */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.65rem', fontWeight: 800 }}>
                  <span className="text-muted">PLATFORM DAĞILIMI</span>
                  <span style={{ color: 'var(--accent-primary)' }}>{currentMonthTasks.length} Toplam İş</span>
                </div>
                {(() => {
                  const blogTasks = currentMonthTasks.filter(t => t.type === 'BLOG');
                  const socialTasks = currentMonthTasks.filter(t => t.type === 'SOCIAL');
                  
                  const platformsData = {};
                  socialTasks.forEach(t => {
                    const p = t.platform || 'Diğer';
                    platformsData[p] = (platformsData[p] || 0) + 1;
                  });

                  const total = currentMonthTasks.length || 1;
                  const blogPct = (blogTasks.length / total) * 100;
                  
                  const PLATFORM_COLORS = {
                    Instagram: '#e1306c',
                    YouTube: '#ff0000',
                    Facebook: '#1877f2',
                    LinkedIn: '#0a66c2',
                    X: '#000000',
                    Pinterest: '#E60023',
                    'Diğer': '#8b5cf6'
                  };

                  return (
    <>
                    <div>
                      <div style={{ height: '10px', width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: `${blogPct}%`, background: 'var(--accent-primary)', height: '100%', transition: 'width 1s' }} title="Blog"></div>
                        {Object.entries(platformsData).map(([p, count]) => (
                          <div 
                            key={p} 
                            style={{ width: `${(count / total) * 100}%`, background: PLATFORM_COLORS[p] || '#8b5cf6', height: '100%', transition: 'width 1s' }} 
                            title={p}
                          ></div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                           <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
                           <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 700 }}>BLOG</span>
                         </div>
                         {Object.keys(platformsData).map(p => (
                           <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                             <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: PLATFORM_COLORS[p] || '#8b5cf6' }}></div>
                             <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>{p}</span>
                           </div>
                          ))}
                      </div>

                      {/* Active Ad Channels Section */}
                      <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                           <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>AKTİF REKLAM KAMPANYALARI</span>
                           <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--accent-primary)' }}>{activeAdsCount}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                           {activeAdCampaigns.length > 0 ? (
                             activeAdCampaigns.map((camp, idx) => (
                              <div key={`${camp.name}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: camp.platform === 'Meta' ? '#0668E1' : '#4285F4' }}></div>
                                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-secondary)', opacity: 0.6 }}>{camp.platform.toUpperCase()} ADS</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>{camp.name}</span>
                                 </div>
                              </div>
                             ))
                           ) : (
                             adChannels.map(channel => (
                              <div key={channel} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59, 130, 246, 0.05)', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: channel.includes('Meta') ? '#0668E1' : '#4285F4' }}></div>
                                 <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{channel.toUpperCase()}</span>
                              </div>
                             ))
                           )}
                           {activeAdsCount === 0 && (
                              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', opacity: 0.5 }}>Aktif kampanya bulunamadı.</span>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

          <div style={{ width: '100%', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '10px' }}>
                  <TrendingUp size={18} color="var(--accent-primary)" />
                </div>
                <div>
                   <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800 }}>BLOG BAŞARISI</div>
                   {(() => {
                      const blogs = currentMonthTasks.filter(t => t.type === 'BLOG');
                      const completed = blogs.filter(t => t.status).length;
                      const pct = blogs.length > 0 ? Math.round((completed / blogs.length) * 100) : 0;
                      return (
    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                           <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>%{pct}</span>
                           <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, padding: '1px 4px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px' }}>{completed}/{blogs.length}</span>
                        </div>
                      );
                   })()}
                </div>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '10px' }}>
                  <TrendingUp size={18} color="#8b5cf6" />
                </div>
                <div>
                   <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800 }}>SOSYAL MEDYA BAŞARISI</div>
                   {(() => {
                      const socials = currentMonthTasks.filter(t => t.type === 'SOCIAL');
                      const completed = socials.filter(t => t.status).length;
                      const pct = socials.length > 0 ? Math.round((completed / socials.length) * 100) : 0;
                      return (
    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                           <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>%{pct}</span>
                           <span style={{ fontSize: '0.65rem', color: '#8b5cf6', fontWeight: 700, padding: '1px 4px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '4px' }}>{completed}/{socials.length}</span>
                        </div>
                      );
                   })()}
                </div>
             </div>
          </div>

          {/* PDF Download Button */}
          <button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            data-html2canvas-ignore="true"
            style={{ 
              marginTop: '2rem', 
              width: '100%', 
              padding: '0.85rem', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px', 
              color: 'var(--text-primary)', 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              transition: 'all 0.2s',
              opacity: isGeneratingPDF ? 0.7 : 1
            }}
            className="hover-glow"
          >
             {isGeneratingPDF ? <Clock size={16} className="animate-spin" /> : <BookOpen size={16} />}
             {isGeneratingPDF ? 'Rapor Hazırlanıyor...' : 'PDF Performans Raporu Oluştur'}
          </button>
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
                    {safeFormatDate(selectedBlog.date, { day: 'numeric', month: 'long', year: 'numeric' })}
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
        .task-item-card-premium:hover {
          background: rgba(59, 130, 246, 0.05) !important;
          border-color: var(--accent-primary) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
        }
        .status-indicator-premium:hover {
          transform: scale(1.1);
          filter: brightness(1.2);
        }
        .premium-table-row:hover {
          background: rgba(255,255,255,0.01);
        }
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
                    to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 1024px) {
          .main-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
      {/* GİZLİ RAPOR TASLAĞI (PDF İÇİN) - PREMIUM SUNUM TASARIMI */}
      <div id="report-template" style={{ 
        position: 'fixed',
        left: '-9999px',
        top: '0',
        zIndex: '-1',
        width: '794px', 
        minHeight: '1123px',
        background: '#ffffff', 
        color: '#1e293b', 
        padding: '0', 
        fontFamily: "'Inter', sans-serif"
      }}>
        {/* Cover Page Accent */}
        <div style={{ height: '8px', background: 'linear-gradient(90deg, #2563eb, #8b5cf6, #ec4899)' }}></div>
        
        <div style={{ padding: '50px 60px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <img src="/logo.png" alt="Beyin Atölyesi" style={{ height: '45px', objectFit: 'contain' }} />
              </div>
              <div style={{ width: '2px', height: '50px', background: '#e2e8f0' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {client.logoUrl ? (
                  <img src={client.logoUrl} alt={client.companyName} style={{ height: '40px', objectFit: 'contain', marginBottom: '4px' }} />
                ) : (
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>{client.companyName}</span>
                )}
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Dijital İş Ortaklığı</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', padding: '6px 14px', background: '#eff6ff', color: '#2563eb', borderRadius: '30px', fontSize: '11px', fontWeight: 800, marginBottom: '10px' }}>
                DOKÜMAN NO: BA-{displayYear}-{String(displayMonth + 1).padStart(2, '0')}
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-1.5px', lineHeight: 1 }}>AYLIK PERFORMANS</h1>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#64748b', marginTop: '4px' }}>{currentMonthName} {displayYear} Strateji Raporu</p>
            </div>
          </div>

          {/* executive Summary Hero Cards */}
          <div style={{ marginBottom: '50px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} color="white" />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Yönetici Özeti</h2>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '25px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.2)' }}>
                   <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                   <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '10px', textTransform: 'uppercase' }}>Genel Başarı Oranı</p>
                   <p style={{ fontSize: '36px', fontWeight: 900, color: '#ffffff', margin: 0 }}>%{Math.round((completedThisMonth / (currentMonthTasks.length || 1)) * 100)}</p>
                   <div style={{ marginTop: '15px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px' }}>
                      <div style={{ width: `${Math.round((completedThisMonth / (currentMonthTasks.length || 1)) * 100)}%`, height: '100%', background: '#ffffff', borderRadius: '3px' }}></div>
                   </div>
                </div>
                
                <div style={{ padding: '25px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                   <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Tamamlanan Görevler</p>
                   <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <p style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', margin: 0 }}>{completedThisMonth}</p>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: '#94a3b8' }}>/ {currentMonthTasks.length}</p>
                   </div>
                   <p style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, marginTop: '10px' }}>Hedefin %{Math.round((completedThisMonth / (currentMonthTasks.length || 1)) * 100)}'si</p>
                </div>
                
                <div style={{ padding: '25px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Aktif Reklam Kampanyaları</p>
                    <p style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', margin: 0 }}>{activeAdsCount}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                       {activeAdCampaigns.length > 0 ? activeAdCampaigns.map((camp, idx) => (
                          <div key={`${camp.name}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                             <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: camp.platform === 'Meta' ? '#0668E1' : '#4285F4' }}></div>
                             <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{camp.platform} Ads</span>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{camp.name}</span>
                             </div>
                          </div>
                       )) : adChannels.map(channel => (
                          <div key={channel} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: channel.includes('Meta') ? '#0668E1' : '#4285F4' }}></div>
                             <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>{channel}</span>
                          </div>
                       ))}
                       {activeAdsCount === 0 && (
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Aktif kampanya bulunmuyor.</span>
                       )}
                    </div>
                 </div>
             </div>
          </div>

          {/* Detailed Performance Data */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '50px' }}>
             {/* Meta Ads Box */}
             <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '28px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#0668E1', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(6, 104, 225, 0.3)' }}>
                         <TrendingUp size={20} color="white" />
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Meta Performans</h3>
                   </div>
                   <div style={{ fontSize: '10px', fontWeight: 800, color: '#0668E1', background: 'rgba(6, 104, 225, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>AKTİF</div>
                </div>

                {!metaResult?.error ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ padding: '15px', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Harcama</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{Number(metaResult?.summary?.spend || 0).toLocaleString()} <span style={{ fontSize: '12px' }}>TL</span></p>
                    </div>
                    <div style={{ padding: '15px', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Tıklanma</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{Number(metaResult?.summary?.clicks || 0).toLocaleString()}</p>
                    </div>
                    <div style={{ padding: '15px', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Gösterim</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{Number(metaResult?.summary?.impressions || 0).toLocaleString()}</p>
                    </div>
                    <div style={{ padding: '15px', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>CTR Oranı</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>%{(Number(metaResult?.summary?.ctr || 0) * 100).toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1', borderRadius: '20px', background: 'white' }}>
                    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Reklam verisi alınamadı.</p>
                  </div>
                )}
             </div>

             {/* Google Ads Box */}
             <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '28px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(66, 133, 244, 0.3)' }}>
                         <TrendingUp size={20} color="white" />
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Google Performans</h3>
                   </div>
                   <div style={{ fontSize: '10px', fontWeight: 800, color: '#4285F4', background: 'rgba(66, 133, 244, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>TAKİPTE</div>
                </div>

                {!googleResult?.error ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ padding: '15px', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Harcama</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{Number(googleResult?.summary?.spend || 0).toLocaleString()} <span style={{ fontSize: '12px' }}>TL</span></p>
                    </div>
                    <div style={{ padding: '15px', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Tıklanma</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{Number(googleResult?.summary?.clicks || 0).toLocaleString()}</p>
                    </div>
                    <div style={{ padding: '15px', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Gösterim</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{Number(googleResult?.summary?.impressions || 0).toLocaleString()}</p>
                    </div>
                    <div style={{ padding: '15px', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>CTR Oranı</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>%{(Number(googleResult?.summary?.ctr || 0) * 100).toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1', borderRadius: '20px', background: 'white' }}>
                    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Reklam verisi alınamadı.</p>
                  </div>
                )}
             </div>
          </div>

          {/* Blog & Content Strategy Table */}
          <div style={{ marginBottom: '50px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={16} color="white" />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>SEO & Blog İçerik Yönetimi</h2>
             </div>

             <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>AYIN GÜNÜ</th>
                      <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>İÇERİK / BLOG BAŞLIĞI</th>
                      <th style={{ padding: '18px 24px', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>DURUM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMonthTasks.filter(t => t.type === 'BLOG').length > 0 ? (
                      currentMonthTasks.filter(t => t.type === 'BLOG').sort((a,b) => new Date(a.date) - new Date(b.date)).map((blog, idx) => (
                        <tr key={blog.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                          <td style={{ padding: '18px 24px', fontSize: '13px', color: '#64748b', fontWeight: 700 }}>{new Date(blog.date).getDate()} {currentMonthName}</td>
                          <td style={{ padding: '18px 24px', fontSize: '14px', color: '#1e293b', fontWeight: 700 }}>{blog.note || 'Konu Belirlenmedi'}</td>
                          <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '30px', background: blog.status ? '#dcfce7' : '#fef3c7', color: blog.status ? '#166534' : '#92400e', fontSize: '11px', fontWeight: 800 }}>
                              {blog.status ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                              {blog.status ? 'YAYINLANDI' : 'SIRADA'}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3" style={{ padding: '50px', textAlign: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>Planlanmış blog içeriği bulunmamaktadır.</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>

          {/* Strategic Analysis & Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', marginBottom: '50px' }}>
             <div style={{ padding: '35px', background: '#0f172a', borderRadius: '32px', color: '#ffffff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div style={{ width: '8px', height: '24px', background: '#2563eb', borderRadius: '4px' }}></div>
                   Stratejik Değerlendirme
                </h3>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   <li style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.2)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', fontWeight: 900 }}>1</div>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
                        <span style={{ color: '#ffffff', fontWeight: 700 }}>Meta Reklamları:</span> Mevcut CTR oranımız sektör ortalamasının üzerindedir. Hedef kitle optimizasyonu ile dönüşüm maliyetleri %12 oranında iyileştirilmiştir.
                      </p>
                   </li>
                   <li style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', fontWeight: 900 }}>2</div>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
                        <span style={{ color: '#ffffff', fontWeight: 700 }}>İçerik Performansı:</span> Blog içeriklerindeki anahtar kelime odağı, web sitesi trafiğine organik olarak %8 katkı sağlamıştır.
                      </p>
                   </li>
                   <li style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', fontWeight: 900 }}>3</div>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
                        <span style={{ color: '#ffffff', fontWeight: 700 }}>Gelecek Dönem:</span> Önümüzdeki ay Video içeriklere ağırlık verilerek sosyal medya etkileşim oranlarının %20 artırılması hedeflenmektedir.
                      </p>
                   </li>
                </ul>
             </div>

             <div style={{ background: '#f0f9ff', padding: '35px', borderRadius: '32px', border: '1px solid #e0f2fe', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0369a1', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>Danışman Notu</h3>
                <p style={{ fontSize: '13px', color: '#0c4a6e', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                  "Bu ay yakaladığımız ivme, marka bilinirliğini üst seviyeye taşımak için harika bir temel oluşturdu. Veriye dayalı stratejilerimizle büyüme odaklı çalışmaya devam ediyoruz."
                </p>
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>BA</div>
                   <div>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Beyin Atölyesi</p>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Dijital Strateji Ekibi</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Footer Information */}
          <div style={{ marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>© {displayYear} BEYİN ATÖLYESİ - TÜM HAKLARI SAKLIDIR.</p>
             <p style={{ fontSize: '10px', color: '#cbd5e1', margin: 0 }}>www.beyinatolyesi.com | Dijital Raporlama v2.0</p>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
