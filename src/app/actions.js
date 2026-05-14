'use server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession, destroySession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { deleteMessages, getMailAddressSuggestions, getMailConfig, getMessage, getUnreadInboxCount, listMessages, markMessagesSeen, saveMailConfig, sendMail } from '@/lib/mail';
import { ASSIGNABLE_ROLE_OPTIONS, can, getRoleAssignableRoles, getRolePermissions, saveRoleAssignableRoles, saveRolePermissions } from '@/lib/permissions';
import { SPECIAL_DAYS } from '@/lib/holidays';
async function logActivity(action, entityType, details, clientId = null) {
  try {
    const session = await getSession();
    if (!session) return;
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        clientId: clientId ? parseInt(clientId) : null,
        action,
        entityType,
        details
      }
    });
  } catch (error) {
    console.error('Logging error:', error);
  }
}
export async function loginAction(formData) {
  const username = formData.get('username');
  const password = formData.get('password');
  if (!username) {
    return { error: 'Kullanıcı adı gerekli.' };
  }
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: 'insensitive'
      }
    }
  });
  if (!user) {
    return { error: 'Geçersiz kullanıcı adı veya şifre.' };
  }
  // If password is null, it means first login
  if (!user.password) {
    await createSession(user.id, user.username, user.role, true);
    redirect('/set-password');
  }
  // Normal login
  if (!password) {
    return { error: 'Şifre gerekli.' };
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return { error: 'Geçersiz kullanıcı adı veya şifre.' };
  }
  await createSession(user.id, user.username, user.role, false);
  redirect('/dashboard');
}
export async function setPasswordAction(userId, formData) {
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  if (!password || password.length < 6) {
    return { error: 'Şifre en az 6 karakter olmalıdır.' };
  }
  if (password !== confirmPassword) {
    return { error: 'Şifreler eşleşmiyor.' };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  await createSession(updatedUser.id, updatedUser.username, updatedUser.role, false);
  redirect('/dashboard');
}
export async function logoutAction() {
  await destroySession();
  return { success: true };
}
export async function createUserAction(formData) {
  const username = formData.get('username');
  const role = formData.get('role');
  const managerIdRaw = formData.get('managerId');
  const managerId = managerIdRaw ? parseInt(managerIdRaw) : null;
  if (!username || !role) {
    return { error: 'Kullanıcı adı ve rol gerekli.' };
  }
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive'
        }
      }
    });
    if (existingUser) {
      return { error: 'Bu kullanıcı adı zaten kullanımda.' };
    }
    await prisma.user.create({
      data: {
        username,
        role,
        managerId,
        // password is left null intentionally
      },
    });
    await logActivity('CREATE', 'USER', `${username} isimli kullanıcı oluşturuldu.`);
    return { success: true };
  } catch (error) {
    return { error: 'Kullanıcı oluşturulurken hata oluştu. Kullanıcı adı zaten kullanımda olabilir.' };
  }
}
export async function createClientAction(formData) {
  const companyName = formData.get('companyName');
  const website = formData.get('website');
  const contactName = formData.get('contactName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  // services handles multi-select
  const servicesList = formData.getAll('services');
  const services = JSON.stringify(servicesList);
  const websiteType = formData.get('websiteType');
  const blogApiUrl = formData.get('blogApiUrl') || null;
  const logoUrl = formData.get('logoUrl') || null;
  if (!companyName || !contactName) {
    return { error: 'Gerekli alanları doldurun.' };
  }
  try {
    await prisma.client.create({
      data: {
        companyName,
        website,
        contactName,
        email,
        phone,
        services,
        websiteType,
        blogApiUrl,
        logoUrl
      },
    });
    const newClient = await prisma.client.findFirst({ where: { companyName }, orderBy: { createdAt: 'desc' } });
    await logActivity('CREATE', 'CLIENT', `${companyName} isimli müşteri sisteme eklendi.`, newClient?.id);
    return { success: true };
  } catch (error) {
    return { error: 'Müşteri eklenirken hata oluştu.' };
  }
}
export async function deleteUserAction(formData) {
  const id = parseInt(formData.get('id'));
  if (!id) return { error: 'Geçersiz ID' };
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    await prisma.user.delete({ where: { id } });
    await logActivity('DELETE', 'USER', `${user?.username || id} isimli kullanıcı silindi.`);
    return { success: true };
  } catch (error) {
    return { error: 'Kullanıcı silinemedi.' };
  }
}
export async function deleteClientAction(formData) {
  const id = parseInt(formData.get('id'));
  if (!id) return { error: 'Geçersiz ID' };
  try {
    const client = await prisma.client.findUnique({ where: { id } });
    await prisma.client.delete({ where: { id } });
    await logActivity('DELETE', 'CLIENT', `${client?.companyName || id} isimli müşteri ve tüm verileri silindi.`, id);
    return { success: true };
  } catch (error) {
    return { error: 'Müşteri silinemedi.' };
  }
}
export async function updateUserAction(formData) {
  const id = parseInt(formData.get('id'));
  const username = formData.get('username');
  const role = formData.get('role');
  const managerIdRaw = formData.get('managerId');
  const managerId = managerIdRaw ? parseInt(managerIdRaw) : null;
  if (!id || !username || !role) return { error: 'Gerekli alanlar eksik.' };
  if (managerId === id) return { error: 'Kullanıcı kendi yetkilisi olamaz.' };
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive'
        },
        NOT: { id }
      }
    });
    if (existingUser) {
      return { error: 'Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor.' };
    }
    await prisma.user.update({
      where: { id },
      data: { username, role, managerId }
    });
    await logActivity('UPDATE', 'USER', `${username} isimli kullanıcının bilgileri güncellendi.`);
    return { success: true };
  } catch (error) {
    return { error: 'Kullanıcı güncellenemedi.' };
  }
}
export async function updateClientAction(formData) {
  const id = parseInt(formData.get('id'));
  const companyName = formData.get('companyName');
  const website = formData.get('website');
  const contactName = formData.get('contactName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const servicesList = formData.getAll('services');
  const services = JSON.stringify(servicesList);
  const websiteType = formData.get('websiteType');
  const blogApiUrl = formData.get('blogApiUrl') || null;
  const logoUrl = formData.get('logoUrl') || null;
  if (!id || !companyName || !contactName) return { error: 'Gerekli alanlar eksik.' };
  try {
    await prisma.client.update({
      where: { id },
      data: { companyName, website, contactName, email, phone, services, websiteType, blogApiUrl, logoUrl }
    });
    await logActivity('UPDATE', 'CLIENT', `${companyName} isimli müşterinin bilgileri güncellendi.`, id);
    return { success: true };
  } catch (error) {
    return { error: 'Müşteri güncellenemedi.' };
  }
}
export async function toggleTaskAction(formData) {
  const taskId = parseInt(formData.get('taskId'));
  const status = formData.get('status') === 'true';
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status }
    });
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { client: true } });
    await logActivity('TOGGLE', 'TASK', `${task?.client.companyName} için ${task?.platform || 'Özel'} görevi ${status ? 'Tamamlandı' : 'Bekliyor'} olarak işaretlendi.`, task?.clientId);
    return { success: true };
  } catch (error) {
    return { error: 'Görev güncellenemedi.' };
  }
}
export async function updateTaskDetailAction(formData) {
  const taskId = parseInt(formData.get('taskId'));
  const link = formData.get('link');
  const note = formData.get('note');
  const platform = formData.get('platform') || null;
  const content = formData.get('content') || null;
  const status = formData.get('status') === 'true';
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { link, note, platform, content, status }
    });
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { client: true } });
    await logActivity('UPDATE', 'TASK', `${task?.client.companyName} için ${task?.platform || 'Özel'} görevinin detayları güncellendi.`, task?.clientId);
    return { success: true };
  } catch (error) {
    return { error: 'Görev detayları güncellenemedi.' };
  }
}
export async function deleteTaskAction(formData) {
  const taskId = parseInt(formData.get('taskId'));
  if (!taskId) return { error: 'Geçersiz ID' };
  try {
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { client: true } });
    await prisma.task.delete({ where: { id: taskId } });
    await logActivity('DELETE', 'TASK', `${task?.client.companyName} için ${task?.platform || 'Özel'} görevi silindi.`, task?.clientId);
    return { success: true };
  } catch (error) {
    return { error: 'Görev silinemedi.' };
  }
}
export async function addTaskAction(formData) {
  const clientId = parseInt(formData.get('clientId'));
  const type = formData.get('type');
  const date = new Date(formData.get('date'));
  const platform = formData.get('platform') || null;
  const link = formData.get('link') || null;
  const note = formData.get('note') || (type === 'BLOG' ? 'Manuel Blog' : 'Yeni Görev');
  const content = formData.get('content') || null;
  const status = formData.get('status') === 'true';
  try {
    await prisma.task.create({
      data: {
        clientId,
        type,
        date,
        platform,
        link,
        note,
        content,
        status
      }
    });
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    await logActivity('CREATE', 'TASK', `${client?.companyName} için yeni bir ${type === 'BLOG' ? 'Blog' : 'Sosyal Medya'} görevi (${platform || 'Özel'}) eklendi.`, clientId);
    return { success: true };
  } catch (error) {
    return { error: 'Görev eklenemedi.' };
  }
}
export async function updateClientSettingsAction(clientId, formData) {
  const weeklyBlogTarget = parseInt(formData.get('weeklyBlogTarget') || '0');
  const email = formData.get('email');
  const socialAccounts = formData.get('socialAccounts'); // Already JSON string from client
  const socialSchedule = formData.get('socialSchedule'); // Already JSON string from client
  const specialInstructions = formData.get('specialInstructions');
  const logoUrl = formData.get('logoUrl') || null;
  try {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        weeklyBlogTarget,
        email,
        socialAccounts,
        socialSchedule,
        specialInstructions,
        logoUrl,
        metaEnabled: formData.get('metaEnabled') === 'on',
        metaAdAccountId: formData.get('metaAdAccountId'),
        metaAccessToken: formData.get('metaAccessToken'),
        googleEnabled: formData.get('googleEnabled') === 'on',
        googleCustomerId: formData.get('googleCustomerId'),
        googleRefreshToken: formData.get('googleRefreshToken')
      }
    });
    await logActivity('UPDATE', 'SETTINGS', `Müşteri ayarları güncellendi.`, clientId);
    return { success: true };
  } catch (error) {
    return { error: 'Ayarlar güncellenemedi.' };
  }
}
export async function getLatestLogIdAction() {
  const log = await prisma.activityLog.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true }
  });
  return log?.id || 0;
}
export async function syncBlogsAction(clientId) {
  console.log('Starting sync for client:', clientId);
  try {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(clientId) },
      include: { tasks: { where: { type: 'BLOG' } } }
    });
    if (!client) {
      console.error('Client not found:', clientId);
      return { error: 'Müşteri bulunamadı.' };
    }
    if (!client.blogApiUrl) {
      console.error('API URL not set for client:', client.companyName);
      return { error: 'API URL tanımlanmamış.' };
    }
    console.log('Fetching from:', client.blogApiUrl);
    const response = await fetch(client.blogApiUrl, { cache: 'no-store' });
    if (!response.ok) {
      console.error('API request failed with status:', response.status);
      throw new Error('API isteği başarısız oldu.');
    }
    const blogs = await response.json();
    console.log('Total items fetched from API:', Array.isArray(blogs) ? blogs.length : 'not an array');
    let addedCount = 0;
    // Standard list structure or nested under 'data'/'blogs'
    const blogList = Array.isArray(blogs) ? blogs : (blogs.data || blogs.blogs || []);
    const urlObj = new URL(client.blogApiUrl);
    const origin = urlObj.origin;
    for (const blog of blogList) {
      // Mapping for tacambalaj.com API: published_at, title, slug
      const publishDate = blog.published_at || blog.published_date || blog.publish_date || blog.createdAt;
      if (!publishDate) continue;
      // Construct link: base URL + language prefix + normalized slug
      let slug = blog.slug || blog.url || blog.link || '';
      if (slug.startsWith('/')) slug = slug.substring(1);
      const link = client.websiteType === 'BEYIN_ATOLYESI' 
        ? `${origin}/tr/${slug}` 
        : (blog.link || blog.url || `${origin}/${slug}`);
      const targetDate = new Date(publishDate);
      const title = blog.title || 'Otomatik Çekilen Blog';
      const content = blog.data?.content || blog.content || null;
      // Smart Update: Check if task with same title and date exists
      const existingTask = client.tasks.find(t => {
        const taskDate = new Date(t.date);
        return t.note === title && 
               taskDate.getFullYear() === targetDate.getFullYear() &&
               taskDate.getMonth() === targetDate.getMonth() &&
               taskDate.getDate() === targetDate.getDate();
      });
      if (existingTask) {
        // If link or content is different, update it
        if (existingTask.link !== link || existingTask.content !== content) {
          await prisma.task.update({
            where: { id: existingTask.id },
            data: { link, content }
          });
        }
        continue;
      }
      await prisma.task.create({
        data: {
          clientId: client.id,
          type: 'BLOG',
          date: targetDate,
          link: link,
          note: title,
          content: content,
          status: true
        }
      });
      addedCount++;
    }
    await logActivity('UPDATE', 'CLIENT', `${client.companyName} için ${addedCount} yeni blog otomatik olarak senkronize edildi.`, client.id);
    return { success: true, addedCount };
  } catch (error) {
    console.error('Sync error:', error);
    return { error: 'Bloglar senkronize edilirken bir hata oluştu.' };
  }
}
export async function removeScheduleDayAction(formData) {
  const clientId = parseInt(formData.get('clientId'));
  const platform = formData.get('platform');
  const dayName = formData.get('dayName');
  try {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    const schedule = JSON.parse(client.socialSchedule || '{}');
    if (schedule[platform]) {
      schedule[platform] = schedule[platform].filter(d => d !== dayName);
      await prisma.client.update({
        where: { id: clientId },
        data: { socialSchedule: JSON.stringify(schedule) }
      });
      await logActivity('UPDATE', 'CLIENT', `${client.companyName} için ${platform} takviminden ${dayName} günü kaldırıldı.`, clientId);
    }
    return { success: true };
  } catch (error) {
    return { error: 'Takvim güncellenemedi.' };
  }
}
export async function bulkDeleteDayAction(formData) {
  const clientId = parseInt(formData.get('clientId'));
  const dateStr = formData.get('date');
  const platformsToHide = JSON.parse(formData.get('platformsToHide') || '[]');
  try {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    // 1. Delete all existing tasks for this day
    await prisma.task.deleteMany({
      where: {
        clientId,
        type: 'SOCIAL',
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
    // 2. Create __DELETED__ tasks for ghost platforms
    for (const p of platformsToHide) {
      await prisma.task.create({
        data: {
          clientId,
          type: 'SOCIAL',
          date: targetDate,
          platform: p,
          note: '__DELETED__',
          status: false
        }
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Bulk delete error:', error);
    return { error: 'Toplu silme başarısız.' };
  }
}
export async function searchTasksAction(query) {
  const session = await getSession();
  if (!session) return { error: 'Yetkisiz erişim.' };
  if (!query || query.length < 2) return { tasks: [] };
  try {
    const orConditions = [
      { note: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } }
    ];
    // Akıllı Tarih Algılama
    const datePattern = /(\d{1,2})[.\/-](\d{1,2})[.\/-]?(\d{2,4})?/;
    const monthNames = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];
    const lowerQuery = query.toLowerCase();
    let searchDate = null;
    // Format 1: 19.05 or 19.05.2024
    const dateMatch = query.match(datePattern);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1;
      const year = dateMatch[3] ? (dateMatch[3].length === 2 ? 2000 + parseInt(dateMatch[3]) : parseInt(dateMatch[3])) : new Date().getFullYear();
      searchDate = new Date(year, month, day);
    } 
    // Format 2: 19 Mayıs
    else {
      const monthIndex = monthNames.findIndex(m => lowerQuery.includes(m));
      if (monthIndex !== -1) {
        const dayMatch = lowerQuery.match(/(\d{1,2})/);
        const day = dayMatch ? parseInt(dayMatch[1]) : 1;
        const year = new Date().getFullYear();
        searchDate = new Date(year, monthIndex, day);
      }
    }
    if (searchDate && !isNaN(searchDate.getTime())) {
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);
      orConditions.push({
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      });
    }
    const tasks = await prisma.task.findMany({
      where: {
        OR: orConditions
      },
      include: {
        client: {
          select: { id: true, companyName: true }
        }
      },
      orderBy: { date: 'desc' },
      take: 20
    });
    return { tasks };
  } catch (error) {
    console.error('Global search error:', error);
    return { error: 'Arama sırasında bir hata oluştu.' };
  }
}
export async function addNoteAction(formData) {
  const clientIdRaw = formData.get('clientId');
  const clientId = clientIdRaw ? parseInt(clientIdRaw) : null;
  const content = (formData.get('content') || '').toString();
  const titleText = (formData.get('title') || '').toString().trim();
  const title = titleText || null;
  const createdAtRaw = formData.get('createdAt');
  const createdAt = createdAtRaw ? new Date(createdAtRaw) : undefined;
  const assigneeUserIdRaw = formData.get('assigneeUserId');
  const categoryRaw = formData.get('category');
  const category = categoryRaw === 'DEV' ? 'DEV' : 'TASK';
  if (category === 'TASK' && !title) {
    return { error: 'Başlık zorunlu.' };
  }
  if (!title && !content.trim()) {
    return { error: 'Başlık veya not içeriğinden en az biri dolu olmalıdır.' };
  }
  try {
    const session = await getSession();
    const isAdmin = session.role === 'ADMIN';
    const assigneeUserId = isAdmin && assigneeUserIdRaw ? parseInt(assigneeUserIdRaw) : session.userId;
    const createdByUserId = (isAdmin && assigneeUserIdRaw && parseInt(assigneeUserIdRaw) !== session.userId)
      ? session.userId
      : null;
    await prisma.note.create({
      data: {
        clientId,
        userId: assigneeUserId,
        createdByUserId,
        title,
        content,
        category,
        createdAt
      }
    });
    const isDevNote = category === 'DEV';
    let details = isDevNote ? 'Yeni bir yazılım notu eklendi.' : 'Yeni bir kişisel not eklendi.';
    if (clientId) {
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (client) {
        details = isDevNote
          ? `${client.companyName} için yeni bir yazılım notu eklendi.`
          : `${client.companyName} için yeni bir not eklendi.`;
      }
    }
    await logActivity('CREATE', 'NOTE', details, clientId);
    return { success: true };
  } catch (error) {
    return { error: 'Not eklenemedi.' };
  }
}
export async function deleteNoteAction(formData) {
  const noteId = parseInt(formData.get('noteId'));
  if (!noteId) return { error: 'Geçersiz ID' };
  try {
    const session = await getSession();
    const note = await prisma.note.findUnique({ where: { id: noteId }, include: { client: true } });
    if (!note || (note.userId !== session.userId && session.role !== 'ADMIN')) {
      return { error: 'Bu işlemi yapmaya yetkiniz yok.' };
    }
    await prisma.note.delete({ where: { id: noteId } });
    const details = note?.client ? `${note.client.companyName} için bir not silindi.` : 'Bir kişisel not silindi.';
    await logActivity('DELETE', 'NOTE', details, note?.clientId);
    return { success: true };
  } catch (error) {
    return { error: 'Not silinemedi.' };
  }
}
export async function updateNoteAction(formData) {
  const noteId = parseInt(formData.get('noteId'));
  const content = (formData.get('content') || '').toString();
  const titleText = (formData.get('title') || '').toString().trim();
  const title = titleText || null;
  const hasClientIdField = formData.has('clientId');
  const clientIdRaw = formData.get('clientId');
  if (!noteId) return { error: 'Geçersiz ID.' };
  if (!title && !content.trim()) return { error: 'Başlık veya not içeriğinden en az biri dolu olmalıdır.' };
  try {
    const session = await getSession();
    const note = await prisma.note.findUnique({ where: { id: noteId }, include: { client: true } });
    if (!note || (note.userId !== session.userId && session.role !== 'ADMIN')) {
      return { error: 'Bu işlemi yapmaya yetkiniz yok.' };
    }
    // Form `clientId` alanını hiç içermiyorsa mevcut müşteri bağı korunur.
    // Alan varsa: değer boşsa Genel Not (null), doluysa o müşteriye atanır.
    const clientId = hasClientIdField
      ? (clientIdRaw === '' || clientIdRaw == null ? null : parseInt(clientIdRaw))
      : note.clientId;
    let finalContent = content || '';
    if (note.userId !== session.userId && session.role === 'ADMIN') {
      if (finalContent && !finalContent.includes(`(Güncelleme: ${session.username})`)) {
        finalContent = `${finalContent}\n\n(Güncelleme: ${session.username})`;
      }
    }
    let userId = note.userId;
    let createdByUserId = note.createdByUserId;
    if (session.role === 'ADMIN') {
      const assigneeRaw = formData.get('assigneeUserId');
      if (assigneeRaw != null && String(assigneeRaw).trim() !== '') {
        const newAssignee = parseInt(assigneeRaw, 10);
        if (Number.isNaN(newAssignee)) {
          return { error: 'Geçersiz kullanıcı seçimi.' };
        }
        const targetUser = await prisma.user.findUnique({ where: { id: newAssignee } });
        if (!targetUser) {
          return { error: 'Seçilen kullanıcı bulunamadı.' };
        }
        if (newAssignee !== note.userId) {
          userId = newAssignee;
          createdByUserId = newAssignee !== session.userId ? session.userId : null;
        }
      }
    }
    await prisma.note.update({
      where: { id: noteId },
      data: { clientId, title, content: finalContent, userId, createdByUserId }
    });
    const details = note?.client ? `${note.client.companyName} için bir not güncellendi.` : 'Bir kişisel not güncellendi.';
    await logActivity('UPDATE', 'NOTE', details, note?.clientId);
    return { success: true };
  } catch (error) {
    return { error: 'Not güncellenemedi.' };
  }
}
export async function toggleNoteStatusAction(formData) {
  const noteId = parseInt(formData.get('noteId'));
  const isDone = formData.get('isDone') === 'true';
  try {
    const session = await getSession();
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { userId: true }
    });
    if (!note || (note.userId !== session.userId && session.role !== 'ADMIN')) {
      return { error: 'Bu işlemi yapmaya yetkiniz yok.' };
    }
    await prisma.note.update({
      where: { id: noteId },
      data: { isDone }
    });
    return { success: true };
  } catch (error) {
    return { error: 'Not durumu güncellenemedi.' };
  }
}
export async function getLatestNoteIdAction() {
  try {
    const session = await getSession();
    if (!session) return 0;
    const latestNote = await prisma.note.findFirst({
      where: {
        userId: { not: session.userId }
      },
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    return latestNote?.id || 0;
  } catch (error) {
    return 0;
  }
}
export async function getMetaArmyDashboardAction(clientId) {
  try {
    const session = await getSession();
    if (!session) return { error: 'UNAUTHORIZED' };
    const parsedClientId = parseInt(clientId);
    if (!parsedClientId) return { error: 'INVALID_CLIENT' };
    const client = await prisma.client.findUnique({
      where: { id: parsedClientId },
      select: {
        id: true,
        companyName: true,
        metaEnabled: true,
        metaAdAccountId: true,
        metaAccessToken: true,
      }
    });
    if (!client) return { error: 'CLIENT_NOT_FOUND' };
    const [commands, runs, findings, recommendations] = await Promise.all([
      prisma.metaArmyCommand.findMany({
        where: { clientId: parsedClientId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.metaArmyRun.findMany({
        where: { clientId: parsedClientId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.metaArmyFinding.findMany({
        where: { clientId: parsedClientId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.metaArmyRecommendation.findMany({
        where: { clientId: parsedClientId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);
    const latestRun = runs[0] || null;
    const pendingRecommendations = recommendations.filter((item) => item.status === 'PENDING_APPROVAL');
    return {
      success: true,
      client: {
        id: client.id,
        companyName: client.companyName,
        metaEnabled: client.metaEnabled,
        hasAdAccountId: !!client.metaAdAccountId,
        hasAccessToken: !!client.metaAccessToken,
      },
      summary: {
        latestRunAt: latestRun?.createdAt || null,
        latestRunStatus: latestRun?.status || null,
        pendingCommands: commands.filter((item) => item.status === 'QUEUED' || item.status === 'IN_PROGRESS').length,
        pendingApprovals: pendingRecommendations.length,
        criticalFindings: findings.filter((item) => item.severity === 'CRITICAL' || item.severity === 'HIGH').length,
      },
      commands,
      runs,
      findings,
      recommendations,
    };
  } catch (error) {
    console.error('Meta Army dashboard failed:', error);
    return { error: 'META_ARMY_FAILED', details: error.message };
  }
}
export async function createMetaArmyCommandAction(clientId, formData) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Oturum bulunamadı.' };
    const parsedClientId = parseInt(clientId);
    const command = formData.get('command')?.toString().trim();
    const priority = formData.get('priority')?.toString() || 'NORMAL';
    if (!parsedClientId) return { error: 'Geçersiz müşteri.' };
    if (!command || command.length < 5) return { error: 'Komut en az 5 karakter olmalıdır.' };
    const client = await prisma.client.findUnique({
      where: { id: parsedClientId },
      select: { id: true, companyName: true, metaAdAccountId: true, metaAccessToken: true }
    });
    if (!client) return { error: 'Müşteri bulunamadı.' };
    const createdCommand = await prisma.metaArmyCommand.create({
      data: {
        clientId: parsedClientId,
        command,
        priority,
        requestedBy: session.username || `user:${session.userId}`,
        runs: {
          create: {
            clientId: parsedClientId,
            agentName: 'meta-ads-orchestrator',
            status: 'QUEUED',
            summary: 'Panelden yeni komut alındı. Gateway/agent döngüsü bağlandığında işlenecek.',
          }
        }
      },
      include: { runs: true }
    });
    await logActivity('CREATE', 'META_ARMY', `${client.companyName} için Meta Ads Army komutu oluşturuldu.`, parsedClientId);
    return { success: true, command: createdCommand };
  } catch (error) {
    console.error('Meta Army command create failed:', error);
    return { error: 'Komut oluşturulamadı.' };
  }
}
export async function approveMetaArmyRecommendationAction(recommendationId, approvalText) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Oturum bulunamadı.' };
    const parsedId = parseInt(recommendationId);
    if (!parsedId) return { error: 'Geçersiz öneri.' };
    const recommendation = await prisma.metaArmyRecommendation.findUnique({ where: { id: parsedId } });
    if (!recommendation) return { error: 'Öneri bulunamadı.' };
    if (recommendation.status !== 'PENDING_APPROVAL') return { error: 'Bu öneri onay beklemiyor.' };
    const text = approvalText?.toString().trim() || `ONAY: ${parsedId}`;
    const updated = await prisma.metaArmyRecommendation.update({
      where: { id: parsedId },
      data: {
        status: 'APPROVED',
        approvedBy: session.username || `user:${session.userId}`,
        approvalText: text,
        approvedAt: new Date(),
      }
    });
    await logActivity('UPDATE', 'META_ARMY', `Meta Ads Army önerisi onaylandı: ${updated.title}`, updated.clientId);
    return { success: true, recommendation: updated };
  } catch (error) {
    console.error('Meta Army approval failed:', error);
    return { error: 'Öneri onaylanamadı.' };
  }
}
export async function getMetaAdsAction(clientId, datePreset = 'last_30d', since = null, until = null) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(clientId) }
    });
    if (!client) return { error: 'CLIENT_NOT_FOUND' };
    if (!client.metaAdAccountId || !client.metaAccessToken) {
      return { 
        error: 'API_MISSING', 
        debug: { 
          hasId: !!client.metaAdAccountId, 
          hasToken: !!client.metaAccessToken,
          metaEnabled: client.metaEnabled
        } 
      };
    }
    const accountId = client.metaAdAccountId.trim();
    const accessToken = client.metaAccessToken.trim();
    // Ensure accountId starts with act_
    const finalAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    // Determine time range for top-level and nested insights
    let topLevelParams = `date_preset=${datePreset}`;
    let nestedParams = `date_preset(${datePreset})`;
    if (since && until) {
      topLevelParams = `time_range={"since":"${since}","until":"${until}"}`;
      nestedParams = `time_range({"since":"${since}","until":"${until}"})`;
    }
    // Fetch account insights
    const insightsUrl = `https://graph.facebook.com/v19.0/${finalAccountId}/insights?fields=spend,clicks,impressions,reach,cpc,ctr&${topLevelParams}&access_token=${accessToken}`;
    // Fetch active campaigns with detailed insights and fields
    const campaignsUrl = `https://graph.facebook.com/v19.0/${finalAccountId}/campaigns?fields=name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,bid_strategy,insights.${nestedParams}{spend,impressions,reach,inline_link_clicks,cost_per_inline_link_click}&access_token=${accessToken}`;
    // Fetch ad sets with campaign_id and insights
    const adSetsUrl = `https://graph.facebook.com/v19.0/${finalAccountId}/adsets?fields=name,status,daily_budget,lifetime_budget,billing_event,optimization_goal,campaign_id,insights.${nestedParams}{spend,clicks,impressions,reach}&access_token=${accessToken}`;
    // Fetch ads with adset_id and insights
    const adsUrl = `https://graph.facebook.com/v19.0/${finalAccountId}/ads?fields=name,status,adset_id,creative{name,body,image_url,thumbnail_url},insights.${nestedParams}{spend,clicks,impressions,reach,ctr}&limit=50&access_token=${accessToken}`;
    try {
      const [insightsRes, campaignsRes, adSetsRes, adsRes] = await Promise.all([
        fetch(insightsUrl, { cache: 'no-store' }),
        fetch(campaignsUrl, { cache: 'no-store' }),
        fetch(adSetsUrl, { cache: 'no-store' }),
        fetch(adsUrl, { cache: 'no-store' })
      ]);
      const insightsData = await insightsRes.json();
      const campaignsData = await campaignsRes.json();
      const adSetsData = await adSetsRes.json();
      const adsData = await adsRes.json();
      if (insightsData.error) {
        return { error: 'API_ERROR', details: `Insights (Harcama) Hatası: ${insightsData.error.message}`, code: insightsData.error.code };
      }
      if (campaignsData.error) {
        return { error: 'API_ERROR', details: `Kampanya Hatası: ${campaignsData.error.message}`, code: campaignsData.error.code };
      }
      if (adSetsData.error) {
        return { error: 'API_ERROR', details: `Reklam Seti Hatası: ${adSetsData.error.message}`, code: adSetsData.error.code };
      }
      if (adsData.error) {
        return { error: 'API_ERROR', details: `Reklam Detay Hatası: ${adsData.error.message}`, code: adsData.error.code };
      }
      return {
        success: true,
        summary: insightsData.data[0] || null,
        activeCampaigns: campaignsData.data || [],
        adSets: adSetsData.data || [],
        ads: adsData.data || []
      };
    } catch (fetchErr) {
      return { error: 'NETWORK_ERROR', details: fetchErr.message };
    }
  } catch (error) {
    console.error('Meta fetch failed:', error);
    return { error: 'FETCH_FAILED', details: error.message };
  }
}
export async function testMetaConnectionAction(formData) {
  const accountId = formData.get('metaAdAccountId')?.trim();
  const accessToken = formData.get('metaAccessToken')?.trim();
  if (!accountId || !accessToken) {
    return { error: 'Eksik Bilgi', details: 'Lütfen hem Account ID hem de Access Token alanlarını doldurun.' };
  }
  const finalAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
  const url = `https://graph.facebook.com/v19.0/${finalAccountId}?fields=name,account_status&access_token=${accessToken}`;
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    if (data.error) {
      return { 
        success: false, 
        error: 'API Hatası', 
        details: data.error.message,
        code: data.error.code,
        subcode: data.error.error_subcode
      };
    }
    return { 
      success: true, 
      message: `Bağlantı Başarılı! Hesap: ${data.name}`,
      data: data 
    };
  } catch (err) {
    return { success: false, error: 'Ağ Hatası', details: err.message };
  }
}

export async function testGoogleConnectionAction(formData) {
  const customerId = formData.get('googleCustomerId')?.trim();
  let refreshToken = formData.get('googleRefreshToken')?.trim();
  
  if (!refreshToken) {
    const globalSetting = await prisma.setting.findUnique({ where: { key: 'google_ads_global_config' } });
    if (globalSetting) {
      const globalConfig = JSON.parse(globalSetting.value);
      refreshToken = globalConfig.refreshToken;
    }
  }

  if (!customerId || !refreshToken) {
    return { error: 'Eksik Bilgi', details: "Lütfen hem Customer ID alanını doldurun hem de Genel Ayarlar'da Refresh Token tanımlı olduğundan emin olun." };
  }

  // Google Ads API requires an access token, which we get from the refresh token.
  // This is a mock/placeholder logic for now, as real implementation requires OAuth flow
  // and google-ads-api library. We can simulate a check.
  
  try {
    // Basic validation of format
    const idPattern = /^\d{3}-\d{3}-\d{4}$/;
    if (!idPattern.test(customerId)) {
      return { 
        success: false, 
        error: 'Format Hatası', 
        details: 'Google Customer ID formatı hatalı. Örn: 123-456-7890' 
      };
    }

    // In a real scenario, we would try to get an access token
    // For now, we'll return success if basic formats look okay to demonstrate the UI
    return { 
      success: true, 
      message: `Bağlantı Başarılı! (Simüle Edildi). Müşteri ID: ${customerId}`,
    };
  } catch (err) {
    return { success: false, error: 'Hata', details: err.message };
  }
}

export async function getGoogleAdsAction(clientId) {
  try {
    const [client, globalSetting] = await Promise.all([
      prisma.client.findUnique({ where: { id: parseInt(clientId) } }),
      prisma.setting.findUnique({ where: { key: 'google_ads_global_config' } })
    ]);

    if (!client) return { error: 'CLIENT_NOT_FOUND' };
    
    const globalConfig = globalSetting ? JSON.parse(globalSetting.value) : {};
    const refreshToken = client.googleRefreshToken || globalConfig.refreshToken;
    const customerId = client.googleCustomerId;

    if (!customerId || !refreshToken) {
      return { 
        error: 'API_MISSING', 
        debug: { 
          hasId: !!customerId, 
          hasToken: !!refreshToken,
          googleEnabled: client.googleEnabled
        } 
      };
    }

    // Mock data for demonstration as real API requires complex setup
    return {
      success: true,
      summary: {
        spend: 1245.50,
        clicks: 850,
        impressions: 45000,
        reach: 32000,
        cpc: 1.46,
        ctr: 0.018
      },
      activeCampaigns: [
        { id: '1', name: 'Arama Ağı - Marka', status: 'ENABLED', spend: 540.20, clicks: 320, impressions: 5000 },
        { id: '2', name: 'Display - Retargeting', status: 'ENABLED', spend: 300.30, clicks: 410, impressions: 32000 },
        { id: '3', name: 'Video - Tanıtım', status: 'PAUSED', spend: 405.00, clicks: 120, impressions: 8000 }
      ]
    };
  } catch (error) {
    console.error('Google Ads fetch failed:', error);
    return { error: 'FETCH_FAILED', details: error.message };
  }
}

export async function getGoogleAdsGlobalSettingsAction() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: 'Yetkisiz erişim.' };
    const setting = await prisma.setting.findUnique({ where: { key: 'google_ads_global_config' } });
    return { success: true, config: setting ? JSON.parse(setting.value) : {} };
  } catch (error) {
    return { error: 'Google Ads genel ayarları alınamadı.' };
  }
}

export async function saveGoogleAdsGlobalSettingsAction(formData) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: 'Yetkisiz erişim.' };
    
    const config = {
      developerToken: formData.get('developerToken'),
      clientId: formData.get('clientId'),
      clientSecret: formData.get('clientSecret'),
      refreshToken: formData.get('refreshToken'),
    };

    await prisma.setting.upsert({
      where: { key: 'google_ads_global_config' },
      update: { value: JSON.stringify(config) },
      create: { key: 'google_ads_global_config', value: JSON.stringify(config) }
    });

    await logActivity('UPDATE', 'SETTINGS', 'Google Ads global API ayarları güncellendi.');
    return { success: true };
  } catch (error) {
    return { error: 'Ayarlar kaydedilemedi.' };
  }
}

