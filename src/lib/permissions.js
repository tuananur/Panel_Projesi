import prisma from './prisma';

// Configurable roles. ADMIN is always allowed and not configurable.
export const CONFIGURABLE_ROLES = [
  { key: 'DESIGNER', label: 'Tasarımcı' },
  { key: 'DESIGNER_MANAGER', label: 'Tasarım Yetkilisi' },
  { key: 'ADVERTISER', label: 'Reklamcı' },
  { key: 'ADVERTISER_MANAGER', label: 'Reklam Yetkilisi' },
  { key: 'DEVELOPER', label: 'Yazılımcı' },
];

export const ROLE_LABELS = {
  ADMIN: 'Yönetici (Admin)',
  DESIGNER: 'Tasarımcı',
  DESIGNER_MANAGER: 'Tasarım Yetkilisi',
  ADVERTISER: 'Reklamcı',
  ADVERTISER_MANAGER: 'Reklam Yetkilisi',
  DEVELOPER: 'Yazılımcı',
};

export const USER_ROLES = [
  { key: 'ADMIN', label: ROLE_LABELS.ADMIN },
  ...CONFIGURABLE_ROLES,
];

export const ASSIGNABLE_ROLE_OPTIONS = USER_ROLES;

// Permission catalog grouped by section.
export const PERMISSION_GROUPS = [
  {
    section: 'Yan Menü Sayfaları',
    items: [
      { key: 'page.clients', label: 'Müşteriler' },
      { key: 'page.users', label: 'Kullanıcılar' },
      { key: 'page.accounting', label: 'Muhasebe' },
      { key: 'page.logs', label: 'Sistem Logları' },
      { key: 'page.credentials', label: 'Giriş Bilgileri' },
      { key: 'page.notes', label: 'Kişisel Notlar' },
      { key: 'page.work_items', label: 'İş Takip' },
      { key: 'page.mail', label: 'Mail' },
    ],
  },
  {
    section: 'Müşteri Detay Sekmeleri',
    items: [
      { key: 'client.tab.stats', label: 'İstatistikler' },
      { key: 'client.tab.notes', label: 'İş Takibi (Notlar)' },
      { key: 'client.tab.dev', label: 'Yazılım' },
      { key: 'client.tab.meta', label: 'Meta Reklamları' },
      { key: 'client.tab.google', label: 'Google Reklamları' },
      { key: 'client.tab.seo', label: 'SEO Takibi' },
      { key: 'client.tab.social', label: 'Sosyal Medya Takvimi' },
      { key: 'client.tab.settings', label: 'Hizmet Ayarları' },
    ],
  },
];

export const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => i.key));

// Defaults reflect the previously hardcoded behavior so existing users
// keep the same access until an admin changes the configuration.
export const DEFAULT_PERMISSIONS = {
  DESIGNER: {
    'page.credentials': true,
    'page.notes': true,
    'page.work_items': true,
    'client.tab.stats': true,
    'client.tab.notes': true,
    'client.tab.dev': false,
    'client.tab.meta': false,
    'client.tab.google': false,
    'client.tab.seo': false,
    'client.tab.social': true,
    'client.tab.settings': true,
  },
  DESIGNER_MANAGER: {
    'page.credentials': true,
    'page.notes': true,
    'page.work_items': true,
    'client.tab.stats': true,
    'client.tab.notes': true,
    'client.tab.dev': false,
    'client.tab.meta': false,
    'client.tab.google': false,
    'client.tab.seo': false,
    'client.tab.social': true,
    'client.tab.settings': true,
  },
  ADVERTISER: {
    'page.credentials': true,
    'page.notes': true,
    'page.work_items': true,
    'client.tab.stats': true,
    'client.tab.notes': true,
    'client.tab.dev': false,
    'client.tab.meta': true,
    'client.tab.google': true,
    'client.tab.seo': true,
    'client.tab.social': true,
    'client.tab.settings': true,
  },
  ADVERTISER_MANAGER: {
    'page.credentials': true,
    'page.notes': true,
    'page.work_items': true,
    'client.tab.stats': true,
    'client.tab.notes': true,
    'client.tab.dev': false,
    'client.tab.meta': true,
    'client.tab.google': true,
    'client.tab.seo': true,
    'client.tab.social': true,
    'client.tab.settings': true,
  },
  DEVELOPER: {
    'page.credentials': false,
    'page.notes': true,
    'page.work_items': true,
    'client.tab.stats': true,
    'client.tab.notes': false,
    'client.tab.dev': true,
    'client.tab.meta': false,
    'client.tab.google': false,
    'client.tab.seo': false,
    'client.tab.social': false,
    'client.tab.settings': false,
  },
};

const SETTING_KEY = 'role_permissions';
const ASSIGNMENT_SETTING_KEY = 'role_assignment_permissions';

