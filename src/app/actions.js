'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession, destroySession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

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

  const user = await prisma.user.findUnique({ where: { username } });

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

  if (!username || !role) {
    return { error: 'Kullanıcı adı ve rol gerekli.' };
  }

  try {
    await prisma.user.create({
      data: {
        username,
        role,
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

  if (!companyName || !contactName || !phone) {
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
        blogApiUrl
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

  if (!id || !username || !role) return { error: 'Gerekli alanlar eksik.' };

  try {
    await prisma.user.update({
      where: { id },
      data: { username, role }
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

  if (!id || !companyName || !contactName || !phone) return { error: 'Gerekli alanlar eksik.' };

  try {
    await prisma.client.update({
      where: { id },
      data: { companyName, website, contactName, email, phone, services, websiteType, blogApiUrl }
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

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { link, note, platform }
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
  const note = formData.get('note') || null;

  try {
    await prisma.task.create({
      data: {
        clientId,
        type,
        date,
        platform,
        link,
        note,
        status: false
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

  try {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        weeklyBlogTarget,
        email,
        socialAccounts,
        socialSchedule,
        specialInstructions
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

    for (const blog of blogList) {
      // Mapping for tacambalaj.com API: published_at, title, slug
      const publishDate = blog.published_at || blog.published_date || blog.publish_date || blog.createdAt;
      if (!publishDate) continue;

      // Construct link: base URL + slug
      const link = blog.slug 
        ? `https://tacambalaj.com/blog/${blog.slug}` 
        : (blog.link || blog.url || '');
      
      // Check if already exists in DB for this client
      const exists = client.tasks.some(t => t.link === link);
      if (exists) continue;

      await prisma.task.create({
        data: {
          clientId: client.id,
          type: 'BLOG',
          date: new Date(publishDate),
          link: link,
          note: blog.title || 'Otomatik Çekilen Blog',
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
