'use client';

import { useState } from 'react';
import { Shield, Save, Check, X } from 'lucide-react';
import { updateRolePermissionsAction } from '@/app/actions';
import { useTheme } from '@/app/components/theme-provider';

export default function RolePermissionsEditor({ roles, groups, initialPermissions, initialAssignableRoles = {}, assignableRoleOptions = [] }) {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [assignableRoles, setAssignableRoles] = useState(initialAssignableRoles || {});
  const [activeRole, setActiveRole] = useState(roles[0]?.key || '');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const { setGlobalLoading } = useTheme();

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

  const toggleAssignableRole = (roleKey, targetRole) => {
    setAssignableRoles((prev) => {
      const current = new Set(prev[roleKey] || []);
      if (current.has(targetRole)) current.delete(targetRole);
      else current.add(targetRole);
      return { ...prev, [roleKey]: [...current] };
    });
    setFeedback(null);
  };

  const handleSave = async () => {
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

  const currentRolePerms = permissions[activeRole] || {};

  return (
    <div className="card">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Shield size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Rol İzinleri</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Her rolün hangi sayfaları ve sekmeleri görebileceğini buradan ayarlayın. Yönetici (ADMIN) her zaman tam erişime sahiptir.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="btn btn-primary"
          style={{ gap: '0.4rem' }}
          disabled={loading}
        >
          <Save size={16} /> {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

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
        <div>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-secondary)',
            marginBottom: '0.6rem',
          }}>
            Kimlere İş Atayabilir?
          </div>
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.02)',
          }}>
            {assignableRoleOptions.map((targetRole, idx) => {
              const allowed = (assignableRoles[activeRole] || []).includes(targetRole.key);
              return (
                <label
                  key={targetRole.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderBottom: idx === assignableRoleOptions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{targetRole.label}</span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{targetRole.key}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAssignableRole(activeRole, targetRole.key)}
                    style={{
                      width: '44px',
                      height: '24px',
                      background: allowed ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      position: 'relative',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0,
                    }}
                    aria-pressed={allowed}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: allowed ? '22px' : '2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'white',
                      transition: 'left 0.2s',
                    }} />
                  </button>
                </label>
              );
            })}
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.section}>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
              marginBottom: '0.6rem',
            }}>
              {group.section}
            </div>
            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.02)',
            }}>
              {group.items.map((item, idx) => {
                const allowed = currentRolePerms[item.key] === true;
                return (
                  <label
                    key={item.key}
                    htmlFor={`perm-${activeRole}-${item.key}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderBottom: idx === group.items.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                        {item.key}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: allowed ? '#10b981' : 'var(--text-secondary)',
                        minWidth: '60px',
                        textAlign: 'right',
                      }}>
                        {allowed ? 'İZİNLİ' : 'KAPALI'}
                      </span>
                      <button
                        id={`perm-${activeRole}-${item.key}`}
                        type="button"
                        onClick={() => toggle(activeRole, item.key)}
                        style={{
                          width: '44px',
                          height: '24px',
                          background: allowed ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          padding: 0,
                          flexShrink: 0,
                        }}
                        aria-pressed={allowed}
                      >
                        <span style={{
                          position: 'absolute',
                          top: '2px',
                          left: allowed ? '22px' : '2px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: 'white',
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }} />
                      </button>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {feedback && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: feedback.kind === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: feedback.kind === 'success' ? '#10b981' : '#ef4444',
            fontSize: '0.85rem',
          }}
        >
          {feedback.kind === 'success' ? <Check size={16} /> : <X size={16} />}
          {feedback.text}
        </div>
      )}
    </div>
  );
}
