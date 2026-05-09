import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  try {
    const client = await prisma.client.findFirst({ where: { companyName: 'terapiyle' } });
    if (client) {
      console.log('Logo URL:', client.logoUrl);
    } else {
      console.log('Client not found');
    }
  } catch (e) {
    console.error('Error', e);
  } finally {
    await prisma.$disconnect();
  }
})();
