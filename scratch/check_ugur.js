const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClient() {
  const client = await prisma.client.findFirst({
    where: { companyName: { contains: 'ugur', mode: 'insensitive' } }
  });
  if (client) {
    console.log('Client Name:', client.companyName);
    console.log('Logo URL:', client.logoUrl);
  } else {
    console.log('Client not found');
  }
  await prisma.$disconnect();
}

checkClient();