// Mail Actions
export async function getMailSettingsAction() {
  try {
    const session = await getSession();
    if (!session) return { error: 'Oturum bulunamadı.' };
    return { success: true, config: await getMailConfig({ userId: session.userId }) };
  } catch (error) {
    return { error: 'Mail ayarları alınamadı.' };
  }
}
export async function saveMailSettingsAction(formData) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Oturum bulunamadı.' };
    const config = await saveMailConfig({
      enabled: formData.get('enabled'),
      imapHost: formData.get('imapHost'),
      imapPort: formData.get('imapPort'),
      imapSecure: formData.get('imapSecure'),
      smtpHost: formData.get('smtpHost'),
      smtpPort: formData.get('smtpPort'),
      smtpSecure: formData.get('smtpSecure'),
      username: formData.get('username'),
      password: formData.get('password'),
      fromEmail: formData.get('fromEmail'),
      fromName: formData.get('fromName'),
    }, { userId: session.userId });
    await logActivity('UPDATE', 'SETTINGS', 'Mail bağlantı ayarları güncellendi.');
    return { success: true, config };
  } catch (error) {
    return { error: error.message || 'Mail ayarları kaydedilemedi.' };
  }
}
export async function getInboxMessagesAction(limit = 'all') {
  return getMailMessagesAction('inbox', limit);
}
export async function getMailMessagesAction(folder = 'inbox', limit = 'all') {
  try {
    const session = await getSession();
    if (!session) return { error: 'Oturum bulunamadı.' };
    const messages = await listMessages({ folder, limit, userId: session.userId });
    return { success: true, messages };
  } catch (error) {
    return { error: error.message || 'Mailler alınamadı.' };
  }
}
export async function getUnreadMailCountAction() {
  try {
    const session = await getSession();
    if (!session) return { error: 'Oturum bulunamadı.', count: 0 };
    const config = await getMailConfig({ userId: session.userId });
    if (!config.enabled) return { success: true, count: 0, enabled: false };
    return { success: true, count: await getUnreadInboxCount({ userId: session.userId }), enabled: true };
  } catch (error) {
    return { error: error.message || 'Okunmamış mail sayısı alınamadı.', count: 0 };
  }
}
export async function getInboxMessageAction(uid) {
  return getMailMessageAction(uid, 'inbox');
}
export async function getMailMessageAction(uid, folder = 'inbox') {
  try {
    const session = await getSession();
    if (!session) return { error: 'Oturum bulunamadı.' };
    if (!uid) return { error: 'Geçersiz mail.' };
    const message = await getMessage(uid, folder, { userId: session.userId });
    return { success: true, message };
  } catch (error) {
    return { error: error.message || 'Mail detayı alınamadı.' };
  }
}
export async function getMailAddressSuggestionsAction() {
  try {
    const session = await getSession();
    if (!session) return { error: 'Oturum bulunamadı.', suggestions: [] };
    return { success: true, suggestions: await getMailAddressSuggestions({ userId: session.userId }) };
  } catch (error) {
    return { error: error.message || 'Adres önerileri alınamadı.', suggestions: [] };
  }
}
export async function markInboxMessagesReadAction(uids) {
  return markMailMessagesReadAction(uids, 'inbox');
}
export async function markMailMessagesReadAction(uids, folder = 'inbox') {
  try {
    const session = await getSession();
    if (!session) return { error: 'Oturum bulunamadı.' };
    const result = await markMessagesSeen(Array.isArray(uids) ? uids : [uids], folder, { userId: session.userId });
    await logActivity('UPDATE', 'MAIL', `${result.count} mail okundu olarak işaretlendi.`);
    return { success: true, result };
  } catch (error) {
    return { error: error.message || 'Mailler okundu olarak işaretlenemedi.' };
  }
}
export async function deleteInboxMessagesAction(uids) {
  return deleteMailMessagesAction(uids, 'inbox');
}
export async function deleteMailMessagesAction(uids, folder = 'inbox') {
  try {
    const session = await getSession();
    if (!session) return { error: 'Oturum bulunamadı.' };
    const result = await deleteMessages(Array.isArray(uids) ? uids : [uids], folder, { userId: session.userId });
    await logActivity('DELETE', 'MAIL', `${result.count} mail silindi.`);
    return { success: true, result };
  } catch (error) {
    return { error: error.message || 'Mailler silinemedi.' };
  }
}
export async function sendMailAction(formData) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Oturum bulunamadı.' };
    const to = formData.get('to')?.toString().trim();
    const cc = formData.get('cc')?.toString().trim();
    const bcc = formData.get('bcc')?.toString().trim();
    const subject = formData.get('subject')?.toString().trim();
    const text = formData.get('text')?.toString().trim();
    const html = text ? text.replace(/\n/g, '<br />') : '';
    const files = formData.getAll('attachments');
    const attachments = [];
    for (const file of files) {
      if (!file || typeof file === 'string' || !file.name || file.size === 0) continue;
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        content: buffer,
      });
    }
    if (!to || !subject || !text) return { error: 'Alıcı, konu ve mesaj zorunludur.' };
    const result = await sendMail({ to, cc, bcc, subject, text, html, attachments, userId: session.userId });
    await logActivity('CREATE', 'MAIL', `${to} adresine mail gönderildi.`);
    return { success: true, result };
  } catch (error) {
    return { error: error.message || 'Mail gönderilemedi.' };
  }
}
// Accounting Actions
export async function addAccountingEntryAction(formData) {
  const type = formData.get('type');
  const amount = parseFloat(formData.get('amount'));
  const description = formData.get('description');
  const date = new Date(formData.get('date'));
  const frequency = formData.get('frequency') || 'MANUAL';
  if (!type || !amount || !description || !date) {
    return { error: 'Gerekli alanları doldurun.' };
  }
  try {
    await prisma.accountingEntry.create({
      data: {
        type,
        amount,
        description,
        date,
        frequency
      }
    });
    await logActivity('CREATE', 'ACCOUNTING', `${type === 'INCOME' ? 'Gelir' : 'Gider'} eklendi: ${description} (${amount} TL)`);
    return { success: true };
  } catch (error) {
    console.error('Accounting entry error:', error);
    return { error: 'Kayıt eklenirken hata oluştu.' };
  }
}
export async function deleteAccountingEntryAction(formData) {
  const id = parseInt(formData.get('id'));
  if (!id) return { error: 'Geçersiz ID' };
  try {
    const entry = await prisma.accountingEntry.findUnique({ where: { id } });
    await prisma.accountingEntry.delete({ where: { id } });
    await logActivity('DELETE', 'ACCOUNTING', `${entry?.type === 'INCOME' ? 'Gelir' : 'Gider'} silindi: ${entry?.description}`);
    return { success: true };
  } catch (error) {
    return { error: 'Kayıt silinemedi.' };
  }
}
export async function getAccountingEntriesAction() {
  try {
    const entries = await prisma.accountingEntry.findMany({
      orderBy: { date: 'desc' }
    });
    return { success: true, entries };
  } catch (error) {
    return { error: 'Kayıtlar getirilemedi.' };
  }
}
export async function updateSocialCredentialsAction(clientId, platform, type, value) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(clientId) }
    });
    let socialAccounts = {};
    try {
      socialAccounts = JSON.parse(client.socialAccounts || '{}');
    } catch (e) {
      socialAccounts = {};
    }
    // Ensure the platform object exists
    if (!socialAccounts[platform] || typeof socialAccounts[platform] === 'string') {
      // Convert old string URL to new object format if necessary
      const oldUrl = typeof socialAccounts[platform] === 'string' ? socialAccounts[platform] : '';
      socialAccounts[platform] = { url: oldUrl, username: '', password: '' };
    }
    // Update the specific field
    socialAccounts[platform][type] = value;
    await prisma.client.update({
      where: { id: parseInt(clientId) },
      data: {
        socialAccounts: JSON.stringify(socialAccounts)
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Update credentials error:', error);
    return { error: 'Bilgiler güncellenemedi.' };
  }
}
export async function resetUserPasswordAction(userId) {
  try {
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { password: null }
    });
    await logActivity('UPDATE', 'USER', `Kullanıcı şifresi sıfırlandı (ID: ${userId})`);
    return { success: true };
  } catch (error) {
    return { error: 'Şifre sıfırlanamadı.' };
  }
}
export async function updateRolePermissionsAction(permissions, assignableRoles = null) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Bu işlemi yapmaya yetkiniz yok.' };
  }
  try {
    await saveRolePermissions(permissions || {});
    if (assignableRoles) await saveRoleAssignableRoles(assignableRoles);
    await logActivity('UPDATE', 'SETTINGS', 'Rol izinleri güncellendi.');
    return { success: true };
  } catch (error) {
    console.error('updateRolePermissionsAction error:', error);
    return { error: 'İzinler kaydedilemedi.' };
  }
}
const WORK_ITEM_INCLUDE = {
  assignee: { select: { id: true, username: true, role: true, managerId: true } },
  createdBy: { select: { id: true, username: true, role: true } },
  approvedBy: { select: { id: true, username: true, role: true } },
  client: { select: { id: true, companyName: true } },
  events: {
    include: { user: { select: { id: true, username: true, role: true } } },
    orderBy: { createdAt: 'desc' }
  }
};
function isWorkManagerRole(role) {
  return role === 'ADMIN' || role === 'DESIGNER_MANAGER' || role === 'ADVERTISER_MANAGER';
}
async function managedWorkerRoles(role) {
  if (role === 'ADMIN') return ASSIGNABLE_ROLE_OPTIONS.map((item) => item.key);
  const matrix = await getRoleAssignableRoles();
  return matrix?.[role] || [];
}
async function getAssignableUsersForSession(session) {
  if (!session) return [];
  if (session.role === 'ADMIN') {
    return prisma.user.findMany({
      where: { id: { not: session.userId } },
      select: { id: true, username: true, role: true, managerId: true },
      orderBy: [{ role: 'asc' }, { username: 'asc' }]
    });
  }
  const roles = await managedWorkerRoles(session.role);
  if (roles.length === 0) return [];
  return prisma.user.findMany({
    where: { id: { not: session.userId }, role: { in: roles } },
    select: { id: true, username: true, role: true, managerId: true },
    orderBy: { username: 'asc' }
  });
}
async function canAccessWorkItems(session) {
  if (!session) return false;
  if (session.role === 'ADMIN') return true;
  const permissions = await getRolePermissions();
  return can(permissions, session.role, 'page.work_items');
}
async function canManageWorkItem(session, workItem) {
  if (!session || !workItem) return false;
  if (session.role === 'ADMIN') return true;
  if (workItem.createdById === session.userId) return true;
  if (isWorkManagerRole(session.role)) {
    const assignee = workItem.assignee || await prisma.user.findUnique({ where: { id: workItem.assigneeId }, select: { managerId: true } });
    return assignee?.managerId === session.userId;
  }
  return false;
}
function workItemVisibleWhere(session) {
  if (session.role === 'ADMIN') return {};
  const ownVisibility = [
    { assigneeId: session.userId },
    { createdById: session.userId },
  ];
  if (isWorkManagerRole(session.role)) {
    ownVisibility.push({ assignee: { managerId: session.userId } });
  }
  return { OR: ownVisibility };
}
export async function getWorkItemBadgeCountAction() {
  const session = await getSession();
  if (!(await canAccessWorkItems(session))) return { count: 0 };
  const where = { unreadForUserIds: { contains: `\"${session.userId}\"` } };
  try {
    const count = await prisma.workItem.count({ where });
    return { count };
  } catch (error) {
    return { count: 0 };
  }
}
async function createNotification({ userId, title, message, url, type = 'GENERAL', dedupeKey = null }) {
  if (!userId) return null;
  try {
    return await prisma.notification.create({
      data: { userId: Number(userId), title, message, url, type, dedupeKey }
    });
  } catch (error) {
    if (error?.code === 'P2002') return null;
    console.error('Notification create error:', error);
    return null;
  }
}
async function notifyUsers(userIds, payload, actorUserId = null) {
  const ids = [...new Set((userIds || []).filter(Boolean).map(Number))].filter((id) => id !== Number(actorUserId));
  await Promise.all(ids.map((userId) => createNotification({ ...payload, userId })));
}
function daysUntil(date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}
async function ensureReminderNotifications(userId) {
  const reminderDays = [7, 3, 1];
  const workItems = await prisma.workItem.findMany({
    where: {
      dueDate: { not: null },
      status: { notIn: ['APPROVED', 'CANCELLED'] },
      OR: [{ assigneeId: userId }, { createdById: userId }]
    },
    include: { client: { select: { companyName: true } } }
  });
  for (const item of workItems) {
    const left = daysUntil(item.dueDate);
    if (!reminderDays.includes(left)) continue;
    await createNotification({
      userId,
      title: `Teslim tarihine ${left} gün kaldı`,
      message: `${item.title}${item.client?.companyName ? ` (${item.client.companyName})` : ''} işi için teslim tarihi yaklaşıyor.`,
      url: `/dashboard/work-items?notificationWorkItem=${item.id}`,
      type: 'WORK_DUE',
      dedupeKey: `work-due-${item.id}-${left}-${userId}`
    });
  }
  const now = new Date();
  const years = [now.getFullYear(), now.getFullYear() + 1];
  for (const year of years) {
    for (const [monthDay, name] of Object.entries(SPECIAL_DAYS)) {
      const [month, day] = monthDay.split('-').map(Number);
      const date = new Date(year, month - 1, day, 12);
      const left = daysUntil(date);
      if (!reminderDays.includes(left)) continue;
      await createNotification({
        userId,
        title: `${name} yaklaşıyor`,
        message: `${name} özel gününe ${left} gün kaldı.`,
        url: '/dashboard',
        type: 'SPECIAL_DAY',
        dedupeKey: `special-day-${year}-${monthDay}-${left}-${userId}`
      });
    }
  }
}
function notificationSettingKey(userId) {
  return `notification_settings_user_${userId}`;
}
const DEFAULT_NOTIFICATION_SETTINGS = { sound: 'soft' };
export async function getNotificationSettingsAction() {
  const session = await getSession();
  if (!session) return { error: 'Oturum bulunamadı.', settings: DEFAULT_NOTIFICATION_SETTINGS };
  try {
    const setting = await prisma.setting.findUnique({ where: { key: notificationSettingKey(session.userId) } });
    const parsed = setting?.value ? JSON.parse(setting.value) : {};
    return { success: true, settings: { ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed } };
  } catch (error) {
    return { success: true, settings: DEFAULT_NOTIFICATION_SETTINGS };
  }
}
export async function saveNotificationSettingsAction(formData) {
  const session = await getSession();
  if (!session) return { error: 'Oturum bulunamadı.' };
  const allowedSounds = new Set(['soft', 'bell', 'digital', 'none']);
  const sound = formData.get('sound')?.toString() || 'soft';
  const settings = { sound: allowedSounds.has(sound) ? sound : 'soft' };
  await prisma.setting.upsert({
    where: { key: notificationSettingKey(session.userId) },
    update: { value: JSON.stringify(settings) },
    create: { key: notificationSettingKey(session.userId), value: JSON.stringify(settings) },
  });
  return { success: true, settings };
}
export async function getNotificationsAction(limit = 20) {
  const session = await getSession();
  if (!session) return { error: 'Oturum bulunamadı.', notifications: [], count: 0 };
  await ensureReminderNotifications(session.userId);
  const [notifications, count] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit) || 20,
    }),
    prisma.notification.count({ where: { userId: session.userId, readAt: null } })
  ]);
  return { success: true, notifications, count };
}
export async function getNotificationUnreadCountAction() {
  const session = await getSession();
  if (!session) return { count: 0 };
  await ensureReminderNotifications(session.userId);
  return { count: await prisma.notification.count({ where: { userId: session.userId, readAt: null } }) };
}
export async function markNotificationReadAction(notificationId) {
  const session = await getSession();
  if (!session) return { error: 'Oturum bulunamadı.' };
  const id = parseInt(notificationId);
  const notification = await prisma.notification.findFirst({ where: { id, userId: session.userId } });
  if (!notification) return { error: 'Bildirim bulunamadı.' };
  if (!notification.readAt) {
    await prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }
  return { success: true, url: notification.url || '/dashboard' };
}
export async function createWorkItemAction(formData) {
  const session = await getSession();
  if (!(await canAccessWorkItems(session))) {
    return { error: 'İş atama yetkiniz yok.' };
  }
  const title = (formData.get('title') || '').toString().trim();
  const description = (formData.get('description') || '').toString().trim() || null;
  const assigneeId = parseInt(formData.get('assigneeId'));
  const clientIdRaw = formData.get('clientId');
  const clientId = clientIdRaw ? parseInt(clientIdRaw) : null;
  const dueDateRaw = formData.get('dueDate');
  const dueDate = dueDateRaw ? new Date(`${dueDateRaw}T12:00:00`) : null;
  const priority = (formData.get('priority') || 'NORMAL').toString();
  const type = (formData.get('type') || 'OTHER').toString();
  if (!title) return { error: 'Ba�l�k zorunlu.' };
  if (!assigneeId) return { error: 'Atanacak ki�i se�ilmeli.' };
  const assignableUsers = await getAssignableUsersForSession(session);
  if (!assignableUsers.some((u) => u.id === assigneeId)) {
    return { error: 'Bu kullan�c�ya i� atama yetkiniz yok.' };
  }
  try {
    const item = await prisma.workItem.create({
      data: {
        title,
        description,
        assigneeId,
        createdById: session.userId,
        clientId,
        dueDate,
        priority,
        type,
        unreadForUserIds: JSON.stringify([String(assigneeId)]),
        events: {
          create: {
            userId: session.userId,
            type: 'CREATED',
            note: description
          }
        }
      },
      include: WORK_ITEM_INCLUDE
    });
    await notifyUsers([assigneeId], { title: 'Yeni iş atandı', message: `${title} işi size atandı.`, url: `/dashboard/work-items?notificationWorkItem=${item.id}`, type: 'WORK_ASSIGNED' }, session.userId);
    await logActivity('CREATE', 'WORK_ITEM', `${title} işi ${item.assignee.username} kullanıcısına atandı.`, clientId);
    return { success: true, item };
  } catch (error) {
    return { error: '�� atan�rken hata olu�tu.' };
  }
}
function notificationUserIdsForWorkItem(item, actorUserId) {
  const ids = new Set();
  if (item?.assigneeId) ids.add(String(item.assigneeId));
  if (item?.createdById) ids.add(String(item.createdById));
  if (item?.assignee?.managerId) ids.add(String(item.assignee.managerId));
  ids.delete(String(actorUserId));
  return JSON.stringify([...ids]);
}
export async function markWorkItemReadAction(workItemId) {
  const session = await getSession();
  if (!(await canAccessWorkItems(session))) return { error: 'Yetkiniz yok.' };
  const id = parseInt(workItemId);
  const item = await prisma.workItem.findUnique({ where: { id }, include: { assignee: { select: { managerId: true } } } });
  if (!item) return { error: 'İş bulunamadı.' };
  const canSee = session.role === 'ADMIN' || item.assigneeId === session.userId || item.createdById === session.userId || item.assignee?.managerId === session.userId;
  if (!canSee) return { error: 'Yetkiniz yok.' };
  let unread = [];
  try { unread = JSON.parse(item.unreadForUserIds || '[]'); } catch { unread = []; }
  const nextUnread = unread.map(String).filter((userId) => userId !== String(session.userId));
  if (nextUnread.length !== unread.length) {
    await prisma.workItem.update({ where: { id }, data: { unreadForUserIds: JSON.stringify(nextUnread) } });
  }
  return { success: true };
}
export async function startWorkItemAction(workItemId) {
  const session = await getSession();
  if (!(await canAccessWorkItems(session))) return { error: 'Yetkiniz yok.' };
  const id = parseInt(workItemId);
  const item = await prisma.workItem.findUnique({ where: { id }, include: { assignee: { select: { managerId: true } } } });
  if (!item || item.assigneeId !== session.userId) return { error: 'Bu i�i ba�latamazs�n�z.' };
  if (!['ASSIGNED', 'REVISION_REQUESTED'].includes(item.status)) return { error: 'Bu i� ba�lat�lamaz.' };
  await prisma.workItem.update({
    where: { id },
    data: {
      status: 'IN_PROGRESS',
      unreadForUserIds: notificationUserIdsForWorkItem(item, session.userId),
      events: { create: { userId: session.userId, type: 'STARTED' } }
    }
  });
  return { success: true };
}
export async function submitWorkItemAction(formData) {
  const session = await getSession();
  if (!(await canAccessWorkItems(session))) return { error: 'Yetkiniz yok.' };
  const id = parseInt(formData.get('workItemId'));
  const note = (formData.get('note') || '').toString().trim() || null;
  const item = await prisma.workItem.findUnique({ where: { id }, include: { assignee: { select: { managerId: true } } } });
  if (!item || item.assigneeId !== session.userId) return { error: 'Bu i�i teslim edemezsiniz.' };
  if (!['ASSIGNED', 'IN_PROGRESS', 'REVISION_REQUESTED'].includes(item.status)) return { error: 'Bu i� teslim edilemez.' };
  await prisma.workItem.update({
    where: { id },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      lastSubmissionNote: note,
      unreadForUserIds: notificationUserIdsForWorkItem(item, session.userId),
      events: { create: { userId: session.userId, type: 'SUBMITTED', note } }
    }
  });
  await notifyUsers([item.createdById], { title: 'İş onaya gönderildi', message: `${item.title} işi onayınıza gönderildi.`, url: `/dashboard/work-items?notificationWorkItem=${item.id}`, type: 'WORK_SUBMITTED' }, session.userId);
  return { success: true };
}
export async function approveWorkItemAction(workItemId) {
  const session = await getSession();
  if (!(await canAccessWorkItems(session))) return { error: 'Yetkiniz yok.' };
  const id = parseInt(workItemId);
  const item = await prisma.workItem.findUnique({ where: { id }, include: { assignee: { select: { managerId: true } } } });
  if (!(await canManageWorkItem(session, item))) return { error: 'Bu i�i onaylama yetkiniz yok.' };
  if (item.status !== 'SUBMITTED') return { error: 'Sadece onay bekleyen i�ler onaylanabilir.' };
  await prisma.workItem.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: session.userId,
      unreadForUserIds: notificationUserIdsForWorkItem(item, session.userId),
      events: { create: { userId: session.userId, type: 'APPROVED' } }
    }
  });
  await notifyUsers([item.assigneeId], { title: 'İş onaylandı', message: `${item.title} işi onaylandı.`, url: `/dashboard/work-items?notificationWorkItem=${item.id}`, type: 'WORK_APPROVED' }, session.userId);
  return { success: true };
}
export async function requestWorkItemRevisionAction(formData) {
  const session = await getSession();
  if (!(await canAccessWorkItems(session))) return { error: 'Yetkiniz yok.' };
  const id = parseInt(formData.get('workItemId'));
  const note = (formData.get('note') || '').toString().trim();
  if (!note) return { error: 'Revize a��klamas� zorunlu.' };
  const item = await prisma.workItem.findUnique({ where: { id }, include: { assignee: { select: { managerId: true } } } });
  if (!(await canManageWorkItem(session, item))) return { error: 'Bu i�e revize isteme yetkiniz yok.' };
  if (item.status !== 'SUBMITTED') return { error: 'Sadece onay bekleyen i�ler revizeye g�nderilebilir.' };
  await prisma.workItem.update({
    where: { id },
    data: {
      status: 'REVISION_REQUESTED',
      lastRevisionNote: note,
      unreadForUserIds: notificationUserIdsForWorkItem(item, session.userId),
      events: { create: { userId: session.userId, type: 'REVISION_REQUESTED', note } }
    }
  });
  await notifyUsers([item.assigneeId], { title: 'Revize istendi', message: `${item.title} işi için revize istendi.`, url: `/dashboard/work-items?notificationWorkItem=${item.id}`, type: 'WORK_REVISION' }, session.userId);
  return { success: true };
}
export async function cancelWorkItemAction(workItemId) {
  const session = await getSession();
  if (!(await canAccessWorkItems(session))) return { error: 'Yetkiniz yok.' };
  const id = parseInt(workItemId);
  const item = await prisma.workItem.findUnique({ where: { id }, include: { assignee: { select: { managerId: true } } } });
  if (!(await canManageWorkItem(session, item))) return { error: 'Bu i�i iptal etme yetkiniz yok.' };
  await prisma.workItem.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      unreadForUserIds: notificationUserIdsForWorkItem(item, session.userId),
      events: { create: { userId: session.userId, type: 'CANCELLED' } }
    }
  });
  return { success: true };
}
export async function runDatabaseMaintenanceAction() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Bu işlemi sadece admin çalıştırabilir.' };
  }
  const statements = [
    'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "managerId" INTEGER',
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_managerId_fkey') THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$`,
    `CREATE TABLE IF NOT EXISTS "WorkItem" (
      "id" SERIAL NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "dueDate" TIMESTAMP(3),
      "priority" TEXT NOT NULL DEFAULT 'NORMAL',
      "type" TEXT NOT NULL DEFAULT 'OTHER',
      "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
      "clientId" INTEGER,
      "assigneeId" INTEGER NOT NULL,
      "createdById" INTEGER NOT NULL,
      "approvedById" INTEGER,
      "submittedAt" TIMESTAMP(3),
      "approvedAt" TIMESTAMP(3),
      "lastSubmissionNote" TEXT,
      "lastRevisionNote" TEXT,
      "unreadForUserIds" TEXT NOT NULL DEFAULT '[]',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "WorkItem_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "Notification" (
      "id" SERIAL NOT NULL,
      "userId" INTEGER NOT NULL,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "url" TEXT,
      "type" TEXT NOT NULL DEFAULT 'GENERAL',
      "dedupeKey" TEXT,
      "readAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "WorkItemEvent" (
      "id" SERIAL NOT NULL,
      "workItemId" INTEGER NOT NULL,
      "userId" INTEGER NOT NULL,
      "type" TEXT NOT NULL,
      "note" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "WorkItemEvent_pkey" PRIMARY KEY ("id")
    )`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WorkItem_clientId_fkey') THEN
        ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WorkItem_assigneeId_fkey') THEN
        ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WorkItem_createdById_fkey') THEN
        ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WorkItem_approvedById_fkey') THEN
        ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_userId_fkey') THEN
        ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WorkItemEvent_workItemId_fkey') THEN
        ALTER TABLE "WorkItemEvent" ADD CONSTRAINT "WorkItemEvent_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WorkItemEvent_userId_fkey') THEN
        ALTER TABLE "WorkItemEvent" ADD CONSTRAINT "WorkItemEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$`,
    'CREATE INDEX IF NOT EXISTS "User_managerId_idx" ON "User"("managerId")',
    'CREATE INDEX IF NOT EXISTS "WorkItem_assigneeId_status_idx" ON "WorkItem"("assigneeId", "status")',
    'CREATE INDEX IF NOT EXISTS "WorkItem_createdById_status_idx" ON "WorkItem"("createdById", "status")',
    'CREATE INDEX IF NOT EXISTS "WorkItem_clientId_idx" ON "WorkItem"("clientId")',
    'CREATE UNIQUE INDEX IF NOT EXISTS "Notification_dedupeKey_key" ON "Notification"("dedupeKey")',
    'CREATE INDEX IF NOT EXISTS "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt")',
    `ALTER TABLE "WorkItem" ADD COLUMN IF NOT EXISTS "unreadForUserIds" TEXT NOT NULL DEFAULT '[]'`,
    'CREATE INDEX IF NOT EXISTS "WorkItemEvent_workItemId_idx" ON "WorkItemEvent"("workItemId")',
  ];
  try {
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }
    await prisma.setting.upsert({
      where: { key: 'db_maintenance_last_run' },
      update: { value: new Date().toISOString() },
      create: { key: 'db_maintenance_last_run', value: new Date().toISOString() },
    });
    await logActivity('UPDATE', 'SETTINGS', 'Veritabanı bakım/güncelleme işlemi çalıştırıldı.');
    return { success: true, message: 'Veritabanı güncellemesi tamamlandı.' };
  } catch (error) {
    console.error('Database maintenance error:', error);
    return { error: `Veritabanı güncellemesi başarısız: ${error.message}` };
  }
}

