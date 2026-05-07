import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 0;

export async function GET() {
  try {
    // 1. Görevleri Güncelle
    const updatedTasksCount = await prisma.task.updateMany({
      where: {
        platform: {
          in: ['TikTok', 'tiktok', 'Tiktok', 'tik tok']
        }
      },
      data: { platform: 'Pinterest' }
    });

    // 2. Müşteri Ayarlarını Güncelle
    const clients = await prisma.client.findMany();
    let clientUpdateCount = 0;

    for (const client of clients) {
      let changed = false;
      let socialAccounts = {};
      let socialSchedule = {};

      try {
        socialAccounts = JSON.parse(client.socialAccounts || '{}');
        socialSchedule = JSON.parse(client.socialSchedule || '{}');
      } catch (e) { continue; }

      if (socialAccounts.TikTok !== undefined) {
        socialAccounts.Pinterest = socialAccounts.TikTok;
        delete socialAccounts.TikTok;
        changed = true;
      }

      if (socialSchedule.TikTok !== undefined) {
        socialSchedule.Pinterest = socialSchedule.TikTok;
        delete socialSchedule.TikTok;
        changed = true;
      }

      if (changed) {
        await prisma.client.update({
          where: { id: client.id },
          data: {
            socialAccounts: JSON.stringify(socialAccounts),
            socialSchedule: JSON.stringify(socialSchedule)
          }
        });
        clientUpdateCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${updatedTasksCount.count} görev ve ${clientUpdateCount} müşteri güncellendi.` 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
