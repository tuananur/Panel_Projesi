// Temporary script to set logo URL for the "terapiyle" client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const clientName = 'terapiyle';
    const logoUrl = 'https://terapiyle.com/storage/site_settings/01JDSCYRB9GFB5CFAB4VXRW6A9.png';
    const client = await prisma.client.findFirst({ where: { companyName: clientName } });
    if (!client) {
      console.error(`Client "${clientName}" not found.`);
      process.exit(1);
    }
    await prisma.client.update({
      where: { id: client.id },
      data: { logoUrl },
    });
    console.log(`Logo URL updated for client "${clientName}" (ID: ${client.id})`);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