export async function toggleMetaStatusAction(clientId, entityId, newStatus) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Yetkisiz erişim.' };

    const client = await prisma.client.findUnique({
      where: { id: parseInt(clientId) }
    });
    
    if (!client || !client.metaAccessToken) {
      return { error: 'API_MISSING' };
    }

    const accessToken = client.metaAccessToken.trim();
    const status = newStatus === 'ACTIVE' ? 'ACTIVE' : 'PAUSED';

    const url = `https://graph.facebook.com/v19.0/${entityId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status, access_token: accessToken })
    });

    const data = await response.json();
    if (data.error) return { error: data.error.message };

    await logActivity('UPDATE', 'META_ADS', `Meta objesi durumu güncellendi: ${entityId} -> ${status}`, clientId);
    return { success: true };
  } catch (error) {
    return { error: 'Durum güncellenemedi.' };
  }
}

export async function createMetaCampaignAction(clientId, campaignData) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Yetkisiz erişim.' };

    const client = await prisma.client.findUnique({
      where: { id: parseInt(clientId) }
    });
    
    if (!client || !client.metaAdAccountId || !client.metaAccessToken) {
      return { error: 'API_MISSING' };
    }

    const accountId = client.metaAdAccountId.trim();
    const finalAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const accessToken = client.metaAccessToken.trim();
    
    const url = `https://graph.facebook.com/v19.0/${finalAccountId}/campaigns`;
    
    const payload = {
      name: campaignData.name,
      objective: campaignData.objective || 'OUTCOME_TRAFFIC',
      status: campaignData.status || 'PAUSED',
      special_ad_categories: [], 
      access_token: accessToken
    };

    if (campaignData.daily_budget) {
      payload.daily_budget = Math.round(campaignData.daily_budget * 100); 
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.error) return { error: data.error.message };

    await logActivity('CREATE', 'META_ADS', `Yeni kampanya oluşturuldu: ${campaignData.name}`, clientId);
    return { success: true, id: data.id };
  } catch (error) {
    return { error: 'Kampanya oluşturulamadı.' };
  }
}