export const DEFAULT_ASSIGNABLE_ROLES = {
  DESIGNER: [],
  DESIGNER_MANAGER: ['ADMIN', 'DESIGNER', 'DESIGNER_MANAGER', 'ADVERTISER', 'ADVERTISER_MANAGER', 'DEVELOPER'],
  ADVERTISER: [],
  ADVERTISER_MANAGER: ['ADMIN', 'DESIGNER', 'DESIGNER_MANAGER', 'ADVERTISER', 'ADVERTISER_MANAGER', 'DEVELOPER'],
  DEVELOPER: [],
};

function mergeWithDefaults(stored) {
  const merged = {};
  for (const { key: roleKey } of CONFIGURABLE_ROLES) {
    const base = DEFAULT_PERMISSIONS[roleKey] || {};
    const override = (stored && stored[roleKey]) || {};
    const roleMap = {};
    for (const permKey of ALL_PERMISSION_KEYS) {
      if (Object.prototype.hasOwnProperty.call(override, permKey)) {
        roleMap[permKey] = override[permKey] === true;
      } else {
        roleMap[permKey] = base[permKey] === true;
      }
    }
    merged[roleKey] = roleMap;
  }
  return merged;
}

export async function getRolePermissions(session = null) {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
    const parsed = setting ? JSON.parse(setting.value || '{}') : null;
    const base = mergeWithDefaults(parsed);

    if (session && session.userId && session.role) {
      const userSetting = await prisma.setting.findUnique({ where: { key: 'user_permissions' } });
      if (userSetting) {
        const userOverrides = JSON.parse(userSetting.value || '{}');
        const userSpecificPerms = userOverrides[session.userId];
        const upperRole = String(session.role).toUpperCase();

        if (userSpecificPerms && base[upperRole]) {
          // Merge user-specific overrides directly into their role's base permissions
          base[upperRole] = { ...base[upperRole], ...userSpecificPerms };
        }
      }
    }
    return base;
  } catch (error) {
    return mergeWithDefaults(null);
  }
}

export async function getUserPermissionsSettings() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'user_permissions' } });
    return setting ? JSON.parse(setting.value || '{}') : {};
  } catch (error) {
    return {};
  }
}

export async function saveUserPermissionsSettings(userPermissions) {
  try {
    await prisma.setting.upsert({
      where: { key: 'user_permissions' },
      update: { value: JSON.stringify(userPermissions) },
      create: { key: 'user_permissions', value: JSON.stringify(userPermissions) },
    });
    return userPermissions;
  } catch (error) {
    console.error('Error saving user permissions:', error);
    return {};
  }
}

export async function getRoleAssignableRoles() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: ASSIGNMENT_SETTING_KEY } });
    const stored = setting ? JSON.parse(setting.value || '{}') : {};
    const merged = {};
    for (const { key: roleKey } of CONFIGURABLE_ROLES) {
      const values = Array.isArray(stored?.[roleKey]) ? stored[roleKey] : DEFAULT_ASSIGNABLE_ROLES[roleKey] || [];
      const allowedKeys = new Set(ASSIGNABLE_ROLE_OPTIONS.map((role) => role.key));
      merged[roleKey] = values.filter((key) => allowedKeys.has(key));
    }
    return merged;
  } catch (error) {
    return { ...DEFAULT_ASSIGNABLE_ROLES };
  }
}

export async function saveRoleAssignableRoles(assignableRoles) {
  const sanitized = {};
  const allowedKeys = new Set(ASSIGNABLE_ROLE_OPTIONS.map((role) => role.key));
  for (const { key: roleKey } of CONFIGURABLE_ROLES) {
    const incoming = Array.isArray(assignableRoles?.[roleKey]) ? assignableRoles[roleKey] : [];
    sanitized[roleKey] = [...new Set(incoming.filter((key) => allowedKeys.has(key)))];
  }
  await prisma.setting.upsert({
    where: { key: ASSIGNMENT_SETTING_KEY },
    update: { value: JSON.stringify(sanitized) },
    create: { key: ASSIGNMENT_SETTING_KEY, value: JSON.stringify(sanitized) },
  });
  return sanitized;
}

export async function saveRolePermissions(permissions) {
  const sanitized = {};
  for (const { key: roleKey } of CONFIGURABLE_ROLES) {
    const incoming = permissions?.[roleKey] || {};
    sanitized[roleKey] = {};
    for (const permKey of ALL_PERMISSION_KEYS) {
      sanitized[roleKey][permKey] = incoming[permKey] === true;
    }
  }
  await prisma.setting.upsert({
    where: { key: SETTING_KEY },
    update: { value: JSON.stringify(sanitized) },
    create: { key: SETTING_KEY, value: JSON.stringify(sanitized) },
  });
  return sanitized;
}

// Pure helper: checks a permission against a permissions map.
export function can(permissions, role, key) {
  if (!role) return false;
  const upperRole = String(role).toUpperCase();
  if (upperRole === 'ADMIN') return true;
  return permissions?.[upperRole]?.[key] === true;
}
