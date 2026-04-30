'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, TrendingUp, CheckCircle2, Clock, Play, 
  Link as LinkIcon, Edit3, Trash2, CheckCircle, Circle, 
  ChevronRight 
} from 'lucide-react';
import { toggleTaskAction, updateTaskDetailAction, deleteTaskAction } from '@/app/actions';
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
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const totalTasks = client.tasks.length;
  const completedTasks = client.tasks.filter(t => t.status);
  const pendingTasks = client.tasks.filter(t => !t.status);
  const successRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const now = new Date();
  const currentMonthTasks = client.tasks.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const completedThisMonth = currentMonthTasks.filter(t => t.status).length;

  const platformStats = {};
  const specialTasksStats = [];
  
  client.tasks.filter(t => t.type === 'SOCIAL').forEach(t => {
    if (t.platform) {
      platformStats[t.platform] = (platformStats[t.platform] || 0) + (t.status ? 1 : 0);
    } else {
      specialTasksStats.push(t);
    }
  });

  const openEditModal = (task) => {
    setActiveTask(task);
    setNoteInput(task.note || '');
    setLinkInput(task.link || '');
    setSelectedPlatform(task.platform);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('taskId', activeTask.id);
      formData.append('note', noteInput);
      formData.append('link', linkInput);
      formData.append('platform', selectedPlatform || '');
      
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ background: 'var(--accent-gradient)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Genel Başarı Oranı</h3>
          <p style={{ color: 'white', fontSize: '3rem', fontWeight: 700 }}>%{successRate}</p>
          <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '3px', marginTop: '1rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${successRate}%`, backgroundColor: 'white' }}></div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '1rem' }}>Toplam {totalTasks} görevden {completedTasks.length} tanesi tamamlandı.</p>
        </div>

        <div 
          className="card card-interactive" 
          onClick={() => setShowCompletedModal(true)}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', cursor: 'pointer' }}
        >
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Tamamlanan Görevler</h3>
          <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{completedTasks.length}</p>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
             Listeyi Görüntüle <ChevronRight size={14} />
          </div>
        </div>

        <div 
          className="card card-interactive" 
          onClick={() => setShowPendingModal(true)}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', cursor: 'pointer' }}
        >
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
            <Clock size={24} />
          </div>
          <h3 className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Bekleyen İşler</h3>
          <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pendingTasks.length}</p>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>
             Listeyi Görüntüle <ChevronRight size={14} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <h3 className="heading-2" style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} /> Platform Bazlı Paylaşım Dağılımı
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Regular Platforms */}
            {Object.keys(platformStats).map(platform => (
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
                    width: `${Math.min(100, (platformStats[platform] / (completedTasks.length || 1)) * 100)}%`, 
                    backgroundColor: 'var(--accent-primary)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
            ))}

            {/* Individual Special Tasks */}
            {specialTasksStats.map(task => (
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
                    width: task.status ? '100%' : '15%', 
                    backgroundColor: task.status ? '#10b981' : 'var(--border-color)',
                    borderRadius: '4px',
                    opacity: task.status ? 1 : 0.3
                  }}></div>
                </div>
              </div>
            ))}

            {Object.keys(platformStats).length === 0 && specialTasksStats.length === 0 && (
                <p className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>Henüz paylaşım verisi yok.</p>
            )}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <h3 className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Aylık Verimlilik</h3>
          <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="150" height="150" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent-primary)" strokeWidth="8" 
                  strokeDasharray={`${(completedThisMonth / (currentMonthTasks.length || 1)) * 283} 283`}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
             </svg>
             <div style={{ position: 'absolute', fontSize: '1.5rem', fontWeight: 700 }}>{completedThisMonth}</div>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>{now.toLocaleString('tr-TR', { month: 'long' })} Ayı Verimliliği</p>
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
              <label className="input-label">Platform Seçin (Opsiyonel)</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.keys(PLATFORM_ICONS).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPlatform(p)}
                    style={{
                      padding: '0.5rem 0.75rem',
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
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Durum:</span>
                <button 
                  type="button"
                  onClick={() => handleToggleStatus(activeTask)}
                  style={{ 
                    background: activeTask?.status ? '#10b981' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {activeTask?.status ? 'Tamamlandı' : 'Bekliyor'}
                </button>
            </div>
            
            <button 
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}
              title="Görevi Sil"
            >
              <Trash2 size={18} />
            </button>
          </div>
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
    </div>
  );
}
