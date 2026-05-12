import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import prisma from './prisma';

const MAIL_SETTING_KEY = 'mail_config';
const MAX_SEND_ATTACHMENT_BYTES = 15 * 1024 * 1024;

function toBool(value, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === 'on';
}

function formatAddressList(addresses = []) {
  return addresses.map((address) => {
    const name = address.name || '';
    const mail = address.address || '';
    if (name && mail) return `${name} <${mail}>`;
    return name || mail;
  }).filter(Boolean).join(', ');
}

function getAddressValue(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value.value)) return formatAddressList(value.value);
  return value.text || '';
}

function createImapClient(config) {
  return new ImapFlow({
    host: config.imapHost,
    port: Number(config.imapPort || 993),
    secure: config.imapSecure !== false,
    auth: {
      user: config.username,
      pass: config.password,
    },
    logger: false,
  });
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

export async function getUnreadInboxCount() {
  const config = await getMailConfig({ includePassword: true });
  assertReadableConfig(config);

  const client = createImapClient(config);
  await client.connect();
  try {
    const status = await client.status('INBOX', { unseen: true });
    return Number(status.unseen || 0);
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function listInboxMessages({ limit = 'all' } = {}) {
  const config = await getMailConfig({ includePassword: true });
  assertReadableConfig(config);

  const client = createImapClient(config);
  await client.connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const status = await client.status('INBOX', { messages: true });
      const total = status.messages || 0;
      if (total === 0) return [];

      const shouldFetchAll = limit === 'all' || limit === 0 || limit === null || limit === undefined;
      const normalizedLimit = shouldFetchAll ? total : Math.max(1, Math.min(Number(limit || 50), total));
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
          hasAttachments: !!message.bodyStructure?.childNodes?.some((node) => node.disposition === 'attachment' || node.disposition === 'inline'),
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

export async function getInboxMessage(uid) {
  const config = await getMailConfig({ includePassword: true });
  assertReadableConfig(config);

  const client = createImapClient(config);
  await client.connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const message = await client.fetchOne(Number(uid), { source: true, flags: true, uid: true }, { uid: true });
      if (!message?.source) throw new Error('Mail bulunamadı.');

      const parsed = await simpleParser(message.source);
      const attachments = (parsed.attachments || []).map((attachment, index) => ({
        id: index,
        filename: attachment.filename || `ek-${index + 1}`,
        contentType: attachment.contentType || 'application/octet-stream',
        size: attachment.size || attachment.content?.length || 0,
      }));

      return {
        uid: Number(uid),
        subject: parsed.subject || '(Konu yok)',
        from: getAddressValue(parsed.from),
        to: getAddressValue(parsed.to),
        cc: getAddressValue(parsed.cc),
        date: parsed.date || null,
        text: parsed.text || '',
        html: parsed.html || '',
        attachments,
        seen: Array.from(message.flags || []).includes('\\Seen'),
      };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function markInboxMessagesSeen(uids = []) {
  const config = await getMailConfig({ includePassword: true });
  assertReadableConfig(config);

  const normalizedUids = [...new Set(uids.map((uid) => Number(uid)).filter(Boolean))];
  if (normalizedUids.length === 0) return { count: 0 };

  const client = createImapClient(config);
  await client.connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      await client.messageFlagsAdd(normalizedUids.join(','), ['\\Seen'], { uid: true });
      return { count: normalizedUids.length };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function deleteInboxMessages(uids = []) {
  const config = await getMailConfig({ includePassword: true });
  assertReadableConfig(config);

  const normalizedUids = [...new Set(uids.map((uid) => Number(uid)).filter(Boolean))];
  if (normalizedUids.length === 0) return { count: 0 };

  const client = createImapClient(config);
  await client.connect();
  try {
    const mailboxes = await client.list();
    const trashMailbox = mailboxes.find((box) => box.specialUse === '\\Trash')
      || mailboxes.find((box) => /^(trash|deleted messages|çöp|çöp kutusu)$/i.test(box.path || box.name || ''));

    const lock = await client.getMailboxLock('INBOX');
    try {
      const range = normalizedUids.join(',');
      if (trashMailbox?.path) {
        await client.messageMove(range, trashMailbox.path, { uid: true });
      } else {
        await client.messageDelete(range, { uid: true });
      }
      return { count: normalizedUids.length };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function sendMail({ to, cc, bcc, subject, text, html, attachments = [] }) {
  const config = await getMailConfig({ includePassword: true });
  assertSendableConfig(config);

  const safeAttachments = [];
  let totalSize = 0;

  for (const attachment of attachments) {
    if (!attachment?.filename || !attachment?.content) continue;
    totalSize += attachment.content.length;
    if (totalSize > MAX_SEND_ATTACHMENT_BYTES) {
      throw new Error('Ek dosya toplam boyutu 15 MB sınırını aşıyor.');
    }
    safeAttachments.push({
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType || 'application/octet-stream',
    });
  }

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
    cc: cc || undefined,
    bcc: bcc || undefined,
    subject,
    text,
    html: html || undefined,
    attachments: safeAttachments,
  });

  return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
}
