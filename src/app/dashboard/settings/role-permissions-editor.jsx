'use client';

import { useState, useMemo } from 'react';
import { Shield, Save, Check, X, Users, UserCheck } from 'lucide-react';
import { updateRolePermissionsAction, updateUserPermissionsAction } from '@/app/actions';
import { useTheme } from '@/app/components/theme-provider';

const ROLE_LABELS = {
  ADMIN: 'Yönetici (Admin)',
  DESIGNER: 'Tasarımcı',
  DESIGNER_MANAGER: 'Tasarım Yetkilisi',
  ADVERTISER: 'Reklamcı',
  ADVERTISER_MANAGER: 'Reklam Yetkilisi',
  DEVELOPER: 'Yazılımcı',
};

export default function RolePermissionsEditor({
  roles,
  groups,
  initialPermissions,
  initialAssignableRoles = {},
  assignableRoleOptions = [],
  users = [],
  initialUserPermissions = {},
}) {
  const [mode, setMode] = useState('role'); // 'role' | 'user'
  const [permissions, setPermissions] = useState(initialPermissions);
  const [assignableRoles, setAssignableRoles] = useState(initialAssignableRoles || {});
  const [activeRole, setActiveRole] = useState(roles[0]?.key || '');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userPermissions, setUserPermissions] = useState(initialUserPermissions || {});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const { setGlobalLoading } = useTheme();

  // Find the selected user object
  const selectedUser = useMemo(() => users.find((u) => String(u.id) === String(selectedUserId)), [users, selectedUserId]);

  // Get base role perms for selected user (to show defaults)
  const baseRolePerms = useMemo(() => {
    if (!selectedUser) return {};
    return permissions[selectedUser.role] || {};
  }, [selectedUser, permissions]);

  // Current user-specific overrides
  const currentUserOverrides = useMemo(() => {
    if (!selectedUserId) return {};
    return userPermissions[selectedUserId] || {};
  }, [selectedUserId, userPermissions]);

  // Merged: base role perms + user-specific overrides
  const currentUserPerms = useMemo(() => {
    return { ...baseRolePerms, ...currentUserOverrides };
  }, [baseRolePerms, currentUserOverrides]);

  const toggle = (roleKey, permKey) => {
    setPermissions((prev) => ({
      ...prev,
      [roleKey]: {
        ...(prev[roleKey] || {}),
        [permKey]: !(prev[roleKey]?.[permKey] === true),
      },
    }));
    setFeedback(null);
  };

  const toggleUserPerm = (permKey) => {
    if (!selectedUserId) return;
    setUserPermissions((prev) => {
      const currentOverrides = prev[selectedUserId] || {};
      // The "effective" value before this toggle
      const effectiveValue = currentUserPerms[permKey] === true;
      return {
        ...prev,
        [selectedUserId]: {
          ...currentOverrides,
          [permKey]: !effectiveValue,
        },
      };
    });
    setFeedback(null);
  };

  const toggleAssignableRole = (roleKey, targetRole) => {
    setAssignableRoles((prev) => {
      const current = new Set(prev[roleKey] || []);
      if (current.has(targetRole)) current.delete(targetRole);
      else current.add(targetRole);
      return { ...prev, [roleKey]: [...current] };
    });
    setFeedback(null);
  };

  const handleSaveRole = async () => {
    if (loading) return;
    setLoading(true);
    setGlobalLoading(true);
    setFeedback(null);
    const result = await updateRolePermissionsAction(permissions, assignableRoles);
    if (result?.error) {
      setFeedback({ kind: 'error', text: result.error });
    } else {
      setFeedback({ kind: 'success', text: 'İzinler kaydedildi. Kullanıcılar bir sonraki sayfa yüklemesinde yeni izinlere göre yönlendirilecek.' });
    }
    setLoading(false);
    setGlobalLoading(false);
  };

  const handleSaveUser = async () => {
    if (loading) return;
    setLoading(true);
    setGlobalLoading(true);
    setFeedback(null);
    const result = await updateUserPermissionsAction(userPermissions);
    if (result?.error) {
      setFeedback({ kind: 'error', text: result.error });
    } else {
      setFeedback({ kind: 'success', text: `Kullanıcı bazlı izinler kaydedildi.` });
    }
    setLoading(false);
    setGlobalLoading(false);
  };

  const currentRolePerms = permissions[activeRole] || {};

  return (
    <div className="card">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Shield size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>İzin Yönetimi</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Rol veya kullanıcı bazında sayfa ve sekme erişimini ayarlayın.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={mode === 'role' ? handleSaveRole : handleSaveUser}
          className="btn btn-primary"
          style={{ gap: '0.4rem' }}
          disabled={loading || (mode === 'user' && !selectedUserId)}
        >
          <Save size={16} /> {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => { setMode('role'); setFeedback(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: mode === 'role' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)',
            color: mode === 'role' ? 'white' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Shield size={15} /> Rol Bazlı
        </button>
        <button
          type="button"
          onClick={() => { setMode('user'); setFeedback(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: mode === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)',
            color: mode === 'user' ? 'white' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <UserCheck size={15} /> Kullanıcı Bazlı
        </button>
      </div>

      {/* ─── ROLE MODE ─── */}
      {mode === 'role' && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {roles.map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={() => setActiveRole(role.key)}
                style={{
                  padding: '0.6rem 1.1rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeRole === role.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  color: activeRole === role.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginBottom: '-1px',
                }}
              >
                {role.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Assignable Roles */}
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                Kimlere İş Atayabilir?
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                {assignableRoleOptions.map((targetRole, idx) => {
                  const allowed = (assignableRoles[activeRole] || []).includes(targetRole.key);
                  return (
                    <label key={targetRole.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: idx === assignableRoleOptions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', gap: '1rem' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{targetRole.label}</span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{targetRole.key}</div>
                      </div>
                      <button type="button" onClick={() => toggleAssignableRole(activeRole, targetRole.key)} style={{ width: '44px', height: '24px', background: allowed ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', borderRadius: '12px', position: 'relative', cursor: 'pointer', padding: 0, flexShrink: 0 }} aria-pressed={allowed}>
                        <span style={{ position: 'absolute', top: '2px', left: allowed ? '22px' : '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                      </button>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Permission Groups */}
            {groups.map((group) => (
              <div key={group.section}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                  {group.section}
                </div>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                  {group.items.map((item, idx) => {
                    const allowed = currentRolePerms[item.key] === true;
                    return (
                      <label key={item.key} htmlFor={`perm-${activeRole}-${item.key}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: idx === group.items.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{item.key}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: allowed ? '#10b981' : 'var(--text-secondary)', minWidth: '60px', textAlign: 'right' }}>
                            {allowed ? 'İZİNLİ' : 'KAPALI'}
                          </span>
                          <button id={`perm-${activeRole}-${item.key}`} type="button" onClick={() => toggle(activeRole, item.key)} style={{ width: '44px', height: '24px', background: allowed ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', padding: 0, flexShrink: 0 }} aria-pressed={allowed}>
                            <span style={{ position: 'absolute', top: '2px', left: allowed ? '22px' : '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                          </button>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ─── USER MODE ─── */}
      {mode === 'user' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* User Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Kullanıcı Seç
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => { setSelectedUserId(e.target.value); setFeedback(null); }}
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <option value="">— Kullanıcı seçin —</option>
              {users.filter((u) => u.role !== 'ADMIN').map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({ROLE_LABELS[u.role] || u.role})
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <>
              {/* Info banner */}
              <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--accent-primary)' }}>{selectedUser.username}</strong> kullanıcısı <strong>{ROLE_LABELS[selectedUser.role] || selectedUser.role}</strong> rolündedir.
                Bu izinler sadece bu kullanıcıya özel geçerli olur ve rol izinlerini geçersiz kılar.
              </div>

              {/* Permission Groups */}
              {groups.map((group) => (
                <div key={group.section}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                    {group.section}
                  </div>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                    {group.items.map((item, idx) => {
                      const effectiveAllowed = currentUserPerms[item.key] === true;
                      const hasOverride = Object.prototype.hasOwnProperty.call(currentUserOverrides, item.key);
                      const roleDefault = baseRolePerms[item.key] === true;
                      return (
                        <label key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: idx === group.items.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', gap: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</span>
                              {hasOverride && (
                                <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                                  KULLANICIYA ÖZEL
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                              {item.key} • Rol varsayılanı: {roleDefault ? 'İzinli' : 'Kapalı'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: effectiveAllowed ? '#10b981' : 'var(--text-secondary)', minWidth: '60px', textAlign: 'right' }}>
                              {effectiveAllowed ? 'İZİNLİ' : 'KAPALI'}
                            </span>
                            <button type="button" onClick={() => toggleUserPerm(item.key)} style={{ width: '44px', height: '24px', background: effectiveAllowed ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)', border: `1px solid ${hasOverride ? 'rgba(99,102,241,0.5)' : 'var(--border-color)'}`, borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', padding: 0, flexShrink: 0 }} aria-pressed={effectiveAllowed}>
                              <span style={{ position: 'absolute', top: '2px', left: effectiveAllowed ? '22px' : '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                            </button>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {!selectedUser && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <Users size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.9rem' }}>Ayarlamak istediğiniz kullanıcıyı seçin.</p>
            </div>
          )}
        </div>
      )}

      {feedback && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: feedback.kind === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: feedback.kind === 'success' ? '#10b981' : '#ef4444', fontSize: '0.85rem' }}>
          {feedback.kind === 'success' ? <Check size={16} /> : <X size={16} />}
          {feedback.text}
        </div>
      )}
    </div>
  );
}
