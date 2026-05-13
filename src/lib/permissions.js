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

// Permission catalog grouped by section.
export const PERMISSION_GROUPS = [
  {
    section: 'Yan Menü Sayfaları',
    items: [
      { key: 'page.credentials', label: 'Giriş Bilgileri' },
      { key: 'page.notes', label: 'Kişisel Notlar' },
      { key: 'page.work_items', label: 'İş Takip' },
    ],
  },
  {
    section: 'Müşteri Detay Sekmeleri',
    items: [
      { key: 'client.tab.stats', label: 'İstatistikler' },
      { key: 'client.tab.notes', label: 'İş Takibi (Notlar)' },
      { key: 'client.tab.dev', label: 'Yazılım' },
      { key: 'client.tab.meta', label: 'Meta Reklamları' },
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
    'client.tab.seo': false,
    'client.tab.social': false,
    'client.tab.settings': false,
  },
};

const SETTING_KEY = 'role_permissions';

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

export async function getRolePermissions() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
    if (!setting) return mergeWithDefaults(null);
    const parsed = JSON.parse(setting.value || '{}');
    return mergeWithDefaults(parsed);
  } catch (error) {
    return mergeWithDefaults(null);
  }
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
  if (role === 'ADMIN') return true;
  return permissions?.[role]?.[key] === true;
}
