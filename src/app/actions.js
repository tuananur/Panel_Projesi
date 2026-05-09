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

  if (!id || !username || !role) return { error: 'Gerekli alanlar eksik.' };

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
  const logoUrl = formData.get('logoUrl') || null;

  if (!id || !companyName || !contactName || !phone) return { error: 'Gerekli alanlar eksik.' };

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
        metaAccessToken: formData.get('metaAccessToken')
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
  const content = formData.get('content');
  const title = formData.get('title') || null;

  if (!content) {
    return { error: 'Not içeriği boş olamaz.' };
  }

  try {
    const session = await getSession();
    await prisma.note.create({
      data: {
        clientId,
        userId: session.userId,
        title,
        content
      }
    });
    
    let details = 'Yeni bir kişisel not eklendi.';
    if (clientId) {
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (client) details = `${client.companyName} için yeni bir not eklendi.`;
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
    const note = await prisma.note.findUnique({ where: { id: noteId }, include: { client: true } });
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
  const content = formData.get('content');
  const title = formData.get('title') || null;

  if (!noteId || !content) return { error: 'Not içeriği boş olamaz.' };

  try {
    const note = await prisma.note.findUnique({ where: { id: noteId }, include: { client: true } });
    await prisma.note.update({
      where: { id: noteId },
      data: { content, title }
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
