import { getSession } from '@/lib/auth';

export default async function Header() {
  const session = await getSession();
  
  if (!session) return null;

  // Translate roles for display
  const roleDisplayMap = {
    'ADMIN': 'Yönetici',
    'DESIGNER': 'Tasarımcı',
    'ADVERTISER': 'Reklamcı',
    'DEVELOPER': 'Yazılımcı'
  };

  const displayRole = roleDisplayMap[session.role] || session.role;

  return (
    <header className="top-header">
      <div className="user-greeting">
        <span className="text-muted">Hoş geldin, </span>
        <span style={{ fontWeight: 600 }}>{session.username}</span>
      </div>
      
      <div className="role-badge">
        {displayRole}
      </div>
    </header>
  );
}
