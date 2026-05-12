import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';
import prisma from './prisma';

const MAIL_SETTING_KEY = 'mail_config';

function toBool(value, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === 'on';
}

export function sanitizeMailConfig(config) {
  return {
    imapHost: config?.imapHost || '',
    imapPort: Number(config?.imapPort || 993),
    imapSecure: toBool(config?.imapSecure, true),
    smtpHost: config?.smtpHost || '',
    smtpPort: Number(config?.smtpPort || 465),
    smtpSecure: toBool(config?.smtpSecure, true),
    username: config?.username || '',
    fromEmail: config?.fromEmail || config?.username || '',
    fromName: config?.fromName || '',
    hasPassword: !!config?.password,
  };
}

export async function getMailConfig({ includePassword = false } = {}) {
  const setting = await prisma.setting.findUnique({ where: { key: MAIL_SETTING_KEY } });
  if (!setting) return includePassword ? {} : sanitizeMailConfig({});

  let parsed = {};
  try {
    parsed = JSON.parse(setting.value || '{}');
  } catch (error) {
    parsed = {};
  }

  return includePassword ? parsed : sanitizeMailConfig(parsed);
}

export async function saveMailConfig(input) {
  const current = await getMailConfig({ includePassword: true });
  const password = input.password ? String(input.password) : current.password || '';

  const config = {
    imapHost: String(input.imapHost || '').trim(),
    imapPort: Number(input.imapPort || 993),
    imapSecure: toBool(input.imapSecure, true),
    smtpHost: String(input.smtpHost || '').trim(),
    smtpPort: Number(input.smtpPort || 465),
    smtpSecure: toBool(input.smtpSecure, true),
    username: String(input.username || '').trim(),
    password,
    fromEmail: String(input.fromEmail || input.username || '').trim(),
    fromName: String(input.fromName || '').trim(),
  };

  await prisma.setting.upsert({
    where: { key: MAIL_SETTING_KEY },
    update: { value: JSON.stringify(config) },
    create: { key: MAIL_SETTING_KEY, value: JSON.stringify(config) },
  });

  return sanitizeMailConfig(config);
}

function assertReadableConfig(config) {
  if (!config.imapHost || !config.username || !config.password) {
    throw new Error('Mail görüntülemek için IMAP host, kullanıcı adı ve şifre/app password gereklidir.');
  }
}

function assertSendableConfig(config) {
  if (!config.smtpHost || !config.username || !config.password) {
    throw new Error('Mail göndermek için SMTP host, kullanıcı adı ve şifre/app password gereklidir.');
  }
}

export async function listInboxMessages({ limit = 25 } = {}) {
  const config = await getMailConfig({ includePassword: true });
  assertReadableConfig(config);

  const client = new ImapFlow({
    host: config.imapHost,
    port: Number(config.imapPort || 993),
    secure: config.imapSecure !== false,
    auth: {
      user: config.username,
      pass: config.password,
    },
    logger: false,
  });

  await client.connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const status = await client.status('INBOX', { messages: true });
      const total = status.messages || 0;
      if (total === 0) return [];

      const normalizedLimit = Math.max(1, Math.min(Number(limit || 25), 50));
      const start = Math.max(1, total - normalizedLimit + 1);
      const range = `${start}:*`;
      const messages = [];

      for await (const message of client.fetch(range, {
        envelope: true,
        flags: true,
        internalDate: true,
        uid: true,
        bodyStructure: true,
      })) {
        const from = message.envelope?.from?.[0];
        messages.push({
          uid: message.uid,
          subject: message.envelope?.subject || '(Konu yok)',
          from: from ? `${from.name || from.address || ''}${from.name && from.address ? ` <${from.address}>` : ''}` : 'Bilinmiyor',
          date: message.internalDate || message.envelope?.date || null,
          seen: Array.from(message.flags || []).includes('\\Seen'),
        });
      }

      return messages.sort((a, b) => Number(b.uid) - Number(a.uid));
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function sendMail({ to, subject, text }) {
  const config = await getMailConfig({ includePassword: true });
  assertSendableConfig(config);

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort || 465),
    secure: config.smtpSecure !== false,
    auth: {
      user: config.username,
      pass: config.password,
    },
  });

  const info = await transporter.sendMail({
    from: config.fromName ? `"${config.fromName}" <${config.fromEmail || config.username}>` : (config.fromEmail || config.username),
    to,
    subject,
    text,
  });

  return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
}
