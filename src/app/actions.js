'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession, destroySession } from '@/lib/auth';
import { redirect } from 'next/navigation';

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
  redirect('/login');
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
    return { success: true };
  } catch (error) {
    return { error: 'Kullanıcı oluşturulurken hata oluştu. Kullanıcı adı zaten kullanımda olabilir.' };
  }
}

export async function createClientAction(formData) {
  const companyName = formData.get('companyName');
  const website = formData.get('website');
  const contactName = formData.get('contactName');
  const phone = formData.get('phone');
  
  // services handles multi-select
  const servicesList = formData.getAll('services');
  const services = JSON.stringify(servicesList);

  if (!companyName || !contactName || !phone) {
    return { error: 'Gerekli alanları doldurun.' };
  }

  try {
    await prisma.client.create({
      data: {
        companyName,
        website,
        contactName,
        phone,
        services,
      },
    });
    return { success: true };
  } catch (error) {
    return { error: 'Müşteri eklenirken hata oluştu.' };
  }
}

export async function deleteUserAction(formData) {
  const id = parseInt(formData.get('id'));
  if (!id) return { error: 'Geçersiz ID' };
  
  try {
    await prisma.user.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { error: 'Kullanıcı silinemedi.' };
  }
}

export async function deleteClientAction(formData) {
  const id = parseInt(formData.get('id'));
  if (!id) return { error: 'Geçersiz ID' };
  
  try {
    await prisma.client.delete({ where: { id } });
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
  const phone = formData.get('phone');
  const servicesList = formData.getAll('services');
  const services = JSON.stringify(servicesList);

  if (!id || !companyName || !contactName || !phone) return { error: 'Gerekli alanlar eksik.' };

  try {
    await prisma.client.update({
      where: { id },
      data: { companyName, website, contactName, phone, services }
    });
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
    return { success: true };
  } catch (error) {
    return { error: 'Görev detayları güncellenemedi.' };
  }
}

export async function deleteTaskAction(formData) {
  const taskId = parseInt(formData.get('taskId'));
  if (!taskId) return { error: 'Geçersiz ID' };

  try {
    await prisma.task.delete({ where: { id: taskId } });
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
    return { success: true };
  } catch (error) {
    return { error: 'Görev eklenemedi.' };
  }
}

export async function updateClientSettingsAction(clientId, formData) {
  const weeklyBlogTarget = parseInt(formData.get('weeklyBlogTarget') || '0');
  const socialAccounts = formData.get('socialAccounts'); // Already JSON string from client
  const socialSchedule = formData.get('socialSchedule'); // Already JSON string from client
  const specialInstructions = formData.get('specialInstructions');

  try {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        weeklyBlogTarget,
        socialAccounts,
        socialSchedule,
        specialInstructions
      }
    });
    return { success: true };
  } catch (error) {
    return { error: 'Ayarlar güncellenemedi.' };
  }
}
