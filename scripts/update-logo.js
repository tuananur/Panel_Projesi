// run with: node scripts/update-logo.js
import prisma from '@/lib/prisma';

async function main() {
  const clientName = 'terapiyle'; // change if needed
  const logoUrl = 'https://terapiyle.com/storage/site_settings/01JDSCYRB9GFB5CFAB4VXRW6A9.png';

  const client = await prisma.client.findFirst({ where: { companyName: clientName } });
  if (!client) {
    console.error(`Client with name "${clientName}" not found.`);
    return;
  }

  await prisma.client.update({
    where: { id: client.id },
    data: { logoUrl },
  });

  console.log(`Logo URL updated for client "${clientName}" (ID: ${client.id}).`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
